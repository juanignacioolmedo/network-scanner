const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const http = require('http');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Intenta cargar el frontend desde el servidor local
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

  checkServer(); // Revisa si el servidor está listo
}

app.whenReady().then(() => {
  // Inicia el servidor de desarrollo del frontend
  exec('npm run start', { cwd: path.join(__dirname, 'frontend') }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al iniciar el frontend: ${error}`);
      return;
    }
    console.log(`Frontend iniciado: ${stdout}`);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Ejecuta los servidores del backend
  exec('node backend/server-read.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al iniciar server-read: ${error}`);
      return;
    }
    console.log(`Server-read iniciado: ${stdout}`);
  });

  exec('node backend/server-scan.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al iniciar server-scan: ${error}`);
      return;
    }
    console.log(`Server-scan iniciado: ${stdout}`);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
