const nodemailer = require('nodemailer');
require('dotenv').config();

// 1. Log status on startup
console.log('Email Service Status:', {
  userLoaded: !!process.env.EMAIL_USER,
  passLoaded: !!process.env.EMAIL_PASSWORD,
  clientUrl: process.env.CLIENT_URL
});

// 2. The Transporter (Global Definition)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', 
  port: 465,              
  secure: true,           
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD 
  },
  connectionTimeout: 10000, 
  greetingTimeout: 10000
});

const sendVerificationEmail = async (email, username, verificationToken) => {
  try {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verificationLink = `${clientUrl}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: 'LegalQuest <noreply@legalquest.com>',
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

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}: ${info.response}`);
    return true;

  } catch (error) {
    console.error("❌ FAILED to send verification email:", error);
    // --- VIVA EMERGENCY BYPASS ---
    // If email fails (timeout), uncomment the next line to pretend it worked!
    // return true; 
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
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Password Reset Request</h2>
            <p>Click below to reset your password:</p>
            <a href="${resetLink}" style="background-color: #EF4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>Or click: ${resetLink}</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Reset email sent to ${email}: ${info.response}`);
    return true;

  } catch (error) {
    console.error("❌ FAILED to send reset email:", error);
    // --- VIVA EMERGENCY BYPASS ---
    // If email fails (timeout), uncomment the next line to pretend it worked!
    // return true;
    throw new Error('Email sending failed');
  }
};

const resendVerificationEmail = async (email, username, verificationToken) => {
    try {
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const verificationLink = `${clientUrl}/verify-email?token=${verificationToken}`;
        
        const mailOptions = {
            from: 'LegalQuest <noreply@legalquest.com>',
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
        
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Resent verification to ${email}: ${info.response}`);
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