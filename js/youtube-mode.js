// ============================================================
// YOUTUBE-MODE.JS - Final: Tight spacing, Menu only on YouTube mode
// ============================================================

(function() {
    'use strict';
    
    if (!window.location.pathname.includes('video.html')) return;
    
    let isYouTubeMode = false;
    let isMiniPlayer = false;
    let videoBox = null;
    let controlsRow = null;
    let dragStartY = 0;
    
    // Styles - MINIMAL spacing
    const styleTag = document.createElement('style');
    styleTag.textContent = `
        /* Controls Row - hidden by default, TIGHT to video */
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
        
        /* Menu Button - hidden initially, shown in YouTube mode */
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
        #ytMenuBtn:active {
            transform: translateY(2px);
            box-shadow: 0 0px 0 rgba(0,0,0,0.3);
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
        #ytToggleSwitch.active {
            background: #2ecc71;
        }
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
        #ytToggleSwitch.active #ytToggleKnob {
            left: 24px;
        }
        
        /* YouTube Mode - hide above-player elements */
        body.yt-mode .title,
        body.yt-mode .subtitle-badge,
        body.yt-mode .social-text,
        body.yt-mode .social-row,
        body.yt-mode #ad-top,
        body.yt-mode .sticky-search,
        body.yt-mode .warning-box,
        body.yt-mode .double-tap-indicator {
            display: none !important;
        }
        
        /* YouTube Mode - video fixed top */
        body.yt-mode .video-box {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            border-radius: 0 !important;
            z-index: 9997 !important;
        }
        
        /* YouTube Mode - controls sticky right below video */
        body.yt-mode #ytControlsRow {
            position: sticky;
            top: 56.25vw;
            z-index: 9998;
        }
        
        /* YouTube Mode body spacing */
        body.yt-mode {
            padding-top: 56.25vw !important;
        }
        
        /* YouTube Mode - hide original menu */
        body.yt-mode #menuToggleBtn {
            display: none !important;
        }
        
        /* Reduce video bottom margin */
        .video-box {
            margin-bottom: 0 !important;
        }
        
        /* Tighten container padding */
        body.yt-mode .container {
            padding-top: 0 !important;
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
    document.head.appendChild(styleTag);
    
    function init() {
        videoBox = document.querySelector('.video-box');
        if (!videoBox) return;
        
        // Create controls row
        controlsRow = document.createElement('div');
        controlsRow.id = 'ytControlsRow';
        
        // YouTube Mode label
        const label = document.createElement('span');
        label.textContent = 'YouTube Mode';
        label.style.cssText = 'font-size:11px;color:#999;';
        controlsRow.appendChild(label);
        
        // Toggle switch
        const toggle = document.createElement('div');
        toggle.id = 'ytToggleSwitch';
        toggle.innerHTML = '<div id="ytToggleKnob"></div>';
        toggle.onclick = function(e) {
            e.stopPropagation();
            isYouTubeMode = !isYouTubeMode;
            
            if (isYouTubeMode) {
                // ON
                toggle.classList.add('active');
                document.body.classList.add('yt-mode');
            } else {
                // OFF
                toggle.classList.remove('active');
                document.body.classList.remove('yt-mode');
            }
        };
        controlsRow.appendChild(toggle);
        
        // Menu button (hidden by default CSS)
        const menuBtn = document.createElement('button');
        menuBtn.id = 'ytMenuBtn';
        menuBtn.innerHTML = '☰ Menu';
        menuBtn.onclick = function(e) {
            e.stopPropagation();
            if (typeof openMenu === 'function') openMenu();
        };
        controlsRow.appendChild(menuBtn);
        
        // Insert right after video box
        videoBox.parentNode.insertBefore(controlsRow, videoBox.nextSibling);
        
        // Mini toggle
        const miniToggle = document.createElement('div');
        miniToggle.id = 'ytMiniToggle';
        miniToggle.innerHTML = '<div class="mini-knob"></div>';
        miniToggle.onclick = function(e) {
            e.stopPropagation();
            // Turn off YouTube mode
            isYouTubeMode = false;
            document.body.classList.remove('yt-mode');
            videoBox.classList.remove('mini-player');
            isMiniPlayer = false;
            miniToggle.style.display = 'none';
            document.getElementById('ytToggleSwitch').classList.remove('active');
        };
        videoBox.appendChild(miniToggle);
        
        // Drag to mini player
        videoBox.addEventListener('mousedown', function(e) {
            if (!isYouTubeMode || isMiniPlayer) return;
            dragStartY = e.clientY;
            
            function onMove(ev) {
                if (ev.clientY - dragStartY > 60) {
                    videoBox.classList.add('mini-player');
                    isMiniPlayer = true;
                    document.body.classList.remove('yt-mode');
                    miniToggle.style.display = 'block';
                    miniToggle.classList.remove('off');
                    cleanup();
                }
            }
            function onEnd() { cleanup(); }
            function cleanup() {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onEnd);
            }
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onEnd);
        });
        
        videoBox.addEventListener('touchstart', function(e) {
            if (!isYouTubeMode || isMiniPlayer) return;
            dragStartY = e.touches[0].clientY;
            
            function onMove(ev) {
                if (ev.touches[0].clientY - dragStartY > 60) {
                    videoBox.classList.add('mini-player');
                    isMiniPlayer = true;
                    document.body.classList.remove('yt-mode');
                    miniToggle.style.display = 'block';
                    miniToggle.classList.remove('off');
                    cleanup();
                }
            }
            function onEnd() { cleanup(); }
            function cleanup() {
                document.removeEventListener('touchmove', onMove);
                document.removeEventListener('touchend', onEnd);
            }
            document.addEventListener('touchmove', onMove, { passive: true });
            document.addEventListener('touchend', onEnd);
        });
        
        // Click mini player to restore
        videoBox.addEventListener('click', function(e) {
            if (isMiniPlayer && !e.target.closest('#ytMiniToggle')) {
                videoBox.classList.remove('mini-player');
                isMiniPlayer = false;
                isYouTubeMode = true;
                miniToggle.style.display = 'none';
                document.body.classList.add('yt-mode');
            }
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
