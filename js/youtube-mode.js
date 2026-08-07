// ============================================================
// YOUTUBE-MODE.JS - Fixed: Menu only in YouTube mode, sticky controls
// ============================================================

(function() {
    'use strict';
    
    if (!window.location.pathname.includes('video.html')) return;
    
    // ========== STATE ==========
    let isYouTubeMode = false;
    let isMiniPlayer = false;
    let videoBox = null;
    let controlsRow = null;
    let toggleSwitch = null;
    let miniToggle = null;
    let dragStartY = 0;
    
    // ========== STYLES ==========
    const styles = `
        /* Controls Row - HIDDEN by default, VISIBLE only in YouTube mode, STICKY */
        #ytControlsRow {
            display: none;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            gap: 10px;
            padding: 8px 10px;
            background: #0b0b0b;
            border-bottom: 1px solid #333;
            z-index: 9998;
            margin: 0;
        }
        body.yt-mode #ytControlsRow {
            display: flex;
            position: sticky;
            top: 56.25vw;
        }
        
        /* Toggle Switch - Red OFF, Green ON */
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
        
        /* Menu Button */
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
        }
        #ytMenuBtn:hover {
            background: rgba(255,51,0,0.2);
            border-color: #ff6600;
            transform: translateY(-1px);
        }
        #ytMenuBtn:active {
            transform: translateY(2px);
            box-shadow: 0 1px 0 rgba(0,0,0,0.3);
        }
        
        /* YouTube Mode - hide ONLY above player, keep below */
        body.yt-mode .title,
        body.yt-mode .subtitle-badge,
        body.yt-mode .social-text,
        body.yt-mode .social-row,
        body.yt-mode #ad-top,
        body.yt-mode .warning-box,
        body.yt-mode .double-tap-indicator {
            display: none !important;
        }
        
        /* YouTube Mode - video sticky top */
        body.yt-mode .video-box {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            border-radius: 0 !important;
            z-index: 9997 !important;
        }
        body.yt-mode {
            padding-top: 56.25vw !important;
        }
        
        /* Hide original menu in YouTube mode */
        body.yt-mode #menuToggleBtn {
            display: none !important;
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
        }
        
        /* Mini toggle */
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
        .video-box.mini-player #ytMiniToggle {
            display: block;
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
        controlsRow = document.createElement('div');
        controlsRow.id = 'ytControlsRow';
        
        // Menu button
        const menuBtn = document.createElement('button');
        menuBtn.id = 'ytMenuBtn';
        menuBtn.innerHTML = '☰ Menu';
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            if (typeof openMenu === 'function') {
                openMenu();
            }
        });
        controlsRow.appendChild(menuBtn);
        
        // Label
        const label = document.createElement('span');
        label.style.cssText = 'font-size:12px;color:#ccc;';
        label.textContent = 'YouTube Mode';
        controlsRow.appendChild(label);
        
        // Toggle switch
        toggleSwitch = document.createElement('div');
        toggleSwitch.id = 'ytToggleSwitch';
        toggleSwitch.innerHTML = '<div id="ytToggleKnob"></div>';
        toggleSwitch.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleYouTubeMode();
        });
        controlsRow.appendChild(toggleSwitch);
        
        // Insert after video
        videoBox.parentNode.insertBefore(controlsRow, videoBox.nextSibling);
        
        // Mini toggle
        miniToggle = document.createElement('div');
        miniToggle.id = 'ytMiniToggle';
        miniToggle.className = 'off';
        miniToggle.innerHTML = '<div class="mini-knob"></div>';
        miniToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleYouTubeMode();
        });
        videoBox.appendChild(miniToggle);
        
        // Drag to mini
        videoBox.addEventListener('mousedown', onDragStart);
        videoBox.addEventListener('touchstart', onDragStart, { passive: true });
        
        // Mini click to restore
        videoBox.addEventListener('click', function(e) {
            if (isMiniPlayer && !e.target.closest('#ytMiniToggle')) {
                restoreFromMini();
            }
        });
        
        // Page exit → mini
        window.addEventListener('beforeunload', function() {
            if (isYouTubeMode && !isMiniPlayer) makeMiniPlayer();
        });
    }
    
    // ========== TOGGLE ==========
    function toggleYouTubeMode() {
        isYouTubeMode = !isYouTubeMode;
        
        if (isYouTubeMode) {
            toggleSwitch.classList.add('active');
            document.body.classList.add('yt-mode');
            videoBox.classList.remove('mini-player');
            isMiniPlayer = false;
            miniToggle.style.display = 'none';
            controlsRow.style.display = 'flex';
            
            const menuToggle = document.getElementById('menuToggleBtn');
            if (menuToggle) menuToggle.style.display = 'none';
        } else {
            toggleSwitch.classList.remove('active');
            document.body.classList.remove('yt-mode');
            videoBox.classList.remove('mini-player');
            isMiniPlayer = false;
            miniToggle.style.display = 'none';
            controlsRow.style.display = 'none';
            
            const menuToggle = document.getElementById('menuToggleBtn');
            if (menuToggle) menuToggle.style.display = '';
        }
    }
    
    // ========== DRAG ==========
    function onDragStart(e) {
        if (!isYouTubeMode || isMiniPlayer) return;
        dragStartY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const onMove = function(ev) {
            const y = ev.touches ? ev.touches[0].clientY : ev.clientY;
            if (y - dragStartY > 60) {
                makeMiniPlayer();
                cleanup();
            }
        };
        const onEnd = function() { cleanup(); };
        function cleanup() {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onEnd);
        }
        
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchmove', onMove, { passive: true });
        document.addEventListener('touchend', onEnd);
    }
    
    function makeMiniPlayer() {
        videoBox.classList.add('mini-player');
        isMiniPlayer = true;
        document.body.classList.remove('yt-mode');
        miniToggle.style.display = 'block';
        miniToggle.classList.remove('off');
        controlsRow.style.display = 'none';
        
        const menuToggle = document.getElementById('menuToggleBtn');
        if (menuToggle) menuToggle.style.display = '';
    }
    
    function restoreFromMini() {
        videoBox.classList.remove('mini-player');
        isMiniPlayer = false;
        isYouTubeMode = true;
        miniToggle.style.display = 'none';
        document.body.classList.add('yt-mode');
        controlsRow.style.display = 'flex';
        
        const menuToggle = document.getElementById('menuToggleBtn');
        if (menuToggle) menuToggle.style.display = 'none';
    }
    
    // ========== START ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    console.log('✅ YouTube Mode ready - Menu only shows when ON');
    
})();
