"""キャラの絵の仕上げ：白い背景を透明にし、余白をそろえて public/chars/<ID>.webp（画面用）・public/chars/<ID>-256.webp（小さく出すところ用）と
art/png/<ID>.png（OGP 画像の材料）にする。

使い方（プロジェクトのフォルダで）：
    python tools/art/process.py monk craftsman otter
    python tools/art/process.py            # art/raw/ にある全部

やること：
1. 画像のふちから「明るいところ」（背景と足元の影）を塗りつぶしでたどる。
   線の小さなすき間から体の中に入らないよう、線を少し太らせた画像でたどってから元の大きさに戻す
2. たどったところは「白を透明に」する（背景は透明、影は半透明の影として残る）
3. 絵のあるところで切り抜き、余白（OUT_MARGIN）を付けた正方形にして OUT_SIZE に縮める
"""

import sys
from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "art" / "raw"
OUT = ROOT / "public" / "chars"
OUT_PNG = ROOT / "art" / "png"

OUT_SIZE = 512
# タイトル・図鑑・相性など、小さく出すところ用（最初に読み込む量を減らす。受け入れ基準 4章の200KB）
SMALL_SIZE = 256
# 画面設計 9章の「240 のうち上下左右 16」と同じ割合
OUT_MARGIN = 16 / 240
# これより明るいところを「背景または影」とみなす（足元の影は R215 G193 B184 くらい）
LIGHT_MIN = 175
# キャラごとの上書き。明るい色の小物が背景とつながってしまう絵は、白に近いところだけを背景にする
# （otter：岩の下側に線がなく、岩の明るい灰色が背景とつながるため）
LIGHT_MIN_BY_ID = {"otter": 236}
# 線のすき間をふさぐために太らせる量（ピクセル。奇数）
CLOSE = 7
# これより薄い透明度は 0 にする（背景のざらつきを消す）
ALPHA_FLOOR = 10


def light_region(rgb: Image.Image, light_min: int) -> Image.Image:
    """ふちからたどれる明るいところ（L モード、255＝背景または影）"""
    w, h = rgb.size
    # 3色のうち一番暗い値（色の付いたところは暗く出る）
    px = rgb.load()
    dark = Image.new("L", (w, h))
    pd = dark.load()
    for y in range(h):
        for x in range(w):
            pd[x, y] = min(px[x, y])
    # 線を太らせる（暗いところを広げる）
    closed = dark.filter(ImageFilter.MinFilter(CLOSE))
    pc = closed.load()
    seen = Image.new("L", (w, h), 0)
    ps = seen.load()
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        q.append((x, 0))
        q.append((x, h - 1))
    for y in range(h):
        q.append((0, y))
        q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        if ps[x, y] or pc[x, y] < light_min:
            continue
        ps[x, y] = 255
        if x > 0:
            q.append((x - 1, y))
        if x < w - 1:
            q.append((x + 1, y))
        if y > 0:
            q.append((x, y - 1))
        if y < h - 1:
            q.append((x, y + 1))
    # 太らせた分だけ戻す（明るいところを広げる）。ただし元の画像で暗いところは含めない
    grown = seen.filter(ImageFilter.MaxFilter(CLOSE))
    pg = grown.load()
    for y in range(h):
        for x in range(w):
            if pg[x, y] and pd[x, y] < light_min:
                pg[x, y] = 0
    return grown


def white_to_alpha(rgb: Image.Image, region: Image.Image) -> Image.Image:
    """region の中だけ、白を透明にする（色は白との混ざりを戻す）"""
    w, h = rgb.size
    out = rgb.convert("RGBA")
    po, pr = out.load(), region.load()
    for y in range(h):
        for x in range(w):
            if not pr[x, y]:
                continue
            r, g, b, _ = po[x, y]
            a = max(255 - r, 255 - g, 255 - b)
            if a <= ALPHA_FLOOR:
                po[x, y] = (0, 0, 0, 0)
                continue
            k = 255 / a
            po[x, y] = (
                max(0, min(255, round(255 - (255 - r) * k))),
                max(0, min(255, round(255 - (255 - g) * k))),
                max(0, min(255, round(255 - (255 - b) * k))),
                a,
            )
    return out


def fit_square(img: Image.Image) -> Image.Image:
    bbox = img.getchannel("A").point(lambda v: 255 if v > ALPHA_FLOOR else 0).getbbox()
    if bbox:
        img = img.crop(bbox)
    side = max(img.size)
    inner = round(OUT_SIZE * (1 - 2 * OUT_MARGIN))
    scale = inner / side
    small = img.resize((max(1, round(img.width * scale)), max(1, round(img.height * scale))), Image.LANCZOS)
    canvas = Image.new("RGBA", (OUT_SIZE, OUT_SIZE), (0, 0, 0, 0))
    # 足元をそろえるため、縦は下寄せ（下の余白は OUT_MARGIN）
    x = (OUT_SIZE - small.width) // 2
    y = OUT_SIZE - round(OUT_SIZE * OUT_MARGIN) - small.height
    canvas.alpha_composite(small, (x, y))
    return canvas


def process(type_id: str) -> None:
    src = next((p for p in RAW.glob(f"{type_id}.*") if p.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}), None)
    if not src:
        print(f"{type_id}: art/raw/ に画像がありません")
        return
    rgb = Image.open(src).convert("RGB")
    region = light_region(rgb, LIGHT_MIN_BY_ID.get(type_id, LIGHT_MIN))
    out = fit_square(white_to_alpha(rgb, region))
    OUT.mkdir(parents=True, exist_ok=True)
    OUT_PNG.mkdir(parents=True, exist_ok=True)
    out.save(OUT_PNG / f"{type_id}.png", optimize=True)
    out.save(OUT / f"{type_id}.webp", quality=88, method=6)
    out.resize((SMALL_SIZE, SMALL_SIZE), Image.LANCZOS).save(OUT / f"{type_id}-{SMALL_SIZE}.webp", quality=85, method=6)
    files = (OUT_PNG / f"{type_id}.png", OUT / f"{type_id}.webp", OUT / f"{type_id}-{SMALL_SIZE}.webp")
    sizes = ", ".join(f"{p.name} {p.stat().st_size // 1024}KB" for p in files)
    print(f"{type_id}: {src.name} -> {sizes}")


if __name__ == "__main__":
    ids = sys.argv[1:] or sorted({p.stem for p in RAW.iterdir() if p.is_file() and p.suffix.lower() != ".md"})
    for i in ids:
        process(i)
