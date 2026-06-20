const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.EMAIL_HOST || 'smtp.ethereal.email';
  const port = parseInt(process.env.EMAIL_PORT) || 587;
  let user = process.env.EMAIL_USER;
  let pass = process.env.EMAIL_PASS;

  // If credentials are not provided, auto-generate Ethereal account for development
  if (!user || !pass) {
    console.log('📬 No SMTP credentials provided. Creating auto-generated Ethereal test account...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      user = testAccount.user;
      pass = testAccount.pass;
      console.log(`✅ Ethereal Test Account generated:`);
      console.log(`   User: ${user}`);
      console.log(`   Pass: ${pass}`);
    } catch (err) {
      console.error('❌ Failed to create Ethereal test account:', err.message);
    }
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass
    }
  });

  return transporter;
};

// Generic email sender
const sendEmail = async ({ to, subject, html }) => {
  try {
    const activeTransporter = await getTransporter();
    const mailOptions = {
      from: `"MediRoute Security" <${activeTransporter.options.auth.user}>`,
      to,
      subject,
      html
    };

    const info = await activeTransporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully! Message ID: ${info.messageId}`);
    
    // If it is Ethereal, log the preview URL so the user can check it
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 Ethereal Preview URL: ${previewUrl}`);
    }
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (err) {
    console.error('❌ Nodemailer Error sending email:', err.message);
    return { success: false, error: err.message };
  }
};

// Welcome Email template
const sendWelcomeEmail = async (email, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0e7490; text-align: center;">Welcome to MediRoute AI</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Thank you for creating an account on the MediRoute AI Smart Healthcare Routing platform. We are thrilled to have you join our network.</p>
      <p>Our platform enables you to check your symptoms, locate real-time hospital bed availabilities, and schedule appointments instantly.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b; text-align: center;">This is an automated system notification from MediRoute AI.</p>
    </div>
  `;
  return await sendEmail({ to: email, subject: 'Welcome to MediRoute AI!', html });
};

// OTP Verification Email template
const sendOtpEmail = async (email, name, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0e7490; text-align: center;">Verify Your Account</h2>
      <p>Hello <strong>${name || 'User'}</strong>,</p>
      <p>We received a request to verify your account or login. Please use the following One-Time Password (OTP) to complete verification:</p>
      <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-radius: 6px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #0f172a; margin: 20px 0;">
        ${otp}
      </div>
      <p style="color: #ef4444; font-size: 13px;"><strong>Note:</strong> This OTP will expire in 5 minutes. Do not share this code with anyone.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b; text-align: center;">This is an automated security code from MediRoute AI.</p>
    </div>
  `;
  return await sendEmail({ to: email, subject: `Your MediRoute Verification Code: ${otp}`, html });
};

// Password Reset Email template
const sendResetEmail = async (email, name, resetUrl) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #6d28d9; text-align: center;">Reset Your Password</h2>
      <p>Hello <strong>${name || 'User'}</strong>,</p>
      <p>You requested a password reset. Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${resetUrl}" target="_blank" style="background-color: #6d28d9; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-weight: bold; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>If you cannot click the button, copy and paste this link in your browser:</p>
      <p style="word-break: break-all; font-size: 13px; color: #0284c7;"><a href="${resetUrl}">${resetUrl}</a></p>
      <p style="color: #64748b; font-size: 13px;"><strong>Note:</strong> This link is valid for 10 minutes. If you did not make this request, you can safely ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b; text-align: center;">This is an automated security notification from MediRoute AI.</p>
    </div>
  `;
  return await sendEmail({ to: email, subject: 'MediRoute AI Password Reset Request', html });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendOtpEmail,
  sendResetEmail
};
