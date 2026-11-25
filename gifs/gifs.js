// ============================================================
// GIFS.JS - Home + Section (Latest/Categories tabs, swipe)
// ============================================================

const GIFS_PER_PAGE = 20;
let allGifCategories = { captioned: [], normal: [] };
let currentType = null;            // 'captioned' | 'normal' | null
let currentCategory = null;
let currentPage = 1;
let currentTab = 'latest';
let filteredGifs = [];
let homeLoaded = 0;
let touchStartX = 0, touchStartY = 0;
const SWIPE_THRESHOLD = 80;

// ========== HELPERS ==========
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
}

async function loadCategories() {
    try {
        const res = await fetch('categories.json');
        allGifCategories = await res.json();
    } catch (e) {
        allGifCategories = { captioned: [], normal: [] };
    }
}

function getCategoryName(type, catId) {
    const list = allGifCategories[type] || [];
    const cat = list.find(c => c.id === catId);
    return cat ? cat.name : catId;
}

function goToView(id, type) {
    // return url save karo taaki view page se back aasake
    sessionStorage.setItem('gifsReturnUrl', window.location.href);
    window.location.href = `view.html?id=${encodeURIComponent(id)}&from=${type || ''}`;
}

// ========== MASONRY ==========
function adjustMasonryItem(item) {
    const img = item.querySelector('.gif-thumb');
    if (!img) return;

    const apply = () => {
        const cardWidth = item.offsetWidth;
        if (!cardWidth) return;

        let imgH = 0;
        if (img.naturalWidth && img.naturalHeight) {
            imgH = cardWidth * (img.naturalHeight / img.naturalWidth);
        }
        if (!imgH) return;

        const infoH = item.querySelector('.gif-info')?.offsetHeight || 0;
        const totalH = imgH + infoH;
        const unit = 20; // 10px row + 10px gap
        const span = Math.max(1, Math.ceil((totalH + 10) / unit));
        item.style.gridRowEnd = `span ${span}`;
    };

    if (img.complete && img.naturalWidth) {
        img.classList.add('loaded');
        apply();
    } else {
        img.addEventListener('load', () => {
            img.classList.add('loaded');
            apply();
        }, { once: true });
        // Fallback for gifs that never fire load
        setTimeout(apply, 1500);
    }
}

function applyMasonry(gridEl) {
    if (!gridEl) return;
    gridEl.querySelectorAll('.masonry-item').forEach(adjustMasonryItem);
}

// ========== CARD HTML ==========
function gifCardHtml(gif) {
    const title = escapeHtml(gif.title || gif.id);
    const thumb = gif.thumb || gif.url;
    const aspect = (gif.width && gif.height)
        ? `style="aspect-ratio:${gif.width}/${gif.height}"`
        : '';
    return `
        <a href="view.html?id=${encodeURIComponent(gif.id)}&from=${gif.type}" 
           class="masonry-item" 
           data-gif-id="${escapeHtml(gif.id)}"
           data-gif-type="${escapeHtml(gif.type)}">
            <img class="gif-thumb" src="${escapeHtml(thumb)}" alt="${title}"
                 loading="lazy" ${aspect}
                 onerror="this.src='https://via.placeholder.com/320x320?text=GIF'">
            <div class="gif-info">${title}</div>
        </a>
    `;
}

function bindCardClicks(container) {
    container.querySelectorAll('.masonry-item').forEach(card => {
        card.addEventListener('click', () => {
            sessionStorage.setItem('gifsReturnUrl', window.location.href);
        });
    });
}

// ========== HOME VIEW ==========
function renderHome() {
    const grid = document.getElementById('homeMixedGrid');
    if (!grid) return;

    // shuffle-lite: alternate captioned/normal for visual variety
    const captioned = gifsData.filter(g => g.type === 'captioned');
    const normal = gifsData.filter(g => g.type === 'normal');
    const mixed = [];
    let i = 0, j = 0;
    while (i < captioned.length || j < normal.length) {
        if (i < captioned.length) mixed.push(captioned[i++]);
        if (j < normal.length) mixed.push(normal[j++]);
    }

    const slice = mixed.slice(0, homeLoaded + GIFS_PER_PAGE);
    homeLoaded = slice.length;

    grid.innerHTML = slice.map(gifCardHtml).join('') ||
        '<p class="no-gifs-msg">😔 No GIFs available yet.</p>';
    bindCardClicks(grid);
    applyMasonry(grid);

    const btn = document.getElementById('homeLoadMoreBtn');
    if (btn) {
        if (homeLoaded >= mixed.length) btn.style.display = 'none';
        else btn.style.display = 'inline-block';
    }
}

function loadMoreHome() {
    renderHome();
    window.scrollTo({ top: document.body.scrollHeight - window.innerHeight - 100, behavior: 'smooth' });
}

// ========== SECTION VIEW ==========
function renderSection() {
    if (!currentType) return;

    const heading = document.getElementById('sectionHeading');
    heading.textContent = currentType === 'captioned'
        ? '💬 Caption GIFs'
        : '🖼️ Normal GIFs';

    document.title = (currentType === 'captioned' ? 'Caption GIFs' : 'Normal GIFs') + ' - CandyLink69';

    // filter by type and optionally by category
    filteredGifs = gifsData.filter(g => g.type === currentType);
    if (currentCategory) {
        filteredGifs = filteredGifs.filter(g =>
            g.categories && g.categories.includes(currentCategory));
    }

    renderSectionLatest();
    renderSectionCategories();
}

function renderSectionLatest() {
    const grid = document.getElementById('sectionLatestGrid');
    if (!grid) return;

    const totalPages = Math.max(1, Math.ceil(filteredGifs.length / GIFS_PER_PAGE));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * GIFS_PER_PAGE;
    const slice = filteredGifs.slice(start, start + GIFS_PER_PAGE);

    grid.innerHTML = slice.map(gifCardHtml).join('') ||
        '<p class="no-gifs-msg">😔 No GIFs in this category.</p>';
    bindCardClicks(grid);
    applyMasonry(grid);

    renderSectionPagination(totalPages);
}

function renderSectionPagination(totalPages) {
    const pag = document.getElementById('sectionPagination');
    if (!pag) return;
    if (totalPages <= 1) { pag.innerHTML = ''; return; }

    const buildBtn = (label, page, disabled, active) =>
        `<button class="page-num ${active ? 'active-page' : ''}" ${disabled ? 'disabled' : ''} onclick="gotoSectionPage(${page})">${label}</button>`;

    let html = '';
    html += `<button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="gotoSectionPage(${currentPage - 1})">◀ PREV</button>`;

    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    if (start > 1) {
        html += buildBtn('1', 1, false, false);
        if (start > 2) html += '<span class="ellipsis">...</span>';
    }
    for (let p = start; p <= end; p++) html += buildBtn(p, p, false, p === currentPage);
    if (end < totalPages) {
        if (end < totalPages - 1) html += '<span class="ellipsis">...</span>';
        html += buildBtn(totalPages, totalPages, false, false);
    }

    html += `<button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="gotoSectionPage(${currentPage + 1})">NEXT ▶</button>`;
    pag.innerHTML = html;
}

function gotoSectionPage(p) {
    currentPage = Math.max(1, p);
    renderSectionLatest();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderSectionCategories() {
    const grid = document.getElementById('sectionCategoriesGrid');
    if (!grid) return;
    const cats = allGifCategories[currentType] || [];

    if (!cats.length) {
        grid.innerHTML = '<p class="no-gifs-msg" style="grid-column:1/-1">No categories yet.</p>';
        return;
    }

    grid.innerHTML = cats.map(cat => {
        const count = gifsData.filter(g =>
            g.type === currentType && g.categories && g.categories.includes(cat.id)).length;
        return `
            <div class="category-card" onclick="selectSectionCategory('${escapeHtml(cat.id)}')">
                <div class="category-name">${escapeHtml(cat.name)}</div>
                <div class="video-count">${count} gifs</div>
            </div>
        `;
    }).join('');
}

function selectSectionCategory(catId) {
    currentCategory = (currentCategory === catId) ? null : catId;
    currentPage = 1;
    switchTab('latest');
    renderSection();
}

// ========== TABS + SWIPE ==========
function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('#gifsSectionView .tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
    });
    document.getElementById('sectionLatestPanel').classList.toggle('active-panel', tab === 'latest');
    document.getElementById('sectionCategoriesPanel').classList.toggle('active-panel', tab === 'categories');
}

function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}
function handleTouchEnd(e) {
    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(dy) > Math.abs(dx)) return;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    if (dx > 0 && currentTab === 'categories') switchTab('latest');
    else if (dx < 0 && currentTab === 'latest') switchTab('categories');
}

// ========== SEARCH (override common.js's search) ==========
function setupGifSearch() {
    const input = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');
    if (!input || !results) return;

    input.addEventListener('input', function () {
        const q = this.value.toLowerCase().trim();
        if (q.length < 2) { results.style.display = 'none'; return; }

        const pool = currentType ? gifsData.filter(g => g.type === currentType) : gifsData;
        const matches = pool.filter(g =>
            g.id.toLowerCase().includes(q) ||
            (g.title && g.title.toLowerCase().includes(q)) ||
            (g.categories && g.categories.some(c => {
                const name = getCategoryName(g.type, c).toLowerCase();
                return name.includes(q) || c.toLowerCase().includes(q);
            }))
        );

        if (!matches.length) {
            results.innerHTML = '<div class="search-result-item" style="color:#888">No GIFs found</div>';
            results.style.display = 'block';
            return;
        }
        results.innerHTML = matches.slice(0, 10).map(g => `
            <div class="search-result-item" onclick="goToView('${escapeHtml(g.id)}','${escapeHtml(g.type)}')">
                <div class="search-video-id">${escapeHtml(g.id)}</div>
                ${g.title ? `<div style="color:#ccc;font-size:12px;">${escapeHtml(g.title).substring(0, 50)}</div>` : ''}
            </div>
        `).join('');
        results.style.display = 'block';
    });

    document.addEventListener('click', e => {
        if (!input.contains(e.target) && !results.contains(e.target)) results.style.display = 'none';
    });
}

// ========== INIT ==========
async function initGifs() {
    await loadCategories();

    const params = new URLSearchParams(window.location.search);
    currentType = params.get('type');
    currentCategory = params.get('category');
    currentPage = parseInt(params.get('page')) || 1;

    if (currentType === 'captioned' || currentType === 'normal') {
        document.getElementById('gifsHomeView').style.display = 'none';
        document.getElementById('gifsSectionView').style.display = 'block';

        renderSection();
        setupGifSearch();

        // Tabs
        document.querySelectorAll('#gifsSectionView .tab-btn').forEach(btn => {
            btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
        });

        // Swipe
        document.getElementById('gifsSectionView').addEventListener('touchstart', handleTouchStart, { passive: true });
        document.getElementById('gifsSectionView').addEventListener('touchend', handleTouchEnd);

        // Resize: re-apply masonry
        window.addEventListener('resize', () => {
            applyMasonry(document.getElementById('sectionLatestGrid'));
        });
    } else {
        // Home
        document.getElementById('gifsSectionView').style.display = 'none';
        document.getElementById('gifsHomeView').style.display = 'block';

        renderHome();

        window.addEventListener('resize', () => {
            applyMasonry(document.getElementById('homeMixedGrid'));
        });

        // Home search also works
        setupGifSearch();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGifs);
} else {
    initGifs();
                            }
