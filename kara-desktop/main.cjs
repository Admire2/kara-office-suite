const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({ width: 1500, height: 950, title: 'Kara Office - Sovereign Suite', autoHideMenuBar: true, show: false, icon: path.join(__dirname, 'build', 'icon.ico'), webPreferences: { nodeIntegration: false, contextIsolation: true } });
  const logFile = path.join(app.getPath('userData'), 'kara-desktop.log');
  const log = (m) => { try { fs.appendFileSync(logFile, new Date().toISOString() + ' ' + m + '\n'); } catch (e) {} };
  win.webContents.on('console-message', (e, l, message) => log('RENDERER: ' + message));
  win.webContents.on('did-fail-load', (e, c, d, u) => log('FAIL-LOAD: ' + c + ' ' + d + ' ' + u));
  win.webContents.on('did-finish-load', () => log('LOAD-OK: ' + win.webContents.getURL()));
  const splash = new BrowserWindow({ width: 420, height: 260, frame: false, transparent: true, alwaysOnTop: true, resizable: false });
  splash.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent('<body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#312e81;font-family:Segoe UI,sans-serif"><div style="text-align:center;color:#fff"><div style="font-size:48px;font-weight:800">Kara Office</div><div style="margin-top:6px;color:#c7d2fe;font-size:13px">Sovereign Suite v1.1 - loading your private workspace...</div></div></body>'));
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) { win.loadURL('http://localhost:5173'); } else { win.loadFile(path.join(__dirname, 'renderer', 'index.html')); }
  win.once('ready-to-show', () => { try { splash.close(); } catch (e) {} win.show(); });
  setTimeout(() => { try { splash.close(); } catch (e) {} win.show(); }, 6000);
  if (process.env.KARA_DEBUG === '1') { win.webContents.openDevTools(); }
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());