// ============================================================
// VIDEO.JS - FINAL FIXED (List-Style Related Videos + Back State)
// ============================================================

const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get('v') || 'V001';

// ========== GLOBAL CATEGORIES ==========
let allCategories = [];

// ========== RELATED VIDEOS PAGINATION ==========
let relatedVideosList = [];
let relatedCurrentPage = 1;
const RELATED_PER_PAGE = 5;
const RELATED_MAX = 25;

// ========== LOAD CATEGORIES ==========
async function loadCategoriesForVideo() {
    try {
        const response = await fetch('data/categories.json');
        allCategories = await response.json();
    } catch (error) {
        console.log('Could not load categories.json');
        allCategories = [];
    }
}

// ========== ESCAPE HTML ==========
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : (m === '<' ? '&lt;' : '&gt;'));
}

// ========== BUBBLE TEXT - FIXED (Word-Level, NOT Letter-Level) ==========
function bubbleText(text) {
    if (!text) return '';
    const escaped = escapeHtml(text);
    return escaped.split(' ').map(word => {
        if (!word) return ' ';
        return `<span class="bubble-word">${word}</span>`;
    }).join(' ');
}

// ========== GENERATE CATEGORY BUTTONS ==========
function generateCategoryButtons(categoryIds) {
    if (!categoryIds || !Array.isArray(categoryIds) || !categoryIds.length) return '';
    
    let html = `<div class="video-categories" style="margin:6px 0; display:flex; flex-wrap:wrap; align-items:center; gap:6px;">`;
    html += `<span style="color:#ff9900; font-weight:bold; font-size:14px; margin-right:4px;">Tag:</span>`;
    
    categoryIds.forEach(catId => {
        const cat = allCategories.find(c => c.id === catId);
        const catName = cat ? cat.name : catId;
        html += `<span class="category-tag" onclick="event.stopPropagation(); goToCategory('${catId}')">${catName}</span>`;
    });
    html += `</div>`;
    return html;
}

// ========== THUMBNAIL SAFE ==========
function getThumbnailUrlSafe(videoId) {
    if (typeof getThumbnailUrl === 'function') {
        try {
            return getThumbnailUrl(videoId);
        } catch(e) {
            return `https://via.placeholder.com/320x180?text=${videoId}`;
        }
    }
    return `https://via.placeholder.com/320x180?text=${videoId}`;
}

// ========== RENDER RELATED VIDEOS - LIST PAGE STYLE ==========
function renderRelatedVideos() {
    const container = document.getElementById('relatedVideos');
    if (!container) return;

    if (relatedVideosList.length === 0) {
        container.innerHTML = '<p style="color:#888; padding:10px;">No other videos available.</p>';
        return;
    }

    const start = 0;
    const end = relatedCurrentPage * RELATED_PER_PAGE;
    const visibleVideos = relatedVideosList.slice(start, end);
    const hasMore = end < relatedVideosList.length && end < RELATED_MAX;

    // ✅ Same grid as list page
    let html = `<div class="grid">`;
    
    visibleVideos.forEach(v => {
        const thumbUrl = getThumbnailUrlSafe(v.id);
        const previewHtml = v.preview ? 
            `<video class="preview-video" muted loop playsinline preload="none" data-src="${v.preview}"></video>` : '';
        const durationHtml = v.duration ? 
            `<div class="duration">${v.duration}</div>` : '';
        const catHtml = generateCategoryButtons(v.categories);

        const hasTitle = v.title && v.title.trim().length > 0;
        const alignClass = hasTitle ? 'left' : 'center';
        const idDisplay = v.id ? `${escapeHtml(v.id)}:-` : '';
        const titleDisplay = hasTitle ? bubbleText(v.title.substring(0, 50)) : '';

        // ✅ EXACT same format as list.js
        html += `
            <a href="video.html?v=${v.id}" class="related-video-link" data-video-id="${v.id}">
                <div class="thumb-container">
                    <img class="thumb-img" src="${thumbUrl}" loading="lazy" onerror="this.src='https://via.placeholder.com/320x180?text=No+Thumb'">
                    ${previewHtml}
                    ${durationHtml}
                </div>
                <div class="video-title ${alignClass}">
                    <span class="vid-id">${idDisplay}</span> ${titleDisplay}
                </div>
                ${catHtml}
            </a>
        `;
    });
    html += `</div>`;

    if (hasMore && end < RELATED_MAX) {
        const remaining = Math.min(RELATED_MAX - end, RELATED_PER_PAGE);
        html += `<div class="more-videos-container">
            <button class="more-videos-btn" onclick="loadMoreRelated()">More Videos ↓ </button>
        </div>`;
    } else if (end >= RELATED_MAX || !hasMore) {
        html += `<div class="more-videos-container">
            <span class="max-videos-reached">✨ You've reached the end</span>
        </div>`;
    }

    container.innerHTML = html;

    // ✅ Attach click events (prevent default link, use our handler)
    document.querySelectorAll('#relatedVideos .related-video-link').forEach(link => {
        const vid = link.getAttribute('data-video-id');
        if (vid) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                goToVideo(vid);
            });
        }
    });

    setupRelatedPreview();
}

// ========== LOAD MORE RELATED ==========
function loadMoreRelated() {
    if (relatedCurrentPage * RELATED_PER_PAGE >= RELATED_MAX) return;
    if (relatedCurrentPage * RELATED_PER_PAGE >= relatedVideosList.length) return;
    
    relatedCurrentPage++;
    renderRelatedVideos();
}

// ========== LOAD RELATED VIDEOS LIST - FIXED (25 Videos Tak Fill) ==========
function loadRelatedVideos(currentVideoId) {
    const container = document.getElementById('relatedVideos');
    if (!container) return;

    if (typeof videos === 'undefined' || !videos.length) {
        container.innerHTML = '<p style="color:#888; padding:10px;">Loading videos...</p>';
        return;
    }

    const currentVideo = videos.find(v => v.id === currentVideoId);
    let related = [];
    const usedIds = new Set();
    usedIds.add(currentVideoId);

    if (currentVideo && currentVideo.categories && currentVideo.categories.length) {
        const sameCatVideos = videos.filter(v => 
            !usedIds.has(v.id) && 
            v.categories && 
            v.categories.includes(currentVideo.categories[0])
        );
        related.push(...sameCatVideos);
        sameCatVideos.forEach(v => usedIds.add(v.id));
    }

    if (related.length < RELATED_MAX) {
        const latestVideos = videos
            .filter(v => !usedIds.has(v.id))
            .reverse();
        const needed = RELATED_MAX - related.length;
        const fillVideos = latestVideos.slice(0, needed);
        related.push(...fillVideos);
        fillVideos.forEach(v => usedIds.add(v.id));
    }

    if (related.length < RELATED_MAX) {
        const remainingVideos = videos
            .filter(v => !usedIds.has(v.id))
            .sort(() => Math.random() - 0.5);
        const needed = RELATED_MAX - related.length;
        related.push(...remainingVideos.slice(0, needed));
    }

    relatedVideosList = related.slice(0, RELATED_MAX);
    relatedCurrentPage = 1;
    renderRelatedVideos();
}

// ========== PREVIEW HANDLERS (Updated for .related-video-link) ==========
let relatedActivePreview = null;

function stopRelatedPreview() {
    if (relatedActivePreview) {
        const container = relatedActivePreview.querySelector('.thumb-container');
        const previewVideo = container?.querySelector('.preview-video');
        const thumbImg = container?.querySelector('.thumb-img');
        if (previewVideo) {
            previewVideo.pause();
            previewVideo.style.display = 'none';
        }
        if (thumbImg) thumbImg.style.opacity = '1';
        relatedActivePreview = null;
    }
}

function startRelatedPreview(card) {
    stopRelatedPreview();
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
    relatedActivePreview = card;
}

function setupRelatedPreview() {
    const container = document.getElementById('relatedVideos');
    if (!container) return;

    container.removeEventListener('mouseover', handleRelatedMouseOver);
    container.removeEventListener('mouseout', handleRelatedMouseOut);
    container.addEventListener('mouseover', handleRelatedMouseOver);
    container.addEventListener('mouseout', handleRelatedMouseOut);

    container.removeEventListener('touchstart', handleRelatedTouchStart);
    container.removeEventListener('touchend', handleRelatedTouchEnd);
    container.addEventListener('touchstart', handleRelatedTouchStart, { passive: true });
    container.addEventListener('touchend', handleRelatedTouchEnd);
}

let relatedTouchTimer = null;

function handleRelatedMouseOver(e) {
    const card = e.target.closest('.related-video-link');
    if (card) startRelatedPreview(card);
}

function handleRelatedMouseOut(e) {
    const card = e.target.closest('.related-video-link');
    if (card && relatedActivePreview === card) stopRelatedPreview();
}

function handleRelatedTouchStart(e) {
    const card = e.target.closest('.related-video-link');
    if (card) relatedTouchTimer = setTimeout(() => startRelatedPreview(card), 100);
}

function handleRelatedTouchEnd(e) {
    if (relatedTouchTimer) { clearTimeout(relatedTouchTimer); relatedTouchTimer = null; }
    const card = e.target.closest('.related-video-link');
    if (card && relatedActivePreview === card) {
        setTimeout(() => {
            if (relatedActivePreview === card) stopRelatedPreview();
        }, 300);
    }
}

// ========== GO BACK TO PREVIOUS PAGE - FIXED ==========
function goBackToPrevious() {
    const returnUrl = sessionStorage.getItem('returnUrl');
    if (returnUrl) {
        sessionStorage.removeItem('returnUrl');
        window.location.href = returnUrl;
    } else if (document.referrer && document.referrer.includes(window.location.hostname)) {
        sessionStorage.setItem('scrollPosition', window.scrollY);
        window.location.href = document.referrer;
    } else {
        window.location.href = 'index.html';
    }
}

// ========== MAIN VIDEO LOAD - FIXED ==========
async function loadVideo() {
    await loadCategoriesForVideo();

    try {
        const response = await fetch('data/videos.json');
        if (!response.ok) {
            throw new Error('videos.json not found');
        }
        const videosData = await response.json();
        const videoEmbedData = videosData[videoId];

        if (typeof videos === 'undefined' || !videos.length) {
            console.warn('⚠️ videos array not loaded yet');
            setTimeout(loadVideo, 500);
            return;
        }
        const videoInfo = videos.find(v => v.id === videoId);

        if (videoEmbedData && videoInfo) {
            document.title = `CandyLink69 – ${videoInfo.title || videoId}`;
            
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.name = "description";
                document.head.appendChild(metaDesc);
            }
            metaDesc.content = `Watch ${videoInfo.title || videoId} in HD. ${videoEmbedData.description ? videoEmbedData.description.substring(0, 120) : 'Exclusive video on CandyLink69.'}`;
            
            let canonical = document.querySelector('link[rel="canonical"]');
            if (!canonical) {
                canonical = document.createElement('link');
                canonical.rel = "canonical";
                document.head.appendChild(canonical);
            }
            canonical.href = `https://candylink69.com/video.html?v=${videoId}`;

            document.getElementById('videoPlayer').src = videoEmbedData.embed;
            
            const idContainer = document.getElementById('currentVideoId');
            if (idContainer) {
                idContainer.textContent = videoId;
            }

            const titleContainer = document.getElementById('videoTitle');
            if (titleContainer) {
                if (videoInfo.title) {
                    titleContainer.innerHTML = bubbleText(videoInfo.title);
                } else {
                    titleContainer.innerHTML = videoId;
                }
            }

            const catContainer = document.getElementById('videoCategories');
            if (catContainer) {
                if (videoInfo.categories && videoInfo.categories.length) {
                    catContainer.innerHTML = generateCategoryButtons(videoInfo.categories);
                } else {
                    catContainer.innerHTML = '';
                }
            }

            const descContainer = document.getElementById('videoDescription');
            if (descContainer) {
                if (videoEmbedData.description) {
                    descContainer.textContent = videoEmbedData.description;
                } else {
                    descContainer.textContent = '';
                }
            }

            const videoIds = Object.keys(videosData);
            const currentIndex = videoIds.indexOf(videoId);
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            if (currentIndex > 0) {
                prevBtn.href = `video.html?v=${videoIds[currentIndex - 1]}`;
                prevBtn.style.display = 'inline-block';
            } else {
                prevBtn.style.display = 'none';
            }
            if (currentIndex < videoIds.length - 1) {
                nextBtn.href = `video.html?v=${videoIds[currentIndex + 1]}`;
                nextBtn.style.display = 'inline-block';
            } else {
                nextBtn.style.display = 'none';
            }

            loadRelatedVideos(videoId);

        } else {
            document.querySelector('.video-box').innerHTML = '<div style="padding:50px;color:#ccc; text-align:center">❌ This video is no longer available.</div>';
            document.getElementById('relatedVideos').innerHTML = '';
            document.getElementById('videoTitle').innerHTML = '';
            document.getElementById('videoCategories').innerHTML = '';
            document.getElementById('videoDescription').textContent = '';
        }
    } catch (error) {
        console.error('Error loading video:', error);
        document.querySelector('.video-box').innerHTML = '<div style="padding:50px;color:#ff8888">⚠️ Failed to load video data.</div>';
        document.getElementById('relatedVideos').innerHTML = '';
        document.getElementById('videoTitle').innerHTML = '';
        document.getElementById('videoCategories').innerHTML = '';
        document.getElementById('videoDescription').textContent = '';
    }
}

// ========== GLOBAL FUNCTIONS ==========
function goToVideo(id) { 
    window.location.href = 'video.html?v=' + id; 
}

function goToCategory(id) { 
    window.location.href = 'list.html?category=' + id; 
}

// ========== FLOATING PLAYER SYSTEM ==========
let playerLocked = false;
let playerOriginalParent = null;
let playerOriginalStyles = {};

function initPlayerLock() {
    const btn = document.getElementById('playerLockBtn');
    if (!btn) return;
    
    // Lock button ko video-box ke andar dalo
    const videoBox = document.querySelector('.video-box');
    if (videoBox && !videoBox.contains(btn)) {
        videoBox.appendChild(btn);
    }
}

function togglePlayerLock() {
    const btn = document.getElementById('playerLockBtn');
    const videoBox = document.querySelector('.video-box');
    const overlay = document.getElementById('playerUnlockOverlay');
    
    if (!playerLocked) {
        // LOCK: Save original state
        playerOriginalParent = videoBox.parentNode;
        playerOriginalStyles = {
            position: videoBox.style.position || '',
            width: videoBox.style.width || '',
            top: videoBox.style.top || '',
            right: videoBox.style.right || ''
        };
        
        videoBox.classList.add('floating');
        btn.innerHTML = '🔒';
        btn.classList.add('locked');
        playerLocked = true;
    } else {
        // UNLOCK: Restore
        unlockPlayer();
    }
}

function unlockPlayer() {
    const btn = document.getElementById('playerLockBtn');
    const videoBox = document.querySelector('.video-box');
    const overlay = document.getElementById('playerUnlockOverlay');
    
    videoBox.classList.remove('floating');
    btn.innerHTML = '🔓';
    btn.classList.remove('locked');
    overlay.classList.remove('show');
    playerLocked = false;
}

// Scroll pe auto-lock (optional)
let lastScrollY = 0;
window.addEventListener('scroll', () => {
    const videoBox = document.querySelector('.video-box');
    if (!videoBox || playerLocked) return;
    
    const videoRect = videoBox.getBoundingClientRect();
    // Agar video screen se bahar ja rahi hai to auto-lock
    if (videoRect.bottom < 0 && !playerLocked) {
        togglePlayerLock();
    }
});

// Init after page load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initPlayerLock, 1000);
});

// ========== START ==========
document.addEventListener('DOMContentLoaded', loadVideo);
console.log('✅ video.js loaded - Related videos use list page style');
