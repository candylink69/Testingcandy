// ============================================================
// ADS.JS - Saare Ad Codes (Bilkul Copy-Paste, Kuch Change Nahi)
// ============================================================

// ========== AD KEYS (Bilkul Purane Wale) ==========
const KEY_320x50   = '56b3e3a26900c426b81430f9f85a31d6';
const KEY_300x250  = '8e09ed2a29423c808ccb93e333fa00c5';
const KEY_728x90   = '57e196c0c8406efacc614d4b4d21d13d';

// Smartlink / Native Banner Keys (HTML mein static hain, isliye yahan nahi daale)


// ========== 1. CORE FUNCTION: Ek Ad Load Karna ==========
// Yeh function kisi bhi container mein ad inject karega
function loadAd(containerId, key, width, height) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Purana content hatao
    container.innerHTML = '';
    
    // atOptions wala script (Bilkul waise hi jaise HTML mein tha)
    const script1 = document.createElement('script');
    script1.innerHTML = `var atOptions = {'key': '${key}', 'format': 'iframe', 'height': ${height}, 'width': ${width}, 'params': {}};`;
    
    // invoke.js wala script (Random query param ke saath)
    const script2 = document.createElement('script');
    script2.src = 'https://encyclopediainsoluble.com/' + key + '/invoke.js?x=' + Math.random();
    script2.async = true;
    
    // Dono scripts container mein daalo
    container.appendChild(script1);
    container.appendChild(script2);
}


// ========== 2. INLINE AD (Index ke grid ke beech wala) ==========
// Index.js is function ko call karega har 5 videos ke baad
function loadInlineAd(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Pehle se kuch hai toh hatao
    container.innerHTML = '';
    
    // Inline ad ke liye hamesha 320x50 use karte hain (mobile friendly)
    const script1 = document.createElement('script');
    script1.innerHTML = `var atOptions = {'key': '${KEY_320x50}', 'format': 'iframe', 'height': 50, 'width': 320, 'params': {}};`;
    
    const script2 = document.createElement('script');
    script2.src = 'https://encyclopediainsoluble.com/' + KEY_320x50 + '/invoke.js?x=' + Math.random();
    script2.async = true;
    
    container.appendChild(script1);
    container.appendChild(script2);
}


// ========== 3. LOAD ALL MAJOR ADS (Top, Bottom, Sticky) ==========
function loadAllAds() {
    const isMobile = window.innerWidth < 768;

    // --- TOP AD ---
    // Mobile: 320x50, Desktop: 728x90
    if (isMobile) {
        loadAd('ad-top', KEY_320x50, 320, 50);
    } else {
        loadAd('ad-top', KEY_728x90, 728, 90);
    }

    // --- BOTTOM AD ---
    // Mobile: 300x250, Desktop: 728x90
    if (isMobile) {
        loadAd('ad-bottom', KEY_300x250, 300, 250);
    } else {
        loadAd('ad-bottom', KEY_728x90, 728, 90);
    }

    // --- STICKY AD (Hamesha 320x50) ---
    loadAd('sticky', KEY_320x50, 320, 50);
}


// ========== 4. AD REFRESH SYSTEM (Bilkul Purana Logic) ==========
let refreshCount = 0;
const MAX_REFRESHES = 3;      // Zyada se zyada 3 baar refresh hoga
let lastActivity = Date.now();
let lastRefresh = 0;
let isUserActive = true;
let refreshTimer = null;

// --- Activity Track Karna (User active hai ya nahi) ---
const activityEvents = ['mousedown', 'mousemove', 'scroll', 'touchstart', 'click', 'keydown'];
activityEvents.forEach(event => {
    document.addEventListener(event, () => {
        lastActivity = Date.now();
        isUserActive = true;
        trySmartRefresh();
    }, { passive: true });
});

// Har 10 second mein check karein agar user 30 sec se inactive hai toh flag off karein
setInterval(() => {
    if (Date.now() - lastActivity > 30000) {
        isUserActive = false;
    }
}, 10000);

// --- Smart Refresh Try Karna ---
function trySmartRefresh() {
    const now = Date.now();
    
    // Conditions: Refresh limit se kam, 2 min se zyada ho gaya, user active hai, tab visible hai
    if (refreshCount >= MAX_REFRESHES) return;
    if (now - lastRefresh < 120000) return;  // 2 min se pehle mat refresh karo
    if (now - lastActivity > 15000) return;  // 15 sec se inactive hai toh mat karo
    if (!isUserActive) return;
    if (document.hidden) return;
    if (Math.random() > 0.2) return;          // Sirf 20% mauke par refresh kare (traffic bachane ke liye)

    const delay = 2000 + Math.random() * 3000; // 2-5 sec delay
    setTimeout(() => {
        if (refreshCount < MAX_REFRESHES && Date.now() - lastActivity < 20000 && isUserActive && !document.hidden) {
            loadAllAds();   // Saare major ads reload karo
            refreshCount++;
            lastRefresh = Date.now();
            console.log('🔄 Ads Refreshed (Count: ' + refreshCount + ')');
        }
    }, delay);
}

// --- Schedule Refresh (Pehli baar call karne ke liye) ---
function scheduleRefresh() {
    if (refreshTimer) clearTimeout(refreshTimer);
    if (refreshCount >= MAX_REFRESHES) return;
    
    const delay = 120000 + Math.random() * 120000; // 2-4 minute ka random delay
    refreshTimer = setTimeout(() => {
        trySmartRefresh();
        // Agar refresh limit nahi pahunchi toh dobara schedule karo
        if (refreshCount < MAX_REFRESHES) {
            scheduleRefresh();
        }
    }, delay);
}


// ========== 5. INITIALIZE ADS ==========
document.addEventListener('DOMContentLoaded', function() {
    // 1. Pehli baar saare ads load karo
    loadAllAds();
    
    // 2. User active flag set karo
    isUserActive = true;
    lastActivity = Date.now();
    
    // 3. Refresh schedule karo (45 sec baad pehla try)
    setTimeout(() => {
        if (refreshCount < MAX_REFRESHES && Date.now() - lastActivity < 30000) {
            trySmartRefresh();
        }
        // Baaki schedule chalta rahega
        scheduleRefresh();
    }, 45000);
});

// --- Window close hone par timer clean karo ---
window.addEventListener('beforeunload', function() {
    if (refreshTimer) clearTimeout(refreshTimer);
});

// --- Visibility change par (Tab switch) ---
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && isUserActive && refreshCount < MAX_REFRESHES) {
        trySmartRefresh();
    }
});

// ========== GLOBAL FUNCTIONS EXPOSE KARO (Taaki index.js/list.js/video.js use kar sakein) ==========
window.loadAd = loadAd;
window.loadAllAds = loadAllAds;
window.loadInlineAd = loadInlineAd;
window.trySmartRefresh = trySmartRefresh;

console.log('✅ ads.js loaded successfully!');
