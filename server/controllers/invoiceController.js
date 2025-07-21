const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

// @desc    Get all invoices for a user
// @route   GET /api/invoices
// @access  Private
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user.id })
      .populate('client', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client', 'name email address phone')
      .populate('user', 'name email company');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Make sure user owns invoice
    if (invoice.user._id.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this invoice'
      });
    }

    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private
exports.createInvoice = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Add user to req.body
    req.body.user = req.user.id;

    // Check if client exists and belongs to user
    const client = await Client.findById(req.body.client);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    if (client.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to use this client'
      });
    }

    // Calculate total amount and tax
    let totalAmount = 0;
    let totalTax = 0;

    req.body.items.forEach(item => {
      const itemTotal = item.quantity * item.unitPrice;
      const itemTax = itemTotal * (item.tax / 100);
      totalAmount += itemTotal;
      totalTax += itemTax;
    });

    // Add calculated values to req.body
    req.body.totalAmount = totalAmount + totalTax;
    req.body.totalTax = totalTax;

    const invoice = await Invoice.create(req.body);

    res.status(201).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
exports.updateInvoice = async (req, res) => {
  try {
    let invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Make sure user owns invoice
    if (invoice.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this invoice'
      });
    }

    // If updating items, recalculate totals
    if (req.body.items) {
      let totalAmount = 0;
      let totalTax = 0;

      req.body.items.forEach(item => {
        const itemTotal = item.quantity * item.unitPrice;
        const itemTax = itemTotal * (item.tax / 100);
        totalAmount += itemTotal;
        totalTax += itemTax;
      });

      // Add calculated values to req.body
      req.body.totalAmount = totalAmount + totalTax;
      req.body.totalTax = totalTax;
    }

    invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Make sure user owns invoice
    if (invoice.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this invoice'
      });
    }

    await invoice.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Send invoice by email
// @route   POST /api/invoices/:id/send
// @access  Private
exports.sendInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client', 'name email')
      .populate('user', 'name email company');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Make sure user owns invoice
    if (invoice.user._id.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to send this invoice'
      });
    }
    
    // Get recipient email - either from request body or fall back to client email
    const recipientEmail = req.body.recipientEmail || invoice.client.email;

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
      from: `"${invoice.user.name}" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `Invoice #${invoice.invoiceNumber} from ${invoice.user.company?.name || invoice.user.name}`,
      html: `
        <h1>Invoice #${invoice.invoiceNumber}</h1>
        <p>Please find attached invoice #${invoice.invoiceNumber} for the amount of $${invoice.totalAmount.toFixed(2)}.</p>
        <p>Due date: ${new Date(invoice.dueDate).toLocaleDateString()}</p>
        <p>Thank you for your business!</p>
        <p>Regards,<br>${invoice.user.name}<br>${invoice.user.company?.name || ''}</p>
      `,
      attachments: [
        {
          filename: `Invoice-${invoice.invoiceNumber}.pdf`,
          path: invoice.pdfUrl || 'https://example.com/invoice.pdf', // Replace with actual PDF URL
          contentType: 'application/pdf'
        }
      ]
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Update invoice status to 'sent'
    invoice.status = 'sent';
    await invoice.save();

    res.status(200).json({
      success: true,
      data: invoice,
      message: 'Invoice sent successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 