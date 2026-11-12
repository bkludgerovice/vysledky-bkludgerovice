/*
 * Doplněk výsledkového webu: odkazy na fotky a diplomy (fotky.html).
 * Do index.html se přidává jediným řádkem před </body>:
 *   <script src="fotky-odkazy.js" defer></script>
 * Které závody mají fotky, se nastavuje v data/zavody.json v klíči "fotky".
 */
(function () {
  'use strict';
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  const nameKey = (s) => norm(s).split(' ').filter(Boolean).sort().join(' ');
  const ICON_CAM = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 3 7.2 5H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.2L15 3H9zm3 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>';
  const ICON_AWARD = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-4 12.7V22l4-2 4 2v-7.3A7 7 0 0 0 12 2zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2.2-.9 1.9-2.1.3 1.5 1.5-.3 2.1 1.8-1 1.9 1-.4-2.1 1.5-1.5-2.1-.3z"/></svg>';

  let MAP = {};
  const KAT = {};

  const css = document.createElement('style');
  css.textContent =
    'nav.tabs a.navlink{font-family:var(--display);font-weight:600;font-size:19px;letter-spacing:.02em;color:var(--bar-muted);padding:12px 14px 10px;border-bottom:4px solid transparent;text-decoration:none;white-space:nowrap}' +
    'nav.tabs a.navlink:hover{color:#fff}' +
    '.fx{display:inline-flex;gap:4px;margin-left:8px;vertical-align:-3px}' +
    '.fx a{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:50%;border:1px solid var(--line);color:var(--muted);background:var(--paper)}' +
    '.fx a:hover{color:var(--red);border-color:var(--red)}' +
    '.fx svg{width:15px;height:15px}' +
    '@media (max-width:600px){nav.tabs a.navlink{font-size:17px;padding:12px 9px 10px}}';
  document.head.appendChild(css);

  fetch('data/zavody.json', { cache: 'no-cache' }).then((r) => r.ok ? r.json() : {}).then((cfg) => {
    const f = (cfg && cfg.fotky) || {};
    Object.keys(f).forEach((k) => { const u = typeof f[k] === 'string' ? f[k] : (f[k] || {}).katalog; if (u && /^https:\/\//.test(u)) MAP[k] = u; });
    if (!Object.keys(MAP).length) return;
    addNav();
    const main = document.getElementById('main');
    let t = null;
    new MutationObserver(() => { clearTimeout(t); t = setTimeout(decorate, 60); }).observe(main, { childList: true, subtree: true });
    decorate();
  }).catch(() => {});

  function addNav() {
    const wrap = document.querySelector('nav.tabs .wrap');
    if (!wrap || wrap.querySelector('a.navlink')) return;
    const a = document.createElement('a');
    a.className = 'navlink'; a.href = 'fotky.html'; a.textContent = 'Fotky';
    const stat = wrap.querySelector('[data-tab="statistiky"]');
    wrap.insertBefore(a, stat || null);
  }

  function katalog(code) {
    if (!KAT[code]) {
      KAT[code] = fetch(MAP[code]).then((r) => r.json()).then((k) => {
        const byName = {}, foto = {};
        (k.fotky || []).forEach((f) => (f.c || []).forEach((c) => { foto[c] = (foto[c] || 0) + 1; }));
        (k.bezci || []).forEach((b) => { (byName[nameKey(b.j)] = byName[nameKey(b.j)] || []).push(b); });
        return { byName, foto };
      }).catch(() => { delete KAT[code]; return null; });
    }
    return KAT[code];
  }

  async function decorate() {
    const sel = document.getElementById('r-race'), tbl = document.getElementById('r-table');
    if (!sel || !tbl || !tbl.tBodies[0]) return;
    const code = sel.value;
    if (!MAP[code]) return;
    const k = await katalog(code);
    if (!k || sel.value !== code) return;
    for (const tr of tbl.tBodies[0].rows) {
      const cell = tr.cells[1];
      if (!cell || cell.querySelector('.fx')) continue;
      const btn = cell.querySelector('.linkbtn');
      if (!btn) continue;
      const hit = k.byName[nameKey(btn.textContent)];
      if (!hit) continue;
      const base = 'fotky.html?z=' + encodeURIComponent(code) + '&';
      const q = hit.length === 1 ? 'c=' + hit[0].c : 'j=' + encodeURIComponent(btn.textContent);
      const n = hit.reduce((s, b) => s + (k.foto[b.c] || 0), 0);
      const span = document.createElement('span');
      span.className = 'fx';
      span.innerHTML = (n ? '<a href="' + base + q + '" title="Fotky (' + n + ')" aria-label="Fotky">' + ICON_CAM + '</a>' : '') +
        '<a href="' + base + q + (hit.length === 1 ? '&diplom=1' : '') + '" title="Můj diplom" aria-label="Můj diplom">' + ICON_AWARD + '</a>';
      btn.after(span);
    }
  }
})();
