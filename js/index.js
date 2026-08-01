// ============================================================
// INDEX.JS - Original Logic (Tabs, Grid, Pagination, Stats, Swipe)
// ============================================================

let allCategories = [];
let reversedVideos = [];
let latestCurrentPage = 1;
const LATEST_PER_PAGE = 20;
const AD_AFTER_EVERY = 5;
const SWIPE_THRESHOLD = 80;
let touchStartX = 0, touchStartY = 0;
let currentTab = 'latest';

// ========== THUMBNAIL SAFE ==========
function getThumbnailUrlSafe(videoId) {
    if (typeof getThumbnailUrl === 'function') {
        return getThumbnailUrl(videoId);
    }
    return `https://via.placeholder.com/320x180?text=${videoId}`;
}

// ========== ESCAPE HTML ==========
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : (m === '<' ? '&lt;' : '&gt;')).substring(0, 80);
}

function generateVideoCard(video) {
    // Categories ko HTML mein convert karo
    let categoriesHtml = '';
    if (video.categories && Array.isArray(video.categories) && video.categories.length) {
        categoriesHtml = `<div class="video-categories">`;
        video.categories.forEach(catId => {
            // Category name fetch karo (categories.json se)
            const cat = allCategories.find(c => c.id === catId);
            const catName = cat ? cat.name : catId;
            categoriesHtml += `<span class="category-tag" onclick="event.stopPropagation(); goToCategory('${catId}')">${catName}</span>`;
        });
        categoriesHtml += `</div>`;
    }

    return `
    <div class="latest-card" data-video-id="${video.id}">
        <div class="thumb-container">
            <img class="thumb-img" src="${getThumbnailUrlSafe(video.id)}" loading="lazy" onerror="this.src='https://via.placeholder.com/320x180?text=No+Thumb'">
            ${video.preview ? `<video class="preview-video" muted loop playsinline preload="none" data-src="${video.preview}"></video>` : ''}
            ${video.duration ? `<div class="duration">${video.duration}</div>` : ''}
        </div>
        <div class="latest-info">
            <div class="latest-id">${escapeHtml(video.id)}</div>
            ${video.title ? `<div class="latest-title">${escapeHtml(video.title)}</div>` : ''}
            ${categoriesHtml}
        </div>
    </div>`;
}

// ========== PREVIEW HANDLERS ==========
let currentActivePreview = null;
function stopPreview() {
    if (currentActivePreview) {
        const container = currentActivePreview.querySelector('.thumb-container');
        const previewVideo = container?.querySelector('.preview-video');
        const thumbImg = container?.querySelector('.thumb-img');
        if (previewVideo) { previewVideo.pause(); previewVideo.style.display = 'none'; }
        if (thumbImg) thumbImg.style.opacity = '1';
        currentActivePreview = null;
    }
}
function startPreview(card) {
    stopPreview();
    const container = card.querySelector('.thumb-container');
    const previewVideo = container?.querySelector('.preview-video');
    const thumbImg = container?.querySelector('.thumb-img');
    if (!previewVideo) return;
    if (!previewVideo.src && previewVideo.dataset.src) {
        previewVideo.src = previewVideo.dataset.src;
        previewVideo.load();
    }
    previewVideo.currentTime = 0;
    previewVideo.style.display = 'block';
    previewVideo.play().catch(e => console.log('Preview play failed:', e));
    if (thumbImg) thumbImg.style.opacity = '0.3';
    currentActivePreview = card;
}
function setupPreviewHandlers() {
    const container = document.getElementById('latestDynamicGrid');
    if (!container) return;
    container.removeEventListener('mouseover', handlePreviewMouseOver);
    container.removeEventListener('mouseout', handlePreviewMouseOut);
    container.addEventListener('mouseover', handlePreviewMouseOver);
    container.addEventListener('mouseout', handlePreviewMouseOut);
    container.removeEventListener('touchstart', handlePreviewTouchStart);
    container.removeEventListener('touchend', handlePreviewTouchEnd);
    container.addEventListener('touchstart', handlePreviewTouchStart, { passive: true });
    container.addEventListener('touchend', handlePreviewTouchEnd);
}
function handlePreviewMouseOver(e) {
    const card = e.target.closest('.latest-card');
    if (card) startPreview(card);
}
function handlePreviewMouseOut(e) {
    const card = e.target.closest('.latest-card');
    if (card && currentActivePreview === card) stopPreview();
}
let previewTouchTimer = null;
function handlePreviewTouchStart(e) {
    const card = e.target.closest('.latest-card');
    if (card) previewTouchTimer = setTimeout(() => startPreview(card), 100);
}
function handlePreviewTouchEnd(e) {
    if (previewTouchTimer) { clearTimeout(previewTouchTimer); previewTouchTimer = null; }
    const card = e.target.closest('.latest-card');
    if (card && currentActivePreview === card) setTimeout(() => { if (currentActivePreview === card) stopPreview(); }, 300);
}

// ========== RENDER LATEST ==========
function renderLatestPage(pageNum, scrollToTop = true) {
    const container = document.getElementById('latestDynamicGrid');
    if (!container) return;
    if (!reversedVideos.length) {
        container.innerHTML = '<div class="no-videos-msg">✨ No videos available yet.</div>';
        document.getElementById('latestPaginationTop').innerHTML = '';
        document.getElementById('latestPaginationBottom').innerHTML = '';
        return;
    }
    const totalPages = Math.ceil(reversedVideos.length / LATEST_PER_PAGE);
    if (pageNum < 1) pageNum = 1;
    if (pageNum > totalPages) pageNum = totalPages;
    latestCurrentPage = pageNum;
    const start = (pageNum - 1) * LATEST_PER_PAGE;
    const pageVideos = reversedVideos.slice(start, start + LATEST_PER_PAGE);
    
    let itemsHtml = [];
    const adSlots = [];
    for (let idx = 0; idx < pageVideos.length; idx++) {
        itemsHtml.push(generateVideoCard(pageVideos[idx]));
        if ((idx + 1) % AD_AFTER_EVERY === 0 && idx + 1 < pageVideos.length) {
            const adId = `inline_ad_${Date.now()}_${idx}_${Math.random()}`;
            itemsHtml.push(`<div class="ad-inline" id="${adId}"></div>`);
            adSlots.push(adId);
        }
    }
    container.innerHTML = `<div class="latest-video-row">${itemsHtml.join('')}</div>`;
    adSlots.forEach(adId => {
        const el = document.getElementById(adId);
        if (el && typeof loadInlineAd === 'function') loadInlineAd(adId);
    });
    
    document.querySelectorAll('#latestDynamicGrid .latest-card').forEach(card => {
        const videoId = card.getAttribute('data-video-id');
        if (videoId) {
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                stopPreview();
                goToVideo(videoId);
            });
        }
    });
    updatePaginationControls(totalPages, pageNum);
    setupPreviewHandlers();
    if (scrollToTop) window.scrollTo({ top: 0, behavior: 'instant' });
}

function updatePaginationControls(totalPages, currentPage) {
    const topDiv = document.getElementById('latestPaginationTop');
    const bottomDiv = document.getElementById('latestPaginationBottom');
    if (totalPages <= 1) {
        if (topDiv) topDiv.innerHTML = '';
        if (bottomDiv) bottomDiv.innerHTML = '';
        return;
    }
    let paginationHtml = '';
    paginationHtml += `<button class="pagination-btn" id="prevPageBtn" ${currentPage === 1 ? 'disabled' : ''}>◀ PREV</button>`;
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) { startPage = Math.max(1, endPage - maxVisible + 1); }
    if (startPage > 1) {
        paginationHtml += `<button class="page-num" data-page="1">1</button>`;
        if (startPage > 2) paginationHtml += `<span class="ellipsis">...</span>`;
    }
    for (let i = startPage; i <= endPage; i++) {
        paginationHtml += `<button class="page-num ${i === currentPage ? 'active-page' : ''}" data-page="${i}">${i}</button>`;
    }
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) paginationHtml += `<span class="ellipsis">...</span>`;
        paginationHtml += `<button class="page-num" data-page="${totalPages}">${totalPages}</button>`;
    }
    paginationHtml += `<button class="pagination-btn" id="nextPageBtn" ${currentPage === totalPages ? 'disabled' : ''}>NEXT ▶</button>`;
    
    if (topDiv) topDiv.innerHTML = paginationHtml;
    if (bottomDiv) bottomDiv.innerHTML = paginationHtml;
    
    const attachEvents = (wrapper) => {
        if (!wrapper) return;
        const prevBtn = wrapper.querySelector('#prevPageBtn');
        const nextBtn = wrapper.querySelector('#nextPageBtn');
        if (prevBtn) prevBtn.onclick = () => { if (latestCurrentPage > 1) renderLatestPage(latestCurrentPage - 1, true); };
        if (nextBtn) nextBtn.onclick = () => { if (latestCurrentPage < totalPages) renderLatestPage(latestCurrentPage + 1, true); };
        wrapper.querySelectorAll('.page-num').forEach(btn => {
            btn.onclick = () => {
                const page = parseInt(btn.getAttribute('data-page'));
                if (!isNaN(page) && page !== latestCurrentPage) renderLatestPage(page, true);
            };
        });
    };
    if (topDiv) attachEvents(topDiv);
    if (bottomDiv) attachEvents(bottomDiv);
}

// ========== CATEGORIES ==========
async function loadCategories() {
    try {
        const res = await fetch('data/categories.json');
        allCategories = await res.json();
        if (videos) allCategories.forEach(cat => cat.videoCount = videos.filter(v => v.categories?.includes(cat.id)).length);
        displayCategories(allCategories);
    } catch(e) {
        allCategories = createDefaultCategories();
        displayCategories(allCategories);
    }
    updateStatsBar();
}
function createDefaultCategories() {
    const map = {};
    if (videos) videos.forEach(v => {
        if (Array.isArray(v.categories)) v.categories.forEach(c => {
            if (!map[c]) map[c] = { id: c, name: c[0].toUpperCase()+c.slice(1), thumbnail: `Thumbs/${v.id}.webp`, videoCount: 0 };
        });
    });
    Object.keys(map).forEach(c => map[c].videoCount = videos.filter(v => v.categories?.includes(c)).length);
    if (Object.keys(map).length) return Object.values(map);
    return [{ id: 'indian', name: '🇮🇳 Indian', thumbnail: 'Thumbs/HM001.webp', videoCount: videos?.length || 0 }];
}
function displayCategories(cats) {
    const cont = document.getElementById('categoriesContainer');
    if (!cont) return;
    cont.innerHTML = '';
    cats.forEach(cat => {
        const cnt = videos?.filter(v => v.categories?.includes(cat.id)).length || 0;
        cont.innerHTML += `<div class="category-card" onclick="goToCategory('${cat.id}')">
            <img src="${cat.thumbnail}" class="category-thumb" loading="lazy" onerror="this.src='https://via.placeholder.com/320x180?text=No+Image'">
            <div class="video-count">${cnt} videos</div>
            <div class="category-name">${cat.name}</div>
        </div>`;
    });
}

// ========== TRENDING ==========
function loadTrendingVideos() {
    const cont = document.getElementById('trendingContainer');
    if (!cont) return;
    cont.innerHTML = '';
    const trendingIds = ["Movie006","Movie005","HM002","D001"];
    const trendingVideos = videos?.filter(v => trendingIds.includes(v.id)) || [];
    // Native ad card
    const nativeCard = document.createElement('div');
    nativeCard.className = 'native-trending-card';
    const nativeInner = document.createElement('div');
    nativeInner.className = 'native-thumb';
    nativeInner.id = `native_trending_${Date.now()}`;
    nativeCard.appendChild(nativeInner);
    const titleDiv = document.createElement('div');
    titleDiv.className = 'native-title';
    titleDiv.textContent = 'Sponsored';
    nativeCard.appendChild(titleDiv);
    cont.appendChild(nativeCard);
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://encyclopediainsoluble.com/4b10501c070917e2ceca3f13f9e60117/invoke.js';
    nativeInner.appendChild(script);
    const adDiv = document.createElement('div');
    adDiv.id = 'container-4b10501c070917e2ceca3f13f9e60117';
    adDiv.style.width = '100%';
    adDiv.style.minHeight = '200px';
    nativeInner.appendChild(adDiv);
    
    trendingVideos.forEach(v => {
        const thumb = getThumbnailUrlSafe(v.id);
        cont.innerHTML += `<div class="trending-item" onclick="goToVideo('${v.id}')">
            <img src="${thumb}" class="trending-thumb" onerror="this.src='https://via.placeholder.com/200x120?text=No+Thumb'">
            <div class="trending-title">${v.id}</div>
        </div>`;
    });
}

// ========== STATS ==========
function updateStatsBar() {
    const sb = document.getElementById('statsBar');
    if (!sb) return;
    const totalVideos = videos?.length || 0;
    const totalCategories = allCategories?.length || 0;
    const trendingCount = Math.min(4, videos?.length || 0);
    if (currentTab === 'latest') {
        sb.innerHTML = `<div class="stat-item"><div class="stat-number">${totalVideos}</div><div class="stat-label">Total Videos</div></div>
                        <div class="stat-item"><div class="stat-number">${totalCategories}</div><div class="stat-label">Categories</div></div>
                        <div class="stat-item"><div class="stat-number">${trendingCount}</div><div class="stat-label">Trending</div></div>`;
    } else if (currentTab === 'categories') {
        sb.innerHTML = `<div class="stat-item"><div class="stat-number">${totalCategories}</div><div class="stat-label">Total Categories</div></div>`;
    } else {
        sb.innerHTML = `<div class="stat-item"><div class="stat-number">${trendingCount}</div><div class="stat-label">Trending Videos</div></div>`;
    }
}

// ========== TAB SWITCHING ==========
function switchTab(tabId) {
    currentTab = tabId;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    document.getElementById('latestPanel').classList.toggle('active-panel', tabId === 'latest');
    document.getElementById('categoriesPanel').classList.toggle('active-panel', tabId === 'categories');
    document.getElementById('trendingPanel').classList.toggle('active-panel', tabId === 'trending');
    updateStatsBar();
    if (tabId === 'latest' && reversedVideos.length && !document.getElementById('latestDynamicGrid').innerHTML) {
        renderLatestPage(1, false);
    }
    if (tabId === 'categories' && allCategories.length) {
        displayCategories(allCategories);
    }
    if (tabId === 'trending') {
        loadTrendingVideos();
    }
    // Close menu if open (for menu bar integration)
    if (typeof closeMenu === 'function') closeMenu();
}

// ========== SEARCH ==========
function setupSearch() {
    const input = document.getElementById('searchInput');
    const resultsDiv = document.getElementById('searchResults');
    if (!input) return;
    input.addEventListener('input', function() {
        const q = this.value.toLowerCase().trim();
        if (q.length < 2) { resultsDiv.style.display = 'none'; return; }
        if (!videos) return;
        const filtered = videos.filter(v => v.id.toLowerCase().includes(q) || (v.title && v.title.toLowerCase().includes(q)) || (v.categories && v.categories.some(c => c.toLowerCase().includes(q))));
        if (filtered.length === 0) {
            resultsDiv.innerHTML = '<div style="padding:15px;">No videos found</div>';
            resultsDiv.style.display = 'block';
            return;
        }
        let html = '';
        filtered.forEach(v => {
            html += `<div class="search-result-item" onclick="goToVideo('${v.id}')">
                        <div class="search-video-id">${v.id}</div>
                        ${v.title ? `<div class="search-video-title">${escapeHtml(v.title)}</div>` : ''}
                    </div>`;
        });
        resultsDiv.innerHTML = html;
        resultsDiv.style.display = 'block';
    });
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !resultsDiv.contains(e.target)) resultsDiv.style.display = 'none';
    });
}

// ========== SWIPE (IGNORE VERTICAL) ==========
function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}
function handleTouchEnd(e) {
    const diffX = e.changedTouches[0].screenX - touchStartX;
    const diffY = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(diffY) > Math.abs(diffX)) return;
    if (Math.abs(diffX) < SWIPE_THRESHOLD) return;
    const tabs = ['latest', 'categories', 'trending'];
    const idx = tabs.indexOf(currentTab);
    if (diffX > 0 && idx > 0) switchTab(tabs[idx-1]);
    else if (diffX < 0 && idx < tabs.length-1) switchTab(tabs[idx+1]);
}

// ========== GLOBALS (Menu Support) ==========
function goToVideo(id) { 
    window.location.href = 'video.html?v=' + id; 
}
function goToCategory(id) { 
    window.location.href = 'list.html?category=' + id; 
}

// ========== INIT ==========
function initIndex() {
    if (typeof videos !== 'undefined' && videos && videos.length) {
        reversedVideos = [...videos].reverse();
        loadCategories();
        loadTrendingVideos();
        setupSearch();
        renderLatestPage(1, false);
        updateStatsBar();
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
        });
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });
    } else {
        // Retry logic
        setTimeout(initIndex, 500);
    }
}

// Document ready pe init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIndex);
} else {
    initIndex();
        }
