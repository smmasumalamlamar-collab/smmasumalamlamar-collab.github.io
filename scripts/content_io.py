"""Read and write the content files in site/content.

Each file looks like:
    window.SITE = window.SITE || {};
    window.SITE.publications = [ ...JSON... ];
The part after "=" is plain JSON, so Python can read and rewrite it safely.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "site" / "content"
HEADER = "window.SITE = window.SITE || {};\n"
PATTERN = re.compile(r"window\.SITE\.(\w+)\s*=\s*(.*);\s*$", re.S)


def load(name):
    """Return (key, data) for site/content/<name>.js."""
    text = (CONTENT / f"{name}.js").read_text(encoding="utf-8")
    body = text.split(HEADER.strip(), 1)[-1].strip()
    m = PATTERN.match(body)
    if not m:
        raise ValueError(f"{name}.js: expected 'window.SITE.{name} = ...;'")
    try:
        return m.group(1), json.loads(m.group(2))
    except json.JSONDecodeError as e:
        line = text[:text.find(m.group(2))].count("\n") + e.lineno
        raise ValueError(f"{name}.js line {line}: {e.msg}. "
                         "Check for a missing comma, a missing quote, or an extra comma before ] or }.") from e


def save(name, key, data):
    out = HEADER + f"window.SITE.{key} = " + json.dumps(data, indent=2, ensure_ascii=False) + ";\n"
    (CONTENT / f"{name}.js").write_text(out, encoding="utf-8")


def norm_doi(doi):
    doi = (doi or "").strip().lower()
    doi = re.sub(r"^(https?://)?(dx\.)?doi\.org/", "", doi)
    return doi


def norm_title(t):
    return re.sub(r"[^a-z0-9]+", " ", (t or "").lower()).strip()
