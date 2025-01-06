const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const http = require('http');
const fs = require('fs');
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

// Function to create the main window
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true, // Optional, depends on your use case
    },
  });

  // In development, load from localhost:3000
  if (process.env.NODE_ENV === 'development') {
    if (!frontendStarted) {
      exec('npm run start-frontend', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error al iniciar el frontend: ${error}`);
          return;
        }
        console.log(`Frontend iniciado: ${stdout}`);
      });
      frontendStarted = true;
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
  } else {
    // In production, load the build folder
    console.warn(__dirname)
    const loadURL = path.join(__dirname, '../build/index.html');
    if (fs.existsSync(loadURL)) {
      console.warn('Existe el archivo')
    }
    console.warn(loadURL);
    win.loadFile(loadURL);
  }
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
