/* Renders the page from the files in /content. You normally never need to edit this file. */
{
  const S = window.SITE || {};
  const P = S.profile || {};
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const $ = id => document.getElementById(id);
  const set = (id, html) => { const el = $(id); if (el) el.innerHTML = html; };
  const L = P.links || {};
  const linkNames = [['orcid', 'ORCID'], ['scholar', 'Google Scholar'], ['researchgate', 'ResearchGate'], ['linkedin', 'LinkedIn']];
  const live = linkNames.filter(([k]) => L[k]);
  const cvOn = !!(P.cv && P.cv.show && P.cv.file);

  // simple text fields
  document.querySelectorAll('[data-f]').forEach(el => { const v = P[el.dataset.f]; if (v) el.textContent = v; else if (el.tagName === 'P') el.remove(); });
  if (P.name) document.title = P.name;

  // hero buttons: View Research, Download CV (only when a public CV exists), View Publications
  set('hero-btns',
    '<a class="btn primary" href="#research">View Research</a>' +
    (cvOn ? `<a class="btn ghost" href="${esc(P.cv.file)}">Download CV</a>` : '') +
    '<a class="btn ghost" href="#publications">View Publications</a>');

  // at-a-glance panel: current positions, research areas, profile links
  const facts = P.facts || [];
  const top = facts.slice(0, 3), rest = facts.slice(3);
  const chips = (P.researchAreas || []).map(a => `<span class="chip">${esc(a)}</span>`).join('');
  set('glance', '<h2>At a glance</h2><dl>' +
    top.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('') +
    (chips ? `<div><dt>Research areas</dt><dd><span class="chips">${chips}</span></dd></div>` : '') +
    '</dl>' + (live.length ? `<div class="plinks">${live.map(([k, n]) => `<a href="${esc(L[k])}">${n}</a>`).join('')}</div>` : ''));

  // about
  set('about-text', (P.about || []).map(p => `<p>${esc(p)}</p>`).join(''));
  set('facts', rest.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join(''));

  // research
  const R = S.projects || {};
  const cls = { ongoing: 'st-on', completed: 'st-done', proposed: 'st-prop' };
  set('research-intro', esc(R.intro));
  const F = R.featured;
  if (F) {
    set('featured',
      `<div class="feature-head"><span class="status ${cls[F.status] || 'st-done'}">${esc(F.label)}</span><h3 id="f1">${esc(F.title)}</h3>${(F.text || []).map(t => `<p>${esc(t)}</p>`).join('')}</div>` +
      ((F.pipeline || []).length ? `<ol class="pipe" aria-label="Inspection pipeline">${F.pipeline.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : '') +
      `<dl class="fgrid">${(F.details || []).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`);
  } else { $('featured').remove(); }
  set('projects', (R.items || []).map(p =>
    `<div class="card"><span class="status ${cls[p.status] || 'st-done'}">${esc(p.label)}</span><h4>${esc(p.title)}</h4><p>${esc(p.text)}</p><div class="meta">${esc(p.meta)}</div></div>`).join(''));

  // publications: APA-style citations; author names stay exactly as published
  const M = P.scholarMetrics;
  if (M && M.checked) {
    set('metrics', `<div><b>${esc(M.citations)}</b><span>citations</span></div><div><b>${esc(M.hIndex)}</b><span>h-index</span></div><div><b>${esc(M.i10Index)}</b><span>i10-index</span></div><small>Google Scholar metrics, checked ${esc(M.checked)}.</small>`);
  } else { $('metrics').remove(); }
  const cite = p => {
    let s = `${esc(p.authors)} (${esc(p.year)}). ${esc(p.title)}.`;
    if (p.journal) {
      s += ` <i>${esc(p.journal)}${p.volume ? ', ' + esc(p.volume) : ''}</i>`;
      if (p.issue) s += `(${esc(p.issue)})`;
      if (p.pages) s += `, ${esc(p.pages)}`;
      s += '.';
    }
    return s;
  };
  // Entries with a "reviewNote" are drafts from the ORCID check: shown (marked Draft) on
  // preview links and on your own computer, hidden on the live site until you finish them.
  const h = location.hostname;
  const isPreview = h === '' || h === 'localhost' || (h.endsWith('.pages.dev') && h.split('.').length > 3);
  const pubs = (S.publications || []).filter(p => !p.reviewNote || isPreview)
    .slice().sort((a, b) => String(b.year).localeCompare(String(a.year)));
  set('pubs', pubs.map(p => {
    const links = [];
    if (p.doi) links.push(`<a href="https://doi.org/${esc(p.doi)}">doi.org/${esc(p.doi)}</a>`);
    if (p.url) links.push(`<a href="${esc(p.url)}">${esc(p.urlLabel || 'Publisher page')}</a>`);
    const draft = p.reviewNote ? `<span class="status st-prop">Draft: ${esc(p.reviewNote)}</span> ` : '';
    return `<li>${draft}<p class="cite">${cite(p)}</p><div class="plinks">${links.join('')}</div></li>`;
  }).join(''));
  set('profiles', live.map(([k, n]) => `<a class="btn ghost" href="${esc(L[k])}">${n}</a>`).join(''));

  // teaching & experience
  const E = S.experience || {};
  set('roles', (E.roles || []).map(r => {
    const [title, org] = String(r.title).split(' · ');
    return `<li><span class="when">${esc(r.when)}</span><h4>${esc(title)}${org ? ', ' + esc(org) : ''}</h4><p>${esc(r.text)}</p>${(r.bullets || []).length ? '<ul>' + r.bullets.map(b => `<li>${esc(b)}</li>`).join('') + '</ul>' : ''}</li>`;
  }).join(''));
  set('courses', (E.courses || []).map(c => `<li>${esc(c)}</li>`).join(''));
  set('education', (E.education || []).map(([a, b]) => `<li><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join(''));
  set('training', (E.training || []).map(t => `<li>${esc(t)}</li>`).join(''));

  const I = E.industry;
  if (I && (I.roles || []).length) {
    set('industry-intro', esc(I.intro));
    set('flow', (I.workflow || []).map(([a, b], i) => `<li><span class="n">${i + 1}</span><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join(''));
    set('brands', (I.brands || []).length ? '<span class="bl">Brands and buyers I worked with</span>' + I.brands.map(b => `<span class="brandtag">${esc(b)}</span>`).join('') : '');
    set('ind-roles', I.roles.map(r =>
      `<article class="card"><span class="when">${esc(r.when)}</span><h4>${esc(r.title)}</h4><p class="org">${esc(r.org)} · ${esc(r.place)}</p><ul>${(r.bullets || []).map(b => `<li>${esc(b)}</li>`).join('')}</ul></article>`).join(''));
    set('ind-training', esc(I.training));
  } else { const s = $('industry'); if (s) s.remove(); }

  // contact
  set('cv-btn', cvOn ? `<a class="btn primary" href="${esc(P.cv.file)}">Download CV (PDF)</a>` : '');
  const contact = [];
  if (P.email) contact.push(['Email', `mailto:${P.email}`, P.email]);
  live.forEach(([k, n]) => contact.push([n, L[k], L[k].replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')]));
  set('contact-links', contact.map(([n, u, t]) => `<li><span>${esc(n)}</span><a href="${esc(u)}">${esc(t)}</a></li>`).join(''));
  set('footer', `© ${new Date().getFullYear()} ${esc(P.name)}${P.footer ? ' · ' + esc(P.footer) : ''}`);
}
