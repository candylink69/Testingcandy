// ============================================================
// YOUTUBE-MODE.JS - Perfect YouTube-Style Float
// ============================================================

(function() {
    'use strict';
    
    if (!window.location.pathname.includes('video.html')) return;
    
    let isYouTubeMode = false;
    let isFloating = false;
    let videoBox = null;
    let controlsRow = null;
    let floatOffBtn = null;
    let isDragging = false;
    let dragStartX, dragStartY, startLeft, startTop;
    
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
        
        /* Float Window - YouTube style corner */
        .video-box.float-window {
            position: fixed !important;
            bottom: 80px !important;
            right: 16px !important;
            top: auto !important;
            left: auto !important;
            width: 360px !important;
            height: 203px !important;
            padding-top: 0 !important;
            margin: 0 !important;
            border-radius: 12px !important;
            z-index: 10000 !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.9) !important;
            cursor: grab;
            border: 2px solid rgba(255,102,0,0.6) !important;
            transition: none !important;
            transform: none !important;
        }
        .video-box.float-window:active { cursor: grabbing; }
        .video-box.float-window iframe {
            border-radius: 10px !important;
        }
        
        /* Float OFF Button */
        #floatOffBtn {
            display: none;
            position: fixed;
            padding: 4px 10px;
            background: #e74c3c;
            color: #fff;
            border: none;
            border-radius: 0 0 6px 6px;
            font-size: 11px;
            font-weight: bold;
            cursor: pointer;
            z-index: 10001;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
            pointer-events: auto;
        }
        #floatOffBtn.show { display: block; }
        #floatOffBtn:hover { background: #c0392b; }
        
        @media (max-width: 600px) {
            .video-box.float-window {
                width: 240px !important;
                height: 135px !important;
                bottom: 70px !important;
                right: 8px !important;
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
                if (isFloating) exitFloatMode(false);
            } else {
                toggle.classList.remove('active');
                document.body.classList.remove('yt-mode');
                if (isFloating) exitFloatMode(false);
            }
        };
        controlsRow.appendChild(toggle);
        
        // Menu
        const menuBtn = document.createElement('button');
        menuBtn.id = 'ytMenuBtn';
        menuBtn.innerHTML = '☰ Menu';
        menuBtn.onclick = function(e) {
            e.stopPropagation();
            if (typeof openMenu === 'function') openMenu();
        };
        controlsRow.appendChild(menuBtn);
        
        // Float
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
        floatOffBtn.textContent = '✕ Close';
        floatOffBtn.onclick = function(e) {
            e.stopPropagation();
            exitFloatMode(true);
        };
        document.body.appendChild(floatOffBtn);
        
        // DRAG - Mouse
        videoBox.addEventListener('mousedown', function(e) {
            if (!isFloating || e.target.closest('#floatOffBtn')) return;
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
            const dx = e.clientX - dragStartX;
            const dy = e.clientY - dragStartY;
            videoBox.style.left = (startLeft + dx) + 'px';
            videoBox.style.top = (startTop + dy) + 'px';
            videoBox.style.bottom = 'auto';
            videoBox.style.right = 'auto';
            updateFloatOffBtn();
        });
        
        document.addEventListener('mouseup', function() {
            isDragging = false;
        });
        
        // DRAG - Touch
        videoBox.addEventListener('touchstart', function(e) {
            if (!isFloating || e.target.closest('#floatOffBtn')) return;
            isDragging = true;
            dragStartX = e.touches[0].clientX;
            dragStartY = e.touches[0].clientY;
            const rect = videoBox.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
        }, { passive: true });
        
        document.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            const dx = e.touches[0].clientX - dragStartX;
            const dy = e.touches[0].clientY - dragStartY;
            videoBox.style.left = (startLeft + dx) + 'px';
            videoBox.style.top = (startTop + dy) + 'px';
            videoBox.style.bottom = 'auto';
            videoBox.style.right = 'auto';
            updateFloatOffBtn();
        }, { passive: true });
        
        document.addEventListener('touchend', function() {
            isDragging = false;
        });
    }
    
    function enterFloatMode() {
        if (!isYouTubeMode) return;
        isFloating = true;
        videoBox.classList.add('float-window');
        // Don't remove yt-mode - keep background as YouTube mode
        floatOffBtn.classList.add('show');
        updateFloatOffBtn();
    }
    
    function exitFloatMode(keepYouTubeMode) {
        isFloating = false;
        videoBox.classList.remove('float-window');
        videoBox.style.left = '';
        videoBox.style.top = '';
        videoBox.style.bottom = '';
        videoBox.style.right = '';
        floatOffBtn.classList.remove('show');
        // Keep YouTube mode ON
        document.body.classList.add('yt-mode');
    }
    
    function updateFloatOffBtn() {
        const rect = videoBox.getBoundingClientRect();
        floatOffBtn.style.top = (rect.top - 30) + 'px';
        floatOffBtn.style.left = rect.left + 'px';
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
