import { app, BrowserWindow, shell, ipcMain } from "electron";
import path from "path";
import { initDatabase } from "./db/database";
import { registerCreatorHandlers } from "./ipc/creators";
import { registerAIHandlers } from "./ipc/ai";
import { registerExportHandlers } from "./ipc/export";
import { registerSettingsHandlers } from "./ipc/settings";

// Suppress GPU sandbox warning on some Linux/Windows configs
app.commandLine.appendSwitch("no-sandbox");

const isDev = process.env.NODE_ENV === "development";
const VITE_DEV_SERVER_URL = "http://localhost:5173";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: "CreatorRadar AI",
    // Frameless for custom title bar on Windows (optional — set to true later)
    frame: true,
    backgroundColor: "#030712", // gray-950 — prevents flash on load
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // Required for better-sqlite3 in preload context
    },
    icon: path.join(__dirname, "../build/icon.png"),
    show: false, // Show only when ready to avoid blank flash
  });

  // Show when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
    if (isDev) {
      mainWindow?.webContents.openDevTools({ mode: "detach" });
    }
  });

  // Load the app
  if (isDev && VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // Open external links in the default browser (not in Electron)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://") || url.startsWith("http://")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  // Initialize SQLite database
  initDatabase();

  // Register all IPC handlers
  registerCreatorHandlers(ipcMain);
  registerAIHandlers(ipcMain);
  registerExportHandlers(ipcMain);
  registerSettingsHandlers(ipcMain);

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on("web-contents-created", (_, contents) => {
  contents.on("will-navigate", (event, url) => {
    // Allow only the dev server or local file
    if (!isDev && !url.startsWith("file://")) {
      event.preventDefault();
    }
  });
});
