# CreatorRadar AI

An AI-powered TikTok creator recruiting assistant. Discover, score, and manage creator leads — locally, privately, and without any TikTok automation.

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Install dependencies

```bash
npm install
```

> **Note:** `better-sqlite3` is a native module. On Windows you may need Visual Studio Build Tools. Run:
> ```bash
> npm install --global windows-build-tools
> ```

### Development

```bash
npm run dev
```

Starts Vite dev server and Electron together with hot reload.

### Build

```bash
npm run build
```

Compiles TypeScript and bundles the app.

### Package (installer)

```bash
# Windows EXE installer
npm run dist:win

# macOS DMG
npm run dist:mac

# Both
npm run dist
```

Output files are in the `release/` folder:
- `release/CreatorRadarAI-Setup.exe` (Windows)
- `release/CreatorRadarAI.dmg` (macOS)

---

## Configuration

On first launch, go to **Settings** and enter:

1. **Anthropic API Key** — from [console.anthropic.com](https://console.anthropic.com)
2. **Agency Name** and **Niche Focus** — used to personalize AI scoring
3. **Recruiter Name** — shown in the app header

Your API key is stored locally in the SQLite database at:
- **Windows:** `%APPDATA%\CreatorRadar AI\creatorradar.db`
- **macOS:** `~/Library/Application Support/CreatorRadar AI/creatorradar.db`

---

## App Icons

Place your icons in the `build/` folder before running `npm run dist`:

| File | Size | Platform |
|------|------|----------|
| `build/icon.ico` | 256×256 | Windows |
| `build/icon.icns` | 1024×1024 | macOS |
| `build/icon.png` | 512×512 | Linux / fallback |
| `build/dmg-background.png` | 540×380 | macOS DMG background |

---

## Project Structure

```
creatorradar-ai/
├── electron/           # Main process (Node.js)
│   ├── main.ts         # Electron entry
│   ├── preload.ts      # Context bridge
│   ├── db/             # SQLite schema + queries
│   └── ipc/            # IPC handler modules
├── src/                # Renderer process (React)
│   ├── App.tsx         # Router + layout
│   ├── pages/          # One folder per page
│   ├── components/     # Shared UI components
│   └── types/          # TypeScript types
├── build/              # App icons
├── docs/               # User guide
└── release/            # Built installers (git-ignored)
```

---

## Architecture Notes

- **No TikTok API** is used. Creators are added manually by pasting profile URLs.
- **Claude API** calls are made from the Electron main process only — never from the renderer. The API key is not accessible via DevTools.
- **SQLite** database is stored in the user's app data folder. It is never synced.
- **Excel export** uses SheetJS (xlsx) and triggers a native save dialog.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Desktop | Electron 29 |
| UI | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 |
| Database | SQLite via better-sqlite3 |
| AI | Anthropic Claude API |
| Excel | SheetJS (xlsx) |
| Installer | electron-builder |

---

## License

Private — for internal use only.
