// backend/utils/emailService.js
require('dotenv').config();

// VIVA MODE: Bypass all actual email sending to prevent timeouts
console.log('⚠️ EMAIL SERVICE: VIVA BYPASS MODE ACTIVE');
console.log('Emails will NOT be sent. Links will be logged to console.');

const sendVerificationEmail = async (email, username, verificationToken) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationLink = `${clientUrl}/verify-email?token=${verificationToken}`;

  console.log(`\n[DEMO EMAIL] To: ${email}`);
  console.log(`[DEMO EMAIL] Subject: Verify Account`);
  console.log(`[DEMO EMAIL] CLICK THIS LINK TO VERIFY: ${verificationLink}\n`);

  return true; // Pretend it worked
};

const sendPasswordResetEmail = async (email, username, resetToken) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

  console.log(`\n[DEMO EMAIL] To: ${email}`);
  console.log(`[DEMO EMAIL] Subject: Reset Password`);
  console.log(`[DEMO EMAIL] CLICK THIS LINK TO RESET: ${resetLink}\n`);

  return true; // Pretend it worked
};

const resendVerificationEmail = async (email, username, verificationToken) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationLink = `${clientUrl}/verify-email?token=${verificationToken}`;

  console.log(`\n[DEMO EMAIL] To: ${email}`);
  console.log(`[DEMO EMAIL] Subject: Resend Verification`);
  console.log(`[DEMO EMAIL] CLICK THIS LINK: ${verificationLink}\n`);

  return true; // Pretend it worked
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  resendVerificationEmail
};