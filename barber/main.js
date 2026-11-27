// Casa Navalha — interações mínimas: header, menu mobile e revelação ao rolar.
(function () {
    var root = document.documentElement;
    var body = document.body;
    var header = document.getElementById('header');
    var menuBtn = document.getElementById('menu-btn');
    var nav = document.getElementById('nav');

    // Header com fundo depois de rolar
    function onScroll() {
        header.classList.toggle('scrolled', window.scrollY > 24);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Menu mobile
    function setMenu(open) {
        body.classList.toggle('menu-open', open);
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    }
    menuBtn.addEventListener('click', function () {
        setMenu(!body.classList.contains('menu-open'));
    });
    nav.addEventListener('click', function (e) {
        if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setMenu(false);
    });

    // Revelação suave dos blocos
    if (!('IntersectionObserver' in window)) return;
    root.classList.add('js');
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                io.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
})();
