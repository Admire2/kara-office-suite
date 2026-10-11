const { app, BrowserWindow } = require('electron');
const path = require('path');
function createWindow() {
  const win = new BrowserWindow({ width: 1500, height: 950, title: 'Kara Office', autoHideMenuBar: true, show: false, icon: path.join(__dirname, 'build', 'icon.ico'), webPreferences: { nodeIntegration: false, contextIsolation: true } });
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) { win.loadURL('http://localhost:5173'); } 
  else { win.loadFile(path.join(__dirname, 'renderer', 'index.html')); }
  win.once('ready-to-show', () => win.show());
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());