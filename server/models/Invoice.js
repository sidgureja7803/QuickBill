const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  items: [
    {
      description: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      unitPrice: {
        type: Number,
        required: true,
        min: 0
      },
      tax: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      }
    }
  ],
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  totalTax: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  },
  paymentTerms: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  pdfUrl: {
    type: String
  }
});

// Generate invoice number before saving
InvoiceSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    this.invoiceNumber = `INV-${Date.now().toString().slice(-6)}${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', InvoiceSchema); 