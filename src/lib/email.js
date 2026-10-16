import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    // Gmail App Passwords are shown with spaces for readability, but the
    // real credential has none — strip them so auth actually matches.
    pass: (process.env.SMTP_PASS || '').replace(/\s+/g, ''),
  },
});

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', Arial, sans-serif; background: #0a0a0f; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #16162a; border: 1px solid rgba(201,168,76,0.2); border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #16162a, #10101a); padding: 32px; border-bottom: 1px solid rgba(201,168,76,0.15); text-align: center; }
    .logo { font-size: 24px; font-weight: 900; letter-spacing: -0.02em; color: #c9a84c; }
    .logo span { color: #f0f0fa; }
    .body { padding: 36px 32px; color: #9898b8; font-size: 15px; line-height: 1.7; }
    .body h2 { color: #f0f0fa; font-size: 20px; font-weight: 700; margin-bottom: 12px; }
    .btn { display: inline-block; margin: 24px 0; padding: 14px 32px; background: linear-gradient(135deg, #c9a84c, #a8722a); color: #0a0a0f; font-weight: 700; font-size: 15px; text-decoration: none; border-radius: 10px; }
    .code { font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #c9a84c; text-align: center; padding: 20px; background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.2); border-radius: 10px; margin: 20px 0; }
    .footer { padding: 20px 32px; text-align: center; color: #5a5a78; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.04); }
    .warning { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 8px; padding: 12px 16px; margin-top: 16px; font-size: 13px; color: #ef4444; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="logo"><span>VAULT</span>EX</div>
        <div style="color:#5a5a78;font-size:12px;margin-top:6px;letter-spacing:0.1em">PREMIUM INVESTMENT PLATFORM</div>
      </div>
      <div class="body">${content}</div>
      <div class="footer">
        © ${new Date().getFullYear()} VAULTEX. All rights reserved.<br>
        This is an automated message. Please do not reply.
      </div>
    </div>
  </div>
</body>
</html>
`;

export const sendVerificationEmail = async (email, firstName, token) => {
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  
  console.log('=== EMAIL DEBUG ===');
  console.log('Sending to:', email);
  console.log('Link:', link);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASS exists:', !!process.env.SMTP_PASS);
  console.log('==================');

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Verify your VAULTEX account',
    html: baseTemplate(`
      <h2>Welcome to VAULTEX, ${firstName}! 👋</h2>
      <p>Please verify your email address to activate your account.</p>
      <div style="text-align:center">
        <a href="${link}" class="btn">Verify Email Address</a>
      </div>
      <p style="font-size:13px;color:#5a5a78">This link expires in <strong style="color:#c9a84c">24 hours</strong>.</p>
    `),
  });
};

export const sendPasswordResetEmail = async (email, firstName, token) => {
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Reset your VAULTEX password',
    html: baseTemplate(`
      <h2>Password Reset Request</h2>
      <p>Hi ${firstName}, we received a request to reset your password. Click the button below to set a new one.</p>
      <div style="text-align:center">
        <a href="${link}" class="btn">Reset Password</a>
      </div>
      <p style="font-size:13px;color:#5a5a78">This link expires in <strong style="color:#c9a84c">1 hour</strong>.</p>
      <div class="warning">⚠ If you did not request this, your account is safe. Ignore this email.</div>
    `),
  });
};

export const sendWelcomeEmail = async (email, firstName) => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Welcome to VAULTEX — Your account is ready!',
    html: baseTemplate(`
      <h2>Your account is verified! 🎉</h2>
      <p>Hi ${firstName}, welcome to VAULTEX. Your account is now fully activated and ready to use.</p>
      <p style="margin-top:16px">Here's what you can do next:</p>
      <ul style="margin:16px 0 0 20px;color:#9898b8;line-height:2">
        <li>Browse our investment plans</li>
        <li>Make your first deposit</li>
        <li>Start earning returns</li>
        <li>Refer friends and earn commissions</li>
      </ul>
      <div style="text-align:center">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">Go to Dashboard</a>
      </div>
    `),
  });
};

export const sendAdminNotification = async (subject, content, options = {}) => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.ADMIN_EMAIL,
    subject,
    html: baseTemplate(content),
    ...(options.replyTo ? { replyTo: options.replyTo } : {}),
  });
};