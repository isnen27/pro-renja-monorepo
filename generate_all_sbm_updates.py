import json, zipfile, xml.etree.ElementTree as ET

XLSX_PATH = '/home/isnen27/.config/libreofficedev/4/user/backup/SBM_Lampiran 1.xlsx.bak'
with zipfile.ZipFile(XLSX_PATH, 'r') as z:
    sst_xml = z.read('xl/sharedStrings.xml')
    root = ET.fromstring(sst_xml)
    strings = [''.join(t.text or '' for t in si.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')) for si in root.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si')]
    sheet_xml = z.read('xl/worksheets/sheet1.xml')
    sroot = ET.fromstring(sheet_xml)
    
    rows_dict = {}
    for r in sroot.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
        r_num = int(r.attrib['r'])
        vals = {}
        for c in r.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
            v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
            t = c.attrib.get('t')
            col = ''.join(filter(str.isalpha, c.attrib['r']))
            if v is not None and v.text is not None:
                val = strings[int(v.text)] if t == 's' else v.text
                vals[col] = val
        rows_dict[r_num] = vals

def clean_besaran(val):
    if not val:
        return 0
    val_str = str(val).replace(',', '').replace('.', '').replace(' ', '').strip()
    try:
        return int(val_str)
    except:
        return 0

with open('apps/web/src/data/sbmData.json', 'r') as f:
    sbm_data = json.load(f)

with open('apps/web/src/data/sbmTables.json', 'r') as f:
    sbm_tables = json.load(f)

# -------------------------------------------------------------
# 1. Update sbmTables.json
# -------------------------------------------------------------
new_tables = []
for t in sbm_tables:
    if t['kodeTabel'] == 'L1_01':
        # Tabel 1
        t1 = dict(t)
        t1['itemCount'] = 25
        new_tables.append(t1)
        # Tabel 2
        new_tables.append({
            "kodeTabel": "L1_01_B",
            "page": "Tabel 2",
            "lampiran": "Lampiran I (Batas Tertinggi)",
            "jenisTabel": "HONORARIUM PENGADAAN BARANG/JASA",
            "itemCount": 31
        })
    elif t['kodeTabel'] == 'L1_12':
        t_mod = dict(t)
        t_mod['itemCount'] = 1
        new_tables.append(t_mod)
    elif t['kodeTabel'] == 'L1_19': # Tabel 20
        t_mod = dict(t)
        t_mod['itemCount'] = 76 # 38 x 2
        new_tables.append(t_mod)
    elif t['kodeTabel'] == 'L1_22': # Tabel 23
        t_mod = dict(t)
        t_mod['itemCount'] = 190 # 38 x 5
        new_tables.append(t_mod)
    elif t['kodeTabel'] == 'L1_23': # Tabel 24
        t24 = dict(t)
        t24['itemCount'] = 5
        new_tables.append(t24)
        # Tabel 25
        new_tables.append({
            "kodeTabel": "L1_23_B",
            "page": "Tabel 25",
            "lampiran": "Lampiran I (Batas Tertinggi)",
            "jenisTabel": "SATUAN BIAYA UANG HARIAN DAN UANG REPRESENTASI PERJALANAN DINAS DALAM NEGERI",
            "itemCount": 120 # 38 x 3 + 3 x 2
        })
    elif t['kodeTabel'] == 'L1_24': # Tabel 26
        t_mod = dict(t)
        t_mod['itemCount'] = 388 # 97 x 4
        new_tables.append(t_mod)
    elif t['kodeTabel'] == 'L1_25': # Tabel 27
        t_mod = dict(t)
        t_mod['itemCount'] = 152 # 38 x 4
        new_tables.append(t_mod)
    elif t['kodeTabel'] == 'L1_26': # Tabel 28
        t_mod = dict(t)
        t_mod['jenisTabel'] = "SATUAN BIAYA TIKET PERJALANAN DINAS PINDAH LUAR NEGERI (ONE WAY) (dalam US$)"
        t_mod['itemCount'] = 792 # 132 x 6
        new_tables.append(t_mod)
    elif t['kodeTabel'] == 'L1_27': # Tabel 29
        t_mod = dict(t)
        t_mod['itemCount'] = 343 # 114 x 3 + 1
        new_tables.append(t_mod)
    else:
        new_tables.append(dict(t))

# -------------------------------------------------------------
# 2. Update sbmData.json items
# -------------------------------------------------------------
# A. Tabel 1 & Tabel 2:
# In sbm_data, L1_01 has 56 items. First 25 are Tabel 1, remaining 31 are Tabel 2!
new_sbm_data = []

t2_count = 0
for item in sbm_data:
    if item['kodeTabel'] == 'L1_01':
        if 'HONORARIUM PENGADAAN BARANG/JASA' in item['uraian']:
            # Move to Tabel 2
            t2_count += 1
            mod_item = dict(item)
            mod_item['kodeTabel'] = 'L1_01_B'
            mod_item['halaman'] = 'Tabel 2'
            mod_item['jenisTabel'] = 'HONORARIUM PENGADAAN BARANG/JASA'
            mod_item['id'] = f"sbm_L1_01_B_{t2_count}"
            new_sbm_data.append(mod_item)
        else:
            new_sbm_data.append(item)
    elif item['kodeTabel'] == 'L1_12':
        # Skip existing if any (currently none), we will insert Honor Rohaniwan explicitly
        pass
    elif item['kodeTabel'] == 'L1_19': # Tabel 20
        # Will replace with 76 items from Excel
        pass
    elif item['kodeTabel'] == 'L1_22': # Tabel 23
        # Will replace with 190 items from Excel
        pass
    elif item['kodeTabel'] == 'L1_23': # Tabel 24 & 25
        # Keep only the first 5 items (Pengepakan/Angkutan)
        if any(w in item['uraian'] for w in ['Pengepakan', 'Angkutan']) and 'Uang' not in item['uraian']:
            new_sbm_data.append(item)
    elif item['kodeTabel'] == 'L1_24': # Tabel 26
        # Will replace with 388 items from Excel
        pass
    elif item['kodeTabel'] == 'L1_25': # Tabel 27
        # Will replace with 152 items from Excel
        pass
    elif item['kodeTabel'] == 'L1_26': # Tabel 28
        # Will replace with 792 items from Excel
        pass
    elif item['kodeTabel'] == 'L1_27': # Tabel 29
        # Will replace with 343 items from Excel
        pass
    else:
        new_sbm_data.append(item)

print(f"Moved {t2_count} items to Tabel 2.")

# B. Insert Tabel 13: Honor Rohaniwan
new_sbm_data.append({
    "id": "sbm_L1_12_1",
    "kodeTabel": "L1_12",
    "halaman": "Tabel 13",
    "lampiran": "Lampiran I (Batas Tertinggi)",
    "kategori": "Lampiran I (Batas Tertinggi)",
    "jenisTabel": "HONORARIUM ROHANIWAN",
    "uraian": "HONORARIUM ROHANIWAN",
    "spesifikasi": "",
    "satuan": "OK",
    "besaran": 400000,
    "dasarHukum": "KMK Nomor 296 Tahun 2026"
})

# C. Insert Tabel 20: HONORARIUM SATPAM, PENGEMUDI, PETUGAS KEBERSIHAN, DAN PRAMUBAKTI (76 items)
t20_idx = 0
for r in range(565, 603):
    row = rows_dict.get(r, {})
    prov = row.get('C', '').strip()
    sat = row.get('D', 'OB').strip()
    v_sp = clean_besaran(row.get('E'))
    v_kp = clean_besaran(row.get('F'))
    if prov:
        t20_idx += 1
        new_sbm_data.append({
            "id": f"sbm_L1_19_{t20_idx}",
            "kodeTabel": "L1_19",
            "halaman": "Tabel 20",
            "lampiran": "Lampiran I (Batas Tertinggi)",
            "kategori": "Lampiran I (Batas Tertinggi)",
            "jenisTabel": "HONORARIUM SATPAM. PENGEMUDI. PETUGAS KEBERSIHAN. DAN PRAMUBAKTI",
            "uraian": f"{prov} - HONORARIUM SATPAM DAN PENGEMUDI",
            "spesifikasi": "HONORARIUM SATPAM DAN PENGEMUDI",
            "satuan": sat,
            "besaran": v_sp,
            "dasarHukum": "KMK Nomor 296 Tahun 2026"
        })
        t20_idx += 1
        new_sbm_data.append({
            "id": f"sbm_L1_19_{t20_idx}",
            "kodeTabel": "L1_19",
            "halaman": "Tabel 20",
            "lampiran": "Lampiran I (Batas Tertinggi)",
            "kategori": "Lampiran I (Batas Tertinggi)",
            "jenisTabel": "HONORARIUM SATPAM. PENGEMUDI. PETUGAS KEBERSIHAN. DAN PRAMUBAKTI",
            "uraian": f"{prov} - HONORARIUM PETUGAS KEBERSIHAN DAN PRAMUBAKTI",
            "spesifikasi": "HONORARIUM PETUGAS KEBERSIHAN DAN PRAMUBAKTI",
            "satuan": sat,
            "besaran": v_kp,
            "dasarHukum": "KMK Nomor 296 Tahun 2026"
        })
print(f"Generated {t20_idx} items for Tabel 20.")

# D. Insert Tabel 23: SATUAN BIAYA PENGADAAN PAKAIAN DINAS (190 items)
t23_cols = [
    ('PAKAIAN DINAS DOKTER', 'E'),
    ('PAKAIAN DINAS PEGAWAI/ PERAWAT', 'F'),
    ('PAKAIAN SERAGAM MAHASISWA/ TARUNA', 'G'),
    ('PAKAIAN KERJA PENGEMUDI /PETUGAS KEBERSIHAN/ PRAMUBAKTI', 'H'),
    ('PAKAIAN KERJA SATPAM', 'I')
]
t23_idx = 0
for r in range(623, 661):
    row = rows_dict.get(r, {})
    prov = row.get('C', '').strip()
    sat = row.get('D', 'Setel').strip()
    if prov:
        for col_name, col_key in t23_cols:
            val = clean_besaran(row.get(col_key))
            t23_idx += 1
            new_sbm_data.append({
                "id": f"sbm_L1_22_{t23_idx}",
                "kodeTabel": "L1_22",
                "halaman": "Tabel 23",
                "lampiran": "Lampiran I (Batas Tertinggi)",
                "kategori": "Lampiran I (Batas Tertinggi)",
                "jenisTabel": "SATUAN BIAYA PENGADAAN PAKAIAN DINAS",
                "uraian": f"{prov} - {col_name}",
                "spesifikasi": col_name,
                "satuan": sat,
                "besaran": val,
                "dasarHukum": "KMK Nomor 296 Tahun 2026"
            })
print(f"Generated {t23_idx} items for Tabel 23.")

# E. Insert Tabel 25: SATUAN BIAYA UANG HARIAN DAN UANG REPRESENTASI PERJALANAN DINAS DALAM NEGERI (120 items)
t25_idx = 0
for r in range(677, 715):
    row = rows_dict.get(r, {})
    prov = row.get('D', '').strip()
    sat = row.get('E', 'OH').strip()
    luar_kota = clean_besaran(row.get('F'))
    dalam_kota = clean_besaran(row.get('G'))
    diklat = clean_besaran(row.get('H'))
    if prov:
        for sub_name, val in [('LUAR KOTA', luar_kota), ('DALAM KOTA LEBIH DARI 8 (DELAPAN) JAM', dalam_kota), ('DIKLAT', diklat)]:
            t25_idx += 1
            new_sbm_data.append({
                "id": f"sbm_L1_23_B_{t25_idx}",
                "kodeTabel": "L1_23_B",
                "halaman": "Tabel 25",
                "lampiran": "Lampiran I (Batas Tertinggi)",
                "kategori": "Lampiran I (Batas Tertinggi)",
                "jenisTabel": "SATUAN BIAYA UANG HARIAN DAN UANG REPRESENTASI PERJALANAN DINAS DALAM NEGERI",
                "uraian": f"Uang Harian Perjalanan Dinas Dalam Negeri - {prov} - {sub_name}",
                "spesifikasi": sub_name,
                "satuan": sat,
                "besaran": val,
                "dasarHukum": "KMK Nomor 296 Tahun 2026"
            })

for r in range(717, 720):
    row = rows_dict.get(r, {})
    jabatan = row.get('D', '').strip()
    sat = row.get('E', 'OH').strip()
    luar_kota = clean_besaran(row.get('F'))
    dalam_kota = clean_besaran(row.get('G'))
    if jabatan:
        for sub_name, val in [('LUAR KOTA', luar_kota), ('DALAM KOTA LEBIH DARI 8 (DELAPAN) JAM', dalam_kota)]:
            t25_idx += 1
            new_sbm_data.append({
                "id": f"sbm_L1_23_B_{t25_idx}",
                "kodeTabel": "L1_23_B",
                "halaman": "Tabel 25",
                "lampiran": "Lampiran I (Batas Tertinggi)",
                "kategori": "Lampiran I (Batas Tertinggi)",
                "jenisTabel": "SATUAN BIAYA UANG HARIAN DAN UANG REPRESENTASI PERJALANAN DINAS DALAM NEGERI",
                "uraian": f"Uang Representasi Perjalanan Dinas Dalam Negeri - {jabatan} - {sub_name}",
                "spesifikasi": sub_name,
                "satuan": sat,
                "besaran": val,
                "dasarHukum": "KMK Nomor 296 Tahun 2026"
            })
print(f"Generated {t25_idx} items for Tabel 25.")

# F. Insert Tabel 26: SATUAN BIAYA UANG HARIAN PERJALANAN DINAS LUAR NEGERI (dalam US$) (388 items)
t26_idx = 0
current_region = ""
for r in range(722, 836):
    row = rows_dict.get(r, {})
    if 'B' in row and '26.' in row['B'] and 'C' in row:
        current_region = row['C'].strip()
        continue
    negara = row.get('D', '').strip()
    sat = row.get('E', 'OH').strip()
    if negara:
        for gol_name, col_key in [('GOLONGAN A', 'F'), ('GOLONGAN B', 'G'), ('GOLONGAN C', 'H'), ('GOLONGAN D', 'I')]:
            val = clean_besaran(row.get(col_key))
            t26_idx += 1
            new_sbm_data.append({
                "id": f"sbm_L1_24_{t26_idx}",
                "kodeTabel": "L1_24",
                "halaman": "Tabel 26",
                "lampiran": "Lampiran I (Batas Tertinggi)",
                "kategori": "Lampiran I (Batas Tertinggi)",
                "jenisTabel": "SATUAN BIAYA UANG HARIAN PERJALANAN DINAS LUAR NEGERI (dalam US$)",
                "uraian": f"{current_region} - {negara} - {gol_name}",
                "spesifikasi": gol_name,
                "satuan": sat,
                "besaran": val,
                "dasarHukum": "KMK Nomor 296 Tahun 2026"
            })
print(f"Generated {t26_idx} items for Tabel 26.")

# G. Insert Tabel 27: SATUAN BIAYA PENGINAPAN PERJALANAN DINAS DALAM NEGERI (152 items)
t27_cols = [
    ('PEJABAT NEGARA/ WAKIL MENTERI/ PEJABAT ESELON I', 'E'),
    ('PEJABAT NEGARA LAINNYA/ PEJABAT ESELON II', 'F'),
    ('PEJABAT ESELON III/ GOLONGAN IV', 'G'),
    ('PEJABAT ESELON IV/ GOLONGAN III/II/I', 'H')
]
t27_idx = 0
for r in range(838, 876):
    row = rows_dict.get(r, {})
    prov = row.get('C', '').strip()
    sat = row.get('D', 'OH').strip()
    if prov:
        for col_name, col_key in t27_cols:
            val = clean_besaran(row.get(col_key))
            t27_idx += 1
            new_sbm_data.append({
                "id": f"sbm_L1_25_{t27_idx}",
                "kodeTabel": "L1_25",
                "halaman": "Tabel 27",
                "lampiran": "Lampiran I (Batas Tertinggi)",
                "kategori": "Lampiran I (Batas Tertinggi)",
                "jenisTabel": "SATUAN BIAYA PENGINAPAN PERJALANAN DINAS DALAM NEGERI",
                "uraian": f"{prov} - {col_name}",
                "spesifikasi": col_name,
                "satuan": sat,
                "besaran": val,
                "dasarHukum": "KMK Nomor 296 Tahun 2026"
            })
print(f"Generated {t27_idx} items for Tabel 27.")

# H. Insert Tabel 28: SATUAN BIAYA TIKET PERJALANAN DINAS PINDAH LUAR NEGERI (ONE WAY) (dalam US$) (792 items)
t28_cols = [
    ('JAKARTA - PERWAKILAN : Published', 'E'),
    ('JAKARTA - PERWAKILAN : Business', 'F'),
    ('JAKARTA - PERWAKILAN : First', 'G'),
    ('PERWAKILAN – JAKARTA : Published', 'H'),
    ('PERWAKILAN – JAKARTA : Business', 'I'),
    ('PERWAKILAN – JAKARTA : First', 'J')
]
t28_idx = 0
for r in range(879, 1011):
    row = rows_dict.get(r, {})
    perwakilan = row.get('C', '').strip()
    sat = row.get('D', 'Orang/Kali').strip()
    if perwakilan:
        for col_name, col_key in t28_cols:
            val = clean_besaran(row.get(col_key))
            t28_idx += 1
            new_sbm_data.append({
                "id": f"sbm_L1_26_{t28_idx}",
                "kodeTabel": "L1_26",
                "halaman": "Tabel 28",
                "lampiran": "Lampiran I (Batas Tertinggi)",
                "kategori": "Lampiran I (Batas Tertinggi)",
                "jenisTabel": "SATUAN BIAYA TIKET PERJALANAN DINAS PINDAH LUAR NEGERI (ONE WAY) (dalam US$)",
                "uraian": f"{perwakilan} - {col_name}",
                "spesifikasi": col_name,
                "satuan": sat,
                "besaran": val,
                "dasarHukum": "KMK Nomor 296 Tahun 2026"
            })
print(f"Generated {t28_idx} items for Tabel 28.")

# I. Insert Tabel 29: SATUAN BIAYA RAPAT/PERTEMUAN DI LUAR KANTOR (343 items)
t29_idx = 0
# 29.1.1 Menteri, Setingkat Menteri dan Wakil Menteri (1015-1052)
for r in range(1015, 1053):
    row = rows_dict.get(r, {})
    prov = row.get('E', '').strip()
    sat = row.get('F', 'OP').strip()
    hd = clean_besaran(row.get('G'))
    fd = clean_besaran(row.get('H'))
    fb = clean_besaran(row.get('I'))
    if prov:
        for col_name, val in [('HALFDAY', hd), ('FULLDAY', fd), ('FULLBOARD', fb)]:
            t29_idx += 1
            new_sbm_data.append({
                "id": f"sbm_L1_27_{t29_idx}",
                "kodeTabel": "L1_27",
                "halaman": "Tabel 29",
                "lampiran": "Lampiran I (Batas Tertinggi)",
                "kategori": "Lampiran I (Batas Tertinggi)",
                "jenisTabel": "SATUAN BIAYA RAPAT/PERTEMUAN DI LUAR KANTOR",
                "uraian": f"Menteri, Setingkat Menteri dan Wakil Menteri - {prov} - {col_name}",
                "spesifikasi": col_name,
                "satuan": sat,
                "besaran": val,
                "dasarHukum": "KMK Nomor 296 Tahun 2026"
            })

# 29.1.2 Pejabat Eselon I dan II/Pejabat Fungsional Utama (1055-1092)
for r in range(1055, 1093):
    row = rows_dict.get(r, {})
    prov = row.get('E', '').strip()
    sat = row.get('F', 'OP').strip()
    hd = clean_besaran(row.get('G'))
    fd = clean_besaran(row.get('H'))
    fb = clean_besaran(row.get('I'))
    if prov:
        for col_name, val in [('HALFDAY', hd), ('FULLDAY', fd), ('FULLBOARD', fb)]:
            t29_idx += 1
            new_sbm_data.append({
                "id": f"sbm_L1_27_{t29_idx}",
                "kodeTabel": "L1_27",
                "halaman": "Tabel 29",
                "lampiran": "Lampiran I (Batas Tertinggi)",
                "kategori": "Lampiran I (Batas Tertinggi)",
                "jenisTabel": "SATUAN BIAYA RAPAT/PERTEMUAN DI LUAR KANTOR",
                "uraian": f"Pejabat Eselon I dan II/Pejabat Fungsional Utama - {prov} - {col_name}",
                "spesifikasi": col_name,
                "satuan": sat,
                "besaran": val,
                "dasarHukum": "KMK Nomor 296 Tahun 2026"
            })

# 29.1.3 Pejabat Eselon III/Pejabat Fungsional Madya Ke Bawah (1095-1132)
for r in range(1095, 1133):
    row = rows_dict.get(r, {})
    prov = row.get('E', '').strip()
    sat = row.get('F', 'OP').strip()
    hd = clean_besaran(row.get('H'))
    fd = clean_besaran(row.get('J'))
    fb = clean_besaran(row.get('L'))
    if prov:
        for col_name, val in [('HALFDAY', hd), ('FULLDAY', fd), ('FULLBOARD', fb)]:
            t29_idx += 1
            new_sbm_data.append({
                "id": f"sbm_L1_27_{t29_idx}",
                "kodeTabel": "L1_27",
                "halaman": "Tabel 29",
                "lampiran": "Lampiran I (Batas Tertinggi)",
                "kategori": "Lampiran I (Batas Tertinggi)",
                "jenisTabel": "SATUAN BIAYA RAPAT/PERTEMUAN DI LUAR KANTOR",
                "uraian": f"Pejabat Eselon III/Pejabat Fungsional Madya Ke Bawah - {prov} - {col_name}",
                "spesifikasi": col_name,
                "satuan": sat,
                "besaran": val,
                "dasarHukum": "KMK Nomor 296 Tahun 2026"
            })

# row 1135: Uang Harian Kegiatan Rapat/Pertemuan di Luar Kantor - FULLBOARD
t29_idx += 1
new_sbm_data.append({
    "id": f"sbm_L1_27_{t29_idx}",
    "kodeTabel": "L1_27",
    "halaman": "Tabel 29",
    "lampiran": "Lampiran I (Batas Tertinggi)",
    "kategori": "Lampiran I (Batas Tertinggi)",
    "jenisTabel": "SATUAN BIAYA RAPAT/PERTEMUAN DI LUAR KANTOR",
    "uraian": "Uang Harian Kegiatan Rapat/Pertemuan di Luar Kantor - FULLBOARD",
    "spesifikasi": "FULLBOARD",
    "satuan": "OH",
    "besaran": 130000,
    "dasarHukum": "KMK Nomor 296 Tahun 2026"
})
print(f"Generated {t29_idx} items for Tabel 29.")

print(f"Final new_sbm_data count: {len(new_sbm_data)}")

# Write to files
with open('apps/web/src/data/sbmData.json', 'w') as f:
    json.dump(new_sbm_data, f, indent=2, ensure_ascii=False)

with open('apps/web/src/data/sbmTables.json', 'w') as f:
    json.dump(new_tables, f, indent=2, ensure_ascii=False)

print("Successfully written sbmData.json and sbmTables.json!")
