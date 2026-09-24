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

const sendAdminNotification = async (messageData) => {
  if (!process.env.EMAIL_USER || !process.env.ADMIN_EMAIL) {
    console.log('Skipping email notification: SMTP credentials not configured.');
    return;
  }

  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New Message: ${messageData.subject}`,
    text: `You have received a new message from ${messageData.name} (${messageData.email}):\n\n${messageData.message}`,
    html: `
      <h2>New Portfolio Message</h2>
      <p><strong>From:</strong> ${messageData.name} (${messageData.email})</p>
      <p><strong>Subject:</strong> ${messageData.subject}</p>
      <hr />
      <p>${messageData.message.replace(/\n/g, '<br/>')}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent successfully.');
  } catch (error) {
    console.error('Failed to send admin notification email:', error.message);
  }
};

const sendReplyToVisitor = async (visitorEmail, subject, replyMessage) => {
  if (!process.env.EMAIL_USER) {
    console.log('Mock Mode: Reply email to visitor log:', { visitorEmail, subject, replyMessage });
    return;
  }

  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"Admin" <${process.env.EMAIL_USER}>`,
    to: visitorEmail,
    subject: subject,
    text: replyMessage,
    html: `<div style="font-family: sans-serif;">
      <p>${replyMessage.replace(/\n/g, '<br/>')}</p>
    </div>`
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
  sendReplyToVisitor
};
