// ============================================================
// VIDEO.JS - Load Video, Prev/Next, Related Videos
// ============================================================

const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get('v') || 'V001';

// ========== RELATED VIDEOS FUNCTION ==========
function loadRelatedVideos(currentVideoId) {
    const container = document.getElementById('relatedVideos');
    if (!container) return;

    // Check if videos array exists (from data.js)
    if (typeof videos === 'undefined' || !videos.length) {
        container.innerHTML = '<p style="color:#888; padding:10px;">Loading related videos...</p>';
        return;
    }

    // Find current video to get its category
    const currentVideo = videos.find(v => v.id === currentVideoId);
    if (!currentVideo || !currentVideo.categories || !currentVideo.categories.length) {
        container.innerHTML = '<p style="color:#888; padding:10px;">No related videos found.</p>';
        return;
    }

    const categoryId = currentVideo.categories[0];
    // Filter videos: same category, exclude current, limit to 5
    const related = videos
        .filter(v => v.id !== currentVideoId && v.categories && v.categories.includes(categoryId))
        .slice(0, 5);

    if (related.length === 0) {
        container.innerHTML = '<p style="color:#888; padding:10px;">No related videos found.</p>';
        return;
    }

    let html = `<div class="related-videos-grid">`;
    related.forEach(v => {
        const thumb = (typeof getThumbnailUrlSafe === 'function') 
            ? getThumbnailUrlSafe(v.id) 
            : `https://via.placeholder.com/120x68?text=${v.id}`;
        html += `
            <div class="related-video-card" onclick="goToVideo('${v.id}')">
                <img src="${thumb}" loading="lazy" onerror="this.src='https://via.placeholder.com/120x68?text=No+Thumb'">
                <div class="related-video-id">${v.id}</div>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;
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
