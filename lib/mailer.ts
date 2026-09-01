import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendLowStockAlert = async (productName: string, quantity: number, companyId: string) => {
  // Optionnel: on pourrait chercher l'email de l'Admin via Prisma
  const adminEmail = process.env.ADMIN_ALERT_EMAIL; 
  if (!adminEmail || !process.env.SMTP_USER) return;

  try {
    await transporter.sendMail({
      from: `"GESTORA Notifications" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `🚨 Alerte de stock : ${productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #e11d48;">Alerte de Stock Faible</h2>
          <p>Le produit <strong>${productName}</strong> a atteint un niveau critique.</p>
          <p>Quantité restante : <strong>${quantity}</strong></p>
          <br/>
          <p>Merci de réapprovisionner au plus vite via votre tableau de bord GESTORA.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Erreur d'envoi d'email :", error);
  }
};
