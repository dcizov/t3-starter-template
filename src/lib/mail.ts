import nodemailer from "nodemailer";

export async function sendEmail(email: string, token: string) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const appName = process.env.APP_NAME ?? "Acme Inc";

    const confirmationLink = `http://localhost:3000/verify-email?token=${token}`;

    const mailOptions = {
      from: `"${appName}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Email Verification",
      html: `
        <p>Hello,</p>
        <p>Please click the link below to verify your email address:</p>
        <a href="${confirmationLink}">Verify Email</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Message sent: %s", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
