// ============================================
// BUBBLE SYSTEM CORE - v2.1 (90% Transparent)
// ============================================

(function() {
  'use strict';

  // ---------- CONFIGURATION ----------
  const STORAGE_KEY = 'bubble_system_state';
  const COOLDOWN_HOURS = 3;
  const TOTAL_BUBBLES = 8;
  
  // Updated to 45px for all bubbles
  const BUBBLE_SIZES = { 
    'shape-1.svg': 45, 
    'shape-2.svg': 45, 
    'shape-3.svg': 45, 
    'shape-4.svg': 45 
  };
  
  // Smart Links
  const SMART_LINKS = {
    link1: 'https://encyclopediainsoluble.com/b4m2cdnq?key=f7aec115e88a384bd7f491fad307520f',
    link2: 'https://encyclopediainsoluble.com/ic3viem3?key=d8a39cb15c37e9d1cc63d60698447f0c',
    link3: 'https://encyclopediainsoluble.com/ttzdt6tvxv?key=463b39357a16bf8d3ceffa3a8fbf4bd5',
    link4: 'https://encyclopediainsoluble.com/fhgez7an?key=391cec1be41d65de0c6c381b80925b02'
  };

  // Bubble Configuration
  const BUBBLE_CONFIG = [
    { shape: 'shape-1.svg', link: SMART_LINKS.link1, toast: 'Horny 😈', toastClass: 'horny', sound: 's1' },
    { shape: 'shape-2.svg', link: SMART_LINKS.link2, toast: 'Lucky 🍀', toastClass: 'lucky', sound: 's2' },
    { shape: 'shape-3.svg', link: SMART_LINKS.link3, toast: 'Naughty 🔥', toastClass: 'naughty', sound: 's3' },
    { shape: 'shape-4.svg', link: SMART_LINKS.link4, toast: 'Bad Luck 💔', toastClass: 'badluck', sound: 's4' },
    { shape: 'shape-1.svg', link: null, toast: 'Horny 😈', toastClass: 'horny', sound: 's1' },
    { shape: 'shape-2.svg', link: null, toast: 'Lucky 🍀', toastClass: 'lucky', sound: 's2' },
    { shape: 'shape-3.svg', link: null, toast: 'Naughty 🔥', toastClass: 'naughty', sound: 's3' },
    { shape: 'shape-4.svg', link: null, toast: 'Bad Luck 💔', toastClass: 'badluck', sound: 's4' }
  ];

  // Heart Progress Messages
  const HEART_MESSAGES = [
    'Pop to get horny',
    'Good start 😏',
    'Nice 😉',
    'Naughty 🔥',
    'Hot 🥵',
    'Steamy 💦',
    'Ready? 😈',
    'Almost 💋',
    'HORNY! 💕'
  ];

  // ---------- STATE ----------
  let poppedCount = 0;
  let bubbles = [];
  let heartFill, heartText;
  let uiGlowActive = false;
  let isInitialized = false;
  let animationFrame = null;

  // ---------- STORAGE FUNCTIONS ----------
  function checkCooldown() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return false;
      
      const state = JSON.parse(data);
      const now = Date.now();
      const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000;
      
      if (state.completed && (now - state.completedAt) < cooldownMs) {
        applyUIGlow();
        return true;
      }
      
      if (state.completed && (now - state.completedAt) >= cooldownMs) {
        localStorage.removeItem(STORAGE_KEY);
      }
      
      return false;
    } catch (e) {
      console.warn('Bubble: Storage check failed', e);
      return false;
    }
  }

  function saveProgress(completed = false) {
    try {
      const state = {
        poppedCount: poppedCount,
        completed: completed,
        completedAt: completed ? Date.now() : null
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function loadProgress() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const state = JSON.parse(data);
        if (!state.completed) {
          poppedCount = state.poppedCount || 0;
        }
      }
    } catch (e) {}
  }

  // ---------- UI GLOW ----------
  function applyUIGlow() {
    if (!uiGlowActive) {
      document.body.classList.add('bubble-ui-glow');
      uiGlowActive = true;
    }
  }

  // ---------- COLLISION DETECTION ----------
  function checkCollision(b1, b2, minDistance) {
    const x1 = parseFloat(b1.style.left) || 0;
    const y1 = parseFloat(b1.style.top) || 0;
    const x2 = parseFloat(b2.style.left) || 0;
    const y2 = parseFloat(b2.style.top) || 0;
    
    const dx = x1 - x2;
    const dy = y1 - y2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < minDistance;
  }

  function resolveCollisions() {
    const activeBubbles = bubbles.filter(b => b.parentNode && b.dataset.popped !== 'true');
    
    for (let i = 0; i < activeBubbles.length; i++) {
      for (let j = i + 1; j < activeBubbles.length; j++) {
        const b1 = activeBubbles[i];
        const b2 = activeBubbles[j];
        
        const size1 = BUBBLE_SIZES[b1.dataset.shape] || 45;
        const size2 = BUBBLE_SIZES[b2.dataset.shape] || 45;
        const minDist = (size1 + size2) / 2 + 10;
        
        if (checkCollision(b1, b2, minDist)) {
          const x1 = parseFloat(b1.style.left) || 0;
          const y1 = parseFloat(b1.style.top) || 0;
          const x2 = parseFloat(b2.style.left) || 0;
          const y2 = parseFloat(b2.style.top) || 0;
          
          const dx = x2 - x1;
          const dy = y2 - y1;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > 0) {
            const angle = Math.atan2(dy, dx);
            const pushX = Math.cos(angle) * (minDist - dist) * 0.6;
            const pushY = Math.sin(angle) * (minDist - dist) * 0.6;
            
            let newX1 = x1 - pushX;
            let newY1 = y1 - pushY;
            let newX2 = x2 + pushX;
            let newY2 = y2 + pushY;
            
            const padding = 20;
            newX1 = Math.max(padding, Math.min(window.innerWidth - size1 - padding, newX1));
            newY1 = Math.max(padding, Math.min(window.innerHeight - size1 - padding, newY1));
            newX2 = Math.max(padding, Math.min(window.innerWidth - size2 - padding, newX2));
            newY2 = Math.max(padding, Math.min(window.innerHeight - size2 - padding, newY2));
            
            b1.style.left = newX1 + 'px';
            b1.style.top = newY1 + 'px';
            b2.style.left = newX2 + 'px';
            b2.style.top = newY2 + 'px';
          }
        }
      }
    }
  }

  // ---------- SMOOTH MOVEMENT ----------
  function smoothMovement() {
    const activeBubbles = bubbles.filter(b => b.parentNode && b.dataset.popped !== 'true');
    
    activeBubbles.forEach(bubble => {
      if (!bubble.dataset.vx) {
        bubble.dataset.vx = (Math.random() - 0.5) * 1.5;
        bubble.dataset.vy = (Math.random() - 0.5) * 1.5;
      }
      
      let vx = parseFloat(bubble.dataset.vx) || 0;
      let vy = parseFloat(bubble.dataset.vy) || 0;
      
      if (Math.random() < 0.02) {
        vx += (Math.random() - 0.5) * 0.8;
        vy += (Math.random() - 0.5) * 0.8;
      }
      
      const maxSpeed = 2.5;
      const speed = Math.sqrt(vx * vx + vy * vy);
      if (speed > maxSpeed) {
        vx = (vx / speed) * maxSpeed;
        vy = (vy / speed) * maxSpeed;
      }
      
      let newX = (parseFloat(bubble.style.left) || 0) + vx;
      let newY = (parseFloat(bubble.style.top) || 0) + vy;
      
      const size = BUBBLE_SIZES[bubble.dataset.shape] || 45;
      const padding = 10;
      
      if (newX < padding || newX > window.innerWidth - size - padding) {
        vx = -vx * 0.9;
        newX = Math.max(padding, Math.min(window.innerWidth - size - padding, newX));
      }
      
      if (newY < padding || newY > window.innerHeight - size - padding) {
        vy = -vy * 0.9;
        newY = Math.max(padding, Math.min(window.innerHeight - size - padding, newY));
      }
      
      bubble.dataset.vx = vx;
      bubble.dataset.vy = vy;
      bubble.style.left = newX + 'px';
      bubble.style.top = newY + 'px';
    });
    
    resolveCollisions();
    animationFrame = requestAnimationFrame(smoothMovement);
  }

  // ---------- HEART PROGRESS ----------
  function createHeartProgress() {
    const wrapper = document.createElement('div');
    wrapper.className = 'bubble-heart-wrapper';
    wrapper.id = 'bubbleHeartWrapper';
    
    wrapper.innerHTML = `
      <div class="bubble-heart-container">
        <div class="bubble-heart-fill" id="bubbleHeartFill" style="height: 0%;"></div>
        <div class="bubble-heart-outline">❤️</div>
        <div class="bubble-heart-text" id="bubbleHeartText">${HEART_MESSAGES[0]}</div>
      </div>
    `;
    
    document.body.appendChild(wrapper);
    
    heartFill = document.getElementById('bubbleHeartFill');
    heartText = document.getElementById('bubbleHeartText');
  }

  function updateHeartProgress() {
    if (!heartFill || !heartText) return;
    
    const percentage = (poppedCount / TOTAL_BUBBLES) * 100;
    heartFill.style.height = percentage + '%';
    
    const messageIndex = Math.min(poppedCount, HEART_MESSAGES.length - 1);
    heartText.textContent = HEART_MESSAGES[messageIndex];
    
    if (poppedCount < TOTAL_BUBBLES) {
      saveProgress(false);
    }
  }

  // ---------- TOAST MESSAGES ----------
  function showToast(message, className, bubble) {
    const toast = document.createElement('div');
    toast.className = `bubble-toast ${className}`;
    toast.textContent = message;
    
    const bubbleX = parseFloat(bubble.style.left) || 0;
    const bubbleY = parseFloat(bubble.style.top) || 0;
    const size = BUBBLE_SIZES[bubble.dataset.shape] || 45;
    
    toast.style.left = (bubbleX + size / 2) + 'px';
    toast.style.top = (bubbleY - 10) + 'px';
    toast.style.transform = 'translateX(-50%)';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 1200);
  }

  // ---------- KISS REWARD ----------
  function showKissReward() {
    if (typeof playKissSound === 'function') {
      playKissSound();
    }
    
    const kiss = document.createElement('div');
    kiss.className = 'bubble-kiss-overlay';
    kiss.textContent = '💋';
    document.body.appendChild(kiss);
    
    setTimeout(() => {
      if (kiss.parentNode) kiss.remove();
    }, 2000);
    
    applyUIGlow();
    saveProgress(true);
  }

  // ---------- BUBBLE POP HANDLER ----------
  function handleBubblePop(bubble, config, index) {
    return function(e) {
      e.stopPropagation();
      
      if (bubble.dataset.popped === 'true') return;
      bubble.dataset.popped = 'true';
      
      if (typeof playSound === 'function' && config.sound) {
        playSound(config.sound);
      }
      
      showToast(config.toast, config.toastClass, bubble);
      
      if (config.link) {
        window.open(config.link, '_blank');
      }
      
      bubble.classList.add('bubble-system-pop');
      
      setTimeout(() => {
        if (bubble.parentNode) bubble.remove();
      }, 350);
      
      poppedCount++;
      updateHeartProgress();
      
      if (poppedCount >= TOTAL_BUBBLES) {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
        
        bubbles.forEach(b => {
          if (b.parentNode && b.dataset.popped !== 'true') b.remove();
        });
        
        showKissReward();
      }
    };
  }

  // ---------- CREATE BUBBLES ----------
  function createBubble(config, index) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble-system-bubble';
    bubble.dataset.index = index;
    bubble.dataset.popped = 'false';
    bubble.dataset.shape = config.shape;
    
    const size = BUBBLE_SIZES[config.shape] || 45;
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    
    // Start from heart position
    const heartX = window.innerWidth - 70;
    const heartY = window.innerHeight - 70;
    bubble.style.left = heartX + 'px';
    bubble.style.top = heartY + 'px';
    
    // Create liquid bubble container
    const container = document.createElement('div');
    container.className = 'bubble-container';
    
    const img = document.createElement('img');
    img.src = `bubble-system/assets/shapes/${config.shape}`;
    img.alt = 'Bubble';
    img.draggable = false;
    
    // Set glow color based on shape
    if (config.shape === 'shape-1.svg') img.style.color = '#000000';
    else if (config.shape === 'shape-2.svg') img.style.color = '#D2B48C';
    else if (config.shape === 'shape-3.svg') img.style.color = '#FF69B4';
    else if (config.shape === 'shape-4.svg') img.style.color = '#8B0000';
    
    container.appendChild(img);
    bubble.appendChild(container);
    
    // ✅ ADD CLICK TEXT (Bubble ke upar chipka hua)
    const clickText = document.createElement('span');
    clickText.className = 'bubble-click-text';
    clickText.textContent = '🫦Click Me🧚🏻‍♀️';
    bubble.appendChild(clickText);
    
    bubble.addEventListener('click', handleBubblePop(bubble, config, index));
    
    document.body.appendChild(bubble);
    
    // Entrance animation
    setTimeout(() => {
      const padding = 50;
      const targetX = padding + Math.random() * (window.innerWidth - size - 2 * padding);
      const targetY = padding + Math.random() * (window.innerHeight - size - 2 * padding);
      
      bubble.style.setProperty('--target-x', targetX + 'px');
      bubble.style.setProperty('--target-y', targetY + 'px');
      bubble.classList.add('bubble-entrance');
      
      setTimeout(() => {
        bubble.classList.remove('bubble-entrance');
        bubble.style.left = targetX + 'px';
        bubble.style.top = targetY + 'px';
      }, 1200);
    }, index * 120);
    
    return bubble;
  }

  // ---------- INITIALIZE ----------
  function initialize() {
    if (isInitialized) return;
    
    if (checkCooldown()) {
      console.log('Bubble: Cooldown active');
      return;
    }
    
    loadProgress();
    createHeartProgress();
    
    BUBBLE_CONFIG.forEach((config, index) => {
      const bubble = createBubble(config, index);
      bubbles.push(bubble);
    });
    
    updateHeartProgress();
    
    if (poppedCount >= TOTAL_BUBBLES) {
      showKissReward();
      bubbles.forEach(b => { if (b.parentNode) b.remove(); });
    } else {
      setTimeout(() => {
        animationFrame = requestAnimationFrame(smoothMovement);
      }, 1500);
    }
    
    isInitialized = true;
    console.log('Bubble: System initialized (90% transparent)');
  }

  // ---------- RESET ----------
  window.bubbleSystemReset = function() {
    localStorage.removeItem(STORAGE_KEY);
    document.body.classList.remove('bubble-ui-glow');
    uiGlowActive = false;
    
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    
    document.querySelectorAll('.bubble-system-bubble, .bubble-heart-wrapper, .bubble-toast, .bubble-kiss-overlay').forEach(el => el.remove());
    
    poppedCount = 0;
    isInitialized = false;
    initialize();
    console.log('Bubble: Reset');
  };

  // ---------- START ----------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();
