const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: {
            user,
            pass,
          },
        });
        console.log(`[EMAIL_SERVICE] ✅ SMTP Transporter configured for ${host}:${port} (account: ${user})`);
      } catch (err) {
        console.error('[EMAIL_SERVICE] ❌ Failed to initialize SMTP transporter:', err.message);
        this.transporter = null;
      }
    } else {
      this.transporter = null;
      console.log('[EMAIL_SERVICE] ℹ️ SMTP credentials not fully configured in .env (requires SMTP_HOST, SMTP_USER, SMTP_PASS)');
    }
  }

  isConfigured() {
    return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  }

  async sendPasswordResetCode(toEmail, userName, resetCode) {
    if (!this.transporter && this.isConfigured()) {
      this.initTransporter();
    }

    const fromAddress = process.env.SMTP_FROM || `"JSTU Robotics Club" <${process.env.SMTP_USER || 'noreply@jsturobotics.org'}>`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Recovery Code</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070B14; color: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 520px; margin: 0 auto; background: #0D1424; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { text-align: center; margin-bottom: 24px; }
        .logo-badge { display: inline-block; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-weight: 900; font-size: 12px; letter-spacing: 2px; padding: 6px 14px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px; }
        .title { color: #ffffff; font-size: 22px; font-weight: 800; margin: 0 0 8px 0; }
        .subtitle { color: #94a3b8; font-size: 14px; margin: 0; }
        .code-box { background: #070B14; border: 2px dashed #4f46e5; border-radius: 12px; padding: 20px; text-align: center; margin: 28px 0; }
        .code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #818cf8; margin: 0; }
        .expiry { color: #f59e0b; font-size: 12px; font-weight: 600; margin-top: 8px; }
        .instructions { color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 16px 0; }
        .footer { border-top: 1px solid #1e293b; padding-top: 20px; text-align: center; color: #64748b; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-badge">JSTU Robotics Club</div>
          <h1 class="title">Password Reset Authorization</h1>
          <p class="subtitle">Secure Verification Code for ${escapeHtml(userName || 'Club Member')}</p>
        </div>
        <p class="instructions">
          A request was initiated to reset the password for your account associated with <strong>${escapeHtml(toEmail)}</strong>. Use the 6-digit one-time authorization code below to complete the procedure:
        </p>
        <div class="code-box">
          <div class="code">${resetCode}</div>
          <div class="expiry">⏱️ Valid for 15 minutes only</div>
        </div>
        <p class="instructions">
          If you did not request this password reset, please disregard this email or notify a club administrator immediately. Your account remains protected.
        </p>
        <div class="footer">
          Jamalpur Science & Technology University Robotics Club<br>
          Autonomous Systems & Research Laboratory · JSTU
        </div>
      </div>
    </body>
    </html>
    `;

    if (!this.transporter) {
      console.warn(`[EMAIL_SERVICE] ⚠️ SMTP transport is not configured. Email to ${toEmail} with code [${resetCode}] was generated for testing.`);
      return {
        sent: false,
        reason: 'SMTP_NOT_CONFIGURED',
        code: resetCode,
        message: 'SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) are not yet set in server .env. Enter this code to verify.'
      };
    }

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: `[JSTU Robotics Club] Your Password Recovery Code: ${resetCode}`,
        text: `Hello ${userName || 'Member'},\n\nYour password recovery verification code is: ${resetCode}\nThis code will expire in 15 minutes.\n\nIf you did not request this, please ignore this email.\n\nJSTU Robotics Club`,
        html: htmlContent,
      });

      console.log(`[EMAIL_SERVICE] ✉️ Password reset email successfully dispatched to ${toEmail}: ${info.messageId}`);
      return {
        sent: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error(`[EMAIL_SERVICE] ❌ Failed to dispatch email to ${toEmail}:`, error.message);
      return {
        sent: false,
        reason: 'SMTP_SEND_FAILED',
        error: error.message,
        code: resetCode,
      };
    }
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = new EmailService();
