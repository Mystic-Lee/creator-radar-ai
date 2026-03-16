const { defineConfig } = require("electron-builder");

module.exports = defineConfig({
  appId: "com.creatorradar.ai",
  productName: "CreatorRadar AI",
  copyright: "Copyright © 2024 CreatorRadar AI",

  directories: {
    output: "release",
    buildResources: "build",
  },

  files: [
    "dist/**/*",
    "dist-electron/**/*",
    "!node_modules/**/*",
  ],

  extraMetadata: {
    main: "dist-electron/main.js",
  },

  // Windows installer
  win: {
    target: [
      {
        target: "nsis",
        arch: ["x64"],
      },
    ],
    icon: "build/icon.ico",
    artifactName: "CreatorRadarAI-Setup.exe",
  },

  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    installerIcon: "build/icon.ico",
    uninstallerIcon: "build/icon.ico",
    installerHeaderIcon: "build/icon.ico",
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "CreatorRadar AI",
    runAfterFinish: true,
    deleteAppDataOnUninstall: false,
  },

  // macOS DMG
  mac: {
    target: [
      {
        target: "dmg",
        arch: ["x64", "arm64"],
      },
    ],
    icon: "build/icon.icns",
    artifactName: "CreatorRadarAI.dmg",
    category: "public.app-category.productivity",
    darkModeSupport: true,
  },

  dmg: {
    title: "CreatorRadar AI",
    background: "build/dmg-background.png",
    window: {
      width: 540,
      height: 380,
    },
    contents: [
      { x: 150, y: 190, type: "file" },
      { x: 390, y: 190, type: "link", path: "/Applications" },
    ],
  },

  // Auto-update config (stubbed for v1, ready to activate)
  publish: null,
});
