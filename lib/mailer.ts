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
 * Envoie une alerte de stock bas à l'ADMIN de l'entreprise concernée.
 * L'email est récupéré depuis la base de données — chaque client reçoit
 * l'alerte sur son propre email d'inscription.
 */
export const sendLowStockAlert = async (productName: string, quantity: number, companyId: string) => {
  if (!process.env.SMTP_USER) return;

  try {
    // Récupérer l'email de l'administrateur de cette entreprise
    const adminUser = await prisma.user.findFirst({
      where: {
        companyId,
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        isActive: true,
      },
      select: { email: true, firstName: true, lastName: true },
    });

    // Si pas d'admin trouvé, on cherche n'importe quel utilisateur actif
    const targetUser = adminUser || await prisma.user.findFirst({
      where: { companyId, isActive: true },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!targetUser?.email) {
      console.warn(`[Mailer] Aucun utilisateur trouvé pour la company ${companyId} — alerte non envoyée.`);
      return;
    }

    const recipientName = targetUser.firstName || 'Administrateur';

    await transporter.sendMail({
      from: `"GESTORA Notifications" <${process.env.SMTP_USER}>`,
      to: targetUser.email,
      subject: `🚨 Alerte de stock faible : ${productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
          <div style="background: #1e40af; padding: 16px 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">🏪 GESTORA</h1>
          </div>
          <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
            <h2 style="color: #e11d48; margin-top: 0;">⚠️ Alerte de Stock Faible</h2>
            <p style="color: #374151;">Bonjour <strong>${recipientName}</strong>,</p>
            <p style="color: #374151;">Le produit suivant dans votre boutique a atteint un niveau de stock critique :</p>
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #991b1b;">📦 ${productName}</p>
              <p style="margin: 8px 0 0; color: #dc2626;">Quantité restante : <strong>${quantity} unité(s)</strong></p>
            </div>
            <p style="color: #374151;">Pensez à réapprovisionner rapidement pour éviter toute rupture.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/inventory" 
               style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 8px;">
              Gérer mon stock →
            </a>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              Cet email est envoyé automatiquement par GESTORA. Ne pas répondre à cet email.
            </p>
          </div>
        </div>
      `,
    });

    console.log(`[Mailer] ✅ Alerte stock envoyée à ${targetUser.email} pour le produit "${productName}" (company: ${companyId})`);

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
