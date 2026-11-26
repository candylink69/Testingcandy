// ============================================================
// COMMON.JS - Menu, Social, Search, In-App Redirect
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
            <div id="menuSocial" style="justify-content: center;">
                <a href="https://t.me/candylink6" target="_blank" class="social-icon telegram" aria-label="Join our Telegram channel"><i class="fab fa-telegram-plane"></i></a>
            </div>
        </div>
    `;

    const menuContainer = document.getElementById('sideMenu');
    if (menuContainer) {
        menuContainer.innerHTML = menuHTML;
    }

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
            const list = document.getElementById('menuCategoryList');
            if (list) list.innerHTML = '<li style="color:#888; padding:10px;">⚠️Categories are not loading</li>';
        });

    fetch(basePath + 'gifs/categories.json')
        .then(r => r.ok ? r.json() : { captioned: [], normal: [] })
        .then(cats => {
            const cEl = document.getElementById('gifCaptionedCats');
            const nEl = document.getElementById('gifNormalCats');
            if (cEl) cEl.innerHTML = (cats.captioned || []).map(c => `<a href="${basePath}gifs/?type=captioned&category=${encodeURIComponent(c.id)}" class="menu-link">▶ ${c.name}</a>`).join('') || '<span class="submenu-loading">—</span>';
            if (nEl) nEl.innerHTML = (cats.normal || []).map(c => `<a href="${basePath}gifs/?type=normal&category=${encodeURIComponent(c.id)}" class="menu-link">▶ ${c.name}</a>`).join('') || '<span class="submenu-loading">—</span>';
        })
        .catch(() => {});

    highlightActiveMenu();
}

// ========== ACTIVE LINK HIGHLIGHT ==========
function highlightActiveMenu() {
    const path = window.location.pathname;
    document.querySelectorAll('#menuNav .menu-link').forEach(link => link.classList.remove('active-link'));

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

// ========== LOAD HEADER (Sirf Title) ==========
function loadHeader() {
    const container = document.getElementById('headerContainer');
    if (!container) return;
    container.innerHTML = `<div class="title">🔥 CandyLink69 🔥</div>`;
}

// ========== LOAD SOCIAL (Sirf Telegram Line) ==========
function loadSocial() {
    const container = document.getElementById('socialContainer');
    if (!container) return;

    // Sirf text aur icon, koi back button nahi
    container.innerHTML = `
        <div class="social-inline-row" style="display: flex; align-items: center; justify-content: center; gap: 4px; margin: 1px 0;">
            <span style="font-size: 11px; color: #ffcc88;">✨For the latest updates, you can join with us on Telegram👉🏻</span>
            <a href="https://t.me/candylink6" target="_blank" class="social-icon telegram" style="width: 22px; height: 22px; font-size: 18px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;"><i class="fab fa-telegram-plane"></i></a>
        </div>
    `;
}

// ========== LOAD SEARCH ==========
function loadSearchBar() {
    const container = document.getElementById('searchContainer');
    if (!container) return;
    const placeholder = isGifsPage ? '🔍 Search GIFs...' : '🔍 Search videos...';
    container.innerHTML = `
        <div class="sticky-search" style="margin: 0 -12px 2px -12px; padding: 0 12px 2px;">
            <div class="search-container">
                <input type="text" class="search-box" id="searchInput" placeholder="${placeholder}" autocomplete="off">
                <div id="searchResults"></div>
            </div>
        </div>
    `;
    setupSearchLogic();
}

// ========== SEARCH LOGIC ==========
function setupSearchLogic() {
    if (isGifsPage) return;
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        if (query.length < 2) { searchResults.style.display = 'none'; return; }
        if (typeof videos === 'undefined' || !videos.length) {
            searchResults.innerHTML = '<div style="padding:15px;color:#888;">Loading...</div>';
            searchResults.style.display = 'block';
            return;
        }
        const filtered = videos.filter(v => 
            v.id.toLowerCase().includes(query) || 
            (v.title && v.title.toLowerCase().includes(query)) || 
            (v.categories && v.categories.some(c => c.toLowerCase().includes(query)))
        );
        if (filtered.length === 0) {
            searchResults.innerHTML = '<div style="padding:15px;color:#888;">No videos found</div>';
            searchResults.style.display = 'block';
            return;
        }
        let html = '';
        filtered.slice(0, 10).forEach(v => {
            html += `<div class="search-result-item" onclick="goToVideo('${v.id}')">
                <div class="search-video-id">${v.id}</div>
                ${v.title ? `<div class="search-video-title" style="color:#ccc;font-size:12px;">${v.title.substring(0, 50)}</div>` : ''}
            </div>`;
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
    btn.style.cssText = `position: fixed; top: 6px; left: 12px; z-index: 10000; font-size: 20px; color: #ff9900; cursor: pointer; background: rgba(0,0,0,0.5); padding: 2px 10px; border-radius: 6px; border: 1px solid #ff6600; user-select: none; line-height: 1.5;`;
    btn.onclick = function(e) {
        e.stopPropagation();
        const drawer = document.getElementById('menuDrawer');
        if (drawer && drawer.classList.contains('open')) closeMenu(); else openMenu();
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
    loadSocial();
    loadSearchBar();
    loadSideMenu();
    injectMenuButton();
}
initCommon();
