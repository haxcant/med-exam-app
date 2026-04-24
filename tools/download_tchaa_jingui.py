import json
import re
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup


START_URL = "http://tchaa.uncma.com.tw/u5/book12/book12.htm"
ALLOWED_PREFIX = "http://tchaa.uncma.com.tw/u5/book12/"
OUT_DIR = Path("sources/yizong_jingui")
RAW_DIR = OUT_DIR / "raw_html"
TXT_DIR = OUT_DIR / "text"
MANIFEST_PATH = OUT_DIR / "manifest.jsonl"
ALL_TEXT_PATH = OUT_DIR / "all_text.txt"

REQUEST_DELAY_SEC = 0.6
MAX_PAGES = 800


def safe_filename(url: str) -> str:
    parsed = urlparse(url)
    name = parsed.path.rstrip("/").split("/")[-1] or "index.htm"
    name = re.sub(r"[^0-9A-Za-z._-]+", "_", name)
    return name


def clean_text(html: str) -> tuple[str, str]:
    soup = BeautifulSoup(html, "lxml")

    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()

    title = soup.get_text("\n", strip=True).split("\n")[0] if soup.get_text(strip=True) else ""

    text = soup.get_text("\n", strip=True)
    lines = []
    for line in text.splitlines():
        line = re.sub(r"\s+", " ", line).strip()
        if line:
            lines.append(line)

    return title, "\n".join(lines)


def is_allowed_url(url: str) -> bool:
    if not url.startswith(ALLOWED_PREFIX):
        return False

    parsed = urlparse(url)
    if parsed.fragment:
        url = url.split("#", 1)[0]

    path = parsed.path.lower()
    return path.endswith((".htm", ".html"))


def extract_links(base_url: str, html: str) -> list[str]:
    soup = BeautifulSoup(html, "lxml")
    links = []

    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        full = urljoin(base_url, href).split("#", 1)[0]

        if is_allowed_url(full):
            links.append(full)

    return sorted(set(links))


def fetch(session: requests.Session, url: str) -> str:
    resp = session.get(url, timeout=20)
    resp.raise_for_status()

    # 老網站常見 Big5 / Big5-HKSCS / UTF-8 混用，requests 可能猜錯。
    if not resp.encoding or resp.encoding.lower() == "iso-8859-1":
        resp.encoding = resp.apparent_encoding or "utf-8"

    return resp.text


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    TXT_DIR.mkdir(parents=True, exist_ok=True)

    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 personal-study-corpus-builder/1.0"
    })

    queue = [START_URL]
    seen = set()
    records = []

    while queue and len(seen) < MAX_PAGES:
        url = queue.pop(0)

        if url in seen:
            continue
        if not is_allowed_url(url):
            continue

        print(f"[{len(seen) + 1}] Fetching {url}")

        try:
            html = fetch(session, url)
        except Exception as exc:
            print(f"  !! failed: {exc}")
            seen.add(url)
            continue

        seen.add(url)

        filename = safe_filename(url)
        raw_path = RAW_DIR / filename
        txt_path = TXT_DIR / f"{Path(filename).stem}.txt"

        raw_path.write_text(html, encoding="utf-8", errors="replace")

        title, text = clean_text(html)
        txt_path.write_text(
            f"URL: {url}\nTITLE: {title}\n\n{text}\n",
            encoding="utf-8",
            errors="replace",
        )

        records.append({
            "url": url,
            "title": title,
            "raw_html": str(raw_path.as_posix()),
            "text": str(txt_path.as_posix()),
            "chars": len(text),
        })

        for link in extract_links(url, html):
            if link not in seen and link not in queue:
                queue.append(link)

        time.sleep(REQUEST_DELAY_SEC)

    with MANIFEST_PATH.open("w", encoding="utf-8") as f:
        for rec in records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")

    with ALL_TEXT_PATH.open("w", encoding="utf-8") as out:
        for rec in records:
            txt = Path(rec["text"]).read_text(encoding="utf-8", errors="replace")
            out.write("\n\n" + "=" * 80 + "\n")
            out.write(f"URL: {rec['url']}\n")
            out.write(f"TITLE: {rec['title']}\n")
            out.write("=" * 80 + "\n\n")
            out.write(txt)

    print("\nDone.")
    print(f"Pages saved: {len(records)}")
    print(f"Manifest: {MANIFEST_PATH}")
    print(f"All text: {ALL_TEXT_PATH}")


if __name__ == "__main__":
    main()