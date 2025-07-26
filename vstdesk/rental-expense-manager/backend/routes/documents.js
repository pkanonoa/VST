const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { upload, handleUploadErrors } = require('../middleware/fileUpload');
const { auth } = require('../middleware/auth');

/**
 * @route GET /api/:entityType/:entityId/documents
 * @desc Get all documents for an entity
 * @access Private
 */
router.get('/:entityType/:entityId/documents', auth, documentController.getDocuments);

/**
 * @route GET /api/:entityType/:entityId/documents/:documentId
 * @desc Get a document by ID
 * @access Private
 */
router.get('/:entityType/:entityId/documents/:documentId', auth, documentController.getDocument);

/**
 * @route POST /api/:entityType/:entityId/documents
 * @desc Upload documents for an entity
 * @access Private
 */
router.post(
  '/:entityType/:entityId/documents',
  auth,
  upload.array('documents', 10),
  handleUploadErrors,
  documentController.uploadDocuments
);

/**
 * @route GET /api/:entityType/:entityId/documents/:documentId/download
 * @desc Download a document
 * @access Private
 */
router.get(
  '/:entityType/:entityId/documents/:documentId/download',
  auth,
  documentController.downloadDocument
);

/**
 * @route DELETE /api/:entityType/:entityId/documents/:documentId
 * @desc Delete a document
 * @access Private
 */
router.delete(
  '/:entityType/:entityId/documents/:documentId',
  auth,
  documentController.deleteDocument
);

module.exports = router;