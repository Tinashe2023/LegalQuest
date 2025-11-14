const nodemailer = require('nodemailer');
require('dotenv').config();

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'smtp'; // 'smtp' or 'sendgrid'
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

// 1. Log status on startup with guidance
console.log('Email Service Status:', {
  provider: EMAIL_PROVIDER,
  userLoaded: !!process.env.EMAIL_USER,
  passLoaded: !!process.env.EMAIL_PASSWORD,
  sendgridLoaded: !!SENDGRID_API_KEY,
  clientUrl: process.env.CLIENT_URL
});
if (EMAIL_PROVIDER === 'smtp') {
  console.log('SMTP configured. Note: On many hosting providers outbound SMTP (smtp.gmail.com:465) is blocked. Consider using SendGrid (set SENDGRID_API_KEY and EMAIL_PROVIDER=sendgrid) or another provider.');
}

// 2. Helper: create SMTP transporter (not used if provider=sendgrid)
const createSmtpTransporter = () => {
  // increased timeouts to be more tolerant of transient network slowness
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 30000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 30000),
    // optional TLS options can be provided via env if needed:
    tls: {
      rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false'
    }
  });
};

let transporter;
if (EMAIL_PROVIDER === 'smtp') {
  transporter = createSmtpTransporter();

  // Verify transporter but don't crash the process if verification fails.
  transporter.verify().then(() => {
    console.log('✅ SMTP transporter verified and ready to send messages.');
  }).catch((err) => {
    console.warn('⚠️ SMTP transporter verification failed. Emails may not be delivered from this environment.');
    console.warn('Verification error:', err && err.message ? err.message : err);
    console.warn('If running on a hosted platform (e.g., Render, Heroku), outbound SMTP may be blocked. Consider using SendGrid or another mail API (set SENDGRID_API_KEY and EMAIL_PROVIDER=sendgrid).');
  });
}

// 3. Fallback: SendGrid function (only used if configured)
let sgMail;
if (SENDGRID_API_KEY) {
  try {
    // lazy require so this module is optional
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(SENDGRID_API_KEY);
    console.log('✅ SendGrid client configured as fallback.');
  } catch (err) {
    console.warn('⚠️ Failed to initialize @sendgrid/mail. If you intend to use SendGrid, ensure the dependency is installed.');
    sgMail = null;
  }
}

// 4. Generic sendEmail with retries and conditional fallback
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function trySendWithSmtp(mailOptions, attempt = 1) {
  try {
    const info = await transporter.sendMail(mailOptions);
    return { provider: 'smtp', info };
  } catch (err) {
    // If transient (timeout/ECONNRESET), allow retry
    const transientCodes = ['ETIMEDOUT', 'ECONNRESET', 'EPIPE', 'ENOTFOUND'];
    const isTransient = err && (transientCodes.includes(err.code) || (err.message && err.message.toLowerCase().includes('timeout')));
    if (isTransient && attempt < 3) {
      const delay = 500 * attempt; // exponential-ish backoff: 500ms, 1000ms
      console.warn(`⚠️ SMTP send attempt ${attempt} failed with transient error (${err.code}). Retrying after ${delay}ms...`);
      await wait(delay);
      return trySendWithSmtp(mailOptions, attempt + 1);
    }
    // rethrow so caller can decide to fallback to SendGrid
    throw err;
  }
}

async function trySendWithSendGrid(mailOptions) {
  if (!sgMail) {
    throw new Error('SendGrid not configured or not available');
  }
  // Map nodemailer mailOptions to SendGrid shape
  const msg = {
    to: mailOptions.to,
    from: mailOptions.from,
    subject: mailOptions.subject,
    html: mailOptions.html
  };
  const [response] = await sgMail.send(msg);
  return { provider: 'sendgrid', info: { statusCode: response && response.statusCode, headers: response && response.headers } };
}

/**
 * sendEmail: attempts to send via configured provider(s).
 * - If EMAIL_PROVIDER=smtp, tries SMTP and falls back to SendGrid if configured.
 * - If EMAIL_PROVIDER=sendgrid, uses SendGrid.
 */
async function sendEmail(mailOptions) {
  if (EMAIL_PROVIDER === 'sendgrid') {
    if (!sgMail) throw new Error('SendGrid configured as provider but @sendgrid/mail is not available or SENDGRID_API_KEY missing');
    const result = await trySendWithSendGrid(mailOptions);
    console.log(`✅ Email sent via SendGrid to ${mailOptions.to}`, result.info || '');
    return result;
  }

  // default: smtp first
  if (!transporter) {
    // No smtp transporter available; try SendGrid if possible.
    if (sgMail) {
      const result = await trySendWithSendGrid(mailOptions);
      console.log(`✅ Email sent via SendGrid to ${mailOptions.to}`, result.info || '');
      return result;
    }
    throw new Error('No email transporter configured. Set EMAIL_PROVIDER=sendgrid and provide SENDGRID_API_KEY, or configure SMTP env vars.');
  }

  try {
    const result = await trySendWithSmtp(mailOptions);
    console.log(`✅ Email sent via SMTP to ${mailOptions.to}`, result.info && result.info.response ? result.info.response : '');
    return result;
  } catch (smtpErr) {
    console.error('❌ SMTP sending failed:', smtpErr && smtpErr.message ? smtpErr.message : smtpErr);
    // If SendGrid is configured, attempt fallback
    if (sgMail) {
      console.log('🔁 Attempting fallback to SendGrid...');
      try {
        const result = await trySendWithSendGrid(mailOptions);
        console.log(`✅ Email sent via SendGrid to ${mailOptions.to}`, result.info || '');
        return result;
      } catch (sgErr) {
        console.error('❌ SendGrid fallback failed:', sgErr && sgErr.message ? sgErr.message : sgErr);
        // Throw original SMTP error for visibility, but include fallback error
        const err = new Error('Both SMTP and SendGrid attempts failed');
        err.details = { smtp: smtpErr, sendgrid: sgErr };
        throw err;
      }
    }
    // No fallback configured; rethrow SMTP error
    throw smtpErr;
  }
}

// 5. Public functions (same signatures as before)
const sendVerificationEmail = async (email, username, verificationToken) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationLink = `${clientUrl}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'LegalQuest <noreply@legalquest.com>',
    to: email,
    subject: '✅ Verify Your LegalQuest Account',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to LegalQuest, ${username}!</h2>
          <p>Please verify your email address to activate your account:</p>
          <a href="${verificationLink}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p>Or click: ${verificationLink}</p>
      </div>
    `
  };

  try {
    await sendEmail(mailOptions);
    return true;
  } catch (error) {
    console.error('❌ FAILED to send verification email:', error && error.message ? error.message : error);
    throw new Error('Email sending failed');
  }
};

const sendPasswordResetEmail = async (email, username, resetToken) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'LegalQuest <noreply@legalquest.com>',
    to: email,
    subject: '🔒 Reset Your LegalQuest Password',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>Click below to reset your password:</p>
          <a href="${resetLink}" style="background-color: #EF4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>Or click: ${resetLink}</p>
      </div>
    `
  };

  try {
    await sendEmail(mailOptions);
    return true;
  } catch (error) {
    console.error('❌ FAILED to send reset email:', error && error.message ? error.message : error);
    throw new Error('Email sending failed');
  }
};

const resendVerificationEmail = async (email, username, verificationToken) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationLink = `${clientUrl}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'LegalQuest <noreply@legalquest.com>',
    to: email,
    subject: '🔄 Resend: Verify Your LegalQuest Account',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Verify Your Email</h2>
          <p>Here is your new verification link:</p>
          <a href="${verificationLink}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
      </div>
    `
  };

  try {
    await sendEmail(mailOptions);
    return true;
  } catch (error) {
    console.error('❌ FAILED to resend email:', error && error.message ? error.message : error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  resendVerificationEmail
};