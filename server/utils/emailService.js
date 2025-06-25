const nodemailer = require('nodemailer');

/**
 * Send email with attachment
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {Array} options.attachments - Email attachments
 * @returns {Promise<Object>} - Email send info
 */
exports.sendEmail = async (options) => {
  try {
    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Setup email data
    const mailOptions = {
      from: `"${options.fromName || 'QuickBill'}" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments || []
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Email could not be sent');
  }
};

/**
 * Generate invoice email content
 * @param {Object} invoice - Invoice data
 * @param {Object} user - User data
 * @param {Object} client - Client data
 * @returns {Object} - Email options
 */
exports.generateInvoiceEmail = (invoice, user, client) => {
  const subject = `Invoice #${invoice.invoiceNumber} from ${user.company?.name || user.name}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2c3e50;">Invoice #${invoice.invoiceNumber}</h1>
      
      <p>Dear ${client.name},</p>
      
      <p>Please find attached invoice #${invoice.invoiceNumber} for the amount of $${invoice.totalAmount.toFixed(2)}.</p>
      
      <p><strong>Due date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f8f9fa;">
          <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Description</th>
          <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Amount</th>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">Invoice Total</td>
          <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">$${invoice.totalAmount.toFixed(2)}</td>
        </tr>
      </table>
      
      ${invoice.notes ? `<p><strong>Notes:</strong> ${invoice.notes}</p>` : ''}
      
      <p>Thank you for your business!</p>
      
      <p>Regards,<br>${user.name}<br>${user.company?.name || ''}</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #6c757d;">
        <p>This is an automated email from QuickBill. Please do not reply directly to this email.</p>
      </div>
    </div>
  `;
  
  return {
    to: client.email,
    subject,
    html,
    fromName: user.company?.name || user.name
  };
};

/**
 * Generate reminder email content
 * @param {Object} invoice - Invoice data
 * @param {Object} user - User data
 * @param {Object} client - Client data
 * @param {number} daysOverdue - Days overdue
 * @returns {Object} - Email options
 */
exports.generateReminderEmail = (invoice, user, client, daysOverdue) => {
  const subject = `Payment Reminder: Invoice #${invoice.invoiceNumber} is ${daysOverdue} days overdue`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #e74c3c;">Payment Reminder</h1>
      
      <p>Dear ${client.name},</p>
      
      <p>This is a friendly reminder that invoice #${invoice.invoiceNumber} for the amount of $${invoice.totalAmount.toFixed(2)} is now <strong>${daysOverdue} days overdue</strong>.</p>
      
      <p><strong>Due date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
      
      <p>Please arrange for payment at your earliest convenience. If you have already made the payment, please disregard this reminder.</p>
      
      <p>If you have any questions or concerns regarding this invoice, please don't hesitate to contact us.</p>
      
      <p>Thank you for your prompt attention to this matter.</p>
      
      <p>Regards,<br>${user.name}<br>${user.company?.name || ''}</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #6c757d;">
        <p>This is an automated email from QuickBill. Please do not reply directly to this email.</p>
      </div>
    </div>
  `;
  
  return {
    to: client.email,
    subject,
    html,
    fromName: user.company?.name || user.name
  };
}; 