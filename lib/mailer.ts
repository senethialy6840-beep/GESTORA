import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Envoie une alerte de stock bas aux administrateurs et aux invités de l'entreprise concernée.
 */
export const sendLowStockAlert = async (productName: string, quantity: number, companyId: string) => {
  if (!process.env.SMTP_USER) return;

  try {
    const targetRoles = [
      'ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin',
      'INVITE', 'GUEST', 'INVITÉ', 'invite', 'guest', 'invité',
    ];

    // 1. Récupérer les utilisateurs (Admins et Invités)
    const users = await prisma.user.findMany({
      where: {
        companyId,
        isActive: true,
        OR: [
          { role: { in: targetRoles } },
          { role: { contains: 'INVIT', mode: 'insensitive' } },
          { role: { contains: 'GUEST', mode: 'insensitive' } },
        ],
      },
      select: { email: true, firstName: true, lastName: true, role: true },
    });

    // 2. Récupérer également depuis la table Employee au cas où un invité a été enregistré comme employé
    const employees = await prisma.employee.findMany({
      where: {
        companyId,
        status: 'ACTIVE',
        email: { not: null },
        OR: [
          { role: { in: targetRoles } },
          { role: { contains: 'INVIT', mode: 'insensitive' } },
          { role: { contains: 'GUEST', mode: 'insensitive' } },
        ],
      },
      select: { email: true, firstName: true, lastName: true, role: true },
    });

    // Map pour dédoublonner les destinataires par adresse email
    const recipientsMap = new Map<string, { email: string; name: string; role: string }>();

    for (const u of users) {
      if (u.email && u.email.trim()) {
        const emailKey = u.email.trim().toLowerCase();
        recipientsMap.set(emailKey, {
          email: u.email.trim(),
          name: u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : 'Collaborateur',
          role: u.role,
        });
      }
    }

    for (const emp of employees) {
      if (emp.email && emp.email.trim()) {
        const emailKey = emp.email.trim().toLowerCase();
        if (!recipientsMap.has(emailKey)) {
          recipientsMap.set(emailKey, {
            email: emp.email.trim(),
            name: emp.firstName ? `${emp.firstName} ${emp.lastName || ''}`.trim() : 'Collaborateur',
            role: emp.role,
          });
        }
      }
    }

    // Si aucun admin ou invité spécifique n'est trouvé, fallback sur le premier utilisateur actif
    if (recipientsMap.size === 0) {
      const fallbackUser = await prisma.user.findFirst({
        where: { companyId, isActive: true },
        select: { email: true, firstName: true, lastName: true, role: true },
      });
      if (fallbackUser?.email) {
        recipientsMap.set(fallbackUser.email.trim().toLowerCase(), {
          email: fallbackUser.email.trim(),
          name: fallbackUser.firstName || 'Collaborateur',
          role: fallbackUser.role,
        });
      }
    }

    if (recipientsMap.size === 0) {
      console.warn(`[Mailer] Aucun utilisateur trouvé pour la company ${companyId} — alerte non envoyée.`);
      return;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gestora.sn';

    // Envoi de l'alerte à chaque destinataire individuellement
    await Promise.allSettled(
      Array.from(recipientsMap.values()).map(async (recipient) => {
        try {
          await transporter.sendMail({
            from: `"GESTORA Notifications" <${process.env.SMTP_USER}>`,
            to: recipient.email,
            subject: `🚨 Alerte de stock faible : ${productName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
                <div style="background: #1e40af; padding: 16px 24px; border-radius: 8px 8px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 20px;">🏪 GESTORA</h1>
                </div>
                <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
                  <h2 style="color: #e11d48; margin-top: 0;">⚠️ Alerte de Stock Faible</h2>
                  <p style="color: #374151;">Bonjour <strong>${recipient.name}</strong>,</p>
                  <p style="color: #374151;">Le produit suivant dans votre boutique a atteint un niveau de stock critique :</p>
                  <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <p style="margin: 0; font-size: 18px; font-weight: bold; color: #991b1b;">📦 ${productName}</p>
                    <p style="margin: 8px 0 0; color: #dc2626;">Quantité restante : <strong>${quantity} unité(s)</strong></p>
                  </div>
                  <p style="color: #374151;">Pensez à réapprovisionner rapidement pour éviter toute rupture.</p>
                  <a href="${appUrl}/dashboard/products" 
                     style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 8px;">
                    Voir mes produits & stock →
                  </a>
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    Cet email est envoyé automatiquement par GESTORA. Ne pas répondre à cet email.
                  </p>
                </div>
              </div>
            `,
          });
          console.log(`[Mailer] ✅ Alerte stock envoyée à ${recipient.email} (${recipient.role}) pour le produit "${productName}" (company: ${companyId})`);
        } catch (mailErr) {
          console.error(`[Mailer] ❌ Erreur lors de l'envoi d'alerte stock à ${recipient.email}:`, mailErr);
        }
      })
    );

  } catch (error) {
    console.error("[Mailer] Erreur d'envoi d'email :", error);
  }
};

/**
 * Envoie un email de réinitialisation de mot de passe.
 */
export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  if (!process.env.SMTP_USER) return;

  try {
    await transporter.sendMail({
      from: `"GESTORA" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `🔐 Réinitialisation de votre mot de passe GESTORA`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
          <div style="background: #1e40af; padding: 16px 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">🏪 GESTORA</h1>
          </div>
          <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e293b; margin-top: 0;">Réinitialisation du mot de passe</h2>
            <p style="color: #374151;">Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous :</p>
            <a href="${resetLink}" 
               style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
              Réinitialiser mon mot de passe →
            </a>
            <p style="color: #64748b; font-size: 14px;">Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">GESTORA — Plateforme de gestion d'entreprise</p>
          </div>
        </div>
      `,
    });
    console.log(`[Mailer] ✅ Email de reset envoyé à ${email}`);
  } catch (error) {
    console.error('[Mailer] Erreur envoi reset password:', error);
  }
};

/**
 * Envoie un email de bienvenue à un nouvel employé avec ses accès.
 */
export const sendEmployeeWelcomeEmail = async (email: string, firstName: string, companyName: string) => {
  if (!process.env.SMTP_USER) return;

  try {
    await transporter.sendMail({
      from: `"GESTORA" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `👋 Bienvenue sur GESTORA - Vos accès à ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
          <div style="background: #1e40af; padding: 16px 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">🏪 GESTORA</h1>
          </div>
          <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e293b; margin-top: 0;">Bienvenue ${firstName} !</h2>
            <p style="color: #374151;">Vous avez été ajouté(e) en tant qu'employé(e) sur la boutique <strong>${companyName}</strong> via GESTORA.</p>
            <p style="color: #374151;">Voici vos informations de connexion par défaut :</p>
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0; font-size: 14px; color: #374151;"><strong>Identifiant (Email) :</strong> ${email}</p>
              <p style="margin: 8px 0 0; font-size: 14px; color: #374151;"><strong>Mot de passe :</strong> Gestora2026</p>
            </div>
            <p style="color: #64748b; font-size: 14px;">Nous vous recommandons de modifier ce mot de passe après votre première connexion (si la fonctionnalité est activée) ou de le conserver en lieu sûr.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://gestora.sn'}/login" 
               style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
              Se connecter à GESTORA →
            </a>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">GESTORA — Plateforme de gestion d'entreprise</p>
          </div>
        </div>
      `,
    });
    console.log(`[Mailer] ✅ Email de bienvenue envoyé à l'employé ${email}`);
  } catch (error) {
    console.error('[Mailer] Erreur envoi email bienvenue employé:', error);
  }
};
