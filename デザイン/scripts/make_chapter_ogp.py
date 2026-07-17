#!/usr/bin/env python3
"""各話用OGP画像（1200×630 JPEG）を生成する。

使い方:
    python3 デザイン/scripts/make_chapter_ogp.py
"""
from pathlib import Path
import re
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[2]
CHAPTERS = ROOT / "本編"
BACKGROUND = ROOT / "web" / "public" / "hero-poster.webp"
OUT = ROOT / "web" / "public" / "og"
FONT = "/System/Library/Fonts/ヒラギノ明朝 ProN.ttc"
W, H = 1200, 630


def fit(text: str, draw: ImageDraw.ImageDraw, max_width: int, start: int = 62):
    size = start
    while size > 34:
        font = ImageFont.truetype(FONT, size, index=2)
        if draw.textlength(text, font=font) <= max_width:
            return font
        size -= 2
    return ImageFont.truetype(FONT, size, index=2)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    bg = Image.open(BACKGROUND).convert("RGB")
    scale = max(W / bg.width, H / bg.height)
    bg = bg.resize((int(bg.width * scale), int(bg.height * scale)), Image.Resampling.LANCZOS)
    bg = bg.crop(((bg.width - W) // 2, (bg.height - H) // 2, (bg.width + W) // 2, (bg.height + H) // 2))
    bg = ImageEnhance.Color(bg).enhance(0.78).filter(ImageFilter.GaussianBlur(1.2))

    for path in sorted(CHAPTERS.glob("第*話.md")):
        match = re.search(r"第(\d+)話", path.stem)
        if not match:
            continue
        number = int(match.group(1))
        first = next((line.strip() for line in path.read_text(encoding="utf-8").splitlines() if line.strip()), path.stem)
        title = re.sub(r"^第[^\s　]+話[\s　]*", "", first)

        image = bg.copy().convert("RGBA")
        overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        od = ImageDraw.Draw(overlay)
        od.rectangle((0, 0, W, H), fill=(7, 31, 32, 96))
        for x in range(760):
            alpha = int(230 * (1 - x / 760))
            od.line((x, 0, x, H), fill=(13, 51, 53, alpha))
        image = Image.alpha_composite(image, overlay)
        draw = ImageDraw.Draw(image)

        gold = (232, 220, 174, 255)
        paper = (251, 250, 244, 255)
        seal = (193, 75, 56, 255)
        eyebrow = ImageFont.truetype(FONT, 22, index=0)
        label = ImageFont.truetype(FONT, 34, index=2)
        title_font = fit(title, draw, 760)
        small = ImageFont.truetype(FONT, 22, index=0)

        draw.text((72, 82), "WEB NOVEL  /  ISEKAI RISQUÉ COMEDY", font=eyebrow, fill=gold)
        draw.rounded_rectangle((70, 144, 238, 202), radius=7, fill=seal)
        draw.text((92, 151), f"第{number}話", font=label, fill=paper)
        draw.text((70, 250), title, font=title_font, fill=paper)
        draw.line((70, 357, 670, 357), fill=gold, width=2)
        draw.text((70, 390), "2度目の転生は女遊び人でした", font=small, fill=paper)
        draw.text((70, 435), "戦えない女遊び人の、異世界お色気コメディ", font=small, fill=gold)
        draw.rectangle((0, 0, W, 4), fill=(15, 140, 141, 255))
        draw.rectangle((0, H - 4, W, H), fill=(35, 140, 104, 255))

        output = OUT / f"chapter-{number:02d}.jpg"
        image.convert("RGB").save(output, "JPEG", quality=86, optimize=True, progressive=True)
        print("wrote", output)


if __name__ == "__main__":
    main()
