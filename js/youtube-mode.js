// ============================================================
// YOUTUBE-MODE.JS - Complete System
// YouTube Mode: Toggle + Menu + Float Button + Controls Row
// Float: player-lock.js style simple draggable window
// ============================================================

(function() {
    'use strict';
    
    if (!window.location.pathname.includes('video.html')) return;
    
    let isYouTubeMode = false;
    let isFloating = false;
    let videoBox = null;
    let controlsRow = null;
    let toggleSwitch = null;
    let isDragging = false;
    let dragStartX, dragStartY, startLeft, startTop;
    
    // ========== STYLES ==========
    const styleTag = document.createElement('style');
    styleTag.textContent = `
        /* Controls Row */
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
        
        /* Buttons */
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
        #ytFloatBtn.active {
            background: rgba(46,204,113,0.2);
            border-color: #2ecc71;
            color: #2ecc71;
        }
        
        /* Toggle Switch */
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
        body.yt-mode .container { padding-top: 0 !important; }
        
        /* Float Window - player-lock.js style */
        .video-box.float-window {
            position: fixed !important;
            bottom: 80px !important;
            right: 16px !important;
            top: auto !important;
            left: auto !important;
            width: 280px !important;
            height: 158px !important;
            padding-top: 0 !important;
            margin: 0 !important;
            border-radius: 12px !important;
            z-index: 10000 !important;
            box-shadow: 0 8px 30px rgba(0,0,0,0.8) !important;
            cursor: grab;
            border: 2px solid rgba(255,102,0,0.5) !important;
        }
        .video-box.float-window iframe { border-radius: 10px !important; }
        .video-box.float-window:active { cursor: grabbing; }
        
        @media (max-width: 600px) {
            .video-box.float-window {
                width: 200px !important;
                height: 112px !important;
                bottom: 60px !important;
                right: 8px !important;
            }
        }
    `;
    document.head.appendChild(styleTag);
    
    // ========== INIT ==========
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
        
        // Toggle Switch
        toggleSwitch = document.createElement('div');
        toggleSwitch.id = 'ytToggleSwitch';
        toggleSwitch.innerHTML = '<div id="ytToggleKnob"></div>';
        toggleSwitch.addEventListener('click', function(e) {
            e.stopPropagation();
            isYouTubeMode = !isYouTubeMode;
            if (isYouTubeMode) {
                toggleSwitch.classList.add('active');
                document.body.classList.add('yt-mode');
                if (isFloating) exitFloatMode();
            } else {
                toggleSwitch.classList.remove('active');
                document.body.classList.remove('yt-mode');
                if (isFloating) exitFloatMode();
            }
        });
        controlsRow.appendChild(toggleSwitch);
        
        // Menu Button
        const menuBtn = document.createElement('button');
        menuBtn.id = 'ytMenuBtn';
        menuBtn.innerHTML = '☰ Menu';
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (typeof openMenu === 'function') openMenu();
        });
        controlsRow.appendChild(menuBtn);
        
        // Float Button
        const floatBtn = document.createElement('button');
        floatBtn.id = 'ytFloatBtn';
        floatBtn.innerHTML = '🪟 Float';
        floatBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (!isFloating) {
                enterFloatMode();
            } else {
                exitFloatMode();
            }
        });
        controlsRow.appendChild(floatBtn);
        
        // Insert controls row after video
        videoBox.parentNode.insertBefore(controlsRow, videoBox.nextSibling);
        
        // ===== DRAG FLOAT WINDOW =====
        videoBox.addEventListener('mousedown', function(e) {
            if (!isFloating) return;
            e.preventDefault();
            isDragging = true;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            const rect = videoBox.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
        });
        
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            videoBox.style.left = (startLeft + e.clientX - dragStartX) + 'px';
            videoBox.style.top = (startTop + e.clientY - dragStartY) + 'px';
            videoBox.style.bottom = 'auto';
            videoBox.style.right = 'auto';
        });
        
        document.addEventListener('mouseup', function() { isDragging = false; });
        
        // Touch drag
        videoBox.addEventListener('touchstart', function(e) {
            if (!isFloating) return;
            isDragging = true;
            dragStartX = e.touches[0].clientX;
            dragStartY = e.touches[0].clientY;
            const rect = videoBox.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
        }, { passive: true });
        
        document.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            videoBox.style.left = (startLeft + e.touches[0].clientX - dragStartX) + 'px';
            videoBox.style.top = (startTop + e.touches[0].clientY - dragStartY) + 'px';
            videoBox.style.bottom = 'auto';
            videoBox.style.right = 'auto';
        }, { passive: true });
        
        document.addEventListener('touchend', function() { isDragging = false; });
    }
    
    // ========== FLOAT ==========
    function enterFloatMode() {
        if (!isYouTubeMode) return;
        isFloating = true;
        videoBox.classList.add('float-window');
        document.getElementById('ytFloatBtn').classList.add('active');
        document.getElementById('ytFloatBtn').innerHTML = '✕ Close Float';
    }
    
    function exitFloatMode() {
        isFloating = false;
        videoBox.classList.remove('float-window');
        videoBox.style.left = '';
        videoBox.style.top = '';
        videoBox.style.bottom = '';
        videoBox.style.right = '';
        document.getElementById('ytFloatBtn').classList.remove('active');
        document.getElementById('ytFloatBtn').innerHTML = '🪟 Float';
        if (isYouTubeMode) {
            document.body.classList.add('yt-mode');
        }
    }
    
    // ========== START ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
