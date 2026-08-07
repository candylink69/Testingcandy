// ============================================================
// YOUTUBE-MODE.JS - Fixed & Complete System
// YouTube Mode: Toggle + Menu + Float Button + Controls Row
// Float: Smooth Draggable Miniplayer with Close Button
// ============================================================

(function() {
    'use strict';
    
    if (!window.location.pathname.includes('video.html')) return;
    
    let isYouTubeMode = false;
    let isFloating = false;
    let videoBox = null;
    let controlsRow = null;
    let toggleSwitch = null;
    let closeFloatBtn = null; // New floating close button
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
        
        /* Floating Close Button (Directly on Video) */
        #ytFloatCloseBtn {
            display: none;
            position: absolute;
            top: -10px;
            right: -10px;
            width: 26px;
            height: 26px;
            background: rgba(0, 0, 0, 0.8);
            color: #fff;
            border: 1.5px solid #fff;
            border-radius: 50%;
            text-align: center;
            line-height: 22px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            z-index: 10001;
            box-shadow: 0 2px 5px rgba(0,0,0,0.5);
            transition: 0.2s;
        }
        #ytFloatCloseBtn:hover { background: #e74c3c; }
        .video-box.float-window #ytFloatCloseBtn {
            display: block; /* Show only when floating */
        }
        
        /* Prevent iframe from eating drag events */
        .video-box.is-dragging iframe, 
        .video-box.is-dragging video {
            pointer-events: none !important;
        }
        
        /* YouTube Mode Constraints */
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
        
        /* Float Window CSS (Fixed for Dragging) */
        .video-box.float-window {
            position: fixed !important;
            /* Remove !important from positioning to allow JS to drag */
            bottom: 80px; 
            right: 16px;
            top: auto;
            left: auto;
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
                bottom: 60px;
                right: 8px;
            }
        }
    `;
    document.head.appendChild(styleTag);
    
    // ========== INIT ==========
    function init() {
        videoBox = document.querySelector('.video-box');
        if (!videoBox) return;
        
        // Ensure videoBox is relative/fixed so close button anchors correctly
        if (window.getComputedStyle(videoBox).position === 'static') {
            videoBox.style.position = 'relative';
        }
        
        // Create On-Window Close Button
        closeFloatBtn = document.createElement('div');
        closeFloatBtn.id = 'ytFloatCloseBtn';
        closeFloatBtn.innerHTML = '✕';
        closeFloatBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevents click from triggering video
            exitFloatMode();
        });
        videoBox.appendChild(closeFloatBtn);
        
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
        
        // ===== DRAG FLOAT WINDOW LOGIC =====
        function startDrag(clientX, clientY) {
            if (!isFloating) return;
            isDragging = true;
            videoBox.classList.add('is-dragging'); // Stops iframe from eating events
            
            dragStartX = clientX;
            dragStartY = clientY;
            const rect = videoBox.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
        }
        
        function moveDrag(clientX, clientY) {
            if (!isDragging) return;
            
            // Set position dynamically & override CSS bottom/right
            videoBox.style.setProperty('left', (startLeft + clientX - dragStartX) + 'px', 'important');
            videoBox.style.setProperty('top', (startTop + clientY - dragStartY) + 'px', 'important');
            videoBox.style.setProperty('bottom', 'auto', 'important');
            videoBox.style.setProperty('right', 'auto', 'important');
        }
        
        function endDrag() {
            if (isDragging) {
                isDragging = false;
                videoBox.classList.remove('is-dragging');
            }
        }
        
        // Mouse Events
        videoBox.addEventListener('mousedown', function(e) {
            // Don't drag if clicking the close button
            if (e.target.id === 'ytFloatCloseBtn') return; 
            startDrag(e.clientX, e.clientY);
        });
        document.addEventListener('mousemove', function(e) { moveDrag(e.clientX, e.clientY); });
        document.addEventListener('mouseup', endDrag);
        
        // Touch Events
        videoBox.addEventListener('touchstart', function(e) {
            if (e.target.id === 'ytFloatCloseBtn') return;
            startDrag(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });
        document.addEventListener('touchmove', function(e) { moveDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
        document.addEventListener('touchend', endDrag);
    }
    
    // ========== FLOAT ACTIONS ==========
    function enterFloatMode() {
        if (!isYouTubeMode) return;
        isFloating = true;
        videoBox.classList.add('float-window');
        document.getElementById('ytFloatBtn').classList.add('active');
    }
    
    function exitFloatMode() {
        isFloating = false;
        videoBox.classList.remove('float-window');
        videoBox.classList.remove('is-dragging');
        
        // Reset all JS injected styles so it returns to normal mode
        videoBox.style.removeProperty('left');
        videoBox.style.removeProperty('top');
        videoBox.style.removeProperty('bottom');
        videoBox.style.removeProperty('right');
        
        document.getElementById('ytFloatBtn').classList.remove('active');
    }
    
    // ========== START ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
