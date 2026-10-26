import json

# Read existing sbmData.json and sbmTables.json
with open('apps/web/src/data/sbmData.json', 'r') as f:
    sbm_data = json.load(f)

with open('apps/web/src/data/sbmTables.json', 'r') as f:
    sbm_tables = json.load(f)

print(f"Initial sbmData items: {len(sbm_data)}")
print(f"Initial sbmTables: {len(sbm_tables)}")

# Import rows_dict from parse_sbm_updates
import zipfile, xml.etree.ElementTree as ET

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

# ─────────────────────────────────────────────────────────────────────────────
# 1. Update sbmTables.json
# ─────────────────────────────────────────────────────────────────────────────
# Insert L1_02 (Tabel 2: HONORARIUM PENGADAAN BARANG/JASA)
# Re-label L1_02.. to L1_03.. or keep kodeTabel clean?
# Let's inspect current tables:
# We need:
# - Tabel 2 : HONORARIUM PENGADAAN BARANG/JASA
# - Tabel 13 : HONORARIUM ROHANIWAN (already has L1_12, itemCount needs update to 1)
# - Tabel 24 : SATUAN BIAYA PENGEPAKAN DAN ANGKUTAN BARANG PERJALANAN DINAS PINDAH DALAM NEGERI (5 items)
# - Tabel 25 : SATUAN BIAYA UANG HARIAN DAN UANG REPRESENTASI PERJALANAN DINAS DALAM NEGERI
# - Tabel 28 : title: 'SATUAN BIAYA TIKET PERJALANAN DINAS PINDAH LUAR NEGERI (ONE WAY) (dalam US$)'

# Let's create new_tables list carefully
new_tables = []
for t in sbm_tables:
    if t['kodeTabel'] == 'L1_01':
        # Add Tabel 1
        t_t1 = dict(t)
        t_t1['itemCount'] = 25 # since rows 26..56 are moved to Tabel 2
        new_tables.append(t_t1)
        # Add Tabel 2
        new_tables.append({
            "kodeTabel": "L1_01_B", # or L1_02_NEW
            "page": "Tabel 2",
            "lampiran": "Lampiran I (Batas Tertinggi)",
            "jenisTabel": "HONORARIUM PENGADAAN BARANG/JASA",
            "itemCount": 31
        })
    elif t['kodeTabel'] == 'L1_12':
        t_mod = dict(t)
        t_mod['itemCount'] = 1
        new_tables.append(t_mod)
    elif t['kodeTabel'] == 'L1_23': # Currently Tabel 24
        t_t24 = dict(t)
        t_t24['itemCount'] = 5
        new_tables.append(t_t24)
        # Insert Tabel 25
        new_tables.append({
            "kodeTabel": "L1_23_B",
            "page": "Tabel 25",
            "lampiran": "Lampiran I (Batas Tertinggi)",
            "jenisTabel": "SATUAN BIAYA UANG HARIAN DAN UANG REPRESENTASI PERJALANAN DINAS DALAM NEGERI",
            "itemCount": 0 # will calculate
        })
    elif t['kodeTabel'] == 'L1_26': # Currently Tabel 28
        t_mod = dict(t)
        t_mod['jenisTabel'] = "SATUAN BIAYA TIKET PERJALANAN DINAS PINDAH LUAR NEGERI (ONE WAY) (dalam US$)"
        new_tables.append(t_mod)
    else:
        new_tables.append(dict(t))

print(f"Constructed new_tables count: {len(new_tables)}")
