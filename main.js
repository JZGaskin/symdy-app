/**
 * Symdy Desktop — main process.
 *
 * Spawns pi in RPC mode and bridges communication between
 * the Electron renderer and the pi agent process.
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let piProcess = null;
let rpcBuffer = '';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 650,
    minWidth: 500,
    minHeight: 400,
    title: 'Symdy',
    backgroundColor: '#0a0a12',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarStyle: 'hiddenInset',
    frame: process.platform === 'darwin' ? true : true
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Start pi once window is ready
  mainWindow.webContents.on('did-finish-load', () => {
    startPi();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    stopPi();
  });
}

function startPi() {
  // Check if pi is installed
  const piPath = findPi();
  if (!piPath) {
    sendToRenderer({ type: 'error', message: 'pi is not installed. Install with: npm install -g @earendil-works/pi-coding-agent' });
    return;
  }

  try {
    piProcess = spawn(piPath, ['--mode', 'rpc', '--no-session'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, HOME: process.env.HOME }
    });

    // Parse stdout line by line (JSONL)
    piProcess.stdout.on('data', (data) => {
      rpcBuffer += data.toString();
      const lines = rpcBuffer.split('\n');
      rpcBuffer = lines.pop(); // keep incomplete line in buffer

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const event = JSON.parse(line);
          sendToRenderer(event);
        } catch (e) {
          // non-JSON output, might be logs
        }
      }
    });

    piProcess.stderr.on('data', (data) => {
      sendToRenderer({ type: 'log', message: data.toString().trim() });
    });

    piProcess.on('close', (code) => {
      sendToRenderer({ type: 'status', message: `pi exited (code ${code})` });
      piProcess = null;
      // Restart pi after a delay
      setTimeout(() => {
        if (mainWindow) startPi();
      }, 2000);
    });

    piProcess.on('error', (err) => {
      sendToRenderer({ type: 'error', message: `Failed to start pi: ${err.message}` });
      piProcess = null;
    });

    sendToRenderer({ type: 'status', message: 'Symdy connected' });
  } catch (e) {
    sendToRenderer({ type: 'error', message: `Error starting pi: ${e.message}` });
  }
}

function findPi() {
  // Try common locations
  const candidates = [
    'pi',
    '/usr/local/bin/pi',
    '/usr/bin/pi',
    path.join(process.env.HOME || '/root', '.npm-global/bin/pi'),
    path.join(process.env.HOME || '/root', 'node_modules/.bin/pi'),
    '/usr/lib/node_modules/.bin/pi',
  ];

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) return candidate;
      // Also try 'which'
      const { execSync } = require('child_process');
      return execSync(`which pi 2>/dev/null`, { encoding: 'utf-8' }).trim();
    } catch (e) {
      continue;
    }
  }

  // Try global npm bin
  try {
    const { execSync } = require('child_process');
    const npmBin = execSync('npm bin -g 2>/dev/null', { encoding: 'utf-8' }).trim();
    const piPath = path.join(npmBin, 'pi');
    if (fs.existsSync(piPath)) return piPath;
  } catch (e) {}

  return null;
}

function stopPi() {
  if (piProcess) {
    piProcess.kill('SIGTERM');
    setTimeout(() => {
      if (piProcess) piProcess.kill('SIGKILL');
    }, 3000);
  }
}

function sendToRenderer(data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('pi-event', data);
  }
}

// ── IPC Handlers ───────────────────────────────────────────────────────

ipcMain.handle('send-message', async (_event, message) => {
  if (!piProcess || piProcess.killed) {
    return { success: false, error: 'Symdy is not connected. Restart the app.' };
  }

  try {
    const rpcCommand = JSON.stringify({
      type: 'prompt',
      message: message
    }) + '\n';

    piProcess.stdin.write(rpcCommand);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('get-status', async () => {
  return {
    connected: piProcess !== null && !piProcess.killed,
    pid: piProcess ? piProcess.pid : null
  };
});

// ── App Lifecycle ──────────────────────────────────────────────────────

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  stopPi();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('before-quit', stopPi);
