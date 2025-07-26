const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');

/**
 * Upload documents for an entity
 * @route POST /api/:entityType/:entityId/documents
 */
exports.uploadDocuments = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    
    // Validate entity type
    const validEntityTypes = ['shop', 'apartment', 'booking', 'waterbill', 'currentbill', 'expense'];
    if (!validEntityTypes.includes(entityType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid entity type. Must be one of: ${validEntityTypes.join(', ')}`
      });
    }
    
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded'
      });
    }
    
    // Process each uploaded file
    const uploadedDocuments = [];
    
    for (const file of req.files) {
      // Create document record in database
      const document = await Document.create({
        fileName: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        entityType: entityType.toLowerCase(),
        entityId: entityId,
        description: req.body.description || null,
        tags: req.body.tags || null,
        uploadedBy: req.user.id,
        uploadedAt: new Date()
      });
      
      uploadedDocuments.push({
        id: document.id,
        fileName: document.fileName,
        originalName: document.originalName,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        description: document.description,
        tags: document.tags,
        uploadedAt: document.uploadedAt
      });
    }
    
    return res.status(201).json({
      success: true,
      message: `${uploadedDocuments.length} document(s) uploaded successfully`,
      data: uploadedDocuments
    });
    
  } catch (error) {
    console.error('Error uploading documents:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload documents',
      error: error.message
    });
  }
};

/**
 * Get all documents for an entity
 * @route GET /api/:entityType/:entityId/documents
 */
exports.getDocuments = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    
    // Find all documents for the entity
    const documents = await Document.findAll({
      where: {
        entityType: entityType.toLowerCase(),
        entityId: entityId
      },
      attributes: [
        'id', 'fileName', 'originalName', 'fileSize', 'mimeType',
        'description', 'tags', 'uploadedBy', 'uploadedAt'
      ],
      order: [['uploadedAt', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
    
  } catch (error) {
    console.error('Error retrieving documents:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve documents',
      error: error.message
    });
  }
};

/**
 * Get a document by ID
 * @route GET /api/:entityType/:entityId/documents/:documentId
 */
exports.getDocument = async (req, res) => {
  try {
    const { entityType, entityId, documentId } = req.params;
    
    // Find the document
    const document = await Document.findOne({
      where: {
        id: documentId,
        entityType: entityType.toLowerCase(),
        entityId: entityId
      },
      attributes: [
        'id', 'fileName', 'originalName', 'filePath', 'fileSize', 'mimeType',
        'description', 'tags', 'uploadedBy', 'uploadedAt'
      ]
    });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: document
    });
    
  } catch (error) {
    console.error('Error retrieving document:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve document',
      error: error.message
    });
  }
};

/**
 * Download a document
 * @route GET /api/:entityType/:entityId/documents/:documentId/download
 */
exports.downloadDocument = async (req, res) => {
  try {
    const { entityType, entityId, documentId } = req.params;
    
    // Find the document
    const document = await Document.findOne({
      where: {
        id: documentId,
        entityType: entityType.toLowerCase(),
        entityId: entityId
      }
    });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Check if file exists
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on disk'
      });
    }
    
    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Type', document.mimeType);
    
    // Stream the file to the response
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error downloading document:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to download document',
      error: error.message
    });
  }
};

/**
 * Delete a document
 * @route DELETE /api/:entityType/:entityId/documents/:documentId
 */
exports.deleteDocument = async (req, res) => {
  try {
    const { entityType, entityId, documentId } = req.params;
    
    // Find the document
    const document = await Document.findOne({
      where: {
        id: documentId,
        entityType: entityType.toLowerCase(),
        entityId: entityId
      }
    });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Delete the file from disk if it exists
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }
    
    // Delete the document record from the database
    await document.destroy();
    
    return res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
};