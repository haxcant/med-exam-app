from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def crop_grid(
    image_path: Path,
    out_dir: Path,
    left: int,
    top: int,
    right: int,
    bottom: int,
    cols: int,
    rows: int,
    xpad: int,
    ytop: int,
    ybottom: int,
    prefix: str,
) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    img = Image.open(image_path)
    cell_w = (right - left) / cols
    cell_h = (bottom - top) / rows

    for row in range(rows):
        for col in range(cols):
            x0 = int(left + col * cell_w + xpad)
            y0 = int(top + row * cell_h + ytop)
            x1 = int(left + (col + 1) * cell_w - xpad)
            y1 = int(top + row * cell_h + ybottom)
            out_path = out_dir / f"{prefix}_r{row+1}_c{col+1}.png"
            img.crop((x0, y0, x1, y1)).save(out_path)
            print(f"saved: {out_path}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="用固定網格批次切出交通標誌圖片。")
    parser.add_argument("image", type=Path, help="已渲染好的頁面 PNG")
    parser.add_argument("--left", type=int, required=True)
    parser.add_argument("--top", type=int, required=True)
    parser.add_argument("--right", type=int, required=True)
    parser.add_argument("--bottom", type=int, required=True)
    parser.add_argument("--cols", type=int, required=True)
    parser.add_argument("--rows", type=int, required=True)
    parser.add_argument("--xpad", type=int, default=10)
    parser.add_argument("--ytop", type=int, default=30)
    parser.add_argument("--ybottom", type=int, default=130)
    parser.add_argument("--prefix", type=str, default="sign")
    parser.add_argument("--out-dir", type=Path, default=Path(__file__).resolve().parent / "manual_crops")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    crop_grid(
        image_path=args.image,
        out_dir=args.out_dir,
        left=args.left,
        top=args.top,
        right=args.right,
        bottom=args.bottom,
        cols=args.cols,
        rows=args.rows,
        xpad=args.xpad,
        ytop=args.ytop,
        ybottom=args.ybottom,
        prefix=args.prefix,
    )
