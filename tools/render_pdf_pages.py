from __future__ import annotations

import argparse
from pathlib import Path

import fitz
from PIL import Image


def render_pages(pdf_path: Path, out_dir: Path, pages: list[int], scale: float = 1.5) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(pdf_path)
    for page_num in pages:
      page = doc[page_num - 1]
      pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False)
      img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
      out = out_dir / f"page_{page_num}.png"
      img.save(out)
      print(f"saved: {out}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="將 PDF 指定頁面轉成 PNG，方便後續切圖。")
    parser.add_argument("pdf", type=Path, help="來源 PDF 路徑")
    parser.add_argument("--pages", nargs="+", type=int, required=True, help="要輸出的頁碼，例如 --pages 2 3 4")
    parser.add_argument("--scale", type=float, default=1.5, help="渲染倍率，預設 1.5")
    parser.add_argument("--out-dir", type=Path, default=Path(__file__).resolve().parent / "rendered_pages")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    render_pages(args.pdf, args.out_dir, args.pages, args.scale)
