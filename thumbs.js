const thumbnails = {
    "V001": "https://i.postimg.cc/1nqwDWp1/V001.webp",
    "HM001": "https://i.postimg.cc/1nqwDWp1/HM001.webp",
    "HM002": "https://i.postimg.cc/1nqwDWp1/HM002.webp",
    "D001": "https://i.postimg.cc/1nqwDWp1/D001.webp",
    "Movie004": "https://i.postimg.cc/1nqwDWp1/Movie004.webp"
};

function getThumbnailUrl(videoId) {
    return thumbnails[videoId] || `https://via.placeholder.com/320x180?text=${encodeURIComponent(videoId)}+No+Thumb`;
}
