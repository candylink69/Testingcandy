// ============================================================
// VIDEO.JS - Load Video, Prev/Next, Double Tap Indicator
// ============================================================

const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get('v') || 'V001';

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
        } else {
            document.querySelector('.video-box').innerHTML = '<div style="padding:50px;color:#ccc; text-align:center">❌ This video is no longer available.</div>';
        }
    })
    .catch(error => {
        console.error('Error loading video:', error);
        document.querySelector('.video-box').innerHTML = '<div style="padding:50px;color:#ff8888">⚠️ Failed to load video data.</div>';
    });

// ============================================================
// DOUBLE TAP INDICATOR IS ALREADY IN HTML (No JS needed for that)
// But we keep the script clean for video loading.
// ============================================================
console.log('✅ video.js loaded successfully');
