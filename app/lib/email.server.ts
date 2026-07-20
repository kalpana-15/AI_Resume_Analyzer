import nodemailer from 'nodemailer';

const smtpEmail = process.env.SMTP_EMAIL;
const smtpPassword = process.env.SMTP_PASSWORD;

const transporter = (smtpEmail && smtpPassword) 
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
    })
  : null;

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  if (!transporter) {
    console.warn("===============================================================");
    console.warn("SMTP_EMAIL or SMTP_PASSWORD is not set in .env!");
    console.warn("Simulating password reset email...");
    console.warn(`Password reset link for ${to}: ${resetLink}`);
    console.warn("===============================================================");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Resumify" <${smtpEmail}>`,
      to: to,
      subject: 'Reset your Resumify password',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #170d37; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #a5e1f3;">Reset Your Password</h2>
          <p>We received a request to reset your password for your Resumify account.</p>
          <p>Click the button below to reset it:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #a5e1f3; color: #170d37; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; margin-bottom: 20px;">Reset Password</a>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>Best,<br>The Resumify Team</p>
        </div>
      `,
    });
    console.log(`\n========================================================================`);
    console.log(`Password reset email sent to ${to} via Gmail SMTP.`);
    console.log(`========================================================================\n`);
  } catch (error) {
    console.error("Failed to send password reset email via Nodemailer:", error);
    throw new Error("Failed to send password reset email");
  }
}
