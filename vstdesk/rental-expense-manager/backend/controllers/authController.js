const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authConfig = require('../config/auth');

/**
 * Register a new user
 * @route POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Check if username or email already exists
    const existingUser = await User.findOne({
      where: {
        [User.sequelize.Op.or]: [
          { username },
          { email }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({
        message: 'Username or email already exists'
      });
    }
    
    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      role: role || authConfig.roles.USER
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      authConfig.jwt.secret,
      { expiresIn: authConfig.jwt.expiresIn }
    );
    
    // Return user info and token
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors.map(e => e.message)
      });
    }
    
    return res.status(500).json({
      message: 'Error registering user',
      error: error.message
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { login, password } = req.body;
    
    if (!login || !password) {
      return res.status(400).json({
        message: 'Username/email and password are required'
      });
    }
    
    // Find user by username or email
    const user = await User.findByLogin(login);
    
    if (!user) {
      return res.status(401).json({
        message: 'Authentication failed. User not found.'
      });
    }
    
    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Authentication failed. Invalid password.'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      authConfig.jwt.secret,
      { expiresIn: authConfig.jwt.expiresIn }
    );
    
    // Return user info and token
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      message: 'Error during login',
      error: error.message
    });
  }
};

/**
 * Get user profile
 * @route GET /api/auth/profile
 */
exports.getProfile = async (req, res) => {
  try {
    // User is attached to request by auth middleware
    const user = req.user;
    
    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      message: 'Error getting user profile',
      error: error.message
    });
  }
};

/**
 * Update user profile
 * @route PUT /api/auth/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    // User is attached to request by auth middleware
    const user = req.user;
    const { username, email, password } = req.body;
    
    // Check if username or email already exists
    if (username && username !== user.username) {
      const existingUser = await User.findOne({
        where: { username }
      });
      
      if (existingUser) {
        return res.status(400).json({
          message: 'Username already exists'
        });
      }
      
      user.username = username;
    }
    
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: { email }
      });
      
      if (existingUser) {
        return res.status(400).json({
          message: 'Email already exists'
        });
      }
      
      user.email = email;
    }
    
    if (password) {
      user.password = password;
    }
    
    await user.save();
    
    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors.map(e => e.message)
      });
    }
    
    return res.status(500).json({
      message: 'Error updating user profile',
      error: error.message
    });
  }
};