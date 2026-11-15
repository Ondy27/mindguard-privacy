"""Sjednocené screenshoty do rámečků telefonu na webu.

Každý screenshot: oříznou se systémové lišty (pokud je má), nahoře se dokreslí jednotný
stavový řádek (9:41, signál, Wi-Fi, baterie, průstřel kamery uprostřed) v barvě horní části
aplikace a dole proužek s indikátorem gesta. Výstup: assets/img/phone/<jméno>.jpg

Spuštění z kořene webu:  python tools/phone_shots.py
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets/img"
OUT = SRC / "phone"
S = 4  # supersampling lišt

# jméno: (oříznout nahoře, oříznout dole) v pixelech zdroje (šířka 540)
SHOTS = {
    "streakly-home.jpg": (32, 47),
    "streakly-new-task.jpg": (32, 47),
    "streakly-stats.jpg": (32, 47),
    "streakly-settings.jpg": (32, 47),
    "mg-screen-1.jpg": (0, 0),
    "mg-screen-2.jpg": (0, 0),
    "mg-screen-3.jpg": (0, 0),
    "mg-screen-4.jpg": (0, 0),
    "mat-path.jpg": (0, 0),
    "mat-lesson.jpg": (0, 0),
    "mat-summary.jpg": (0, 0),
    "ml-home.jpg": (40, 68),
    "ml-chapter.jpg": (40, 68),
    "ml-lesson.jpg": (40, 68),
}
BAR = 36  # výška stavového řádku (px při šířce 540)
NAV = 22  # spodní proužek s indikátorem gesta

FONT = None
for f in ("C:/Windows/Fonts/seguisb.ttf", "C:/Windows/Fonts/segoeui.ttf", "C:/Windows/Fonts/arial.ttf"):
    if Path(f).exists():
        FONT = f
        break


def edge_color(img: Image.Image, row: int) -> tuple:
    a = np.asarray(img.convert("RGB"))[row]
    # převládající barva řádku (medián), ať ji nerozhodí text
    return tuple(int(v) for v in np.median(a, axis=0))


def ink_for(bg: tuple) -> tuple:
    lum = 0.299 * bg[0] + 0.587 * bg[1] + 0.114 * bg[2]
    return (255, 255, 255) if lum < 150 else (20, 22, 28)


def status_bar(w: int, bg: tuple) -> Image.Image:
    W, H = w * S, BAR * S
    im = Image.new("RGB", (W, H), bg)
    d = ImageDraw.Draw(im)
    ink = ink_for(bg)
    cy = H / 2
    # čas vlevo
    font = ImageFont.truetype(FONT, int(15 * S)) if FONT else None
    d.text((26 * S, cy), "9:41", fill=ink, font=font, anchor="lm")
    # vpravo: signál, Wi-Fi, baterie
    x = W - 26 * S
    bw, bh = 24 * S, 11 * S
    d.rounded_rectangle([x - bw, cy - bh / 2, x, cy + bh / 2], radius=3 * S, outline=ink, width=int(1.6 * S))
    d.rounded_rectangle([x - bw + 3 * S, cy - bh / 2 + 3 * S, x - 6 * S, cy + bh / 2 - 3 * S], radius=1 * S, fill=ink)
    d.rectangle([x + 1 * S, cy - 2.5 * S, x + 3 * S, cy + 2.5 * S], fill=ink)
    x -= bw + 10 * S
    for i, r in enumerate((10, 6.5, 3)):  # Wi-Fi: oblouky a tečka
        if i < 2:
            d.arc([x - r * S * 2, cy - r * S * 1.4 + 4 * S, x, cy + r * S * 2.6 + 4 * S - r * S * 1.2],
                  start=225, end=315, fill=ink, width=int(2 * S))
        else:
            d.ellipse([x - r * S - 2 * S, cy + 1.5 * S, x - r * S + 2 * S, cy + 5.5 * S], fill=ink)
    x -= 32 * S
    for i in range(4):  # signál
        h = (4 + i * 2.5) * S
        d.rounded_rectangle([x + i * 5 * S, cy + 5 * S - h, x + i * 5 * S + 3 * S, cy + 5 * S], radius=1 * S, fill=ink)
    # průstřel kamery uprostřed
    r = 7 * S
    d.ellipse([W / 2 - r, cy - r, W / 2 + r, cy + r], fill=(5, 5, 6))
    d.ellipse([W / 2 - r * 0.45, cy - r * 0.45, W / 2 + r * 0.45, cy + r * 0.45], fill=(28, 30, 40))
    return im.resize((w, BAR), Image.LANCZOS)


def gesture_bar(w: int, bg: tuple) -> Image.Image:
    W, H = w * S, NAV * S
    im = Image.new("RGB", (W, H), bg)
    ink = ink_for(bg)
    ImageDraw.Draw(im).rounded_rectangle(
        [W / 2 - 60 * S, H / 2 - 2.5 * S, W / 2 + 60 * S, H / 2 + 2.5 * S], radius=3 * S, fill=ink + (0,)[:0]
    )
    return im.resize((w, NAV), Image.LANCZOS)


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for name, (top, bottom) in SHOTS.items():
        img = Image.open(SRC / name).convert("RGB")
        w, h = img.size
        body = img.crop((0, top, w, h - bottom))
        out = Image.new("RGB", (w, BAR + body.height + NAV))
        out.paste(status_bar(w, edge_color(body, 3)), (0, 0))
        out.paste(body, (0, BAR))
        out.paste(gesture_bar(w, edge_color(body, body.height - 4)), (0, BAR + body.height))
        out.save(OUT / name, quality=90, optimize=True)
        print(name, out.size)


if __name__ == "__main__":
    main()
