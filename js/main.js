const { prefersReducedMotion, isCoarsePointer } = window;
gsap.registerPlugin(SplitText);
const isSlidesMode = document.documentElement.classList.contains('slides-mode');

/* ===================== I18N ===================== */
const I18N = {
    pt: {
        'nav.hero': 'Início', 'nav.perfil': 'Perfil', 'nav.experiencia': 'Trajetória',
        'nav.comunidade': 'Comunidade', 'nav.skills': 'Competências', 'nav.certs': 'Certificações',
        'nav.formacao': 'Formação', 'nav.idiomas': 'Idiomas',
        'hero.role': 'Desenvolvedor Salesforce Sênior | Arquitetura de Soluções &amp; Mentoria',
        'perfil.eyebrow': '01 · Perfil', 'perfil.title': 'Perfil Profissional',
        'perfil.body': 'Desenvolvedor Salesforce Sênior com 5+ anos projetando e implantando soluções enterprise. Expertise em arquitetura Apex, Lightning Web Components e integrações de APIs. Histórico comprovado de redução de 40% em incidentes críticos, otimização de sistemas gerenciando milhões de registros e mentoria de desenvolvedores com 2 promoções para posições mid-level.',
        'experiencia.eyebrow': '02 · Trajetória', 'experiencia.title': 'Experiência Profissional',
        'job1.title': 'Desenvolvedor Salesforce Sênior – OSF Digital', 'job1.period': 'Out 2022 – Presente (3.9 anos)', 'job1.company': 'Remoto',
        'job1.li1': 'Arquiteto Trigger Framework com Bulkification e processamento async; otimizei batch noturno de 4+ horas para 45 minutos (81% de melhoria); redução de 40% em uso de CPU',
        'job1.li2': 'Projetei componentes LWC enterprise com caching e integração LMS servindo 5.000+ usuários; melhorei responsividade UI em 50%',
        'job1.li3': 'Implementei integrações APIs REST/SOAP reduzindo falhas de 8% para 1.2% com 99.7% de confiabilidade uptime',
        'job1.li4': 'Otimizei 50+ organizações de produção usando análise SOQL e indexação; redução de 40% no tempo de resposta a incidentes',
        'job1.li5': 'Estabeleci padrões com cobertura de testes 85%+ com pipeline CI/CD; redução de 45% em bugs de produção ano a ano',
        'job1.li6': 'Mentorizei 3 desenvolvedores juniores; promovi com sucesso 2 para posições mid-level',
        'job2.title': 'Desenvolvedor Salesforce (Júnior → Mid-level) – Sottelli', 'job2.period': 'Jan 2021 – Set 2022 (1.7 anos)', 'job2.company': 'Remoto',
        'job2.li1': 'Promovido de estagiário a desenvolvedor júnior em 6 meses; rápido crescimento técnico e expertise em plataforma',
        'job2.li2': 'Desenvolvi 8+ features de produção com taxa de sucesso de deployment 99.9%',
        'job2.li3': 'Otimizei processos com Flow; economia de 3+ horas/semana por usuário; melhoria de adoção em 25%',
        'job2.li4': 'Contribuí a governança de segurança; redução de 70% em tentativas de acesso não autorizado',
        'job2.li5': 'Participei de code reviews e pair programming; rápida internalização de best practices em Apex e LWC',
        'comunidade.eyebrow': '07 · Comunidade', 'comunidade.title': 'Comunidade &amp; Inovação',
        'comunidade.box1': '<strong>Hackathon – OSF Digital Hackathon (2024):</strong> Desenvolvi sistema de priorização com IA usando Web-to-Case e NLP para analisar sentimento do cliente; automação de classificação de urgência (P1-P3); melhoria de 35% em conformidade SLA e tempo de primeira resposta.',
        'comunidade.box2': '<strong>Interesse Ativo:</strong> Buscando participação em Hackathons Salesforce Agentforce para expandir expertise em agentes IA autônomos e padrões de desenvolvimento agentic.',
        'skills.eyebrow': '03 · Competências', 'skills.title': 'Competências Técnicas',
        'skill1.title': 'Desenvolvimento Apex', 'skill1.body': 'Trigger Framework, Bulkification, Processamento Async, Otimização SOQL, Testes Apex, TDD',
        'skill2.title': 'Frontend', 'skill2.body': 'Lightning Web Components, Visualforce, Design Responsivo, Caching Client-side, LMS',
        'skill3.title': 'Integração e APIs', 'skill3.body': 'APIs REST/SOAP, Callouts Async, Tratamento de Erros, Platform Events, Change Data Capture',
        'skill4.title': 'Plataformas Salesforce', 'skill4.body': 'Sales Cloud, Service Cloud, Experience Cloud, Modelos de Segurança, Arquitetura',
        'skill5.title': 'DevOps e Qualidade', 'skill5.body': 'Pipelines CI/CD, Git/GitHub, Copado, SFDX, Revisão de Código, Padrões de Design',
        'skill6.title': 'Performance', 'skill6.body': 'Governor Limits, Indexação de Banco, Otimização Query, Processamento Batch, Monitoramento',
        'certs.eyebrow': '04 · Certificações', 'certs.title': 'Certificações Profissionais',
        'formacao.eyebrow': '05 · Formação', 'formacao.title': 'Formação e Aprendizado',
        'formacao.box1': '<strong>Bacharelado em Ciência – Análise e Desenvolvimento de Sistemas</strong> | Universidade GRAN | Conclusão prevista: Dez 2026',
        'formacao.box2': '<strong>Pós-graduação – Arquitetura de Software para Dados em Grande Escala</strong> | Em Progresso | 2027',
        'idiomas.eyebrow': '06 · Idiomas', 'idiomas.title': 'Idiomas',
        'idiomas.box': '<strong>Português:</strong> Nativo &nbsp;|&nbsp; <strong>Inglês:</strong> Avançado (Técnico &amp; Profissional)',
        'footer.location': 'Brasil, Brasília - DF',
        'footer.rights': '© 2026 Pedro Ferreira – Todos os Direitos Reservados'
    },
    en: {
        'nav.hero': 'Home', 'nav.perfil': 'Profile', 'nav.experiencia': 'Journey',
        'nav.comunidade': 'Community', 'nav.skills': 'Skills', 'nav.certs': 'Certifications',
        'nav.formacao': 'Education', 'nav.idiomas': 'Languages',
        'hero.role': 'Senior Salesforce Developer | Solution Architecture &amp; Mentorship',
        'perfil.eyebrow': '01 · Profile', 'perfil.title': 'Professional Profile',
        'perfil.body': 'Senior Salesforce Developer with 5+ years designing and deploying enterprise solutions. Expertise in Apex architecture, Lightning Web Components and API integrations. Proven track record of cutting critical incidents by 40%, optimizing systems managing millions of records, and mentoring developers with 2 promotions to mid-level positions.',
        'experiencia.eyebrow': '02 · Journey', 'experiencia.title': 'Professional Experience',
        'job1.title': 'Senior Salesforce Developer – OSF Digital', 'job1.period': 'Oct 2022 – Present (3.9 years)', 'job1.company': 'Remote',
        'job1.li1': 'Architected a Trigger Framework with bulkification and async processing; cut a 4+ hour nightly batch to 45 minutes (81% improvement); reduced CPU usage by 40%',
        'job1.li2': 'Designed enterprise LWC components with caching and LMS integration serving 5,000+ users; improved UI responsiveness by 50%',
        'job1.li3': 'Implemented REST/SOAP API integrations, reducing failure rates from 8% to 1.2% with 99.7% uptime reliability',
        'job1.li4': 'Optimized 50+ production orgs through SOQL analysis and indexing; cut incident response time by 40%',
        'job1.li5': 'Established standards with 85%+ test coverage and a CI/CD pipeline; reduced year-over-year production bugs by 45%',
        'job1.li6': 'Mentored 3 junior developers; successfully promoted 2 to mid-level positions',
        'job2.title': 'Salesforce Developer (Junior → Mid-level) – Sottelli', 'job2.period': 'Jan 2021 – Sep 2022 (1.7 years)', 'job2.company': 'Remote',
        'job2.li1': 'Promoted from intern to junior developer in 6 months, driven by rapid technical growth and platform expertise',
        'job2.li2': 'Delivered 8+ production features with a 99.9% deployment success rate',
        'job2.li3': 'Optimized processes with Flow, saving 3+ hours/week per user and improving adoption by 25%',
        'job2.li4': 'Contributed to security governance, reducing unauthorized access attempts by 70%',
        'job2.li5': 'Took part in code reviews and pair programming, quickly internalizing Apex and LWC best practices',
        'comunidade.eyebrow': '07 · Community', 'comunidade.title': 'Community &amp; Innovation',
        'comunidade.box1': '<strong>Hackathon – OSF Digital Hackathon (2024):</strong> Built an AI-driven prioritization system using Web-to-Case and NLP to analyze customer sentiment; automated urgency classification (P1-P3); improved SLA compliance and first-response time by 35%.',
        'comunidade.box2': '<strong>Active Interest:</strong> Seeking participation in Salesforce Agentforce hackathons to expand expertise in autonomous AI agents and agentic development patterns.',
        'skills.eyebrow': '03 · Skills', 'skills.title': 'Technical Skills',
        'skill1.title': 'Apex Development', 'skill1.body': 'Trigger Framework, Bulkification, Async Processing, SOQL Optimization, Apex Testing, TDD',
        'skill2.title': 'Frontend', 'skill2.body': 'Lightning Web Components, Visualforce, Responsive Design, Client-side Caching, LMS',
        'skill3.title': 'Integration &amp; APIs', 'skill3.body': 'REST/SOAP APIs, Async Callouts, Error Handling, Platform Events, Change Data Capture',
        'skill4.title': 'Salesforce Platforms', 'skill4.body': 'Sales Cloud, Service Cloud, Experience Cloud, Security Models, Architecture',
        'skill5.title': 'DevOps &amp; Quality', 'skill5.body': 'CI/CD Pipelines, Git/GitHub, Copado, SFDX, Code Review, Design Patterns',
        'skill6.title': 'Performance', 'skill6.body': 'Governor Limits, Database Indexing, Query Optimization, Batch Processing, Monitoring',
        'certs.eyebrow': '04 · Certifications', 'certs.title': 'Professional Certifications',
        'formacao.eyebrow': '05 · Education', 'formacao.title': 'Education &amp; Learning',
        'formacao.box1': '<strong>B.Sc. – Systems Analysis and Development</strong> | GRAN University | Expected completion: Dec 2026',
        'formacao.box2': '<strong>Postgraduate – Software Architecture for Large-Scale Data</strong> | In Progress | 2027',
        'idiomas.eyebrow': '06 · Languages', 'idiomas.title': 'Languages',
        'idiomas.box': '<strong>Portuguese:</strong> Native &nbsp;|&nbsp; <strong>English:</strong> Advanced (Technical &amp; Professional)',
        'footer.location': 'Brazil, Brasília - DF',
        'footer.rights': '© 2026 Pedro Ferreira – All Rights Reserved'
    }
};

/* hero-role deve caber em uma linha e medir sempre 90% da largura do nome */
function fitHeroRole() {
    const nameEl = document.querySelector('.hero-name');
    const roleEl = document.querySelector('.hero-role');
    if (!nameEl || !roleEl) return;
    const targetWidth = nameEl.getBoundingClientRect().width * 0.9;
    if (targetWidth <= 0) return;
    roleEl.style.width = targetWidth + 'px';
    let fontSize = 28;
    roleEl.style.fontSize = fontSize + 'px';
    while (roleEl.scrollWidth > targetWidth && fontSize > 8) {
        fontSize -= 0.5;
        roleEl.style.fontSize = fontSize + 'px';
    }
}

function applyLang(lang) {
    document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'pt-BR');
    const dict = I18N[lang] || I18N.pt;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (dict[key] != null) el.innerHTML = dict[key];
    });
    document.documentElement.dataset.lang = lang;
    const codeEl = document.querySelector('#lang-toggle .lang-code');
    if (codeEl) codeEl.textContent = lang === 'pt' ? 'EN' : 'PT';
    try { localStorage.setItem('siteLang', lang); } catch (e) {}
    fitHeroRole();
}
const savedLang = (function () { try { return localStorage.getItem('siteLang'); } catch (e) { return null; } })();
applyLang(savedLang === 'en' ? 'en' : 'pt');
document.getElementById('lang-toggle').addEventListener('click', () => {
    applyLang((document.documentElement.dataset.lang || 'pt') === 'pt' ? 'en' : 'pt');
});

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fitHeroRole, 120);
});
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHeroRole);
window.addEventListener('load', fitHeroRole);

/* ===================== TEMAS: Cosmos, Pôr do Sol, ... ===================== */
const THEMES = [
    { name: 'cosmos', icon: 'fa-solid fa-meteor', label: { pt: 'Cosmos', en: 'Cosmos' } },
    { name: 'sunset', icon: 'fa-solid fa-mountain-sun', label: { pt: 'Pôr do Sol', en: 'Sunset' } }
];
const themeBtn = document.getElementById('theme-toggle');

function applyTheme(name) {
    const theme = THEMES.find((t) => t.name === name) || THEMES[0];
    if (theme.name === 'cosmos') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme.name);
    themeBtn.querySelector('i').className = theme.icon;
    const lang = document.documentElement.dataset.lang === 'en' ? 'en' : 'pt';
    themeBtn.setAttribute('aria-label', (lang === 'en' ? 'Theme: ' : 'Tema: ') + theme.label[lang]);
    themeBtn.title = themeBtn.getAttribute('aria-label');
    try { localStorage.setItem('siteTheme', theme.name); } catch (e) {}
    if (window.__setHeroTheme) window.__setHeroTheme(theme.name);
}

const savedTheme = (function () { try { return localStorage.getItem('siteTheme'); } catch (e) { return null; } })();
let currentThemeName = THEMES.some((t) => t.name === savedTheme) ? savedTheme : 'cosmos';
applyTheme(currentThemeName);

themeBtn.addEventListener('click', () => {
    const idx = THEMES.findIndex((t) => t.name === currentThemeName);
    currentThemeName = THEMES[(idx + 1) % THEMES.length].name;
    applyTheme(currentThemeName);
});

/* ===================== WORLD CLOCK (rodapé): sinaliza discretamente atenção ao horário global ===================== */
(function initWorldClock() {
    const el = document.getElementById('world-clock');
    if (!el) return;
    const zones = [
        { tz: 'America/Sao_Paulo', label: 'BSB' },
        { tz: 'Europe/London', label: 'LON' },
        { tz: 'America/Los_Angeles', label: 'SF' }
    ];
    function tick() {
        const parts = zones.map((z) => {
            const time = new Intl.DateTimeFormat('en-GB', { timeZone: z.tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
            return z.label + ' ' + time;
        });
        el.textContent = parts.join('   ·   ');
    }
    tick();
    setInterval(tick, 30000);
})();

/* ===================== NAV DOTS + SLIDE/SCROLL CONTROLLER ===================== */
const slides = Array.from(document.querySelectorAll('#track > .h-slide'));
const dots = Array.from(document.querySelectorAll('.dot'));
let current = 0;

function updateDots(idx) {
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

if (isSlidesMode) {
    const maxProgress = slides.length - 1;
    let targetProgress = 0;
    let shownProgress = 0;
    let lastActiveIdx = -1;

    function renderProgress(p) {
        let activeIdx = 0, bestDist = Infinity;
        slides.forEach((el, i) => {
            const delta = p - i;
            let xPercent = -50, x = 0, scale = 1, opacity = 1, z = 100 + i, vis = 'visible';
            if (delta >= 0) {
                if (delta <= 1) { scale = 1 - delta * 0.14; opacity = 1 - delta * 0.65; }
                else if (delta <= 2) { scale = 0.86 - (delta - 1) * 0.06; opacity = 0.35 * (2 - delta); }
                else { scale = 0.8; opacity = 0; vis = 'hidden'; z = 90; }
            } else {
                const a = -delta;
                if (a <= 1) { xPercent = -50 + 100 * a; x = 90 * a; }
                else { xPercent = 50; x = 90; vis = 'hidden'; }
            }
            gsap.set(el, { xPercent, yPercent: -50, x, scale, opacity, zIndex: z, visibility: vis });
            const dist = Math.abs(delta);
            if (dist < bestDist) { bestDist = dist; activeIdx = i; }
        });
        slides.forEach((el, i) => { el.style.pointerEvents = (i === activeIdx) ? 'auto' : 'none'; });
        if (activeIdx !== lastActiveIdx) { lastActiveIdx = activeIdx; updateDots(activeIdx); }
        current = activeIdx;
        window.__slideProgress = p / maxProgress;
    }
    renderProgress(0);

    function loop() {
        requestAnimationFrame(loop);
        const diff = targetProgress - shownProgress;
        if (Math.abs(diff) > 0.0008) {
            shownProgress += diff * (prefersReducedMotion ? 1 : 0.14);
            renderProgress(shownProgress);
        }
    }
    loop();

    const WHEEL_SENSITIVITY = 650;
    window.addEventListener('wheel', (e) => {
        const absX = Math.abs(e.deltaX), absY = Math.abs(e.deltaY);
        const usingX = absX > absY && absX > 2;
        const raw = usingX ? e.deltaX : e.deltaY;
        if (Math.abs(raw) < 1) return;
        const dir = raw > 0 ? 1 : -1;
        const nearInt = Math.abs(targetProgress - Math.round(targetProgress)) < 0.03;
        if (!usingX && nearInt) {
            const idx = clamp(Math.round(targetProgress), 0, maxProgress);
            const slide = slides[idx];
            const atBottom = slide.scrollHeight - slide.clientHeight <= slide.scrollTop + 2;
            const atTop = slide.scrollTop <= 2;
            if (dir > 0 && !atBottom) return;
            if (dir < 0 && !atTop) return;
        }
        e.preventDefault();
        targetProgress = clamp(targetProgress + raw / WHEEL_SENSITIVITY, 0, maxProgress);
    }, { passive: false });

    window.addEventListener('keydown', (e) => {
        if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key)) { e.preventDefault(); targetProgress = clamp(Math.round(targetProgress) + 1, 0, maxProgress); }
        else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); targetProgress = clamp(Math.round(targetProgress) - 1, 0, maxProgress); }
    });

    dots.forEach((dot, i) => dot.addEventListener('click', () => { targetProgress = i; }));
} else {
    /* ===================== FALLBACK: rolagem vertical normal (touch / reduced motion) ===================== */
    dots.forEach((dot, i) => dot.addEventListener('click', () => {
        slides[i].scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }));

    const activeObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const idx = slides.indexOf(entry.target);
                if (idx > -1) {
                    current = idx;
                    updateDots(idx);
                    window.__slideProgress = idx / (slides.length - 1);
                }
            }
        });
    }, { threshold: 0.5 });
    slides.forEach((el) => activeObserver.observe(el));
    updateDots(0);
}

/* ===================== HERO: revelação inicial ===================== */
if (!prefersReducedMotion) {
    const split = new SplitText('.hero-name', { type: 'chars', charsClass: 'char' });
    gsap.from(split.chars, { yPercent: 130, opacity: 0, duration: 1, stagger: 0.03, ease: 'power4.out', delay: 0.2 });
    gsap.from('.hero-role', { opacity: 0, y: 16, duration: 0.8, delay: 0.7, ease: 'power2.out' });
    gsap.set('.hero-contact .icon-pill', { opacity: 0, y: 16 });
    gsap.to('.hero-contact .icon-pill', { opacity: 1, y: 0, duration: 0.6, delay: 1.0, stagger: 0.08, ease: 'power2.out' });
}

/* ===================== TILT 3D + PARALLAX INTERNO NOS CARDS ===================== */
function attachTilt(el, inner, max) {
    if (prefersReducedMotion || isCoarsePointer) return;
    el.style.transformStyle = 'preserve-3d';
    const rotX = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3.out' });
    const rotY = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3.out' });
    const moveX = inner ? gsap.quickTo(inner, 'x', { duration: 0.5, ease: 'power3.out' }) : null;
    const moveY = inner ? gsap.quickTo(inner, 'y', { duration: 0.5, ease: 'power3.out' }) : null;

    el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        rotY(px * max * 2);
        rotX(-py * max * 2);
        if (moveX) { moveX(px * 16); moveY(py * 16); }
    });
    el.addEventListener('mouseleave', () => {
        rotX(0); rotY(0);
        if (moveX) { moveX(0); moveY(0); }
    });
}

document.querySelectorAll('.skill-card').forEach((card) => {
    attachTilt(card, card.querySelector('.skill-card-inner'), 7);
});
document.querySelectorAll('.cert-item').forEach((card) => {
    attachTilt(card, card.querySelector('span:last-child'), 5);
});
document.querySelectorAll('.experience-item').forEach((card) => {
    attachTilt(card, null, 2);
});
