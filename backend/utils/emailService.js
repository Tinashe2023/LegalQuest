const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')  // ← Go up one level to backend/
});
const nodemailer = require('nodemailer');
require('dotenv').config();

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error('Missing EMAIL_USER or EMAIL_PASSWORD in .env file!');
  console.error('Looking for .env at:', path.resolve(__dirname, '../.env'));
  process.exit(1);
}
console.log('EMAIL_USER loaded:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD loaded:', !!process.env.EMAIL_PASSWORD);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD 
  }
});

const sendVerificationEmail = async (email, username, verificationToken) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationLink = `${clientUrl}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: 'LegalQuest <noreply@legalquest.com>',
    to: email,
    subject: '✅ Verify Your LegalQuest Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #4F46E5; margin-bottom: 20px;">Welcome to LegalQuest, ${username}! 🎉</h2>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Thank you for signing up! You're one step away from learning your legal rights in a fun, gamified way.
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Please verify your email address to activate your account:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background-color: #4F46E5; color: white; padding: 14px 28px; 
                      text-decoration: none; border-radius: 8px; display: inline-block; 
                      font-weight: bold; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">
            Or copy and paste this link into your browser:
          </p>
          <p style="color: #4F46E5; word-break: break-all; font-size: 12px;">
            ${verificationLink}
          </p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
            This verification link will expire in 24 hours.<br>
            If you didn't create this account, please ignore this email.
          </p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, username, resetToken) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: 'LegalQuest <noreply@legalquest.com>',
    to: email,
    subject: '🔒 Reset Your LegalQuest Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #EF4444; margin-bottom: 20px;">🔒 Password Reset Request</h2>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Hi ${username},
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #EF4444; color: white; padding: 14px 28px; 
                      text-decoration: none; border-radius: 8px; display: inline-block; 
                      font-weight: bold; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">
            Or copy and paste this link into your browser:
          </p>
          <p style="color: #EF4444; word-break: break-all; font-size: 12px;">
            ${resetLink}
          </p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
            This link will expire in 1 hour.<br>
            If you didn't request this, please ignore this email and your password will remain unchanged.
          </p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const resendVerificationEmail = async (email, username, verificationToken) => {
  // Same as sendVerificationEmail, just with different subject line
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationLink = `${clientUrl}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: 'LegalQuest <noreply@legalquest.com>',
    to: email,
    subject: '🔄 Resend: Verify Your LegalQuest Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #4F46E5; margin-bottom: 20px;">Verify Your Email Address</h2>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Hi ${username},
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Here's your verification link again. Please click below to verify your account:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background-color: #4F46E5; color: white; padding: 14px 28px; 
                      text-decoration: none; border-radius: 8px; display: inline-block; 
                      font-weight: bold; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">
            Or copy and paste this link:
          </p>
          <p style="color: #4F46E5; word-break: break-all; font-size: 12px;">
            ${verificationLink}
          </p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
            This link expires in 24 hours.
          </p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { 
  sendVerificationEmail, 
  sendPasswordResetEmail,
  resendVerificationEmail 
};
