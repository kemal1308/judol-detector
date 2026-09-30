import os
import re
import unicodedata

# Peta karakter Unicode (sama dengan predict.py asli)
UNICODE_FONT_MAP = {}
unicode_ranges = [
    (0x1D400, 'A'), (0x1D41A, 'a'), (0x1D434, 'A'), (0x1D44E, 'a'),
    (0x1D468, 'A'), (0x1D482, 'a'), (0x1D49C, 'A'), (0x1D4B6, 'a'),
    (0x1D4D0, 'A'), (0x1D4EA, 'a'), (0x1D504, 'A'), (0x1D51E, 'a'),
    (0x1D538, 'A'), (0x1D552, 'a'), (0x1D56C, 'A'), (0x1D586, 'a'),
    (0x1D5A0, 'A'), (0x1D5BA, 'a'), (0x1D5D4, 'A'), (0x1D5EE, 'a'),
    (0x1D608, 'A'), (0x1D622, 'a'), (0x1D63C, 'A'), (0x1D656, 'a'),
    (0x1D670, 'A'), (0x1D68A, 'a'),
]
for start, base_char in unicode_ranges:
    for i in range(26):
        UNICODE_FONT_MAP[chr(start + i)] = chr(ord(base_char) + i)
for i in range(10):
    UNICODE_FONT_MAP[chr(0x1D7CE + i)] = str(i)

SIMBOL_MAP = {'@': 'a', '|': 'l', '$': 's', '!': 'i'}

KEYWORD_PASTI_JUDI = [
    'slot', 'gacor', 'maxwin', 'jackpot', 'scatter',
    'togel', 'casino', 'poker', 'zeus', 'kakek merah',
    'mahjong', 'spaceman', 'rtp', 'rungkad', 'depo', 'wd',
    'sl0t', 'gac0r', 'z3us', '5lot', 'judol', 'link di bio'
]

POLA_NAMA_SITUS = [
    r'raja\s*\d+', r'pulau\s*\d+', r'slot\s*\d+',
    r'spin\s*\d+', r'jp\s*\d+', r'maxwin\s*\d+',
    r'\w+\s*(777|303|88|99|168|365|4d|2d)\b',
]

def normalisasi_teks(teks):
    teks = str(teks)
    hasil = ''
    for char in teks:
        if char in UNICODE_FONT_MAP: hasil += UNICODE_FONT_MAP[char]
        else: hasil += unicodedata.normalize('NFKC', char)
    teks = hasil.lower()
    for simbol, huruf in SIMBOL_MAP.items(): teks = teks.replace(simbol, huruf)
    teks = re.sub(r'(?<=[a-z])4(?=[a-z])', 'a', teks)
    teks = re.sub(r'(?<=[a-z])3(?=[a-z])', 'e', teks)
    teks = re.sub(r'(?<=[a-z])0(?=[a-z])', 'o', teks)
    teks = re.sub(r'(?<=[a-z])1(?=[a-z])', 'i', teks)
    teks = re.sub(r'(?<=[a-z])5(?=[a-z])', 's', teks)
    teks = re.sub(r'http\S+|www\S+|bit\.ly\S+', '', teks)
    teks = re.sub(r'([a-z])(\d)', r'\1 \2', teks)
    teks = re.sub(r'(\d)([a-z])', r'\1 \2', teks)
    teks = re.sub(r'[^\w\s]', ' ', teks)
    teks = re.sub(r'\s+', ' ', teks).strip()
    return teks

# ==== INDOBERT ML LOGIC ====
PIPELINE = None

def load_indobert_model():
    global PIPELINE
    if PIPELINE is None:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = base_dir
        
        if not os.path.exists(os.path.join(model_path, 'config.json')):
            print("Warning: File model IndoBERT tidak ditemukan di folder model.")
            print("Pastikan config.json, model.safetensors, dll sudah diekstrak ke dalam folder model.")
            return False
            
        try:
            from transformers import pipeline  # lazy import untuk hindari error IDE
            PIPELINE = pipeline("text-classification", model=model_path, tokenizer=model_path)
            print("IndoBERT loaded successfully.")
        except Exception as e:
            print(f"Error loading model: {e}")
            return False
    return True

def predict_judol_indobert(teks_input):
    if not load_indobert_model():
        return {"is_judi": False, "confidence": 0.0, "alasan": "IndoBERT not loaded"}

    teks_bersih = normalisasi_teks(teks_input)

    # Lapis 1 & 2: Tetap pertahankan deteksi pasti
    for kw in KEYWORD_PASTI_JUDI:
        if kw in teks_bersih:
            return {"is_judi": True, "confidence": 100.0, "alasan": f"Keyword '{kw}' terdeteksi"}

    for pola in POLA_NAMA_SITUS:
        if re.search(pola, teks_bersih, re.IGNORECASE):
            return {"is_judi": True, "confidence": 100.0, "alasan": f"Pola situs '{pola}' terdeteksi"}

    # Lapis 3: INDOBERT INFERENCE
    # Pipeline mengembalikan [{'label': 'LABEL_1', 'score': 0.99}]
    hasil = PIPELINE(teks_bersih)[0]
    
    # Asumsikan model Anda melatih label 1 sebagai JUDI dan label 0 sebagai NORMAL
    is_judi = hasil['label'] == 'LABEL_1'
    confidence = hasil['score'] * 100
    
    # IndoBERT sudah belajar konteks, jadi threshold 50% atau dari hasil argmax langsung valid
    if is_judi:
        return {"is_judi": True, "confidence": float(confidence), "alasan": "Deteksi IndoBERT (Konteks Spam)"}
    
    return {"is_judi": False, "confidence": float(confidence), "alasan": "Konteks Normal (IndoBERT)"}

if __name__ == "__main__":
    # Test ringan
    test_komentar = "Jangan pernah main slot ya kawan-kawan, bikin miskin beneran!"
    print("Test:", test_komentar)
    print("Hasil IndoBERT:", predict_judol_indobert(test_komentar))
