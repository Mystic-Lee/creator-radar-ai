// scripts/smoke-test-export.js
const path = require('path');
const fs   = require('fs');
const ROOT = path.join(__dirname,'..');
const OUT  = path.join(ROOT,'dist-test','smoke-test-export.xlsx');
async function run() {
  console.log('\n🔬 Export Smoke Test\n' + '='.repeat(40));
  let ExcelJS;
  try { ExcelJS = require(path.join(ROOT,'node_modules','exceljs')); console.log('✅ ExcelJS found'); }
  catch { console.error('❌ ExcelJS not found — run: npm install'); process.exit(1); }
  if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT),{recursive:true});
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Creator Leads',{views:[{state:'frozen',ySplit:1}]});
  ws.columns = [
    {header:'Username',key:'username',width:22},
    {header:'Niche',key:'niche',width:18},
    {header:'Followers',key:'followers',width:14},
    {header:'Recruit Score',key:'recruit_score',width:16},
    {header:'Status',key:'status',width:18},
  ];
  const hdr = ws.getRow(1);
  hdr.font={bold:true,color:{argb:'FFFFFFFF'},size:11};
  hdr.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF4338CA'}};
  ws.autoFilter={from:{row:1,column:1},to:{row:1,column:5}};
  const rows=[
    {username:'glowwithamara',niche:'Beauty',followers:48200,recruit_score:84,status:'New Lead'},
    {username:'pixelknight99',niche:'Gaming',followers:67500,recruit_score:82,status:'High Priority'},
    {username:'dailywithdenise',niche:'Lifestyle',followers:31200,recruit_score:80,status:'Ready to Contact'},
  ];
  for (const r of rows) ws.addRow(r);
  const sum = wb.addWorksheet('Summary');
  sum.getCell('A1').value='CreatorRadar AI — Smoke Test';
  sum.getCell('A1').font={bold:true,size:14,color:{argb:'FF4338CA'}};
  sum.getCell('A3').value='Total Leads'; sum.getCell('B3').value=rows.length;
  await wb.xlsx.writeFile(OUT);
  const sz = fs.statSync(OUT).size;
  if (sz < 1000) { console.error('❌ Output file too small'); process.exit(1); }
  console.log(`✅ File written: ${(sz/1024).toFixed(1)} KB`);
  const wb2 = new ExcelJS.Workbook(); await wb2.xlsx.readFile(OUT);
  const sheets = wb2.worksheets.map(s=>s.name);
  if (!sheets.includes('Creator Leads') || !sheets.includes('Summary')) { console.error('❌ Sheets missing'); process.exit(1); }
  console.log(`✅ Sheets verified: ${sheets.join(', ')}`);
  console.log('\n✅ Smoke test passed.\n');
}
run().catch(err => { console.error('❌ Smoke test failed:', err.message); process.exit(1); });
