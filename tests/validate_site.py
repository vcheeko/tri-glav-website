#!/usr/bin/env python3
"""Small dependency-free release checks for the static TRI-GLAV site."""

from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
HTML_NAMES = ["index.html", "zasebnost.html", "pogoji-uporabe.html"]
HTML_FILES = [ROOT / name for name in HTML_NAMES] + [
    ROOT / "public_html-ready" / name for name in HTML_NAMES
]


class SiteParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.h1_count = 0
        self.refs: list[str] = []
        self.title_count = 0
        self.descriptions = 0
        self.canonicals = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if values.get("id"):
            self.ids.append(values["id"] or "")
        if tag == "h1":
            self.h1_count += 1
        if tag == "title":
            self.title_count += 1
        if tag == "meta" and values.get("name") == "description" and values.get("content"):
            self.descriptions += 1
        if tag == "link" and values.get("rel") == "canonical" and values.get("href"):
            self.canonicals += 1
        for attr in ("src", "href"):
            if values.get(attr):
                self.refs.append(values[attr] or "")


def local_path(html_file: Path, ref: str) -> Path | None:
    if not ref or ref.startswith(("#", "mailto:", "tel:", "data:")):
        return None
    parsed = urlparse(ref)
    if parsed.scheme or parsed.netloc:
        return None
    return (html_file.parent / parsed.path).resolve()


def validate_html(html_file: Path) -> list[str]:
    problems: list[str] = []
    parser = SiteParser()
    parser.feed(html_file.read_text(encoding="utf-8"))

    if parser.h1_count != 1:
        problems.append(f"{html_file.name}: expected 1 h1, found {parser.h1_count}")
    if parser.title_count != 1:
        problems.append(f"{html_file.name}: expected 1 title, found {parser.title_count}")
    if parser.descriptions != 1:
        problems.append(f"{html_file.name}: expected 1 meta description, found {parser.descriptions}")
    if parser.canonicals != 1:
        problems.append(f"{html_file.name}: expected 1 canonical link, found {parser.canonicals}")

    duplicates = sorted({item for item in parser.ids if parser.ids.count(item) > 1})
    if duplicates:
        problems.append(f"{html_file.name}: duplicate ids: {', '.join(duplicates)}")

    for ref in parser.refs:
        path = local_path(html_file, ref)
        if path is not None and not path.exists():
            problems.append(f"{html_file.name}: missing local reference {ref}")
    return problems


def main() -> int:
    problems: list[str] = []
    for html_file in HTML_FILES:
        if not html_file.exists():
            problems.append(f"missing page: {html_file.name}")
            continue
        problems.extend(validate_html(html_file))

    index = (ROOT / "index.html").read_text(encoding="utf-8")
    forbidden_claims = [
        "Prenesi app",
        "Prenesi zdaj",
        "Prenesi brezplačno",
        "aplikacija posreduje natančno lokacijo",
        "SOS pošlje lokacijo vsem",
        "Lahko ti reši življenje",
    ]
    for claim in forbidden_claims:
        if claim in index:
            problems.append(f"unverified public claim remains: {claim}")

    deployable = [
        "index.html",
        "styles.css",
        "script.js",
        "manifest.webmanifest",
        "zasebnost.html",
        "pogoji-uporabe.html",
        "robots.txt",
        "sitemap.xml",
    ]
    for relative in deployable:
        source = ROOT / relative
        bundle = ROOT / "public_html-ready" / relative
        if not bundle.exists():
            problems.append(f"public_html-ready missing: {relative}")
        elif source.read_bytes() != bundle.read_bytes():
            problems.append(f"public_html-ready differs: {relative}")

    if problems:
        print("SITE_VALIDATION=FAIL")
        for problem in problems:
            print(f"- {problem}")
        return 1

    print("SITE_VALIDATION=PASS")
    print(f"HTML_PAGES={len(HTML_FILES)}")
    print(f"DEPLOYABLE_FILES={len(deployable)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
