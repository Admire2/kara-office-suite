const { app, BrowserWindow } = require('electron');
function create() {
  const w = new BrowserWindow({ width: 1500, height: 950, title: 'Kara Office - Sovereign Suite', autoHideMenuBar: true });
  w.loadURL('http://localhost:5173');
}
app.whenReady().then(create);
app.on('window-all-closed', () => app.quit());
