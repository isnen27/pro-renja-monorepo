// Parser RAB (DJPPR) -> Excel via SheetJS
const fs = require('fs');
const XLSX = require('/home/isnen27/Documents/Pro_renja_01/pro-renja-monorepo/node_modules/xlsx');

const RAW = '/tmp/rab.txt';
const OUT = '/home/isnen27/Documents/Pro_renja_01/Reference/RAB_PPATK_TA2027.xlsx';

const lines = fs.readFileSync(RAW, 'utf8').split(/\r?\n/);

// ---------- helpers ----------
function toNum(s) {
  if (s == null) return 0;
  s = String(s).trim();
  if (!s || s === '-' || s === '–') return 0;
  s = s.replace(/^Rp\s*/i, '').replace(/[.,]/g, '');
  const n = Number(s);
  return isNaN(n) ? 0 : n;
}
function moneyToks(line) {
  const out = [];
  const re = /Rp\s*([\d.,]+|-)/gi;
  let m;
  while ((m = re.exec(line)) !== null) out.push(toNum(m[1]));
  return out;
}
const SATUAN_ORDER = ['Layanan', 'bln', 'thn'];

function parseVolume(line) {
  // cari "12.0 bln" / "1.0 thn" / "1.0 Layanan"
  const re = /(\d+(?:[.,]\d+)?)\s+(Layanan|bln|thn)\b/g;
  let m, best = null;
  while ((m = re.exec(line)) !== null) {
    // hanya bagian sebelum nilai Rp pertama
    if (m.index > line.search(/Rp/i) && line.search(/Rp/i) >= 0) break;
    best = { vol: Number(String(m[1]).replace(',', '.')), satuan: m[2] };
  }
  return best;
}

// ---------- pisah bagian: identitas + RAB + RPD ----------
let idxRpd = lines.findIndex(l => /RENCANA PENARIKAN DANA/.test(l));
const rabLines = lines.slice(0, idxRpd > 0 ? idxRpd : lines.length);
const rpdLines = lines.slice(idxRpd > 0 ? idxRpd : lines.length);

// ---------- identitas ----------
const identitas = [];
let thn = '2027';
for (const l of rabLines) {
  const m = l.match(/^\s*([^:]{3,60}?)\s*:\s*(.+?)\s*$/);
  if (m && /Kementerian|Eselon|Kegiatan|Sasaran|Indikator|Klasifikasi|Volume|Satuan|Alokasi|Lokasi/i.test(m[1])) {
    identitas.push([m[1].trim(), m[2].trim()]);
    continue;
  }
  const y = l.match(/Perhitungan Tahun\s+(\d{4})/);
  if (y) thn = y[1];
  const lok = l.match(/Lokasi\s*:\s*(.+)/);
  if (lok && !identitas.some(r => /Lokasi/i.test(r[0]))) identitas.push(['Lokasi', lok[1].trim()]);
}

// ---------- RAB ----------
// level baris: kode di kolom ~8..22 ; rincian: indent jauh + tidak ada kode
const rows = [];
let cur = null; // {kode, uraian, kppn, rincian:[]}
const codesRe = /^ {0,14}((\d{4,}|\d{3}|A)(?:\.[A-Z0-9]+)*)\s{2,}(.*)$/;

for (const raw of rabLines) {
  const l = raw.replace(/\s+$/, '');
  if (!l.trim()) continue;
  if (/Dokumen ini ditandatangani|This document is signed/.test(l)) continue;
  if (/RINCIAN ANGGARAN BIAYA|BELANJA PEGAWAI/.test(l)) continue;
  if (/Perhitungan Tahun/.test(l)) continue;
  if (/^Kementerian\/Lembaga|Unit Eselon|Kegiatan\s+:/.test(l)) continue;

  // baris KPPN
  const kppnM = l.match(/\((KPPN[^)]*)\)\s*$/);
  if (kppnM && !moneyToks(l).length) {
    if (cur) cur.kppn = kppnM[1].trim();
    continue;
  }
  if (/^\s*Lokasi\s*:/.test(l)) continue;

  const m = codesRe.exec(l);
  const headPart = l;
  const monies = moneyToks(headPart);

  if (m) {
    // baris level/kode
    const kode = m[1];
    let rest = m[3];
    // buang bagian trailing (volume/satuan + nilai)
    const firstRp = rest.search(/Rp/i);
    let uraian = firstRp >= 0 ? rest.slice(0, firstRp) : rest;
    const v = parseVolume(rest);
    uraian = uraian.replace(/\s{2,}.*$/, '').trim();
    const total = monies.length ? monies[monies.length - 1] : '';
    const tipe = /^\d{6}$/.test(kode) ? 'Akun' : 'Hierarki';
    rows.push({ level: tipe, kode, uraian, kppn: '', vol: v ? v.vol : '', satuan: v ? v.satuan : '', harga: '', jumlah: total, rincian: [] });    cur = rows[rows.length - 1];
    continue;
  }

  // baris rincian
  if (monies.length && /^\s{20,}/.test(l)) {
    const firstRp = l.search(/Rp/i);
    let uraian = l.slice(0, firstRp).replace(/^\s*-\s*/, '').trim();
    uraian = uraian.replace(/[\d.,]+\s*(Layanan|bln|thn)\s*$/i, '').trim();
    const v = parseVolume(l);
    const harga = monies.length >= 2 ? monies[monies.length - 2] : '';
    const jumlah = monies[monies.length - 1];
    if (cur) cur.rincian.push({ uraian, vol: v ? v.vol : '', satuan: v ? v.satuan : '', harga, jumlah });
    continue;
  }
}

// ---------- RPD ----------
const MONTHS = ['JAN','FEB','MAR','APR','MEI','JUN','JUL','AGT','SEP','OKT','NOV','DES'];
const rpd = [];
const RPD_JUNK = /Dokumen ini ditandatangani|This document is signed|RENCANA PENARIKAN|LAYANAN PERKANTORAN|TAHUN ANGGARAN|Kepler|Jakarta, |Kepala Biro|Kamanto|Uraian Kegiatan|^KODE|Rincian Rencana Penarikan|^\s*$/;
for (const l of rpdLines) {
  if (!l.trim()) continue;
  if (RPD_JUNK.test(l)) continue;
  const monies = moneyToks(l);
  const firstRp = l.search(/Rp/i);
  const before = (firstRp >= 0 ? l.slice(0, firstRp) : l).trim();
  if (!before) continue;
  const kodeM = before.match(/^((?:\d{4}(?:\.[A-Z0-9]+)*)|(?:\d{3}))\s+(.*)$/);
  const kode = kodeM ? kodeM[1] : '';
  const uraian = kodeM ? kodeM[2].trim() : before;
  if (monies.length >= 13) {
    rpd.push({ kode, uraian, pagu: monies[0], bulan: monies.slice(1, 13), total: monies[13] });
  } else if (monies.length === 0) {
    // baris hierarchy (kegiatan/output) tanpa nominal
    rpd.push({ kode, uraian, pagu: '', bulan: MONTHS.map(() => ''), total: '' });
  }
}

// ---------- validasi ----------
const problems = [];
for (const r of rows.filter(r => r.level === 'Akun' && r.rincian.length)) {
  const s = r.rincian.reduce((a, b) => a + b.jumlah, 0);
  if (s !== r.jumlah) problems.push(`Total rincian != total kode ${r.kode}: ${s} vs ${r.jumlah}`);
  for (const d of r.rincian) {
    if (d.vol && d.harga) {
      const mult = (d.satuan === 'thn') ? 12 : 1; // volume 'thn' = 12 bulan
      const calc = Math.round(d.vol * d.harga * mult);
      const diff = Math.abs(calc - d.jumlah);
      if (diff > 1000) problems.push(`${r.kode} | ${d.uraian}: vol*harga=${calc} vs jumlah=${d.jumlah}`);
    }
  }
}
for (const r of rpd) {
  if (r.total === '') continue;
  const s = r.bulan.reduce((a, b) => a + b, 0);
  if (s !== r.total) problems.push(`RPD ${r.kode} ${r.uraian}: sum bulanan ${s} vs total ${r.total}`);
  if (r.total !== r.pagu) problems.push(`RPD ${r.kode}: pagu ${r.pagu} != total ${r.total}`);
}

// ---------- build workbook ----------
const wb = XLSX.utils.book_new();

// 1. Identitas
const idRows = [['RINCIAN ANGGARAN BIAYA - BELANJA PEGAWAI PPATK TA ' + thn], [],
  ['Kementerian/Lembaga', 'PUSAT PELAPORAN DAN ANALISIS TRANSAKSI KEUANGAN'],];
idRows.pop();
// identitas dari PDF
idRows.length = 1; idRows.push([]);
for (const [k, v] of identitas) idRows.push([k, v]);
idRows.push(['Perhitungan Tahun', thn]);
idRows.push(['Tanggal Penetapan', '22 September 2026']);
idRows.push(['Penandatangan', 'Kamanto Pujiono, Kepala Biro Perencanaan dan Keuangan']);
idRows.push([]);
idRows.push(['Catatan', 'Volume satuan "thn" dihitung 12 bulan (Volume x Harga Satuan x 12 = Jumlah Biaya).']);
idRows.push(['Catatan', 'Sheet "RAB" & "Rekap per Akun" memakai satuan RUPIAH; sheet "Rencana Penarikan Dana" memakai RIBUAN RUPIAH (sesuai PDF).']);
idRows.push(['Catatan', 'Sumber: Reference/Pusat_RAB Gaji.pdf (RINCIAN ANGGARAN BIAYA & RENCANA PENARIKAN DANA TA 2027).']);
const wsId = XLSX.utils.aoa_to_sheet(idRows);
XLSX.utils.book_append_sheet(wb, wsId, 'Identitas');

// 2. Rincian Anggaran Biaya (hierarkis)
function tingkat(kode) {
  if (/^\d{6}$/.test(kode)) return 'Akun';
  if (kode === '3375') return 'Kegiatan';
  if (/\.EBA$/.test(kode)) return 'Output';
  if (/\.\d{3}$/.test(kode)) return 'RO';
  if (/^\d{3}$/.test(kode)) return 'Komponen';
  if (/^[A-Z]$/.test(kode)) return 'Sub Komponen';
  return 'Lainnya';
}
const flat = [];
flat.push(['Tingkat', 'Kode', 'Uraian', 'KPPN', 'Volume', 'Satuan', 'Harga Satuan', 'Jumlah Biaya']);
for (const r of rows) {
  if (r.level === 'Akun') {
    flat.push(['Akun', r.kode, r.uraian, r.kppn, '', '', '', r.jumlah]);
    for (const d of r.rincian) {
      flat.push(['Rincian', r.kode, d.uraian, '', d.vol, d.satuan, d.harga, d.jumlah]);
    }
  } else {
    flat.push([tingkat(r.kode), r.kode, r.uraian, '', r.vol, r.satuan, '', r.jumlah]);
  }
}
const wsRab = XLSX.utils.aoa_to_sheet(flat);
wsRab['!cols'] = [{wch:10},{wch:12},{wch:62},{wch:24},{wch:9},{wch:9},{wch:18},{wch:20}];
XLSX.utils.book_append_sheet(wb, wsRab, 'RAB');

// 3. Rekap per akun
const recap = [['Kode', 'Uraian', 'Jumlah Biaya (Kode)', 'Jumlah Rincian', 'Selisih']];
for (const r of rows.filter(r => r.level === 'Akun')) {
  const s = r.rincian.reduce((a, b) => a + b.jumlah, 0);
  recap.push([r.kode, r.uraian, r.jumlah, s, r.jumlah - s]);
}
const totalAkun = rows.filter(r => r.level === 'Akun').reduce((a, b) => a + b.jumlah, 0);
recap.push(['', 'TOTAL', totalAkun, '', '']);
const wsRecap = XLSX.utils.aoa_to_sheet(recap);
wsRecap['!cols'] = [{wch:12},{wch:56},{wch:22},{wch:22},{wch:14}];
XLSX.utils.book_append_sheet(wb, wsRecap, 'Rekap per Akun');

// 4. Rencana Penarikan Dana
const rpdAoA = [['Kode', 'Uraian Kegiatan/KRO/RO/Komponen/Jenis Belanja', 'Total Pagu (ribuan Rp)', ...MONTHS.map(m => m + ' (ribuan Rp)'), 'Total (ribuan Rp)']];
for (const r of rpd) rpdAoA.push([r.kode, r.uraian, r.pagu, ...r.bulan, r.total]);
const wsRpd = XLSX.utils.aoa_to_sheet(rpdAoA);
wsRpd['!cols'] = [{wch:12},{wch:48},{wch:16}, ...MONTHS.map(() => ({wch:14})), {wch:16}];
XLSX.utils.book_append_sheet(wb, wsRpd, 'Rencana Penarikan Dana');

// 5. Rekap bulanan (pivot-friendly)
const bul = [['Kode', 'Uraian', ...MONTHS, 'Total']];
for (const r of rpd) bul.push([r.kode, r.uraian, ...r.bulan, r.total]);
const wsBul = XLSX.utils.aoa_to_sheet(bul);
wsBul['!cols'] = [{wch:12},{wch:48}, ...MONTHS.map(() => ({wch:14})), {wch:16}];
XLSX.utils.book_append_sheet(wb, wsBul, 'Rekap Bulanan');

XLSX.writeFile(wb, OUT);

console.log('Output:', OUT);
console.log('Total akun:', totalAkun.toLocaleString('id-ID'));
console.log('Jumlah baris RAB flat:', flat.length - 1);
console.log('Jumlah baris RPD:', rpd.length);
if (problems.length) {
  console.log('\nCATATAN VALIDASI:');
  problems.forEach(p => console.log(' - ' + p));
} else {
  console.log('\nValidasi OK: total rincian = total kode, vol*harga konsisten, sum bulanan = total pagu.');
}
