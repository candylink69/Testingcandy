// ============================================================
// LIST.JS - Category Filter, Grid, Pagination
// ============================================================

let allCategories = [];
let selectedCategory = null;
let categoryName = "All Categories";
let filteredVideos = [];
const PER_PAGE = 20;

// ========== LOAD CATEGORIES ==========
async function loadCategoriesData() {
    try {
        const response = await fetch('data/categories.json');
        allCategories = await response.json();
    } catch (error) {
        console.log('Could not load categories.json');
        allCategories = [];
    }
}

// ========== GET CATEGORY FROM URL ==========
function getSelectedCategory() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlCategory = urlParams.get('category');
    const storageCategory = localStorage.getItem('selectedCategory');
    return urlCategory || storageCategory;
}

// ========== SETUP CATEGORY INFO ==========
function setupCategoryInfo(categoryId) {
    selectedCategory = categoryId;
    if (!selectedCategory) {
        document.getElementById('categoryInfo').style.display = 'none';
        categoryName = "All Categories";
        return;
    }
    const category = allCategories.find(cat => cat.id === selectedCategory);
    categoryName = category ? category.name : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
    document.getElementById('currentCategory').textContent = categoryName;
    document.title = `${categoryName} Videos - CandyLink69`;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
    }
    metaDesc.content = `Browse all ${categoryName} videos on CandyLink69. HD quality, daily updates.`;
    document.getElementById('pageTitle').textContent = `🔥 ${categoryName} Videos 🔥`;
}

// ========== FILTER VIDEOS ==========
function filterVideosByCategory() {
    selectedCategory = getSelectedCategory();
    setupCategoryInfo(selectedCategory);
    if (!selectedCategory) {
        filteredVideos = [...videos];
        return;
    }
    filteredVideos = videos.filter(video => video.categories && video.categories.includes(selectedCategory));
    document.getElementById('searchInput').placeholder = `🔍 Search ${categoryName} videos...`;
}

// ========== SEARCH (List) ==========
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }
        const searchInVideos = selectedCategory ? filteredVideos : videos;
        const results = searchInVideos.filter(video => {
            if (video.id.toLowerCase().includes(query)) return true;
            if (video.title && video.title.toLowerCase().includes(query)) return true;
            if (video.categories) {
                if (video.categories.some(cat => cat.toLowerCase().includes(query))) return true;
                const categoryNames = video.categories.map(catId => {
                    const cat = allCategories.find(c => c.id === catId);
                    return cat ? cat.name.toLowerCase() : catId;
                });
                if (categoryNames.some(name => name.includes(query))) return true;
            }
            return false;
        });
        displaySearchResults(results, query);
    });
    document.addEventListener('click', function(event) {
        if (!searchInput.contains(event.target) && !searchResults.contains(event.target)) {
            searchResults.style.display = 'none';
        }
    });
}
function displaySearchResults(results, query) {
    const searchResults = document.getElementById('searchResults');
    if (results.length === 0) {
        searchResults.innerHTML = `<div class="search-no-results">No videos found for "${query}"</div>`;
        searchResults.style.display = 'block';
        return;
    }
    let resultsHTML = '';
    results.forEach(video => {
        const categoryNames = video.categories ? video.categories.map(catId => {
            const cat = allCategories.find(c => c.id === catId);
            return cat ? cat.name : catId;
        }).join(', ') : 'No categories';
        resultsHTML += `
            <div class="search-result-item" onclick="goToVideo('${video.id}')">
                <div class="search-video-id">${video.id}</div>
                ${video.title ? `<div class="search-video-title">${video.title}</div>` : ''}
                <div style="color:#888; font-size:11px; margin-top:2px;">${categoryNames}</div>
            </div>
        `;
    });
    searchResults.innerHTML = resultsHTML;
    searchResults.style.display = 'block';
}

// ========== GET CATEGORY NAMES (as array) ==========
function getCategoryNames(categoryIds) {
    if (!categoryIds || !Array.isArray(categoryIds)) return [];
    return categoryIds.map(catId => {
        const cat = allCategories.find(c => c.id === catId);
        return cat ? cat.name : catId;
    });
}

// ========== GENERATE CATEGORY BUTTONS HTML ==========
function generateCategoryButtons(categoryIds) {
    if (!categoryIds || !Array.isArray(categoryIds) || !categoryIds.length) return '';
    let html = `<div class="video-categories">`;
    categoryIds.forEach(catId => {
        const cat = allCategories.find(c => c.id === catId);
        const catName = cat ? cat.name : catId;
        html += `<span class="category-tag" onclick="event.stopPropagation(); goToCategory('${catId}')">${catName}</span>`;
    });
    html += `</div>`;
    return html;
}

// ========== GENERATE PAGINATION (List) ==========
function generatePagination(currentPage, totalPages, category) {
    const paginationContainer = document.getElementById('paginationContainer');
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }
    let paginationHTML = '';
    const maxVisiblePages = 7;
    if (currentPage > 1) {
        const prevPage = currentPage - 1;
        const categoryParam = category ? `category=${category}&page=${prevPage}` : `page=${prevPage}`;
        paginationHTML += `<a href="list.html?${categoryParam}">« Prev</a> `;
    }
    let startPage = Math.max(1, currentPage - 3);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    if (startPage > 1) {
        const categoryParam = category ? `category=${category}` : '';
        paginationHTML += `<a href="list.html?${categoryParam}">1</a> `;
        if (startPage > 2) paginationHTML += `<span>...</span> `;
    }
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            paginationHTML += `<span>${i}</span> `;
        } else {
            const categoryParam = category ? `category=${category}&page=${i}` : `page=${i}`;
            paginationHTML += `<a href="list.html?${categoryParam}">${i}</a> `;
        }
    }
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) paginationHTML += `<span>...</span> `;
        const categoryParam = category ? `category=${category}&page=${totalPages}` : `page=${totalPages}`;
        paginationHTML += `<a href="list.html?${categoryParam}">${totalPages}</a> `;
    }
    if (currentPage < totalPages) {
        const categoryParam = category ? `category=${category}&page=${currentPage + 1}` : `page=${currentPage + 1}`;
        paginationHTML += `<a href="list.html?${categoryParam}">Next »</a>`;
    }
    paginationContainer.innerHTML = paginationHTML;
}

// ========== TOUCH PREVIEW (List) ==========
function setupTouchPreview() {
    const containers = document.querySelectorAll('.thumb-container');
    containers.forEach(container => {
        const thumb = container.querySelector('.thumb-img');
        const preview = container.querySelector('.preview-video');
        if (!preview) return;
        container.addEventListener('touchstart', function() {
            document.querySelectorAll('.preview-video').forEach(v => { v.pause(); v.style.display = "none"; });
            document.querySelectorAll('.thumb-img').forEach(t => { t.style.display = "block"; });
            if (!preview.src) preview.src = preview.dataset.src;
            thumb.style.display = "none";
            preview.style.display = "block";
            preview.play();
        });
        container.addEventListener('touchend', function() {
            preview.pause();
            preview.style.display = "none";
            thumb.style.display = "block";
        });
    });
}

// ========== INITIALIZE ==========
function initializePage() {
    loadCategoriesData().then(() => {
        filterVideosByCategory();
        setupSearch();
        if (!selectedCategory) {
            document.title = "All Videos - CandyLink69";
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.name = "description";
                document.head.appendChild(metaDesc);
            }
            metaDesc.content = "Watch all exclusive videos on CandyLink69. New content added daily.";
        }
        const urlParams = new URLSearchParams(window.location.search);
        const PAGE = parseInt(urlParams.get('page')) || 1;
        const totalVideos = filteredVideos.length;
        const totalPages = Math.ceil(totalVideos / PER_PAGE);
        const start = (PAGE - 1) * PER_PAGE;
        const end = start + PER_PAGE;
        const c = document.getElementById("videoList");
        if (PAGE > totalPages || PAGE < 1) {
            const categoryParam = selectedCategory ? `?category=${selectedCategory}` : '';
            window.location.href = `list.html${categoryParam}`;
            return;
        }
        const currentVideos = filteredVideos.slice(start, end);
        c.innerHTML = '';
        if (currentVideos.length === 0 && filteredVideos.length > 0) {
            c.innerHTML = '<p style="text-align:center;padding:50px;grid-column:1/-1">No more videos on this page</p>';
        } else if (filteredVideos.length === 0) {
            c.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:50px;">
                <p>No videos found in ${categoryName} category</p>
                <a href="index.html" style="color:#ff9900; margin-top:10px; display:inline-block;">← Back to Categories</a>
            </div>`;
        } else {
            currentVideos.forEach((v, i) => {
                const hasTitle = v.title && v.title.trim().length > 0;
                const alignClass = hasTitle ? 'left' : 'center';
                
                // Categories ko buttons mein convert karo (NAME dikhega)
                let catHtml = '';
                if (v.categories && Array.isArray(v.categories) && v.categories.length) {
                    catHtml = generateCategoryButtons(v.categories);
                }
                
                const videoHTML = `
                    <a href="video.html?v=${v.id}">
                        <div class="thumb-container">
                            <img class="thumb-img" src="${getThumbnailUrl(v.id)}" loading="lazy" onerror="this.src='https://via.placeholder.com/320x180?text=No+Thumb'">
                            ${v.preview ? `<video class="preview-video" muted loop playsinline preload="none" data-src="${v.preview}"></video>` : ''}
                            ${v.duration ? `<div class="duration">${v.duration}</div>` : ''}
                        </div>
                        <div class="video-title ${alignClass}">
                            ${hasTitle ? `<span class="vid-id">${v.id}:</span> ${v.title}` : v.id}
                        </div>
                        ${catHtml}
                    </a>`;
                c.insertAdjacentHTML('beforeend', videoHTML);
            });
        }
        generatePagination(PAGE, totalPages, selectedCategory);
        setupTouchPreview();
        if (PAGE === 1 && window.location.search.includes('page=1')) {
            const categoryParam = selectedCategory ? `?category=${selectedCategory}` : '';
            window.history.replaceState({}, document.title, `list.html${categoryParam}`);
        }
    });
}

document.addEventListener('DOMContentLoaded', initializePage);
