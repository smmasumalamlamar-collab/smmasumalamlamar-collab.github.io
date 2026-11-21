# S. M. Masum Alam — academic portfolio

This repository holds the website. Every change goes through a **pull request**:
you see a preview link first, and the live site only changes when you click **Merge**.

## What's where

| To change… | Edit this file |
|---|---|
| Name, headline, biography, links, email, CV switch, Scholar metrics | `site/content/profile.js` |
| Publications | `site/content/publications.js` |
| Research and projects | `site/content/projects.js` |
| Academic jobs, courses, education, training, **industry experience** | `site/content/experience.js` (industry is under `"industry"`) |
| The CV PDF | `site/cv/S-M-Masum-Alam-CV.pdf` |
| Design (colors, fonts, layout) | `site/assets/site.css` (rarely needed) |

You never need to edit `index.html` or `site.js` to update content.

**Format rules** (the files are JSON inside a small wrapper):
- Text goes in "double quotes".
- Items in a list are separated by commas, and the **last item has no comma** after it.
- To hide a link or the email, leave it as `""`.

If you break the format, the **Check content** step on your pull request turns red and tells you the line number.

---

## How to publish any change (the approval workflow)

1. On GitHub, open the file you want to change (for example `site/content/publications.js`).
2. Click the **pencil icon** (Edit this file).
3. Make your change.
4. Click **Commit changes…** (green button, top right).
5. Choose **Create a new branch for this commit and start a pull request**, then click **Propose changes**.
6. Click **Create pull request**.
7. Wait about a minute. **On Cloudflare Pages** a comment with a **Preview URL** appears: open it and check the page on your phone and computer. **On free GitHub Pages** there is no preview link: check the **Files changed** tab carefully instead.
8. When the **Check content** step shows a green tick and the preview looks right, click **Merge pull request** → **Confirm merge**.
9. The live site updates within about a minute.

To throw a change away instead, click **Close pull request**.

## Add a publication

Open `site/content/publications.js`, put a comma after the last `}` in the list, and paste a new entry before the final `];`:

```json
  {
    "authors": "Alam, S. M. M., & Coauthor, A. B.",
    "year": "2027",
    "title": "Title of the article in sentence case",
    "journal": "Journal Name",
    "volume": "12",
    "issue": "3",
    "pages": "100–115",
    "doi": "10.xxxx/xxxxx",
    "url": ""
  }
```

- Keep the authors **in the published order**.
- If there is no DOI, leave `"doi": ""` and put the publisher link in `"url"`, plus `"urlLabel": "Publisher page"`.
- The site sorts publications by year automatically.

Then follow **How to publish any change** above.

## Replace or add the CV

The public link always stays the same: https://smmasumalamlamar-collab.github.io/cv/ (and https://smmasumalamlamar-collab.github.io/cv/S-M-Masum-Alam-CV.pdf). After a custom domain is added, the same paths work on it.

1. Save your public CV as a PDF named exactly **`S-M-Masum-Alam-CV.pdf`**. Remove your phone number, home address and referees' private contact details first.
2. On GitHub, open the `site/cv` folder → **Add file** → **Upload files** → drag the PDF in.
3. Choose **Create a new branch… and start a pull request** → **Propose changes** → **Create pull request**.
4. **First time only:** in the same pull request, edit `site/content/profile.js` and change `"show": false` to `"show": true` under `"cv"`. This turns on the **Download CV** buttons.
5. Check the preview, then **Merge**.

Uploading a new file with the same name replaces the old CV; the link does not change.

## Update Google Scholar metrics (manual, a few times a year)

Open your Google Scholar profile, then edit `"scholarMetrics"` in `site/content/profile.js`: citations, h-index, i10-index, and the date you checked them.

## The weekly ORCID check (automatic, needs your approval)

Every Monday the **Weekly ORCID check** reads your **public** ORCID works list (no password or login).

- If ORCID has a work that isn't on the site (matched by DOI), it opens a pull request called **"Review: new publications found on ORCID"** with a draft entry.
- Drafts carry a `"reviewNote"` line. They appear marked **Draft** on the preview link but stay **hidden on the live site** until you delete the `reviewNote` line.
- Works without a DOI whose title is very close to one already listed are reported as **possible duplicates** and not added.
- If ORCID is down or returns something unexpected, **nothing changes** and the reason is shown in the run summary.

To review: open the pull request → **Files changed** → click **…** → **Edit file** → fill in the authors (published order), volume, issue and pages → delete the `reviewNote` line → **Commit changes** → check the preview → **Merge**.

To run it now: **Actions** tab → **Weekly ORCID check** → **Run workflow** → **Run workflow**.

## Where the site is hosted

- **Now (free):** GitHub Pages at https://smmasumalamlamar-collab.github.io/ (repository `smmasumalamlamar-collab/smmasumalamlamar-collab.github.io`). The workflow `.github/workflows/pages.yml` publishes the `site` folder each time a change is merged.
- **Later (custom domain):** follow `LAUNCH.md` to move to Cloudflare Pages and `masumalam.com`, which adds preview links for every pull request. After the move you can delete `pages.yml`.

## Restore an earlier version

- **Fastest (Cloudflare):** Cloudflare dashboard → **Workers & Pages** → your project → **Deployments** → find the older deployment → **⋯** → **Rollback to this deployment**.
- **Permanent (GitHub):** open the merged pull request that caused the problem → click **Revert** → **Create pull request** → check the preview → **Merge**.

## What is automatic and what is manual

| Update | How |
|---|---|
| ORCID publications | Automatic weekly check → **you approve** by merging |
| Site goes live after a change | Automatic after **you merge** |
| Google Scholar metrics | Manual, `profile.js` |
| ResearchGate, LinkedIn links | Manual, `profile.js` → `"links"` (link only; no automatic import) |
| CV | Manual upload (see above) |

Google Scholar, ResearchGate and LinkedIn have no official public API for this, so the site only links to them; nothing logs in to those services.

## Check the content on your own computer (optional)

With Python installed: `python scripts/validate.py`. To preview, open `site/index.html` in a browser.
