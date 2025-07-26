const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT token
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', auth, authController.getProfile);

/**
 * @route PUT /api/auth/me
 * @desc Update user profile
 * @access Private
 */
router.put('/me', auth, authController.updateProfile);

/**
 * @route PUT /api/auth/password
 * @desc Change user password
 * @access Private
 */
router.put('/password', auth, authController.changePassword);

/**
 * @route GET /api/auth/users
 * @desc Get all users (admin only)
 * @access Private/Admin
 */
router.get('/users', auth, authController.getUsers);

module.exports = router;