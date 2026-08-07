// ============================================================
// PLAYER-LOCK.JS - YouTube-Style Sticky Video Player
// Add one line in video.html to use: <script src="js/player-lock.js"></script>
// Remove that line to disable - no effect on anything else
// ============================================================

(function() {
    'use strict';
    
    // Only run on video page
    if (!window.location.pathname.includes('video.html')) return;
    
    let isLocked = false;
    let lockBtn = null;
    let videoBox = null;
    let videoPlaceholder = null;
    
    function init() {
        videoBox = document.querySelector('.video-box');
        if (!videoBox) return;
        
        // Create lock button
        lockBtn = document.createElement('button');
        lockBtn.id = 'playerLockBtn';
        lockBtn.innerHTML = '🔓';
        lockBtn.title = 'Lock video while scrolling';
        lockBtn.style.cssText = `
            display: inline-block;
            margin: 6px 8px;
            padding: 6px 12px;
            background: rgba(255,255,255,0.1);
            color: #ffaa44;
            border: 1px solid #444;
            border-radius: 20px;
            font-size: 14px;
            cursor: pointer;
            transition: 0.2s;
            box-shadow: 0 3px 0 rgba(0,0,0,0.3);
        `;
        lockBtn.addEventListener('mouseenter', () => {
            lockBtn.style.background = 'rgba(255,51,0,0.2)';
            lockBtn.style.borderColor = '#ff6600';
        });
        lockBtn.addEventListener('mouseleave', () => {
            if (!isLocked) lockBtn.style.background = 'rgba(255,255,255,0.1)';
        });
        lockBtn.addEventListener('click', toggleLock);
        
        // Insert after video box (near title area)
        videoBox.parentNode.insertBefore(lockBtn, videoBox.nextSibling);
        
        // Create placeholder for when video is sticky
        videoPlaceholder = document.createElement('div');
        videoPlaceholder.id = 'videoPlaceholder';
        videoPlaceholder.style.cssText = 'display: none;';
        videoBox.parentNode.insertBefore(videoPlaceholder, videoBox);
    }
    
    function toggleLock() {
        isLocked = !isLocked;
        
        if (isLocked) {
            // Lock: Make video sticky at top
            const rect = videoBox.getBoundingClientRect();
            
            videoPlaceholder.style.display = 'block';
            videoPlaceholder.style.width = videoBox.offsetWidth + 'px';
            videoPlaceholder.style.height = videoBox.offsetHeight + 'px';
            
            videoBox.style.position = 'fixed';
            videoBox.style.top = '0';
            videoBox.style.left = '50%';
            videoBox.style.transform = 'translateX(-50%)';
            videoBox.style.width = videoBox.offsetWidth + 'px';
            videoBox.style.zIndex = '9999';
            videoBox.style.borderRadius = '0 0 12px 12px';
            videoBox.style.boxShadow = '0 4px 20px rgba(0,0,0,0.8)';
            
            lockBtn.innerHTML = '🔒 Unlock';
            lockBtn.style.background = 'rgba(255,51,0,0.3)';
            lockBtn.style.borderColor = '#ff6600';
            lockBtn.style.color = '#fff';
            
            // Add padding to body so content doesn't go under video
            document.body.style.paddingTop = videoBox.offsetHeight + 'px';
            
        } else {
            // Unlock: Restore original position
            videoPlaceholder.style.display = 'none';
            
            videoBox.style.position = '';
            videoBox.style.top = '';
            videoBox.style.left = '';
            videoBox.style.transform = '';
            videoBox.style.width = '';
            videoBox.style.zIndex = '';
            videoBox.style.borderRadius = '';
            videoBox.style.boxShadow = '';
            
            lockBtn.innerHTML = '🔓';
            lockBtn.style.background = 'rgba(255,255,255,0.1)';
            lockBtn.style.borderColor = '#444';
            lockBtn.style.color = '#ffaa44';
            
            document.body.style.paddingTop = '';
        }
    }
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (isLocked) {
                videoPlaceholder.style.width = videoBox.offsetWidth + 'px';
                videoPlaceholder.style.height = videoBox.offsetHeight + 'px';
                videoBox.style.width = videoBox.offsetWidth + 'px';
                document.body.style.paddingTop = videoBox.offsetHeight + 'px';
            }
        }, 200);
    });
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
