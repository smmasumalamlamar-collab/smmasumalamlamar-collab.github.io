"""Weekly ORCID check.

Reads the PUBLIC ORCID works list (no login, no password), compares it with
site/content/publications.js, and adds any new works as DRAFT entries.
Nothing goes live by itself: the GitHub workflow opens a pull request that
you review, edit and merge.

Safety rules:
- If ORCID cannot be reached or returns something unexpected, nothing changes.
- Works already on the site (same DOI) are skipped.
- Works with no DOI whose title is close to an existing title are reported
  as possible duplicates and NOT added.
- Your existing curated entries are never edited or deleted.

Run locally:  python scripts/orcid_check.py
Test offline: ORCID_FIXTURE=path/to/works.json python scripts/orcid_check.py
"""
import difflib
import json
import os
import sys
import urllib.request

from content_io import load, norm_doi, norm_title, save

ORCID_ID = os.environ.get("ORCID_ID", "0009-0004-1932-4205")
API = f"https://pub.orcid.org/v3.0/{ORCID_ID}"
REPORT = os.environ.get("REPORT_FILE", "orcid-report.md")
MAX_NEW = 10  # more than this at once is treated as unexpected


def get_json(url):
    req = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "masumalam-site-orcid-check"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def write_report(lines, changed):
    with open(REPORT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    if os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a") as f:
            f.write(f"changed={'true' if changed else 'false'}\n")
    print("\n".join(lines))


def stop(reason):
    write_report(["## ORCID check: no changes made", "", reason,
                  "", "Your current publication list was kept as it is."], False)
    sys.exit(0)


def work_doi(group):
    for e in (group.get("external-ids") or {}).get("external-id", []):
        if e.get("external-id-type") == "doi":
            return norm_doi((e.get("external-id-normalized") or {}).get("value") or e.get("external-id-value"))
    return ""


def authors_from_detail(detail):
    names = []
    for c in ((detail.get("contributors") or {}).get("contributor") or []):
        n = ((c.get("credit-name") or {}).get("value") or "").strip()
        if n:
            names.append(n)
    return ", ".join(names)


def main():
    try:
        if os.environ.get("ORCID_FIXTURE"):
            with open(os.environ["ORCID_FIXTURE"], encoding="utf-8") as f:
                works = json.load(f)
        else:
            works = get_json(f"{API}/works")
    except Exception as e:  # network error, ORCID down, bad JSON
        stop(f"Could not read ORCID ({type(e).__name__}: {e}).")

    groups = works.get("group")
    if not isinstance(groups, list):
        stop("ORCID returned data in an unexpected format.")

    key, pubs = load("publications")
    site_dois = {norm_doi(p.get("doi")): p for p in pubs if p.get("doi")}
    site_titles = [norm_title(p.get("title")) for p in pubs]

    if not groups and site_dois:
        stop("ORCID returned zero works, but your site lists DOIs. This looks like an ORCID problem, so nothing was changed.")

    new, dupes, orcid_dois = [], [], set()
    for g in groups:
        summary = (g.get("work-summary") or [{}])[0]
        title = (((summary.get("title") or {}).get("title")) or {}).get("value", "").strip()
        doi = work_doi(g)
        if doi:
            orcid_dois.add(doi)
            if doi in site_dois:
                continue
        best = max((difflib.SequenceMatcher(None, norm_title(title), t).ratio() for t in site_titles), default=0)
        if best >= 0.85:
            dupes.append(f"- {title} (DOI: {doi or 'none'}) looks like an entry already on your site ({best:.0%} title match). Not added.")
            continue
        year = (((summary.get("publication-date") or {}).get("year")) or {}).get("value", "")
        journal = ((summary.get("journal-title") or {}).get("value")) or ""
        url = ((summary.get("url") or {}).get("value")) or ""
        authors = ""
        put = summary.get("put-code")
        if put and not os.environ.get("ORCID_FIXTURE"):
            try:
                authors = authors_from_detail(get_json(f"{API}/work/{put}"))
            except Exception:
                pass
        new.append({
            "authors": authors,
            "year": str(year),
            "title": title,
            "journal": journal,
            "volume": "",
            "issue": "",
            "pages": "",
            "doi": doi,
            "url": "" if doi else (url if url.startswith("https://") else ""),
            "reviewNote": "Added from ORCID. Check authors (in published order), volume, issue and pages, then delete this reviewNote line."
        })

    if len(new) > MAX_NEW:
        stop(f"ORCID returned {len(new)} works that are not on your site. That is more than expected, so nothing was changed. Check your ORCID record.")

    missing = [p for d, p in site_dois.items() if d not in orcid_dois]
    lines = ["## ORCID check", ""]
    if new:
        lines += [f"**{len(new)} new work(s) found on ORCID** and added as drafts to `site/content/publications.js`:", ""]
        lines += [f"- {w['title']} ({w['year'] or 'year?'}){' — DOI ' + w['doi'] if w['doi'] else ''}" for w in new]
        lines += ["", "Before merging: open the file in this pull request, complete the authors in published order, add volume/issue/pages, and delete each `reviewNote` line. Then check the preview link that Cloudflare posts below."]
    else:
        lines.append("No new works found on ORCID.")
    if dupes:
        lines += ["", "**Possible duplicates (not added):**", *dupes]
    if missing:
        lines += ["", "**On your site but not on ORCID** (no action taken; consider adding them to ORCID):"]
        lines += [f"- {p.get('title')}" for p in missing]

    if new:
        save("publications", key, pubs + new)
    write_report(lines, bool(new))


if __name__ == "__main__":
    main()
