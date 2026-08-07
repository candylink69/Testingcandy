// ============================================================
// YOUTUBE-MODE.JS - Advanced YouTube-Style Player/ Add in video.html: <script src="js/youtube-mode.js"></script>
// Remove to disable completely
// ============================================================

(function() {
    'use strict';
    
    if (!window.location.pathname.includes('video.html')) return;
    
    // ========== STATE ==========
    let isYouTubeMode = false;
    let isMiniPlayer = false;
    let videoBox = null;
    let toggleBtn = null;
    let menuBtn = null;
    let hiddenElements = [];
    let dragStartY = 0;
    let playerOriginalRect = null;
    
    // ========== STYLES ==========
    const styles = `
        #ytToggleContainer {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin: 8px 12px;
            font-size: 12px;
            color: #ccc;
        }
        #ytToggleSwitch {
            width: 52px;
            height: 28px;
            background: #e74c3c;
            border-radius: 28px;
            position: relative;
            cursor: pointer;
            transition: background 0.3s ease;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.4);
            flex-shrink: 0;
        }
        #ytToggleSwitch.active {
            background: #2ecc71;
        }
        #ytToggleKnob {
            width: 24px;
            height: 24px;
            background: #fff;
            border-radius: 50%;
            position: absolute;
            top: 2px;
            left: 2px;
            transition: left 0.3s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        #ytToggleSwitch.active #ytToggleKnob {
            left: 26px;
        }
        #ytMenuBtn {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 6px 14px;
            background: rgba(255,255,255,0.08);
            color: #ff9900;
            border: 1px solid #444;
            border-radius: 20px;
            font-size: 13px;
            cursor: pointer;
            transition: 0.2s;
            box-shadow: 0 3px 0 rgba(0,0,0,0.3);
            margin: 0 6px;
        }
        #ytMenuBtn:hover {
            background: rgba(255,51,0,0.2);
            border-color: #ff6600;
        }
        #ytControlsRow {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            gap: 8px;
            padding: 8px 0;
        }
        /* YouTube mode - hide everything above video */
        body.yt-mode .container > *:not(.video-box):not(#ytControlsRow):not(#relatedVideos):not(#sticky):not(#sideMenu) {
            display: none !important;
        }
        body.yt-mode #sideMenu { display: none !important; }
        body.yt-mode #menuToggleBtn { display: none !important; }
        body.yt-mode .video-box {
            margin-top: 0 !important;
            border-radius: 0 !important;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 9997;
        }
        body.yt-mode {
            padding-top: 56.25vw !important;
        }
        /* Mini player */
        .video-box.mini-player {
            position: fixed !important;
            bottom: 70px !important;
            right: 10px !important;
            top: auto !important;
            left: auto !important;
            width: 280px !important;
            height: 158px !important;
            padding-top: 0 !important;
            z-index: 9999 !important;
            border-radius: 12px !important;
            box-shadow: 0 8px 30px rgba(0,0,0,0.8) !important;
            cursor: pointer;
        }
        .video-box.mini-player #ytMiniToggle {
            display: flex !important;
        }
        #ytMiniToggle {
            display: none;
            position: absolute;
            top: 6px;
            right: 6px;
            width: 36px;
            height: 20px;
            background: #2ecc71;
            border-radius: 20px;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 1px 3px rgba(0,0,0,0.5);
        }
        #ytMiniToggle .mini-knob {
            width: 16px;
            height: 16px;
            background: #fff;
            border-radius: 50%;
            position: absolute;
            top: 2px;
            left: 2px;
            transition: left 0.2s;
        }
        #ytMiniToggle.off {
            background: #e74c3c;
        }
        #ytMiniToggle.off .mini-knob {
            left: 18px;
        }
        @media (max-width: 600px) {
            .video-box.mini-player {
                width: 200px !important;
                height: 112px !important;
                bottom: 60px !important;
            }
        }
    `;
    
    // ========== INIT ==========
    function init() {
        videoBox = document.querySelector('.video-box');
        if (!videoBox) return;
        
        // Add styles
        const styleTag = document.createElement('style');
        styleTag.textContent = styles;
        document.head.appendChild(styleTag);
        
        // Create controls row
        const controlsRow = document.createElement('div');
        controlsRow.id = 'ytControlsRow';
        
        // Menu button
        menuBtn = document.createElement('button');
        menuBtn.id = 'ytMenuBtn';
        menuBtn.innerHTML = '☰ Menu';
        menuBtn.onclick = (e) => {
            e.stopPropagation();
            if (typeof openMenu === 'function') openMenu();
        };
        controlsRow.appendChild(menuBtn);
        
        // Toggle container
        const toggleContainer = document.createElement('div');
        toggleContainer.id = 'ytToggleContainer';
        toggleContainer.innerHTML = `
            <span>YouTube Mode</span>
            <div id="ytToggleSwitch" onclick="void(0)">
                <div id="ytToggleKnob"></div>
            </div>
        `;
        toggleContainer.querySelector('#ytToggleSwitch').addEventListener('click', toggleYouTubeMode);
        controlsRow.appendChild(toggleContainer);
        
        // Insert after video box
        videoBox.parentNode.insertBefore(controlsRow, videoBox.nextSibling);
        
        // Mini toggle for mini player
        const miniToggle = document.createElement('div');
        miniToggle.id = 'ytMiniToggle';
        miniToggle.className = 'off';
        miniToggle.innerHTML = '<div class="mini-knob"></div>';
        miniToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleYouTubeMode();
        });
        videoBox.appendChild(miniToggle);
        
        // Drag to minimize
        videoBox.addEventListener('mousedown', onDragStart);
        videoBox.addEventListener('touchstart', onDragStart, { passive: true });
        
        // Handle back/forward navigation
        window.addEventListener('beforeunload', handlePageExit);
        window.addEventListener('popstate', handlePageExit);
    }
    
    // ========== TOGGLE YOUTUBE MODE ==========
    function toggleYouTubeMode() {
        isYouTubeMode = !isYouTubeMode;
        const toggleSwitch = document.getElementById('ytToggleSwitch');
        const miniToggle = document.getElementById('ytMiniToggle');
        
        if (isYouTubeMode) {
            // ON: YouTube mode
            toggleSwitch.classList.add('active');
            document.body.classList.add('yt-mode');
            videoBox.classList.remove('mini-player');
            isMiniPlayer = false;
            miniToggle.style.display = 'none';
            
            // Hide menu toggle button (show our custom one)
            const menuToggle = document.getElementById('menuToggleBtn');
            if (menuToggle) menuToggle.style.display = 'none';
            
            // Store elements to hide
            const container = document.querySelector('.container');
            hiddenElements = [];
            if (container) {
                Array.from(container.children).forEach(child => {
                    if (child !== videoBox && child.id !== 'ytControlsRow' && 
                        child.id !== 'relatedVideos' && child.id !== 'sideMenu') {
                        hiddenElements.push({ el: child, display: child.style.display });
                        child.style.display = 'none';
                    }
                });
            }
        } else {
            // OFF: Normal mode
            toggleSwitch.classList.remove('active');
            document.body.classList.remove('yt-mode');
            videoBox.classList.remove('mini-player');
            isMiniPlayer = false;
            miniToggle.style.display = 'none';
            
            // Restore menu button
            const menuToggle = document.getElementById('menuToggleBtn');
            if (menuToggle) menuToggle.style.display = '';
            
            // Restore hidden elements
            hiddenElements.forEach(item => {
                item.el.style.display = item.display;
            });
            hiddenElements = [];
        }
    }
    
    // ========== DRAG TO MINI PLAYER ==========
    function onDragStart(e) {
        if (!isYouTubeMode || isMiniPlayer) return;
        
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        dragStartY = clientY;
        playerOriginalRect = videoBox.getBoundingClientRect();
        
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);
        document.addEventListener('touchmove', onDragMove, { passive: true });
        document.addEventListener('touchend', onDragEnd);
    }
    
    function onDragMove(e) {
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const deltaY = clientY - dragStartY;
        
        if (deltaY > 60) {
            // Dragged down enough - switch to mini player
            makeMiniPlayer();
            document.removeEventListener('mousemove', onDragMove);
            document.removeEventListener('mouseup', onDragEnd);
            document.removeEventListener('touchmove', onDragMove);
            document.removeEventListener('touchend', onDragEnd);
        }
    }
    
    function onDragEnd() {
        document.removeEventListener('mousemove', onDragMove);
        document.removeEventListener('mouseup', onDragEnd);
        document.removeEventListener('touchmove', onDragMove);
        document.removeEventListener('touchend', onDragEnd);
    }
    
    function makeMiniPlayer() {
        videoBox.classList.add('mini-player');
        isMiniPlayer = true;
        document.body.classList.remove('yt-mode');
        
        // Restore hidden elements
        hiddenElements.forEach(item => {
            item.el.style.display = item.display;
        });
        
        // Show mini toggle
        const miniToggle = document.getElementById('ytMiniToggle');
        miniToggle.style.display = 'block';
        miniToggle.classList.remove('off');
        
        // Hide controls row
        const controlsRow = document.getElementById('ytControlsRow');
        if (controlsRow) controlsRow.style.display = 'none';
        
        const menuToggle = document.getElementById('menuToggleBtn');
        if (menuToggle) menuToggle.style.display = '';
    }
    
    // ========== HANDLE PAGE EXIT ==========
    function handlePageExit() {
        if (isYouTubeMode && !isMiniPlayer) {
            makeMiniPlayer();
        }
    }
    
    // Click mini player to restore
    document.addEventListener('click', (e) => {
        if (isMiniPlayer && e.target.closest('.video-box') && !e.target.closest('#ytMiniToggle')) {
            restoreFromMini();
        }
    });
    
    function restoreFromMini() {
        videoBox.classList.remove('mini-player');
        isMiniPlayer = false;
        isYouTubeMode = true;
        
        const miniToggle = document.getElementById('ytMiniToggle');
        miniToggle.style.display = 'none';
        
        document.body.classList.add('yt-mode');
        
        const controlsRow = document.getElementById('ytControlsRow');
        if (controlsRow) controlsRow.style.display = '';
        
        const menuToggle = document.getElementById('menuToggleBtn');
        if (menuToggle) menuToggle.style.display = 'none';
        
        // Re-hide elements
        const container = document.querySelector('.container');
        hiddenElements = [];
        if (container) {
            Array.from(container.children).forEach(child => {
                if (child !== videoBox && child.id !== 'ytControlsRow' && 
                    child.id !== 'relatedVideos' && child.id !== 'sideMenu') {
                    hiddenElements.push({ el: child, display: child.style.display });
                    child.style.display = 'none';
                }
            });
        }
    }
    
    // ========== START ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    console.log('✅ YouTube Mode ready');
    
})();
