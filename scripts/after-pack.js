// scripts/after-pack.js
const path = require('path');
const fs   = require('fs');
exports.default = async function afterPack(context) {
  const { appOutDir, electronPlatformName, packager } = context;
  const name    = packager.appInfo.productName;
  const version = packager.appInfo.version;
  console.log(`\n[after-pack] ${name} v${version} — ${electronPlatformName}`);
  console.log(`[after-pack] Output: ${appOutDir}`);
  const resDir = path.join(appOutDir,'resources');
  if (fs.existsSync(path.join(resDir,'app.asar'))) {
    const sz = fs.statSync(path.join(resDir,'app.asar')).size;
    console.log(`[after-pack] ✅ app.asar: ${(sz/1024/1024).toFixed(1)} MB`);
  } else if (fs.existsSync(path.join(resDir,'app'))) {
    console.log('[after-pack] ✅ app/ directory found');
  }
  const exes = fs.existsSync(appOutDir) ? fs.readdirSync(appOutDir).filter(f=>f.endsWith('.exe')) : [];
  if (exes.length) console.log(`[after-pack] ✅ Executable: ${exes[0]}`);
  console.log('[after-pack] Done.\n');
};
