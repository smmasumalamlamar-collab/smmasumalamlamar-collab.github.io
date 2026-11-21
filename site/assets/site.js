/* Renders the page from the files in /content. You normally never need to edit this file. */
{
  const S = window.SITE || {};
  const P = S.profile || {};
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const $ = id => document.getElementById(id);
  const set = (id, html) => { const el = $(id); if (el) el.innerHTML = html; };
  const L = P.links || {};
  const linkNames = [['orcid', 'ORCID'], ['scholar', 'Google Scholar'], ['researchgate', 'ResearchGate'], ['linkedin', 'LinkedIn']];
  const liveLinks = linkNames.filter(([k]) => L[k]);

  // simple text fields
  document.querySelectorAll('[data-f]').forEach(el => { if (P[el.dataset.f]) el.textContent = P[el.dataset.f]; });

  // hero buttons and links
  const cvOn = P.cv && P.cv.show && P.cv.file;
  set('hero-btns',
    '<a class="btn p" href="#research">View Research</a>' +
    '<a class="btn s" href="#publications">View Publications</a>' +
    (cvOn ? `<a class="btn s" href="${esc(P.cv.file)}">Download CV</a>` : ''));
  set('hero-links', liveLinks.map(([k, n]) => `<a href="${esc(L[k])}">${n}</a>`).join(''));

  // about
  set('about-text', (P.about || []).map(p => `<p>${esc(p)}</p>`).join(''));
  const chips = (P.researchAreas || []).map(a => `<span class="chip">${esc(a)}</span>`).join('');
  const facts = (P.facts || []).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`);
  if (chips) facts.splice(Math.min(4, facts.length), 0, `<div><dt>Research areas</dt><dd><div class="chips">${chips}</div></dd></div>`);
  set('facts', facts.join(''));

  // research
  const R = S.projects || {};
  const cls = { ongoing: 'st-on', completed: 'st-done', proposed: 'st-prop' };
  set('research-intro', esc(R.intro));
  const F = R.featured;
  if (F) {
    set('featured',
      `<div class="body"><span class="status ${cls[F.status] || 'st-done'}">${esc(F.label)}</span><h3 id="f1">${esc(F.title)}</h3>${(F.text || []).map(t => `<p>${esc(t)}</p>`).join('')}</div>` +
      `<div class="side"><dl>${(F.details || []).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></div>`);
  } else { $('featured').remove(); }
  set('projects', (R.items || []).map(p =>
    `<div class="proj"><span class="status ${cls[p.status] || 'st-done'}">${esc(p.label)}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p><div class="meta">${esc(p.meta)}</div></div>`).join(''));

  // publications (APA-style citation built from the fields)
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
  // Entries with a "reviewNote" are drafts from the ORCID check. They show (marked Draft) on
  // preview links and on your own computer, and stay hidden on the live site until you finish them.
  const h = location.hostname;
  const isPreview = h === '' || h === 'localhost' || (h.endsWith('.pages.dev') && h.split('.').length > 3);
  const pubs = (S.publications || []).filter(p => !p.reviewNote || isPreview)
    .slice().sort((a, b) => String(b.year).localeCompare(String(a.year)));
  set('pubs', pubs.map(p => {
    const links = [];
    if (p.doi) links.push(`<a href="https://doi.org/${esc(p.doi)}">doi.org/${esc(p.doi)}</a>`);
    if (p.url) links.push(`<a href="${esc(p.url)}">${esc(p.urlLabel || 'Publisher page')}</a>`);
    const draft = p.reviewNote ? `<span class="status st-prop">Draft: ${esc(p.reviewNote)}</span>` : '';
    return `<li><div>${draft}<p class="cite">${cite(p)}</p><div class="plinks">${links.join('')}</div></div></li>`;
  }).join(''));
  set('profiles', linkNames.filter(([k]) => k !== 'linkedin' && L[k]).map(([k, n]) => `<a href="${esc(L[k])}">${n}${k === 'orcid' ? ' ' + esc(L[k].split('/').pop()) : ''}</a>`).join(''));

  // experience
  const E = S.experience || {};
  set('roles', (E.roles || []).map(r =>
    `<li><span class="when">${esc(r.when)}</span><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p>${(r.bullets || []).length ? '<ul>' + r.bullets.map(b => `<li>${esc(b)}</li>`).join('') + '</ul>' : ''}</li>`).join(''));
  set('courses', (E.courses || []).map(c => `<li>${esc(c)}</li>`).join(''));
  set('education', (E.education || []).map(([a, b]) => `<li><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join(''));
  set('training', (E.training || []).map(t => `<li>${esc(t)}</li>`).join(''));

  // industry
  const I = E.industry || {};
  set('industry-intro', esc(I.intro));
  set('flow', (I.workflow || []).map(([a, b], i) => `<li><span class="n">${i + 1}</span><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join(''));
  set('brands', (I.brands || []).length ? '<span class="bl">Brands and buyers worked with</span>' + I.brands.map(b => `<span class="brand">${esc(b)}</span>`).join('') : '');
  set('ind-roles', (I.roles || []).map(r =>
    `<article class="irole"><div class="ihead"><span class="when">${esc(r.when)}</span><h3>${esc(r.title)}</h3><p class="org">${esc(r.org)} · ${esc(r.place)}</p></div><ul>${(r.bullets || []).map(b => `<li>${esc(b)}</li>`).join('')}</ul></article>`).join(''));
  set('ind-training', esc(I.training));
  if (!I.roles) { const s = $('industry'); if (s) s.remove(); }

  // contact
  set('cv-btn', cvOn ? `<a class="btn cvbtn" href="${esc(P.cv.file)}">Download CV (PDF)</a>` : '');
  const contact = [];
  if (P.email) contact.push(`<a href="mailto:${esc(P.email)}">Email: ${esc(P.email)}</a>`);
  if (L.linkedin) contact.push(`<a href="${esc(L.linkedin)}">LinkedIn: ${esc(L.linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a>`);
  liveLinks.filter(([k]) => k !== 'linkedin').forEach(([k, n]) => contact.push(`<a href="${esc(L[k])}">${n}</a>`));
  set('contact-links', contact.join(''));
  set('footer', `© ${new Date().getFullYear()} ${esc(P.name)} · ${esc(P.footer)}`);

  // hero illustration: woven cloth with one broken thread under an inspection frame
  const s = $('weave');
  if (s) {
    const W = 500, H = 400, gap = 20;
    let seed = 7; const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
    let out = '<defs><linearGradient id="lamp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b4c80"/><stop offset="1" stop-color="#14284b"/></linearGradient><radialGradient id="v" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="#0c1a33" stop-opacity="0"/><stop offset="1" stop-color="#0c1a33" stop-opacity=".55"/></radialGradient></defs>';
    out += '<rect width="500" height="400" fill="url(#lamp)"/>';
    const brk = { col: 13, y0: 150, y1: 210 };
    for (let r = 0; r * gap < H + gap; r++) {
      const y = r * gap + gap / 2, t = 0.55 + rnd() * 0.2;
      out += `<rect x="0" y="${y - 6}" width="${W}" height="12" rx="6" fill="#c9d8ea" opacity="${t.toFixed(2)}"/>`;
    }
    for (let c = 0; c * gap < W + gap; c++) {
      const x = c * gap + gap / 2;
      for (let r = 0; r * gap < H + gap; r++) {
        if ((r + c) % 2) continue;
        const y = r * gap;
        if (c === brk.col && y > brk.y0 && y < brk.y1) continue;
        out += `<rect x="${x - 6}" y="${y - 2}" width="12" height="${gap + 4}" rx="6" fill="#e9f0f8"/><rect x="${x - 6}" y="${y - 2}" width="4" height="${gap + 4}" rx="2" fill="#ffffff" opacity=".55"/>`;
      }
    }
    const bx = brk.col * gap + gap / 2;
    out += `<path d="M${bx - 5} ${brk.y0 + 2} q4 10 0 18 M${bx + 3} ${brk.y0 + 2} q-3 12 2 16 M${bx - 4} ${brk.y1 - 2} q5 -9 1 -16 M${bx + 4} ${brk.y1 - 2} q-4 -10 0 -15" stroke="#e9f0f8" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    const fx = bx - 46, fy = brk.y0 - 16, fw = 92, fh = (brk.y1 - brk.y0) + 32;
    out += `<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" fill="#7cc4c2" fill-opacity=".14" stroke="#7cc4c2" stroke-width="3" rx="4"/>`;
    [[fx, fy, 1, 1], [fx + fw, fy, -1, 1], [fx, fy + fh, 1, -1], [fx + fw, fy + fh, -1, -1]].forEach(([x, y, dx, dy]) => { out += `<path d="M${x} ${y + dy * 16} V${y} H${x + dx * 16}" stroke="#ffffff" stroke-width="4" fill="none"/>`; });
    out += `<line x1="${fx + fw}" y1="${fy + fh / 2}" x2="${fx + fw + 60}" y2="${fy + fh / 2 - 40}" stroke="#7cc4c2" stroke-width="2"/><circle cx="${fx + fw + 60}" cy="${fy + fh / 2 - 40}" r="5" fill="#7cc4c2"/>`;
    out += '<rect width="500" height="400" fill="url(#v)"/>';
    s.innerHTML = out;
  }
}
