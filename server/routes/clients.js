const express = require('express');
const { check } = require('express-validator');
const { getClients, getClient, createClient, updateClient, deleteClient } = require('../controllers/clientController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// @route   GET /api/clients
// @desc    Get all clients for a user
// @access  Private
router.get('/', getClients);

// @route   GET /api/clients/:id
// @desc    Get single client
// @access  Private
router.get('/:id', getClient);

// @route   POST /api/clients
// @desc    Create new client
// @access  Private
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail()
  ],
  createClient
);

// @route   PUT /api/clients/:id
// @desc    Update client
// @access  Private
router.put('/:id', updateClient);

// @route   DELETE /api/clients/:id
// @desc    Delete client
// @access  Private
router.delete('/:id', deleteClient);

module.exports = router; 