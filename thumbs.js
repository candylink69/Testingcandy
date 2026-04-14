const thumbnails = {
    "V001": "https://i.postimg.cc/B6hp9kbb/V001.webp",
    "HM001": "https://i.postimg.cc/B6hp9kbb/V001.webp",
    "HM002": "https://i.postimg.cc/B6hp9kbb/V001.webp",
    "D001": "https://i.postimg.cc/B6hp9kbb/V001.webp",
    "Movie004": "https://i.postimg.cc/B6hp9kbb/V001.webp"
};

function getThumbnailUrl(videoId) {
    return thumbnails[videoId] || `https://via.placeholder.com/320x180?text=${encodeURIComponent(videoId)}+No+Thumb`;
}
