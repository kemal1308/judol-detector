import pickle
import os
import re
import unicodedata

# Peta karakter Unicode (dari notebook)
UNICODE_FONT_MAP = {}
unicode_ranges = [
    (0x1D400, 'A'), (0x1D41A, 'a'),
    (0x1D434, 'A'), (0x1D44E, 'a'),
    (0x1D468, 'A'), (0x1D482, 'a'),
    (0x1D49C, 'A'), (0x1D4B6, 'a'),
    (0x1D4D0, 'A'), (0x1D4EA, 'a'),
    (0x1D504, 'A'), (0x1D51E, 'a'),
    (0x1D538, 'A'), (0x1D552, 'a'),
    (0x1D56C, 'A'), (0x1D586, 'a'),
    (0x1D5A0, 'A'), (0x1D5BA, 'a'),
    (0x1D5D4, 'A'), (0x1D5EE, 'a'),
    (0x1D608, 'A'), (0x1D622, 'a'),
    (0x1D63C, 'A'), (0x1D656, 'a'),
    (0x1D670, 'A'), (0x1D68A, 'a'),
]
for start, base_char in unicode_ranges:
    for i in range(26):
        UNICODE_FONT_MAP[chr(start + i)] = chr(ord(base_char) + i)
for i in range(10):
    UNICODE_FONT_MAP[chr(0x1D7CE + i)] = str(i)

SIMBOL_MAP = {
    '@': 'a',
    '|': 'l',
    '$': 's',
    '!': 'i',
}

KEYWORD_PASTI_JUDI = [
    'slot', 'gacor', 'maxwin', 'jackpot', 'scatter',
    'togel', 'casino', 'poker', 'withdraw', 'deposit',
    'jp', 'bet', 'spin', 'daftar sekarang', 'link di bio',
    'hub admin', 'wa admin', 'cuan', 'menang terus',
    'bonus', 'modal kecil', 'pulau', 'raja', 'hoki',
    'zeus', 'kakek zeus', 'kakek merah', 'petir', 'olympus',
    'mahjong', 'mahjong ways', 'princess', 'starlight', 'spaceman',
    'pragmatic', 'pg soft', 'x500', 'x250', 'pecah',
    'rtp', 'rtp live', 'pola', 'bocoran', 'rungkad',
    'rungkat', 'anti rungkad', 'depo', 'wd', 'wede',
    'to', 'turnover', 'garansi kekalahan', 'modal receh', 'gampang menang',
    'pasti jp', 'new member', 'freebet', 'bonus new member', 'situs terpercaya',
    'agen resmi', 'link rtp', 'sikat', 'klik link', 'cek profil',
    'join sekarang', 'situs gacor',
    'sl0t', 's l o t', 's|ot', '5lot', 'gac0r', 'g4cor', 'z3us', 'zeu5',
    'sketer', 'seketer', 'jekpot', 'm4xwin', 'maxw1n', '5l0t', 'sl0t gacor',
    'info pusat', 'admin jarwo', 'admin riki', 'jam gacor', 'pola gacor', 'trik gacor',
    'depo pulsa', 'tanpa potongan', 'via dana', 'via ovo', 'via gopay', 'via qris', 'qris',
    'auto wd', 'jamin wd', 'anti sedot', 'pasti bayar', 'lunas', 'cair',
    'habanero', 'microgaming', 'sbobet', 'joker123', 'joker gaming', 'spadegaming',
    'gatot kaca', 'gatotkaca', 'koi gate', 'sugar rush', 'sweet bonanza',
    'parlay', 'mix parlay', 'roulette', 'baccarat', 'sicbo', 'domino', 'qiuqiu', 'qq', 'pkv', 'bandarq',
    'bola jalan', 'tebak skor', 'taruhan', 'judi', 'judol',
    'slotter', 'slotters', 'member baru', 'vip', 'v.i.p', 'link alternatif', 'anti nawala', 'bebas ip',
    '🎰', '🎲', '🃏', '♠️', '♣️', '♥️', '♦️', '💰', '💸', '💵', '🤑', '💎',
    '⚡', '💣', '💥', '🚀', '🔥', '🚨', '⚠️', '✅', '✔️', '💯', '👇', '➡️', '🔗', '📌',
    'gacor🔥', 'zeus⚡', 'slot🎰', 'maxwin🚀', 'maxwin💰', 'cuan🤑', 'depo💸',
    'wd💸', 'pecah💥', 'link👇', 'daftar✅', 'jp💯', 'rtp🔥', 'x500⚡',
    '【', '】', '「', '」', '『', '』', '[', ']', '{', '}', '<', '>',
    '!!!', '!!', '??', '>>', '<<', '==>', '-->', '=>', '->', '>>>', '<<<',
    '|', '||', '/', '//', '\\\\', '_', '-', '--',
    '***', '+++', '===', '~~', '•••', '^^', '$$', '$$$'
]

POLA_NAMA_SITUS = [
    r'raja\s*\d+', r'pulau\s*\d+', r'slot\s*\d+',
    r'spin\s*\d+', r'jp\s*\d+', r'maxwin\s*\d+',
    r'\w+\s*(777|303|88|99|168|365|4d|2d)\b',
]

def ganti_simbol_di_kata(teks):
    teks = re.sub(r'(?<=[a-z])4(?=[a-z])', 'a', teks)
    teks = re.sub(r'(?<=[a-z])3(?=[a-z])', 'e', teks)
    teks = re.sub(r'(?<=[a-z])0(?=[a-z])', 'o', teks)
    teks = re.sub(r'(?<=[a-z])1(?=[a-z])', 'i', teks)
    teks = re.sub(r'(?<=[a-z])5(?=[a-z])', 's', teks)
    return teks

def konversi_unicode_font(teks):
    hasil = ''
    for char in str(teks):
        if char in UNICODE_FONT_MAP:
            hasil += UNICODE_FONT_MAP[char]
        else:
            hasil += unicodedata.normalize('NFKC', char)
    return hasil

def normalisasi_teks(teks):
    teks = str(teks)
    teks = konversi_unicode_font(teks)
    teks = teks.lower()
    for simbol, huruf in SIMBOL_MAP.items():
        teks = teks.replace(simbol, huruf)
    teks = ganti_simbol_di_kata(teks)
    teks = re.sub(r'http\S+|www\S+|bit\.ly\S+', '', teks)
    teks = re.sub(r'([a-z])(\d)', r'\1 \2', teks)
    teks = re.sub(r'(\d)([a-z])', r'\1 \2', teks)
    teks = re.sub(r'[^\w\s]', ' ', teks)
    teks = re.sub(r'\s+', ' ', teks).strip()
    return teks

# Load Model (Global variable caching)
MODEL = None
VECTORIZER = None

def load_model():
    global MODEL, VECTORIZER
    if MODEL is None or VECTORIZER is None:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(base_dir, 'model_baseline.pkl')
        tfidf_path = os.path.join(base_dir, 'tfidf_vectorizer.pkl')
        
        try:
            with open(model_path, 'rb') as f:
                MODEL = pickle.load(f)
            with open(tfidf_path, 'rb') as f:
                VECTORIZER = pickle.load(f)
        except FileNotFoundError:
            print("Warning: Model files not found. Pastikan 'model_baseline.pkl' dan 'tfidf_vectorizer.pkl' sudah ada.")
            return False
    return True

def predict_judol(teks_input):
    """
    Prediksi komentar apakah judi atau normal.
    Mengembalikan dict dengan struktur:
    {
        "is_judi": bool,
        "confidence": float,
        "alasan": str
    }
    """
    if not load_model():
        return {"is_judi": False, "confidence": 0.0, "alasan": "Model not loaded"}

    teks_bersih = normalisasi_teks(teks_input)

    # Lapis 1: Cek keyword eksplisit
    for kw in KEYWORD_PASTI_JUDI:
        if kw in teks_bersih:
            return {"is_judi": True, "confidence": 100.0, "alasan": f"Keyword '{kw}' terdeteksi"}

    # Lapis 2: Cek pola nama situs
    for pola in POLA_NAMA_SITUS:
        if re.search(pola, teks_bersih, re.IGNORECASE):
            return {"is_judi": True, "confidence": 100.0, "alasan": f"Pola situs '{pola}' terdeteksi"}

    # Lapis 3: Model ML dengan threshold ketat
    teks_vector = VECTORIZER.transform([teks_bersih])
    confidence = MODEL.predict_proba(teks_vector)[0]
    pct_judi = confidence[1] * 100
    
    # Threshold: perlu 60% yakin untuk label JUDI
    if pct_judi >= 60.0:
        return {"is_judi": True, "confidence": float(pct_judi), "alasan": "Deteksi Machine Learning"}
    
    return {"is_judi": False, "confidence": float(confidence[0] * 100), "alasan": "Normal"}

if __name__ == "__main__":
    # Test ringan
    test_komentar = "Pagi ini senyum lebar banget gara-gara PULAu777."
    print("Test:", test_komentar)
    print("Hasil:", predict_judol(test_komentar))
