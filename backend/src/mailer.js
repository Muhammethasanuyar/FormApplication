// backend/src/mailer.js
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendSubmissionEmail(to, { name, formName, summary } = {}) {
  if (!to) return;

  const from = process.env.MAIL_FROM || 'Form Builder <no-reply@example.com>';
  const subject = `${process.env.MAIL_SUBJECT_PREFIX || ''} ${formName || 'Form'} alındı`;

  const greeting = name?.trim() ? `Merhaba ${name},` : `Merhaba,`;
  const safeSummary = summary || 'Form bilgileriniz başarıyla ulaştı.';

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;padding:16px">
      <h2 style="margin:0 0 8px">Formunuz alındı ✅</h2>
      <p>${greeting}</p>
      <p>${safeSummary}</p>
      <p style="color:#64748b;font-size:12px">Bu e-posta otomatik gönderilmiştir.</p>
    </div>
  `;
  const text = `${greeting}\n\n${safeSummary}\n\n(Bu e-posta otomatik gönderildi.)`;

  await transporter.sendMail({ from, to, subject, text, html });
}
