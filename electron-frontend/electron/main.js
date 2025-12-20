const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');

function createWindow() {
  const win = new BrowserWindow({

    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webviewTag: true,
    // Enable touch supporta
    touchSupport: true,
    },
  });

  win.loadURL('http://localhost:5173/pos'); // Vite default
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

ipcMain.handle('get-sys-info', () => {
  const hostname = os.hostname();
  return {
    hostname: hostname
  };
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
