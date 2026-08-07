// ============================================================
// YOUTUBE-MODE.JS - YouTube Mode + Floating Draggable Window
// ============================================================

(function() {
    'use strict';
    
    if (!window.location.pathname.includes('video.html')) return;
    
    let isYouTubeMode = false;
    let isFloating = false;
    let videoBox = null;
    let controlsRow = null;
    let floatWindow = null;
    let floatOffBtn = null;
    let dragStartY = 0;
    let isDragging = false;
    let floatDragOffsetX = 0, floatDragOffsetY = 0;
    
    // Styles
    const styleTag = document.createElement('style');
    styleTag.textContent = `
        #ytControlsRow {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            gap: 8px;
            padding: 4px 8px;
            background: #0b0b0b;
            border-bottom: 1px solid #333;
            margin: 0;
        }
        body.yt-mode #ytControlsRow {
            position: sticky;
            top: 56.25vw;
            z-index: 9998;
        }
        #ytMenuBtn, #ytFloatBtn {
            display: none;
            align-items: center;
            gap: 4px;
            padding: 4px 10px;
            background: rgba(255,255,255,0.08);
            color: #ff9900;
            border: 1px solid #444;
            border-radius: 20px;
            font-size: 12px;
            cursor: pointer;
            box-shadow: 0 2px 0 rgba(0,0,0,0.3);
            transition: 0.15s;
        }
        body.yt-mode #ytMenuBtn,
        body.yt-mode #ytFloatBtn {
            display: inline-flex;
        }
        #ytMenuBtn:hover, #ytFloatBtn:hover {
            background: rgba(255,51,0,0.2);
            border-color: #ff6600;
        }
        #ytToggleSwitch {
            width: 48px;
            height: 26px;
            background: #e74c3c;
            border-radius: 26px;
            position: relative;
            cursor: pointer;
            transition: background 0.3s;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.4);
            flex-shrink: 0;
        }
        #ytToggleSwitch.active { background: #2ecc71; }
        #ytToggleKnob {
            width: 22px;
            height: 22px;
            background: #fff;
            border-radius: 50%;
            position: absolute;
            top: 2px;
            left: 2px;
            transition: left 0.3s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        #ytToggleSwitch.active #ytToggleKnob { left: 24px; }
        
        /* YouTube Mode */
        body.yt-mode .title,
        body.yt-mode .subtitle-badge,
        body.yt-mode .social-text,
        body.yt-mode .social-row,
        body.yt-mode #ad-top,
        body.yt-mode .sticky-search,
        body.yt-mode .warning-box,
        body.yt-mode .double-tap-indicator,
        body.yt-mode .swipe-indicator {
            display: none !important;
        }
        body.yt-mode .video-box {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            border-radius: 0 !important;
            z-index: 9997 !important;
        }
        body.yt-mode { padding-top: 56.25vw !important; }
        body.yt-mode #menuToggleBtn { display: none !important; }
        .video-box { margin-bottom: 0 !important; }
        body.yt-mode .container { padding-top: 0 !important; }
        
        /* Float Window */
        .video-box.float-window {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 50vw !important;
            min-width: 340px !important;
            max-width: 640px !important;
            padding-top: 0 !important;
            height: auto !important;
            aspect-ratio: 16/9 !important;
            z-index: 10000 !important;
            border-radius: 12px !important;
            box-shadow: 0 10px 40px rgba(0,0,0,0.9) !important;
            cursor: grab;
            border: 2px solid #ff6600 !important;
        }
        .video-box.float-window:active { cursor: grabbing; }
        .video-box.float-window .video-box { margin: 0 !important; }
        
        /* Float OFF Button - ABOVE the video window */
        #floatOffBtn {
            display: none;
            position: fixed;
            top: -999px;
            left: -999px;
            padding: 4px 12px;
            background: #e74c3c;
            color: #fff;
            border: none;
            border-radius: 0 0 8px 8px;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
            z-index: 10001;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            transition: 0.15s;
        }
        #floatOffBtn.show {
            display: block;
        }
        #floatOffBtn:hover {
            background: #c0392b;
            padding-top: 8px;
        }
        
        @media (max-width: 600px) {
            .video-box.float-window {
                width: 85vw !important;
                min-width: 280px !important;
            }
        }
    `;
    document.head.appendChild(styleTag);
    
    function init() {
        videoBox = document.querySelector('.video-box');
        if (!videoBox) return;
        
        // Controls row
        controlsRow = document.createElement('div');
        controlsRow.id = 'ytControlsRow';
        
        // Label
        const label = document.createElement('span');
        label.textContent = 'YouTube Mode';
        label.style.cssText = 'font-size:11px;color:#999;';
        controlsRow.appendChild(label);
        
        // Toggle
        const toggle = document.createElement('div');
        toggle.id = 'ytToggleSwitch';
        toggle.innerHTML = '<div id="ytToggleKnob"></div>';
        toggle.onclick = function(e) {
            e.stopPropagation();
            isYouTubeMode = !isYouTubeMode;
            if (isYouTubeMode) {
                toggle.classList.add('active');
                document.body.classList.add('yt-mode');
                // Agar floating tha to wapas
                if (isFloating) exitFloatMode();
            } else {
                toggle.classList.remove('active');
                document.body.classList.remove('yt-mode');
                if (isFloating) exitFloatMode();
            }
        };
        controlsRow.appendChild(toggle);
        
        // Menu button
        const menuBtn = document.createElement('button');
        menuBtn.id = 'ytMenuBtn';
        menuBtn.innerHTML = '☰ Menu';
        menuBtn.onclick = function(e) {
            e.stopPropagation();
            if (typeof openMenu === 'function') openMenu();
        };
        controlsRow.appendChild(menuBtn);
        
        // Float button
        const floatBtn = document.createElement('button');
        floatBtn.id = 'ytFloatBtn';
        floatBtn.innerHTML = '🪟 Float';
        floatBtn.onclick = function(e) {
            e.stopPropagation();
            enterFloatMode();
        };
        controlsRow.appendChild(floatBtn);
        
        videoBox.parentNode.insertBefore(controlsRow, videoBox.nextSibling);
        
        // Float OFF button
        floatOffBtn = document.createElement('button');
        floatOffBtn.id = 'floatOffBtn';
        floatOffBtn.textContent = '✕ Close Float';
        floatOffBtn.onclick = function(e) {
            e.stopPropagation();
            exitFloatMode();
        };
        document.body.appendChild(floatOffBtn);
        
        // Drag float window
        videoBox.addEventListener('mousedown', function(e) {
            if (!isFloating) return;
            if (e.target.closest('#floatOffBtn')) return;
            isDragging = true;
            floatDragOffsetX = e.clientX - videoBox.getBoundingClientRect().left;
            floatDragOffsetY = e.clientY - videoBox.getBoundingClientRect().top;
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', function(e) {
            if (!isDragging || !isFloating) return;
            videoBox.style.left = (e.clientX - floatDragOffsetX) + 'px';
            videoBox.style.top = (e.clientY - floatDragOffsetY) + 'px';
            videoBox.style.transform = 'none';
            updateFloatOffBtnPosition();
        });
        
        document.addEventListener('mouseup', function() {
            isDragging = false;
        });
        
        // Touch drag
        videoBox.addEventListener('touchstart', function(e) {
            if (!isFloating) return;
            if (e.target.closest('#floatOffBtn')) return;
            isDragging = true;
            floatDragOffsetX = e.touches[0].clientX - videoBox.getBoundingClientRect().left;
            floatDragOffsetY = e.touches[0].clientY - videoBox.getBoundingClientRect().top;
        });
        
        document.addEventListener('touchmove', function(e) {
            if (!isDragging || !isFloating) return;
            videoBox.style.left = (e.touches[0].clientX - floatDragOffsetX) + 'px';
            videoBox.style.top = (e.touches[0].clientY - floatDragOffsetY) + 'px';
            videoBox.style.transform = 'none';
            updateFloatOffBtnPosition();
        }, { passive: true });
        
        document.addEventListener('touchend', function() {
            isDragging = false;
        });
    }
    
    function enterFloatMode() {
        if (!isYouTubeMode) return;
        isFloating = true;
        videoBox.classList.add('float-window');
        document.body.classList.remove('yt-mode');
        floatOffBtn.classList.add('show');
        updateFloatOffBtnPosition();
    }
    
    function exitFloatMode() {
        isFloating = false;
        videoBox.classList.remove('float-window');
        videoBox.style.left = '';
        videoBox.style.top = '';
        videoBox.style.transform = '';
        floatOffBtn.classList.remove('show');
        if (isYouTubeMode) {
            document.body.classList.add('yt-mode');
        }
    }
    
    function updateFloatOffBtnPosition() {
        const rect = videoBox.getBoundingClientRect();
        floatOffBtn.style.top = (rect.top - 28) + 'px';
        floatOffBtn.style.left = rect.left + 'px';
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
