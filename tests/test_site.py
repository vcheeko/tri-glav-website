from __future__ import annotations

import json
import re
import unittest
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"


class SiteParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.local_refs: list[tuple[str, str]] = []
        self.images: list[dict[str, str]] = []
        self.meta: list[dict[str, str]] = []
        self.links: list[dict[str, str]] = []
        self.html_attrs: dict[str, str] = {}
        self.title_depth = 0
        self.title_text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key: value or "" for key, value in attrs}
        if tag == "html":
            self.html_attrs = values
        if values.get("id"):
            self.ids.append(values["id"])
        if tag == "img":
            self.images.append(values)
        if tag == "meta":
            self.meta.append(values)
        if tag == "a":
            self.links.append(values)
        if tag == "title":
            self.title_depth += 1

        for attr in ("src", "href"):
            value = values.get(attr, "").strip()
            if not value or value.startswith(("#", "http://", "https://", "mailto:", "tel:", "data:")):
                continue
            if value.lower().startswith("javascript:"):
                self.local_refs.append(("unsafe-javascript-url", value))
                continue
            clean = value.split("?", 1)[0].split("#", 1)[0]
            if clean:
                self.local_refs.append((tag, clean))

    def handle_endtag(self, tag: str) -> None:
        if tag == "title" and self.title_depth:
            self.title_depth -= 1

    def handle_data(self, data: str) -> None:
        if self.title_depth:
            self.title_text.append(data)


def parse_site() -> SiteParser:
    parser = SiteParser()
    parser.feed(INDEX.read_text(encoding="utf-8"))
    return parser


class StaticSiteQualityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.html = INDEX.read_text(encoding="utf-8")
        cls.parser = parse_site()

    def test_document_identity_and_language(self) -> None:
        self.assertTrue(self.html.lstrip().lower().startswith("<!doctype html>"))
        self.assertEqual(self.parser.html_attrs.get("lang"), "sl")
        self.assertIn("TRI-GLAV", "".join(self.parser.title_text).strip())

    def test_required_metadata_is_present(self) -> None:
        meta_by_name = {item.get("name"): item for item in self.parser.meta if item.get("name")}
        self.assertTrue(meta_by_name.get("description", {}).get("content", "").strip())
        self.assertEqual(meta_by_name.get("robots", {}).get("content"), "noindex,follow")
        self.assertIn('rel="canonical" href="https://www.tri-glav.si/"', self.html)
        self.assertIn('property="og:title"', self.html)
        self.assertIn('name="twitter:card"', self.html)

    def test_all_local_asset_references_exist(self) -> None:
        missing: list[str] = []
        unsafe: list[str] = []
        for tag, relative in self.parser.local_refs:
            if tag == "unsafe-javascript-url":
                unsafe.append(relative)
                continue
            candidate = (ROOT / relative).resolve()
            try:
                candidate.relative_to(ROOT.resolve())
            except ValueError:
                missing.append(f"scope-escape:{relative}")
                continue
            if not candidate.exists():
                missing.append(relative)
        self.assertEqual(unsafe, [], f"Unsafe javascript: URLs: {unsafe}")
        self.assertEqual(missing, [], f"Missing or escaping local references: {missing}")

    def test_images_have_meaningful_alt_attributes(self) -> None:
        missing_alt = [image.get("src", "<unknown>") for image in self.parser.images if not image.get("alt", "").strip()]
        self.assertEqual(missing_alt, [], f"Images missing alt text: {missing_alt}")

    def test_ids_are_unique_and_core_targets_exist(self) -> None:
        duplicates = [name for name, count in Counter(self.parser.ids).items() if count > 1]
        self.assertEqual(duplicates, [], f"Duplicate HTML ids: {duplicates}")
        for required in ("main", "home", "zgodba", "funkcije", "aplikacija", "kontakt", "contact-form"):
            self.assertIn(required, self.parser.ids)

    def test_internal_hash_links_point_to_existing_targets(self) -> None:
        targets = set(self.parser.ids)
        broken = []
        for link in self.parser.links:
            href = link.get("href", "")
            if href.startswith("#") and len(href) > 1 and href[1:] not in targets:
                broken.append(href)
        self.assertEqual(broken, [], f"Broken internal links: {broken}")

    def test_external_urls_use_https(self) -> None:
        insecure = re.findall(r'(?:href|src)="(http://[^"]+)"', self.html, flags=re.IGNORECASE)
        self.assertEqual(insecure, [], f"Insecure external URLs: {insecure}")

    def test_product_claim_boundary_remains_visible(self) -> None:
        readme = (ROOT / "README.md").read_text(encoding="utf-8")
        self.assertIn("not the finished mobile application", readme)
        self.assertIn("Production emergency system:** not implemented", readme)

    def test_deploy_mirror_matches_root_shell(self) -> None:
        mirror = ROOT / "public_html-ready"
        for relative in ("index.html", "styles.css", "script.js", "manifest.webmanifest", "service-worker.js"):
            self.assertEqual(
                (ROOT / relative).read_bytes(),
                (mirror / relative).read_bytes(),
                f"Deploy mirror drift: {relative}",
            )

    def test_pwa_shell_is_bounded_and_honest(self) -> None:
        manifest = json.loads((ROOT / "manifest.webmanifest").read_text(encoding="utf-8"))
        worker = (ROOT / "service-worker.js").read_text(encoding="utf-8")
        self.assertEqual(manifest.get("start_url"), "./")
        self.assertIn("Ne nadomešča številke 112", manifest.get("description", ""))
        self.assertIn('rel="manifest" href="manifest.webmanifest"', self.html)
        self.assertIn('navigator.serviceWorker.register("./service-worker.js")', self.html)
        self.assertIn('url.origin !== self.location.origin', worker)
        self.assertIn('request.mode === "navigate"', worker)
        self.assertNotIn("offline maps are available", worker.lower())


if __name__ == "__main__":
    unittest.main()
