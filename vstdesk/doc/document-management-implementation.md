# Document Management Implementation

This document outlines the implementation of the document management functionality in the Rental & Expense Management application.

## Overview

The document management system is designed to be integrated throughout the application rather than being a separate module. It allows users to upload, view, download, and delete documents associated with various entities such as shops, apartments, bookings, bills, and expenses.

## Architecture

The document management system follows a modular architecture with the following components:

1. **Database Model**: A Document model that stores metadata about uploaded files
2. **File Storage**: A structured file system organization for storing uploaded files
3. **API Endpoints**: RESTful API endpoints for document operations
4. **Middleware**: Authentication and file upload middleware
5. **Controllers**: Business logic for document operations

## Database Schema

The Document model includes the following fields:

| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key |
| fileName | STRING | Name of the file on disk |
| originalName | STRING | Original name of the file as uploaded by the user |
| filePath | STRING | Path to the file on disk |
| fileSize | INTEGER | Size of the file in bytes |
| mimeType | STRING | MIME type of the file |
| entityType | STRING | Type of entity the document is associated with |
| entityId | INTEGER | ID of the entity the document is associated with |
| description | TEXT | Optional description of the document |
| tags | STRING | Optional comma-separated tags for the document |
| uploadedBy | INTEGER | ID of the user who uploaded the document |
| uploadedAt | DATE | Date and time the document was uploaded |

## File Storage Structure

Files are stored in a structured directory hierarchy:

```
/uploads
  /{entityType}
    /{entityId}
      /document-{timestamp}-{random}.ext
```

For example, a document for Shop ID 5 would be stored at:
```
/uploads/shop/5/document-1627384950123-123456789.pdf
```

This structure ensures:
- Clear organization of files by entity type and ID
- No file name collisions due to timestamp and random number
- Easy retrieval of files based on entity information

## API Endpoints

The document management system exposes the following RESTful API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/:entityType/:entityId/documents | Get all documents for an entity |
| GET | /api/:entityType/:entityId/documents/:documentId | Get a document by ID |
| POST | /api/:entityType/:entityId/documents | Upload documents for an entity |
| GET | /api/:entityType/:entityId/documents/:documentId/download | Download a document |
| DELETE | /api/:entityType/:entityId/documents/:documentId | Delete a document |

## File Upload Middleware

The file upload middleware uses Multer to handle multipart/form-data uploads with the following features:

- **Storage Configuration**: Configures where and how files are stored
- **File Filtering**: Restricts uploads to specific file types
- **File Size Limits**: Limits file size to 10MB
- **Error Handling**: Provides clear error messages for upload issues

## Security Considerations

The document management system implements several security measures:

1. **Authentication**: All document operations require authentication
2. **Authorization**: Users can only access documents they have permission to view
3. **File Type Validation**: Only allows specific file types to be uploaded
4. **File Size Limits**: Prevents upload of excessively large files
5. **Secure File Paths**: Uses non-predictable file names

## Integration with Other Modules

The document management functionality is designed to be integrated with other modules:

1. **Shop Rental Module**: Attach documents to shops and rent payments
2. **Apartment Rental Module**: Attach documents to apartments and bookings
3. **Water Bill Module**: Attach documents to water bills
4. **Current Bill Module**: Attach documents to electricity bills
5. **Expense Module**: Attach documents to expenses
6. **Reporting Module**: Include document links in reports

## Frontend Integration

The frontend will include the following components for document management:

1. **Document Upload Component**: A reusable component for uploading documents
2. **Document List Component**: A reusable component for displaying documents
3. **Document Preview Component**: A component for previewing documents
4. **Document Download Button**: A button for downloading documents

## Usage Examples

### Uploading Documents

```javascript
// Example: Uploading a document for a shop
const formData = new FormData();
formData.append('documents', file);
formData.append('description', 'Shop lease agreement');
formData.append('tags', 'lease,agreement,legal');

const response = await fetch('/api/shop/5/documents', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Retrieving Documents

```javascript
// Example: Getting all documents for a shop
const response = await fetch('/api/shop/5/documents', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data: documents } = await response.json();
```

### Downloading a Document

```javascript
// Example: Downloading a document
window.location.href = `/api/shop/5/documents/10/download?token=${token}`;
```

## Future Enhancements

Potential future enhancements to the document management system:

1. **Document Versioning**: Track multiple versions of the same document
2. **Document Preview**: Preview documents directly in the application
3. **Document Search**: Full-text search across document metadata and content
4. **Document Sharing**: Share documents with specific users or groups
5. **Document Expiration**: Set expiration dates for documents
6. **Document Templates**: Create and use document templates
7. **Bulk Operations**: Upload, download, or delete multiple documents at once
8. **Document Categories**: Categorize documents beyond entity associations
9. **Document Approval Workflow**: Implement approval workflows for documents
10. **Document Annotations**: Allow users to annotate documents