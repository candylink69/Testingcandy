// ============================================================
// VIEW.JS - single GIF page
// ============================================================

let currentGif = null;
let allGifCategories = { captioned: [], normal: [] };

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
}

function getCategoryName(type, catId) {
    const list = allGifCategories[type] || [];
    const cat = list.find(c => c.id === catId);
    return cat ? cat.name : catId;
}

async function loadCategories() {
    try {
        const res = await fetch('categories.json');
        allGifCategories = await res.json();
    } catch (e) { /* ignore */ }
}

function formatSize(bytes) {
    if (!bytes || isNaN(bytes)) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

async function loadSize(gif) {
    const el = document.getElementById('viewSize');
    if (!el) return;
    if (gif.size) { el.textContent = gif.size; return; }
    el.textContent = '...';
    try {
        const res = await fetch(gif.url, { method: 'HEAD' });
        const len = parseInt(res.headers.get('Content-Length'));
        el.textContent = formatSize(len);
    } catch (e) {
        el.textContent = '—';
    }
}

function renderStickyGif(gif) {
    const box = document.getElementById('viewGifSticky');
    if (!box) return;
    const url = gif.url || gif.thumb;
    const isVideo = /\.(mp4|webm)(\?|$)/i.test(url);
    if (isVideo) {
        box.innerHTML = `<video src="${escapeHtml(url)}" autoplay loop muted playsinline controls></video>`;
    } else {
        box.innerHTML = `<img src="${escapeHtml(url)}" alt="${escapeHtml(gif.title || '')}">`;
    }
}

function renderCategories(gif) {
    const box = document.getElementById('viewCategories');
    if (!box) return;
    if (!gif.categories || !gif.categories.length) { box.innerHTML = ''; return; }
    box.innerHTML = '<span style="color:#ff9900;font-weight:bold;font-size:13px;margin-right:4px;">Tag:</span>' +
        gif.categories.map(cid =>
            `<span class="category-tag">${escapeHtml(getCategoryName(gif.type, cid))}</span>`
        ).join('');
}

function renderRelated(gif) {
    const grid = document.getElementById('viewRelatedGrid');
    if (!grid) return;

    // same type + same category preferred, then same type
    let pool = gifsData.filter(g => g.id !== gif.id && g.type === gif.type);
    pool.sort((a, b) => {
        const aMatch = (a.categories || []).filter(c => (gif.categories || []).includes(c)).length;
        const bMatch = (b.categories || []).filter(c => (gif.categories || []).includes(c)).length;
        return bMatch - aMatch;
    });
    const related = pool.slice(0, 20);

    if (!related.length) {
        grid.innerHTML = '<p class="no-gifs-msg">No related GIFs.</p>';
        return;
    }

    grid.innerHTML = related.map(g => {
        const aspect = (g.width && g.height) ? `style="aspect-ratio:${g.width}/${g.height}"` : '';
        return `
            <a href="view.html?id=${encodeURIComponent(g.id)}&from=${g.type}" class="masonry-item">
                <img class="gif-thumb" src="${escapeHtml(g.thumb || g.url)}" alt="${escapeHtml(g.title || '')}"
                     loading="lazy" ${aspect} onerror="this.src='https://via.placeholder.com/320x320?text=GIF'">
                <div class="gif-info">${escapeHtml(g.title || g.id)}</div>
            </a>
        `;
    }).join('');

    // re-apply masonry for related
    grid.querySelectorAll('.masonry-item').forEach(item => {
        const img = item.querySelector('.gif-thumb');
        if (!img) return;
        const apply = () => {
            const w = item.offsetWidth; if (!w) return;
            if (!img.naturalWidth) return;
            const imgH = w * (img.naturalHeight / img.naturalWidth);
            const infoH = item.querySelector('.gif-info')?.offsetHeight || 0;
            const span = Math.max(1, Math.ceil((imgH + infoH + 10) / 20));
            item.style.gridRowEnd = `span ${span}`;
        };
        if (img.complete && img.naturalWidth) { img.classList.add('loaded'); apply(); }
        else img.addEventListener('load', () => { img.classList.add('loaded'); apply(); }, { once: true });
    });
}

async function downloadCurrentGif() {
    if (!currentGif) return;
    const btn = document.getElementById('downloadBtn');
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ Downloading...';

    try {
        const res = await fetch(currentGif.url);
        if (!res.ok) throw new Error('fetch failed');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const ext = (currentGif.url.match(/\.(gif|mp4|webm)(\?|$)/i) || [,'gif'])[1];
        a.href = url;
        a.download = `${currentGif.id}-${(currentGif.title || 'gif').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.${ext}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        btn.textContent = '✅ Downloaded';
        setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 2000);
    } catch (e) {
        btn.textContent = '❌ Failed';
        setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 2000);
    }
}

function goBackToGifs(e) {
    if (e) e.preventDefault();
    const url = sessionStorage.getItem('gifsReturnUrl') || 'index.html'; // Fallback to gifs index
    sessionStorage.removeItem('gifsReturnUrl');
    window.location.href = url;
}

async function initView() {
    await loadCategories();

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) { document.getElementById('viewTitle').textContent = '❌ GIF not found'; return; }

    currentGif = gifsData.find(g => g.id === id);
    if (!currentGif) { document.getElementById('viewTitle').textContent = '❌ GIF not found'; return; }

    document.title = `${currentGif.title || currentGif.id} - CandyLink69 GIFs`;
    const canonical = document.getElementById('dynamicCanonical');
    if (canonical) canonical.href = `https://candylink69.com/gifs/view.html?id=${encodeURIComponent(id)}`;

    renderStickyGif(currentGif);
    document.getElementById('viewTitle').textContent = currentGif.title || currentGif.id;
    renderCategories(currentGif);
    loadSize(currentGif);
    renderRelated(currentGif);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initView);
else initView();
