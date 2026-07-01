// ============================================================
// 1. IN-APP BROWSER REDIRECT (Instagram, Telegram,js Facebook)
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
// 2. GLOBAL FUNCTION: goToVideo (Video page pe le jaaye)
// ============================================================
function goToVideo(videoId) {
    window.location.href = 'video.html?v=' + videoId;
}


// ============================================================
// 3. GLOBAL FUNCTION: goToCategory (Category list pe le jaaye)
// ============================================================
function goToCategory(categoryId) {
    window.location.href = 'list.html?category=' + categoryId;
}


// ============================================================
// 4. GLOBAL FUNCTION: goToPage (Internal navigation)
// ============================================================
function goToPage(url) {
    window.location.href = url;
}


// ============================================================
// 5. SIDE MENU FUNCTIONS
// ============================================================
function openMenu() {
    document.getElementById('menuOverlay').style.display = 'block';
    document.getElementById('menuDrawer').classList.add('open');
    document.body.style.overflow = 'hidden'; // scroll band
}

function closeMenu() {
    document.getElementById('menuOverlay').style.display = 'none';
    document.getElementById('menuDrawer').classList.remove('open');
    document.body.style.overflow = '';
}

// Escape key se menu band
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeMenu();
});


// ============================================================
// 6. LOAD SIDE MENU HTML + CATEGORIES
// ============================================================
function loadSideMenu() {
    // --- Menu HTML Structure ---
    const menuHTML = `
        <div id="menuOverlay" onclick="closeMenu()"></div>
        <div id="menuDrawer">
            <div id="menuHeader">
                <span class="menu-logo">🍬 CandyLink69</span>
                <span class="menu-close" onclick="closeMenu()">✕</span>
            </div>
            <ul id="menuNav">
                <li><a href="index.html" class="menu-link active-link" data-page="index">🏠 Home</a></li>
                <li><a href="javascript:void(0)" onclick="switchTab('latest')" class="menu-link" data-page="latest">🔥 Latest</a></li>
                <li><a href="javascript:void(0)" onclick="switchTab('categories')" class="menu-link" data-page="categories">📂 Categories</a></li>
                <li><a href="javascript:void(0)" onclick="switchTab('trending')" class="menu-link" data-page="trending">⚡ Trending</a></li>
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

    // Menu ko DOM mein daalo
    const menuContainer = document.getElementById('sideMenu');
    if (menuContainer) {
        menuContainer.innerHTML = menuHTML;
    }

    // --- Categories load karo (categories.json se) ---
    fetch('categories.json')
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

    // --- Active link highlight (current page ke hisaab se) ---
    highlightActiveMenu();
}

// Menu mein active link highlight
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
// 7. LOAD HEADER (Title + Social Icons)
// ============================================================
function loadHeader() {
    const container = document.getElementById('headerContainer');
    if (!container) return;

    const isVideoPage = window.location.pathname.includes('video.html');
    const isListPage = window.location.pathname.includes('list.html');

    // Agar video.html hai toh title alag hai (but common.js sirf structure dega, baaki video.js sambhalega)
    // Isliye sirf social aur base title rakhte hain, full title page specific JS se load hoga
    // Lekin user ne kaha purana structure bilkul waise hi rakhna hai.
    // Index wala title "🔥 CandyLink69 🔥", List wala "🔥 CandyLink69 Exclusive Videos 🔥", Video wala "🔥 CandyLink69 🔥"
    // Isliye common.js sirf social icons + common elements dega, title index.html mein already defined hai.
    // Actually index.html mein .title div pehle se hai, social-text aur social-row bhi.
    // Toh main yeh sab replace nahi karunga, sirf menu + search load karunga.
    // Let's just keep it simple: Header container mein sirf social icons + text daalo.
    // Title already HTML mein static hai, isliye usko touch nahi karte.
    
    // Wait, index.html mein maine <div id="headerContainer"></div> rakha hai.
    // Isme title + social + text aayega.
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
// 8. LOAD FOOTER SOCIAL (Bottom Social)
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
// 9. LOAD SEARCH BAR
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

    // Search functionality attach karo (after DOM render)
    setupSearchLogic();
}


// ============================================================
// 10. SEARCH LOGIC (Bilkul purana wala)
// ============================================================
function setupSearchLogic() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        const resultsDiv = searchResults;

        if (query.length < 2) {
            resultsDiv.style.display = 'none';
            return;
        }

        // Check if videos array exists (data.js se aayega)
        if (typeof videos === 'undefined' || !videos.length) {
            resultsDiv.innerHTML = '<div style="padding:15px;color:#888;">Loading videos...</div>';
            resultsDiv.style.display = 'block';
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
            resultsDiv.innerHTML = '<div style="padding:15px;color:#888;">No videos found</div>';
            resultsDiv.style.display = 'block';
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
        resultsDiv.innerHTML = html;
        resultsDiv.style.display = 'block';
    });

    // Click outside search results to close
    document.addEventListener('click', function(e) {
        const container = document.querySelector('.search-container');
        if (container && !container.contains(e.target)) {
            if (searchResults) searchResults.style.display = 'none';
        }
    });
}


// ============================================================
// 11. EXTRA: Menu button inject karna (Hamburger icon)
//    Note: Ye main container mein menu icon add karega.
//    Index.html mein maine <div id="sideMenu"></div> rakha hai, jisme menu drawer aayega.
//    But menu open karne ke liye ek button chahiye.
//    Isliye main header ke andar ek hamburger icon inject karunga.
// ============================================================
function injectMenuButton() {
    // Check agar pehle se hai toh mat daalo
    if (document.getElementById('menuToggleBtn')) return;

    const header = document.getElementById('headerContainer');
    if (!header) return;

    // Pehle se .title div hai, uske ANDAR ya USKE PEHLE menu button daalo.
    // Better: header ke top pe daalo.
    const btn = document.createElement('div');
    btn.id = 'menuToggleBtn';
    btn.innerHTML = '☰';
    btn.style.cssText = `
        position: fixed;
        top: 12px;
        left: 12px;
        z-index: 1001;
        font-size: 28px;
        color: #ff9900;
        cursor: pointer;
        background: rgba(0,0,0,0.7);
        padding: 4px 12px;
        border-radius: 8px;
        border: 1px solid #ff6600;
        user-select: none;
        line-height: 1.4;
    `;
    btn.onclick = function(e) {
        e.stopPropagation();
        openMenu();
    };

    // Agar body ke top mein daalo
    document.body.prepend(btn);

    // Ensure ki menu icon sticky rahe (position fixed already)
}


// ============================================================
// 12. INITIALIZE ALL COMMON COMPONENTS
// ============================================================
function initCommon() {
    // Pehle check karo ki DOM ready hai
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCommon);
        return;
    }

    // 1. Header load karo
    loadHeader();

    // 2. Footer load karo
    loadFooter();

    // 3. Search bar load karo
    loadSearchBar();

    // 4. Side menu load karo (categories ke saath)
    loadSideMenu();

    // 5. Menu toggle button inject karo
    injectMenuButton();

    // 6. Agar index.html hai toh switchTab function globally available hai (index.js se)
    // Agar list.html ya video.html hai toh wahan specific JS handle karega.
    console.log('✅ Common.js loaded successfully!');
}

// Ab init call karo
initCommon();
