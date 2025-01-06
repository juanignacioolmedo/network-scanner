const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const http = require('http');
const fs = require('fs');
//const serve = require('serve');
const express = require('express');  // Import express
const net = require('net'); // Required for checking port availability

let frontendStarted = false;
let backendStarted = false;

// Check if a port is in use
function isPortInUse(port, callback) {
  const server = net.createServer()
    .once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        callback(true); // Port is in use
      } else {
        callback(false); // Some other error
      }
    })
    .once('listening', () => {
      server.close();
      callback(false); // Port is available
    })
    .listen(port);
}

function startBackEnd() {
  // Check if backend port is in use (port 3002)
  isPortInUse(3002, (inUse) => {
    if (inUse) {
      console.log('Backend port 3002 is already in use. Skipping backend startup.');
    } else {
      // Start the backend server if not already running
      if (!backendStarted) {
        console.warn('Ahora corro el backend')
        exec('npm run start-backend &', (error, stdout, stderr) => {
          if (error) {
            console.error(stdout);
            console.error(stderr);
            console.error(`Error al iniciar el backend: ${error}`);
            return;
          }
          console.log(`Backend iniciado: ${stdout}`);
        });
        backendStarted = true;
      } else {
        console.log('Backend server is already running.');
      }
    }
  });
}

function createWindow() {
  const isProduction = process.env.NODE_ENV !== 'development';

  if (isProduction) {
    // In production, use Express to serve the React build folder
    const server = express();
    const buildPath = path.join(__dirname, '../build');

    // Serve static files from the React build folder
    server.use(express.static(buildPath));

    server.listen(41354, () => {
      console.log('React app is now being served at http://localhost:41354');
      
      // Create the Electron window
      const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          nodeIntegration: true,
        },
      });

      // Load the app from the Express server
      win.loadURL('http://localhost:41354');
    });
  } else {
    // In development, load the app from React's dev server (localhost:3000)
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
      },
    });
    if (!frontendStarted) {
      exec('npm run start-frontend', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error al iniciar el frontend: ${error}`);
          return;
        }
        console.log(`Frontend iniciado: ${stdout}`);
      });
      frontendStarted = true;
      win.loadURL('http://localhost:3000');
    }
    const checkServer = () => {
      http.get('http://localhost:3000', (res) => {
        if (res.statusCode === 200) {
          win.loadURL('http://localhost:3000');
        } else {
          setTimeout(checkServer, 500);
        }
      }).on('error', () => {
        setTimeout(checkServer, 500);
      });
    };
    checkServer();
  }
}

// When Electron has finished initializing, create the window
app.whenReady().then(() => {
  startBackEnd();
  // Create the Electron window
  createWindow();
});

// Quit when all windows are closed (except for macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }

});
