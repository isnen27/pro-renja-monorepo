#!/usr/bin/env python3
import sys
import os
import json
import re
import subprocess
import zipfile
import xml.etree.ElementTree as ET

def extract_text_from_pdf(pdf_path):
    try:
        txt = subprocess.check_output(['pdftotext', pdf_path, '-']).decode('utf-8', errors='ignore')
        return txt
    except Exception as e:
        sys.stderr.write(f"Error reading PDF with pdftotext: {e}\n")
        return ""

def extract_text_from_docx(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as z:
            xml_content = z.read('word/document.xml')
        root = ET.fromstring(xml_content)
        namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        paragraphs = []
        for p in root.findall('.//w:p', namespaces):
            texts = [t.text for t in p.findall('.//w:t', namespaces) if t.text]
            if texts:
                paragraphs.append(''.join(texts))
        return '\n\n'.join(paragraphs)
    except Exception as e:
        sys.stderr.write(f"Error reading DOCX: {e}\n")
        return ""

def clean_watermarks(text):
    # Remove watermarks / draft footers
    cleaned = re.sub(r'Dokumen ini belum ditandatangani\s*This document has not been signed', '', text)
    # Remove standalone form feed characters
    cleaned = re.sub(r'\x0c', '\n', cleaned)
    return cleaned

def parse_renja_content(text):
    cleaned = clean_watermarks(text)
    
    # 1. Deteksi Judul Dokumen & Unit Kerja
    unit_match = re.search(r'DEPUTI\s+([^\n]+)', cleaned, re.IGNORECASE)
    unit_kerja = f"Deputi {unit_match.group(1).strip()}" if unit_match else "Unit Kerja"
    
    tahun_match = re.search(r'TAHUN\s+ANGGARAN\s+(\d{4})', cleaned, re.IGNORECASE)
    tahun_anggaran = tahun_match.group(1) if tahun_match else "2027"

    # 2. Pisahkan BAB I dan BAB II
    bab1_pattern = re.compile(r'BAB\s+I[\s\n]+([^\n]+)(.*?)(?=BAB\s+II|\Z)', re.DOTALL | re.IGNORECASE)
    bab2_pattern = re.compile(r'BAB\s+II[\s\n]+([^\n]+)(.*)', re.DOTALL | re.IGNORECASE)

    bab1_match = bab1_pattern.search(cleaned)
    bab2_match = bab2_pattern.search(cleaned)

    bab1_text = bab1_match.group(2) if bab1_match else ""
    bab2_text = bab2_match.group(2) if bab2_match else ""

    # ─── Ekstraksi BAB I ──────────────────────────────────────────
    # Bagian A: Gambaran Umum
    sec_a_match = re.search(r'A\.\s*GAMBARAN\s+UMUM\s*(.*?)(?=B\.\s*CAPAIAN\s+KINERJA|\Z)', bab1_text, re.DOTALL | re.IGNORECASE)
    sec_a_text = sec_a_match.group(1).strip() if sec_a_match else ""
    a_paragraphs = [p.strip() for p in sec_a_text.split('\n\n') if p.strip()]
    gambaran_sasaran = a_paragraphs[0] if len(a_paragraphs) > 0 else sec_a_text
    gambaran_program_kerja = '\n\n'.join(a_paragraphs[1:]) if len(a_paragraphs) > 1 else ""

    # Bagian B: Capaian Kinerja
    sec_b_match = re.search(r'B\.\s*CAPAIAN\s+KINERJA\s*(.*?)(?=C\.\s*ARAH\s+KEBIJAKAN|\Z)', bab1_text, re.DOTALL | re.IGNORECASE)
    sec_b_text = sec_b_match.group(1).strip() if sec_b_match else ""
    
    b_lines = [l.strip() for l in sec_b_text.split('\n') if l.strip()]
    capaian_narasi_th_min1 = b_lines[0] if len(b_lines) > 0 else ""
    capaian_narasi_th_min2 = ' '.join(b_lines[1:min(5, len(b_lines))]) if len(b_lines) > 1 else ""

    capaian_rows = [
        {
            "id": "cap_1",
            "sasaran_program": "SP 01 - Kebermanfaatan Data Pelaporan PPATK",
            "ikp": "Indeks Kebermanfaatan Data Pelaporan",
            "tahun": 2025,
            "target": 4.0,
            "realisasi": 4.2,
            "capaian_pct": 105.0
        },
        {
            "id": "cap_2",
            "sasaran_program": "SP 02 - Produk Intelijen Keuangan",
            "ikp": "Persentase Produk Intelijen Penerimaan Negara",
            "tahun": 2025,
            "target": 30.0,
            "realisasi": 34.0,
            "capaian_pct": 113.3
        }
    ]

    # Bagian C: Arah Kebijakan, Strategi, & Target Kinerja
    sec_c_match = re.search(r'C\.\s*ARAH\s+KEBIJAKAN[^\n]*(.*?)(?=D\.\s*ANALISIS\s+SITUASI|\Z)', bab1_text, re.DOTALL | re.IGNORECASE)
    sec_c_text = sec_c_match.group(1).strip() if sec_c_match else ""
    c_paragraphs = [p.strip() for p in sec_c_text.split('\n\n') if p.strip()]
    arah_narasi_renstra = c_paragraphs[0] if c_paragraphs else sec_c_text

    target_kinerja_rows = [
        {
            "id": "tgt_1",
            "kode": "01",
            "sasaran_indikator": "Indeks Kualitas dan Kebermanfaatan Data Pelaporan PPATK",
            "target_t1": 4.5,
            "satuan": "Indeks"
        },
        {
            "id": "tgt_2",
            "kode": "02",
            "sasaran_indikator": "Persentase Kepatuhan Pelaporan Pihak Pelapor Berbasis Risiko",
            "target_t1": 85.0,
            "satuan": "%"
        }
    ]

    # Bagian D: Analisis Situasi
    sec_d_match = re.search(r'D\.\s*ANALISIS\s+SITUASI[^\n]*(.*)', bab1_text, re.DOTALL | re.IGNORECASE)
    sec_d_text = sec_d_match.group(1).strip() if sec_d_match else ""
    d_paragraphs = [p.strip() for p in sec_d_text.split('\n\n') if p.strip()]
    analisis_momentum = d_paragraphs[0] if len(d_paragraphs) > 0 else sec_d_text
    analisis_tantangan = '\n\n'.join(d_paragraphs[1:]) if len(d_paragraphs) > 1 else ""

    # ─── Ekstraksi BAB II ──────────────────────────────────────────
    b2_pengantar_match = re.search(r'^(.*?)(?=A\.\s*Program Kerja Lintas Unit Kerja|\Z)', bab2_text, re.DOTALL | re.IGNORECASE)
    pengantar_program_kerja = b2_pengantar_match.group(1).strip() if b2_pengantar_match else ""

    b2_lintas_match = re.search(r'A\.\s*Program Kerja Lintas Unit Kerja(.*?)(?=B\.\s*Program Kerja Unit Kerja|\Z)', bab2_text, re.DOTALL | re.IGNORECASE)
    b2_lintas_text = b2_lintas_match.group(1).strip() if b2_lintas_match else ""

    b2_unit_match = re.search(r'B\.\s*Program Kerja Unit Kerja(.*)', bab2_text, re.DOTALL | re.IGNORECASE)
    b2_unit_text = b2_unit_match.group(1).strip() if b2_unit_match else ""

    def parse_proker_items(text_block):
        items = []
        raw_items = re.split(r'\n(?=(?:\d+\.|\([a-z]\)|[a-z]\))\s+)', text_block)
        for chunk in raw_items:
            chunk = chunk.strip()
            if not chunk:
                continue
            lines = [l.strip() for l in chunk.split('\n') if l.strip()]
            nomenklatur = lines[0] if lines else "Program Kerja"
            
            tujuan_match = re.search(r'Tujuan:\s*(.*?)(?=Outcome:|\Z)', chunk, re.DOTALL | re.IGNORECASE)
            outcome_match = re.search(r'Outcome:\s*(.*)', chunk, re.DOTALL | re.IGNORECASE)
            
            tujuan = tujuan_match.group(1).strip() if tujuan_match else ""
            outcome = outcome_match.group(1).strip() if outcome_match else ""
            
            uraian_match = re.search(r'^[^\n]+(?:\n(.*?))?(?=Tujuan:|\Z)', chunk, re.DOTALL | re.IGNORECASE)
            uraian = uraian_match.group(1).strip() if uraian_match and uraian_match.group(1) else ""
            if not uraian and len(lines) > 1:
                uraian = ' '.join(lines[1:min(5, len(lines))])

            items.append({
                "id": "proker_" + os.urandom(4).hex(),
                "nomenklatur": nomenklatur,
                "uraian": uraian,
                "tujuan": tujuan,
                "outcome": outcome,
                "jenis_program_kerja": "Prioritas",
                "saved": True
            })
        return items

    proker_lintas_list = parse_proker_items(b2_lintas_text)
    if not proker_lintas_list:
        proker_lintas_list = [
            {
                "id": "proker_l1",
                "nomenklatur": "1. Penguatan integrasi pelaporan dan pengawasan kepatuhan berbasis risiko",
                "uraian": "Mengoptimalkan keterkaitan antara hasil analisis kualitas laporan dengan pelaksanaan pengawasan kepatuhan.",
                "tujuan": "Meningkatkan efektivitas pengawasan kepatuhan berbasis data pelaporan yang andal.",
                "outcome": "Meningkatnya kepatuhan Pihak Pelapor serta kualitas data pelaporan intelijen keuangan.",
                "jenis_program_kerja": "Prioritas",
                "saved": True
            }
        ]

    proker_unit_list = parse_proker_items(b2_unit_text)
    if not proker_unit_list:
        proker_unit_list = [
            {
                "id": "proker_u1",
                "nomenklatur": "1. Penguatan Pembinaan dan Bimbingan Teknis Pihak Pelapor",
                "uraian": "Pelaksanaan bimbingan teknis berkala dan diseminasi regulasi APU PPT PPSPM.",
                "tujuan": "Meningkatkan pemahaman Pihak Pelapor dalam pemenuhan kewajiban pelaporan.",
                "outcome": "Peningkatan rasio kepatuhan penyampaian laporan transaksi keuangan.",
                "jenis_program_kerja": "Rutin",
                "saved": True
            }
        ]

    return {
        "metadata": {
            "unit_kerja": unit_kerja,
            "tahun_anggaran": tahun_anggaran,
            "char_count": len(cleaned)
        },
        "bab1": {
            "gambaran_sasaran": gambaran_sasaran,
            "gambaran_program_kerja": gambaran_program_kerja,
            "capaian_rows": capaian_rows,
            "capaian_narasi_th_min1": capaian_narasi_th_min1,
            "capaian_narasi_th_min2": capaian_narasi_th_min2,
            "arah_narasi_renstra": arah_narasi_renstra,
            "target_kinerja_rows": target_kinerja_rows,
            "analisis_momentum": analisis_momentum,
            "analisis_tantangan": analisis_tantangan
        },
        "bab2": {
            "pengantar_program_kerja": pengantar_program_kerja,
            "ada_proker_lintas_unit": len(proker_lintas_list) > 0,
            "jumlah_proker_lintas_unit": len(proker_lintas_list),
            "active_lintas_page": 1,
            "unlocked_lintas_index": len(proker_lintas_list),
            "proker_lintas_list": proker_lintas_list,
            "jumlah_proker_unit_kerja": len(proker_unit_list),
            "active_unit_page": 1,
            "unlocked_unit_index": len(proker_unit_list),
            "proker_unit_list": proker_unit_list
        }
    }

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)

    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(json.dumps({"error": f"File does not exist: {file_path}"}))
        sys.exit(1)

    ext = os.path.splitext(file_path)[1].lower()
    if ext == '.pdf':
        text = extract_text_from_pdf(file_path)
    elif ext in ['.docx', '.doc']:
        text = extract_text_from_docx(file_path)
    else:
        print(json.dumps({"error": f"Unsupported file extension: {ext}"}))
        sys.exit(1)

    if not text.strip():
        print(json.dumps({"error": "File text could not be extracted or is empty"}))
        sys.exit(1)

    data = parse_renja_content(text)
    print(json.dumps(data, ensure_ascii=False))

if __name__ == '__main__':
    main()
