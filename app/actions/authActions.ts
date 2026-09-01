"use server";

import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { EmailSchema, ResetPasswordSchema, RegisterUserSchema } from "@/lib/validations";

export async function forgotPassword(email: string) {
  try {
    const validated = EmailSchema.safeParse({ email });
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }
    email = validated.data.email;
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't leak whether user exists for security, just return success
      return { success: true, mockLink: null };
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Expires in 1 hour
    const expires = new Date(Date.now() + 3600000);

    // Save token to DB
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: resetToken,
        expires
      }
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    // Configurer le transporteur SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Envoyer l'email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"GESTORA" <noreply@gestora.com>',
      to: email,
      subject: "Réinitialisation de votre mot de passe GESTORA",
      html: `
        <div style="font-family: Arial, sans-serif; max-w-md; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563EB;">GESTORA</h2>
          <p>Bonjour,</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #2563EB; color: #ffffff; text-decoration: none; border-radius: 8px; margin: 16px 0;">Réinitialiser mon mot de passe</a>
          <p>Ce lien expirera dans 1 heure.</p>
          <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
        </div>
      `,
    });

    console.log(`[EMAIL ENVOYÉ] Email de réinitialisation envoyé avec succès à ${email}`);

    return { 
      success: true, 
      mockLink: null 
    };

  } catch (error: any) {
    console.error("Forgot password error", error);
    return { success: false, error: "Une erreur est survenue lors de l'envoi de l'email." };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    const validated = ResetPasswordSchema.safeParse({ token, newPassword });
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }
    token = validated.data.token;
    newPassword = validated.data.newPassword;
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token }
    });

    if (!resetRecord) {
      return { success: false, error: "Lien de réinitialisation invalide ou expiré." };
    }

    if (new Date() > resetRecord.expires) {
      return { success: false, error: "Ce lien a expiré. Veuillez refaire une demande." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { email: resetRecord.email },
      data: { password: hashedPassword }
    });

    // Delete token
    await prisma.passwordResetToken.delete({
      where: { id: resetRecord.id }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Reset password error", error);
    return { success: false, error: "Une erreur est survenue lors de la réinitialisation." };
  }
}

export async function registerUser(data: { prenom: string, nom: string, entreprise: string, email: string, motDePasse: string }) {
  try {
    const validated = RegisterUserSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }
    const { prenom, nom, entreprise, email, motDePasse } = validated.data;
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return { success: false, error: "Cet email est déjà utilisé." };
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    const newCompany = await prisma.company.create({
      data: {
        name: entreprise
      }
    });

    const newUser = await prisma.user.create({
      data: {
        firstName: prenom,
        lastName: nom,
        email,
        password: hashedPassword,
        companyId: newCompany.id,
        role: "ADMIN"
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Register user error", error);
    return { success: false, error: "Une erreur est survenue lors de l'inscription." };
  }
}

