// ============================================================
// YOUTUBE-MODE.JS - YouTube Mode + Manual Floating Window
// Based on original version
// ============================================================

(function() {
    'use strict';

    if (!window.location.pathname.includes('video.html')) return;

    let isYouTubeMode = false;
    let isFloating = false;
    let videoBox = null;
    let controlsRow = null;
    let floatingBar = null;

    // Floating position
    let floatX = 10;
    let floatY = 10;
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    // ============================================================
    // STYLES - ORIGINAL + FLOATING WINDOW
    // ============================================================

    const styleTag = document.createElement('style');

    styleTag.textContent = `

        /* ========================================================
           Controls Row - ORIGINAL
           ======================================================== */

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


        /* ========================================================
           Menu Button - ORIGINAL
           ======================================================== */

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


        /* ========================================================
           Toggle Switch - ORIGINAL
           ======================================================== */

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


        /* ========================================================
           FLOATING BUTTON
           Only visible when YouTube Mode is ON
           ======================================================== */

        #ytFloatingBtn {
            display: none;
            align-items: center;
            gap: 4px;
            padding: 4px 10px;
            background: rgba(255,255,255,0.08);
            color: #4fc3f7;
            border: 1px solid #444;
            border-radius: 20px;
            font-size: 12px;
            cursor: pointer;
            box-shadow: 0 2px 0 rgba(0,0,0,0.3);
            transition: 0.15s;
        }

        body.yt-mode #ytFloatingBtn {
            display: inline-flex;
        }

        #ytFloatingBtn:hover {
            background: rgba(79,195,247,0.15);
            border-color: #4fc3f7;
        }

        #ytFloatingBtn:active {
            transform: translateY(2px);
        }


        /* ========================================================
           YouTube Mode - ORIGINAL
           ======================================================== */

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


        /* ========================================================
           YouTube Mode - Video fixed top - ORIGINAL
           ======================================================== */

        body.yt-mode .video-box {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            border-radius: 0 !important;
            z-index: 9997 !important;
        }


        /* ========================================================
           YouTube Mode - Controls - ORIGINAL
           ======================================================== */

        body.yt-mode #ytControlsRow {
            position: sticky;
            top: 56.25vw;
            z-index: 9998;
        }


        /* ========================================================
           YouTube Mode body spacing - ORIGINAL
           ======================================================== */

        body.yt-mode {
            padding-top: 56.25vw !important;
        }


        /* ========================================================
           Hide original menu - ORIGINAL
           ======================================================== */

        body.yt-mode #menuToggleBtn {
            display: none !important;
        }


        /* ========================================================
           Video bottom margin - ORIGINAL
           ======================================================== */

        .video-box {
            margin-bottom: 0 !important;
        }


        /* ========================================================
           Container padding - ORIGINAL
           ======================================================== */

        body.yt-mode .container {
            padding-top: 0 !important;
        }


        /* ========================================================
           FLOATING VIDEO
           
           Approximately half of the original YouTube Mode width.
           16:9 ratio maintained.
           ======================================================== */

        .video-box.yt-floating {
            position: fixed !important;

            width: 50vw !important;
            height: 28.125vw !important;

            top: auto !important;
            left: auto !important;
            right: auto !important;
            bottom: auto !important;

            margin: 0 !important;
            padding-top: 0 !important;

            border-radius: 10px !important;

            z-index: 9997 !important;

            box-shadow: 0 8px 30px rgba(0,0,0,0.8) !important;

            cursor: grab !important;
        }

        .video-box.yt-floating:active {
            cursor: grabbing !important;
        }


        /* ========================================================
           FLOATING CONTROL BAR
           
           IMPORTANT:
           This is OUTSIDE the video.
           It sits above the video.
           ======================================================== */

        #ytFloatingBar {
            display: none;

            position: fixed;

            height: 28px;

            background: #111;

            border: 1px solid #333;

            border-bottom: none;

            border-radius: 9px 9px 0 0;

            z-index: 9998;

            box-sizing: border-box;

            align-items: center;

            justify-content: flex-end;

            padding-right: 4px;

            cursor: grab;
        }

        #ytFloatingBar.dragging {
            cursor: grabbing;
        }


        /* ========================================================
           FLOATING OFF BUTTON
           
           Outside the video, attached above it.
           ======================================================== */

        #ytFloatingOffBtn {
            width: 24px;
            height: 22px;

            padding: 0;

            border: 1px solid #555;
            border-radius: 5px;

            background: #e74c3c;

            color: #fff;

            font-size: 15px;
            line-height: 20px;

            display: flex;
            align-items: center;
            justify-content: center;

            cursor: pointer;

            box-shadow: 0 2px 5px rgba(0,0,0,0.5);
        }

        #ytFloatingOffBtn:hover {
            background: #ff5140;
        }

        #ytFloatingOffBtn:active {
            transform: scale(0.94);
        }


        /* ========================================================
           MOBILE
           ======================================================== */

        @media (max-width: 600px) {

            .video-box.yt-floating {
                width: 50vw !important;
                height: 28.125vw !important;
                border-radius: 9px !important;
            }

            #ytFloatingBar {
                height: 26px;
            }

            #ytFloatingOffBtn {
                width: 23px;
                height: 20px;
                font-size: 14px;
            }
        }

    `;

    document.head.appendChild(styleTag);


    // ============================================================
    // INIT
    // ============================================================

    function init() {

        videoBox = document.querySelector('.video-box');

        if (!videoBox) return;


        // ========================================================
        // CONTROLS ROW - ORIGINAL
        // ========================================================

        controlsRow = document.createElement('div');
        controlsRow.id = 'ytControlsRow';


        // YouTube Mode label
        const label = document.createElement('span');

        label.textContent = 'YouTube Mode';

        label.style.cssText =
            'font-size:11px;color:#999;';

        controlsRow.appendChild(label);


        // ========================================================
        // YOUTUBE MODE TOGGLE - ORIGINAL
        // ========================================================

        const toggle = document.createElement('div');

        toggle.id = 'ytToggleSwitch';

        toggle.innerHTML =
            '<div id="ytToggleKnob"></div>';

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

                // If floating is active, turn it off first.
                if (isFloating) {
                    turnFloatingOff();
                }

                document.body.classList.remove('yt-mode');

            }

        };

        controlsRow.appendChild(toggle);


        // ========================================================
        // MENU BUTTON - ORIGINAL
        // ========================================================

        const menuBtn = document.createElement('button');

        menuBtn.id = 'ytMenuBtn';

        menuBtn.innerHTML = '☰ Menu';

        menuBtn.onclick = function(e) {

            e.stopPropagation();

            if (typeof openMenu === 'function') {
                openMenu();
            }

        };

        controlsRow.appendChild(menuBtn);


        // ========================================================
        // NEW FLOATING BUTTON
        // Only appears in YouTube Mode
        // ========================================================

        const floatingBtn = document.createElement('button');

        floatingBtn.id = 'ytFloatingBtn';

        floatingBtn.innerHTML = '▣ Floating';

        floatingBtn.onclick = function(e) {

            e.stopPropagation();

            if (!isYouTubeMode) return;

            if (isFloating) {
                turnFloatingOff();
            } else {
                turnFloatingOn();
            }

        };

        controlsRow.appendChild(floatingBtn);


        // ========================================================
        // INSERT CONTROLS AFTER VIDEO - ORIGINAL
        // ========================================================

        videoBox.parentNode.insertBefore(
            controlsRow,
            videoBox.nextSibling
        );


        // ========================================================
        // FLOATING CONTROL BAR
        //
        // Separate element.
        // NOT inside videoBox.
        // ========================================================

        floatingBar = document.createElement('div');

        floatingBar.id = 'ytFloatingBar';


        // Floating OFF button
        const floatingOffBtn =
            document.createElement('button');

        floatingOffBtn.id =
            'ytFloatingOffBtn';

        floatingOffBtn.innerHTML = '×';

        floatingOffBtn.title =
            'Turn Floating Off';


        floatingOffBtn.onclick = function(e) {

            e.preventDefault();
            e.stopPropagation();

            turnFloatingOff();

        };


        floatingBar.appendChild(
            floatingOffBtn
        );


        // Add floating bar directly to body
        document.body.appendChild(
            floatingBar
        );


        // ========================================================
        // FLOATING BUTTON TEXT
        // ========================================================

        function updateFloatingButton() {

            if (isFloating) {

                floatingBtn.innerHTML =
                    '▣ Floating ON';

            } else {

                floatingBtn.innerHTML =
                    '▣ Floating';

            }

        }


        // ========================================================
        // UPDATE FLOATING BAR POSITION
        // ========================================================

        function updateFloatingBarPosition() {

            if (!isFloating) return;

            const rect =
                videoBox.getBoundingClientRect();

            floatingBar.style.left =
                rect.left + 'px';

            floatingBar.style.top =
                Math.max(0, rect.top - 28) + 'px';

            floatingBar.style.width =
                rect.width + 'px';

        }


        // ========================================================
        // FLOATING ON
        // ========================================================

        window.turnFloatingOn = function() {

            if (!isYouTubeMode) return;

            if (isFloating) return;

            isFloating = true;


            // Add floating class
            videoBox.classList.add(
                'yt-floating'
            );


            // ====================================================
            // START POSITION
            // Bottom-right area
            // ====================================================

            const floatingWidth =
                window.innerWidth * 0.50;

            const floatingHeight =
                window.innerWidth * 0.28125;


            floatX =
                window.innerWidth -
                floatingWidth -
                10;

            floatY =
                window.innerHeight -
                floatingHeight -
                70;


            // Keep inside screen
            floatX =
                Math.max(0, floatX);

            floatY =
                Math.max(30, floatY);


            videoBox.style.left =
                floatX + 'px';

            videoBox.style.top =
                floatY + 'px';


            // Make floating bar visible
            floatingBar.style.display =
                'flex';


            updateFloatingBarPosition();

            updateFloatingButton();

        };


        // ========================================================
        // FLOATING OFF
        // ========================================================

        window.turnFloatingOff = function() {

            if (!isFloating) return;

            isFloating = false;


            // Remove floating class
            videoBox.classList.remove(
                'yt-floating'
            );


            // Remove floating positioning
            videoBox.style.left = '';
            videoBox.style.top = '';
            videoBox.style.right = '';
            videoBox.style.bottom = '';


            // Hide floating bar
            floatingBar.style.display =
                'none';


            updateFloatingButton();


            // IMPORTANT:
            // YouTube Mode stays ON.
            // Video therefore returns to the
            // original YouTube Mode position/size.

            if (isYouTubeMode) {
                document.body.classList.add(
                    'yt-mode'
                );
            }

        };


        // ========================================================
        // DESKTOP DRAG
        //
        // Drag from the bar above the video.
        // ========================================================

        floatingBar.addEventListener(
            'mousedown',
            function(e) {

                if (!isFloating) return;

                // Don't drag when clicking OFF
                if (
                    e.target.closest(
                        '#ytFloatingOffBtn'
                    )
                ) {
                    return;
                }

                e.preventDefault();

                isDragging = true;

                floatingBar.classList.add(
                    'dragging'
                );


                const rect =
                    videoBox.getBoundingClientRect();


                dragOffsetX =
                    e.clientX - rect.left;

                dragOffsetY =
                    e.clientY - rect.top;


                function onMove(ev) {

                    if (!isDragging) return;


                    let newX =
                        ev.clientX -
                        dragOffsetX;

                    let newY =
                        ev.clientY -
                        dragOffsetY;


                    const width =
                        videoBox.offsetWidth;

                    const height =
                        videoBox.offsetHeight;


                    // Keep video inside screen

                    newX =
                        Math.max(
                            0,
                            Math.min(
                                newX,
                                window.innerWidth - width
                            )
                        );


                    newY =
                        Math.max(
                            28,
                            Math.min(
                                newY,
                                window.innerHeight - height
                            )
                        );


                    videoBox.style.left =
                        newX + 'px';

                    videoBox.style.top =
                        newY + 'px';


                    updateFloatingBarPosition();

                }


                function onEnd() {

                    isDragging = false;

                    floatingBar.classList.remove(
                        'dragging'
                    );


                    document.removeEventListener(
                        'mousemove',
                        onMove
                    );

                    document.removeEventListener(
                        'mouseup',
                        onEnd
                    );

                }


                document.addEventListener(
                    'mousemove',
                    onMove
                );

                document.addEventListener(
                    'mouseup',
                    onEnd
                );

            }
        );


        // ========================================================
        // MOBILE DRAG
        //
        // Drag from the bar above the video.
        // ========================================================

        floatingBar.addEventListener(
            'touchstart',
            function(e) {

                if (!isFloating) return;

                if (
                    e.target.closest(
                        '#ytFloatingOffBtn'
                    )
                ) {
                    return;
                }


                const touch =
                    e.touches[0];

                const rect =
                    videoBox.getBoundingClientRect();


                dragOffsetX =
                    touch.clientX -
                    rect.left;

                dragOffsetY =
                    touch.clientY -
                    rect.top;


                isDragging = true;

            },
            {
                passive: true
            }
        );


        document.addEventListener(
            'touchmove',
            function(e) {

                if (
                    !isDragging ||
                    !isFloating
                ) {
                    return;
                }


                const touch =
                    e.touches[0];


                let newX =
                    touch.clientX -
                    dragOffsetX;

                let newY =
                    touch.clientY -
                    dragOffsetY;


                const width =
                    videoBox.offsetWidth;

                const height =
                    videoBox.offsetHeight;


                newX =
                    Math.max(
                        0,
                        Math.min(
                            newX,
                            window.innerWidth - width
                        )
                    );


                newY =
                    Math.max(
                        28,
                        Math.min(
                            newY,
                            window.innerHeight - height
                        )
                    );


                videoBox.style.left =
                    newX + 'px';

                videoBox.style.top =
                    newY + 'px';


                updateFloatingBarPosition();

            },
            {
                passive: true
            }
        );


        document.addEventListener(
            'touchend',
            function() {

                isDragging = false;

            }
        );


        // ========================================================
        // WINDOW RESIZE
        // ========================================================

        window.addEventListener(
            'resize',
            function() {

                if (!isFloating) return;

                updateFloatingBarPosition();

            }
        );

    }


    // ============================================================
    // START
    // ============================================================

    if (document.readyState === 'loading') {

        document.addEventListener(
            'DOMContentLoaded',
            init
        );

    } else {

        init();

    }

})();
