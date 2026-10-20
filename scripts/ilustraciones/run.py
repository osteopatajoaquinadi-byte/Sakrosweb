import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fig import Lienzo
from PIL import Image, ImageDraw, ImageFont
import ejercicios as E
out = sys.argv[1]; ids = sys.argv[2:] or list(E.R)
os.makedirs(out, exist_ok=True)
for k in ids:
    cs = []
    for i in (0, 1):
        c = Lienzo(); E.R[k](c, i); cs.append(c)
    b = [c.caja() for c in cs]
    u = (min(x[0] for x in b), max(x[1] for x in b), min(x[2] for x in b), max(x[3] for x in b))
    for i, c in enumerate(cs):
        c.guardar(f"{out}/{k}-{i+1}.jpg", u)
# hoja de contacto
cols = 2; tw, th = 280, 187
sheet = Image.new("RGB", (cols * 2 * (tw + 6), len(ids) // cols * (th + 22) + th + 22), "white")
d = ImageDraw.Draw(sheet)
for n, k in enumerate(ids):
    r, cc = divmod(n, cols)
    for i in (0, 1):
        im = Image.open(f"{out}/{k}-{i+1}.jpg").resize((tw, th))
        x = (cc * 2 + i) * (tw + 6); y = r * (th + 22) + 20
        sheet.paste(im, (x, y)); d.rectangle([x, y, x + tw - 1, y + th - 1], outline=(220, 220, 220))
    d.text(((cc * 2) * (tw + 6) + 4, r * (th + 22) + 4), k, fill="black")
sheet.save(f"{out}/sheet.jpg", quality=85)
print("ok", len(ids))
