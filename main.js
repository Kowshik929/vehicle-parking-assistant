const { app, BrowserWindow, ipcMain } = require('electron');
const WebSocket = require('ws');
const sqlite3 = require('sqlite3').verbose();

let mainWindow;

// Set up SQLite database
const db = new sqlite3.Database('./database.sqlite');
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY, userId INTEGER, date TEXT)");
});

// Create the main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  mainWindow.loadFile('index.html');
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Set up WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
  console.log('Client connected');
  ws.on('message', message => {
    console.log('received: %s', message);
    mainWindow.webContents.send('distance-data', message);
  });
});

ipcMain.on('authenticate-user', (event, username, password) => {
  db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
    if (err) {
      event.reply('auth-response', { success: false, message: 'Error occurred' });
    } else if (row) {
      event.reply('auth-response', { success: true, userId: row.id });
    } else {
      event.reply('auth-response', { success: false, message: 'Invalid credentials' });
    }
  });
});

ipcMain.on('register-user', (event, username, password) => {
  db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, password], function(err) {
    if (err) {
      event.reply('register-response', { success: false, message: 'Error occurred' });
    } else {
      event.reply('register-response', { success: true, userId: this.lastID });
    }
  });
});
