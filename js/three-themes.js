const heroReducedMotion = window.prefersReducedMotion;

const canvas = document.getElementById('hero-canvas');
/* Em telas touch o fundo é decorativo atrás do conteúdo: menos pixels e sem antialias
   economizam GPU/bateria sem diferença visível. */
const heroIsTouch = !!window.isCoarsePointer;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !heroIsTouch, alpha: true, powerPreference: 'low-power' });
const MAX_PIXEL_RATIO = heroIsTouch ? 1.25 : 2;

/* usa o tamanho real do próprio canvas (via CSS) em vez de window.innerWidth/innerHeight,
   para funcionar corretamente também dentro de painéis/iframes embutidos */
function currentSize() {
    return { w: canvas.clientWidth || window.innerWidth, h: canvas.clientHeight || window.innerHeight };
}
function applySize() {
    const { w, h } = currentSize();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    renderer.setSize(w, h, false);
    if (activeRenderer && activeRenderer.onResize) activeRenderer.onResize(w, h);
}

function makeSprite(colorStops) {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    (colorStops || [[0, 'rgba(255,255,255,1)'], [0.4, 'rgba(255,255,255,0.6)'], [1, 'rgba(255,255,255,0)']])
        .forEach(([stop, color]) => g.addColorStop(stop, color));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
}

let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5);
    mouseY = (e.clientY / window.innerHeight - 0.5);
});

/* ===================== TEMA: COSMOS — campo estelar 3D ===================== */
function createCosmosTheme() {
    const scene = new THREE.Scene();
    const { w: w0, h: h0 } = currentSize();
    const camera = new THREE.PerspectiveCamera(60, w0 / h0, 0.1, 3000);
    camera.position.z = 420;
    const sprite = makeSprite();

    function makeStarLayer(count, radius, size, palette) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const color = new THREE.Color();
        for (let i = 0; i < count; i++) {
            const r = radius * (0.4 + Math.random() * 0.6);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
            color.set(palette[Math.floor(Math.random() * palette.length)]);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        const mat = new THREE.PointsMaterial({
            size, map: sprite, vertexColors: true, transparent: true,
            depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
        });
        return new THREE.Points(geo, mat);
    }

    const farStars = makeStarLayer(3200, 1400, 2.2, ['#ffffff', '#bcd4ff', '#8fb8ff']);
    const nearStars = makeStarLayer(900, 800, 3.6, ['#4ee1ff', '#b26bff', '#ff5ec8']);
    scene.add(farStars, nearStars);

    let targetX = 0, targetY = 0, scrollT = 0;

    return {
        scene, camera,
        onResize(w, h) { camera.aspect = w / h; camera.updateProjectionMatrix(); },
        update() {
            if (heroReducedMotion) return;
            targetX += (mouseX - targetX) * 0.04;
            targetY += (mouseY - targetY) * 0.04;
            farStars.rotation.y += 0.00025;
            nearStars.rotation.y -= 0.00045;
            farStars.rotation.x = targetY * 0.25;
            nearStars.rotation.x = targetY * 0.4;
            farStars.rotation.z = targetX * 0.1;
            scrollT += ((window.__slideProgress || 0) - scrollT) * 0.05;
            camera.position.z = 420 - scrollT * 260;
            camera.rotation.z = scrollT * 0.12;
        },
        dispose() {
            farStars.geometry.dispose(); farStars.material.dispose();
            nearStars.geometry.dispose(); nearStars.material.dispose();
        }
    };
}

/* ===================== TEMA: PÔR DO SOL — sol dourado sobre colinas ===================== */
function createSunsetTheme() {
    const scene = new THREE.Scene();
    const { w: w0, h: h0 } = currentSize();
    const camera = new THREE.PerspectiveCamera(55, w0 / h0, 0.1, 3000);
    camera.position.z = 420;

    const sunSprite = makeSprite([
        [0, 'rgba(255,247,220,1)'],
        [0.15, 'rgba(255,205,120,0.9)'],
        [0.35, 'rgba(255,140,80,0.45)'],
        [0.6, 'rgba(255,90,60,0.12)'],
        [1, 'rgba(255,90,60,0)']
    ]);
    const sun = new THREE.Sprite(new THREE.SpriteMaterial({
        map: sunSprite, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    sun.scale.set(380, 380, 1);
    sun.position.set(0, -75, -260);
    scene.add(sun);

    const reflection = new THREE.Sprite(sun.material.clone());
    reflection.material.opacity = 0.28;
    reflection.scale.set(380, 130, 1);
    reflection.position.set(0, -235, -259);
    scene.add(reflection);

    /* posição horizontal do sol/reflexo fixada a ~20% da borda esquerda da tela,
       recalculada a cada frame pois depende do fov/aspect/distância da câmera */
    function xForScreenFraction(fraction, depthZ) {
        const dist = camera.position.z - depthZ;
        const vFov = camera.fov * Math.PI / 180;
        const halfHeight = dist * Math.tan(vFov / 2);
        const halfWidth = halfHeight * camera.aspect;
        return (-1 + fraction * 2) * halfWidth;
    }

    function makeHillShape(baseY, amplitude, seed) {
        const shape = new THREE.Shape();
        const width = 2600, steps = 10;
        shape.moveTo(-width / 2, -600);
        shape.lineTo(-width / 2, baseY);
        for (let i = 0; i <= steps; i++) {
            const x = -width / 2 + (width * i) / steps;
            const y = baseY + Math.sin(i * 1.3 + seed) * amplitude + Math.sin(i * 0.5 + seed * 2) * amplitude * 0.5;
            shape.lineTo(x, y);
        }
        shape.lineTo(width / 2, -600);
        shape.closePath();
        return new THREE.ShapeGeometry(shape);
    }

    const hillLayers = [
        { y: -55, amp: 18, z: -520, color: 0x8a5560, opacity: 0.6, seed: 1.1 },
        { y: -105, amp: 24, z: -400, color: 0x4a2430, opacity: 0.85, seed: 3.4 },
        { y: -160, amp: 30, z: -300, color: 0x180d12, opacity: 1, seed: 5.2 }
    ].map((cfg) => {
        const geo = makeHillShape(cfg.y, cfg.amp, cfg.seed);
        const mat = new THREE.MeshBasicMaterial({ color: cfg.color, transparent: true, opacity: cfg.opacity, depthWrite: false });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.z = cfg.z;
        scene.add(mesh);
        return mesh;
    });

    let targetX = 0, targetY = 0, scrollT = 0, t = 0;

    return {
        scene, camera,
        onResize(w, h) { camera.aspect = w / h; camera.updateProjectionMatrix(); },
        update() {
            t += 0.01;
            const sunBaseX = xForScreenFraction(0.2, sun.position.z);
            if (heroReducedMotion) {
                sun.position.x = sunBaseX;
                reflection.position.x = sunBaseX;
                return;
            }
            targetX += (mouseX - targetX) * 0.03;
            targetY += (mouseY - targetY) * 0.03;
            const pulse = 1 + Math.sin(t) * 0.02;
            sun.scale.set(380 * pulse, 380 * pulse, 1);
            sun.position.x = sunBaseX + targetX * -30;
            reflection.position.x = sun.position.x;
            reflection.material.opacity = 0.3 + Math.sin(t * 0.7) * 0.04;
            /* a camada mais escura (o "chão") fica fixa; só o sol, o reflexo e as
               duas camadas de colina mais claras respondem ao parallax do mouse */
            hillLayers.forEach((mesh, i) => {
                if (i === hillLayers.length - 1) return;
                mesh.position.x = targetX * -12 * (i + 1);
            });
            scrollT += ((window.__slideProgress || 0) - scrollT) * 0.05;
            camera.position.z = 420 - scrollT * 140;
            camera.position.y = targetY * 12;
        },
        dispose() {
            sun.material.dispose();
            reflection.material.dispose();
            hillLayers.forEach((mesh) => { mesh.geometry.dispose(); mesh.material.dispose(); });
        }
    };
}

/* ===================== TEMA: LIGHTNING — céu claro com nuvens (UX Salesforce) ===================== */
function createLightningTheme() {
    const scene = new THREE.Scene();
    const { w: w0, h: h0 } = currentSize();
    const camera = new THREE.PerspectiveCamera(55, w0 / h0, 0.1, 3000);
    camera.position.z = 500;

    const puffTexture = makeSprite([
        [0, 'rgba(255,255,255,1)'],
        [0.45, 'rgba(255,255,255,0.85)'],
        [0.75, 'rgba(255,255,255,0.25)'],
        [1, 'rgba(255,255,255,0)']
    ]);
    const materials = [];
    const clouds = [];

    /* cada nuvem = grupo de "puffs" sobrepostos; profundidades diferentes geram parallax */
    function makeCloud(depth, scale, opacity) {
        const group = new THREE.Group();
        const mat = new THREE.SpriteMaterial({ map: puffTexture, transparent: true, depthWrite: false, opacity });
        materials.push(mat);
        const puffs = 5 + Math.floor(Math.random() * 4);
        for (let i = 0; i < puffs; i++) {
            const s = new THREE.Sprite(mat);
            const size = (60 + Math.random() * 70) * scale;
            s.scale.set(size * 1.3, size, 1);
            s.position.set((i - puffs / 2) * 34 * scale + (Math.random() - 0.5) * 20 * scale,
                Math.sin((i / (puffs - 1)) * Math.PI) * 26 * scale + (Math.random() - 0.5) * 10 * scale, 0);
            group.add(s);
        }
        group.position.set((Math.random() - 0.5) * 1600, (Math.random() - 0.5) * 700, depth);
        group.userData.speed = (0.12 + Math.random() * 0.18) * (1 + depth / 600);
        scene.add(group);
        clouds.push(group);
    }
    for (let i = 0; i < 7; i++) makeCloud(-500 - Math.random() * 300, 1.4, 0.55);
    for (let i = 0; i < 6; i++) makeCloud(-150 - Math.random() * 200, 1.1, 0.75);
    for (let i = 0; i < 3; i++) makeCloud(80 + Math.random() * 80, 0.9, 0.9);

    /* pontinhos azuis sutis (cor de marca) */
    const dotCount = 140;
    const pos = new Float32Array(dotCount * 3);
    for (let i = 0; i < dotCount; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 1800;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 1000;
        pos[i * 3 + 2] = -600 + Math.random() * 700;
    }
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const dotMat = new THREE.PointsMaterial({ color: 0x0176d3, size: 3, map: makeSprite(), transparent: true, opacity: 0.35, depthWrite: false });
    const dots = new THREE.Points(dotGeo, dotMat);
    scene.add(dots);

    let targetX = 0, targetY = 0;
    return {
        scene, camera,
        onResize(w, h) { camera.aspect = w / h; camera.updateProjectionMatrix(); },
        update() {
            if (heroReducedMotion) return;
            targetX += (mouseX - targetX) * 0.04;
            targetY += (mouseY - targetY) * 0.04;
            camera.position.x = targetX * 60;
            camera.position.y = -targetY * 40 - (window.__slideProgress || 0) * 80;
            camera.lookAt(0, camera.position.y * 0.5, -300);
            clouds.forEach((c) => {
                c.position.x += c.userData.speed;
                if (c.position.x > 1000) c.position.x = -1000;
            });
            dots.rotation.y += 0.0004;
        },
        dispose() {
            materials.forEach((m) => m.dispose());
            puffTexture.dispose();
            dotGeo.dispose();
            dotMat.dispose();
        }
    };
}

const THEME_RENDERERS = { cosmos: createCosmosTheme, sunset: createSunsetTheme, lightning: createLightningTheme };
let activeRenderer = null;

function activateHeroTheme(name) {
    if (activeRenderer && activeRenderer.dispose) activeRenderer.dispose();
    const factory = THEME_RENDERERS[name] || THEME_RENDERERS.lightning;
    activeRenderer = factory();
    // garante um quadro do tema novo mesmo com o loop pausado (rolagem longe do hero)
    activeRenderer.update();
    renderer.render(activeRenderer.scene, activeRenderer.camera);
}
window.__setHeroTheme = activateHeroTheme;

applySize();
window.addEventListener('resize', applySize);
if (window.ResizeObserver) new ResizeObserver(applySize).observe(canvas);

window.__slideProgress = 0;

let running = true;
document.addEventListener('visibilitychange', () => { running = !document.hidden; });

/* Na rolagem vertical (touch / movimento reduzido) o hero sai da tela e as seções cobrem
   o fundo: pausa o render depois de ~1 tela de rolagem. No modo slides o fundo fica sempre visível. */
const heroScrollMode = !document.documentElement.classList.contains('slides-mode');

function animate() {
    requestAnimationFrame(animate);
    if (!running || !activeRenderer) return;
    if (heroScrollMode && window.scrollY > window.innerHeight * 1.1) return;
    activeRenderer.update();
    renderer.render(activeRenderer.scene, activeRenderer.camera);
}

const heroSavedTheme = (function () { try { return localStorage.getItem('siteTheme'); } catch (e) { return null; } })();
activateHeroTheme(THEME_RENDERERS[heroSavedTheme] ? heroSavedTheme : 'lightning');
animate();
