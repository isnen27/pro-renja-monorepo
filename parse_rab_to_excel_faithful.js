/* Konversi PDF "Pusat_RAB Gaji.pdf" (DJPPR RAB TA 2027) -> Excel dengan layout
   yang meniru PDF asli (isi, urutan baris, dan kolom sama).
   Output: ../Reference/Pusat_RAB Gaji.xlsx
   Jalankan: node parse_rab_to_excel_faithful.js                */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const XLSX = require('xlsx');

const ROOT = __dirname;
const REF = path.resolve(ROOT, '..', 'Reference');
const PDF = path.join(REF, 'Pusat_RAB Gaji.pdf');
const OUT = path.join(REF, 'Pusat_RAB Gaji.xlsx');
const RAW = path.join(os.tmpdir(), 'rab_faithful.txt');

execFileSync('pdftotext', ['-layout', PDF, RAW], { stdio: 'inherit' });
const pages = fs.readFileSync(RAW, 'utf8').split('\f').filter(p => p.trim());

// ---------- util parsing ----------
const MONEY = /Rp\s*([\d.,]+|-)/gi;
function monies(line) {
  const out = []; let m;
  const re = new RegExp(MONEY.source, 'gi');
  while ((m = re.exec(line)) !== null) out.push(m[1].trim());
  return out;
}
function num(tok) {
  if (tok == null) return '';
  const t = String(tok).trim();
  if (!t || t === '-') return 0;
  const n = Number(t.replace(/[.,]/g, ''));
  return isNaN(n) ? '' : n;
}
function moneyNum(tok) {
  const v = num(tok);
  return v === '' ? '' : v;
}
const F_RP = '"Rp"#"."##0;"Rp -"';   // pemisah ribuan titik (lapis PDF, apa pun locale Excel)
const F_VOL = '0.0';

/* =======================================================================
   HALAMAN 1 & 2 : RINCIAN ANGGARAN BIAYA
   Kolom Excel: A Kode | B Uraian | C VOLUME | D (satuan) | E HARGA SATUAN | F JUMLAH BIAYA
   ======================================================================= */
function buildRab(pageText) {
  const A = [];
  const push = r => A.push(r);

  for (const raw of pageText.split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) continue;

    // judul
    if (/RINCIAN ANGGARAN BIAYA/.test(line)) { push(['', 'RINCIAN ANGGARAN BIAYA']); continue; }
    if (/BELANJA PEGAWAI/.test(line)) { push(['', line.trim()]); continue; }
    if (/Perhitungan Tahun/.test(line)) { push(['', '', '', '', '', line.trim()]); continue; }

    // blok identitas: "Label   : value"
    const meta = line.match(/^\s*([^:]{3,60}?)\s*:\s*(.+?)\s*$/);
    if (meta && !/KPPN/.test(line)) {
      push([meta[1].trim(), ': ' + meta[2].trim()]);
      continue;
    }

    // header tabel
    if (/^\s*Kode\s+Uraian/.test(line)) { push(['Kode', 'Uraian']); continue; }
    if (/^\s*VOLUME\s+HARGA SATUAN\s+JUMLAH BIAYA/.test(line)) { push(['', '', 'VOLUME', '', 'HARGA SATUAN', 'JUMLAH BIAYA']); continue; }
    if (/^\s*Uraian\s*$/.test(line)) { push(['', 'Uraian']); continue; }

    // baris KPPN & lokasi
    if (/^\s*\(KPPN[^)]*\)\s*$/.test(line)) { push(['', line.trim()]); continue; }
    if (/^\s*Lokasi\s*:/.test(line)) { push(['', line.trim()]); continue; }

    // baris tanda tangan & footer
    if (/^Jakarta, \d{1,2} \w+ \d{4}/.test(line.trim())) { push(['', '', '', '', line.trim()]); continue; }
    if (/Kepala Biro Perencanaan dan Keuangan/.test(line)) { push(['', '', '', '', line.trim()]); continue; }
    if (/^\s*Kamanto Pujiono\s*$/.test(line)) { push(['', '', '', '', line.trim()]); continue; }
    if (/Dokumen ini ditandatangani|This document is signed/.test(line)) { push([line.trim()]); continue; }

    // ---------- baris tabel ----------
    const ms = monies(line);
    if (ms.length) {
      const kodeM = line.match(/^ {0,14}((?:\d{4,}|\d{3}|[A-Z])(?:\.[A-Z0-9]+)*)\s{2,}/);
      const kode = kodeM ? kodeM[0].trim() : '';
      const rest = kodeM ? line.slice(kodeM[0].length) : line;
      const firstRp = rest.search(/Rp/i);
      const textPart = firstRp >= 0 ? rest.slice(0, firstRp) : rest;
      const volM = textPart.match(/(\d+(?:[.,]\d+)?)\s*(Layanan|bln|thn)\s*$/i);
      let uraian = textPart;
      let vol = '', sat = '';
      if (volM) {
        uraian = textPart.slice(0, volM.index);
        vol = Number(volM[1].replace(',', '.'));
        sat = volM[2];
      }
      uraian = uraian.replace(/^\s+/, '').replace(/\s{2,}.*$/, '').trim();

      if (ms.length >= 2) {
        // rincian: volume, satuan, harga, jumlah
        push(['', uraian, vol, sat, moneyNum(ms[ms.length - 2]), moneyNum(ms[ms.length - 1])]);
      } else {
        // level: volume opsional + total
        push([kode, uraian, vol, sat, '', moneyNum(ms[0])]);
      }
      continue;
    }
    // baris berkode tanpa nominal (mis. sub komponen "A")
    const kodeOnly = line.match(/^ {0,14}((?:\\d{4,}|\d{3}|[A-Z])(?:\.[A-Z0-9]+)*)\s{2,}(.*)$/);
    if (kodeOnly) { push([kodeOnly[1], kodeOnly[2].trim()]); continue; }

    // baris tanpa nominal lain
    push([line.trim()]);
  }
  return A;
}

/* =======================================================================
   HALAMAN 3 : RENCANA PENARIKAN DANA
   A KODE | B Uraian | C Total Pagu | D..O JAN..DES | P TOTAL
   ======================================================================= */
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGT', 'SEP', 'OKT', 'NOV', 'DES'];

function buildRpd(pageText) {
  const A = [];
  const push = r => A.push(r);
  push(['RENCANA PENARIKAN DANA']);
  push(['LAYANAN PERKANTORAN']);
  push(['TAHUN ANGGARAN 2027']);
  push([]);
  push(['', 'Uraian Kegiatan/ KRO/ RO/ Komponen/ Jenis Belanja', '', '', 'Rincian Rencana Penarikan Dana per Bulan']);
  push(['KODE', 'Uraian Kegiatan/ KRO/ RO/ Komponen/ Jenis Belanja', 'Total Pagu', ...MONTHS, 'TOTAL']);

  for (const raw of pageText.split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) continue;
    if (/RENCANA PENARIKAN DANA/.test(line) || /LAYANAN PERKANTORAN/.test(line) || /TAHUN ANGGARAN 2027/.test(line)) continue;
    if (/Uraian Kegiatan|^KODE\s/.test(line)) continue;
    if (/Rincian Rencana Penarikan/.test(line)) continue;
    if (/Dokumen ini ditandatangani|This document is signed/.test(line)) { push([line.trim()]); continue; }
    if (/^Jakarta, \d{1,2} \w+ \d{4}/.test(line.trim())) { push([line.trim()]); continue; }
    if (/Kepala Biro Perencanaan dan Keuangan/.test(line)) { push([line.trim()]); continue; }
    if (/^\s*Kamanto Pujiono\s*$/.test(line)) { push([line.trim()]); continue; }
    if (/^\s*Rp\s*-\s*$/.test(line)) continue;

    const ms = monies(line);
    const firstRp = line.search(/Rp/i);
    const before = (firstRp >= 0 ? line.slice(0, firstRp) : line).trim();
    const kodeM = before.match(/^((?:\d{4}(?:\.[A-Z0-9]+)*)|(?:\d{3}))\s+(.*)$/);
    const kode = kodeM ? kodeM[1] : '';
    const uraian = kodeM ? kodeM[2].trim() : before;

    if (ms.length >= 14) {
      push([kode, uraian, moneyNum(ms[0]), ...ms.slice(1, 13).map(moneyNum), moneyNum(ms[13])]);
    } else if (ms.length === 0 && (kode || uraian)) {
      push([kode, uraian]);
    }
  }
  return A;
}

/* ---------- tulis workbook ---------- */
const wb = XLSX.utils.book_new();

// Sheet 1: RAB (halaman 1-2 digabung, header halaman 2 ikut seperti PDF)
const rab = [...buildRab(pages[0]), ...buildRab(pages[1])];
const wsRab = XLSX.utils.aoa_to_sheet(rab);
wsRab['!cols'] = [{ wch: 14 }, { wch: 74 }, { wch: 9 }, { wch: 8 }, { wch: 20 }, { wch: 22 }];
wsRab['!merges'] = [];
// format angka
for (let r = 0; r < rab.length; r++) {
  const row = rab[r];
  const set = (c, z) => { const addr = XLSX.utils.encode_cell({ r, c }); if (wsRab[addr]) wsRab[addr].z = z; };
  if (row[4] !== '' && row[4] !== undefined && typeof row[4] === 'number') set(4, F_RP);
  if (row[5] !== '' && row[5] !== undefined && typeof row[5] === 'number') set(5, F_RP);
  if (typeof row[2] === 'number') set(2, F_VOL);
}
XLSX.utils.book_append_sheet(wb, wsRab, 'RINCIAN ANGGARAN BIAYA');

// Sheet 2: Rencana Penarikan Dana (halaman 3)
const rpd = buildRpd(pages[2]);
const wsRpd = XLSX.utils.aoa_to_sheet(rpd);
wsRpd['!cols'] = [{ wch: 12 }, { wch: 46 }, { wch: 16 }, ...MONTHS.map(() => ({ wch: 14 })), { wch: 16 }];
for (let r = 0; r < rpd.length; r++) {
  for (let c = 2; c <= 15; c++) {
    const addr = XLSX.utils.encode_cell({ r, c });
    if (wsRpd[addr] && typeof wsRpd[addr].v === 'number') wsRpd[addr].z = F_RP;
  }
}
XLSX.utils.book_append_sheet(wb, wsRpd, 'RENCANA PENARIKAN DANA');

XLSX.writeFile(wb, OUT);

console.log('Output :', OUT);
console.log('Sheet 1 baris:', rab.length, '| Sheet 2 baris:', rpd.length);
console.log('Totalakun (baris JUMLAH BIAYA kolom F):',
  rab.reduce((a, row) => a + (typeof row[5] === 'number' ? row[5] : 0), 0).toLocaleString('id-ID'));
