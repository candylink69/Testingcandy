// ============================================================
// COMMON.JS - Environment Agnostic (Works on Root & /gifs/)
// ============================================================

// ========== IN-APP REDIRECT ==========
(function() {
    const ua = navigator.userAgent;
    const isTelegram = /Telegram/i.test(ua);
    const isInApp = /FBAN|FBAV|Instagram|Twitter|Snapchat|LinkedIn|Messenger|FBIOS|FB_IAB/i.test(ua);
    const currentUrl = window.location.href;
    const cleanUrl = currentUrl.replace(/^https?:\/\//, '');
    if (isTelegram || isInApp) {
        if (/Android/i.test(ua)) {
            window.location.href = 'intent://' + cleanUrl + '#Intent;scheme=https;action=android.intent.action.VIEW;end';
        } else if (/iPhone|iPad|iPod/i.test(ua)) {
            window.location.href = 'x-safari-https://' + cleanUrl;
        }
    }
})();

// ========== SMART PATH DETECTOR ==========
// Agar URL me /gifs/ hai, toh basePath ../ ho jayega, warna kuch nahi hoga.
const isGifsPage = window.location.pathname.match(/\/gifs(\/|$)/);
const basePath = isGifsPage ? '../' : '';

// ========== GLOBAL FUNCTIONS ==========
function goToVideo(videoId) {
    window.location.href = basePath + 'video.html?v=' + videoId;
}
function goToCategory(categoryId) {
    window.location.href = basePath + 'list.html?category=' + categoryId;
}
function goToPage(url) {
    window.location.href = url;
}

function goToTab(tabName) {
    closeMenu();
    if (!isGifsPage && typeof switchTab === 'function') {
        switchTab(tabName);
    } else {
        window.location.href = basePath + 'index.html?tab=' + tabName;
    }
}

// ========== SIDE MENU FUNCTIONS ==========
function openMenu() {
    const overlay = document.getElementById('menuOverlay');
    const drawer = document.getElementById('menuDrawer');
    if (overlay) overlay.style.display = 'block';
    if (drawer) drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeMenu() {
    const overlay = document.getElementById('menuOverlay');
    const drawer = document.getElementById('menuDrawer');
    if (overlay) overlay.style.display = 'none';
    if (drawer) drawer.classList.remove('open');
    document.body.style.overflow = '';
}
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeMenu();
});

// ========== GIFs SUBMENU TOGGLE ==========
function toggleGifSubmenu(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const sub = document.getElementById('gifSubmenu');
    const arrow = document.getElementById('gifSubmenuArrow');
    if (!sub) return;
    const isOpen = sub.style.display !== 'none';
    sub.style.display = isOpen ? 'none' : 'block';
    if (arrow) arrow.textContent = isOpen ? '▾' : '▴';
}

// ========== LOAD SIDE MENU ==========
function loadSideMenu() {
    const menuHTML = `
        <div id="menuOverlay" onclick="closeMenu()"></div>
        <div id="menuDrawer">
            <div id="menuHeader">
                <span class="menu-logo">🍬 CandyLink69</span>
                <span class="menu-close" onclick="closeMenu()">✕</span>
            </div>
            <ul id="menuNav">
                <li><a href="${basePath}index.html" class="menu-link" data-page="index">🏠 Home</a></li>
                <li><a href="${basePath}index.html?tab=latest" onclick="goToTab('latest'); return false;" class="menu-link" data-page="latest">🔥 Latest</a></li>
                <li><a href="${basePath}index.html?tab=categories" onclick="goToTab('categories'); return false;" class="menu-link" data-page="categories">📂 Categories</a></li>
                <li><a href="${basePath}index.html?tab=trending" onclick="goToTab('trending'); return false;" class="menu-link" data-page="trending">⚡ Trending</a></li>
                <li><a href="${basePath}list.html" class="menu-link" data-page="list">📋 All Videos</a></li>

                <li class="menu-has-submenu">
                    <a href="${basePath}gifs/" class="menu-link" data-page="gifs"
                       onclick="toggleGifSubmenu(event); return false;"
                       style="display:flex;justify-content:space-between;align-items:center;">
                        <span>🎞️ GIFs</span>
                        <span id="gifSubmenuArrow">▾</span>
                    </a>
                    <ul id="gifSubmenu" class="menu-submenu" style="display:none;">
                        <li><a href="${basePath}gifs/" class="menu-link">🏠 GIFs Home</a></li>
                        <li><a href="${basePath}gifs/?type=captioned" class="menu-link">💬 Caption GIFs</a></li>
                        <li><a href="${basePath}gifs/?type=normal" class="menu-link">🖼️ Normal GIFs</a></li>
                        <li class="submenu-heading">📁 Caption Categories</li>
                        <li id="gifCaptionedCats"><span class="submenu-loading">Loading...</span></li>
                        <li class="submenu-heading">📁 Normal Categories</li>
                        <li id="gifNormalCats"><span class="submenu-loading">Loading...</span></li>
                    </ul>
                </li>
            </ul>
            <div id="menuCategoryHeading">📁 ALL CATEGORIES</div>
            <ul id="menuCategoryList"></ul>
            <div id="menuSocial">
                <a href="https://www.instagram.com/candylink_official" target="_blank" class="social-icon instagram" aria-label="Visit our Instagram page"><i class="fab fa-instagram"></i></a>
                <a href="https://t.me/candylink6" target="_blank" class="social-icon telegram" aria-label="Join our Telegram channel"><i class="fab fa-telegram-plane"></i></a>
                <a href="https://www.facebook.com/Candylinkhub" target="_blank" class="social-icon facebook" aria-label="Visit our Facebook page"><i class="fab fa-facebook-f"></i></a>
            </div>
        </div>
    `;

    const menuContainer = document.getElementById('sideMenu');
    if (menuContainer) {
        menuContainer.innerHTML = menuHTML;
    }

    // Video categories
    fetch(basePath + 'data/categories.json')
        .then(response => response.json())
        .then(categories => {
            const list = document.getElementById('menuCategoryList');
            if (!list) return;
            list.innerHTML = '';
            categories.forEach(cat => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="${basePath}list.html?category=${cat.id}" class="menu-link">▶ ${cat.name}</a>`;
                list.appendChild(li);
            });
        })
        .catch(err => {
            console.log('Categories load nahi hui:', err);
            const list = document.getElementById('menuCategoryList');
            if (list) {
                list.innerHTML = '<li style="color:#888; padding:10px;">⚠️ Categories load nahi hui</li>';
            }
        });

    // GIFs categories load (submenu ke liye)
    fetch(basePath + 'gifs/categories.json')
        .then(r => r.ok ? r.json() : { captioned: [], normal: [] })
        .then(cats => {
            const cEl = document.getElementById('gifCaptionedCats');
            const nEl = document.getElementById('gifNormalCats');
            if (cEl) {
                cEl.innerHTML = (cats.captioned || []).map(c =>
                    `<a href="${basePath}gifs/?type=captioned&category=${encodeURIComponent(c.id)}" class="menu-link">▶ ${c.name}</a>`
                ).join('') || '<span class="submenu-loading">—</span>';
            }
            if (nEl) {
                nEl.innerHTML = (cats.normal || []).map(c =>
                    `<a href="${basePath}gifs/?type=normal&category=${encodeURIComponent(c.id)}" class="menu-link">▶ ${c.name}</a>`
                ).join('') || '<span class="submenu-loading">—</span>';
            }
        })
        .catch(() => {
            const cEl = document.getElementById('gifCaptionedCats');
            const nEl = document.getElementById('gifNormalCats');
            if (cEl) cEl.innerHTML = '<span class="submenu-loading">—</span>';
            if (nEl) nEl.innerHTML = '<span class="submenu-loading">—</span>';
        });

    highlightActiveMenu();
}

// ========== ACTIVE LINK HIGHLIGHT ==========
function highlightActiveMenu() {
    const path = window.location.pathname;

    document.querySelectorAll('#menuNav .menu-link').forEach(link => {
        link.classList.remove('active-link');
    });

    if (isGifsPage) {
        const gifsLink = document.querySelector('#menuNav [data-page="gifs"]');
        if (gifsLink) gifsLink.classList.add('active-link');
        const sub = document.getElementById('gifSubmenu');
        const arrow = document.getElementById('gifSubmenuArrow');
        if (sub) sub.style.display = 'block';
        if (arrow) arrow.textContent = '▴';
        return;
    }

    const currentPage = path.split('/').pop() || 'index.html';
    document.querySelectorAll('#menuNav .menu-link').forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href.endsWith(currentPage) || (currentPage === '' && href.includes('index.html'))) {
            link.classList.add('active-link');
        }
    });
}

// ========== LOAD HEADER ==========
function loadHeader() {
    const container = document.getElementById('headerContainer');
    if (!container) return;
    if (window.location.pathname.includes('video.html')) {
        container.innerHTML = `<div class="title">🔥 CandyLink69 🔥</div>`;
        return;
    }
    const headerHTML = `
        <div class="title">🔥 CandyLink69 🔥</div>
        <div class="social-text">✨ For the latest updates, you can join with us on these platforms. ✨</div>
        <div class="social-row">
            <a href="https://www.instagram.com/candylink_official" target="_blank" class="social-icon instagram" aria-label="Visit our Instagram page"><i class="fab fa-instagram"></i></a>
            <a href="https://t.me/candylink6" target="_blank" class="social-icon telegram" aria-label="Join our Telegram channel"><i class="fab fa-telegram-plane"></i></a>
            <a href="https://www.facebook.com/Candylinkhub" target="_blank" class="social-icon facebook" aria-label="Visit our Facebook page"><i class="fab fa-facebook-f"></i></a>
        </div>
    `;
    container.innerHTML = headerHTML;
}

// ========== LOAD FOOTER ==========
function loadFooter() {
    const container = document.getElementById('footerContainer');
    if (!container) return;
    const footerHTML = `
        <div class="social-text">✨ For the latest updates, you can join with us on these platforms. ✨</div>
        <div class="social-row">
            <a href="https://www.instagram.com/candylink_official" target="_blank" class="social-icon instagram" aria-label="Visit our Instagram page"><i class="fab fa-instagram"></i></a>
            <a href="https://t.me/candylink6" target="_blank" class="social-icon telegram" aria-label="Join our Telegram channel"><i class="fab fa-telegram-plane"></i></a>
            <a href="https://www.facebook.com/Candylinkhub" target="_blank" class="social-icon facebook" aria-label="Visit our Facebook page"><i class="fab fa-facebook-f"></i></a>
        </div>
    `;
    container.innerHTML = footerHTML;
}

// ========== LOAD SEARCH ==========
function loadSearchBar() {
    const container = document.getElementById('searchContainer');
    if (!container) return;
    const placeholder = isGifsPage
        ? '🔍 Search GIFs by ID, title or category...'
        : '🔍 Search videos by ID, title or category...';
    const searchHTML = `
        <div class="sticky-search">
            <div class="search-container">
                <input type="text" class="search-box" id="searchInput" placeholder="${placeholder}" autocomplete="off">
                <div id="searchResults"></div>
            </div>
        </div>
    `;
    container.innerHTML = searchHTML;
    setupSearchLogic();
}

// ========== SEARCH LOGIC ==========
function setupSearchLogic() {
    if (isGifsPage) return; // gifs.js handles its own search

    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    if (!searchInput) return;
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }
        if (typeof videos === 'undefined' || !videos.length) {
            searchResults.innerHTML = '<div style="padding:15px;color:#888;">Loading videos...</div>';
            searchResults.style.display = 'block';
            return;
        }
        const filtered = videos.filter(v => {
            const idMatch = v.id.toLowerCase().includes(query);
            const titleMatch = v.title && v.title.toLowerCase().includes(query);
            let catMatch = false;
            if (v.categories && Array.isArray(v.categories)) {
                catMatch = v.categories.some(c => c.toLowerCase().includes(query));
            }
            return idMatch || titleMatch || catMatch;
        });
        if (filtered.length === 0) {
            searchResults.innerHTML = '<div style="padding:15px;color:#888;">No videos found</div>';
            searchResults.style.display = 'block';
            return;
        }
        let html = '';
        filtered.slice(0, 10).forEach(v => {
            html += `
                <div class="search-result-item" onclick="goToVideo('${v.id}')">
                    <div class="search-video-id">${v.id}</div>
                    ${v.title ? `<div class="search-video-title" style="color:#ccc;font-size:12px;">${v.title.substring(0, 50)}</div>` : ''}
                </div>
            `;
        });
        searchResults.innerHTML = html;
        searchResults.style.display = 'block';
    });
    document.addEventListener('click', function(e) {
        const container = document.querySelector('.search-container');
        if (container && !container.contains(e.target)) {
            if (searchResults) searchResults.style.display = 'none';
        }
    });
}

// ========== INJECT MENU BUTTON ==========
function injectMenuButton() {
    if (document.getElementById('menuToggleBtn')) return;
    const btn = document.createElement('div');
    btn.id = 'menuToggleBtn';
    btn.innerHTML = '☰';
    btn.style.cssText = `
        position: fixed; top: 12px; left: 12px; z-index: 10000;
        font-size: 24px; color: #ff9900; cursor: pointer;
        background: rgba(0,0,0,0.5); padding: 2px 12px;
        border-radius: 6px; border: 1px solid #ff6600;
        user-select: none; line-height: 1.3;
    `;
    btn.onclick = function(e) {
        e.stopPropagation();
        const drawer = document.getElementById('menuDrawer');
        if (drawer && drawer.classList.contains('open')) closeMenu();
        else openMenu();
    };
    document.body.prepend(btn);
}

// ========== INIT ==========
function initCommon() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCommon);
        return;
    }
    loadHeader();
    loadFooter();
    loadSearchBar();
    loadSideMenu();
    injectMenuButton();
    console.log('✅ Common.js loaded successfully!');
}
initCommon();
