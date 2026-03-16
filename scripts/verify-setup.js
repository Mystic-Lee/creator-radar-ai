// scripts/verify-setup.js
const fs   = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const checks = [
  { name:'Node.js 18+',         check:()=>parseInt(process.versions.node)>=18,        fix:'Install Node.js 18 LTS: https://nodejs.org' },
  { name:'node_modules exists', check:()=>fs.existsSync(path.join(ROOT,'node_modules')), fix:'Run: npm install' },
  { name:'better-sqlite3',      check:()=>{try{require(path.join(ROOT,'node_modules','better-sqlite3'));return true;}catch{return false;}}, fix:'Run: npm run postinstall' },
  { name:'build/ directory',    check:()=>fs.existsSync(path.join(ROOT,'build')),         fix:'Run: npm run setup' },
  { name:'PNG icon',            check:()=>fs.existsSync(path.join(ROOT,'build','creatorradar-icon.png')), fix:'Run: npm run setup' },
  { name:'ICO icon',            check:()=>fs.existsSync(path.join(ROOT,'build','creatorradar-icon.ico')), fix:'Run: npm run setup' },
  { name:'installer-extras.nsh',check:()=>fs.existsSync(path.join(ROOT,'build','installer-extras.nsh')), fix:'Restore from project source' },
  { name:'tsconfig.main.json',  check:()=>fs.existsSync(path.join(ROOT,'tsconfig.main.json')),            fix:'Restore from project source' },
  { name:'src/main/main.ts',    check:()=>fs.existsSync(path.join(ROOT,'src','main','main.ts')),           fix:'Restore from project source' },
  { name:'src/renderer/App.tsx',check:()=>fs.existsSync(path.join(ROOT,'src','renderer','App.tsx')),       fix:'Restore from project source' },
  { name:'src/shared/types.ts', check:()=>fs.existsSync(path.join(ROOT,'src','shared','types.ts')),        fix:'Restore from project source' },
  { name:'.eslintrc.json',      check:()=>fs.existsSync(path.join(ROOT,'.eslintrc.json')),                 fix:'Restore from project source' },
];
let all = true;
console.log('\n🔍 CreatorRadar AI — Setup Verification\n' + '='.repeat(50));
for (const {name,check,fix} of checks) {
  let ok=false; try{ok=check();}catch{}
  console.log(`${ok?'✅':'❌'}  ${name}`);
  if (!ok) { console.log(`     Fix: ${fix}`); all=false; }
}
console.log('='.repeat(50));
if (all) { console.log('\n✅ All checks passed. Run: npm run dev\n'); }
else     { console.log('\n⚠️  Some checks failed. Follow instructions above.\n'); process.exit(1); }
