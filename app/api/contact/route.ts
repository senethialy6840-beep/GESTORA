import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 3; // Max 3 messages per window
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count++;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Trop de messages envoyés. Veuillez réessayer plus tard.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, phone, email, subject, message } = body;

    // Validation
    if (!firstName || !lastName || !phone || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis.' },
        { status: 400 }
      );
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Adresse email invalide.' },
        { status: 400 }
      );
    }

    // Create transporter - uses Gmail App Password
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Build beautiful HTML email
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">📩 Nouveau Message — GESTORA</h1>
          <p style="color: #93c5fd; margin: 8px 0 0; font-size: 14px;">Formulaire de contact du site</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px;">
          <!-- Sender Info Card -->
          <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e293b; font-size: 16px; margin: 0 0 16px; font-weight: 700;">👤 Informations de l'expéditeur</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600; width: 120px;">Prénom</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">${firstName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Nom</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">${lastName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Téléphone</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">${phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Email</td>
                <td style="padding: 8px 0; color: #2563eb; font-size: 14px; font-weight: 500;">
                  <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>
                </td>
              </tr>
            </table>
          </div>

          <!-- Subject -->
          <div style="background: #eff6ff; border-radius: 12px; padding: 16px 24px; margin-bottom: 24px; border-left: 4px solid #2563eb;">
            <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Sujet</p>
            <p style="margin: 4px 0 0; color: #1e293b; font-size: 16px; font-weight: 700;">${subject}</p>
          </div>

          <!-- Message -->
          <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e293b; font-size: 16px; margin: 0 0 12px; font-weight: 700;">💬 Message</h2>
            <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
          </div>

          <!-- Reply Button -->
          <div style="text-align: center; margin-top: 24px;">
            <a href="mailto:${email}?subject=Re: ${subject}" 
               style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">
              ✉️ Répondre à ${firstName}
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            Ce message a été envoyé depuis le formulaire de contact de <strong>gestora.shop</strong>
          </p>
        </div>
      </div>
    `;

    // Send email to gestorame112@gmail.com
    await transporter.sendMail({
      from: `"GESTORA Contact" <${process.env.SMTP_USER}>`,
      to: 'gestorame112@gmail.com',
      replyTo: email,
      subject: `📩 [GESTORA Contact] ${subject} — ${firstName} ${lastName}`,
      html: htmlContent,
    });

    // Send confirmation email to the sender
    const confirmationHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800;">✅ Message bien reçu !</h1>
        </div>
        <div style="padding: 32px;">
          <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
            <p style="color: #374151; font-size: 15px; line-height: 1.7;">
              Bonjour <strong>${firstName}</strong>,<br /><br />
              Nous avons bien reçu votre message concernant "<strong>${subject}</strong>". 
              Notre équipe vous répondra dans les plus brefs délais.<br /><br />
              Merci de votre confiance !<br />
              <strong>L'équipe GESTORA</strong>
            </p>
          </div>
        </div>
        <div style="background: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">GESTORA — Plateforme de gestion d'entreprise</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"GESTORA" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `✅ Votre message a bien été reçu — GESTORA`,
      html: confirmationHtml,
    });

    console.log(`[Contact] ✅ Message reçu de ${firstName} ${lastName} (${email}) — sujet: ${subject}`);

    return NextResponse.json({ success: true, message: 'Message envoyé avec succès !' });

  } catch (error) {
    console.error('[Contact] ❌ Erreur envoi:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}
