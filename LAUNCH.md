# Launch guide (do these once)

## Free start: GitHub Pages (no cost, no domain) — DONE

Your site is published at https://smmasumalamlamar-collab.github.io/ from the repository `smmasumalamlamar-collab.github.io`. The steps below are kept for reference.

1. Create a **public** GitHub repository named `<your-username>.github.io` (for example `smmasumalam.github.io`) and upload these files (Step 1 below, but choose **Public**).
2. **Settings** → **Pages** → under **Build and deployment**, **Source**: choose **GitHub Actions**.
3. **Settings** → **Actions** → **General** → **Read and write permissions** + tick **Allow GitHub Actions to create and approve pull requests** → **Save**.
4. **Actions** tab → **Publish to GitHub Pages** → **Run workflow**. After about a minute the site is live at `https://<your-username>.github.io/`.

When you are ready for `masumalam.com`, continue with the Cloudflare steps below.

---

Recommended setup: **GitHub** (stores the files and the history) → **Cloudflare Pages** (free hosting with preview links) → **Cloudflare Registrar** (the domain, at cost).

Steps marked **⚠ Approval** cost money or make something public. Do them only when you are ready.

---

## Step 1 — Put the files on GitHub (free, private)

1. Go to **github.com** → **Sign up** (or **Sign in**).
2. Click **+** (top right) → **New repository**.
3. Repository name: `masumalam-site`. Choose **Private**. Leave everything else unticked. Click **Create repository**.
4. On the next page, click the link **uploading an existing file**.
5. Unzip `masumalam-site.zip` on your computer. Open the `masumalam-site` folder and **select everything inside it** (the `site`, `scripts`, `.github` folders and the files).
   - **Mac:** the `.github` folder is hidden. In Finder press **Cmd + Shift + .** (period) to show it.
   - **Windows:** in File Explorer choose **View** → **Show** → **Hidden items**.
6. Drag them into the GitHub upload box. Wait until every file is listed.
7. Click **Commit changes**.
8. Check that the repository shows `.github`, `scripts`, `site`, `README.md`, `LAUNCH.md`. If `.github` is missing, repeat steps 4–7 with just that folder.

**Allow the ORCID check to open review requests:**

9. In the repository click **Settings** → **Actions** → **General**.
10. Under **Workflow permissions** choose **Read and write permissions** and tick **Allow GitHub Actions to create and approve pull requests**. Click **Save**.

## Step 2 — Connect Cloudflare Pages ⚠ Approval (makes a public preview address)

1. Go to **dash.cloudflare.com** → **Sign up** (free plan).
2. In the left menu click **Workers & Pages** → **Create application** → **Pages** tab → **Connect to Git** (may be labelled **Import an existing Git repository**).
3. Click **Connect GitHub**, sign in, choose **Only select repositories** → `masumalam-site` → **Install & Authorize**.
4. Select `masumalam-site` → **Begin setup**.
5. Fill in:
   - **Project name:** `masumalam-site`
   - **Production branch:** `main`
   - **Framework preset:** `None`
   - **Build command:** *(leave empty)*
   - **Build output directory:** `site`
6. Click **Save and Deploy**. After about a minute you get `https://masumalam-site.pages.dev`.
7. Open it on your computer and phone. Check: the menu jumps to each section, the ORCID / Scholar / LinkedIn links open, and the publications show DOIs.

From now on every pull request gets its own **preview link**, and only **merging** changes the live site.

## Step 3 — Buy the domain ⚠ Approval (costs money)

1. Cloudflare dashboard → **Domain Registration** → **Register Domains**.
2. Search `masumalam.com`. Check the price shown at checkout (expected about $10.46/year, no markup on renewal).
3. Click **Purchase**, fill in your contact details, add payment, and confirm. Keep **Auto-renew** on.
4. WHOIS privacy is included; your name and address are not published.

## Step 4 — Connect the domain ⚠ Approval (DNS change)

Because the domain is in the same Cloudflare account, Cloudflare creates the DNS records for you.

1. **Workers & Pages** → `masumalam-site` → **Custom domains** → **Set up a custom domain**.
2. Type `masumalam.com` → **Continue** → **Activate domain**.
3. Repeat for `www.masumalam.com`.

The records Cloudflare creates (you can see them under **DNS** → **Records**):

| Type | Name | Target / Content | Proxy status |
|---|---|---|---|
| CNAME | `@` (masumalam.com) | `masumalam-site.pages.dev` | Proxied (orange cloud) |
| CNAME | `www` | `masumalam-site.pages.dev` | Proxied (orange cloud) |

If your project name ends up different (Cloudflare adds letters when a name is taken), the target is the exact address shown at the top of your Pages project page, ending in `.pages.dev`.

**If you buy the domain somewhere else** (for example Porkbun): in Cloudflare click **Add a domain** → enter it → **Free** plan. Cloudflare shows **two nameservers** (on the domain's **Overview** page, under **Nameservers**). Copy both into your registrar's **Nameservers** setting, replacing the old ones. Then do steps 1–3 above.

## Step 5 — Check HTTPS

1. On the **Custom domains** tab, wait until both domains show **Active** (usually minutes, up to 24 hours).
2. Open `https://masumalam.com`. The browser shows a padlock.
3. Cloudflare dashboard → your domain → **SSL/TLS** → **Edge Certificates** → turn on **Always Use HTTPS**.
4. Optional: send `www` visitors to the main address. **Rules** → **Redirect Rules** → **Create rule** → template **Redirect from WWW to root** → **Deploy**.

## Step 6 — Test the ORCID check once

**Actions** tab → **Weekly ORCID check** → **Run workflow** → **Run workflow**. After it finishes, open the run: the summary should say "No new works found on ORCID" (your three ORCID works are already on the site).

---

## Before you go public: checklist

- [ ] Public CV PDF prepared without private details (see README → *Replace or add the CV*)
- [ ] Contact email chosen (`profile.js` → `"email"`)
- [ ] ResearchGate link added once your profile is live (`profile.js` → `"links"` → `"researchgate"`)
- [ ] Open items from the portfolio review list confirmed (degree name and dates, project status)
