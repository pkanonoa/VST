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
│   ├── architecture.md     # System architecture
│   ├── module-implementation-guide.md # Module implementation details
│   ├── project-setup.md    # Project setup guide
│   ├── testing-deployment-strategy.md # Testing and deployment strategy
│   └── ui-design-guidelines.md # UI/UX design guidelines
└── main.js                 # Electron main process
```

## Documentation

- [Architecture](doc/architecture.md): System architecture, database schema, and component structure
- [Project Setup Guide](doc/project-setup.md): Step-by-step instructions for setting up the development environment
- [Module Implementation Guide](doc/module-implementation-guide.md): Detailed implementation guidance for each module
- [UI Design Guidelines](doc/ui-design-guidelines.md): Design principles, component styles, and interaction patterns
- [Testing and Deployment Strategy](doc/testing-deployment-strategy.md): Testing approach, quality assurance, and deployment strategy

## Getting Started

### Prerequisites

- Node.js (v14.x or later)
- npm (v6.x or later)
- Git

### Installation

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

4. Run the application in development mode:
   ```bash
   npm run dev
   ```

### Development Workflow

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Make changes to the code
3. Test your changes
4. Commit your changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

5. Push your changes:
   ```bash
   git push origin main
   ```

### Building for Production

1. Build the application:
   ```bash
   npm run build
   ```

2. Package the application:
   ```bash
   npm run dist
   ```

3. The packaged application will be available in the `dist` directory

## Testing

1. Run unit tests:
   ```bash
   npm run test:unit
   ```

2. Run integration tests:
   ```bash
   npm run test:integration
   ```

3. Run end-to-end tests:
   ```bash
   npm run test:e2e
   ```

## Deployment

See the [Testing and Deployment Strategy](doc/testing-deployment-strategy.md) document for detailed deployment instructions.

## Contributing

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Commit your changes:
   ```bash
   git commit -m "Add some feature"
   ```

4. Push to the branch:
   ```bash
   git push origin feature/your-feature-name
   ```

5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.