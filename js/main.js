document.addEventListener('DOMContentLoaded', () => {
    initLoader(); // Start with loader
});

const DEFAULT_SITE_SETTINGS = {
    siteName: 'ASTRONOMY & ASTROPHYSICS SOCIETY',
    heroBadge: 'Government College of Engineering - GCOEA',
    heroTitleLine1: 'Exploring The',
    heroTitleLine2: 'Infinite Cosmos',
    heroSubtitle: 'Observe. Discover. Understand the universe.',
    heroPrimaryText: 'Announcement',
    heroPrimaryUrl: 'index.html#announcements',
    heroSecondaryText: 'Explore Programs',
    heroSecondaryUrl: 'programs.html',
    footerAbout: 'Exploring the infinite cosmos, one star at a time. Join our mission to decode the universe through observation and research.',
    whatsappUrl: 'https://chat.whatsapp.com/IQbOWh8nZhN401xweqOG4z?mode=gi_t',
    instagramUrl: 'https://www.instagram.com/aasg_gcoea?igsh=OGE5ODhtYzkzb2hi',
    supportEmail: 'astrophy@gcoea.in',
    contactEmailDisplay: 'adityataywadeofficial@gmail.com',
};

let siteSettingsCache = { ...DEFAULT_SITE_SETTINGS };

// 2. CINEMATIC LOADER
function initLoader() {
    const loader = document.getElementById('cinematic-loader');
    if (!loader) {
        initApp(); // Run app if no loader (other pages)
        return;
    }
    const hasSeenLoader = sessionStorage.getItem('astro_loader_seen') === '1';
    if (hasSeenLoader) {
        document.body.classList.remove('overflow-hidden');
        loader.style.display = 'none';
        initApp();
        return;
    }
    const rocket = loader.querySelector('.rocket-wrapper');
    const panels = loader.querySelectorAll('.loader-panel');
    const status = loader.querySelector('.loader-status');

    // Sequence:
    // 1. Ignition (Show status)
    setTimeout(() => {
        status.style.opacity = '1';
    }, 250);

    // 2. Launch
    setTimeout(() => {
        rocket.classList.add('launch');
        status.textContent = "Max Q Reached";
    }, 650);

    // 3. Curtains Open
    setTimeout(() => {
        panels.forEach(p => p.classList.add('slide-out'));
        document.body.classList.remove('overflow-hidden');
    }, 1150);

    // 4. Initialize App & Fade In Hero
    setTimeout(() => {
        sessionStorage.setItem('astro_loader_seen', '1');
        initApp();
        loader.style.display = 'none';
    }, 1650);
}

function initApp() {
    initCursor();
    initFirebase();
    injectComponents();
    applySiteSettingsToDOM();
    loadSiteSettings();

    const path = window.location.pathname;
    const normalizedPath = String(path || '').toLowerCase();
    const isHomeRoute = normalizedPath === '/'
        || normalizedPath.endsWith('/')
        || normalizedPath.endsWith('/index.html');

    if (normalizedPath.includes('members')) loadMembers();
    if (normalizedPath.includes('programs')) loadEvents();
    if (normalizedPath.includes('gallery')) loadGallery();

    if (isHomeRoute) {
        initThreeJS(); // Stars background
        initCosmicSystem(); // Hero cosmic system only on home
        loadAnnouncements();
        initDailyFact();
        initEngagementHub();
        loadHomeGalleryScroller();
    } else {
        initCanvasStars();
    }

    if (typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true });
}

// 1. COMPONENT INJECTION (Nav & Footer)
function injectComponents() {
    const links = [
        { n: 'Home', u: 'index.html' }, { n: 'Members', u: 'members.html' }, 
        { n: 'Programs', u: 'programs.html' }, { n: 'Gallery', u: 'gallery.html' },
        { n: 'About', u: 'about.html' }, { n: 'Contact', u: 'contact.html' }
    ];
    const active = window.location.pathname.split('/').pop() || 'index.html';
    const activeNormalized = (active === '' || active === '/') ? 'index.html' : active;
    const isActiveLink = (url) => {
        const cleaned = String(url || '').split('#')[0];
        if (!cleaned || cleaned !== activeNormalized) return false;
        return !String(url || '').includes('#');
    };

    // Nav
    const navHTML = `
        <div class="container mx-auto px-6 py-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
                <div class="nav-logo">
                    <img src="logo.png" alt="Astronomy & Astrophysics Society logo" class="nav-logo__img">
                </div>
                <span class="nav-brand text-white font-heading font-bold tracking-[0.14em] uppercase leading-tight">
                    <span id="navBrandFull" class="nav-brand__full hidden sm:inline">ASTRONOMY &amp; ASTROPHYSICS SOCIETY</span>
                    <span id="navBrandShort" class="nav-brand__short sm:hidden">ASTRONOMY &amp; ASTROPHYSICS SOCIETY</span>
                </span>
            </div>
            <div class="hidden md:flex items-center gap-8">
                ${links.map(l => `<a href="${l.u}" class="nav-link ${isActiveLink(l.u) ? 'active' : ''}">${l.n}</a>`).join('')}
            </div>
            <button class="md:hidden text-white text-2xl mobile-toggle"><i class="fas fa-bars"></i></button>
        </div>
        <div class="mobile-menu hidden absolute top-20 left-0 w-full bg-black/95 p-6 text-center border-b border-white/10">
            ${links.map(l => `<a href="${l.u}" class="block py-3 text-white hover:text-cyan-400 mobile-menu-link">${l.n}</a>`).join('')}
        </div>`;

    const nav = document.createElement('nav');
    nav.innerHTML = navHTML;
    document.body.prepend(nav);

    // Mobile Toggle
    const toggleBtn = document.querySelector('.mobile-toggle');
    const menu = document.querySelector('.mobile-menu');
    const openMenu = () => {
        if (!menu) return;
        menu.classList.remove('hidden');
        menu.classList.add('active');
    };
    const closeMenu = () => {
        if (!menu) return;
        menu.classList.remove('active');
        menu.classList.add('hidden');
    };
    const toggleMenu = () => {
        if (!menu) return;
        if (menu.classList.contains('hidden')) openMenu();
        else closeMenu();
    };

    toggleBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu on link click
    document.querySelectorAll('.mobile-menu-link').forEach(a => {
        a.addEventListener('click', () => closeMenu());
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (!menu || menu.classList.contains('hidden')) return;
        if (menu.contains(e.target) || toggleBtn?.contains(e.target)) return;
        closeMenu();
    });

    // Close menu on resize to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) closeMenu();
    });

    // Footer (skip on admin)
    if (!activeNormalized.includes('admin')) {
        const foot = document.createElement('footer');
        foot.className = "relative z-50 bg-[#02040a] border-t border-white/10 pt-20 pb-10 mt-20 overflow-hidden";
        foot.innerHTML = `
                <!-- Decorative Top Glow -->
                <div class="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_10px_var(--cyan-glow)]"></div>

                <div class="container mx-auto px-6">
                    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                        
                        <!-- Column 1: Brand Info -->
                        <div class="space-y-6">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                    <i class="fas fa-meteor text-white"></i>
                                </div>
                                <span id="footerBrandTitle" class="text-xl sm:text-2xl font-bold tracking-[0.14em] text-white uppercase" style="font-family: 'Orbitron', sans-serif;">ASTRONOMY &amp; ASTROPHYSICS SOCIETY</span>
                            </div>
                            <p id="footerAboutText" class="text-gray-400 leading-relaxed">
                                Exploring the infinite cosmos, one star at a time. Join our mission to decode the universe through observation and research.
                            </p>
                        </div>

                        <!-- Column 2: Navigation -->
                        <div>
                            <h3 class="text-lg font-bold text-white mb-6 tracking-widest uppercase" style="font-family: 'Orbitron', sans-serif;">Mission Links</h3>
                            <ul class="space-y-4">
                                <li><a href="index.html" class="text-gray-400 hover:text-cyan-400 transition flex items-center gap-2"><i class="fas fa-chevron-right text-xs text-purple-500"></i> Home</a></li>
                                <li><a href="about.html" class="text-gray-400 hover:text-cyan-400 transition flex items-center gap-2"><i class="fas fa-chevron-right text-xs text-purple-500"></i> About Us</a></li>
                                <li><a href="members.html" class="text-gray-400 hover:text-cyan-400 transition flex items-center gap-2"><i class="fas fa-chevron-right text-xs text-purple-500"></i> The Team</a></li>
                                <li><a href="programs.html" class="text-gray-400 hover:text-cyan-400 transition flex items-center gap-2"><i class="fas fa-chevron-right text-xs text-purple-500"></i> Programs</a></li>
                            </ul>
                        </div>

                        <!-- Column 3: Resources / Gallery -->
                        <div>
                            <h3 class="text-lg font-bold text-white mb-6 tracking-widest uppercase" style="font-family: 'Orbitron', sans-serif;">Discover</h3>
                            <ul class="space-y-4">
                                <li><a href="gallery.html" class="text-gray-400 hover:text-cyan-400 transition flex items-center gap-2"><i class="fas fa-chevron-right text-xs text-purple-500"></i> Deep Space Gallery</a></li>
                                <li><a href="contact.html" class="text-gray-400 hover:text-cyan-400 transition flex items-center gap-2"><i class="fas fa-chevron-right text-xs text-purple-500"></i> Contact Support</a></li>
                                <li><a href="#" class="text-gray-400 hover:text-cyan-400 transition flex items-center gap-2"><i class="fas fa-chevron-right text-xs text-purple-500"></i> Privacy Policy</a></li>
                            </ul>
                        </div>

                        <!-- Column 4: Connect -->
                        <div>
                            <h3 class="text-lg font-bold text-white mb-6 tracking-widest uppercase" style="font-family: 'Orbitron', sans-serif;">Signal Us</h3>
                            
                            <!-- Social Links -->
                            <div class="space-y-4">
                                <a id="footerWhatsappLink" href="https://chat.whatsapp.com/IQbOWh8nZhN401xweqOG4z?mode=gi_t" target="_blank" class="group flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-green-500/50 transition-all duration-300">
                                    <div class="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition">
                                        <i class="fab fa-whatsapp text-green-400 group-hover:text-white"></i>
                                    </div>
                                    <span class="text-gray-300 group-hover:text-white">WhatsApp Channel</span>
                                </a>

                                <a id="footerInstagramLink" href="https://www.instagram.com/aasg_gcoea?igsh=OGE5ODhtYzkzb2hi" target="_blank" class="group flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-pink-500/50 transition-all duration-300">
                                    <div class="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition">
                                        <i class="fab fa-instagram text-pink-400 group-hover:text-white"></i>
                                    </div>
                                    <span class="text-gray-300 group-hover:text-white">Instagram</span>
                                </a>
<a id="footerEmailLink" href="mailto:astrophy@gcoea.in" class="group flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300">
    
    <div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition">
        <i class="fas fa-envelope text-blue-400 group-hover:text-white"></i>
    </div>

    <span class="text-gray-300 group-hover:text-white">Email</span>

</a>
                            </div>

                            <div class="mt-6 flex items-center gap-2 text-sm text-gray-500">
                                <i class="fas fa-envelope text-cyan-500"></i>
                                <span id="footerContactEmail">adityataywadeofficial@gmail.com</span>
                            </div>
                        </div>
                    </div>

                    <!-- Copyright Bar -->
                    <div class="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p class="text-gray-500 text-sm">
                            &copy; ${new Date().getFullYear()} Astronomy & Astrophysics Society. All rights reserved.
                        </p>
                        <p class="text-gray-600 text-xs uppercase tracking-widest">
                            <span class="inline-block bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent font-semibold dev-credit-glow">
                                Designed And Developed By Aditya Taywade
                            </span>
                        </p>
                    </div>
                </div>
            `;
        document.body.appendChild(foot);
    }
}

// 2. ROBOT LOGIC (Removed in favor of Cosmic System)
function initRobot() {}

// 4. COSMIC SYSTEM — Full-viewport Hero Solar System
// NOTE: This function is now in hero-animation.js
// function initCosmicSystem() { ... } moved to separate file

/*
function initCosmicSystem() {
    // Old implementation moved to hero-animation.js
}
*/
// 3. CURSOR TRAIL
function initCursor() {
    const cvs = document.createElement('canvas');
    cvs.id = 'cursor-canvas';
    document.body.appendChild(cvs);
    const ctx = cvs.getContext('2d');
    let points = [], mouse = { x: 0, y: 0 };

    const resize = () => { cvs.width = window.innerWidth; cvs.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    resize();
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

    const animate = () => {
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        points.push({ x: mouse.x, y: mouse.y, age: 0 });
        if (points.length > 25) points.shift();

        ctx.beginPath();
        if (points.length > 1) {
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                const p = points[i];
                ctx.lineTo(p.x, p.y);
                p.age++;
            }
        }
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00f2fe';
        ctx.strokeStyle = ctx.createLinearGradient(0, 0, cvs.width, cvs.height);
        ctx.strokeStyle.addColorStop(0, '#764ba2');
        ctx.strokeStyle.addColorStop(1, '#00f2fe');
        ctx.stroke();
        requestAnimationFrame(animate);
    };
    animate();
}

// 4. THREE.JS PLANET (Homepage Only)
function initThreeJS() {
    const container = document.getElementById('bg-canvas');

    if (!container) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const geo = new THREE.BufferGeometry();
    const count = 2000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 10;
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ size: 0.02, color: 0x00f2fe });
    const sphere = new THREE.Points(geo, mat);
    scene.add(sphere);
    camera.position.z = 2;

    const animate = () => {
        requestAnimationFrame(animate);
        sphere.rotation.y += 0.002;
        sphere.rotation.x += 0.001;
        renderer.render(scene, camera);
    };
    animate();

}

// 5. CANVAS STARS (Inner Pages)
function initCanvasStars() {
    let cvs = document.getElementById('bg-canvas');
    if (!cvs) {
        cvs = document.createElement('canvas');
        cvs.id = 'bg-canvas';
        document.body.appendChild(cvs);
    }
    if (cvs.tagName.toLowerCase() !== 'canvas') {
        const canvas = document.createElement('canvas');
        canvas.id = 'bg-canvas';
        cvs.replaceWith(canvas);
        cvs = canvas;
    }
    const ctx = cvs.getContext('2d');
    let stars = [];
    const resize = () => {
        cvs.width = window.innerWidth; cvs.height = window.innerHeight;
        stars = Array(100).fill().map(() => ({
            x: Math.random() * cvs.width, y: Math.random() * cvs.height, r: Math.random() * 2, s: Math.random() * 0.5
        }));
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        ctx.fillStyle = "white";
        stars.forEach(s => {
            s.y -= s.s;
            if (s.y < 0) s.y = cvs.height;
            ctx.globalAlpha = Math.random() * 0.5 + 0.3;
            ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        });
        requestAnimationFrame(animate);
    };
    animate();
}

// 6. FIREBASE DATA LOADING
let db;
function initFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('[Firebase] SDK not loaded');
        return;
    }
    if (typeof CONFIG === 'undefined' || !CONFIG?.firebase) {
        console.error('[Firebase] CONFIG.firebase missing');
        return;
    }

    try {
        if (!firebase.apps?.length) firebase.initializeApp(CONFIG.firebase);
        db = firebase.database();
    } catch (e) {
        console.error('[Firebase] init failed', e);
    }
}

function loadSiteSettings() {
    if (!db) {
        applySiteSettingsToDOM();
        return;
    }

    db.ref('siteSettings').once('value')
        .then((snap) => {
            const data = snap.val() || {};
            siteSettingsCache = { ...DEFAULT_SITE_SETTINGS, ...data };
            applySiteSettingsToDOM();
        })
        .catch((err) => {
            console.error('[SiteSettings] load failed', err);
            applySiteSettingsToDOM();
        });
}

function applySiteSettingsToDOM() {
    const s = { ...DEFAULT_SITE_SETTINGS, ...(siteSettingsCache || {}) };

    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = String(value || '');
    };
    const setHref = (id, value) => {
        const el = document.getElementById(id);
        if (el && value) el.setAttribute('href', value);
    };

    setText('navBrandFull', s.siteName);
    setText('navBrandShort', s.siteName);
    setText('footerBrandTitle', s.siteName);
    setText('footerAboutText', s.footerAbout);

    const supportHref = String(s.supportEmail || '').trim()
        ? (String(s.supportEmail).startsWith('mailto:') ? String(s.supportEmail) : `mailto:${String(s.supportEmail).trim()}`)
        : `mailto:${DEFAULT_SITE_SETTINGS.supportEmail}`;

    setHref('footerWhatsappLink', s.whatsappUrl || DEFAULT_SITE_SETTINGS.whatsappUrl);
    setHref('footerInstagramLink', s.instagramUrl || DEFAULT_SITE_SETTINGS.instagramUrl);
    setHref('footerEmailLink', supportHref);
    setText('footerContactEmail', s.contactEmailDisplay || DEFAULT_SITE_SETTINGS.contactEmailDisplay);

    setText('heroBadgeText', s.heroBadge);
    setText('heroTitleLine1', s.heroTitleLine1);
    setText('heroTitleLine2', s.heroTitleLine2);
    setText('heroSubtitleText', s.heroSubtitle);
    const forceAnnouncementCta = window.location.pathname.toLowerCase().includes('index') || window.location.pathname.endsWith('/');
    const heroPrimaryText = forceAnnouncementCta ? 'Announcement' : s.heroPrimaryText;
    const heroPrimaryUrl = forceAnnouncementCta ? 'index.html#announcements' : (s.heroPrimaryUrl || DEFAULT_SITE_SETTINGS.heroPrimaryUrl);

    setText('heroPrimaryCtaText', heroPrimaryText);
    setText('heroSecondaryCtaText', s.heroSecondaryText);
    setHref('heroPrimaryCta', heroPrimaryUrl);
    setHref('heroSecondaryCta', s.heroSecondaryUrl || DEFAULT_SITE_SETTINGS.heroSecondaryUrl);
}

function loadMembers() {
    if (!db) return;
    db.ref('members').on('value', snap => {
        const data = snap.val() || {};
        const grid = document.getElementById('membersGrid');
        if (grid) {
            const members = Object.values(data);

            const normalize = (s) => String(s || '').trim();
            const roleText = (m) => normalize(m.role);
            const roleKey = (m) => roleText(m).toLowerCase();
            const isFacultyAdvisor = (m) => /faculty\s*advisor/i.test(roleText(m));
            const isFounding = (m) => /(founding|founder|founded|foun(d|i)d)/i.test(roleKey(m));
            const isTechnical = (m) => /tech|technical/i.test(roleText(m));
            const isTechnicalHead = (m) => /technical\s*head/i.test(roleText(m));

            const faculty = members.filter(isFacultyAdvisor);
            const founding = members.filter(m => !isFacultyAdvisor(m) && isFounding(m));
            const technical = members.filter(m => !isFacultyAdvisor(m) && !isFounding(m) && isTechnical(m));
            const regular = members.filter(m => !isFacultyAdvisor(m) && !isFounding(m) && !isTechnical(m));

            const card = (m, variant) => {
                const img = m.image || 'https://via.placeholder.com/256';
                const name = normalize(m.name) || 'Member';
                const role = roleText(m) || 'Member';
                const branch = normalize(m.branch);
                const year = normalize(m.year);
                const designation = normalize(m.designation);
                const secondaryMeta = variant === 'faculty' ? (designation || year) : year;

                const variantClass = variant === 'faculty'
                    ? 'member-card member-card--faculty'
                    : (variant === 'founding'
                        ? 'member-card member-card--founding'
                        : (isTechnicalHead(m) ? 'member-card member-card--tech-head' : 'member-card'));

                const roleBadgeClass = variant === 'faculty'
                    ? 'member-role member-role--faculty'
                    : (variant === 'founding'
                        ? 'member-role member-role--founding'
                        : (isTechnicalHead(m) ? 'member-role member-role--tech-head' : 'member-role'));

                return `
                        <div class="holo-card p-6 text-center group ${variantClass}">
                            <div class="member-role-wrap">
                                <span class="${roleBadgeClass}">${role}</span>
                            </div>
                            <div class="w-32 h-32 mx-auto rounded-full p-1 bg-gradient-to-br from-cyan-400 to-purple-600 mb-4">
                                <img src="${img}" class="w-full h-full object-cover rounded-full border-4 border-black" alt="${name}">
                            </div>
                            <h3 class="text-xl font-bold text-white">${name}</h3>
                            <div class="member-meta">
                                ${branch ? `<div class=\"member-meta-branch\">${branch}</div>` : ''}
                                ${secondaryMeta ? `<div class=\"member-meta-year\">${secondaryMeta}</div>` : ''}
                            </div>
                        </div>
                    `;
            };

            const section = (title, items, variant) => {
                if (!items.length) return '';
                return `
                        <div class="col-span-full" data-aos="fade-up">
                            <div class="member-section-title">
                                <h2>${title}</h2>
                                <div class="member-section-line"></div>
                            </div>
                        </div>
                        ${items.map(m => card(m, variant)).join('')}
                    `;
            };

            grid.innerHTML = [
                section('Faculty Advisors', faculty, 'faculty'),
                section('Founding Members', founding, 'founding'),
                section('Technical Team', technical, 'tech'),
                section('Members', regular, 'regular')
            ].join('');
        }
    });
}

function loadEvents() {
    if (!db) return;
    db.ref('events').once('value', snap => {
        const data = snap.val() || {};
        const grid = document.getElementById('eventsGrid');
        if (grid) {
            const entries = Object.entries(data);
            // newest first (fallback if date missing)
            entries.sort((a, b) => new Date(b[1].date || 0) - new Date(a[1].date || 0));

            grid.innerHTML = entries.map(([id, e]) => {
                const img = e.image || 'https://via.placeholder.com/600x400';
                return `
                    <button type="button" class="holo-card group overflow-hidden text-left" data-event-id="${id}">
                        <div class="h-48 overflow-hidden">
                            <img src="${img}" class="w-full h-full object-cover transition duration-500 group-hover:scale-110" alt="${(e.title || 'Program').replace(/\"/g, '&quot;')}">
                        </div>
                        <div class="p-6">
                            <span class="bg-purple-900/50 text-purple-300 text-xs px-2 py-1 rounded border border-purple-500/30">${e.category || 'Program'}</span>
                            <h3 class="text-xl font-bold mt-2 mb-2">${e.title || 'Untitled Program'}</h3>
                            <p class="text-gray-400 text-sm mb-4 line-clamp-2">${e.shortDesc || ''}</p>
                            <div class="flex justify-between text-xs text-cyan-400">
                                <span><i class="far fa-calendar mr-1"></i>${e.date || ''}</span>
                                <span><i class="fas fa-map-marker-alt mr-1"></i>${e.location || ''}</span>
                            </div>
                        </div>
                    </button>`;
            }).join('');

            // Modal only exists on programs.html
            const modal = document.getElementById('programModal');
            const backdrop = document.getElementById('programModalBackdrop');
            const closeBtn = document.getElementById('programModalClose');
            const titleEl = document.getElementById('programModalTitle');
            const metaEl = document.getElementById('programModalMeta');
            const bannerEl = document.getElementById('programModalBanner');
            const descEl = document.getElementById('programModalDesc');
            const galleryEl = document.getElementById('programModalGallery');
            const contribEl = document.getElementById('programModalContrib');

            if (!modal) return;

            const openModal = (evt) => {
                const img = evt.image || 'https://via.placeholder.com/900x600';
                const longDesc = evt.longDesc || evt.shortDesc || '';
                const contrib = Array.isArray(evt.contributors)
                    ? evt.contributors
                    : (typeof evt.contributors === 'string' ? evt.contributors.split(',').map(s => s.trim()).filter(Boolean) : []);
                const gallery = Array.isArray(evt.galleryImages) ? evt.galleryImages : [];

                if (titleEl) titleEl.textContent = evt.title || 'Program';
                if (metaEl) metaEl.textContent = `${evt.category || 'Program'}${evt.date ? ' • ' + evt.date : ''}${evt.location ? ' • ' + evt.location : ''}`;
                if (bannerEl) bannerEl.src = img;
                if (descEl) descEl.textContent = longDesc;

                if (contribEl) {
                    contribEl.innerHTML = contrib.length
                        ? contrib.map(c => `<span class="px-3 py-1 rounded-full text-xs border border-white/10 bg-white/5 text-gray-200">${c}</span>`).join('')
                        : '<span class="text-gray-500 text-sm">No contributors listed.</span>';
                }

                if (galleryEl) {
                    const all = (gallery.length ? gallery : [img]).slice(0, 12);
                    galleryEl.innerHTML = all.map((u) => `
                            <button type="button" class="rounded-lg overflow-hidden border border-white/10 bg-black/40 hover:border-cyan-500/40 transition" data-gallery-src="${u}">
                                <img src="${u}" alt="Gallery" class="w-full h-20 object-cover">
                            </button>
                        `).join('');

                    galleryEl.querySelectorAll('[data-gallery-src]').forEach(btn => {
                        btn.addEventListener('click', () => {
                            if (bannerEl) bannerEl.src = btn.getAttribute('data-gallery-src') || img;
                        });
                    });
                }

                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            };

            const closeModal = () => {
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            };

            closeBtn?.addEventListener('click', closeModal);
            backdrop?.addEventListener('click', closeModal);
            document.addEventListener('keydown', (e) => {
                if (!modal.classList.contains('hidden') && e.key === 'Escape') closeModal();
            });

            grid.querySelectorAll('[data-event-id]').forEach(card => {
                card.addEventListener('click', () => {
                    const id = card.getAttribute('data-event-id');
                    if (!id) return;
                    const evt = data[id];
                    if (!evt) return;
                    openModal(evt);
                });
            });
        }
    });
}

const GALLERY_CATEGORY_META = {
    all: { label: 'All', icon: 'fa-globe' },
    nebula: { label: 'Nebula', icon: 'fa-cloud' },
    galaxy: { label: 'Galaxy', icon: 'fa-circle-notch' },
    moon: { label: 'Moon', icon: 'fa-moon' },
    planet: { label: 'Planet', icon: 'fa-earth-asia' },
    sun: { label: 'Sun', icon: 'fa-sun' },
    cluster: { label: 'Cluster', icon: 'fa-braille' },
    constellation: { label: 'Constellation', icon: 'fa-star-and-crescent' },
    comet: { label: 'Comet', icon: 'fa-meteor' },
    star: { label: 'Star', icon: 'fa-star' },
    other: { label: 'Other', icon: 'fa-satellite' },
};

const galleryState = {
    query: '',
    category: 'all',
    sort: 'newest',
};

let galleryItemsCache = [];
let galleryFilteredItems = [];
let galleryLightboxIndex = 0;

function escapeHTML(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function parseGalleryTimestamp(raw) {
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
    if (typeof raw === 'string' && raw.trim()) {
        const asNum = Number(raw);
        if (Number.isFinite(asNum)) return asNum;
        const parsed = Date.parse(raw);
        if (Number.isFinite(parsed)) return parsed;
    }
    return 0;
}

function inferGalleryCategory(caption) {
    const text = String(caption || '').toLowerCase();

    if (/(nebula|m42|orion|carina|lagoon|trifid|veil|rosette|eagle|pillars|helix)/.test(text)) return 'nebula';
    if (/(galaxy|m31|andromeda|milky\s*way|spiral|whirlpool|sombrero)/.test(text)) return 'galaxy';
    if (/(moon|lunar|crescent|gibbous|crater|supermoon|apollo)/.test(text)) return 'moon';
    if (/(jupiter|saturn|mars|venus|mercury|uranus|neptune|planet)/.test(text)) return 'planet';
    if (/(sun|solar|sunspot|prominence|eclipse)/.test(text)) return 'sun';
    if (/(cluster|globular|m45|pleiades|open cluster|omega centauri)/.test(text)) return 'cluster';
    if (/(constellation|ursa|cassiopeia|cygnus|lyra|orion belt|scorpius)/.test(text)) return 'constellation';
    if (/(comet|meteor|meteorite|asteroid|perseid|geminid|shower)/.test(text)) return 'comet';
    if (/(star|sirius|polaris|betelgeuse|binary)/.test(text)) return 'star';
    return 'other';
}

function normalizeGalleryData(data) {
    return Object.entries(data || {})
        .map(([id, item]) => {
            const caption = String(item.caption || 'Untitled Capture').trim() || 'Untitled Capture';
            const url = String(item.url || '').trim();
            const type = String(item.type || 'image').toLowerCase() === 'video' ? 'video' : 'image';
            const createdAt = parseGalleryTimestamp(item.createdAt || item.date || item.uploadedAt);
            const captureDate = String(item.captureDate || '').trim();
            const captureAt = parseGalleryTimestamp(captureDate);
            const objectName = String(item.objectName || '').trim();
            const description = String(item.description || '').trim();
            const photographer = String(item.photographer || '').trim();
            const location = String(item.location || '').trim();
            const telescope = String(item.telescope || '').trim();
            const camera = String(item.camera || '').trim();
            const exposure = String(item.exposure || '').trim();
            const category = inferGalleryCategory(`${caption} ${objectName}`);
            const timelineTs = captureAt || createdAt;

            return {
                id,
                caption,
                url,
                type,
                createdAt,
                captureDate,
                captureAt,
                timelineTs,
                objectName,
                description,
                photographer,
                location,
                telescope,
                camera,
                exposure,
                category,
            };
        })
        .filter(item => item.url)
        .sort((a, b) => (b.timelineTs || 0) - (a.timelineTs || 0));
}

function formatGalleryDate(ts) {
    if (!ts) return 'Date unavailable';
    return new Date(ts).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function formatGalleryRelative(ts) {
    if (!ts) return 'Archive date not set';

    const dayMs = 86400000;
    const diff = Math.max(0, Math.floor((Date.now() - ts) / dayMs));
    if (diff === 0) return 'Captured today';
    if (diff === 1) return 'Captured 1 day ago';
    if (diff < 30) return `Captured ${diff} days ago`;
    const months = Math.floor(diff / 30);
    if (months < 12) return `Captured ${months} month${months === 1 ? '' : 's'} ago`;
    const years = Math.floor(months / 12);
    return `Captured ${years} year${years === 1 ? '' : 's'} ago`;
}

function getGalleryCategoryMeta(key) {
    return GALLERY_CATEGORY_META[key] || GALLERY_CATEGORY_META.other;
}

function loadGallery() {
    if (!db) return;
    db.ref('gallery').once('value', snap => {
        galleryItemsCache = normalizeGalleryData(snap.val() || {});
        renderGalleryMetaCards(galleryItemsCache);
        renderGalleryCategoryFilters(galleryItemsCache);
        bindGalleryControls();
        applyGalleryFilters();
        initGalleryLightbox();
    });
}

function loadHomeGalleryScroller() {
    if (!db) return;
    const track = document.getElementById('homeGalleryTrack');
    if (!track) return;

    db.ref('gallery').once('value', snap => {
        const items = normalizeGalleryData(snap.val() || {});
        renderHomeGalleryScroller(items);
    });
}

function toAnnouncementTs(item) {
    return parseGalleryTimestamp(item?.publishDate)
        || parseGalleryTimestamp(item?.publishedAt)
        || parseGalleryTimestamp(item?.updatedAt)
        || parseGalleryTimestamp(item?.createdAt);
}

function escapeAnnouncementHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatAnnouncementDate(value) {
    const ts = parseGalleryTimestamp(value);
    if (!ts) return 'Date not set';
    return new Date(ts).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function loadAnnouncements() {
    const container = document.getElementById('announcementList');
    const updatedAtEl = document.getElementById('announcementUpdatedAt');
    if (!container) return;

    const renderEmpty = (message) => {
        container.innerHTML = `
            <div class="holo-card p-6 md:col-span-2 lg:col-span-3">
                <p class="text-sm text-gray-400">${escapeAnnouncementHtml(message)}</p>
            </div>
        `;
    };

    if (!db) {
        renderEmpty('Announcements will appear here once database connection is available.');
        return;
    }

    db.ref('announcements').on('value', (snap) => {
        const data = snap.val() || {};
        const items = Object.values(data || {})
            .filter((item) => String(item?.status || 'published').toLowerCase() !== 'draft')
            .sort((a, b) => {
                const aPinned = a?.isPinned ? 1 : 0;
                const bPinned = b?.isPinned ? 1 : 0;
                if (aPinned !== bPinned) return bPinned - aPinned;
                return toAnnouncementTs(b) - toAnnouncementTs(a);
            })
            .slice(0, 3);

        if (!items.length) {
            renderEmpty('No announcements are published yet. Please check back soon.');
            if (updatedAtEl) updatedAtEl.textContent = '';
            return;
        }

        container.innerHTML = items.map((item) => {
            const title = escapeAnnouncementHtml(item?.title || 'Announcement');
            const body = escapeAnnouncementHtml(item?.body || '');
            const tag = escapeAnnouncementHtml(item?.tag || 'Update');
            const publishDate = formatAnnouncementDate(item?.publishDate || item?.publishedAt || item?.updatedAt || item?.createdAt);
            const linkUrl = String(item?.linkUrl || '').trim();
            const hasLink = /^https?:\/\//i.test(linkUrl);
            const linkLabel = escapeAnnouncementHtml(item?.linkLabel || 'Read update');
            const pinLabel = item?.isPinned ? '<span class="text-xs uppercase tracking-[0.2em] text-cyan-300">Latest</span>' : '';

            return `
                <article class="holo-card p-6 flex flex-col h-full">
                    <div class="flex items-center justify-between gap-3 mb-4">
                        <span class="text-[10px] uppercase tracking-[0.2em] text-amber-300 bg-amber-500/10 border border-amber-400/20 rounded-full px-3 py-1">${tag}</span>
                        ${pinLabel}
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">${title}</h3>
                    <p class="text-gray-300 text-sm leading-relaxed flex-1">${body}</p>
                    <div class="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-white/10">
                        <span class="text-xs text-gray-500 font-mono">${publishDate}</span>
                        ${hasLink ? `<a href="${escapeAnnouncementHtml(linkUrl)}" target="_blank" rel="noopener noreferrer" class="text-sm text-cyan-300 hover:text-cyan-200 transition"> ${linkLabel} <i class="fas fa-arrow-up-right-from-square text-[11px] ml-1"></i></a>` : ''}
                    </div>
                </article>
            `;
        }).join('');

        if (updatedAtEl) {
            const latestTs = toAnnouncementTs(items[0]);
            updatedAtEl.textContent = latestTs
                ? `Last updated: ${new Date(latestTs).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                : '';
        }
    });
}

function renderGalleryMetaCards(items) {
    const wrapper = document.getElementById('galleryMetaCards');
    if (!wrapper) return;

    const counts = items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
    }, {});

    const categoryKeys = Object.keys(counts);
    const categoryCount = categoryKeys.length;
    const ranked = categoryKeys
        .map((key) => ({ key, count: counts[key] }))
        .sort((a, b) => b.count - a.count);

    const top = ranked[0];
    const latest = items.find(item => item.timelineTs);

    const metaCards = [
        {
            label: 'Archive Items',
            value: String(items.length),
            hint: 'Total captures in the gallery archive.',
            icon: 'fa-images',
        },
        {
            label: 'Latest Capture',
            value: latest ? formatGalleryDate(latest.timelineTs) : 'Unknown',
            hint: latest ? formatGalleryRelative(latest.timelineTs) : 'Add capture date in Admin for accurate timeline.',
            icon: 'fa-clock',
        },
        {
            label: 'Sky Categories',
            value: String(categoryCount),
            hint: 'Distinct celestial categories identified from captions.',
            icon: 'fa-layer-group',
        },
        {
            label: 'Most Captured',
            value: top ? getGalleryCategoryMeta(top.key).label : 'N/A',
            hint: top ? `${top.count} capture${top.count === 1 ? '' : 's'}` : 'No category data yet.',
            icon: 'fa-bullseye',
        },
    ];

    wrapper.innerHTML = metaCards.map(card => `
        <article class="holo-card gallery-meta-card p-5">
            <div class="flex items-center justify-between gap-3">
                <div class="text-xs uppercase tracking-[0.22em] text-cyan-300/80">${card.label}</div>
                <i class="fas ${card.icon} text-cyan-300/70"></i>
            </div>
            <div class="mt-3 text-2xl font-bold text-white">${escapeHTML(card.value)}</div>
            <p class="mt-2 text-sm text-gray-400 leading-relaxed">${escapeHTML(card.hint)}</p>
        </article>
    `).join('');
}

function renderGalleryCategoryFilters(items) {
    const container = document.getElementById('galleryCategoryFilters');
    if (!container) return;

    const counts = items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
    }, {});

    const order = ['all', 'nebula', 'galaxy', 'moon', 'planet', 'sun', 'cluster', 'constellation', 'comet', 'star', 'other'];
    const chips = order
        .filter(key => key === 'all' || counts[key])
        .map((key) => {
            const meta = getGalleryCategoryMeta(key);
            const count = key === 'all' ? items.length : (counts[key] || 0);
            const active = galleryState.category === key ? 'active' : '';
            return `
                <button type="button" class="gallery-chip ${active}" data-gallery-category="${key}">
                    <i class="fas ${meta.icon} text-[10px]"></i>
                    <span>${meta.label}</span>
                    <span class="gallery-chip-count">${count}</span>
                </button>
            `;
        });

    container.innerHTML = chips.join('');
}

function bindGalleryControls() {
    const searchInput = document.getElementById('gallerySearchInput');
    const sortSelect = document.getElementById('gallerySortSelect');
    const filterWrap = document.getElementById('galleryCategoryFilters');
    const grid = document.getElementById('galleryGrid');

    if (searchInput && !searchInput.dataset.bound) {
        searchInput.dataset.bound = 'true';
        searchInput.addEventListener('input', () => {
            galleryState.query = searchInput.value.trim().toLowerCase();
            applyGalleryFilters();
        });
    }

    if (sortSelect && !sortSelect.dataset.bound) {
        sortSelect.dataset.bound = 'true';
        sortSelect.addEventListener('change', () => {
            galleryState.sort = sortSelect.value;
            applyGalleryFilters();
        });
    }

    if (filterWrap && !filterWrap.dataset.bound) {
        filterWrap.dataset.bound = 'true';
        filterWrap.addEventListener('click', (event) => {
            const chip = event.target.closest('[data-gallery-category]');
            if (!chip) return;
            galleryState.category = chip.getAttribute('data-gallery-category') || 'all';
            applyGalleryFilters();
        });
    }

    if (grid && !grid.dataset.bound) {
        grid.dataset.bound = 'true';
        grid.addEventListener('click', (event) => {
            const card = event.target.closest('[data-gallery-index]');
            if (!card) return;
            const index = Number(card.getAttribute('data-gallery-index'));
            if (!Number.isFinite(index)) return;
            openGalleryLightbox(index);
        });
    }
}

function applyGalleryFilters() {
    const tokens = galleryState.query.split(/\s+/).filter(Boolean);

    let result = galleryItemsCache.filter((item) => {
        if (galleryState.category !== 'all' && item.category !== galleryState.category) return false;
        if (!tokens.length) return true;
        const haystack = [
            item.caption,
            item.objectName,
            item.description,
            item.photographer,
            item.location,
            item.telescope,
            item.camera,
            item.exposure,
            item.category,
        ].join(' ').toLowerCase();
        return tokens.every(t => haystack.includes(t));
    });

    if (galleryState.sort === 'oldest') {
        result.sort((a, b) => (a.timelineTs || 0) - (b.timelineTs || 0));
    } else if (galleryState.sort === 'az') {
        result.sort((a, b) => a.caption.localeCompare(b.caption));
    } else {
        result.sort((a, b) => (b.timelineTs || 0) - (a.timelineTs || 0));
    }

    galleryFilteredItems = result;
    renderGalleryCategoryFilters(galleryItemsCache);
    renderGalleryGrid(galleryFilteredItems);
}

function renderGalleryGrid(items) {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;

    if (!items.length) {
        grid.innerHTML = `
            <div class="col-span-full">
                <div class="holo-card p-10 text-center">
                    <div class="text-cyan-300 text-lg font-semibold mb-2">No captures found for current filters</div>
                    <p class="text-gray-400 mb-5">Try another search term or category to explore the full archive.</p>
                    <button type="button" class="filter-btn" data-gallery-reset>Reset Filters</button>
                </div>
            </div>
        `;
        const resetBtn = grid.querySelector('[data-gallery-reset]');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                galleryState.query = '';
                galleryState.category = 'all';
                galleryState.sort = 'newest';

                const searchInput = document.getElementById('gallerySearchInput');
                const sortSelect = document.getElementById('gallerySortSelect');
                if (searchInput) searchInput.value = '';
                if (sortSelect) sortSelect.value = 'newest';

                applyGalleryFilters();
            });
        }
        return;
    }

    grid.innerHTML = items.map((item, index) => {
        const categoryMeta = getGalleryCategoryMeta(item.category);
        const caption = escapeHTML(item.caption);
        const dateText = escapeHTML(formatGalleryDate(item.timelineTs));
        const relative = escapeHTML(formatGalleryRelative(item.timelineTs));
        const objectName = escapeHTML(item.objectName || categoryMeta.label);
        const photographer = escapeHTML(item.photographer || 'AAS Team');
        const categoryLabel = escapeHTML(categoryMeta.label);

        const media = item.type === 'video'
            ? `<video src="${item.url}" class="w-full h-full object-cover transition duration-500 group-hover:scale-110" muted playsinline loop autoplay></video>`
            : `<img src="${item.url}" class="w-full h-full object-cover transition duration-500 group-hover:scale-110" alt="${caption}" loading="lazy">`;

        return `
            <button type="button" class="holo-card gallery-media-card overflow-hidden cursor-pointer group relative h-72 text-left" data-gallery-index="${index}">
                ${media}
                <div class="gallery-media-gradient"></div>
                <div class="absolute top-3 left-3 z-10">
                    <span class="gallery-media-badge"><i class="fas ${categoryMeta.icon}"></i>${categoryLabel}</span>
                </div>
                <div class="absolute inset-x-0 bottom-0 z-10 p-4">
                    <p class="text-white font-bold leading-snug">${caption}</p>
                    <p class="mt-1 text-xs text-cyan-200/90 uppercase tracking-[0.11em]">${objectName}</p>
                    <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-300/90 uppercase tracking-[0.08em]">
                        <span><i class="far fa-calendar mr-1 text-cyan-300"></i>${dateText}</span>
                        <span><i class="fas fa-satellite mr-1 text-cyan-300"></i>${relative}</span>
                        <span><i class="fas fa-user-astronaut mr-1 text-cyan-300"></i>${photographer}</span>
                    </div>
                </div>
            </button>
        `;
    }).join('');
}

function initGalleryLightbox() {
    const modal = document.getElementById('galleryLightbox');
    const closeBtn = document.getElementById('galleryLightboxClose');
    const backdrop = document.getElementById('galleryLightboxBackdrop');
    const prevBtn = document.getElementById('galleryLightboxPrev');
    const nextBtn = document.getElementById('galleryLightboxNext');

    if (!modal || modal.dataset.bound) return;
    modal.dataset.bound = 'true';

    closeBtn?.addEventListener('click', closeGalleryLightbox);
    backdrop?.addEventListener('click', closeGalleryLightbox);
    prevBtn?.addEventListener('click', () => shiftGalleryLightbox(-1));
    nextBtn?.addEventListener('click', () => shiftGalleryLightbox(1));

    document.addEventListener('keydown', (event) => {
        if (modal.classList.contains('hidden')) return;
        if (event.key === 'Escape') closeGalleryLightbox();
        if (event.key === 'ArrowLeft') shiftGalleryLightbox(-1);
        if (event.key === 'ArrowRight') shiftGalleryLightbox(1);
    });
}

function openGalleryLightbox(index) {
    if (!galleryFilteredItems.length) return;
    const modal = document.getElementById('galleryLightbox');
    if (!modal) return;

    galleryLightboxIndex = ((index % galleryFilteredItems.length) + galleryFilteredItems.length) % galleryFilteredItems.length;
    renderGalleryLightboxSlide();
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeGalleryLightbox() {
    const modal = document.getElementById('galleryLightbox');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function shiftGalleryLightbox(delta) {
    if (!galleryFilteredItems.length) return;
    galleryLightboxIndex = (galleryLightboxIndex + delta + galleryFilteredItems.length) % galleryFilteredItems.length;
    renderGalleryLightboxSlide();
}

function renderGalleryLightboxSlide() {
    const item = galleryFilteredItems[galleryLightboxIndex];
    if (!item) return;

    const img = document.getElementById('galleryLightboxImage');
    const caption = document.getElementById('galleryLightboxCaption');
    const meta = document.getElementById('galleryLightboxMeta');
    const category = document.getElementById('galleryLightboxCategory');
    const details = document.getElementById('galleryLightboxDetails');
    const description = document.getElementById('galleryLightboxDescription');
    const prevBtn = document.getElementById('galleryLightboxPrev');
    const nextBtn = document.getElementById('galleryLightboxNext');

    if (!img || !caption || !meta || !category) return;

    const categoryMeta = getGalleryCategoryMeta(item.category);
    const total = galleryFilteredItems.length;
    const detailsRows = [
        item.objectName ? `<div><span class="text-cyan-300/80">Object:</span> ${escapeHTML(item.objectName)}</div>` : '',
        item.photographer ? `<div><span class="text-cyan-300/80">Captured By:</span> ${escapeHTML(item.photographer)}</div>` : '',
        item.location ? `<div><span class="text-cyan-300/80">Location:</span> ${escapeHTML(item.location)}</div>` : '',
        item.telescope ? `<div><span class="text-cyan-300/80">Telescope:</span> ${escapeHTML(item.telescope)}</div>` : '',
        item.camera ? `<div><span class="text-cyan-300/80">Camera:</span> ${escapeHTML(item.camera)}</div>` : '',
        item.exposure ? `<div><span class="text-cyan-300/80">Exposure:</span> ${escapeHTML(item.exposure)}</div>` : '',
    ].filter(Boolean).join('');

    img.src = item.url;
    img.alt = item.caption;
    caption.textContent = item.caption;
    category.innerHTML = `<i class="fas ${categoryMeta.icon} mr-1"></i>${categoryMeta.label}`;
    meta.textContent = `${formatGalleryDate(item.timelineTs)} | ${formatGalleryRelative(item.timelineTs)} | Slide ${galleryLightboxIndex + 1} of ${total}`;
    if (details) details.innerHTML = detailsRows || '<div class="text-gray-500">No technical details provided.</div>';
    if (description) {
        description.textContent = item.description || 'No additional description provided for this capture.';
    }

    if (prevBtn) prevBtn.disabled = total <= 1;
    if (nextBtn) nextBtn.disabled = total <= 1;
}

function renderHomeGalleryScroller(items) {
    const track = document.getElementById('homeGalleryTrack');
    if (!track) return;

    const imageOnly = items.filter(item => item.type === 'image');
    const pool = imageOnly.length ? imageOnly : items;

    if (!pool.length) {
        track.classList.add('home-gallery-track--static');
        track.innerHTML = `
            <a href="gallery.html" class="home-gallery-empty">
                Gallery stream will appear here as soon as new images are uploaded.
            </a>
        `;
        return;
    }

    const baseCount = Math.min(Math.max(pool.length, 8), 14);
    const baseItems = [];
    for (let i = 0; i < baseCount; i++) {
        baseItems.push(pool[i % pool.length]);
    }

    const doubled = baseItems.concat(baseItems);
    const scrollDuration = Math.max(26, baseItems.length * 4);
    track.style.setProperty('--home-scroll-duration', `${scrollDuration}s`);
    track.classList.remove('home-gallery-track--static');

    track.innerHTML = doubled.map((item, idx) => {
        const caption = escapeHTML(item.caption);
        const mirrorAttr = idx >= baseItems.length ? 'aria-hidden="true" tabindex="-1"' : '';

        return `
            <a href="gallery.html" class="home-gallery-item" title="${caption}" ${mirrorAttr}>
                <img src="${item.url}" alt="${caption}" loading="lazy">
            </a>
        `;
    }).join('');
}

// ============================================================
// 7. "DO YOU KNOW?" — DAILY SPACE FACT
//
// HOW TO INTEGRATE:
//   1. Paste this entire block at the bottom of main.js
//      (after the existing loadGallery function).
//
//   2. In the DOMContentLoaded listener at the top of main.js,
//      add this line inside the homepage-specific block:
//
//        if (path.includes('index') || path === '/') {
//            initThreeJS();
//            initDailyFact();   // <-- ADD THIS LINE
//        }
//
// ============================================================

// ── CONFIG ──────────────────────────────────────────────────
const DYK_CONFIG = {
    // Spaceflight News API — free, no key required
    apiUrl: 'https://api.spaceflightnewsapi.net/v4/articles/?limit=30&has_launch=true',

    // How many facts to cache per session
    cacheKey: 'dyk_articles_cache',
    cacheDateKey: 'dyk_cache_date',

    // NASA Astronomy Picture of the Day API (free key)
    nasaApodUrl: 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY',
};

// ── FALLBACK LOCAL FACTS ─────────────────────────────────────
// Used when all APIs fail (network issues, CORS, rate limits)
const DYK_FALLBACK_FACTS = [
    {
        title: "Venus Spins the Wrong Way",
        summary: "Venus rotates in the opposite direction to most planets in our solar system — a phenomenon called retrograde rotation. This means on Venus, the Sun rises in the west and sets in the east. Scientists believe a massive ancient collision may have flipped the planet upside down billions of years ago.",
        link: null,
    },
    {
        title: "A Teaspoon of Neutron Star Weighs a Billion Tons",
        summary: "Neutron stars are the collapsed cores of massive stars that exploded as supernovae. Their matter is compressed so tightly that a single teaspoon would weigh roughly 10 million tons — about the combined mass of every human being on Earth, packed into a sugar cube.",
        link: null,
    },
    {
        title: "More Stars Than Grains of Sand",
        summary: "The observable universe contains an estimated 2 trillion galaxies, each with billions of stars. The total number of stars is roughly 10 times greater than all grains of sand on every beach and desert on Earth — a number so vast it is essentially incomprehensible.",
        link: null,
    },
    {
        title: "A Day on Mercury Is Longer Than Its Year",
        summary: "Mercury completes one orbit around the Sun in just 88 Earth days, but it rotates so slowly on its axis that a single solar day lasts 176 Earth days. This means a year on Mercury is literally shorter than its own day.",
        link: null,
    },
    {
        title: "The Footprints on the Moon Will Last Millions of Years",
        summary: "The Moon has no atmosphere, which means there is no wind or weather to erode the surface. The footprints left by Apollo astronauts will remain perfectly preserved for at least 10 million years — unless a meteorite happens to land directly on them.",
        link: null,
    },
    {
        title: "Light Takes 100,000 Years to Cross the Milky Way",
        summary: "Our galaxy is approximately 100,000 light-years in diameter. If you could travel at the speed of light — 299,792 km per second — it would still take 100,000 years to travel from one edge of the Milky Way to the other.",
        link: null,
    },
    {
        title: "There Is a Giant Cloud of Alcohol in Space",
        summary: "Located 26,000 light-years from Earth in Sagittarius B2, there is a molecular cloud containing roughly 10 billion billion billion litres of ethyl alcohol — enough to fill millions of Earth-sized planets. Astronomers study it to understand how complex molecules form in space.",
        link: null,
    },
    {
        title: "The Sun Loses 4 Million Tons of Mass Every Second",
        summary: "Through nuclear fusion, the Sun converts hydrogen into helium and releases an extraordinary amount of energy. In this process, about 4 million metric tons of matter are converted to energy every single second — yet the Sun has enough fuel to continue shining for another 5 billion years.",
        link: null,
    },
    {
        title: "Olympus Mons Is Three Times the Height of Everest",
        summary: "The largest volcano in the solar system, Olympus Mons on Mars, stands approximately 22 km (72,000 ft) tall — nearly three times the height of Mount Everest. Its base stretches 600 km across, wide enough to cover the entire state of Arizona.",
        link: null,
    },
    {
        title: "Saturn Could Float on Water",
        summary: "Saturn is the least dense planet in our solar system, with an average density of just 0.687 g/cm³. Water has a density of 1.0 g/cm³. If you could find an ocean large enough, Saturn would float on it — making it the only planet that could do so.",
        link: null,
    },
    {
        title: "Space Is Completely Silent",
        summary: "Sound needs a medium — like air or water — to travel through. In the vacuum of space, there is no such medium. Explosions, rocket engines, and even supernovae produce absolutely no sound that could be heard. The universe is in permanent, absolute silence.",
        link: null,
    },
    {
        title: "The James Webb Telescope Sees Back in Time",
        summary: "Because light takes time to travel, looking deep into space means looking back in time. The James Webb Space Telescope can observe galaxies as they existed over 13 billion years ago — just a few hundred million years after the Big Bang — giving us a direct window into the early universe.",
        link: null,
    },
    {
        title: "There Are More Possible Chess Games Than Atoms in the Observable Universe",
        summary: "While not strictly astronomy, the Shannon Number — the estimated number of possible chess games — is 10^120. The number of atoms in the observable universe is only about 10^80. This comparison helps illustrate just how incomprehensibly vast certain numbers in physics and mathematics truly are.",
        link: null,
    },
    {
        title: "Black Holes Warp Both Space and Time",
        summary: "Near the event horizon of a black hole, gravity is so intense that time itself slows down relative to a distant observer — a phenomenon predicted by Einstein's general theory of relativity called gravitational time dilation. An astronaut falling into a black hole would appear to freeze at the event horizon as seen from outside.",
        link: null,
    },
    {
        title: "The Cosmic Microwave Background Is the Oldest Light We Can See",
        summary: "The universe was opaque for its first 380,000 years. When it finally cooled enough for atoms to form, light was released — and we can still detect that ancient glow today as the Cosmic Microwave Background radiation. It is the oldest electromagnetic radiation in the universe, a faint echo of the Big Bang itself.",
        link: null,
    },
];

// ── STATE ────────────────────────────────────────────────────
let dykArticles = [];   // pool of facts for the current session
let dykIndex = 0;       // current position in pool

// ── MAIN INIT ────────────────────────────────────────────────
async function initDailyFact() {
    // Only run on the homepage
    const section = document.getElementById('do-you-know');
    if (!section) return;

    // Stamp today's date on the card
    const dateEl = document.getElementById('dyk-date');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    // Seed the index from today's date so the "daily" fact is consistent
    const today = new Date();
    const dayOfYear = Math.floor(
        (today - new Date(today.getFullYear(), 0, 0)) / 86400000
    );

    try {
        dykArticles = await fetchSpaceflightArticles();
        if (!dykArticles.length) throw new Error('empty');
        // Start at the day-based offset so each day opens on a different fact
        dykIndex = dayOfYear % dykArticles.length;
        renderFact(dykArticles[dykIndex], 'api');
    } catch (_) {
        // Fall back to local facts
        dykArticles = DYK_FALLBACK_FACTS;
        dykIndex = dayOfYear % dykArticles.length;
        renderFact(dykArticles[dykIndex], 'local');
    }
}

// ── FETCH FROM SPACEFLIGHT NEWS API ─────────────────────────
async function fetchSpaceflightArticles() {
    // Simple session-level cache to avoid hammering the API
    const cacheRaw = sessionStorage.getItem(DYK_CONFIG.cacheKey);
    if (cacheRaw) {
        try { return JSON.parse(cacheRaw); } catch (_) { /* ignore */ }
    }

    const res = await fetch(DYK_CONFIG.apiUrl, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const articles = (json.results || [])
        .filter(a => a.title && a.summary && a.summary.length > 60)
        .map(a => ({
            title: a.title,
            summary: a.summary,
            link: a.url || null,
        }));

    if (articles.length) {
        sessionStorage.setItem(DYK_CONFIG.cacheKey, JSON.stringify(articles));
    }
    return articles;
}

// ── RENDER A FACT ────────────────────────────────────────────
function renderFact(fact, source) {
    const loading = document.getElementById('dyk-loading');
    const content = document.getElementById('dyk-content');
    const title = document.getElementById('dyk-title');
    const summary = document.getElementById('dyk-summary');
    const link = document.getElementById('dyk-link');
    const badge = document.getElementById('dyk-source-badge');
    const label = document.getElementById('dyk-source-label');
    const refreshBtn = document.getElementById('dyk-refresh');

    if (!loading || !content || !title || !summary) return;

    // Populate
    title.textContent = fact.title;
    summary.textContent = fact.summary;

    // Source badge
    if (badge && label) {
        badge.classList.remove('hidden');
        label.textContent = source === 'api' ? 'Spaceflight News API' : 'AstroSoc Archive';
    }

    // Read-more link
    if (link) {
        if (fact.link) {
            link.href = fact.link;
            link.classList.remove('hidden');
        } else {
            link.classList.add('hidden');
        }
    }

    // Swap loading → content with animation
    loading.classList.add('hidden');
    content.classList.remove('hidden');
    // Re-trigger animation on each cycle
    content.classList.remove('dyk-fade-in');
    void content.offsetWidth; // reflow trick
    content.classList.add('dyk-fade-in');

    // Show the refresh button
    if (refreshBtn) {
        refreshBtn.style.opacity = '1';
    }
}

// ── CYCLE TO NEXT FACT (bound to "Next Fact" button) ─────────
function cycleDailyFact() {
    if (!dykArticles.length) return;
    markQuestCompleted('read_fact');
    dykIndex = (dykIndex + 1) % dykArticles.length;

    // Briefly show loading skeleton for smooth transition
    const loading = document.getElementById('dyk-loading');
    const content = document.getElementById('dyk-content');
    if (loading && content) {
        content.classList.add('hidden');
        loading.classList.remove('hidden');
    }

    setTimeout(() => renderFact(dykArticles[dykIndex],
        dykArticles === DYK_FALLBACK_FACTS ? 'local' : 'api'), 400);
}

// ── EXPOSE cycleDailyFact GLOBALLY (used by onclick in HTML) ─
// ============================================================
// 8. DAILY ENGAGEMENT HUB - STREAKS, QUESTS, MINI GAME
// ============================================================
const ENGAGEMENT_CONFIG = {
    localStorageKey: 'astro_engagement_state_v1',
    profileKey: 'astro_engagement_profile_v1',
    firebaseBasePath: 'engagementProfiles',
    levelXpStep: 120,
    dailyCheckinXp: 10,
    questXp: {
        read_fact: 15,
        play_game: 25,
        score_12: 35
    },
    gameDurationSec: 55,
    gamePairCount: 8,
    matchBaseScore: 42,
    mismatchPenalty: 10,
    comboBonusStep: 8,
    minimumQuestScore: 280
};

const ENGAGEMENT_ZODIAC_SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

let engagementState = null;
let engagementProfileId = '';
let engagementSyncTimer = null;
let engagementFactObserverBound = false;
let engagementFactObserver = null;
const engagementEls = {};

const engagementGame = {
    active: false,
    score: 0,
    timer: ENGAGEMENT_CONFIG.gameDurationSec,
    combo: 0,
    matchedPairs: 0,
    moves: 0,
    deck: [],
    flippedIds: [],
    lockBoard: false,
    tickInterval: null
};

function initEngagementHub() {
    const section = document.getElementById('daily-cosmic-challenge');
    if (!section) return;

    cacheEngagementElements();
    engagementProfileId = getOrCreateEngagementProfileId();
    engagementState = ensureDailyState(loadEngagementState());

    bindEngagementEvents();
    bindFactQuestObserver();
    renderEngagementState();
    hydrateEngagementStateFromFirebase();
}

function cacheEngagementElements() {
    engagementEls.streak = document.getElementById('eng-streak-days');
    engagementEls.xp = document.getElementById('eng-xp-total');
    engagementEls.level = document.getElementById('eng-level');
    engagementEls.levelProgress = document.getElementById('eng-level-progress');
    engagementEls.levelProgressLabel = document.getElementById('eng-level-progress-label');
    engagementEls.checkinBtn = document.getElementById('eng-checkin-btn');
    engagementEls.checkinStatus = document.getElementById('eng-checkin-status');
    engagementEls.questRead = document.getElementById('eng-quest-read_fact-status');
    engagementEls.questPlay = document.getElementById('eng-quest-play_game-status');
    engagementEls.questScore = document.getElementById('eng-quest-score_12-status');
    engagementEls.gameStart = document.getElementById('eng-game-start');
    engagementEls.gameStatus = document.getElementById('eng-game-status');
    engagementEls.gameBoard = document.getElementById('eng-game-board');
    engagementEls.gameTimer = document.getElementById('eng-game-timer');
    engagementEls.gameScore = document.getElementById('eng-game-score');
    engagementEls.gameCombo = document.getElementById('eng-game-combo');
    engagementEls.gameMatches = document.getElementById('eng-game-matches');
    engagementEls.gameBest = document.getElementById('eng-game-best');
}

function bindEngagementEvents() {
    engagementEls.checkinBtn?.addEventListener('click', claimDailyCheckin);
    engagementEls.gameStart?.addEventListener('click', startConstellationMatch);
}

function bindFactQuestObserver() {
    if (engagementFactObserverBound) return;
    const section = document.getElementById('do-you-know');
    if (!section || typeof IntersectionObserver === 'undefined') return;

    engagementFactObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            markQuestCompleted('read_fact');
            engagementFactObserver?.disconnect();
        });
    }, { threshold: 0.45 });

    engagementFactObserver.observe(section);
    engagementFactObserverBound = true;
}

function createDefaultEngagementState() {
    return {
        streakDays: 0,
        xp: 0,
        bestGameScore: 0,
        lastCheckinDate: '',
        dailyDate: '',
        dailyQuests: {
            read_fact: false,
            play_game: false,
            score_12: false
        },
        dailyRewardsClaimed: {
            checkin: false,
            read_fact: false,
            play_game: false,
            score_12: false
        },
        updatedAt: 0
    };
}

function loadEngagementState() {
    const fallback = createDefaultEngagementState();
    const raw = localStorage.getItem(ENGAGEMENT_CONFIG.localStorageKey);
    if (!raw) return fallback;
    try {
        const parsed = JSON.parse(raw);
        return normalizeEngagementState(parsed);
    } catch (error) {
        console.warn('[Engagement] Local state parse failed', error);
        return fallback;
    }
}

function normalizeEngagementState(state) {
    const fallback = createDefaultEngagementState();
    return {
        ...fallback,
        ...state,
        dailyQuests: {
            ...fallback.dailyQuests,
            ...(state?.dailyQuests || {})
        },
        dailyRewardsClaimed: {
            ...fallback.dailyRewardsClaimed,
            ...(state?.dailyRewardsClaimed || {})
        }
    };
}

function ensureDailyState(state) {
    const normalized = normalizeEngagementState(state);
    const today = getDateKey();
    if (normalized.dailyDate === today) return normalized;

    normalized.dailyDate = today;
    normalized.dailyQuests = {
        read_fact: false,
        play_game: false,
        score_12: false
    };
    normalized.dailyRewardsClaimed = {
        checkin: false,
        read_fact: false,
        play_game: false,
        score_12: false
    };

    return normalized;
}

function getDateKey(inputDate = new Date()) {
    const year = inputDate.getFullYear();
    const month = String(inputDate.getMonth() + 1).padStart(2, '0');
    const day = String(inputDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseDateKey(value) {
    if (!value || typeof value !== 'string') return null;
    const [year, month, day] = value.split('-').map((part) => Number(part));
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
}

function dayDiff(fromKey, toKey) {
    const fromDate = parseDateKey(fromKey);
    const toDate = parseDateKey(toKey);
    if (!fromDate || !toDate) return null;
    const diffMs = toDate.setHours(0, 0, 0, 0) - fromDate.setHours(0, 0, 0, 0);
    return Math.round(diffMs / 86400000);
}

function getOrCreateEngagementProfileId() {
    let profileId = localStorage.getItem(ENGAGEMENT_CONFIG.profileKey);
    if (profileId) return profileId;

    profileId = `astro_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(ENGAGEMENT_CONFIG.profileKey, profileId);
    return profileId;
}

function saveEngagementStateToLocal() {
    localStorage.setItem(ENGAGEMENT_CONFIG.localStorageKey, JSON.stringify(engagementState));
}

function persistEngagementState({ sync = true } = {}) {
    if (!engagementState) return;
    engagementState.updatedAt = Date.now();
    saveEngagementStateToLocal();
    if (sync) queueEngagementSync();
}

function queueEngagementSync() {
    if (!db || !engagementProfileId) return;
    clearTimeout(engagementSyncTimer);
    engagementSyncTimer = setTimeout(() => {
        const payload = {
            ...engagementState,
            profileId: engagementProfileId,
            updatedAt: Date.now()
        };
        db.ref(`${ENGAGEMENT_CONFIG.firebaseBasePath}/${engagementProfileId}`).set(payload)
            .catch((error) => console.warn('[Engagement] Firebase sync failed', error));
    }, 600);
}

function hydrateEngagementStateFromFirebase() {
    if (!db || !engagementProfileId) return;
    db.ref(`${ENGAGEMENT_CONFIG.firebaseBasePath}/${engagementProfileId}`).once('value')
        .then((snap) => {
            const remoteRaw = snap.val();
            if (!remoteRaw) {
                queueEngagementSync();
                return;
            }

            const remote = ensureDailyState(normalizeEngagementState(remoteRaw));
            engagementState = mergeEngagementStates(engagementState, remote);
            saveEngagementStateToLocal();
            renderEngagementState();
        })
        .catch((error) => console.warn('[Engagement] Firebase hydrate failed', error));
}

function mergeEngagementStates(localState, remoteState) {
    const local = ensureDailyState(localState || createDefaultEngagementState());
    const remote = ensureDailyState(remoteState || createDefaultEngagementState());
    const merged = local.updatedAt >= remote.updatedAt ? { ...local } : { ...remote };

    merged.xp = Math.max(local.xp || 0, remote.xp || 0);
    merged.streakDays = Math.max(local.streakDays || 0, remote.streakDays || 0);
    merged.bestGameScore = Math.max(local.bestGameScore || 0, remote.bestGameScore || 0);

    const latestCheckin = [local.lastCheckinDate, remote.lastCheckinDate]
        .filter(Boolean)
        .sort()
        .pop() || '';
    merged.lastCheckinDate = latestCheckin;

    if (local.dailyDate === remote.dailyDate) {
        merged.dailyQuests = {
            read_fact: Boolean(local.dailyQuests.read_fact || remote.dailyQuests.read_fact),
            play_game: Boolean(local.dailyQuests.play_game || remote.dailyQuests.play_game),
            score_12: Boolean(local.dailyQuests.score_12 || remote.dailyQuests.score_12)
        };
        merged.dailyRewardsClaimed = {
            checkin: Boolean(local.dailyRewardsClaimed.checkin || remote.dailyRewardsClaimed.checkin),
            read_fact: Boolean(local.dailyRewardsClaimed.read_fact || remote.dailyRewardsClaimed.read_fact),
            play_game: Boolean(local.dailyRewardsClaimed.play_game || remote.dailyRewardsClaimed.play_game),
            score_12: Boolean(local.dailyRewardsClaimed.score_12 || remote.dailyRewardsClaimed.score_12)
        };
    }

    return ensureDailyState(merged);
}

function claimDailyCheckin() {
    if (!engagementState) return;
    engagementState = ensureDailyState(engagementState);
    const today = getDateKey();

    if (engagementState.lastCheckinDate === today) {
        renderEngagementState('Daily check-in already claimed.');
        return;
    }

    const diff = dayDiff(engagementState.lastCheckinDate, today);
    if (diff === 1) {
        engagementState.streakDays += 1;
    } else {
        engagementState.streakDays = 1;
    }
    engagementState.lastCheckinDate = today;

    if (!engagementState.dailyRewardsClaimed.checkin) {
        engagementState.xp += ENGAGEMENT_CONFIG.dailyCheckinXp;
        engagementState.dailyRewardsClaimed.checkin = true;
    }

    persistEngagementState();
    renderEngagementState('Check-in complete. Streak extended.');
}

function markQuestCompleted(questId) {
    if (!engagementState) return;
    if (!Object.prototype.hasOwnProperty.call(ENGAGEMENT_CONFIG.questXp, questId)) return;

    engagementState = ensureDailyState(engagementState);
    if (engagementState.dailyQuests[questId]) return;

    engagementState.dailyQuests[questId] = true;
    if (!engagementState.dailyRewardsClaimed[questId]) {
        engagementState.xp += ENGAGEMENT_CONFIG.questXp[questId];
        engagementState.dailyRewardsClaimed[questId] = true;
    }

    persistEngagementState();
    renderEngagementState();
}

function renderEngagementState(statusMessage = '') {
    if (!engagementState) return;
    engagementState = ensureDailyState(engagementState);

    const xp = Number(engagementState.xp || 0);
    const level = Math.floor(xp / ENGAGEMENT_CONFIG.levelXpStep) + 1;
    const progressXp = xp % ENGAGEMENT_CONFIG.levelXpStep;
    const progress = Math.round((progressXp / ENGAGEMENT_CONFIG.levelXpStep) * 100);
    const checkedInToday = engagementState.lastCheckinDate === getDateKey();

    if (engagementEls.streak) engagementEls.streak.textContent = String(engagementState.streakDays || 0);
    if (engagementEls.xp) engagementEls.xp.textContent = String(xp);
    if (engagementEls.level) engagementEls.level.textContent = String(level);
    if (engagementEls.levelProgress) engagementEls.levelProgress.style.width = `${progress}%`;
    if (engagementEls.levelProgressLabel) engagementEls.levelProgressLabel.textContent = `${progress}%`;
    if (engagementEls.gameBest) engagementEls.gameBest.textContent = String(engagementState.bestGameScore || 0);
    if (engagementEls.gameTimer && !engagementGame.active) engagementEls.gameTimer.textContent = `${ENGAGEMENT_CONFIG.gameDurationSec}s`;
    if (engagementEls.gameScore && !engagementGame.active) engagementEls.gameScore.textContent = '0';
    if (engagementEls.gameCombo && !engagementGame.active) engagementEls.gameCombo.textContent = 'x0';
    if (engagementEls.gameMatches && !engagementGame.active) {
        engagementEls.gameMatches.textContent = `0/${ENGAGEMENT_CONFIG.gamePairCount}`;
    }

    if (engagementEls.checkinBtn) {
        engagementEls.checkinBtn.disabled = checkedInToday;
        engagementEls.checkinBtn.classList.toggle('is-disabled', checkedInToday);
    }

    if (engagementEls.checkinStatus) {
        if (statusMessage) {
            engagementEls.checkinStatus.textContent = statusMessage;
        } else {
            engagementEls.checkinStatus.textContent = checkedInToday
                ? 'You already checked in today. Come back tomorrow.'
                : 'Check in today to keep your streak alive.';
        }
    }

    setQuestStatus(engagementEls.questRead, engagementState.dailyQuests.read_fact);
    setQuestStatus(engagementEls.questPlay, engagementState.dailyQuests.play_game);
    setQuestStatus(engagementEls.questScore, engagementState.dailyQuests.score_12);
}

function setQuestStatus(element, completed) {
    if (!element) return;
    element.textContent = completed ? 'Completed' : 'Pending';
    element.classList.toggle('is-complete', completed);
}

function renderGameBoardPlaceholder() {
    if (!engagementEls.gameBoard) return;
    engagementEls.gameBoard.classList.remove('eng-memory-grid');
    engagementEls.gameBoard.innerHTML = `
        <p class="eng-game-placeholder">
            Flip cards, match constellations, build combos, and beat the timer.
        </p>
    `;
}

function startConstellationMatch() {
    if (engagementGame.active || !engagementEls.gameBoard) return;

    engagementGame.active = true;
    engagementGame.score = 0;
    engagementGame.combo = 0;
    engagementGame.matchedPairs = 0;
    engagementGame.moves = 0;
    engagementGame.timer = ENGAGEMENT_CONFIG.gameDurationSec;
    engagementGame.flippedIds = [];
    engagementGame.lockBoard = false;
    engagementGame.deck = createMemoryDeck(ENGAGEMENT_CONFIG.gamePairCount);

    renderMemoryBoard();
    updateMemoryStats();
    if (engagementEls.gameStatus) {
        engagementEls.gameStatus.textContent = 'Memory round started. Match all pairs before time runs out.';
    }
    if (engagementEls.gameStart) {
        engagementEls.gameStart.disabled = true;
        engagementEls.gameStart.classList.add('is-disabled');
    }

    engagementGame.tickInterval = setInterval(() => {
        engagementGame.timer -= 1;
        if (engagementEls.gameTimer) engagementEls.gameTimer.textContent = `${Math.max(engagementGame.timer, 0)}s`;
        if (engagementGame.timer <= 0) {
            endConstellationMatch(false);
        }
    }, 1000);
}

function createMemoryDeck(pairCount) {
    const signsPool = shuffleArray([...ENGAGEMENT_ZODIAC_SIGNS]).slice(0, pairCount);
    const deck = [];
    let id = 0;

    signsPool.forEach((sign) => {
        deck.push({ id: `c${id++}`, sign, flipped: false, matched: false });
        deck.push({ id: `c${id++}`, sign, flipped: false, matched: false });
    });

    return shuffleArray(deck);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function renderMemoryBoard() {
    if (!engagementEls.gameBoard) return;
    engagementEls.gameBoard.innerHTML = '';
    engagementEls.gameBoard.classList.add('eng-memory-grid');

    engagementGame.deck.forEach((card) => {
        const cardBtn = document.createElement('button');
        cardBtn.type = 'button';
        cardBtn.className = 'eng-memory-card';
        cardBtn.dataset.cardId = card.id;
        cardBtn.innerHTML = `
            <span class="eng-memory-face eng-memory-face--front">?</span>
            <span class="eng-memory-face eng-memory-face--back">${card.sign}</span>
        `;
        cardBtn.addEventListener('click', () => flipMemoryCard(card.id));
        engagementEls.gameBoard.appendChild(cardBtn);
    });
}

function flipMemoryCard(cardId) {
    if (!engagementGame.active || engagementGame.lockBoard) return;

    const card = engagementGame.deck.find((entry) => entry.id === cardId);
    if (!card || card.flipped || card.matched) return;

    card.flipped = true;
    engagementGame.flippedIds.push(cardId);
    setCardFlippedState(cardId, true);

    if (engagementGame.flippedIds.length < 2) return;

    const first = engagementGame.deck.find((entry) => entry.id === engagementGame.flippedIds[0]);
    const second = engagementGame.deck.find((entry) => entry.id === engagementGame.flippedIds[1]);
    if (!first || !second) return;

    engagementGame.moves += 1;
    engagementGame.lockBoard = true;

    if (first.sign === second.sign) {
        first.matched = true;
        second.matched = true;
        engagementGame.matchedPairs += 1;
        engagementGame.combo += 1;
        engagementGame.score += ENGAGEMENT_CONFIG.matchBaseScore + ((engagementGame.combo - 1) * ENGAGEMENT_CONFIG.comboBonusStep);

        markCardMatched(first.id);
        markCardMatched(second.id);
        engagementGame.flippedIds = [];
        engagementGame.lockBoard = false;
        updateMemoryStats();

        if (engagementGame.matchedPairs >= ENGAGEMENT_CONFIG.gamePairCount) {
            endConstellationMatch(true);
        }
        return;
    }

    engagementGame.combo = 0;
    engagementGame.score = Math.max(0, engagementGame.score - ENGAGEMENT_CONFIG.mismatchPenalty);
    updateMemoryStats();

    setTimeout(() => {
        first.flipped = false;
        second.flipped = false;
        setCardFlippedState(first.id, false);
        setCardFlippedState(second.id, false);
        engagementGame.flippedIds = [];
        engagementGame.lockBoard = false;
    }, 700);
}

function setCardFlippedState(cardId, isFlipped) {
    if (!engagementEls.gameBoard) return;
    const cardEl = engagementEls.gameBoard.querySelector(`[data-card-id="${cardId}"]`);
    if (!cardEl) return;
    cardEl.classList.toggle('is-flipped', isFlipped);
}

function markCardMatched(cardId) {
    if (!engagementEls.gameBoard) return;
    const cardEl = engagementEls.gameBoard.querySelector(`[data-card-id="${cardId}"]`);
    if (!cardEl) return;
    cardEl.classList.add('is-matched');
}

function updateMemoryStats() {
    if (engagementEls.gameTimer) engagementEls.gameTimer.textContent = `${Math.max(engagementGame.timer, 0)}s`;
    if (engagementEls.gameScore) engagementEls.gameScore.textContent = String(engagementGame.score);
    if (engagementEls.gameCombo) engagementEls.gameCombo.textContent = `x${engagementGame.combo}`;
    if (engagementEls.gameMatches) {
        engagementEls.gameMatches.textContent = `${engagementGame.matchedPairs}/${ENGAGEMENT_CONFIG.gamePairCount}`;
    }
}

function endConstellationMatch(allPairsMatched) {
    engagementGame.active = false;
    clearInterval(engagementGame.tickInterval);
    engagementGame.tickInterval = null;
    engagementGame.lockBoard = false;
    engagementGame.flippedIds = [];

    if (engagementEls.gameStart) {
        engagementEls.gameStart.disabled = false;
        engagementEls.gameStart.classList.remove('is-disabled');
    }

    markQuestCompleted('play_game');
    if (engagementGame.score >= ENGAGEMENT_CONFIG.minimumQuestScore || allPairsMatched) {
        markQuestCompleted('score_12');
    }

    if (engagementGame.score > (engagementState?.bestGameScore || 0)) {
        engagementState.bestGameScore = engagementGame.score;
        persistEngagementState();
    } else {
        renderEngagementState();
    }
    updateMemoryStats();

    if (engagementEls.gameStatus) {
        const winState = allPairsMatched ? 'Perfect clear.' : 'Round ended.';
        const questState = engagementGame.score >= ENGAGEMENT_CONFIG.minimumQuestScore || allPairsMatched
            ? 'High-score quest completed.'
            : `Reach ${ENGAGEMENT_CONFIG.minimumQuestScore}+ score to complete the final quest.`;
        engagementEls.gameStatus.textContent = `${winState} Score ${engagementGame.score} | Matches ${engagementGame.matchedPairs}/${ENGAGEMENT_CONFIG.gamePairCount}. ${questState}`;
    }
}

window.cycleDailyFact = cycleDailyFact;
