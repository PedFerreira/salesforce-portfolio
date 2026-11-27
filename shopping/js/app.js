/* Gama Shopping — scripts compartilhados (sem frameworks) */
(() => {
    'use strict';

    const root = document.documentElement;
    root.classList.add('js');

    /* ------------------------------------------------------------------
       Horários (fonte: site original). Dias: 0 = domingo … 6 = sábado.
       Valores em horas decimais (7.5 = 7h30).
    ------------------------------------------------------------------ */
    const HOURS = {
        lojas: { label: 'Lojas e quiosques', days: { 1: [10, 22], 2: [10, 22], 3: [10, 22], 4: [10, 22], 5: [10, 22], 6: [10, 22] } },
        praca: { label: 'Praça de alimentação', days: { 0: [11, 18], 1: [10, 22], 2: [10, 22], 3: [10, 22], 4: [10, 22], 5: [10, 22], 6: [10, 22] } },
        setorD: { label: 'Setor D', days: { 0: [6, 22], 1: [6, 22], 2: [6, 22], 3: [6, 22], 4: [6, 22], 5: [6, 22], 6: [6, 22] } },
        nahora: { label: 'Na Hora', days: { 1: [7.5, 19], 2: [7.5, 19], 3: [7.5, 19], 4: [7.5, 19], 5: [7.5, 19] } },
    };
    const DAY_NAMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

    // Hora atual em Brasília, independente do fuso do visitante
    function nowBrasilia() {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Sao_Paulo', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23',
        }).formatToParts(new Date());
        const get = (t) => parts.find((p) => p.type === t).value;
        const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
        return { day, time: Number(get('hour')) + Number(get('minute')) / 60 };
    }
    const fmt = (h) => {
        const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
        return hh + 'h' + (mm ? String(mm).padStart(2, '0') : '');
    };
    function status(key) {
        const { day, time } = nowBrasilia();
        const days = HOURS[key].days;
        const today = days[day];
        if (today && time >= today[0] && time < today[1]) {
            return { open: true, text: 'Aberto agora · até ' + fmt(today[1]) };
        }
        if (today && time < today[0]) return { open: false, text: 'Fechado · abre hoje às ' + fmt(today[0]) };
        for (let i = 1; i <= 7; i++) {
            const d = (day + i) % 7;
            if (days[d]) return { open: false, text: 'Fechado · abre ' + (i === 1 ? 'amanhã' : DAY_NAMES[d]) + ' às ' + fmt(days[d][0]) };
        }
        return { open: false, text: 'Fechado' };
    }
    window.GamaHours = { HOURS, status, nowBrasilia };

    /* ------------------------------------------------------------------
       Ícones (Lucide via CDN)
    ------------------------------------------------------------------ */
    const icons = () => window.lucide && window.lucide.createIcons({ attrs: { 'aria-hidden': 'true' } });
    window.GamaIcons = icons;

    /* ------------------------------------------------------------------
       <gs-header current="...">
    ------------------------------------------------------------------ */
    const NAV = [
        ['inicio', './', 'Início'],
        ['lojas', 'lojas.html', 'Lojas'],
        ['sobre', 'sobre.html', 'Sobre nós'],
        ['natal', 'natal.html', 'Natal 2026', 'nav-natal'],
        ['contato', 'contato.html', 'Fale conosco'],
    ];

    class GsHeader extends HTMLElement {
        connectedCallback() {
            const cur = this.getAttribute('current');
            this.innerHTML = `
<div class="concept-bar">Conceito de redesign <strong>não oficial</strong>, feito para portfólio. Site oficial: <a href="https://www.gamashopping.com.br/" target="_blank" rel="noopener">gamashopping.com.br</a></div>
<header class="header">
  <div class="wrap header-inner">
    <a class="logo" href="./" aria-label="Gama Shopping — página inicial"><img src="img/logo-gama.png" width="700" height="60" alt="Gama Shopping"></a>
    <nav class="nav" id="site-nav" aria-label="Principal">
      ${NAV.map(([k, href, label, cls]) => `<a href="${href}"${cls ? ` class="${cls}"` : ''}${k === cur ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
    </nav>
    <div class="nav-scrim" data-close></div>
    <div class="header-actions">
      <span class="status-pill" data-status="lojas"><span class="status-dot"></span><span class="txt">…</span></span>
      <button class="icon-btn" type="button" data-theme-toggle aria-label="Alternar tema claro/escuro"><i data-lucide="moon"></i></button>
      <button class="icon-btn menu-toggle" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="site-nav"><i data-lucide="menu"></i></button>
    </div>
  </div>
</header>`;
            const header = this.querySelector('.header');
            const toggle = this.querySelector('.menu-toggle');
            const setMenu = (open) => {
                this.classList.toggle('nav-open', open);
                toggle.setAttribute('aria-expanded', String(open));
                toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
                toggle.innerHTML = `<i data-lucide="${open ? 'x' : 'menu'}"></i>`;
                icons();
            };
            toggle.addEventListener('click', () => setMenu(!this.classList.contains('nav-open')));
            this.querySelector('[data-close]').addEventListener('click', () => setMenu(false));
            document.addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));
            const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 8);
            addEventListener('scroll', onScroll, { passive: true });
            onScroll();
        }
    }

    /* ------------------------------------------------------------------
       <gs-footer>
    ------------------------------------------------------------------ */
    class GsFooter extends HTMLElement {
        connectedCallback() {
            this.innerHTML = `
<footer class="footer">
  <div class="wrap">
    <div class="footer-grid">
      <div class="brand">
        <img src="img/logo-gama.png" width="700" height="60" alt="Gama Shopping" loading="lazy">
        <p>Desde 1997, um dos principais centros de compras do Gama e região. Mais de 250 lojas, praça de alimentação e o Na Hora, tudo num só lugar.</p>
        <div class="socials">
          <a href="https://www.instagram.com/gamashopping/" target="_blank" rel="noopener" aria-label="Instagram"><i data-lucide="instagram"></i></a>
          <a href="https://www.facebook.com/gamashopping/?locale=pt_BR" target="_blank" rel="noopener" aria-label="Facebook"><i data-lucide="facebook"></i></a>
          <a href="mailto:faleconosco@gamashopping.com.br" aria-label="E-mail"><i data-lucide="mail"></i></a>
        </div>
      </div>
      <div>
        <h4>O site</h4>
        <ul>${NAV.map(([, href, label]) => `<li><a href="${href}">${label}</a></li>`).join('')}</ul>
      </div>
      <div>
        <h4>Apoio e suporte</h4>
        <ul>
          <li><a href="natal.html">Natal Dourado 2026</a></li>
          <li><a href="https://www.nahora.df.gov.br/na-hora-gama-2024/" target="_blank" rel="noopener">Agendamento Na Hora</a></li>
          <li><a href="mailto:faleconosco@gamashopping.com.br">faleconosco@gamashopping.com.br</a></li>
          <li><a href="tel:+556133851522">(61) 3385-1522</a></li>
        </ul>
      </div>
      <div>
        <h4>Visite</h4>
        <ul>
          <li>Área Especial Shopping, Setor Central<br>Gama/DF · CEP 72405-561</li>
          <li>Seg a sáb · 10h às 22h</li>
          <li><a href="./#visite">Horários e como chegar →</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© Gama Shopping · todos os direitos reservados · Deus Único.</span>
      <span>Conceito de redesign por <a href="/">Pedro Ferreira</a> · Não oficial</span>
    </div>
  </div>
</footer>
<a class="btn btn-icon to-top" href="#top" aria-label="Voltar ao topo"><i data-lucide="arrow-up"></i></a>
<div class="toast" role="status" aria-live="polite"></div>`;
        }
    }

    customElements.define('gs-header', GsHeader);
    customElements.define('gs-footer', GsFooter);

    /* ------------------------------------------------------------------
       Tema claro/escuro (respeita o sistema até o visitante escolher)
    ------------------------------------------------------------------ */
    function currentTheme() {
        return root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    function paintThemeIcon() {
        document.querySelectorAll('[data-theme-toggle]').forEach((b) => {
            b.innerHTML = `<i data-lucide="${currentTheme() === 'dark' ? 'sun' : 'moon'}"></i>`;
        });
        icons();
    }
    document.addEventListener('click', (e) => {
        if (!e.target.closest('[data-theme-toggle]')) return;
        const next = currentTheme() === 'dark' ? 'light' : 'dark';
        const apply = () => {
            root.dataset.theme = next;
            try { localStorage.setItem('gs-theme', next); } catch (_) { /* sem storage */ }
            paintThemeIcon();
        };
        document.startViewTransition ? document.startViewTransition(apply) : apply();
    });

    /* ------------------------------------------------------------------
       Toast
    ------------------------------------------------------------------ */
    let toastTimer;
    window.GamaToast = (msg) => {
        const t = document.querySelector('.toast');
        if (!t) return;
        t.textContent = msg;
        t.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => t.classList.remove('is-visible'), 2400);
    };
    // Copiar para a área de transferência: <button data-copy="texto">
    document.addEventListener('click', async (e) => {
        const b = e.target.closest('[data-copy]');
        if (!b) return;
        try {
            await navigator.clipboard.writeText(b.dataset.copy);
            window.GamaToast('Copiado: ' + b.dataset.copy);
        } catch (_) {
            window.GamaToast('Não foi possível copiar');
        }
    });

    /* ------------------------------------------------------------------
       Status ao vivo (pílulas e tabela de horários)
    ------------------------------------------------------------------ */
    function paintStatus() {
        document.querySelectorAll('[data-status]').forEach((el) => {
            const s = status(el.dataset.status);
            el.classList.toggle('is-open', s.open);
            const txt = el.querySelector('.txt');
            (txt || el).textContent = s.text;
        });
        const { day } = nowBrasilia();
        document.querySelectorAll('[data-day]').forEach((tr) => {
            tr.classList.toggle('is-today', tr.dataset.day.split(',').map(Number).includes(day));
        });
    }

    /* ------------------------------------------------------------------
       Contadores animados
    ------------------------------------------------------------------ */
    function counters() {
        const els = document.querySelectorAll('[data-count]');
        if (!els.length) return;
        const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const run = (el) => {
            const end = Number(el.dataset.count), suffix = el.dataset.suffix || '', dur = 1400;
            const show = (n) => ('plain' in el.dataset ? String(n) : n.toLocaleString('pt-BR')) + suffix;
            if (reduce) { el.textContent = show(end); return; }
            const t0 = performance.now();
            const tick = (t) => {
                const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
                el.textContent = show(Math.round(end * e));
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        };
        const io = new IntersectionObserver((entries) => entries.forEach((en) => {
            if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
        }), { threshold: .5 });
        els.forEach((el) => io.observe(el));
    }

    /* ------------------------------------------------------------------
       Revelação ao rolar — fallback para navegadores sem scroll-driven animations
    ------------------------------------------------------------------ */
    function revealFallback() {
        if (CSS.supports('animation-timeline: view()')) return;
        const io = new IntersectionObserver((entries) => entries.forEach((en) => {
            if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        }), { rootMargin: '0px 0px -8% 0px' });
        document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    }

    /* ------------------------------------------------------------------
       Mapa sob demanda (não carrega o Google Maps até o clique)
    ------------------------------------------------------------------ */
    document.addEventListener('click', (e) => {
        const b = e.target.closest('[data-load-map]');
        if (!b) return;
        const box = b.closest('.map');
        const f = document.createElement('iframe');
        f.src = box.dataset.src;
        f.title = 'Mapa: localização do Gama Shopping';
        f.loading = 'lazy';
        f.referrerPolicy = 'no-referrer-when-downgrade';
        f.allowFullscreen = true;
        box.appendChild(f);
    });

    /* ------------------------------------------------------------------
       Vídeos: só carregam em telas largas, sem economia de dados
       e sem preferência por movimento reduzido
    ------------------------------------------------------------------ */
    function videos() {
        const saveData = navigator.connection && navigator.connection.saveData;
        const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
        document.querySelectorAll('video[data-src]').forEach((v) => {
            const minW = Number(v.dataset.minWidth || 0);
            if (saveData || reduce || innerWidth < minW) {
                // Com controles, o visitante decide: o arquivo só baixa ao dar play (preload=none)
                if (v.hasAttribute('controls')) v.src = v.dataset.src;
                return;
            }
            const io = new IntersectionObserver(([en]) => {
                if (!en.isIntersecting) return;
                io.disconnect();
                v.src = v.dataset.src;
                v.addEventListener('canplay', () => { v.classList.add('is-ready'); v.play().catch(() => {}); }, { once: true });
            });
            io.observe(v);
        });
        document.querySelectorAll('[data-video-toggle]').forEach((b) => {
            const v = document.getElementById(b.dataset.videoToggle);
            const paint = () => {
                b.innerHTML = `<i data-lucide="${v.paused ? 'play' : 'pause'}"></i>`;
                b.setAttribute('aria-label', v.paused ? 'Reproduzir vídeo' : 'Pausar vídeo');
                icons();
            };
            b.addEventListener('click', () => {
                if (!v.src) { v.src = v.dataset.src; v.classList.add('is-ready'); }
                v.paused ? v.play() : v.pause();
            });
            v.addEventListener('play', paint);
            v.addEventListener('pause', paint);
            paint();
        });
    }

    /* ------------------------------------------------------------------
       Carrossel (botões anterior/próximo)
    ------------------------------------------------------------------ */
    document.addEventListener('click', (e) => {
        const b = e.target.closest('[data-scroll]');
        if (!b) return;
        const track = document.getElementById(b.dataset.target);
        const card = track.firstElementChild;
        const step = card ? card.getBoundingClientRect().width + 18 : 300;
        track.scrollBy({ left: Number(b.dataset.scroll) * step, behavior: 'smooth' });
    });

    /* ------------------------------------------------------------------
       Voltar ao topo
    ------------------------------------------------------------------ */
    function toTop() {
        const b = document.querySelector('.to-top');
        if (!b) return;
        addEventListener('scroll', () => b.classList.toggle('is-visible', scrollY > 900), { passive: true });
        b.addEventListener('click', (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); });
    }

    /* ------------------------------------------------------------------
       Partículas douradas (seção de Natal)
    ------------------------------------------------------------------ */
    function sparkles() {
        document.querySelectorAll('.sparkles').forEach((box) => {
            for (let i = 0; i < 28; i++) {
                const s = document.createElement('i');
                s.style.left = Math.random() * 100 + '%';
                s.style.top = Math.random() * 100 + '%';
                s.style.animationDelay = (Math.random() * 4).toFixed(2) + 's';
                s.style.transform = `scale(${(.4 + Math.random()).toFixed(2)})`;
                box.appendChild(s);
            }
        });
    }

    function init() {
        icons();
        paintThemeIcon();
        paintStatus();
        setInterval(paintStatus, 60 * 1000);
        counters();
        revealFallback();
        videos();
        toTop();
        sparkles();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
