import nodemailer from "nodemailer";

/**
 * Creates a reusable transporter object using SMTP transport.
 * @returns A nodemailer transporter object configured with SMTP transport settings.
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === "465", // true for port 465, false for other ports
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Sends an email using the specified transporter configuration.
 * @param email The recipient's email address.
 * @param subject The subject of the email.
 * @param htmlContent The HTML content of the email.
 * @returns An object indicating success or failure of the email sending operation.
 */
const sendEmail = async (
  email: string,
  subject: string,
  htmlContent: string,
) => {
  try {
    const transporter = createTransporter();
    const appName = process.env.APP_NAME ?? "Acme Inc";

    const mailOptions = {
      from: `"${appName}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};

/**
 * Sends a verification email to the specified email address.
 * @param email The recipient's email address.
 * @param token The verification token to include in the email.
 * @returns An object indicating success or failure of the email sending operation.
 */
export async function sendVerificationEmail(email: string, token: string) {
  const confirmationLink = `http://localhost:3000/verify-email?token=${token}`;
  const htmlContent = `
    <p>Hello,</p>
    <p>Please click the link below to verify your email address:</p>
    <a href="${confirmationLink}">Verify Email</a>
    <p>If you did not request this, please ignore this email.</p>
  `;

  return sendEmail(email, "Email Verification", htmlContent);
}

/**
 * Sends a password reset email to the specified email address.
 * @param email The recipient's email address.
 * @param token The password reset token to include in the email.
 * @returns An object indicating success or failure of the email sending operation.
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `http://localhost:3000/set-new-password?token=${token}`;
  const htmlContent = `
    <p>Hello,</p>
    <p>You requested to reset your password. Click the link below to reset it:</p>
    <a href="${resetLink}">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
  `;

  return sendEmail(email, "Password Reset Request", htmlContent);
}
