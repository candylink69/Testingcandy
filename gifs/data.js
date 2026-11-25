// ============================================================
// GIFs Data — apne GIFs yahan add karo
// ============================================================
// Format:
//   id          : unique ID
//   title       : display title
//   categories  : array of category IDs (gifCategories se)
//   thumb       : preview image URL (fast load)
//   embed       : Giphy/Tenor iframe URL, ya direct .gif/.mp4 URL
//   source      : original platform link (attribution ke liye)

const gifCategories = [
    { id: 'funny',    name: '😂 Funny' },
    { id: 'animals',  name: '🐾 Animals' },
    { id: 'dance',    name: '💃 Dance' },
    { id: 'reaction', name: '😲 Reactions' },
    { id: 'anime',    name: '🎌 Anime' },
];

const gifsData = [
    // ==== SAMPLE ENTRIES - inhe apne actual GIFs se replace karo ====
    {
        id: 'g001',
        title: 'Funny cat reaction',
        categories: ['funny', 'animals'],
        thumb: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
        embed: 'https://giphy.com/embed/JIX9t2j0ZTN9S',
        source: 'https://giphy.com/gifs/cat-JIX9t2j0ZTN9S'
    },
    {
        id: 'g002',
        title: 'Dancing parrot',
        categories: ['funny', 'animals', 'dance'],
        thumb: 'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif',
        embed: 'https://giphy.com/embed/l3q2K5jinAlChoCLS',
        source: 'https://giphy.com/gifs/parrot-l3q2K5jinAlChoCLS'
    },
    {
        id: 'g003',
        title: 'Mind blown reaction',
        categories: ['reaction'],
        thumb: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
        embed: 'https://giphy.com/embed/26ufdipQqU2lhNA4g',
        source: 'https://giphy.com/gifs/reaction-26ufdipQqU2lhNA4g'
    },
    {
        id: 'g004',
        title: 'Anime wow moment',
        categories: ['anime', 'reaction'],
        thumb: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
        embed: 'https://giphy.com/embed/3o7TKSjRrfIPjeiVyM',
        source: 'https://giphy.com/gifs/anime-3o7TKSjRrfIPjeiVyM'
    },
];
