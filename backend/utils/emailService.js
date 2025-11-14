const nodemailer = require('nodemailer');
require('dotenv').config(); // Standard load for local dev

// 1. Log the status on startup so you know if variables are read
// We removed the 'path' dependency and the hard 'process.exit' crash risk
console.log('Email Service Status:', {
  userLoaded: !!process.env.EMAIL_USER,
  passLoaded: !!process.env.EMAIL_PASSWORD,
  clientUrl: process.env.CLIENT_URL
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD 
  }
});

const sendVerificationEmail = async (email, username, verificationToken) => {
  // 2. Add Try/Catch block to stop the "infinite loading" freeze
  try {
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
              Link expires in 24 hours.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}: ${info.response}`);
    return true;

  } catch (error) {
    // 3. Log the specific error so we can see it in Render logs
    console.error("❌ FAILED to send verification email:", error);
    // Throw the error so the Signup Controller knows it failed
    throw new Error('Email sending failed');
  }
};

const sendPasswordResetEmail = async (email, username, resetToken) => {
  try {
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
              Hi ${username}, Click below to reset your password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #EF4444; color: white; padding: 14px 28px; 
                        text-decoration: none; border-radius: 8px; display: inline-block; 
                        font-weight: bold; font-size: 16px;">
                Reset Password
              </a>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Reset email sent to ${email}: ${info.response}`);
    return true;

  } catch (error) {
    console.error("❌ FAILED to send reset email:", error);
    throw new Error('Email sending failed');
  }
};

const resendVerificationEmail = async (email, username, verificationToken) => {
    // Reuse the logic with error handling
    try {
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
        console.log(`Resent verification to ${email}`);
        return true;
    } catch (error) {
        console.error("❌ FAILED to resend email:", error);
        throw error;
    }
};

module.exports = { 
  sendVerificationEmail, 
  sendPasswordResetEmail,
  resendVerificationEmail 
};