// scripts/build-installer.js
// Single-command installer build with pre-flight checks.
const { spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const C    = { reset:'\x1b[0m', bold:'\x1b[1m', red:'\x1b[31m', green:'\x1b[32m', yellow:'\x1b[33m', cyan:'\x1b[36m' };
const log  = m => console.log(`${C.cyan}[build]${C.reset} ${m}`);
const ok   = m => console.log(`${C.green}  ✅${C.reset}  ${m}`);
const warn = m => console.log(`${C.yellow}  ⚠️ ${C.reset}  ${m}`);
const fail = m => console.error(`${C.red}  ❌${C.reset}  ${m}`);
const exists = p => fs.existsSync(path.join(ROOT, p));
const fsize  = p => { try { return fs.statSync(path.join(ROOT,p)).size; } catch { return 0; } };

function run(cmd, label) {
  log(label || cmd);
  const r = spawnSync(cmd, { cwd:ROOT, shell:true, stdio:'inherit', env:{...process.env,NODE_ENV:'production'} });
  if (r.status !== 0) { fail(`Command failed: ${cmd}`); process.exit(r.status||1); }
}

async function main() {
  console.log(`\n${C.bold}${C.cyan}  CreatorRadar AI — Windows Installer Builder${C.reset}`);
  console.log(`  ${'─'.repeat(48)}\n`);

  // Step 1 — Pre-flight
  log('Step 1/6 — Pre-flight checks');
  if (parseInt(process.versions.node) < 18) { fail('Node.js 18+ required'); process.exit(1); }
  ok(`Node.js ${process.versions.node}`);
  if (!exists('node_modules')) { fail('node_modules missing — run: npm install'); process.exit(1); }
  ok('node_modules present');
  try { require(path.join(ROOT,'node_modules','better-sqlite3')); ok('better-sqlite3 OK'); }
  catch { fail('better-sqlite3 failed — run: npm run postinstall'); process.exit(1); }
  if (!exists('build/creatorradar-icon.png') || !exists('build/creatorradar-icon.ico')) {
    warn('Icons missing — running setup...'); run('npm run setup','Creating icons');
  }
  ok('Icon files present');
  if (fsize('build/creatorradar-icon.ico') < 10000) warn('ICO is a placeholder — replace before shipping');
  if (!exists('build/installer-extras.nsh')) {
    fs.writeFileSync(path.join(ROOT,'build','installer-extras.nsh'), '; placeholder\n');
  }
  ok('NSIS extras present');
  console.log('');

  // Step 2 — Build main
  log('Step 2/6 — Compiling main process');
  run('npm run build:main','tsc -p tsconfig.main.json');
  if (!exists('dist/main/main.js') || !exists('dist/main/preload.js')) { fail('Compilation output missing'); process.exit(1); }
  ok('main.js + preload.js compiled');
  console.log('');

  // Step 3 — Build renderer
  log('Step 3/6 — Building renderer (Vite)');
  run('npm run build:renderer','vite build');
  if (!exists('dist/renderer/index.html')) { fail('Renderer build missing index.html'); process.exit(1); }
  ok('Renderer built → dist/renderer/');
  console.log('');

  // Step 4 — Smoke test
  log('Step 4/6 — Export smoke test');
  run('npm run smoke-test','Excel export smoke test');
  ok('Export pipeline verified');
  console.log('');

  // Step 5 — electron-builder
  log('Step 5/6 — Running electron-builder (2-5 minutes)...');
  run('electron-builder --win --config electron-builder.yml','electron-builder --win');
  console.log('');

  // Step 6 — Verify
  log('Step 6/6 — Verifying output');
  const outDir = path.join(ROOT,'dist-installer');
  if (!fs.existsSync(outDir)) { fail('dist-installer/ not found'); process.exit(1); }
  const exes = fs.readdirSync(outDir).filter(f => f.endsWith('.exe'));
  if (!exes.length) { fail('No .exe found in dist-installer/'); process.exit(1); }
  const exePath = path.join(outDir, exes[0]);
  const sizeMb  = (fs.statSync(exePath).size / 1024 / 1024).toFixed(1);
  ok(`Installer: ${exes[0]} (${sizeMb} MB)`);

  console.log(`\n  ${'═'.repeat(48)}`);
  console.log(`\n  ${C.bold}${C.green}✅ Build Complete!${C.reset}\n`);
  console.log(`  File:     ${exes[0]}`);
  console.log(`  Size:     ${sizeMb} MB`);
  console.log(`  Location: ${exePath}`);
  console.log(`\n  The installer will:`);
  console.log(`    • Show a multi-step setup wizard`);
  console.log(`    • Install to Program Files\\CreatorRadar AI`);
  console.log(`    • Create Desktop shortcut`);
  console.log(`    • Create Start Menu entry`);
  console.log(`    • Add entry to Add/Remove Programs`);
  console.log(`    • Optionally launch the app after install\n`);
}

main().catch(err => { fail(`Unexpected error: ${err.message}`); process.exit(1); });
