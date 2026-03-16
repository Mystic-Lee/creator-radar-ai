# CreatorRadar AI

Creator Recruiting Assistant for Windows — Electron + React + SQLite

## ⚠️ Important Notice

> This software **never sends messages automatically**.
> All DM drafts must be manually copied and sent by the recruiter.

## Quick Start (Windows)

```bash
# 1. Install dependencies + compile better-sqlite3
npm install

# 2. Create placeholder icons
npm run setup

# 3. Verify setup
npm run verify

# 4. Start development mode
npm run dev

# 5. Build Windows installer
npm run package
# Output: dist-installer/CreatorRadar-AI-Setup-1.0.0.exe
```

## Prerequisites

- **Windows 10/11 64-bit** (build target)
- **Node.js 18 LTS** or 20 LTS: https://nodejs.org
- **Visual Studio Build Tools** (for better-sqlite3): https://visualstudio.microsoft.com/downloads/
  - Select workload: "Desktop development with C++"

## Installer Features

- Multi-step NSIS wizard (not silent)
- Installs to `Program Files\CreatorRadar AI`
- Desktop shortcut + Start Menu entry
- Add/Remove Programs entry
- Windows 10+ check during install
- Optional "Run after install" checkbox
- Preserves user data on uninstall

## Data Storage

All data stored locally at `%APPDATA%\CreatorRadar AI\database.sqlite`
No internet connection required.

## Features

- **20 sample creator leads** pre-loaded on first launch
- **Triple scoring system** — Recruit Score, Recruitability Score, Growth Potential Score
- **Priority Tiers 1–4** with colour coding
- **Quick Review Mode** — review 50–100 creators in minutes with keyboard shortcuts (H/S/K/N/O)
- **Saved Search Presets** — save and pin filter combinations for instant reuse
- **DM Generator** — 9 tone options, 5 variants per creator (never sends automatically)
- **Excel Export (.xlsx)** — styled, filtered, with summary tab
- **Campaign Management** — track outreach by campaign
- **Reports** — campaign, niche, and recruiter performance charts
