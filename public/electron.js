const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const http = require('http');
const fs = require('fs');
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

function createWindow() {
  const isProduction = process.env.NODE_ENV !== 'development';
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  if (isProduction) {
    // In production, use Express to serve the React build folder
    const server = express();
    const buildPath = path.join(__dirname, '../build');

    // Serve static files from the React build folder
    server.use(express.static(buildPath));

    server.listen(41354, () => {
      console.log('React app is now being served at http://localhost:41354');
      // Load the app from the Express server
      win.loadURL('http://localhost:41354');
    });
  } else {    
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
  }
  win.on('closed', handleAppClose);
}

// When Electron has finished initializing, create the window
app.whenReady().then(() => {

  // Check if backend port is in use (port 3002)
  isPortInUse(3002, (inUse) => {
    if (inUse) {
      console.warn('Clear port 3002')
    } else {
      // Start the backend server if not already running
      startBackEnd();
      // Create the Electron window
      createWindow();
    }
  });  
});

// Function to find the process on a specific port and kill it
function handleAppClose() {
  killProcessOnPort(3002);
}

function killProcessOnPort(port) {
  let command;
  
  // Determine the correct command based on the platform
  if (process.platform === 'win32') {
    // Windows command to get PID from port and kill the process
    command = `netstat -ano | findstr :${port}`;
  } else if (process.platform === 'darwin' || process.platform === 'linux') {
    // macOS/Linux command to get PID from port
    command = `lsof -t -i :${port}`;
  }

  // Run the command to get the PID
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error finding process on port ${port}:`, error);
      return;
    }

    if (stderr) {
      console.error(`Error finding process on port ${port}:`, stderr);
      return;
    }

    // Check if any PID is returned
    const pid = stdout.trim();
    if (pid) {
      killProcess(pid);
    } else {
      console.log(`No process found on port ${port}`);
    }
  });
}

// Function to kill the process
function killProcess(pid) {
  let killCommand;

  if (process.platform === 'win32') {
    // Windows command to kill the process by PID
    killCommand = `taskkill /PID ${pid} /F`;
  } else {
    // macOS/Linux command to kill the process by PID
    killCommand = `kill -9 ${pid}`;
  }

  // Run the kill command
  exec(killCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error killing process with PID ${pid}:`, error);
    } else {
      console.log(`Killed process with PID ${pid}`);
    }
  });
}

// Quit when all windows are closed (except for macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }

});
