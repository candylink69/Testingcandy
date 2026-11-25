// ============================================================
// GIFs Data - yahan apne GIFs add karo
// ============================================================
// Fields:
//   id          : unique ID (view.html?id=X me use hoga)
//   title       : display title
//   type        : 'captioned' ya 'normal'
//   categories  : array of category IDs (categories.json se)
//   thumb       : preview image URL (chhoti image, fast load)
//                 ya agar thumb nahi hai to url bhi chalega
//   url         : actual GIF/video file URL (backend storage se)
//   width       : (optional) actual width in px
//   height      : (optional) actual height in px
//                 width/height doge to masonry turant sahi layout,
//                 nahi doge to image load hone pe adjust hoga
//   size        : (optional) manual size like "2.3 MB" - na do to auto
// ============================================================

const gifsData = [
    // ===== SAMPLE ENTRIES - hata do aur apne GIFs daalo =====
    {
        id: 'g001',
        title: 'Funky cat dance',
        type: 'captioned',
        categories: ['c-funny', 'c-memes'],
        thumb: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
        url:   'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
        width: 480,
        height: 270
    },
    {
        id: 'g002',
        title: 'Dancing parrot',
        type: 'captioned',
        categories: ['c-funny'],
        thumb: 'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif',
        url:   'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif',
        width: 480,
        height: 270
    },
    {
        id: 'g003',
        title: 'Aesthetic girl portrait',
        type: 'normal',
        categories: ['n-aesthetic', 'n-cute'],
        thumb: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
        url:   'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
        width: 360,
        height: 640
    },
    {
        id: 'g004',
        title: 'Mind blown reaction',
        type: 'normal',
        categories: ['n-reaction'],
        thumb: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
        url:   'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
        width: 480,
        height: 480
    }
];
