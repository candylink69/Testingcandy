// ============================================================
// VIDEO.JS - Load Video, Prev/Next, Related Videos
// ============================================================

const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get('v') || 'V001';

// ========== GLOBAL CATEGORIES ==========
let allCategories = [];

// ========== RELATED VIDEOS PAGINATION (Point 8) ==========
let relatedVideosList = [];
let relatedCurrentPage = 1;
const RELATED_PER_PAGE = 5;
const RELATED_MAX = 25;
let relatedLoadMoreBtn = null;

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

// ========== BUBBLE LETTERS WRAPPER ==========
function bubbleText(text) {
    if (!text) return '';
    return text.split('').map(char => {
        if (char === ' ') return ' ';
        return `<span class="bubble-letter">${char}</span>`;
    }).join('');
}

// ========== GENERATE CATEGORY BUTTONS (with "Tag:" label) ==========
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

// ========== RENDER RELATED VIDEOS (Point 8) ==========
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

    let html = `<div class="related-videos-grid">`;
    visibleVideos.forEach(v => {
        const thumbUrl = getThumbnailUrlSafe(v.id);
        const previewHtml = v.preview ? 
            `<video class="preview-video" muted loop playsinline preload="none" data-src="${v.preview}"></video>` : '';
        const durationHtml = v.duration ? 
            `<div class="duration">${v.duration}</div>` : '';
        const catHtml = generateCategoryButtons(v.categories);

        html += `
            <div class="related-video-card" data-video-id="${v.id}">
                <div class="thumb-container">
                    <img class="thumb-img" src="${thumbUrl}" loading="lazy" onerror="this.src='https://via.placeholder.com/320x180?text=No+Thumb'">
                    ${previewHtml}
                    ${durationHtml}
                </div>
                <div class="latest-info">
                    <div class="latest-id">${v.id}</div>
                    ${v.title ? `<div class="latest-title">${bubbleText(v.title.substring(0, 50))}</div>` : ''}
                    ${catHtml}
                </div>
            </div>
        `;
    });
    html += `</div>`;

    // ✅ Point 8: "More Videos ↓" button
    if (hasMore && end < RELATED_MAX) {
        const remaining = Math.min(RELATED_MAX - end, RELATED_PER_PAGE);
        html += `<div class="more-videos-container">
            <button class="more-videos-btn" onclick="loadMoreRelated()">More Videos ↓ (${remaining} more)</button>
        </div>`;
    } else if (end >= RELATED_MAX) {
        html += `<div class="more-videos-container">
            <span class="max-videos-reached">✨ You've reached the end</span>
        </div>`;
    }

    container.innerHTML = html;

    // Attach click events
    document.querySelectorAll('#relatedVideos .related-video-card').forEach(card => {
        const vid = card.getAttribute('data-video-id');
        if (vid) {
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                goToVideo(vid);
            });
        }
    });

    setupRelatedPreview();
}

// ========== LOAD MORE RELATED VIDEOS (Point 8) ==========
function loadMoreRelated() {
    if (relatedCurrentPage * RELATED_PER_PAGE >= RELATED_MAX) return;
    relatedCurrentPage++;
    renderRelatedVideos();
}

// ========== LOAD RELATED VIDEOS LIST ==========
function loadRelatedVideos(currentVideoId) {
    const container = document.getElementById('relatedVideos');
    if (!container) return;

    if (typeof videos === 'undefined' || !videos.length) {
        container.innerHTML = '<p style="color:#888; padding:10px;">Loading videos...</p>';
        return;
    }

    const currentVideo = videos.find(v => v.id === currentVideoId);
    let related = [];

    if (currentVideo && currentVideo.categories && currentVideo.categories.length) {
        const categoryId = currentVideo.categories[0];
        related = videos
            .filter(v => v.id !== currentVideoId && v.categories && v.categories.includes(categoryId));
    }

    // Agar related videos kam hain toh latest se fill karo
    if (related.length < 5) {
        const relatedIds = new Set(related.map(v => v.id));
        relatedIds.add(currentVideoId);
        const latestVideos = videos.filter(v => !relatedIds.has(v.id));
        related = [...related, ...latestVideos];
    }

    // ✅ Point 8: Max 25 videos tak limit
    relatedVideosList = related.slice(0, RELATED_MAX);
    relatedCurrentPage = 1;
    renderRelatedVideos();
}

// ========== PREVIEW HANDLERS ==========
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
    const card = e.target.closest('.related-video-card');
    if (card) startRelatedPreview(card);
}

function handleRelatedMouseOut(e) {
    const card = e.target.closest('.related-video-card');
    if (card && relatedActivePreview === card) stopRelatedPreview();
}

function handleRelatedTouchStart(e) {
    const card = e.target.closest('.related-video-card');
    if (card) relatedTouchTimer = setTimeout(() => startRelatedPreview(card), 100);
}

function handleRelatedTouchEnd(e) {
    if (relatedTouchTimer) { clearTimeout(relatedTouchTimer); relatedTouchTimer = null; }
    const card = e.target.closest('.related-video-card');
    if (card && relatedActivePreview === card) {
        setTimeout(() => {
            if (relatedActivePreview === card) stopRelatedPreview();
        }, 300);
    }
}

// ========== GO BACK TO PREVIOUS PAGE (Point 10) ==========
function goBackToPrevious() {
    if (document.referrer && document.referrer.includes(window.location.hostname)) {
        sessionStorage.setItem('scrollPosition', window.scrollY);
        window.location.href = document.referrer;
    } else {
        window.location.href = 'index.html';
    }
}

// ========== MAIN VIDEO LOAD ==========
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
            // Title
            document.title = `CandyLink69 – ${videoInfo.title || videoId}`;
            
            // Meta Description
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.name = "description";
                document.head.appendChild(metaDesc);
            }
            metaDesc.content = `Watch ${videoInfo.title || videoId} in HD. ${videoEmbedData.description ? videoEmbedData.description.substring(0, 120) : 'Exclusive video on CandyLink69.'}`;
            
            // Canonical
            let canonical = document.querySelector('link[rel="canonical"]');
            if (!canonical) {
                canonical = document.createElement('link');
                canonical.rel = "canonical";
                document.head.appendChild(canonical);
            }
            canonical.href = `https://candylink69.com/video.html?v=${videoId}`;

            // Load Player
            document.getElementById('videoPlayer').src = videoEmbedData.embed;
            
            // VIDEO ID
            const idContainer = document.getElementById('currentVideoId');
            if (idContainer) {
                idContainer.textContent = videoId;
            }

            // VIDEO TITLE
            const titleContainer = document.getElementById('videoTitle');
            if (titleContainer) {
                if (videoInfo.title) {
                    titleContainer.innerHTML = bubbleText(videoInfo.title);
                } else {
                    titleContainer.innerHTML = videoId;
                }
            }

            // VIDEO CATEGORIES
            const catContainer = document.getElementById('videoCategories');
            if (catContainer) {
                if (videoInfo.categories && videoInfo.categories.length) {
                    catContainer.innerHTML = generateCategoryButtons(videoInfo.categories);
                } else {
                    catContainer.innerHTML = '';
                }
            }

            // VIDEO DESCRIPTION
            const descContainer = document.getElementById('videoDescription');
            if (descContainer) {
                if (videoEmbedData.description) {
                    descContainer.textContent = videoEmbedData.description;
                } else {
                    descContainer.textContent = '';
                }
            }

            // Prev / Next
            const videoIds = Object.keys(videosData);
            const currentIndex = videoIds.indexOf(videoId);
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            if (currentIndex > 0) {
                prevBtn.href = `video.html?v=${videoIds[currentIndex - 1]}`;
                prevBtn.style.display = 'inline-block';
            }
            if (currentIndex < videoIds.length - 1) {
                nextBtn.href = `video.html?v=${videoIds[currentIndex + 1]}`;
                nextBtn.style.display = 'inline-block';
            }

            // ===== LOAD RELATED VIDEOS =====
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

// ========== START ==========
document.addEventListener('DOMContentLoaded', loadVideo);
console.log('✅ video.js loaded successfully');
