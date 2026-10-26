import zipfile, xml.etree.ElementTree as ET, json

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

print(f"Loaded {len(rows_dict)} rows from excel.")

def clean_besaran(val):
    if not val:
        return 0
    val_str = str(val).replace(',', '').replace('.', '').replace(' ', '').strip()
    try:
        return int(val_str)
    except:
        return 0

# Test clean_besaran
print('Test clean_besaran:', clean_besaran('4,517,000'), clean_besaran('659'), clean_besaran('4517000'))

# 1. Inspect Tabel 20 (rows 565-602)
t20_items = []
for r in range(565, 603):
    row = rows_dict.get(r, {})
    prov = row.get('C', '').strip()
    sat = row.get('D', 'OB').strip()
    val_satpam_pengemudi = clean_besaran(row.get('E'))
    val_kebersihan_pramubakti = clean_besaran(row.get('F'))
    if prov:
        t20_items.append((prov, sat, val_satpam_pengemudi, val_kebersihan_pramubakti))
print('T20 items count:', len(t20_items), 'Sample:', t20_items[0])

# 2. Inspect Tabel 23 (rows 623-660)
t23_items = []
for r in range(623, 661):
    row = rows_dict.get(r, {})
    prov = row.get('C', '').strip()
    sat = row.get('D', 'Setel').strip()
    d_dokter = clean_besaran(row.get('E'))
    d_pegawai = clean_besaran(row.get('F'))
    d_mahasiswa = clean_besaran(row.get('G'))
    d_kerja_pengemudi = clean_besaran(row.get('H'))
    d_kerja_satpam = clean_besaran(row.get('I'))
    if prov:
        t23_items.append((prov, sat, d_dokter, d_pegawai, d_mahasiswa, d_kerja_pengemudi, d_kerja_satpam))
print('T23 items count:', len(t23_items), 'Sample:', t23_items[0])

# 3. Inspect Tabel 25 (rows 677-714 for Uang Harian, 717-719 for Uang Representasi)
t25_items = []
for r in range(677, 715):
    row = rows_dict.get(r, {})
    prov = row.get('D', '').strip()
    sat = row.get('E', 'OH').strip()
    luar_kota = clean_besaran(row.get('F'))
    dalam_kota = clean_besaran(row.get('G'))
    diklat = clean_besaran(row.get('H'))
    if prov:
        t25_items.append(('Uang Harian Perjalanan Dinas Dalam Negeri', prov, sat, luar_kota, dalam_kota, diklat))

for r in range(717, 720):
    row = rows_dict.get(r, {})
    jabatan = row.get('D', '').strip()
    sat = row.get('E', 'OH').strip()
    luar_kota = clean_besaran(row.get('F'))
    dalam_kota = clean_besaran(row.get('G'))
    if jabatan:
        t25_items.append(('Uang Representasi Perjalanan Dinas Dalam Negeri', jabatan, sat, luar_kota, dalam_kota, None))
print('T25 items count:', len(t25_items), 'Sample:', t25_items[0], t25_items[-1])

# 4. Inspect Tabel 26 (rows 722-835)
t26_items = []
current_region = ""
for r in range(722, 836):
    row = rows_dict.get(r, {})
    if 'B' in row and '26.' in row['B'] and 'C' in row:
        current_region = row['C'].strip()
        continue
    negara = row.get('D', '').strip()
    sat = row.get('E', 'OH').strip()
    gol_a = clean_besaran(row.get('F'))
    gol_b = clean_besaran(row.get('G'))
    gol_c = clean_besaran(row.get('H'))
    gol_d = clean_besaran(row.get('I'))
    if negara:
        t26_items.append((current_region, negara, sat, gol_a, gol_b, gol_c, gol_d))
print('T26 items count:', len(t26_items), 'Sample:', t26_items[0])

# 5. Inspect Tabel 27 (rows 838-875)
t27_items = []
for r in range(838, 876):
    row = rows_dict.get(r, {})
    prov = row.get('C', '').strip()
    sat = row.get('D', 'OH').strip()
    pej_neg = clean_besaran(row.get('E'))
    pej_es2 = clean_besaran(row.get('F'))
    pej_es3 = clean_besaran(row.get('G'))
    pej_es4 = clean_besaran(row.get('H'))
    if prov:
        t27_items.append((prov, sat, pej_neg, pej_es2, pej_es3, pej_es4))
print('T27 items count:', len(t27_items), 'Sample:', t27_items[0])

# 6. Inspect Tabel 28 (rows 879-1010)
t28_items = []
for r in range(879, 1011):
    row = rows_dict.get(r, {})
    perwakilan = row.get('C', '').strip()
    sat = row.get('D', 'Orang/Kali').strip()
    # E: JAKARTA - PERWAKILAN : Published
    # F: JAKARTA - PERWAKILAN : Business
    # G: JAKARTA - PERWAKILAN : First
    # H: PERWAKILAN – JAKARTA : Published
    # I: PERWAKILAN – JAKARTA : Business
    # J: PERWAKILAN – JAKARTA : First
    jkt_pub = clean_besaran(row.get('E'))
    jkt_bus = clean_besaran(row.get('F'))
    jkt_fst = clean_besaran(row.get('G'))
    per_pub = clean_besaran(row.get('H'))
    per_bus = clean_besaran(row.get('I'))
    per_fst = clean_besaran(row.get('J'))
    if perwakilan:
        t28_items.append((perwakilan, sat, jkt_pub, jkt_bus, jkt_fst, per_pub, per_bus, per_fst))
print('T28 items count:', len(t28_items), 'Sample:', t28_items[0])

# 7. Inspect Tabel 29 (rows 1013-1135)
t29_items = []
# 29.1.1 Menteri, Setingkat Menteri dan Wakil Menteri (1015-1052)
for r in range(1015, 1053):
    row = rows_dict.get(r, {})
    prov = row.get('E', '').strip()
    sat = row.get('F', 'OP').strip()
    hd = clean_besaran(row.get('G'))
    fd = clean_besaran(row.get('H'))
    fb = clean_besaran(row.get('I'))
    if prov:
        t29_items.append(('Menteri, Setingkat Menteri dan Wakil Menteri', prov, sat, hd, fd, fb))

# 29.1.2 Pejabat Eselon I dan II/Pejabat Fungsional Utama (1055-1092)
for r in range(1055, 1093):
    row = rows_dict.get(r, {})
    prov = row.get('E', '').strip()
    sat = row.get('F', 'OP').strip()
    hd = clean_besaran(row.get('G'))
    fd = clean_besaran(row.get('H'))
    fb = clean_besaran(row.get('I'))
    if prov:
        t29_items.append(('Pejabat Eselon I dan II/Pejabat Fungsional Utama', prov, sat, hd, fd, fb))

# 29.1.3 Pejabat Eselon III/Pejabat Fungsional Madya Ke Bawah (1095-1132)
for r in range(1095, 1133):
    row = rows_dict.get(r, {})
    prov = row.get('E', '').strip()
    sat = row.get('F', 'OP').strip()
    hd = clean_besaran(row.get('H'))
    fd = clean_besaran(row.get('J'))
    fb = clean_besaran(row.get('L'))
    if prov:
        t29_items.append(('Pejabat Eselon III/Pejabat Fungsional Madya Ke Bawah', prov, sat, hd, fd, fb))

# row 1135: FULLBOARD
r1135 = rows_dict.get(1135, {})
print('T29 row 1135:', r1135)
print('T29 items count:', len(t29_items), 'Sample:', t29_items[0])
