const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

/**
 * Document Model
 * 
 * Represents a document uploaded to the system, associated with various entities
 * such as shops, apartments, bookings, bills, or expenses.
 */
const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'The name of the file on disk'
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'The original name of the file as uploaded by the user'
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'The path to the file on disk'
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'The size of the file in bytes'
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'The MIME type of the file'
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'The type of entity this document is associated with (shop, apartment, booking, bill, expense)'
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'The ID of the entity this document is associated with'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Optional description of the document'
  },
  tags: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Optional comma-separated tags for the document'
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    comment: 'The ID of the user who uploaded the document'
  },
  uploadedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'The date and time the document was uploaded'
  }
}, {
  tableName: 'documents',
  timestamps: true,
  indexes: [
    {
      name: 'documents_entity_index',
      fields: ['entityType', 'entityId']
    },
    {
      name: 'documents_uploaded_by_index',
      fields: ['uploadedBy']
    }
  ]
});

// Define associations
Document.belongsTo(User, { 
  foreignKey: 'uploadedBy', 
  as: 'uploader' 
});

module.exports = Document;