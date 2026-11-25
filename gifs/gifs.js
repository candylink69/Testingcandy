// ============================================================
// GIFS.JS - Main logic (render, filter, pagination, lightbox, search)
// ============================================================

const GIFS_PER_PAGE = 20;
let currentGifPage = 1;
let currentGifCategory = null;
let filteredGifs = [];

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : (m === '<' ? '&lt;' : '&gt;'));
}

// ========== INIT ==========
function initGifs() {
    if (typeof gifsData === 'undefined' || !Array.isArray(gifsData)) {
        document.getElementById('gifGrid').innerHTML = '<p class="no-gifs-msg">⚠️ GIFs data not loaded.</p>';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    currentGifCategory = urlParams.get('category') || null;
    currentGifPage = parseInt(urlParams.get('page')) || 1;

    renderCategoryPills();
    filterAndRender();
    setupGifSearch();

    document.getElementById('gifLightbox').addEventListener('click', function(e) {
        if (e.target === this) closeGifLightbox();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeGifLightbox(); });

    window.addEventListener('popstate', () => {
        const p = new URLSearchParams(window.location.search);
        currentGifCategory = p.get('category') || null;
        currentGifPage = parseInt(p.get('page')) || 1;
        renderCategoryPills();
        filterAndRender();
    });
}

// ========== CATEGORY PILLS ==========
function renderCategoryPills() {
    const container = document.getElementById('gifCategoryPills');
    if (!container) return;
    let html = `<span class="gif-pill ${!currentGifCategory ? 'active' : ''}" onclick="selectGifCategory(null)">All</span>`;
    gifCategories.forEach(cat => {
        const active = currentGifCategory === cat.id ? 'active' : '';
        html += `<span class="gif-pill ${active}" onclick="selectGifCategory('${cat.id}')">${cat.name}</span>`;
    });
    container.innerHTML = html;
}

function selectGifCategory(catId) {
    currentGifCategory = catId;
    currentGifPage = 1;
    const url = new URL(window.location);
    if (catId) url.searchParams.set('category', catId);
    else url.searchParams.delete('category');
    url.searchParams.delete('page');
    window.history.pushState({}, '', url);
    renderCategoryPills();
    filterAndRender();
    const catName = catId ? (gifCategories.find(c => c.id === catId)?.name || catId) : 'All GIFs';
    document.getElementById('pageTitle').textContent = `🎞️ ${catName} 🎞️`;
    document.getElementById('currentCategory').textContent = catName;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== FILTER & RENDER ==========
function filterAndRender() {
    filteredGifs = !currentGifCategory
        ? [...gifsData]
        : gifsData.filter(g => g.categories && g.categories.includes(currentGifCategory));
    renderGifPage();
}

function renderGifPage() {
    const container = document.getElementById('gifGrid');
    const paginationContainer = document.getElementById('paginationContainer');
    if (!container) return;

    const totalPages = Math.ceil(filteredGifs.length / GIFS_PER_PAGE) || 1;
    if (currentGifPage > totalPages) currentGifPage = totalPages;

    const start = (currentGifPage - 1) * GIFS_PER_PAGE;
    const pageGifs = filteredGifs.slice(start, start + GIFS_PER_PAGE);

    if (pageGifs.length === 0) {
        container.innerHTML = '<p class="no-gifs-msg">😔 No GIFs available in this category yet.</p>';
        paginationContainer.innerHTML = '';
        return;
    }

    container.innerHTML = pageGifs.map(generateGifCard).join('');

    container.querySelectorAll('.gif-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.getAttribute('data-gif-id');
            const gif = gifsData.find(g => g.id === id);
            if (gif) openGifLightbox(gif);
        });
    });

    renderPagination(totalPages);
}

function generateGifCard(gif) {
    const title = gif.title ? escapeHtml(gif.title) : gif.id;
    const thumb = gif.thumb || 'https://via.placeholder.com/320x180?text=GIF';
    const catHtml = gif.categories && gif.categories.length
        ? `<div class="video-categories">${gif.categories.map(catId => {
            const cat = gifCategories.find(c => c.id === catId);
            const catName = cat ? cat.name : catId;
            return `<span class="category-tag" onclick="event.stopPropagation(); selectGifCategory('${catId}')">${catName}</span>`;
        }).join('')}</div>`
        : '';

    return `
        <div class="gif-card" data-gif-id="${gif.id}">
            <div class="thumb-container">
                <img class="thumb-img" src="${thumb}" alt="${title}" loading="lazy" onerror="this.src='https://via.placeholder.com/320x180?text=No+Thumb'">
                <div class="gif-play-badge">▶ GIF</div>
            </div>
            <div class="video-title left">
                <span class="vid-id">${escapeHtml(gif.id)}:-</span> ${title}
            </div>
            ${catHtml}
        </div>
    `;
}

// ========== PAGINATION ==========
function renderPagination(totalPages) {
    const container = document.getElementById('paginationContainer');
    if (!container || totalPages <= 1) { container.innerHTML = ''; return; }

    const catParam = currentGifCategory ? `category=${currentGifCategory}&` : '';
    let html = '';

    if (currentGifPage > 1) html += `<a href="?${catParam}page=${currentGifPage - 1}" onclick="gifPageGo(${currentGifPage - 1}); return false;">« Prev</a>`;

    const maxVisible = 5;
    let start = Math.max(1, currentGifPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    if (start > 1) {
        html += `<a href="?${catParam}page=1" onclick="gifPageGo(1); return false;">1</a>`;
        if (start > 2) html += `<span>...</span>`;
    }
    for (let i = start; i <= end; i++) {
        if (i === currentGifPage) html += `<span>${i}</span>`;
        else html += `<a href="?${catParam}page=${i}" onclick="gifPageGo(${i}); return false;">${i}</a>`;
    }
    if (end < totalPages) {
        if (end < totalPages - 1) html += `<span>...</span>`;
        html += `<a href="?${catParam}page=${totalPages}" onclick="gifPageGo(${totalPages}); return false;">${totalPages}</a>`;
    }
    if (currentGifPage < totalPages) html += `<a href="?${catParam}page=${currentGifPage + 1}" onclick="gifPageGo(${currentGifPage + 1}); return false;">Next »</a>`;

    container.innerHTML = html;
}

function gifPageGo(page) {
    currentGifPage = page;
    const url = new URL(window.location);
    if (page > 1) url.searchParams.set('page', page);
    else url.searchParams.delete('page');
    window.history.pushState({}, '', url);
    renderGifPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== LIGHTBOX ==========
function openGifLightbox(gif) {
    const content = document.getElementById('gifLightboxContent');
    const info = document.getElementById('gifLightboxInfo');

    let embedHtml = '';
    const e = gif.embed || '';
    if (e.includes('<iframe')) {
        embedHtml = e;
    } else if (e.includes('giphy.com/embed') || e.includes('tenor.com/embed') || e.includes('youtube.com/embed') || e.includes('redgifs')) {
        embedHtml = `<iframe src="${e}" allowfullscreen frameborder="0"></iframe>`;
    } else if (e.match(/\.(mp4|webm)(\?|$)/i)) {
        embedHtml = `<video src="${e}" autoplay loop muted playsinline controls></video>`;
    } else if (e.match(/\.gif(\?|$)/i) || e.startsWith('http')) {
        embedHtml = `<img src="${e}" alt="${escapeHtml(gif.title || '')}">`;
    } else {
        embedHtml = `<img src="${gif.thumb}" alt="${escapeHtml(gif.title || '')}">`;
    }

    content.innerHTML = embedHtml;
    let infoHtml = `<div class="gif-title">${escapeHtml(gif.title || gif.id)}</div>`;
    if (gif.source) infoHtml += `<div class="gif-source">Source: <a href="${gif.source}" target="_blank" rel="noopener">${escapeHtml(gif.source)}</a></div>`;
    info.innerHTML = infoHtml;

    document.getElementById('gifLightbox').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeGifLightbox() {
    document.getElementById('gifLightbox').classList.remove('open');
    document.getElementById('gifLightboxContent').innerHTML = '';
    document.body.style.overflow = '';
}

// ========== SEARCH ==========
function setupGifSearch() {
    const input = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');
    if (!input || !results) return;

    input.addEventListener('input', function() {
        const q = this.value.toLowerCase().trim();
        if (q.length < 2) { results.style.display = 'none'; return; }
        const matches = gifsData.filter(g =>
            g.id.toLowerCase().includes(q) ||
            (g.title && g.title.toLowerCase().includes(q)) ||
            (g.categories && g.categories.some(c => c.toLowerCase().includes(q)))
        );
        if (matches.length === 0) {
            results.innerHTML = `<div class="search-result-item" style="color:#888">No GIFs found</div>`;
            results.style.display = 'block';
            return;
        }
        results.innerHTML = matches.slice(0, 10).map(g => `
            <div class="search-result-item" onclick="gifSearchOpen('${g.id}')">
                <div class="search-video-id">${escapeHtml(g.id)}</div>
                ${g.title ? `<div class="search-video-title" style="color:#ccc;font-size:12px;">${escapeHtml(g.title).substring(0, 50)}</div>` : ''}
            </div>
        `).join('');
        results.style.display = 'block';
    });

    document.addEventListener('click', e => {
        if (!input.contains(e.target) && !results.contains(e.target)) results.style.display = 'none';
    });
}

function gifSearchOpen(id) {
    const gif = gifsData.find(g => g.id === id);
    if (gif) {
        document.getElementById('searchResults').style.display = 'none';
        openGifLightbox(gif);
    }
}

// ========== BOOT ==========
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initGifs);
else initGifs();
