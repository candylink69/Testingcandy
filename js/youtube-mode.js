// ============================================================
// YOUTUBE-MODE.JS
// YouTube Mode + Manual Floating Window
// ============================================================

(function() {
    'use strict';

    if (!window.location.pathname.includes('video.html')) return;

    let isYouTubeMode = false;
    let isFloating = false;

    let videoBox = null;
    let controlsRow = null;
    let floatingBar = null;

    let dragStartX = 0;
    let dragStartY = 0;
    let floatStartX = 0;
    let floatStartY = 0;
    let isDragging = false;

    // ============================================================
    // STYLES
    // ============================================================

    const styleTag = document.createElement('style');

    styleTag.textContent = `

        /* ========================================================
           CONTROLS ROW
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
           YOUTUBE MODE LABEL
           ======================================================== */

        #ytModeLabel {
            font-size: 11px;
            color: #999;
        }


        /* ========================================================
           YOUTUBE MODE TOGGLE
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
           MENU BUTTON
           Only visible in YouTube Mode
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
            box-shadow: 0 0 0 rgba(0,0,0,0.3);
        }


        /* ========================================================
           FLOATING WINDOW BUTTON
           Only visible in YouTube Mode
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
           YOUTUBE MODE
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
           YOUTUBE MODE VIDEO
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
           YOUTUBE MODE CONTROLS
           ======================================================== */

        body.yt-mode #ytControlsRow {
            position: sticky;
            top: 56.25vw;
            z-index: 9998;
        }


        /* ========================================================
           YOUTUBE MODE BODY SPACE
           ======================================================== */

        body.yt-mode {
            padding-top: 56.25vw !important;
        }


        /* ========================================================
           ORIGINAL MENU HIDDEN IN YOUTUBE MODE
           ======================================================== */

        body.yt-mode #menuToggleBtn {
            display: none !important;
        }


        /* ========================================================
           VIDEO NORMAL SPACING
           ======================================================== */

        .video-box {
            margin-bottom: 0 !important;
        }

        body.yt-mode .container {
            padding-top: 0 !important;
        }


        /* ========================================================
           FLOATING VIDEO
           
           50% of full-screen width.
           Aspect ratio remains 16:9.
           ======================================================== */

        .video-box.yt-floating {
            position: fixed !important;

            width: 50vw !important;
            height: 28.125vw !important;

            top: auto !important;
            left: auto !important;

            margin: 0 !important;
            padding: 0 !important;

            border-radius: 10px !important;

            z-index: 9997 !important;

            box-shadow: 0 8px 30px rgba(0,0,0,0.75) !important;

            cursor: grab !important;

            transition: none !important;
        }

        .video-box.yt-floating:active {
            cursor: grabbing !important;
        }


        /* ========================================================
           FLOATING HEADER
           
           This is OUTSIDE the video itself.
           It sits directly ABOVE the floating video.
           ======================================================== */

        #ytFloatingBar {
            display: none;

            position: fixed;

            height: 28px;

            background: #111;

            border-radius: 8px 8px 0 0;

            z-index: 9998;

            align-items: center;

            justify-content: flex-end;

            padding: 0 5px;

            box-sizing: border-box;

            cursor: grab;

            box-shadow: 0 -2px 10px rgba(0,0,0,0.45);
        }

        #ytFloatingBar.dragging {
            cursor: grabbing;
        }


        /* ========================================================
           FLOATING OFF BUTTON
           ======================================================== */

        #ytFloatingOffBtn {
            width: 24px;
            height: 22px;

            border: 1px solid #555;

            border-radius: 5px;

            background: #e74c3c;

            color: #fff;

            font-size: 14px;
            line-height: 20px;

            padding: 0;

            cursor: pointer;

            display: flex;
            align-items: center;
            justify-content: center;

            box-shadow: 0 2px 5px rgba(0,0,0,0.4);
        }

        #ytFloatingOffBtn:hover {
            background: #ff5140;
        }

        #ytFloatingOffBtn:active {
            transform: scale(0.94);
        }


        /* ========================================================
           FLOATING MOBILE SIZE
           ======================================================== */

        @media (max-width: 600px) {

            .video-box.yt-floating {
                width: 50vw !important;
                height: 28.125vw !important;
                border-radius: 8px !important;
            }

            #ytFloatingBar {
                height: 26px;
                border-radius: 7px 7px 0 0;
            }

            #ytFloatingOffBtn {
                width: 23px;
                height: 20px;
                font-size: 13px;
            }
        }

    `;

    document.head.appendChild(styleTag);


    // ============================================================
    // INITIALIZE
    // ============================================================

    function init() {

        videoBox = document.querySelector('.video-box');

        if (!videoBox) return;


        // ========================================================
        // CONTROLS ROW
        // ========================================================

        controlsRow = document.createElement('div');
        controlsRow.id = 'ytControlsRow';


        // YouTube Mode label
        const label = document.createElement('span');

        label.id = 'ytModeLabel';
        label.textContent = 'YouTube Mode';

        controlsRow.appendChild(label);


        // ========================================================
        // YOUTUBE MODE TOGGLE
        // ========================================================

        const toggle = document.createElement('div');

        toggle.id = 'ytToggleSwitch';

        toggle.innerHTML = '<div id="ytToggleKnob"></div>';


        toggle.addEventListener('click', function(e) {

            e.stopPropagation();

            isYouTubeMode = !isYouTubeMode;

            if (isYouTubeMode) {

                // ----------------------------------------------
                // YOUTUBE MODE ON
                // ----------------------------------------------

                toggle.classList.add('active');

                document.body.classList.add('yt-mode');

            } else {

                // ----------------------------------------------
                // YOUTUBE MODE OFF
                // ----------------------------------------------

                toggle.classList.remove('active');

                // Floating must ALWAYS turn off
                // when YouTube Mode turns off.

                if (isFloating) {
                    turnFloatingOff();
                }

                document.body.classList.remove('yt-mode');
            }

        });

        controlsRow.appendChild(toggle);


        // ========================================================
        // MENU BUTTON
        // ========================================================

        const menuBtn = document.createElement('button');

        menuBtn.id = 'ytMenuBtn';

        menuBtn.innerHTML = '☰ Menu';

        menuBtn.addEventListener('click', function(e) {

            e.stopPropagation();

            if (typeof openMenu === 'function') {
                openMenu();
            }

        });

        controlsRow.appendChild(menuBtn);


        // ========================================================
        // FLOATING WINDOW BUTTON
        // ========================================================

        const floatingBtn = document.createElement('button');

        floatingBtn.id = 'ytFloatingBtn';

        floatingBtn.innerHTML = '▣ Floating';

        floatingBtn.addEventListener('click', function(e) {

            e.stopPropagation();

            if (!isYouTubeMode) return;

            if (isFloating) {
                turnFloatingOff();
            } else {
                turnFloatingOn();
            }

        });

        controlsRow.appendChild(floatingBtn);


        // ========================================================
        // INSERT CONTROLS AFTER VIDEO
        // ========================================================

        videoBox.parentNode.insertBefore(
            controlsRow,
            videoBox.nextSibling
        );


        // ========================================================
        // FLOATING BAR
        //
        // IMPORTANT:
        // This is NOT inside the video-box.
        // It is a separate element attached above it.
        // ========================================================

        floatingBar = document.createElement('div');

        floatingBar.id = 'ytFloatingBar';

        const floatingOffBtn = document.createElement('button');

        floatingOffBtn.id = 'ytFloatingOffBtn';

        floatingOffBtn.innerHTML = '×';

        floatingOffBtn.title = 'Turn Floating Off';

        floatingOffBtn.addEventListener('click', function(e) {

            e.preventDefault();
            e.stopPropagation();

            turnFloatingOff();

        });

        floatingBar.appendChild(floatingOffBtn);

        document.body.appendChild(floatingBar);


        // ========================================================
        // FLOATING BUTTON TEXT UPDATE
        // ========================================================

        function updateFloatingButton() {

            if (isFloating) {
                floatingBtn.innerHTML = '▣ Floating ON';
            } else {
                floatingBtn.innerHTML = '▣ Floating';
            }

        }


        // ========================================================
        // FLOATING ON
        // ========================================================

        window.turnFloatingOn = function() {

            if (!isYouTubeMode) return;

            if (isFloating) return;

            isFloating = true;

            videoBox.classList.add('yt-floating');

            /*
             * Start position:
             * Bottom area, slightly right.
             */

            const startLeft =
                Math.max(
                    10,
                    window.innerWidth - (window.innerWidth * 0.5) - 10
                );

            const startTop =
                Math.max(
                    50,
                    window.innerHeight -
                    (window.innerWidth * 0.28125) -
                    70
                );


            videoBox.style.left = startLeft + 'px';
            videoBox.style.top = startTop + 'px';

            videoBox.style.right = 'auto';
            videoBox.style.bottom = 'auto';


            floatingBar.style.display = 'flex';

            updateFloatingBarPosition();

            updateFloatingButton();

        };


        // ========================================================
        // FLOATING OFF
        // ========================================================

        window.turnFloatingOff = function() {

            if (!isFloating) return;

            isFloating = false;

            videoBox.classList.remove('yt-floating');


            /*
             * Remove all floating positioning.
             * YouTube Mode CSS will automatically put the
             * video back at the TOP in its normal YouTube Mode size.
             */

            videoBox.style.left = '';
            videoBox.style.top = '';
            videoBox.style.right = '';
            videoBox.style.bottom = '';


            floatingBar.style.display = 'none';

            updateFloatingButton();


            /*
             * Make absolutely sure YouTube Mode stays ON.
             */

            if (isYouTubeMode) {
                document.body.classList.add('yt-mode');
            }

        };


        // ========================================================
        // FLOATING BAR POSITION
        // ========================================================

        function updateFloatingBarPosition() {

            if (!isFloating) return;

            const rect = videoBox.getBoundingClientRect();

            floatingBar.style.left = rect.left + 'px';

            floatingBar.style.top =
                Math.max(0, rect.top - 28) + 'px';

            floatingBar.style.width =
                rect.width + 'px';

        }


        // ========================================================
        // DESKTOP DRAG
        //
        // Drag the floating header to move the whole window.
        // ========================================================

        floatingBar.addEventListener('mousedown', function(e) {

            if (!isFloating) return;

            // Don't start dragging when clicking OFF button
            if (e.target.closest('#ytFloatingOffBtn')) return;

            e.preventDefault();

            isDragging = true;

            floatingBar.classList.add('dragging');

            dragStartX = e.clientX;
            dragStartY = e.clientY;

            const rect = videoBox.getBoundingClientRect();

            floatStartX = rect.left;
            floatStartY = rect.top;


            function onMouseMove(ev) {

                if (!isDragging) return;

                const moveX = ev.clientX - dragStartX;
                const moveY = ev.clientY - dragStartY;

                let newLeft = floatStartX + moveX;
                let newTop = floatStartY + moveY;


                // Keep floating window inside screen

                const width = videoBox.offsetWidth;
                const height = videoBox.offsetHeight;

                const maxLeft =
                    window.innerWidth - width;

                const maxTop =
                    window.innerHeight - height;


                newLeft = Math.max(
                    0,
                    Math.min(newLeft, maxLeft)
                );

                newTop = Math.max(
                    28,
                    Math.min(newTop, maxTop)
                );


                videoBox.style.left = newLeft + 'px';
                videoBox.style.top = newTop + 'px';

                updateFloatingBarPosition();

            }


            function onMouseUp() {

                isDragging = false;

                floatingBar.classList.remove('dragging');

                document.removeEventListener(
                    'mousemove',
                    onMouseMove
                );

                document.removeEventListener(
                    'mouseup',
                    onMouseUp
                );

            }


            document.addEventListener(
                'mousemove',
                onMouseMove
            );

            document.addEventListener(
                'mouseup',
                onMouseUp
            );

        });


        ========================================================
        // MOBILE TOUCH DRAG
        //
        // Drag using the floating header.
        // ========================================================

        floatingBar.addEventListener(
            'touchstart',
            function(e) {

                if (!isFloating) return;

                // Don't drag when touching OFF button
                if (e.target.closest('#ytFloatingOffBtn')) return;

                const touch = e.touches[0];

                isDragging = true;

                dragStartX = touch.clientX;
                dragStartY = touch.clientY;

                const rect =
                    videoBox.getBoundingClientRect();

                floatStartX = rect.left;
                floatStartY = rect.top;

            },
            { passive: true }
        );


        document.addEventListener(
            'touchmove',
            function(e) {

                if (!isDragging || !isFloating) return;

                const touch = e.touches[0];

                const moveX =
                    touch.clientX - dragStartX;

                const moveY =
                    touch.clientY - dragStartY;

                let newLeft =
                    floatStartX + moveX;

                let newTop =
                    floatStartY + moveY;


                const width =
                    videoBox.offsetWidth;

                const height =
                    videoBox.offsetHeight;


                const maxLeft =
                    window.innerWidth - width;

                const maxTop =
                    window.innerHeight - height;


                newLeft = Math.max(
                    0,
                    Math.min(newLeft, maxLeft)
                );

                newTop = Math.max(
                    28,
                    Math.min(newTop, maxTop)
                );


                videoBox.style.left =
                    newLeft + 'px';

                videoBox.style.top =
                    newTop + 'px';

                updateFloatingBarPosition();

            },
            { passive: true }
        );


        document.addEventListener(
            'touchend',
            function() {

                isDragging = false;

            }
        );

        // ========================================================
        // KEEP FLOATING BAR ATTACHED ON RESIZE
        // ========================================================

        window.addEventListener(
            'resize',
            function() {

                if (!isFloating) return;

                updateFloatingBarPosition();

            }
        );


        // ========================================================
        // SAFETY:
        // IF YOUTUBE MODE IS OFF, FLOATING MUST NOT REMAIN.
        // ========================================================

        const observer =
            new MutationObserver(function() {

                if (
                    !document.body.classList.contains('yt-mode') &&
                    isFloating
                ) {
                    turnFloatingOff();
                }

            });


        observer.observe(
            document.body,
            {
                attributes: true,
                attributeFilter: ['class']
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
