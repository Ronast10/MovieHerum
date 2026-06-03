import nodemailer from "nodemailer";

console.log("📧 Email config:", {
  user: process.env.EMAIL_USER,
  passLength: process.env.EMAIL_PASS?.length,
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email, username, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"MovieHerum" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your MovieHerum account",
    html: `
      <div style="background:#0D0D0D;padding:40px;font-family:'DM Sans',sans-serif;max-width:500px;margin:0 auto;border:1px solid #2A2A2A;border-radius:12px;">
        <h1 style="color:#E8B84B;font-size:24px;margin-bottom:8px;">MovieHerum</h1>
        <p style="color:#E8E8E8;font-size:16px;">Hi <strong>${username}</strong>,</p>
        <p style="color:#6B6B6B;font-size:14px;line-height:1.6;">Thanks for joining. Please verify your email to activate your account.</p>
        <a href="${url}" style="display:inline-block;margin-top:24px;background:#E8B84B;color:#0D0D0D;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
          Verify Email
        </a>
        <p style="color:#6B6B6B;font-size:12px;margin-top:24px;">Link expires in 24 hours. If you didn't sign up, ignore this.</p>
      </div>
    `,
  });
};