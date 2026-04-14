const thumbnails = {
    "B001":  "https://i.postimg.cc/qRVV6md2/B001.webp",
    "B002":  "https://i.postimg.cc/C1TTnvVG/B002.webp",
    "BM001": "https://i.postimg.cc/mDff1dG3/BM001.webp",
    "BS001": "https://i.postimg.cc/HxDD8SCB/BS001.webp",
    "D": "https://i.postimg.cc/QtGGK6r4/D.webp",
    "D001":  "https://i.postimg.cc/MT22fs8s/D001.webp",
    "FF001": "https://i.postimg.cc/KzSS39yw/FF001.webp",
    "FF002": "https://i.postimg.cc/QtGGK6rn/FF002.webp",
    "FF003": "https://i.postimg.cc/V6qyqjYh/FF003.webp",
    "FM001": "https://i.postimg.cc/d12M28qb/FM001.webp",
    "FU001": "https://i.postimg.cc/gJV9VvYQ/FU001.webp",
    "HM001": "https://i.postimg.cc/RF7r7cSr/HM001.webp",
    "HM002": "https://i.postimg.cc/ZR8k8rbb/HM002.webp",
    "HM003": "https://i.postimg.cc/50BcBw4j/HM003.webp",
    "I001":  "https://i.postimg.cc/6qtkYyq9/I001.webp",
    "I002":  "https://i.postimg.cc/C5S3mz55/I002.webp",
    "I003":  "https://i.postimg.cc/x8nwtc8N/I003.webp",
    "I004":  "https://i.postimg.cc/vTbJ3cT9/I004.webp",
    "I005":  "https://i.postimg.cc/1XskJfXG/I005.webp",
    "I006":  "https://i.postimg.cc/mkBv8tkQ/I006.webp",
    "I007":  "https://i.postimg.cc/Vvg3Tm0M/I007.webp",
    "I008":  "https://i.postimg.cc/Vvg3Tm0B/I008.webp",
    "I009":  "https://i.postimg.cc/vThpjbx3/I009.webp",
    "I0010":  "https://i.postimg.cc/d3wb4L3t/I0010.webp",
    "I0011":  "https://i.postimg.cc/C5S3mz5K/I0011.webp",
};

function getThumbnailUrl(videoId) {
    return thumbnails[videoId] || `https://via.placeholder.com/320x180?text=${encodeURIComponent(videoId)}+No+Thumb`;
}
