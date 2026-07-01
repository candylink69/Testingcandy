// ============================================================
// VIDEO.JS - Load Video, Prev/Next, Related Videos with Preview
// ============================================================

const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get('v') || 'V001';

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

// ========== RELATED VIDEOS FUNCTION (With Preview) ==========
function loadRelatedVideos(currentVideoId) {
    const container = document.getElementById('relatedVideos');
    if (!container) return;

    if (typeof videos === 'undefined' || !videos.length) {
        container.innerHTML = '<p style="color:#888; padding:10px;">Loading related videos...</p>';
        return;
    }

    const currentVideo = videos.find(v => v.id === currentVideoId);
    if (!currentVideo || !currentVideo.categories || !currentVideo.categories.length) {
        container.innerHTML = '<p style="color:#888; padding:10px;">No related videos found.</p>';
        return;
    }

    const categoryId = currentVideo.categories[0];
    const related = videos
        .filter(v => v.id !== currentVideoId && v.categories && v.categories.includes(categoryId))
        .slice(0, 5);

    if (related.length === 0) {
        container.innerHTML = '<p style="color:#888; padding:10px;">No related videos found.</p>';
        return;
    }

    let html = `<div class="related-videos-grid">`;
    related.forEach(v => {
        const thumbUrl = getThumbnailUrlSafe(v.id);
        const previewHtml = v.preview ? 
            `<video class="preview-video" muted loop playsinline preload="none" data-src="${v.preview}"></video>` : '';
        const durationHtml = v.duration ? 
            `<div class="duration">${v.duration}</div>` : '';

        html += `
            <div class="related-video-card" data-video-id="${v.id}">
                <div class="thumb-container">
                    <img class="thumb-img" src="${thumbUrl}" loading="lazy" onerror="this.src='https://via.placeholder.com/320x180?text=No+Thumb'">
                    ${previewHtml}
                    ${durationHtml}
                </div>
                <div class="latest-info">
                    <div class="latest-id">${v.id}</div>
                    ${v.title ? `<div class="latest-title">${v.title.substring(0, 50)}</div>` : ''}
                </div>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;

    // ===== ATTACH CLICK EVENTS =====
    document.querySelectorAll('#relatedVideos .related-video-card').forEach(card => {
        const vid = card.getAttribute('data-video-id');
        if (vid) {
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                goToVideo(vid);
            });
        }
    });

    // ===== SETUP PREVIEW HANDLERS =====
    setupRelatedPreview();
}

// ========== PREVIEW HANDLERS FOR RELATED VIDEOS ==========
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

    // Mouse events
    container.removeEventListener('mouseover', handleRelatedMouseOver);
    container.removeEventListener('mouseout', handleRelatedMouseOut);
    container.addEventListener('mouseover', handleRelatedMouseOver);
    container.addEventListener('mouseout', handleRelatedMouseOut);

    // Touch events
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

// ========== MAIN VIDEO LOAD ==========
fetch('data/videos.json')
    .then(response => response.json())
    .then(videosData => {
        const video = videosData[videoId];
        if (video) {
            // Title
            document.title = `CandyLink69 – ${video.title || videoId}`;
            
            // Meta Description
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.name = "description";
                document.head.appendChild(metaDesc);
            }
            metaDesc.content = `Watch ${video.title || videoId} in HD. ${video.description ? video.description.substring(0, 120) : 'Exclusive video on CandyLink69.'}`;
            
            // Canonical (Fix for GSC)
            let canonical = document.querySelector('link[rel="canonical"]');
            if (!canonical) {
                canonical = document.createElement('link');
                canonical.rel = "canonical";
                document.head.appendChild(canonical);
            }
            canonical.href = `https://candylink69.com/video.html?v=${videoId}`;

            // Load Player
            document.getElementById('videoPlayer').src = video.embed;
            document.getElementById('currentVideoId').textContent = videoId;
            if (video.description) {
                document.getElementById('videoDescription').textContent = video.description;
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
        }
    })
    .catch(error => {
        console.error('Error loading video:', error);
        document.querySelector('.video-box').innerHTML = '<div style="padding:50px;color:#ff8888">⚠️ Failed to load video data.</div>';
        document.getElementById('relatedVideos').innerHTML = '';
    });

console.log('✅ video.js loaded successfully');
