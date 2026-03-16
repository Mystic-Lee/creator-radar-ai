// scripts/create-placeholder-icon.js
// Creates genuine placeholder icon files needed by electron-builder.
const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

const BUILD = path.join(__dirname, '..', 'build');
if (!fs.existsSync(BUILD)) fs.mkdirSync(BUILD, { recursive: true });

// ── CRC32 for PNG ──────────────────────────────────────────────────────────
let _crcTable = null;
function makeCrcTable() {
  if (_crcTable) return _crcTable;
  _crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    _crcTable[n] = c;
  }
  return _crcTable;
}
function crc32(buf) {
  const t = makeCrcTable(); let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const tb  = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([tb, data])));
  return Buffer.concat([len, tb, data, crc]);
}

// ── PNG ────────────────────────────────────────────────────────────────────
function makePng(w, h, r, g, b) {
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  const ihd = Buffer.alloc(13);
  ihd.writeUInt32BE(w,0); ihd.writeUInt32BE(h,4);
  ihd[8]=8; ihd[9]=2; ihd[10]=0; ihd[11]=0; ihd[12]=0;
  const row = Buffer.alloc(1 + w*3); row[0]=0;
  for (let x=0;x<w;x++){row[1+x*3]=r;row[2+x*3]=g;row[3+x*3]=b;}
  const raw = Buffer.concat(Array(h).fill(row));
  return Buffer.concat([sig, chunk('IHDR',ihd), chunk('IDAT',zlib.deflateSync(raw,{level:1})), chunk('IEND',Buffer.alloc(0))]);
}

// ── ICO (genuine Windows BMP-in-ICO) ──────────────────────────────────────
function makeIco(size, r, g, b) {
  const bih = Buffer.alloc(40);
  bih.writeInt32LE(40,0); bih.writeInt32LE(size,4); bih.writeInt32LE(size*2,8);
  bih.writeInt16LE(1,12); bih.writeInt16LE(24,14); bih.writeInt32LE(0,16);
  bih.writeInt32LE(size*size*3,20);
  const row = size*3, pix = Buffer.alloc(row*size);
  for (let y=size-1;y>=0;y--) for (let x=0;x<size;x++) {
    const o=(size-1-y)*row+x*3; pix[o]=b; pix[o+1]=g; pix[o+2]=r;
  }
  const andRow = Math.ceil(size/32)*4;
  const mask   = Buffer.alloc(andRow*size,0);
  const img    = Buffer.concat([bih,pix,mask]);
  const hdr    = Buffer.alloc(6);
  hdr.writeUInt16LE(0,0); hdr.writeUInt16LE(1,2); hdr.writeUInt16LE(1,4);
  const dir = Buffer.alloc(16);
  dir[0]=size>255?0:size; dir[1]=size>255?0:size;
  dir.writeUInt16LE(1,4); dir.writeUInt16LE(24,6);
  dir.writeUInt32LE(img.length,8); dir.writeUInt32LE(22,12);
  return Buffer.concat([hdr,dir,img]);
}

// ── BMP ────────────────────────────────────────────────────────────────────
function makeBmp(w, h, r, g, b) {
  const rowBytes = Math.ceil(w*3/4)*4;
  const pixSize  = rowBytes*h;
  const buf      = Buffer.alloc(54+pixSize,0);
  buf[0]=0x42;buf[1]=0x4D;
  buf.writeUInt32LE(54+pixSize,2); buf.writeUInt32LE(54,10);
  buf.writeUInt32LE(40,14); buf.writeInt32LE(w,18); buf.writeInt32LE(-h,22);
  buf.writeUInt16LE(1,26); buf.writeUInt16LE(24,28); buf.writeUInt32LE(pixSize,34);
  let o=54;
  for(let row=0;row<h;row++){
    for(let col=0;col<w;col++){buf[o++]=b;buf[o++]=g;buf[o++]=r;}
    for(let p=0;p<rowBytes-w*3;p++) buf[o++]=0;
  }
  return buf;
}

const png  = path.join(BUILD,'creatorradar-icon.png');
const ico  = path.join(BUILD,'creatorradar-icon.ico');
const ban  = path.join(BUILD,'installer-banner.bmp');
const side = path.join(BUILD,'installer-sidebar.bmp');

if (!fs.existsSync(png))  { fs.writeFileSync(png,  makePng(256,256,0x63,0x66,0xf1)); console.log('✅ PNG created');    }
else                        console.log('ℹ️  PNG exists');
if (!fs.existsSync(ico))  { fs.writeFileSync(ico,  makeIco(32,0x63,0x66,0xf1));       console.log('✅ ICO created');    }
else                        console.log('ℹ️  ICO exists');
if (!fs.existsSync(ban))  { fs.writeFileSync(ban,  makeBmp(150,57,0x63,0x66,0xf1));   console.log('✅ Banner created'); }
else                        console.log('ℹ️  Banner exists');
if (!fs.existsSync(side)) { fs.writeFileSync(side, makeBmp(164,314,0x4f,0x46,0xe5));  console.log('✅ Sidebar created');}
else                        console.log('ℹ️  Sidebar exists');

console.log('\n⚠️  Replace placeholder icons with real artwork before shipping.');
console.log('   See build/ICON_REQUIREMENTS.md\n');
