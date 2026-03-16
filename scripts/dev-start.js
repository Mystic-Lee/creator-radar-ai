// scripts/dev-start.js
const { spawn } = require('child_process');
const http      = require('http');
const path      = require('path');
const fs        = require('fs');
const ROOT      = path.join(__dirname, '..');
const C         = { reset:'\x1b[0m', cyan:'\x1b[36m', green:'\x1b[32m', yellow:'\x1b[33m' };
const log = (t,m) => console.log(`${C.cyan}[${t}]${C.reset} ${m}`);
const ok  = (t,m) => console.log(`${C.green}[${t}]${C.reset} ${m}`);

function waitPort(port, timeout=45000) {
  return new Promise((res,rej) => {
    const start = Date.now();
    const iv = setInterval(() => {
      if (Date.now()-start > timeout) { clearInterval(iv); rej(new Error('timeout')); return; }
      const r = http.get(`http://localhost:${port}`, s => { clearInterval(iv); s.destroy(); res(); });
      r.on('error', ()=>{}); r.end();
    }, 500);
  });
}

function waitFile(p, timeout=45000) {
  return new Promise((res,rej) => {
    const start = Date.now();
    const iv = setInterval(() => {
      if (Date.now()-start > timeout) { clearInterval(iv); rej(new Error('timeout')); return; }
      if (fs.existsSync(p)) { clearInterval(iv); res(); }
    }, 500);
  });
}

async function main() {
  console.log(`\n${C.cyan}CreatorRadar AI — Development Mode${C.reset}\n`);
  const mainJs = path.join(ROOT,'dist','main','main.js');
  const npx    = /^win/.test(process.platform) ? 'npx.cmd' : 'npx';

  if (!fs.existsSync(mainJs)) {
    log('setup','First run — compiling main process...');
    const c = spawn(npx,['tsc','-p','tsconfig.main.json'],{cwd:ROOT,stdio:'inherit',shell:false});
    await new Promise((res,rej) => c.on('close', code => code===0 ? res() : rej(new Error(`tsc exit ${code}`))));
    ok('setup','Main process compiled');
  }

  const vite = spawn(npx,['vite','--config','vite.renderer.config.ts'],{cwd:ROOT,stdio:'inherit',shell:false,env:{...process.env,NODE_ENV:'development'}});
  vite.on('error', e => console.error('vite error',e.message));

  const tsc = spawn(npx,['tsc','-p','tsconfig.main.json','--watch','--preserveWatchOutput'],{cwd:ROOT,stdio:'inherit',shell:false,env:{...process.env,NODE_ENV:'development'}});
  tsc.on('error', e => console.error('tsc error',e.message));

  log('wait','Waiting for Vite port 5173...');
  try { await waitPort(5173,45000); ok('wait','Vite ready'); } catch {}
  log('wait','Waiting for main.js...');
  try { await waitFile(mainJs,45000); ok('wait','main.js ready'); } catch {}
  await new Promise(r => setTimeout(r,1500));

  const eBin = /^win/.test(process.platform) ? 'electron.cmd' : 'electron';
  const electron = spawn(
    path.join(ROOT,'node_modules','.bin',eBin), ['.'],
    {cwd:ROOT,stdio:'inherit',shell:false,env:{...process.env,NODE_ENV:'development',ELECTRON_IS_DEV:'1'}}
  );
  electron.on('close', code => { vite.kill(); tsc.kill(); process.exit(code||0); });
  process.on('SIGINT', () => { electron.kill(); vite.kill(); tsc.kill(); process.exit(0); });
}

main().catch(err => { console.error('dev-start fatal:', err.message); process.exit(1); });
