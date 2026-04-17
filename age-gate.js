// Fail-Safe Age Gate logic
(function() {
    try {
        // 1. Check if verified already
        const isVerified = localStorage.getItem('candylink-verified');
        if (isVerified === 'true') return;

        // 2. Build the Age Gate
        const overlay = document.createElement('div');
        overlay.id = 'age-gate-overlay';
        overlay.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.98); z-index:999999; display:flex; align-items:center; justify-content:center; color:white; font-family:sans-serif; text-align:center; padding:20px;";

        overlay.innerHTML = `
            <div style="max-width:400px; border:2px solid #ff0055; padding:40px 20px; border-radius:20px; background:#000; box-shadow: 0 0 20px rgba(255,0,85,0.5);">
                <h1 style="color:#ff0055; font-size:40px; margin:0 0 10px 0;">18+</h1>
                <h2 style="margin-bottom:20px;">ADULT CONTENT</h2>
                <p style="font-size:16px; color:#ccc; margin-bottom:30px;">You must be 18+ to enter this site. Content may be explicit.</p>
                <button id="accept-age" style="background:#ff0055; color:white; border:none; padding:15px 40px; border-radius:30px; font-weight:bold; font-size:18px; cursor:pointer; width:100%; margin-bottom:15px;">I AM 18+</button>
                <button id="exit-age" style="background:transparent; color:#888; border:none; text-decoration:underline; cursor:pointer; font-size:14px;">EXIT</button>
            </div>
        `;

        // 3. Attach it to the page
        document.body.appendChild(overlay);

        // Accept Logic
        document.getElementById('accept-age').onclick = function() {
            try {
                localStorage.setItem('candylink-verified', 'true');
            } catch(e) { console.warn("Storage full or blocked"); }
            overlay.remove();
        };

        // Exit Logic
        document.getElementById('exit-age').onclick = function() {
            window.location.href = "https://www.google.com";
        };

    } catch (error) {
        // Agar kuch bhi galat hua (error), toh ye line site ko chalne degi aur age gate skip kar degi
        console.error("Age gate error, skipping for safety:", error);
        const overlay = document.getElementById('age-gate-overlay');
        if(overlay) overlay.remove();
    }
})();

