require('dotenv').config();

module.exports = {
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your_default_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRATION || '1d'
  },
  
  // Password hashing configuration
  password: {
    saltRounds: 10
  },
  
  // User roles
  roles: {
    ADMIN: 'admin',
    USER: 'user'
  },
  
  // Role permissions
  permissions: {
    admin: [
      'create:any',
      'read:any',
      'update:any',
      'delete:any'
    ],
    user: [
      'read:own',
      'update:own'
    ]
  }
};