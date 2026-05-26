"""
Извлечение страниц PDF в PNG с помощью PyMuPDF.
Использование: python pdf-to-png.py
"""
import fitz  # PyMuPDF
import os

PDF_PATH = r"D:\KIIP\site\Basic Understanding of Korean Society\한국사회 이해 기본.pdf"
OUT_DIR  = r"D:\KIIP\site\basic-sources-png\img"
DPI      = 200   # качество (150=быстро, 200=оптимально, 300=высокое)

os.makedirs(OUT_DIR, exist_ok=True)

doc = fitz.open(PDF_PATH)
total = len(doc)
print(f"PDF: {total} страниц")

for i, page in enumerate(doc, start=1):
    mat = fitz.Matrix(DPI / 72, DPI / 72)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    out_path = os.path.join(OUT_DIR, f"page-{i:03d}.png")
    pix.save(out_path)
    print(f"  [{i:3d}/{total}] -> page-{i:03d}.png  ({pix.width}x{pix.height})")

doc.close()
print(f"\nГотово! Сохранено в: {OUT_DIR}")
