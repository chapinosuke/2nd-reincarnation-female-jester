#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
OGP画像生成（1200×630 PNG）。再生成可能。
出力: web/public/ogp.png
デザイン正典: デザイン/トークン.md（色・書体）／実装指示書_サイト拡張.md §8-1

使い方:
    python3 デザイン/scripts/make_ogp.py
（リポジトリのルートから実行）
"""
import os
from PIL import Image, ImageDraw, ImageFont

# --- パス（このスクリプトの位置からリポジトリルートを解決） ---
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
KEYVIS = os.path.join(ROOT, "assets", "key-visual", "mia-mirror-shock-pajamas.jpeg")
OUT = os.path.join(ROOT, "web", "public", "ogp.png")

# --- 色（デザイントークン） ---
PAPER_50 = (251, 250, 244)
TIDE_500 = (15, 140, 141)
SAGE_500 = (35, 140, 104)
TIDE_900 = (13, 51, 53)
INK_700 = (69, 70, 64)
GILT_500 = (171, 138, 62)
SEAL_500 = (168, 60, 43)

W, H = 1200, 630

# --- フォント（ヒラギノ明朝 ProN。W6=index2 / W3=index0） ---
HIRA = "/System/Library/Fonts/ヒラギノ明朝 ProN.ttc"
f_title = ImageFont.truetype(HIRA, 74, index=2)   # W6
f_copy = ImageFont.truetype(HIRA, 28, index=0)    # W3
f_eyebrow = ImageFont.truetype(HIRA, 20, index=0) # W3（Cinzel不使用時の代替）
f_seal = ImageFont.truetype(HIRA, 56, index=2)    # W6


def h_gradient(w, h, c1, c2):
    """左→右の水平グラデーション画像を作る"""
    base = Image.new("RGB", (w, h))
    px = base.load()
    for x in range(w):
        t = x / max(1, w - 1)
        r = int(c1[0] + (c2[0] - c1[0]) * t)
        g = int(c1[1] + (c2[1] - c1[1]) * t)
        b = int(c1[2] + (c2[2] - c1[2]) * t)
        for y in range(h):
            px[x, y] = (r, g, b)
    return base


def draw_tracked(draw, xy, text, font, fill, tracking):
    """字間（tracking px）を付けて1行描画"""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        w = draw.textlength(ch, font=font)
        x += w + tracking


def wrap_by_width(draw, text, font, max_w):
    """日本語を最大幅で1文字ずつ折り返す"""
    lines, cur = [], ""
    for ch in text:
        if draw.textlength(cur + ch, font=font) > max_w and cur:
            lines.append(cur)
            cur = ch
        else:
            cur += ch
    if cur:
        lines.append(cur)
    return lines


def main():
    img = Image.new("RGB", (W, H), PAPER_50)
    draw = ImageDraw.Draw(img)

    # --- 右側の一枚絵（右40%＝x:720..1200）。高さいっぱいにカバー配置 ---
    img_x = int(W * 0.60)  # 720
    region_w = W - img_x   # 480
    photo = Image.open(KEYVIS).convert("RGB")
    scale = max(region_w / photo.width, H / photo.height)
    nw, nh = int(photo.width * scale), int(photo.height * scale)
    photo = photo.resize((nw, nh), Image.LANCZOS)
    left = (nw - region_w) // 2
    top = (nh - H) // 2
    photo = photo.crop((left, top, left + region_w, top + H))

    # 左端をpaper-50へなじませるアルファマスク（左160pxでフェード）
    mask = Image.new("L", (region_w, H), 255)
    mpx = mask.load()
    fade = 170
    for x in range(region_w):
        a = 0 if x <= 0 else min(255, int(255 * (x / fade)))
        for y in range(H):
            mpx[x, y] = a
    img.paste(photo, (img_x, 0), mask)

    # --- 上端・下端の3px tide→sage グラデ罫 ---
    rule = h_gradient(W, 3, TIDE_500, SAGE_500)
    img.paste(rule, (0, 0))
    img.paste(rule, (0, H - 3))

    # --- 左側テキスト ---
    x0 = 84
    # eyebrow（英字キャップス・gilt-500）
    draw_tracked(draw, (x0, 116), "TRANSMIGRATION COMEDY", f_eyebrow, GILT_500, 6)
    # タイトル2行（ヒラギノ明朝 W6・tide-900）
    draw.text((x0 - 2, 168), "2度目の転生は", font=f_title, fill=TIDE_900)
    draw.text((x0 - 2, 262), "女遊び人でした", font=f_title, fill=TIDE_900)
    # コピー（ヒラギノ明朝・ink-700）
    copy = "戦えない。魔法も使えない。装備はバニーガール衣装のみ。"
    lines = wrap_by_width(draw, copy, f_copy, 620)
    cy = 386
    for ln in lines:
        draw.text((x0, cy), ln, font=f_copy, fill=INK_700)
        cy += 42

    # --- 左下：朱印風の正方形（seal-500の枠＋「遊」） ---
    s = 104
    seal = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    sd = ImageDraw.Draw(seal)
    sd.rounded_rectangle([4, 4, s - 4, s - 4], radius=12, outline=SEAL_500, width=6)
    tb = sd.textbbox((0, 0), "遊", font=f_seal)
    tw, th = tb[2] - tb[0], tb[3] - tb[1]
    sd.text(((s - tw) / 2 - tb[0], (s - th) / 2 - tb[1]), "遊", font=f_seal, fill=SEAL_500)
    seal = seal.rotate(4, resample=Image.BICUBIC, expand=True)
    img.paste(seal, (x0 - 6, H - s - 70), seal)

    img.save(OUT, "PNG")
    print("wrote", OUT, img.size)


if __name__ == "__main__":
    main()
