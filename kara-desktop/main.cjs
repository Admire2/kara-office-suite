const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({ width: 1500, height: 950, title: 'Kara Office - Sovereign Suite', autoHideMenuBar: true, webPreferences: { nodeIntegration: false, contextIsolation: true } });
  const logFile = path.join(app.getPath('userData'), 'kara-desktop.log');
  const log = (m) => { try { fs.appendFileSync(logFile, new Date().toISOString() + ' ' + m + '\n'); } catch (e) {} };
  win.webContents.on('console-message', (e, level, message) => log('RENDERER: ' + message));
  win.webContents.on('did-fail-load', (e, code, desc, url) => log('FAIL-LOAD: ' + code + ' ' + desc + ' ' + url));
  win.webContents.on('did-finish-load', () => log('LOAD-OK: ' + win.webContents.getURL()));
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) { win.loadURL('http://localhost:5173'); } else {
    const indexPath = path.join(__dirname, 'renderer', 'index.html');
    log('Loading: ' + indexPath + ' exists=' + fs.existsSync(indexPath));
    win.loadFile(indexPath);
  }
  if (process.env.KARA_DEBUG === '1') { win.webContents.openDevTools(); }
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());