// ============================================================
// YOUTUBE-MODE.JS - Cleaned System (No Float)
// YouTube Mode: Toggle + Menu + Controls Row ONLY
// ============================================================

(function() {
    'use strict';
    
    if (!window.location.pathname.includes('video.html')) return;
    
    let isYouTubeMode = false;
    let videoBox = null;
    let controlsRow = null;
    let toggleSwitch = null;
    
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
        #ytMenuBtn {
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
        body.yt-mode #ytMenuBtn {
            display: inline-flex;
        }
        #ytMenuBtn:hover {
            background: rgba(255,51,0,0.2);
            border-color: #ff6600;
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
            } else {
                toggleSwitch.classList.remove('active');
                document.body.classList.remove('yt-mode');
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
        
        // Insert controls row after video
        videoBox.parentNode.insertBefore(controlsRow, videoBox.nextSibling);
    }
    
    // ========== START ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
