const fs = require('fs');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/pro_renja_db' });

const dir = '/home/isnen27/Documents/Pro_renja_01/Reference/Series Anggaran';

function parseNum(val) {
  if (!val) return 0;
  const clean = String(val).replace(/[^0-9]/g, '');
  return clean ? Number(clean) : 0;
}

const allData = [];

// 2020
{
  const lines = fs.readFileSync(dir + '/2020_Realisasi.csv', 'utf16le').split(/\r?\n/).filter(l => l.trim().length > 0).slice(1);
  lines.forEach((l, idx) => {
    const p = l.split('\t').map(c => c.trim());
    allData.push({
      tahun: 2020,
      kl: p[0] || '078 PPATK',
      satker: p[1] || '',
      program: p[2] || '',
      kegiatan: p[3] || '',
      kro: p[4] || '',
      ro: '',
      komponen: '',
      akun2: p[5] || '',
      akun3: p[6] || '',
      akun6: p[7] || '',
      pagu: parseNum(p[8]),
      blokir: parseNum(p[9]),
      realisasi: parseNum(p[10]),
    });
  });
}

// 2021
{
  const lines = fs.readFileSync(dir + '/2021_Realisasi.csv', 'utf16le').split(/\r?\n/).filter(l => l.trim().length > 0).slice(1);
  let currentProgram = '';
  lines.forEach((l, idx) => {
    const p = l.split('\t').map(c => c.trim());
    const label = p[0];
    if (label.includes('Grand Total')) return;
    if (label.startsWith('078')) {
      currentProgram = label;
    } else {
      allData.push({
        tahun: 2021,
        kl: '078 PPATK',
        satker: 'PUSAT PELAPORAN DAN ANALISIS TRANSAKSI KEUANGAN',
        program: currentProgram,
        kegiatan: '',
        kro: '',
        ro: '',
        komponen: '',
        akun2: label,
        akun3: '',
        akun6: '',
        pagu: parseNum(p[1]),
        blokir: 0,
        realisasi: parseNum(p[2]),
      });
    }
  });
}

function processDetailYear(year, fileName) {
  const lines = fs.readFileSync(dir + '/' + fileName, 'utf16le').split(/\r?\n/).filter(l => l.trim().length > 0).slice(1);
  lines.forEach((l, idx) => {
    const p = l.split('\t').map(c => c.trim());
    allData.push({
      tahun: year,
      kl: p[0] || '078 PPATK',
      satker: p[1] || '',
      program: p[2] || '',
      kegiatan: p[3] || '',
      kro: p[4] || '',
      ro: p[5] || '',
      komponen: p[6] || '',
      akun2: p[7] || '',
      akun3: p[8] || '',
      akun6: p[9] || '',
      pagu: parseNum(p[10]),
      blokir: parseNum(p[11]),
      realisasi: parseNum(p[12]),
    });
  });
}

processDetailYear(2022, '2022_Pagu_Realisasi.csv');
processDetailYear(2023, '2023_Pagu_Realisai.csv');
processDetailYear(2024, '2024_Pagu_Realisasi.csv');
processDetailYear(2025, '2025_Pagu_Realisasi.csv');

// Save JSON file
fs.writeFileSync('apps/web/src/data/seriesAnggaranData.json', JSON.stringify(allData, null, 2));
console.log('Saved apps/web/src/data/seriesAnggaranData.json with', allData.length, 'records.');

async function runDbMigration() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS series_anggaran (
        id SERIAL PRIMARY KEY,
        tahun INTEGER NOT NULL,
        kl VARCHAR(100),
        satker TEXT,
        program TEXT,
        kegiatan TEXT,
        kro TEXT,
        ro TEXT,
        komponen TEXT,
        akun2 TEXT,
        akun3 TEXT,
        akun6 TEXT,
        pagu NUMERIC(20, 2) DEFAULT 0,
        blokir NUMERIC(20, 2) DEFAULT 0,
        realisasi NUMERIC(20, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query('DELETE FROM series_anggaran;');
    console.log('Inserting records into series_anggaran...');

    const batchSize = 100;
    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      const values = [];
      const placeholders = [];
      let paramIdx = 1;

      batch.forEach(row => {
        const rowPlaceholders = [];
        for (let j = 0; j < 14; j++) {
          rowPlaceholders.push('$' + (paramIdx++));
        }
        placeholders.push('(' + rowPlaceholders.join(', ') + ')');
        values.push(
          row.tahun, row.kl, row.satker, row.program, row.kegiatan,
          row.kro, row.ro, row.komponen, row.akun2, row.akun3, row.akun6,
          row.pagu, row.blokir, row.realisasi
        );
      });

      const q = 'INSERT INTO series_anggaran (tahun, kl, satker, program, kegiatan, kro, ro, komponen, akun2, akun3, akun6, pagu, blokir, realisasi) VALUES ' + placeholders.join(', ');
      await client.query(q, values);
    }

    await client.query('COMMIT');
    const resCount = await client.query('SELECT COUNT(*) FROM series_anggaran;');
    console.log('Database migration complete! Total rows in series_anggaran:', resCount.rows[0].count);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Error during DB import:', e);
  } finally {
    client.release();
    pool.end();
  }
}

runDbMigration();
