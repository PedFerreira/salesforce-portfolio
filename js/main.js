const { prefersReducedMotion, isCoarsePointer } = window;
gsap.registerPlugin(SplitText);
const isSlidesMode = document.documentElement.classList.contains('slides-mode');

/* ===================== I18N ===================== */
const I18N = {
    pt: {
        'nav.hero': 'Início', 'nav.perfil': 'Perfil', 'nav.experiencia': 'Trajetória',
        'nav.comunidade': 'Projetos', 'nav.skills': 'Competências', 'nav.certs': 'Certificações',
        'nav.formacao': 'Formação', 'nav.idiomas': 'Idiomas',
        'ui.more': 'Ver mais', 'ui.less': 'Ver menos',
        'hero.role': 'Desenvolvedor Salesforce Sênior',
        'hero.pokerTitle': 'Planning Poker gratuito',
        'hero.pokerSub': 'Estimativas em tempo real para times ágeis · sem cadastro',
        'perfil.eyebrow': '01 · Perfil', 'perfil.title': 'Perfil Profissional',
        'perfil.body': 'Desenvolvedor Salesforce Sênior com 5+ anos de experiência prática construindo soluções enterprise escaláveis em Sales Cloud, Service Cloud e Experience Cloud, com foco recente na implementação técnica de <strong>agentes autônomos de IA com Agentforce</strong>: Topics e Instructions, Agent Actions (Apex, Flow e Prompt Templates), grounding com Data Cloud e Knowledge, guardrails com Einstein Trust Layer e deploy em canais digitais com escalonamento via Omni-Channel. Forte em Apex, LWC, Visualforce e Flows, modelagem de dados, governor limits, otimização de performance e integrações REST/SOAP. Foco em código limpo e reutilizável (Trigger Framework, design patterns), testes automatizados (85%+ de cobertura) e DevOps com Git e Copado, trabalhando junto a Admins e áreas de negócio para transformar requisitos em soluções técnicas.',
        'stat.years': 'anos de experiência', 'stat.users': 'usuários atendidos', 'stat.orgs': 'orgs de produção',
        'stat.integrations': 'projetos de integração', 'stat.coverage': 'cobertura de testes', 'stat.performance': 'ganho de performance da org',
        'perfil.highlights': '<strong>Principais resultados:</strong> agentes Agentforce em produção, com Topics, Actions e grounding em Data Cloud, automatizando atendimentos antes feitos por humanos · redução de 35% em problemas críticos em produção e ganho de 60% de performance da org com padrões escaláveis e otimização de SOQL · 15+ projetos de integração enterprise · mentoria de 3 desenvolvedores juniores, 2 promovidos a pleno.',
        'experiencia.eyebrow': '02 · Trajetória', 'experiencia.title': 'Experiência Profissional',
        'job1.title': 'Desenvolvedor Salesforce Sênior – OSF Digital', 'job1.period': 'Out 2022 – Presente', 'job1.company': 'Remoto',
        'job1.li1': 'Desenvolvo e entrego soluções Salesforce enterprise (Sales Cloud, Service Cloud, Experience Cloud) para 5.000+ usuários, com bases de milhões de registros',
        'job1.li2': 'Modelo dados customizados e escrevo Apex performático e bulkificado, com Trigger Framework, design patterns e processamento assíncrono (Queueable, Batch, Scheduled), dentro dos governor limits',
        'job1.li3': 'Construo Lightning Web Components reutilizáveis com cache no cliente, LMS, design responsivo e acessibilidade; mantenho e modernizo páginas Visualforce',
        'job1.li4': 'Automatizo processos de negócio com Flows record-triggered, agendados e autolaunched, escolhendo entre abordagens declarativas e programáticas',
        'job1.li5': 'Construo integrações REST/SOAP com sistemas externos usando Named Credentials, OAuth 2.0, Platform Events e Change Data Capture, com tratamento de erros, retentativas e rate limiting',
        'job1.li6': 'Otimizo a performance das orgs com tuning de SOQL, queries seletivas e indexação; reduzi em 40% o tempo de resposta a incidentes em produção com análise de causa raiz',
        'job1.li7': 'Garanto código limpo e reutilizável com code reviews e análise PMD; mantenho 85%+ de cobertura com testes unitários Apex automatizados; mentoro desenvolvedores juniores',
        'job1.li8': 'Gerencio versionamento e pipelines de release com Git, Copado, Flosum e SFDX em 50+ orgs de produção',
        'job1.li9': 'Atuo com Admins Salesforce e áreas de negócio para transformar requisitos em desenhos técnicos e estimativas',
        'job2.title': 'Desenvolvedor Salesforce (Júnior → Pleno) – Sottelli', 'job2.period': 'Jan 2021 – Set 2022', 'job2.company': 'Remoto',
        'job2.li1': 'Promovido de estagiário a desenvolvedor em 6 meses; construí funcionalidades com Flows, Process Builder, Apex e LWC',
        'job2.li2': 'Entreguei 8+ funcionalidades para clientes e migrei componentes Aura legados para LWC, melhorando performance e manutenibilidade',
        'job2.li3': 'Atuei em times Agile/Scrum, com pair programming e code reviews junto a desenvolvedores sêniores',
        'comunidade.eyebrow': '07 · Projetos', 'comunidade.title': 'Projetos Pessoais',
        'comunidade.box3': '<strong>Projeto aberto – Planning Poker:</strong> Ferramenta gratuita de estimativa em tempo real para times ágeis, sem cadastro (Next.js + Supabase Realtime). <a href="/poker/">Experimente aqui →</a>',
        'skills.eyebrow': '03 · Competências', 'skills.title': 'Competências Técnicas',
        'skill1.title': 'Agentforce e IA Generativa', 'skill1.body': 'Agentforce Builder, Topics e Instructions, Agent Actions, Prompt Builder e Prompt Templates, Atlas Reasoning Engine, Einstein Trust Layer, Data Cloud Grounding / RAG, Data Library, Testing Center, Agent API, Agentforce DX, Einstein Bots, Prompt Engineering',
        'skill2.title': 'Apex, Flows e Back-end', 'skill2.body': 'Apex, Async Apex (Queueable, Batch, Scheduled), Trigger Framework, Design Patterns, Flows (record-triggered, agendados, autolaunched), SOQL/SOSL, Bulkification, Governor Limits',
        'skill3.title': 'Front-end', 'skill3.body': 'Lightning Web Components, Visualforce, JavaScript, TypeScript, HTML5, CSS3, LMS, Acessibilidade',
        'skill4.title': 'Integrações', 'skill4.body': 'REST, SOAP, Named Credentials, OAuth 2.0, Platform Events, Change Data Capture, Webhooks',
        'skill5.title': 'Plataforma Salesforce', 'skill5.body': 'Sales Cloud, Service Cloud, Experience Cloud, Data Cloud, Knowledge, Omni-Channel, MIAW, Modelagem de Dados, Modelo de Segurança e Compartilhamento',
        'skill6.title': 'DevOps e Qualidade', 'skill6.body': 'Git, GitHub, Copado, Flosum, SFDX, CI/CD, Testes Unitários Apex / TDD, Code Review, PMD',
        'certs.eyebrow': '04 · Certificações', 'certs.title': 'Certificações Profissionais',
        'formacao.eyebrow': '05 · Formação', 'formacao.title': 'Formação Acadêmica',
        'formacao.box1': '<strong>Graduação – Análise e Desenvolvimento de Sistemas</strong> | Universidade GRAN | Conclusão prevista: dezembro de 2026',
        'formacao.box2': '<strong>Pós-graduação – Arquitetura de Software para Ambientes de Dados em Larga Escala</strong> | Em andamento | 2027',
        'idiomas.eyebrow': '06 · Idiomas', 'idiomas.title': 'Idiomas',
        'idiomas.box': '<strong>Português:</strong> Nativo &nbsp;|&nbsp; <strong>Inglês:</strong> Avançado (Técnico &amp; Profissional)',
        'job1.groupAi': 'Agentforce e IA Agêntica',
        'job1.groupPlatform': 'Desenvolvimento na Plataforma',
        'job1.ai1': 'Implementação técnica end-to-end de agentes autônomos com Agentforce (Agentforce Service Agent e agentes customizados) para atendimento ao cliente e automação de processos, do desenvolvimento ao deploy em produção',
        'job1.ai2': 'Configuração de agentes no Agentforce Builder: Topics, classificação de intenção, Instructions e escopo de atuação, refinando o comportamento do Atlas Reasoning Engine e reduzindo desvios de tópico',
        'job1.ai3': 'Desenvolvimento de Agent Actions customizadas com Apex (@InvocableMethod), Flows autolançados e Prompt Templates no Prompt Builder, conectando agentes a sistemas externos via APIs REST',
        'job1.ai4': 'Grounding de respostas com Data Cloud, Salesforce Knowledge e Agentforce Data Library (RAG), garantindo respostas contextualizadas a partir de dados confiáveis do CRM',
        'job1.ai5': 'Guardrails com Einstein Trust Layer (mascaramento de dados sensíveis, detecção de toxicidade, zero data retention), Agent User e permissões de menor privilégio em conformidade com a LGPD',
        'job1.ai6': 'Deploy de agentes via Messaging for In-App and Web (MIAW), Embedded Service e Experience Cloud, com escalonamento para atendentes humanos via Omni-Channel e handoff contextualizado',
        'job1.ai7': 'Migração de Einstein Bots legados para Agentforce, substituindo fluxos de diálogo rígidos por agentes baseados em LLM',
        'job1.ai8': 'Testes com Agentforce Testing Center (testes em lote de utterances), monitoramento de sessões e iteração contínua de prompts e instruções',
        'job1.ai9': 'Integração de agentes a aplicações externas via Agent API e versionamento de metadados em pipelines CI/CD com SFDX e Agentforce DX',
        'footer.location': 'Brasília, Brasil · Aberto a trabalho remoto',
        'footer.rights': '© 2026 Pedro Ferreira – Todos os Direitos Reservados'
    },
    en: {
        'nav.hero': 'Home', 'nav.perfil': 'Profile', 'nav.experiencia': 'Journey',
        'nav.comunidade': 'Projects', 'nav.skills': 'Skills', 'nav.certs': 'Certifications',
        'nav.formacao': 'Education', 'nav.idiomas': 'Languages',
        'ui.more': 'Show more', 'ui.less': 'Show less',
        'hero.role': 'Senior Salesforce Developer',
        'hero.pokerTitle': 'Free Planning Poker',
        'hero.pokerSub': 'Real-time estimation for agile teams · no sign-up',
        'perfil.eyebrow': '01 · Profile', 'perfil.title': 'Professional Summary',
        'perfil.body': 'Senior Salesforce Developer with 5+ years of hands-on experience building scalable enterprise solutions on Sales Cloud, Service Cloud and Experience Cloud, with a recent focus on the technical implementation of <strong>autonomous AI agents with Agentforce</strong>: Topics and Instructions, Agent Actions (Apex, Flow and Prompt Templates), grounding with Data Cloud and Knowledge, Einstein Trust Layer guardrails and deployment to digital channels with Omni-Channel escalation. Strong in Apex, LWC, Visualforce and Flows, Salesforce data modeling, governor limits, performance optimization and REST/SOAP integrations. Focused on clean, reusable code (Trigger Framework, design patterns), automated testing (85%+ coverage) and DevOps with Git and Copado, working closely with Admins and business stakeholders to turn requirements into technical solutions.',
        'stat.years': 'years of experience', 'stat.users': 'users served', 'stat.orgs': 'production orgs',
        'stat.integrations': 'integration projects', 'stat.coverage': 'test coverage', 'stat.performance': 'org performance gain',
        'perfil.highlights': '<strong>Key achievements:</strong> Agentforce agents in production with Topics, Actions and Data Cloud grounding, automating service previously handled by humans · reduced critical production issues by 35% and improved org performance by 60% through scalable patterns and SOQL optimization · 15+ enterprise integration projects · mentored 3 junior developers, 2 promoted to mid-level.',
        'experiencia.eyebrow': '02 · Journey', 'experiencia.title': 'Professional Experience',
        'job1.title': 'Senior Salesforce Developer – OSF Digital', 'job1.period': 'Oct 2022 – Present', 'job1.company': 'Remote',
        'job1.li1': 'Develop and deliver enterprise Salesforce solutions (Sales Cloud, Service Cloud, Experience Cloud) for 5,000+ users with multi-million-record datasets',
        'job1.li2': 'Design custom data models and write high-performance, bulkified Apex with a Trigger Framework, design patterns and asynchronous processing (Queueable, Batch, Scheduled), staying within governor limits',
        'job1.li3': 'Build reusable Lightning Web Components with client-side caching, LMS, responsive design and accessibility standards; maintain and modernize Visualforce pages',
        'job1.li4': 'Automate business processes with record-triggered, scheduled and autolaunched Flows, choosing between declarative and programmatic approaches',
        'job1.li5': 'Build REST/SOAP integrations with third-party systems using Named Credentials, OAuth 2.0, Platform Events and Change Data Capture, with error handling, retries and rate limiting',
        'job1.li6': 'Optimize org performance through SOQL tuning, selective queries and indexing; cut production incident response time by 40% through root cause analysis',
        'job1.li7': 'Enforce clean, reusable code through code reviews and PMD analysis; maintain 85%+ test coverage with automated Apex unit tests; mentor junior developers',
        'job1.li8': 'Manage source control and release pipelines with Git, Copado, Flosum and SFDX across 50+ production orgs',
        'job1.li9': 'Partner with Salesforce Admins and business stakeholders to refine requirements into technical designs and estimates',
        'job2.title': 'Salesforce Developer (Junior → Mid-level) – Sottelli', 'job2.period': 'Jan 2021 – Sep 2022', 'job2.company': 'Remote',
        'job2.li1': 'Promoted from intern to developer in 6 months; built features with Flows, Process Builder, Apex and LWC',
        'job2.li2': 'Delivered 8+ client features and migrated legacy Aura components to LWC, improving performance and maintainability',
        'job2.li3': 'Worked in Agile/Scrum teams, with pair programming and code reviews alongside senior developers',
        'comunidade.eyebrow': '07 · Projects', 'comunidade.title': 'Personal Projects',
        'comunidade.box3': '<strong>Open project – Planning Poker:</strong> A free, real-time estimation tool for agile teams, no sign-up required (Next.js + Supabase Realtime). <a href="/poker/">Try it here →</a>',
        'skills.eyebrow': '03 · Skills', 'skills.title': 'Technical Skills',
        'skill1.title': 'Agentforce &amp; Generative AI', 'skill1.body': 'Agentforce Builder, Topics &amp; Instructions, Agent Actions, Prompt Builder &amp; Prompt Templates, Atlas Reasoning Engine, Einstein Trust Layer, Data Cloud Grounding / RAG, Data Library, Testing Center, Agent API, Agentforce DX, Einstein Bots, Prompt Engineering',
        'skill2.title': 'Apex, Flows &amp; Back-end', 'skill2.body': 'Apex, Async Apex (Queueable, Batch, Scheduled), Trigger Framework, Design Patterns, Flows (record-triggered, scheduled, autolaunched), SOQL/SOSL, Bulkification, Governor Limits',
        'skill3.title': 'Front-end', 'skill3.body': 'Lightning Web Components, Visualforce, JavaScript, TypeScript, HTML5, CSS3, LMS, Accessibility',
        'skill4.title': 'Integrations', 'skill4.body': 'REST, SOAP, Named Credentials, OAuth 2.0, Platform Events, Change Data Capture, Webhooks',
        'skill5.title': 'Salesforce Platform', 'skill5.body': 'Sales Cloud, Service Cloud, Experience Cloud, Data Cloud, Knowledge, Omni-Channel, MIAW, Data Modeling, Security &amp; Sharing Model',
        'skill6.title': 'DevOps &amp; Quality', 'skill6.body': 'Git, GitHub, Copado, Flosum, SFDX, CI/CD, Apex Unit Testing / TDD, Code Review, PMD',
        'certs.eyebrow': '04 · Certifications', 'certs.title': 'Professional Certifications',
        'formacao.eyebrow': '05 · Education', 'formacao.title': 'Education',
        'formacao.box1': '<strong>Bachelor\'s Degree – Systems Analysis and Development</strong> | GRAN University | Expected December 2026',
        'formacao.box2': '<strong>Postgraduate – Software Architecture for Large-Scale Data Environments</strong> | In progress | 2027',
        'idiomas.eyebrow': '06 · Languages', 'idiomas.title': 'Languages',
        'idiomas.box': '<strong>Portuguese:</strong> Native &nbsp;|&nbsp; <strong>English:</strong> Advanced (Technical &amp; Professional)',
        'job1.groupAi': 'Agentforce &amp; Agentic AI',
        'job1.groupPlatform': 'Platform Development',
        'job1.ai1': 'End-to-end technical implementation of autonomous agents with Agentforce (Agentforce Service Agent and custom agents) for customer service and process automation, from development to production deployment',
        'job1.ai2': 'Agent configuration in Agentforce Builder: Topics, intent classification, Instructions and scope, refining Atlas Reasoning Engine behavior and reducing topic drift',
        'job1.ai3': 'Custom Agent Actions built with Apex (@InvocableMethod), autolaunched Flows and Prompt Templates in Prompt Builder, connecting agents to external systems via REST APIs',
        'job1.ai4': 'Response grounding with Data Cloud, Salesforce Knowledge and Agentforce Data Library (RAG), ensuring contextual answers based on trusted CRM data',
        'job1.ai5': 'Guardrails with Einstein Trust Layer (sensitive data masking, toxicity detection, zero data retention), Agent User and least-privilege permissions in compliance with LGPD',
        'job1.ai6': 'Agent deployment via Messaging for In-App and Web (MIAW), Embedded Service and Experience Cloud, with escalation to human agents through Omni-Channel and contextual handoff',
        'job1.ai7': 'Migration of legacy Einstein Bots to Agentforce, replacing rigid dialog flows with LLM-based agents',
        'job1.ai8': 'Testing with Agentforce Testing Center (batch utterance tests), session monitoring and continuous iteration of prompts and instructions',
        'job1.ai9': 'Agent integration with external applications via Agent API and metadata versioning in CI/CD pipelines with SFDX and Agentforce DX',
        'footer.location': 'Brasília, Brazil · Open to remote',
        'footer.rights': '© 2026 Pedro Ferreira – All Rights Reserved'
    }
};

const MOBILE_QUERY = window.matchMedia('(max-width: 768px)');

/* hero-role deve caber em uma linha e medir sempre 90% da largura do nome.
   No celular não cabe legível em uma linha: o CSS deixa quebrar normalmente. */
function fitHeroRole() {
    const nameEl = document.querySelector('.hero-name');
    const roleEl = document.querySelector('.hero-role');
    if (!nameEl || !roleEl) return;
    if (MOBILE_QUERY.matches) {
        roleEl.style.width = '';
        roleEl.style.fontSize = '';
        return;
    }
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
    refreshMoreToggles();
}

/* Listas longas de conquistas: mostram 3 itens + "Ver mais" no celular e nos cards
   do modo slides (o CSS decide onde esconder; na rolagem desktop a lista vem inteira). */
const COLLAPSED_ITEMS = 3;
document.querySelectorAll('.achievements').forEach((list) => {
    if (list.children.length <= COLLAPSED_ITEMS) return;
    list.classList.add('is-collapsible', 'is-collapsed');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'more-toggle';
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
        const collapsed = list.classList.toggle('is-collapsed');
        btn.setAttribute('aria-expanded', String(!collapsed));
        refreshMoreToggles();
    });
    list.after(btn);
});
function refreshMoreToggles() {
    const dict = I18N[document.documentElement.dataset.lang] || I18N.pt;
    document.querySelectorAll('.more-toggle').forEach((btn) => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        const extra = btn.previousElementSibling ? btn.previousElementSibling.children.length - COLLAPSED_ITEMS : 0;
        btn.textContent = expanded ? dict['ui.less'] : dict['ui.more'] + ' (+' + extra + ')';
    });
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
    { name: 'sunset', icon: 'fa-solid fa-mountain-sun', label: { pt: 'Pôr do Sol', en: 'Sunset' } },
    { name: 'lightning', icon: 'fa-solid fa-cloud', label: { pt: 'Lightning (Salesforce)', en: 'Lightning (Salesforce)' } }
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
let currentThemeName = THEMES.some((t) => t.name === savedTheme) ? savedTheme : 'lightning';
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
                /* cards entram alternando os lados: ímpares pela direita, pares pela esquerda */
                const side = i % 2 === 1 ? 1 : -1;
                const a = Math.min(-delta, 1);
                xPercent = -50 + side * 100 * a;
                x = side * 90 * a;
                if (-delta > 1) vis = 'hidden';
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

    /* entrada alternada (direita/esquerda) também na rolagem vertical, exceto com movimento
       reduzido. Deslocamento curto e rápido: no celular, um deslocamento grande deixava
       a página mais larga que a tela e áreas em branco durante a rolagem. */
    if (!prefersReducedMotion) {
        const offset = MOBILE_QUERY.matches ? 28 : 80;
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                revealObserver.unobserve(entry.target);
                gsap.to(entry.target, { x: 0, opacity: 1, duration: 0.55, ease: 'power2.out', clearProps: 'transform' });
            });
        }, { threshold: 0.02, rootMargin: '0px 0px -8% 0px' });
        slides.forEach((el, i) => {
            if (i === 0) return;
            gsap.set(el, { x: (i % 2 === 1 ? 1 : -1) * offset, opacity: 0 });
            revealObserver.observe(el);
        });
    }
}

/* ===================== HERO: revelação inicial ===================== */
if (!prefersReducedMotion) {
    const split = new SplitText('.hero-name', { type: 'chars', charsClass: 'char' });
    gsap.from(split.chars, { yPercent: 130, opacity: 0, duration: 1, stagger: 0.03, ease: 'power4.out', delay: 0.2 });
    gsap.from('.hero-role', { opacity: 0, y: 16, duration: 0.8, delay: 0.7, ease: 'power2.out' });
    gsap.set('.hero-contact .icon-pill', { opacity: 0, y: 16 });
    gsap.to('.hero-contact .icon-pill', { opacity: 1, y: 0, duration: 0.6, delay: 1.0, stagger: 0.08, ease: 'power2.out' });
    gsap.from('.hero-cta', { opacity: 0, y: 16, duration: 0.7, delay: 1.4, ease: 'power2.out', clearProps: 'transform' });
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
