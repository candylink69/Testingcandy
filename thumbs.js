const thumbnails = {
    "B001":  "https://i.postimg.cc/qRVV6md2/B001.webp",
    "B002":  "https://i.postimg.cc/C1TTnvVG/B002.webp",
    "BM001": "https://i.postimg.cc/mDff1dG3/BM001.webp",
    "BS001": "https://i.postimg.cc/HxDD8SCB/BS001.webp",
    "D": "https://i.postimg.cc/QtGGK6r4/D.webp",
    "D001":  "https://i.postimg.cc/MT22fs8s/D001.webp",
    "FF001": "https://i.postimg.cc/KzSS39yw/FF001.webp",
    "FF002": "https://i.postimg.cc/QtGGK6rn/FF002.webp"
};

function getThumbnailUrl(videoId) {
    return thumbnails[videoId] || `https://via.placeholder.com/320x180?text=${encodeURIComponent(videoId)}+No+Thumb`;
}
