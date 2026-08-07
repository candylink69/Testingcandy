// ============================================================
// YOUTUBE-MODE.JS - Working Version
// Add in video.html: <script src="js/youtube-mode.js"></script>
// ============================================================

(function() {
    'use strict';
    
    if (!window.location.pathname.includes('video.html')) return;
    
    let isYouTubeMode = false;
    let isMiniPlayer = false;
    let videoBox = null;
    let controlsRow = null;
    let dragStartY = 0;
    
    // Styles
    const styleTag = document.createElement('style');
    styleTag.textContent = `
        #ytControlsRow {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            gap: 10px;
            padding: 10px;
            background: #0b0b0b;
            border-bottom: 1px solid #333;
            margin: 0;
        }
        body.yt-mode #ytControlsRow {
            position: sticky;
            top: 56.25vw;
            z-index: 9998;
        }
        #ytToggleSwitch {
            width: 52px;
            height: 28px;
            background: #e74c3c;
            border-radius: 28px;
            position: relative;
            cursor: pointer;
            transition: background 0.3s;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.4);
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
            transition: left 0.3s;
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
            box-shadow: 0 3px 0 rgba(0,0,0,0.3);
        }
        #ytMenuBtn:hover {
            background: rgba(255,51,0,0.2);
            border-color: #ff6600;
        }
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
        body.yt-mode #menuToggleBtn {
            display: none !important;
        }
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
        
        // Controls row
        controlsRow = document.createElement('div');
        controlsRow.id = 'ytControlsRow';
        
        // YouTube Mode label
        const label = document.createElement('span');
        label.textContent = 'YouTube Mode';
        label.style.cssText = 'font-size:12px;color:#ccc;margin-right:4px;';
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
                controlsRow.style.position = 'sticky';
                controlsRow.style.top = '56.25vw';
                controlsRow.style.zIndex = '9998';
                document.getElementById('menuToggleBtn').style.display = 'none';
            } else {
                toggle.classList.remove('active');
                document.body.classList.remove('yt-mode');
                controlsRow.style.position = '';
                controlsRow.style.top = '';
                document.getElementById('menuToggleBtn').style.display = '';
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
        
        // Insert
        videoBox.parentNode.insertBefore(controlsRow, videoBox.nextSibling);
        
        // Mini toggle
        const miniToggle = document.createElement('div');
        miniToggle.id = 'ytMiniToggle';
        miniToggle.innerHTML = '<div class="mini-knob"></div>';
        miniToggle.onclick = function(e) {
            e.stopPropagation();
            isYouTubeMode = false;
            document.body.classList.remove('yt-mode');
            videoBox.classList.remove('mini-player');
            isMiniPlayer = false;
            miniToggle.style.display = 'none';
            document.getElementById('ytToggleSwitch').classList.remove('active');
            controlsRow.style.position = '';
            controlsRow.style.top = '';
            document.getElementById('menuToggleBtn').style.display = '';
        };
        videoBox.appendChild(miniToggle);
        
        // Drag
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
                    controlsRow.style.position = '';
                    document.getElementById('menuToggleBtn').style.display = '';
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
        
        // Touch drag
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
                    controlsRow.style.position = '';
                    document.getElementById('menuToggleBtn').style.display = '';
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
        
        // Mini click restore
        videoBox.addEventListener('click', function(e) {
            if (isMiniPlayer && !e.target.closest('#ytMiniToggle')) {
                videoBox.classList.remove('mini-player');
                isMiniPlayer = false;
                isYouTubeMode = true;
                miniToggle.style.display = 'none';
                document.body.classList.add('yt-mode');
                controlsRow.style.position = 'sticky';
                controlsRow.style.top = '56.25vw';
                controlsRow.style.zIndex = '9998';
                document.getElementById('menuToggleBtn').style.display = 'none';
            }
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
