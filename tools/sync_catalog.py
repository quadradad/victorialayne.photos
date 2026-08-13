#!/usr/bin/env python3
"""Re-sync photos/web-ready/catalog.json site_uses for one site gallery category.

Usage: python3 tools/sync_catalog.py <category>   (e.g. concerts, portraits)
Run from anywhere; paths resolve relative to this script. Needs Pillow + imagehash.

For every image in website/img/portfolio/<category>/, finds its photo-library
entry by pHash and records the site path in that entry's site_uses. Existing
site_uses references to this category are cleared first, so deletions on the
site are reflected too (library photos are never deleted by this script).

Match bands (hamming distance on 64-bit pHash):
  <=8   confident match
  9-12  accepted with a WARNING — eyeball these (dark concert shots false-positive here)
  >=13  no match — listed as NEW; the photo needs manual ingest into the library
"""
import json
import os
import sys

from PIL import Image
import imagehash

HERE = os.path.dirname(os.path.abspath(__file__))
WEBSITE = os.path.dirname(HERE)
PROJECT = os.path.dirname(WEBSITE)
CATALOG = os.path.join(PROJECT, "photos", "web-ready", "catalog.json")


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit("usage: sync_catalog.py <site-category>")
    cat = sys.argv[1]
    site_dir = os.path.join(WEBSITE, "img", "portfolio", cat)
    if not os.path.isdir(site_dir):
        sys.exit(f"no such site category folder: {site_dir}")

    catalog = json.load(open(CATALOG))
    prefix = f"img/portfolio/{cat}/"

    # 1. clear existing references to this site category, catalog-wide
    cleared = 0
    for e in catalog:
        before = len(e.get("site_uses", []))
        e["site_uses"] = [u for u in e.get("site_uses", []) if not u.startswith(prefix)]
        cleared += before - len(e["site_uses"])

    # 2. match every current site file back to a library entry
    hashes = [(e, imagehash.hex_to_hash(e["phash"])) for e in catalog if e.get("phash")]
    unmatched, warned, matched = [], [], 0
    for f in sorted(os.listdir(site_dir)):
        if not f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            continue
        with Image.open(os.path.join(site_dir, f)) as im:
            ph = imagehash.phash(im)
        best, bestd = None, 999
        for e, h in hashes:
            d = ph - h
            if d < bestd:
                best, bestd = e, d
        use = prefix + f
        if bestd <= 12 and best is not None:
            best["site_uses"].append(use)
            matched += 1
            note = ""
            if bestd >= 9:
                warned.append(f)
                note = "  <-- WARNING: 9-12 band, eyeball this"
            print(f"{f} -> {best['file']} (d={bestd}){note}")
        else:
            unmatched.append(f)
            print(f"{f} -> NO MATCH (best d={bestd} vs {best['file'] if best else '?'}) — needs library ingest")

    with open(CATALOG, "w") as fh:
        json.dump(catalog, fh, indent=1)
        fh.write("\n")
    print(f"\ncleared {cleared} old refs · matched {matched} · warnings {len(warned)} · unmatched {len(unmatched)}")


if __name__ == "__main__":
    main()
