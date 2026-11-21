"""Check the content files before a change goes live.

Run locally with:  python scripts/validate.py
GitHub runs it automatically on every pull request.
"""
import sys
from content_io import CONTENT, ROOT, load, norm_doi, norm_title

errors, warnings = [], []
ALLOW_DRAFTS = "--allow-drafts" in sys.argv


def need(cond, msg):
    if not cond:
        errors.append(msg)


try:
    _, profile = load("profile")
    _, pubs = load("publications")
    _, projects = load("projects")
    _, exp = load("experience")
except ValueError as e:
    print(f"ERROR: {e}")
    sys.exit(1)

# profile
for f in ("name", "headline", "intro", "about", "links"):
    need(profile.get(f), f"profile.js: '{f}' is missing or empty")
for k, url in (profile.get("links") or {}).items():
    need(url == "" or url.startswith("https://"), f"profile.js: link '{k}' must start with https:// (or be empty to hide it)")
cv = profile.get("cv") or {}
if cv.get("show"):
    cv_path = ROOT / "site" / cv.get("file", "")
    need(cv_path.is_file(), f"profile.js: cv.show is true but {cv.get('file')} was not found in site/")
email = profile.get("email", "")
need(email == "" or ("@" in email and " " not in email), "profile.js: email looks wrong")

# publications
seen_doi, seen_title = {}, {}
for i, p in enumerate(pubs, 1):
    label = f"publications.js entry {i} ({p.get('title', '?')[:50]})"
    for f in ("authors", "year", "title"):
        if f == "authors" and ALLOW_DRAFTS and p.get("reviewNote"):
            if not str(p.get(f, "")).strip():
                warnings.append(f"{label}: authors still to be filled in")
            continue
        need(str(p.get(f, "")).strip(), f"{label}: '{f}' is empty")
    need(str(p.get("year", "")).isdigit(), f"{label}: year should be a number like 2025")
    d = norm_doi(p.get("doi"))
    if d:
        need(d.startswith("10."), f"{label}: DOI should look like 10.xxxx/...")
        need(d not in seen_doi, f"{label}: same DOI as entry {seen_doi.get(d)} (duplicate)")
        seen_doi[d] = i
    t = norm_title(p.get("title"))
    if t in seen_title:
        warnings.append(f"{label}: same title as entry {seen_title[t]} (possible duplicate)")
    seen_title[t] = i
    if p.get("reviewNote"):
        warnings.append(f"{label}: still has a reviewNote. Check it, then delete the reviewNote line.")
    if p.get("url"):
        need(p["url"].startswith("https://"), f"{label}: url must start with https://")

# projects
for p in projects.get("items", []):
    need(p.get("status") in ("ongoing", "completed", "proposed"), f"projects.js: '{p.get('title')}' status must be ongoing, completed or proposed")

# experience
need(exp.get("roles"), "experience.js: roles list is empty")

for w in warnings:
    print(f"WARNING: {w}")
for e in errors:
    print(f"ERROR: {e}")
if errors:
    print(f"\n{len(errors)} problem(s) found. Fix them before merging.")
    sys.exit(1)
print(f"Content OK: {len(pubs)} publications, {len(projects.get('items', []))} projects, {len(exp.get('roles', []))} roles.")
