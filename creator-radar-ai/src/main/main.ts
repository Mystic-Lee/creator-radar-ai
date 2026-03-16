import { app, BrowserWindow }                from 'electron';
import * as path                              from 'path';
import { initializeDatabase, closeDatabase } from './database/connection';
import { registerLeadHandlers }              from './ipc/leadHandlers';
import { registerSettingsHandlers }          from './ipc/settingsHandlers';
import { registerExportHandlers }            from './ipc/exportHandlers';
import { registerCampaignHandlers }          from './ipc/campaignHandlers';
import { registerReportHandlers }            from './ipc/reportHandlers';
import { registerDiscoveryHandlers }         from './ipc/discoveryHandlers';
import { registerDuplicateDetectionHandlers }from './ipc/duplicateDetection';
import { registerQuickReviewHandlers }       from './ipc/quickReviewHandlers';

const isDev = process.env.NODE_ENV === 'development';
let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1440, height: 900, minWidth: 1100, minHeight: 700,
    title: 'CreatorRadar AI',
    backgroundColor: '#0f172a',
    show: false,
    icon: path.join(__dirname, '../../build/creatorradar-icon.png'),
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
      sandbox:          false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => { mainWindow?.show(); mainWindow?.focus(); });
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  initializeDatabase();
  registerLeadHandlers();
  registerSettingsHandlers();
  registerExportHandlers();
  registerCampaignHandlers();
  registerReportHandlers();
  registerDiscoveryHandlers();
  registerDuplicateDetectionHandlers();
  registerQuickReviewHandlers();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('will-quit', () => { closeDatabase(); });
process.on('uncaughtException', (err) => { console.error('[main] Uncaught:', err); });
