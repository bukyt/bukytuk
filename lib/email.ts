import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "noreply@bukyt.uk";

export async function sendVerificationEmail(
  email: string,
  username: string,
  token: string
) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email?token=${token}`;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Verify your Bukyt account",
      html: `
        <h2>Welcome to Bukyt, ${username}!</h2>
        <p>Please verify your email address to activate your account.</p>
        <p>
          <a href="${verificationUrl}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          ">Verify Email</a>
        </p>
        <p>Or copy this link: ${verificationUrl}</p>
        <p>This link expires in 24 hours.</p>
        <hr />
        <p style="font-size: 12px; color: #666;">
          If you didn't create this account, please ignore this email.
        </p>
      `,
    });

    if (result.error) {
      console.error("Email verification error:", result.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Reset your Bukyt password",
      html: `
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Click the link below to set a new password.</p>
        <p>
          <a href="${resetUrl}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #10b981;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          ">Reset Password</a>
        </p>
        <p>Or copy this link: ${resetUrl}</p>
        <p>This link expires in 1 hour.</p>
        <hr />
        <p style="font-size: 12px; color: #666;">
          If you didn't request this, please ignore this email. Your account will remain secure.
        </p>
      `,
    });

    if (result.error) {
      console.error("Password reset email error:", result.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return false;
  }
}
