// test-email.js
const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')  // ← Same fix
});

const { sendVerificationEmail } = require('./emailService');

(async () => {
  try {
    await sendVerificationEmail(
      'tinashehando+test@gmail.com',
      'TestUser',
      'fake-token-123456'
    );
    console.log('Test email sent successfully!');
  } catch (err) {
    console.error('Failed to send email:', err.message);
  }
})();