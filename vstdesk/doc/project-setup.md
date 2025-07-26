# Rental & Expense Management App - Project Setup Guide

This guide provides step-by-step instructions for setting up the development environment and initializing the project structure for the Rental & Expense Management App.

## Prerequisites

Ensure you have the following installed on your development machine:

- Node.js (v14.x or later)
- npm (v6.x or later)
- Git

## 1. Setting Up the Project Structure

### 1.1 Create Project Directory

```bash
mkdir rental-expense-manager
cd rental-expense-manager
```

### 1.2 Initialize Git Repository

```bash
git init
echo "node_modules/" > .gitignore
echo "dist/" >> .gitignore
echo ".env" >> .gitignore
echo "*.sqlite" >> .gitignore
echo "uploads/*" >> .gitignore
```

## 2. Setting Up the Frontend (Vue.js)

### 2.1 Install Vue CLI

```bash
npm install -g @vue/cli
```

### 2.2 Create Vue Project

```bash
vue create frontend
```

When prompted, select the following options:
- Manually select features
- Choose: Babel, Router, Vuex, CSS Pre-processors, Linter
- Choose Vue version 3.x
- Use history mode for router: Yes
- Choose SCSS/SASS for CSS pre-processor
- Choose ESLint + Prettier for linter
- Choose Lint on save
- Place config in dedicated files
- Save as a preset for future projects: Optional

### 2.3 Install Additional Dependencies

```bash
cd frontend
npm install axios vue-chartjs chart.js vue-toast-notification vue-datepicker
npm install @fortawesome/fontawesome-free bootstrap
```

### 2.4 Configure Vue Project

Update `frontend/src/main.js` to include Bootstrap and FontAwesome:

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'vue-toast-notification/dist/theme-default.css'

createApp(App).use(store).use(router).mount('#app')
```

## 3. Setting Up the Backend (Express.js)

### 3.1 Create Backend Directory

```bash
cd ..
mkdir backend
cd backend
npm init -y
```

### 3.2 Install Backend Dependencies

```bash
npm install express cors body-parser sqlite3 sequelize jsonwebtoken bcrypt multer dotenv
npm install --save-dev nodemon
```

### 3.3 Create Basic Server Structure

Create the following directory structure:

```
backend/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
├── uploads/
│   ├── documents/
│   └── temp/
└── server.js
```

You can create these directories with:

```bash
mkdir -p config controllers middleware models routes utils uploads/documents uploads/temp
```

### 3.4 Create Basic Server File

Create `backend/server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Rental & Expense Management API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### 3.5 Create Environment Variables

Create `.env` file in the backend directory:

```
PORT=3000
JWT_SECRET=your_jwt_secret_key
DB_PATH=./database.sqlite
NODE_ENV=development
```

## 4. Setting Up the Database (SQLite)

### 4.1 Create Database Configuration

Create `backend/config/database.js`:

```javascript
const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || path.join(__dirname, '../database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

testConnection();

module.exports = sequelize;
```

### 4.2 Create User Model

Create `backend/models/User.js`:

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user'
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;
```

## 5. Integrating Frontend and Backend

### 5.1 Configure API Base URL in Frontend

Create `frontend/src/services/api.js`:

```javascript
import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for adding auth token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 5.2 Create Authentication Service

Create `frontend/src/services/auth.js`:

```javascript
import api from './api';

export default {
  login(credentials) {
    return api.post('/auth/login', credentials);
  },
  register(user) {
    return api.post('/auth/register', user);
  },
  getProfile() {
    return api.get('/auth/profile');
  },
  updateProfile(profile) {
    return api.put('/auth/profile', profile);
  }
};
```

## 6. Setting Up Electron for Desktop Packaging

### 6.1 Install Electron in the Root Directory

```bash
cd ..
npm init -y
npm install --save-dev electron electron-builder concurrently wait-on
```

### 6.2 Create Electron Main File

Create `main.js` in the root directory:

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // In development, use the live development server
  // In production, use the built files
  const startUrl = isDev
    ? 'http://localhost:8080'
    : `file://${path.join(__dirname, 'frontend/dist/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function startServer() {
  const serverPath = path.join(__dirname, 'backend/server.js');
  serverProcess = spawn('node', [serverPath]);

  serverProcess.stdout.on('data', (data) => {
    console.log(`Server: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`Server error: ${data}`);
  });

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });
}

app.on('ready', () => {
  startServer();
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
```

### 6.3 Update Package.json for Electron

Update the root `package.json`:

```json
{
  "name": "rental-expense-manager",
  "version": "1.0.0",
  "description": "Rental & Expense Management Application",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "dev": "concurrently \"cd backend && npm run dev\" \"cd frontend && npm run serve\" \"wait-on http://localhost:8080 && electron .\"",
    "build": "cd frontend && npm run build && cd ../backend && npm run build",
    "pack": "electron-builder --dir",
    "dist": "electron-builder"
  },
  "build": {
    "appId": "com.yourcompany.rentalexpensemanager",
    "productName": "Rental & Expense Manager",
    "directories": {
      "output": "dist"
    },
    "files": [
      "main.js",
      "frontend/dist/**/*",
      "backend/**/*",
      "!backend/node_modules/**/*",
      "!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}",
      "!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}",
      "!**/node_modules/*.d.ts",
      "!**/node_modules/.bin"
    ],
    "win": {
      "target": "nsis",
      "icon": "frontend/public/icon.ico"
    }
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "concurrently": "^7.0.0",
    "electron": "^17.0.0",
    "electron-builder": "^22.14.5",
    "wait-on": "^6.0.1"
  }
}
```

### 6.4 Update Backend Package.json

Update `backend/package.json` to include:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'No build step required for backend'"
  }
}
```

### 6.5 Update Frontend Package.json

Update `frontend/package.json` to include:

```json
{
  "scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "lint": "vue-cli-service lint"
  }
}
```

## 7. Running the Application in Development Mode

To run the application in development mode:

```bash
# In the root directory
npm run dev
```

This will:
1. Start the Express.js backend server
2. Start the Vue.js development server
3. Launch Electron pointing to the Vue.js development server

## 8. Building for Production

To build the application for production:

```bash
# In the root directory
npm run build
npm run dist
```

This will:
1. Build the Vue.js frontend
2. Package everything with Electron Builder
3. Create an installer in the `dist` directory

## Next Steps

After setting up the project structure, you can proceed with:

1. Implementing the database models as defined in the architecture document
2. Creating the API routes and controllers
3. Developing the Vue.js components for each module
4. Implementing the document upload functionality
5. Creating the reporting module

Refer to the architecture document for detailed specifications of each component.