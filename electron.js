// electron.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadURL('http://localhost:3000'); // Si estás desarrollando localmente

  // Si tienes el frontend empaquetado, carga el HTML empaquetado
  // win.loadFile(path.join(__dirname, 'frontend/dist/index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Ejecutar el backend cuando la app de Electron inicie
  exec('node backend/server-read.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al iniciar el backend: ${error}`);
      return;
    }
    console.log(`Backend Read iniciado: ${stdout}`);
  });

  // Ejecutar el backend cuando la app de Electron inicie
  exec('node backend/server-scan.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al iniciar el backend: ${error}`);
      return;
    }
    console.log(`Backend Scan iniciado: ${stdout}`);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
