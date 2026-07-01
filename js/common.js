// ============================================================
// 1. IN-APP BROWSER REDIRECT (Instagram, Telegram, Facebook)
// ============================================================
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


// ============================================================
// 2. GLOBAL FUNCTIONS
// ============================================================
function goToVideo(videoId) {
    window.location.href = 'video.html?v=' + videoId;
}

function goToCategory(categoryId) {
    window.location.href = 'list.html?category=' + categoryId;
}

function goToPage(url) {
    window.location.href = url;
}


// ============================================================
// 3. SIDE MENU FUNCTIONS
// ============================================================
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


// ============================================================
// 4. LOAD SIDE MENU
// ============================================================
function loadSideMenu() {
    const menuHTML = `
        <div id="menuOverlay" onclick="closeMenu()"></div>
        <div id="menuDrawer">
            <div id="menuHeader">
                <span class="menu-logo">🍬 CandyLink69</span>
                <span class="menu-close" onclick="closeMenu()">✕</span>
            </div>
            <ul id="menuNav">
                <li><a href="index.html" class="menu-link" data-page="index">🏠 Home</a></li>
                <li><a href="index.html" class="menu-link" data-page="latest">🔥 Latest</a></li>
                <li><a href="index.html" class="menu-link" data-page="categories">📂 Categories</a></li>
                <li><a href="index.html" class="menu-link" data-page="trending">⚡ Trending</a></li>
                <li><a href="list.html" class="menu-link" data-page="list">📋 All Videos</a></li>
            </ul>
            <div id="menuCategoryHeading">📁 ALL CATEGORIES</div>
            <ul id="menuCategoryList"></ul>
            <div id="menuSocial">
                <a href="https://www.instagram.com/candylink_official" target="_blank" class="social-icon instagram"><i class="fab fa-instagram"></i></a>
                <a href="https://t.me/candylink6" target="_blank" class="social-icon telegram"><i class="fab fa-telegram-plane"></i></a>
                <a href="https://www.facebook.com/Candylinkhub" target="_blank" class="social-icon facebook"><i class="fab fa-facebook-f"></i></a>
            </div>
        </div>
    `;

    const menuContainer = document.getElementById('sideMenu');
    if (menuContainer) {
        menuContainer.innerHTML = menuHTML;
    }

    // Categories load
    fetch('data/categories.json')
        .then(response => response.json())
        .then(categories => {
            const list = document.getElementById('menuCategoryList');
            if (!list) return;
            list.innerHTML = '';
            categories.forEach(cat => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="list.html?category=${cat.id}" class="menu-link">▶ ${cat.name}</a>`;
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

    highlightActiveMenu();
}

function highlightActiveMenu() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';

    document.querySelectorAll('#menuNav .menu-link').forEach(link => {
        link.classList.remove('active-link');
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active-link');
        }
    });
}


// ============================================================
// 5. LOAD HEADER (Title + Social Icons)
// ============================================================
function loadHeader() {
    const container = document.getElementById('headerContainer');
    if (!container) return;

    // Agar video.html hai toh sirf title (no social)
    if (window.location.pathname.includes('video.html')) {
        container.innerHTML = `<div class="title">🔥 CandyLink69 🔥</div>`;
        return;
    }

    // Index / List pages ke liye full header (title + social)
    const headerHTML = `
        <div class="title">🔥 CandyLink69 🔥</div>
        <div class="social-text">✨ For the latest updates, you can join with us on these platforms. ✨</div>
        <div class="social-row">
            <a href="https://www.instagram.com/candylink_official" target="_blank" class="social-icon instagram"><i class="fab fa-instagram"></i></a>
            <a href="https://t.me/candylink6" target="_blank" class="social-icon telegram"><i class="fab fa-telegram-plane"></i></a>
            <a href="https://www.facebook.com/Candylinkhub" target="_blank" class="social-icon facebook"><i class="fab fa-facebook-f"></i></a>
        </div>
    `;
    container.innerHTML = headerHTML;
}


// ============================================================
// 6. LOAD FOOTER SOCIAL
// ============================================================
function loadFooter() {
    const container = document.getElementById('footerContainer');
    if (!container) return;

    const footerHTML = `
        <div class="social-text">✨ For the latest updates, you can join with us on these platforms. ✨</div>
        <div class="social-row">
            <a href="https://www.instagram.com/candylink_official" target="_blank" class="social-icon instagram"><i class="fab fa-instagram"></i></a>
            <a href="https://t.me/candylink6" target="_blank" class="social-icon telegram"><i class="fab fa-telegram-plane"></i></a>
            <a href="https://www.facebook.com/Candylinkhub" target="_blank" class="social-icon facebook"><i class="fab fa-facebook-f"></i></a>
        </div>
    `;
    container.innerHTML = footerHTML;
}


// ============================================================
// 7. LOAD SEARCH BAR
// ============================================================
function loadSearchBar() {
    const container = document.getElementById('searchContainer');
    if (!container) return;

    const searchHTML = `
        <div class="sticky-search">
            <div class="search-container">
                <input type="text" class="search-box" id="searchInput" placeholder="🔍 Search videos by ID, title or category..." autocomplete="off">
                <div id="searchResults"></div>
            </div>
        </div>
    `;
    container.innerHTML = searchHTML;
    setupSearchLogic();
}


// ============================================================
// 8. SEARCH LOGIC
// ============================================================
function setupSearchLogic() {
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


// ============================================================
// 9. MENU BUTTON INJECT (Hamburger Icon)
// ============================================================
function injectMenuButton() {
    if (document.getElementById('menuToggleBtn')) return;

    const btn = document.createElement('div');
    btn.id = 'menuToggleBtn';
    btn.innerHTML = '☰';
    btn.style.cssText = `
        position: fixed;
        top: 12px;
        left: 12px;
        z-index: 10000;
        font-size: 30px;
        color: #ff9900;
        cursor: pointer;
        background: rgba(0,0,0,0.7);
        padding: 2px 14px;
        border-radius: 8px;
        border: 1px solid #ff6600;
        user-select: none;
        line-height: 1.4;
    `;
    btn.onclick = function(e) {
        e.stopPropagation();
        openMenu();
    };
    document.body.prepend(btn);
}


// ============================================================
// 10. INITIALIZE
// ============================================================
function initCommon() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCommon);
        return;
    }

    loadHeader();
    loadFooter();
    loadSearchBar();
    loadSideMenu();
    injectMenuButton();  // ✅ Menu button har page pe inject hoga

    console.log('✅ Common.js loaded successfully!');
}

initCommon();
