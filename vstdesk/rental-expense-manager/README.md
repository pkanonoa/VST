# Rental & Expense Management App

A desktop application for managing rental properties (shops and apartments), utility bills, and expenses. This application is designed specifically for PC use and provides comprehensive management tools for property owners.

## Features

- **Dashboard**: Overview of monthly rent collected/expected, pending bills, utility status, and expenses
- **Shop Rental Management**: Track shop rentals, payments, and documents
- **Apartment Rental Management**: Manage apartment bookings with check-in/check-out tracking
- **Water Bill Management**: Track water bills, meter readings, and allocate costs
- **Current Bill (Electricity) Management**: Track electricity bills, meter readings, and allocate costs
- **External Expenses Management**: Record and track external expenses
- **Reporting**: Generate monthly and annual reports with visualizations
- **Document Management**: Upload, preview, and manage documents within each module
- **Search and Filtering**: Comprehensive search and filter capabilities across all modules

## Technology Stack

- **Frontend**: Vue.js with HTML, CSS
- **Backend**: Express.js
- **Database**: SQLite
- **Desktop Packaging**: Electron

## Prerequisites

- Node.js (v14.x or later)
- npm (v6.x or later)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/rental-expense-manager.git
   cd rental-expense-manager
   ```

2. Install dependencies:
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. Set up environment variables:
   ```bash
   # Create .env file in the backend directory
   cd backend
   cp .env.example .env
   # Edit .env file with your configuration
   cd ..
   ```

## Development

1. Start the development server:
   ```bash
   npm run dev
   ```

   This will:
   - Start the Express.js backend server
   - Start the Vue.js development server
   - Launch Electron pointing to the Vue.js development server

2. Build the application:
   ```bash
   npm run build
   ```

3. Package the application:
   ```bash
   npm run dist
   ```

## Project Structure

```
rental-expense-manager/
├── frontend/               # Vue.js frontend application
│   ├── public/             # Static assets
│   └── src/                # Source code
│       ├── assets/         # Images, fonts, etc.
│       ├── components/     # Vue components
│       ├── views/          # Vue views/pages
│       ├── router/         # Vue Router configuration
│       ├── store/          # Vuex store
│       ├── services/       # API services
│       └── utils/          # Utility functions
├── backend/                # Express.js backend application
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Express middleware
│   ├── models/             # Data models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   └── uploads/            # Uploaded files
├── doc/                    # Documentation
├── main.js                 # Electron main process
└── package.json            # Project configuration
```

## License

This project is licensed under the MIT License.