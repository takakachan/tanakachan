// State Management
let state = {
  items: [],
  filter: 'all',
  currentMode: 'grid',
  likesFilter: 'all',
  likesSortBy: 'newest',
  nopeSortBy: 'newest',
  cardSize: 'auto',
  multiSelectMode: false,
  selectedItems: new Set(),
  tinderIndex: 0,
  tinderHistory: [],
  demoSource: 'tech',
  searchQuery: '',
  sortBy: 'newest',
  rssFeeds: []
};

let deleteTarget = null;
let deleteType = null;

// Load RSS feeds from localStorage
function loadRssFeeds() {
  try {
    const saved = localStorage.getItem('mediaPulseRssFeeds');
    if (saved) {
      state.rssFeeds = JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading RSS feeds:', e);
  }
  renderRssFeedsList();
}

// Save RSS feeds to localStorage
function saveRssFeeds() {
  try {
    localStorage.setItem('mediaPulseRssFeeds', JSON.stringify(state.rssFeeds));
  } catch (e) {
    console.error('Error saving RSS feeds:', e);
  }
}

// Add RSS Feed
function addRssFeed() {
  const urlInput = document.getElementById('rss-url');
  const genreInput = document.getElementById('rss-genre');
  const url = urlInput.value.trim();
  const genre = genreInput.value.trim() || 'RSS';
  
  if (!url) {
    showToast('Please enter an RSS URL');
    return;
  }
  
  // Basic URL validation
  try {
    new URL(url);
  } catch (e) {
    showToast('Please enter a valid URL');
    return;
  }
  
  // Check for duplicates
  if (state.rssFeeds.some(f => f.url === url)) {
    showToast('This RSS feed is already registered');
    return;
  }
  
  state.rssFeeds.push({
    url: url,
    genre: genre,
    id: Date.now()
  });
  
  saveRssFeeds();
  renderRssFeedsList();
  urlInput.value = '';
  genreInput.value = '';
  showToast('RSS feed added: ' + genre);
}

// Remove RSS Feed
function removeRssFeed(id) {
  state.rssFeeds = state.rssFeeds.filter(f => f.id !== id);
  saveRssFeeds();
  renderRssFeedsList();
  showToast('RSS feed removed');
}

// Render RSS feeds list
function renderRssFeedsList() {
  const container = document.getElementById('rss-feeds-list');
  if (!container) return;
  
  if (state.rssFeeds.length === 0) {
    container.innerHTML = '<div style="color:var(--text3);font-size:0.8rem;padding:8px 0;">No RSS feeds registered</div>';
    return;
  }
  
  container.innerHTML = state.rssFeeds.map(feed => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:var(--bg2);border-radius:4px;margin-bottom:6px;">
      <div style="flex:1;min-width:0;">
        <div style="font-size:0.75rem;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${feed.genre}</div>
        <div style="font-size:0.65rem;color:var(--text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${feed.url}</div>
      </div>
      <button onclick="removeRssFeed(${feed.id})" style="background:none;border:none;color:var(--text3);cursor:pointer;padding:4px 8px;fontrem;">×-size:1</button>
    </div>
  `).join('');
}

// Fetch RSS feed using a CORS proxy
async function fetchRssFeed(feed) {
  // Using rss2json API as a proxy to avoid CORS issues
  const proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feed.url);
  
  try {
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    if (data.status !== 'ok' || !data.items) {
      console.error('Error fetching RSS:', data);
      return [];
    }
    
    return data.items.map((item, index) => ({
      id: feed.id + '_' + index,
      type: feed.genre.toLowerCase(),
      title: item.title,
      source: feed.genre,
      thumbnail: item.thumbnail || item.enclosure?.link || '',
      date: item.pubDate ? item.pubDate.split(' ')[0] : new Date().toISOString().split('T')[0],
      url: item.link,
      liked: false,
      nope: false
    }));
  } catch (error) {
    console.error('Error fetching RSS feed:', feed.url, error);
    return [];
  }
}

// Fetch all RSS feeds
async function fetchAllRss() {
  if (state.rssFeeds.length === 0) {
    showToast('No RSS feeds registered');
    return;
  }
  
  showToast('Fetching RSS feeds...');
  
  const allItems = [];
  for (const feed of state.rssFeeds) {
    const items = await fetchRssFeed(feed);
    allItems.push(...items);
  }
  
  if (allItems.length > 0) {
    state.items = allItems;
    render();
    showToast('Loaded ' + allItems.length + ' items from RSS feeds');
  } else {
    showToast('No items found from RSS feeds');
  }
}

// Demo Data
const demoData = {
  tech: [
    {id:1,type:'youtube',title:'Complete Guide to React 19 - Everything You Need to Know',source:'WebMaster',thumbnail:'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',date:'2026-02-17',url:'https://youtube.com',liked:false,nope:false},
    {id:2,type:'youtube',title:'Building AI Agents with Claude API - Full Tutorial',source:'CodeLab',thumbnail:'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',date:'2026-02-17',url:'https://youtube.com',liked:false,nope:false},
    {id:3,type:'rss',title:'New JavaScript Framework Announced - What You Need to Know',source:'TechCrunch',thumbnail:'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80',date:'2026-02-17',url:'https://techcrunch.jp',liked:false,nope:false},
    {id:4,type:'podcast',title:'Episode 195: Exploring the Mysteries of the Universe',source:'Science Podcast',thumbnail:'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80',date:'2026-02-16',url:'https://spotify.com',liked:false,nope:false},
    {id:5,type:'book',title:'Software Design Patterns - Essential Guide',source:'O Reilly',thumbnail:'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80',date:'2026-02-16',url:'https://oreilly.com',liked:false,nope:false},
    {id:6,type:'movie',title:'When AI Gains Consciousness - A New Era Begins',source:'MovieDB',thumbnail:'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80',date:'2026-02-15',url:'https://moviedb.org',liked:false,nope:false},
    {id:7,type:'youtube',title:'Vim Will Never Die - The Deep End of Customization',source:'Linux Fan',thumbnail:'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',date:'2026-02-15',url:'https://youtube.com',liked:false,nope:false},
    {id:8,type:'rss',title:'TypeScript 6.0 Predictions - The Type System Evolution',source:'TS Weekly',thumbnail:'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80',date:'2026-02-14',url:'https://example.com',liked:false,nope:false}
  ],
  entertainment: [
    {id:1,type:'youtube',title:'Winter 2026 Anime Ranking TOP 10',source:'AnimeHype',thumbnail:'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80',date:'2026-02-17',url:'https://youtube.com',liked:false,nope:false},
    {id:2,type:'movie',title:'Long-Awaited Sequel Finally Released',source:'Cinema',thumbnail:'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',date:'2026-02-17',url:'https://moviedb.org',liked:false,nope:false},
    {id:3,type:'youtube',title:'Famous Directors Discuss Film Making',source:'DirectorTalk',thumbnail:'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80',date:'2026-02-16',url:'https://youtube.com',liked:false,nope:false},
    {id:4,type:'podcast',title:'Oscar Predictions 2026 - Film Talk',source:'FilmTalk',thumbnail:'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&q=80',date:'2026-02-16',url:'https://spotify.com',liked:false,nope:false}
  ],
  news: [
    {id:1,type:'rss',title:'Breaking: Major Economic News',source:'Nikkei',thumbnail:'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',date:'2026-02-17',url:'https://nikkei.com',liked:false,nope:false},
    {id:2,type:'rss',title:'Government Announces New Policy',source:'NHK',thumbnail:'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',date:'2026-02-17',url:'https://nhk.jp',liked:false,nope:false},
    {id:3,type:'rss',title:'Tech Industry Mega Merger Announced',source:'TechCrunch',thumbnail:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',date:'2026-02-16',url:'https://techcrunch.jp',liked:false,nope:false}
  ],
  science: [
    {id:1,type:'youtube',title:'From the Big Bang to the Future - Complete Documentary',source:'NASA',thumbnail:'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80',date:'2026-02-17',url:'https://youtube.com',liked:false,nope:false},
    {id:2,type:'rss',title:'Quantum Computing Breakthrough Announced',source:'ScienceDaily',thumbnail:'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',date:'2026-02-16',url:'https://sciencedaily.com',liked:false,nope:false},
    {id:3,type:'youtube',title:'The Science of Focus - Brain Explained',source:'BrainScience',thumbnail:'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80',date:'2026-02-15',url:'https://youtube.com',liked:false,nope:false}
  ],
  podcast: [
    {id:1,type:'podcast',title:'Episode 198: Yuru Language Radio',source:'Yuru',thumbnail:'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=800&q=80',date:'2026-02-17',url:'https://spotify.com',liked:false,nope:false},
    {id:2,type:'podcast',title:'Tsundoku Channel Latest Episode',source:'Tsundoku',thumbnail:'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80',date:'2026-02-16',url:'https://spotify.com',liked:false,nope:false},
    {id:3,type:'podcast',title:'Episode 45: Okamoto Interview',source:'Books',thumbnail:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',date:'2026-02-15',url:'https://spotify.com',liked:false,nope:false}
  ]
};

// SVG Icons
const icons = {
  settings: '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
  search: '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
  refresh: '<svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>',
  undo: '<svg viewBox="0 0 24 24"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
  heartOutline: '<svg viewBox="0 0 24 24"><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
  grid: '<svg viewBox="0 0 24 24"><path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z"/></svg>',
  tinder: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><circle cx="8.5" cy="9.5" r="1.5"/><circle cx="15.5" cy="9.5" r="1.5"/><path d="M7 14c0 2.67 5.33 5 5 5 .67 0 1.74-1 3-1 .5 0 1 .17 1.5.43-.5 1.18-1.67 2.57-4.5 2.57-3.86 0-5-2.67-5-5z"/></svg>',
  collect: '<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
  nope: '<svg viewBox="0 0 24 24"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>',
  select: '<svg viewBox="0 0 24 24"><path d="M3 5h2V3c-1.1 0-2 .9-2 2zm0 8h2v-2H3v2zm4 8h2v-2H7v2zM3 9h2V7H3v2zm10-6h-2v2h2V3zm6 0v2h2c0-1.1-.9-2-2-2zM5 21v-2H3c0 1.1.9 2 2 2zm-2-4h2v-2H3v2zM9 3H7v2h2V3zm2 18h2v-2h-2v2zm8-8h2v-2h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zm0-12h2V7h-2v2zm0 8h2v-2h-2v2zm-4 4h2v-2h-2v2zm0-16h2V3h-2v2z"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>',
  rss: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>',
  movie: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>',
  podcast: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/></svg>'
};

// Initialize
function init() {
  loadRssFeeds();
  loadCardSize();
  loadDemoData();
  setupEvents();
  setupKeyboard();
  setupTinderSwipe();
  setCardSize(state.cardSize);
  
  window.addEventListener('resize', () => {
    setCardSize(state.cardSize);
  });
}

// Load Demo Data
function loadDemoData() {
  state.items = demoData[state.demoSource] || demoData.tech;
  state.searchQuery = '';
  document.getElementById('search-input').value = '';
  render();
  const categoryName = state.demoSource.charAt(0).toUpperCase() + state.demoSource.slice(1);
  showToast('Loaded ' + state.items.length + ' ' + categoryName + ' items');
}

// Setup Events
function setupEvents() {
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      state.filter = b.dataset.filter;
      state.searchQuery = '';
      document.getElementById('search-input').value = '';
      if (state.currentMode === 'tinder') initTinder();
      render();
    });
  });
}

// Setup Keyboard Shortcuts
function setupKeyboard() {
  document.addEventListener('keydown', (e) => {
    // Search: Cmd/Ctrl + F
    if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
      e.preventDefault();
      toggleSearch();
    }
    if (state.currentMode === 'tinder') {
      if (e.key === 'ArrowRight') { e.preventDefault(); tinderLike(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); tinderNope(); }
      if (e.key === 'Escape') { closeConfirm(); closeSettings(); undoLast(); }
    }
    if (e.key === 'Escape') { closeConfirm(); closeSettings(); }
  });
}

// Search Functions
function toggleSearch() {
  const sb = document.getElementById('search-box');
  const isActive = sb.classList.toggle('active');
  document.body.classList.toggle('search-active', isActive);
  if (isActive) {
    document.getElementById('search-input').focus();
  } else {
    clearSearch();
  }
}

function clearSearch() {
  const input = document.getElementById('search-input');
  input.value = '';
  state.searchQuery = '';
  document.querySelector('.search-clear')?.classList.remove('visible');
  render();
}

function handleSearch(query) {
  state.searchQuery = query.toLowerCase().trim();
  render();
}

// Navigation
function goHome(e) {
  e.preventDefault();
  state.filter = 'all';
  state.searchQuery = '';
  state.sortBy = 'newest';
  document.getElementById('search-input').value = '';
  document.querySelector('.search-clear')?.classList.remove('visible');
  setMode('grid');
  window.scrollTo(0, 0);
}

function setMode(m) {
  state.currentMode = m;
  // Toggle tinder-mode class on body for scroll prevention
  document.body.classList.toggle('tinder-mode', m === 'tinder');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === m));
  document.querySelectorAll('.mobile-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === m));
  document.getElementById('grid-view').style.display = m === 'grid' ? 'block' : 'none';
  document.getElementById('tinder-view').classList.toggle('active', m === 'tinder');
  document.getElementById('likes-view').classList.toggle('active', m === 'likes');
  document.getElementById('nope-view').classList.toggle('active', m === 'nope');
  if (m === 'tinder') initTinder();
  if (m === 'likes') {
    state.likesFilter = 'all';
    renderLikes();
  }
  if (m === 'nope') renderNope();
}

function handleSort(sortBy) {
  state.sortBy = sortBy;
  render();
}

// Card Size
function setCardSize(size) {
  state.cardSize = size;
  // Save to localStorage
  try {
    localStorage.setItem('mediaPulseCardSize', size);
  } catch (e) {
    console.error('Error saving card size:', e);
  }
  const root = document.documentElement;
  const gridView = document.getElementById('grid-view');
  
  gridView.classList.remove('card-size-s', 'card-size-m', 'card-size-l', 'card-size-auto');
  
  let cardWidth;
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) {
    if (size === 'small') {
      gridView.classList.add('card-size-s');
      cardWidth = 180;
    } else if (size === 'medium') {
      gridView.classList.add('card-size-m');
      cardWidth = 280;
    } else if (size === 'large') {
      gridView.classList.add('card-size-l');
      cardWidth = 400;
    }
    root.style.setProperty('--card-size', cardWidth + 'px');
    root.style.setProperty('--column-count', size === 'small' ? 2 : size === 'medium' ? 2 : 1);
  } else {
    gridView.classList.add('card-size-auto');
    cardWidth = size === 'small' ? 180 : size === 'medium' ? 280 : 400;
    root.style.setProperty('--card-size', cardWidth + 'px');
    
    const container = document.querySelector('.masonry');
    if (container) {
      const containerWidth = container.offsetWidth;
      const columnCount = Math.max(1, Math.floor(containerWidth / cardWidth));
      root.style.setProperty('--column-count', columnCount);
    }
  }

  document.querySelectorAll('.size-selector').forEach(selector => {
    selector.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
    selector.querySelector(`.size-btn[onclick="setCardSize('${size}')"]`)?.classList.add('active');
  });
}

// Load card size from localStorage
function loadCardSize() {
  try {
    const savedSize = localStorage.getItem('mediaPulseCardSize');
    if (savedSize && ['small', 'medium', 'large'].includes(savedSize)) {
      state.cardSize = savedSize;
    }
  } catch (e) {
    console.error('Error loading card size:', e);
  }
}

// Multi-select Functions
function toggleMultiSelect() {
  state.multiSelectMode = !state.multiSelectMode;
  state.selectedItems.clear();
  
  const toggle = document.getElementById('multi-select-toggle');
  const gridView = document.getElementById('grid-view');
  
  if (state.multiSelectMode) {
    toggle.classList.add('active');
    toggle.innerHTML = icons.select + ' ' + state.selectedItems.size;
    gridView.classList.add('multi-select-mode');
  } else {
    toggle.classList.remove('active');
    toggle.innerHTML = icons.select + ' Select';
    gridView.classList.remove('multi-select-mode');
  }
  
  updateBatchBar();
  render();
}

function toggleItemSelection(id) {
  // Only allow selection in multi-select mode
  if (!state.multiSelectMode) return;
  
  if (state.selectedItems.has(id)) {
    state.selectedItems.delete(id);
  } else {
    state.selectedItems.add(id);
  }
  
  const toggle = document.getElementById('multi-select-toggle');
  toggle.innerHTML = icons.select + ' ' + state.selectedItems.size;
  
  updateBatchBar();
  
  const card = document.querySelector(`.card[data-id="${id}"]`);
  if (card) {
    card.classList.toggle('selected', state.selectedItems.has(id));
    // Also toggle checked class on checkbox
    const checkbox = card.querySelector('.card-checkbox');
    if (checkbox) {
      checkbox.classList.toggle('checked', state.selectedItems.has(id));
    }
  }
}

function updateBatchBar() {
  const bar = document.getElementById('batch-bar');
  const count = document.getElementById('batch-count');
  
  if (state.selectedItems.size > 0) {
    bar.classList.add('visible');
    count.textContent = state.selectedItems.size + ' selected';
  } else {
    bar.classList.remove('visible');
  }
}

function batchLike() {
  state.selectedItems.forEach(id => {
    const item = state.items.find(i => i.id === id);
    if (item) {
      item.liked = true;
      item.nope = false;
    }
  });
  
  showToast('Added ' + state.selectedItems.size + ' items to Collected');
  state.selectedItems.clear();
  cancelSelection();
  render();
  updateStats();
}

function batchNope() {
  state.selectedItems.forEach(id => {
    const item = state.items.find(i => i.id === id);
    if (item) {
      item.nope = true;
      item.liked = false;
    }
  });
  
  showToast('Added ' + state.selectedItems.size + ' items to Nope');
  state.selectedItems.clear();
  cancelSelection();
  render();
  updateStats();
}

function cancelSelection() {
  state.multiSelectMode = false;
  state.selectedItems.clear();
  
  const toggle = document.getElementById('multi-select-toggle');
  const gridView = document.getElementById('grid-view');
  
  toggle.classList.remove('active');
  toggle.innerHTML = icons.select + ' Select';
  gridView.classList.remove('multi-select-mode');
  
  updateBatchBar();
  render();
}

// Likes Functions
function setLikesFilter(filter) {
  state.likesFilter = filter;
  document.querySelectorAll('.view-toggle-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.view-toggle-btn[data-filter="${filter}"]`)?.classList.add('active');
  renderLikes();
}

function handleLikesSort(sortBy) {
  state.likesSortBy = sortBy;
  renderLikes();
}

// Filter and Sort
function getFilteredItems() {
  let items = state.items.filter(x => !x.liked && !x.nope);
  items = state.filter === 'all' ? items : items.filter(x => x.type === state.filter);
  if (state.searchQuery) {
    items = items.filter(x =>
      x.title.toLowerCase().includes(state.searchQuery) ||
      x.source.toLowerCase().includes(state.searchQuery)
    );
  }
  if (state.sortBy === 'newest') {
    items = [...items].sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (state.sortBy === 'oldest') {
    items = [...items].sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (state.sortBy === 'title') {
    items = [...items].sort((a, b) => a.title.localeCompare(b.title));
  }
  return items;
}

function getDisplayItems() {
  return getFilteredItems();
}

// Type icons mapping
const typeIcons = {
  youtube: icons.play,
  rss: icons.rss,
  book: icons.book,
  movie: icons.movie,
  podcast: icons.podcast
};

// Render Main Grid
function render() {
  const items = getFilteredItems();

  if (!items.length) {
    let emptyTitle = 'No content found';
    let emptyText = 'Try a different filter or search term';
    let emptyIcon = '○';
    if (state.searchQuery) {
      emptyTitle = 'No matches for "' + state.searchQuery + '"';
      emptyText = 'Try a different search term or clear the search';
      emptyIcon = icons.search;
    } else if (state.filter !== 'all') {
      emptyTitle = 'No ' + state.filter + ' content';
      emptyText = 'Try a different category or click "All" to see everything';
      emptyIcon = typeIcons[state.filter] || '📄';
    }
    document.getElementById('cards').innerHTML = '<div class="empty"><div class="empty-icon">' + emptyIcon + '</div><div class="empty-title">' + emptyTitle + '</div><div class="empty-text">' + emptyText + '</div></div>';
    updateStats();
    return;
  }

  document.getElementById('cards').innerHTML = items.map((x, i) => `
    <div class="card ${state.selectedItems.has(x.id) ? 'selected' : ''}" data-id="${x.id}" onclick="handleCardClick(event, ${x.id})" style="animation-delay: ${i * 0.02}s">
      <div class="card-checkbox ${state.selectedItems.has(x.id) ? 'checked' : ''}" onclick="event.stopPropagation();toggleItemSelection(${x.id})"></div>
      <div class="card-img-wrap">
        ${x.thumbnail ? `<img class="card-img" src="${x.thumbnail}" alt="">` : `<div class="card-img empty">${typeIcons[x.type] || '📄'}</div>`}
      </div>
      <div class="card-body">
        <div class="card-type">${x.type}</div>
        <div class="card-title">${x.title}</div>
        <div class="card-meta">
          <span class="card-source">${x.source}</span>
          <div class="card-actions-mini">
            ${x.liked 
              ? `<button class="card-btn-mini liked" onclick="event.stopPropagation();toggleLike(${x.id})">${icons.heart}</button>` 
              : `<button class="card-btn-mini like-btn" onclick="event.stopPropagation();toggleLike(${x.id})">${icons.heartOutline}</button>`}
            ${x.nope 
              ? `<button class="card-btn-mini nope" onclick="event.stopPropagation();toggleNope(${x.id})">${icons.nope}</button>` 
              : `<button class="card-btn-mini nope-btn" onclick="event.stopPropagation();toggleNope(${x.id})">${icons.nope}</button>`}
          </div>
        </div>
      </div>
    </div>
  `).join('');
  
  updateStats();
}

// Handle card click - only open URL when NOT in multi-select mode
function handleCardClick(event, id) {
  if (state.multiSelectMode) {
    event.preventDefault();
    toggleItemSelection(id);
  }
}

// Render Likes
function renderLikes() {
  let items = state.items.filter(x => x.liked);

  if (state.likesFilter !== 'all') {
    items = items.filter(x => x.type === state.likesFilter);
  }

  if (state.likesSortBy === 'newest') {
    items = [...items].sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (state.likesSortBy === 'oldest') {
    items = [...items].sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (state.likesSortBy === 'title') {
    items = [...items].sort((a, b) => a.title.localeCompare(b.title));
  }

  if (!items.length) {
    document.getElementById('likes-cards').innerHTML = '<div class="empty"><div class="empty-icon">♡</div><div class="empty-title">No collected items yet</div><div class="empty-text">Heart content while exploring to save it here for later</div></div>';
    document.getElementById('likes-count-badge').textContent = '0';
    return;
  }

  document.getElementById('likes-cards').innerHTML = items.map((x, i) => `
    <div class="card" onclick="window.open('${x.url}', '_blank')" style="animation-delay: ${i * 0.02}s">
      <div class="card-img-wrap">
        ${x.thumbnail ? `<img class="card-img" src="${x.thumbnail}" alt="">` : `<div class="card-img empty">📄</div>`}
      </div>
      <div class="card-body">
        <div class="card-type">${x.type}</div>
        <div class="card-title">${x.title}</div>
        <div class="card-meta">
          <span class="card-source">${x.source}</span>
          <button class="card-btn-mini" onclick="event.stopPropagation();removeLike(${x.id}, 'like')">
            ${icons.trash}
          </button>
        </div>
      </div>
    </div>
  `).join('');
  document.getElementById('likes-count-badge').textContent = items.length;
}

// Render Nope
function renderNope() {
  let items = state.items.filter(x => x.nope);
  
  if (state.nopeSortBy === 'newest') {
    items = [...items].sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (state.nopeSortBy === 'oldest') {
    items = [...items].sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (state.nopeSortBy === 'title') {
    items = [...items].sort((a, b) => a.title.localeCompare(b.title));
  }
  
  if (!items.length) {
    document.getElementById('nope-cards').innerHTML = '<div class="empty"><div class="empty-icon">✕</div><div class="empty-title">No nope items</div><div class="empty-text">Pass on content while exploring to add it here</div></div>';
    document.getElementById('nope-count-badge').textContent = '0';
    return;
  }
  
  document.getElementById('nope-cards').innerHTML = items.map((x, i) => `
    <div class="card" onclick="window.open('${x.url}', '_blank')" style="animation-delay: ${i * 0.02}s">
      <div class="card-body" style="padding: 10px 12px;">
        <div class="card-title" style="margin-bottom: 4px;">${x.title}</div>
        <div class="card-meta">
          <span class="card-source">${x.source}</span>
          <button class="card-btn-mini" onclick="event.stopPropagation();toggleNope(${x.id})">
            ${icons.undo}
          </button>
        </div>
      </div>
    </div>
  `).join('');
  document.getElementById('nope-count-badge').textContent = items.length;
}

function handleNopeSort(sortBy) {
  state.nopeSortBy = sortBy;
  renderNope();
}

function restoreNope(id) {
  const x = state.items.find(i => i.id === id);
  if (x) { x.nope = false; renderNope(); showToast('Restored'); }
}

function updateStats() {
  document.getElementById('total-count').textContent = getDisplayItems().length;
  document.getElementById('like-count').textContent = state.items.filter(x => x.liked).length;
  document.getElementById('nope-count').textContent = state.items.filter(x => x.nope).length;
}

// Tinder Functions
function initTinder() {
  state.tinderIndex = 0;
  state.tinderHistory = [];
  updateTinderCard();
}

function updateTinderCard() {
  const items = getFilteredItems();
  const card = document.getElementById('tinder-card');
  const sl = card.querySelector('.tinder-stamp.like');
  const sn = card.querySelector('.tinder-stamp.nope');

  card.style.transition = 'none';
  card.style.transform = '';
  sl.classList.remove('show');
  sn.classList.remove('show');

  if (state.tinderIndex >= items.length) {
    document.getElementById('tinder-img').src = '';
    document.getElementById('tinder-img').classList.add('empty');
    document.getElementById('tinder-type').textContent = '';
    let tinderEmptyTitle = 'All caught up!';
    let tinderEmptyHint = 'Load more demo data or switch categories to continue';
    if (state.filter !== 'all') {
      tinderEmptyTitle = 'No more ' + state.filter + ' content';
      tinderEmptyHint = 'Try a different category or click "All" in the filter bar';
    } else if (state.searchQuery) {
      tinderEmptyTitle = 'No more results';
      tinderEmptyHint = 'Clear your search to see all content';
    }
    document.getElementById('tinder-title').textContent = tinderEmptyTitle;
    document.getElementById('tinder-source').textContent = tinderEmptyHint;
    document.getElementById('tinder-progress-fill').style.width = '100%';
    document.getElementById('tinder-progress-text').textContent = 'Complete!';
    return;
  }

  const it = items[state.tinderIndex];
  const img = document.getElementById('tinder-img');
  img.src = it.thumbnail || '';
  if (!it.thumbnail) img.classList.add('empty');
  else img.classList.remove('empty');
  document.getElementById('tinder-type').textContent = it.type.toUpperCase();
  document.getElementById('tinder-title').textContent = it.title;
  document.getElementById('tinder-source').textContent = it.source + ' · ' + formatDate(it.date);
  // Update progress bar
  const progress = (state.tinderIndex + 1) / items.length * 100;
  document.getElementById('tinder-progress-fill').style.width = progress + '%';
  document.getElementById('tinder-progress-text').textContent = (state.tinderIndex + 1) + ' / ' + items.length;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return days + ' days ago';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function handleSwipe(direction) {
  const items = getFilteredItems();
  if (state.tinderIndex >= items.length) return;

  const item = items[state.tinderIndex];
  const card = document.getElementById('tinder-card');

  // Button press animation - change color then revert
  if (direction === 'right') {
    const likeBtn = document.querySelector('.tinder-btn.like');
    likeBtn.classList.add('pressed');
    setTimeout(() => likeBtn.classList.remove('pressed'), 300);
  } else {
    const nopeBtn = document.querySelector('.tinder-btn.nope');
    nopeBtn.classList.add('pressed');
    setTimeout(() => nopeBtn.classList.remove('pressed'), 300);
  }

  if (direction === 'right') {
    item.liked = true;
    item.nope = false;
    state.tinderHistory.push({ index: state.tinderIndex, liked: true });
  } else {
    item.nope = true;
    item.liked = false;
    state.tinderHistory.push({ index: state.tinderIndex, liked: false });
  }

  card.style.transition = 'transform 0.3s, opacity 0.3s';
  card.style.transform = `translateX(${direction === 'right' ? 500 : -500}px) rotate(${direction === 'right' ? 30 : -30}deg)`;
  card.style.opacity = '0';

  setTimeout(() => {
    state.tinderIndex++;
    card.style.transition = 'none';
    card.style.transform = '';
    card.style.opacity = '';
    card.querySelector('.tinder-stamp.like').classList.remove('show');
    card.querySelector('.tinder-stamp.nope').classList.remove('show');
    updateTinderCard();
  }, 300);
}

function tinderLike() { handleSwipe('right'); }
function tinderNope() { handleSwipe('left'); }

function undoLast() {
  if (state.tinderHistory.length === 0) { showToast('Nothing to undo'); return; }
  
  // Undo button press animation - yellow
  const undoBtn = document.querySelector('.tinder-btn.undo');
  undoBtn.classList.add('pressed');
  setTimeout(() => undoBtn.classList.remove('pressed'), 300);
  
  const last = state.tinderHistory.pop();
  state.tinderIndex = last.index;
  const items = getFilteredItems();
  if (items[last.index]) {
    if (last.liked) { items[last.index].liked = false; items[last.index].nope = false; }
    else { items[last.index].nope = false; }
  }
  updateTinderCard();
  showToast('Undone');
}

// Like/Nope Functions
function toggleLike(id) {
  const x = state.items.find(i => i.id === id);
  if (x) {
    x.liked = !x.liked;
    if (x.liked) x.nope = false;
    render();
    if (state.currentMode === 'likes') {
      renderLikes();
    }
    if (x.liked) {
      showToast('Added to Collected');
    } else {
      showToast('Removed from Collected');
    }
  }
}

function toggleNope(id) {
  const x = state.items.find(i => i.id === id);
  if (x) {
    x.nope = !x.nope;
    if (x.nope) x.liked = false;
    render();
    if (state.currentMode === 'nope') {
      renderNope();
    }
    if (x.nope) {
      showToast('Added to Nope');
    } else {
      showToast('Removed from Nope');
    }
  }
}

function removeLike(id, type) {
  deleteTarget = id;
  deleteType = type;
  document.getElementById('confirm-title').textContent = 'Remove from Collected?';
  document.getElementById('confirm-text').textContent = 'This will remove this item from your collected items';
  document.getElementById('confirm').classList.add('active');
}

// Toast
function showToast(msg) {
  const c = document.getElementById('toasts');
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// Refresh
function refreshAll() {
  loadDemoData();
  showToast('Refreshed');
}

// Modal Functions
function openSettings() { document.getElementById('settings-modal').classList.add('active'); }
function closeSettings() { document.getElementById('settings-modal').classList.remove('active'); }
function closeConfirm() { document.getElementById('confirm').classList.remove('active'); deleteTarget = null; deleteType = null; }

function confirmDelete() {
  if (deleteTarget !== null) {
    if (deleteType === 'like') {
      const x = state.items.find(i => i.id === deleteTarget);
      if (x) { x.liked = false; showToast('Removed from Collected'); }
    }
    renderLikes();
    closeConfirm();
  }
}

function updateDemoSource() {
  state.demoSource = document.getElementById('demo-source').value;
  loadDemoData();
}

// Tinder Swipe Setup
function setupTinderSwipe() {
  const tc = document.getElementById('tinder-card');
  let isDragging = false, startX = 0, currentX = 0;

  tc.addEventListener('mousedown', e => {
    if (state.tinderIndex >= getFilteredItems().length) return;
    isDragging = true;
    startX = e.clientX;
    tc.style.transition = 'none';
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    currentX = e.clientX - startX;
    const rot = currentX * 0.05;
    tc.style.transform = `translateX(${currentX}px) rotate(${rot}deg)`;
    const sl = tc.querySelector('.tinder-stamp.like');
    const sn = tc.querySelector('.tinder-stamp.nope');
    if (currentX > 30) { sl.classList.add('show'); sn.classList.remove('show'); }
    else if (currentX < -30) { sn.classList.add('show'); sl.classList.remove('show'); }
    else { sl.classList.remove('show'); sn.classList.remove('show'); }
  });

  document.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;
    if (currentX > 80) tinderLike();
    else if (currentX < -80) tinderNope();
    else {
      tc.style.transition = 'transform 0.2s';
      tc.style.transform = '';
      tc.querySelector('.tinder-stamp.like').classList.remove('show');
      tc.querySelector('.tinder-stamp.nope').classList.remove('show');
    }
    currentX = 0;
  });

  // Touch events
  tc.addEventListener('touchstart', e => {
    if (state.tinderIndex >= getFilteredItems().length) return;
    isDragging = true;
    startX = e.touches[0].clientX;
    tc.style.transition = 'none';
  });

  tc.addEventListener('touchmove', e => {
    if (!isDragging) return;
    e.preventDefault();
    currentX = e.touches[0].clientX - startX;
    const rot = currentX * 0.05;
    tc.style.transform = `translateX(${currentX}px) rotate(${rot}deg)`;
    const sl = tc.querySelector('.tinder-stamp.like');
    const sn = tc.querySelector('.tinder-stamp.nope');
    if (currentX > 30) { sl.classList.add('show'); sn.classList.remove('show'); }
    else if (currentX < -30) { sn.classList.add('show'); sl.classList.remove('show'); }
    else { sl.classList.remove('show'); sn.classList.remove('show'); }
  }, { passive: false });

  tc.addEventListener('touchend', e => {
    if (!isDragging) return;
    isDragging = false;
    if (currentX > 80) tinderLike();
    else if (currentX < -80) tinderNope();
    else {
      tc.style.transition = 'transform 0.2s';
      tc.style.transform = '';
      tc.querySelector('.tinder-stamp.like').classList.remove('show');
      tc.querySelector('.tinder-stamp.nope').classList.remove('show');
    }
    currentX = 0;
  });
}

// Start
init();
