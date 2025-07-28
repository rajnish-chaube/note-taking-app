import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";

// Configure SendGrid if API key is provided
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Configure Nodemailer for Gmail/SMTP
const createTransporter = () => {
  if (
    process.env.EMAIL_SERVICE === "gmail" &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS
  ) {
    return nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use App Password for Gmail
      },
    });
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return null;
};

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const generateOTPEmailTemplate = (otp: string, userName?: string) => {
  return {
    subject: "Your NoteTaker Verification Code",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>NoteTaker - Verification Code</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; text-align: center; }
          .logo { color: white; font-size: 28px; font-weight: bold; margin: 0; }
          .content { padding: 40px 30px; }
          .otp-box { background: #f8fafc; border: 2px solid #e5e7eb; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
          .otp { font-size: 36px; font-weight: bold; color: #1f2937; letter-spacing: 8px; margin: 10px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">📝 NoteTaker</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Hello${userName ? ` ${userName}` : ""}!</p>
            <p>You've requested to verify your email address for NoteTaker. Please use the verification code below:</p>
            
            <div class="otp-box">
              <p style="margin: 0; color: #6b7280;">Your verification code is:</p>
              <div class="otp">${otp}</div>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">This code will expire in 10 minutes</p>
            </div>
            
            <p>If you didn't request this verification code, please ignore this email.</p>
            <p>For security reasons, never share this code with anyone.</p>
            
            <p>Best regards,<br>The NoteTaker Team</p>
          </div>
          <div class="footer">
            <p>© 2024 NoteTaker. This is an automated email, please don't reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      NoteTaker - Email Verification
      
      Hello${userName ? ` ${userName}` : ""}!
      
      Your verification code is: ${otp}
      
      This code will expire in 10 minutes.
      
      If you didn't request this code, please ignore this email.
      
      Best regards,
      The NoteTaker Team
    `,
  };
};

export const sendOTPEmail = async (
  email: string,
  otp: string,
  userName?: string,
): Promise<boolean> => {
  try {
    const emailTemplate = generateOTPEmailTemplate(otp, userName);

    // Try SendGrid first
    if (process.env.SENDGRID_API_KEY && process.env.FROM_EMAIL) {
      await sgMail.send({
        to: email,
        from: {
          email: process.env.FROM_EMAIL,
          name: "NoteTaker",
        },
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      });

      console.log(`✅ OTP email sent via SendGrid to ${email}`);
      return true;
    }

    // Fallback to SMTP
    const transporter = createTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: `"NoteTaker" <${process.env.EMAIL_USER || process.env.SMTP_USER}>`,
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      });

      console.log(`✅ OTP email sent via SMTP to ${email}`);
      return true;
    }

    // No email service configured - log to console for development
    console.log(`🔐 [DEV MODE] OTP for ${email}: ${otp}`);
    console.log(
      `📧 Email service not configured. Set SENDGRID_API_KEY or SMTP credentials.`,
    );
    return false;
  } catch (error) {
    console.error("❌ Email sending failed:", error);

    // Fallback to console logging
    console.log(`🔐 [FALLBACK] OTP for ${email}: ${otp}`);
    return false;
  }
};

export const sendWelcomeEmail = async (
  email: string,
  userName: string,
): Promise<boolean> => {
  try {
    const emailOptions = {
      to: email,
      subject: "Welcome to NoteTaker! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to NoteTaker</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; text-align: center; }
            .logo { color: white; font-size: 28px; font-weight: bold; margin: 0; }
            .content { padding: 40px 30px; }
            .button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
            .feature { background: #f8fafc; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">📝 NoteTaker</h1>
            </div>
            <div class="content">
              <h2>Welcome to NoteTaker, ${userName}! 🎉</h2>
              <p>Thank you for joining NoteTaker! We're excited to help you organize your thoughts and ideas beautifully.</p>
              
              <div class="feature">
                <h3>🔒 Secure & Private</h3>
                <p>Your notes are protected with enterprise-grade security and are completely private to you.</p>
              </div>
              
              <div class="feature">
                <h3>🎨 Beautiful Organization</h3>
                <p>Use colors, tags, and search to keep your notes organized exactly how you like them.</p>
              </div>
              
              <div class="feature">
                <h3>📱 Access Anywhere</h3>
                <p>Your notes sync seamlessly across all your devices, so your ideas are always with you.</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.APP_URL || "http://localhost:8080"}/dashboard" class="button">Start Taking Notes</a>
              </div>
              
              <p>If you have any questions or need help getting started, feel free to reach out to our support team.</p>
              
              <p>Happy note-taking!<br>The NoteTaker Team</p>
            </div>
            <div class="footer">
              <p>© 2024 NoteTaker. You're receiving this email because you signed up for NoteTaker.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to NoteTaker, ${userName}!
        
        Thank you for joining NoteTaker! We're excited to help you organize your thoughts and ideas.
        
        Get started at: ${process.env.APP_URL || "http://localhost:8080"}/dashboard
        
        Best regards,
        The NoteTaker Team
      `,
    };

    if (process.env.SENDGRID_API_KEY && process.env.FROM_EMAIL) {
      await sgMail.send({
        to: emailOptions.to,
        from: {
          email: process.env.FROM_EMAIL,
          name: "NoteTaker",
        },
        subject: emailOptions.subject,
        html: emailOptions.html,
        text: emailOptions.text,
      });

      console.log(`✅ Welcome email sent via SendGrid to ${email}`);
      return true;
    }

    const transporter = createTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: `"NoteTaker" <${process.env.EMAIL_USER || process.env.SMTP_USER}>`,
        ...emailOptions,
      });

      console.log(`✅ Welcome email sent via SMTP to ${email}`);
      return true;
    }

    console.log(`📧 Welcome email not sent - no email service configured`);
    return false;
  } catch (error) {
    console.error("❌ Welcome email sending failed:", error);
    return false;
  }
};
