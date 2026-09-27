const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

const getBaseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; color: #3f3f46; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background-color: #18181b; color: #ffffff; padding: 20px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px; }
    .content { padding: 30px; line-height: 1.6; }
    .footer { background-color: #f4f4f5; color: #71717a; text-align: center; padding: 15px; font-size: 12px; border-top: 1px solid #e4e4e7; }
    .btn { display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500; margin-top: 15px; }
    .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .data-table td { padding: 10px; border-bottom: 1px solid #e4e4e7; }
    .data-table td:first-child { font-weight: 600; width: 30%; color: #52525b; }
    .message-box { background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 0 6px 6px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Portfolio System</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Portfolio CRM. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

const sendAdminNotification = async (messageData) => {
  if (!process.env.EMAIL_USER || !process.env.ADMIN_EMAIL) {
    console.log('Skipping email notification: SMTP credentials not configured.');
    return;
  }

  const transporter = createTransporter();
  
  const content = `
    <h2 style="margin-top: 0; color: #18181b;">New Contact Submission</h2>
    <p>You have received a new message via your portfolio contact form.</p>
    <table class="data-table">
      <tr><td>Name:</td><td>${messageData.name}</td></tr>
      <tr><td>Email:</td><td><a href="mailto:${messageData.email}">${messageData.email}</a></td></tr>
      <tr><td>Subject:</td><td>${messageData.subject}</td></tr>
    </table>
    <h3 style="margin-bottom: 10px; color: #18181b;">Message:</h3>
    <div class="message-box">
      ${messageData.message.replace(/\n/g, '<br/>')}
    </div>
    <p>Log in to your Dashboard to reply to this message.</p>
  `;

  const mailOptions = {
    from: `"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New Message: ${messageData.subject}`,
    text: `New message from ${messageData.name} (${messageData.email}). Subject: ${messageData.subject}. Message: ${messageData.message}`,
    html: getBaseTemplate(content)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent successfully.');
  } catch (error) {
    console.error('Failed to send admin notification email:', error.message);
  }
};

const sendAutoReplyToVisitor = async (visitorEmail, visitorName) => {
  if (!process.env.EMAIL_USER) return;

  const transporter = createTransporter();
  
  const content = `
    <h2 style="margin-top: 0; color: #18181b;">Message Received</h2>
    <p>Hi ${visitorName},</p>
    <p>Thank you for reaching out! This is an automated message to confirm that we've received your inquiry.</p>
    <p>I will review your message and get back to you as soon as possible, usually within 1-2 business days.</p>
    <p>Best regards,</p>
    <p><strong>Admin</strong></p>
  `;

  const mailOptions = {
    from: `"Admin" <${process.env.EMAIL_USER}>`,
    to: visitorEmail,
    subject: `Thank you for contacting me`,
    text: `Hi ${visitorName}, Thank you for reaching out! We've received your inquiry and will get back to you shortly.`,
    html: getBaseTemplate(content)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Auto-reply email sent successfully to', visitorEmail);
  } catch (error) {
    console.error('Failed to send auto-reply email:', error.message);
  }
};

const sendReplyToVisitor = async (visitorEmail, subject, replyMessage) => {
  if (!process.env.EMAIL_USER) {
    console.log('Mock Mode: Reply email to visitor log:', { visitorEmail, subject, replyMessage });
    return;
  }

  const transporter = createTransporter();
  
  const content = `
    <h2 style="margin-top: 0; color: #18181b;">Re: Your Message</h2>
    <div style="font-size: 15px; color: #3f3f46;">
      ${replyMessage.replace(/\n/g, '<br/>')}
    </div>
    <br/>
    <p style="margin-top: 30px; font-size: 13px; color: #71717a;">Please reply directly to this email to continue the conversation.</p>
  `;

  const mailOptions = {
    from: `"Admin" <${process.env.EMAIL_USER}>`,
    to: visitorEmail,
    subject: subject,
    text: replyMessage,
    html: getBaseTemplate(content)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Reply email sent successfully to', visitorEmail);
  } catch (error) {
    console.error('Failed to send reply email:', error.message);
    throw new Error('Failed to send email');
  }
};

module.exports = {
  sendAdminNotification,
  sendAutoReplyToVisitor,
  sendReplyToVisitor
};
