const express = require('express');
const { check } = require('express-validator');
const { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, sendInvoice } = require('../controllers/invoiceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// @route   GET /api/invoices
// @desc    Get all invoices for a user
// @access  Private
router.get('/', getInvoices);

// @route   GET /api/invoices/:id
// @desc    Get single invoice
// @access  Private
router.get('/:id', getInvoice);

// @route   POST /api/invoices
// @desc    Create new invoice
// @access  Private
router.post(
  '/',
  [
    check('client', 'Client is required').not().isEmpty(),
    check('dueDate', 'Due date is required').not().isEmpty(),
    check('items', 'Items are required').isArray().notEmpty(),
    check('items.*.description', 'Description is required for all items').not().isEmpty(),
    check('items.*.quantity', 'Quantity is required for all items').isNumeric(),
    check('items.*.unitPrice', 'Unit price is required for all items').isNumeric()
  ],
  createInvoice
);

// @route   PUT /api/invoices/:id
// @desc    Update invoice
// @access  Private
router.put('/:id', updateInvoice);

// @route   DELETE /api/invoices/:id
// @desc    Delete invoice
// @access  Private
router.delete('/:id', deleteInvoice);

// @route   POST /api/invoices/:id/send
// @desc    Send invoice by email
// @access  Private
router.post('/:id/send', sendInvoice);

module.exports = router; 