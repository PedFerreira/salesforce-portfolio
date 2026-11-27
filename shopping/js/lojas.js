/* Diretório de lojas: busca sem acentos, filtro por segmento, ordenação e estado na URL */
(() => {
    'use strict';
    const { segments, stores } = window.GAMA_DATA;
    const segBy = Object.fromEntries(segments.map((s) => [s.slug, s]));
    const $ = (id) => document.getElementById(id);
    const q = $('q'), sort = $('sort'), grid = $('grid'), chips = $('chips'), info = $('info'), empty = $('empty'), reset = $('reset');

    // Normaliza: minúsculas e sem acentos ("Jóias" == "joias")
    const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const index = stores.map((s) => ({ ...s, key: norm([s.n, segBy[s.s].name, s.l].join(' ')) }));

    // Cor do monograma derivada do nome (estável entre visitas)
    const PALETTE = [['#E6F6EE', '#00824A'], ['#F1F7E1', '#5D7A12'], ['#FFF4DD', '#9A6B00'], ['#EAF2FF', '#2A5DB0'], ['#FCEBF2', '#B0306A'], ['#F1ECFF', '#5B3FB8']];
    const hue = (s) => PALETTE[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];
    const initials = (n) => n.replace(/[^\p{L}\p{N} ]/gu, '').split(' ').filter((w) => w.length > 1 || /\d/.test(w)).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || n[0];

    // Telefones: assume DDD 61 quando não informado
    const tel = (p) => {
        const d = p.replace(/\D/g, '');
        if (d.startsWith('4003') || d.startsWith('4141')) return d.length === 8 ? d : '61' + d;
        if (d.length >= 10 && /^(61|62)/.test(d)) return d;
        return '61' + d;
    };
    const fmtPhone = (p) => (/^\(\d{2}\)/.test(p) ? p : '(61) ' + p);
    const isMobile = (p) => { const d = tel(p).slice(2); return d.length === 9 && d[0] === '9'; };

    function highlight(text, term) {
        if (!term) return esc(text);
        const n = norm(text), i = n.indexOf(term);
        if (i < 0) return esc(text);
        return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + term.length)) + '</mark>' + esc(text.slice(i + term.length));
    }

    function card(s, term, i) {
        const [bg, fg] = hue(s.n);
        const seg = segBy[s.s];
        const phones = s.p.map((p) => `<a href="tel:+55${tel(p)}" aria-label="Ligar para ${esc(s.n)}: ${esc(fmtPhone(p))}"><i data-lucide="phone"></i><span class="label">${esc(fmtPhone(p))}</span></a>`).join('');
        const mobile = s.p.find(isMobile);
        const wa = mobile ? `<a class="wa" href="https://wa.me/55${tel(mobile)}" target="_blank" rel="noopener" aria-label="WhatsApp de ${esc(s.n)}"><i data-lucide="message-circle"></i><span class="label">WhatsApp</span></a>` : '';
        const copy = s.p[0] ? `<button type="button" data-copy="${esc(fmtPhone(s.p[0]))}" aria-label="Copiar telefone de ${esc(s.n)}"><i data-lucide="copy"></i></button>` : '';
        return `
<article class="store" style="--mono-bg:${bg};--mono-fg:${fg};animation-delay:${Math.min(i, 12) * 30}ms">
  <div class="store-top">
    <span class="monogram" aria-hidden="true">${esc(initials(s.n))}</span>
    <div>
      <h3>${highlight(s.n, term)}</h3>
      <a class="seg" href="?seg=${seg.slug}" data-seg="${seg.slug}"><i data-lucide="${seg.icon}"></i>${esc(seg.name)}</a>
    </div>
  </div>
  <div class="store-info">
    ${s.l ? `<span class="pill"><i data-lucide="store"></i>${/^\d/.test(s.l) ? (s.l.includes(',') || s.l.includes(' a ') ? 'Lojas ' : 'Loja ') : ''}${highlight(s.l, term)}</span>` : ''}
    ${s.m ? '<span class="pill"><i data-lucide="layers"></i>Mezanino</span>' : ''}
    ${s.ig ? `<a class="pill" href="https://www.instagram.com/${esc(s.ig)}/" target="_blank" rel="noopener"><i data-lucide="instagram"></i>@${esc(s.ig)}</a>` : ''}
  </div>
  <div class="store-actions">${phones}${wa}${copy}${!s.p.length ? '<span class="muted" style="font-size:13px">Telefone não informado</span>' : ''}</div>
</article>`;
    }

    // Chips de segmento
    const count = stores.reduce((a, s) => (a[s.s] = (a[s.s] || 0) + 1, a), {});
    chips.innerHTML = `<button class="chip" type="button" data-seg="">Todos <span class="count">${stores.length}</span></button>` +
        segments.map((s) => `<button class="chip" type="button" data-seg="${s.slug}"><i data-lucide="${s.icon}"></i>${esc(s.name)} <span class="count">${count[s.slug] || 0}</span></button>`).join('');

    const state = { q: '', seg: '', sort: 'az' };
    const firstNum = (l) => parseInt(l, 10) || 99999;

    function render(scrollChip) {
        const term = norm(state.q.trim());
        let list = index.filter((s) => (!state.seg || s.s === state.seg) && (!term || s.key.includes(term)));
        list.sort(state.sort === 'loja' ? (a, b) => firstNum(a.l) - firstNum(b.l)
            : state.sort === 'za' ? (a, b) => b.n.localeCompare(a.n, 'pt') : (a, b) => a.n.localeCompare(b.n, 'pt'));

        const paint = () => {
            grid.innerHTML = list.map((s, i) => card(s, term, i)).join('');
            empty.hidden = list.length > 0;
            const segName = state.seg ? ' em <strong>' + esc(segBy[state.seg].name) + '</strong>' : '';
            info.innerHTML = `<span><strong>${list.length}</strong> ${list.length === 1 ? 'loja encontrada' : 'lojas encontradas'}${segName}</span>`;
            reset.hidden = !state.q && !state.seg;
            chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.seg === state.seg)));
            window.GamaIcons();
        };
        paint();

        if (scrollChip) {
            const active = chips.querySelector('[aria-pressed="true"]');
            active && active.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
        }
        // Estado na URL (compartilhável), sem poluir o histórico
        const p = new URLSearchParams();
        if (state.q) p.set('q', state.q);
        if (state.seg) p.set('seg', state.seg);
        if (state.sort !== 'az') p.set('ordem', state.sort);
        history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : ''));
        document.title = (state.seg ? segBy[state.seg].name + ' · ' : '') + 'Lojas · Gama Shopping';
    }

    // Estado inicial a partir da URL
    const params = new URLSearchParams(location.search);
    state.q = params.get('q') || '';
    state.seg = segBy[params.get('seg')] ? params.get('seg') : '';
    state.sort = ['az', 'za', 'loja'].includes(params.get('ordem')) ? params.get('ordem') : 'az';
    q.value = state.q;
    sort.value = state.sort;

    let t;
    q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { state.q = q.value; render(); }, 120); });
    sort.addEventListener('change', () => { state.sort = sort.value; render(); });
    $('q').closest('.field').querySelector('.clear').addEventListener('click', () => { q.value = ''; state.q = ''; render(); q.focus(); });
    reset.addEventListener('click', () => { q.value = ''; Object.assign(state, { q: '', seg: '' }); render(true); });

    const pick = (seg) => {
        state.seg = seg;
        const go = () => render(true);
        document.startViewTransition ? document.startViewTransition(go) : go();
    };
    chips.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) pick(c.dataset.seg); });
    grid.addEventListener('click', (e) => {
        const a = e.target.closest('a[data-seg]');
        if (!a) return;
        e.preventDefault();
        pick(a.dataset.seg);
        scrollTo({ top: grid.getBoundingClientRect().top + scrollY - 220, behavior: 'smooth' });
    });
    addEventListener('keydown', (e) => {
        if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); q.focus(); }
    });

    render(true);
})();
