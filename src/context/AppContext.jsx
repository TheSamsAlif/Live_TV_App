import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';

const AppContext = createContext();

const STORAGE_KEYS = {
  FAVORITES: 'samsalif_favorites',
  RECENT: 'samsalif_recent',
  LAST_CHANNEL: 'samsalif_last_channel',
  VOLUME: 'samsalif_volume',
  MUTED: 'samsalif_muted',
};

function loadFromStorage(key, defaultValue) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

const initialState = {
  channels: [],
  groups: [],
  filteredChannels: [],
  currentChannel: null,
  searchQuery: '',
  selectedGroup: 'All',
  isLoading: true,
  error: null,
  favorites: loadFromStorage(STORAGE_KEYS.FAVORITES, []),
  recentChannels: loadFromStorage(STORAGE_KEYS.RECENT, []),
  volume: loadFromStorage(STORAGE_KEYS.VOLUME, 0.8),
  isMuted: loadFromStorage(STORAGE_KEYS.MUTED, false),
  showFavorites: false,
};

function applyFilter(state, { query, group, showFavorites }) {
  const q = (query ?? state.searchQuery).toLowerCase();
  const g = group ?? state.selectedGroup;
  const fav = showFavorites ?? state.showFavorites;
  return state.channels.filter((ch) => {
    if (fav && !state.favorites.includes(ch.id)) return false;
    if (g !== 'All' && ch.group !== g) return false;
    if (q && !ch.name.toLowerCase().includes(q)) return false;
    return true;
  });
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_CHANNELS': {
      const channels = action.payload.channels;
      const groups = action.payload.groups;
      return { ...state, channels, groups, filteredChannels: channels, isLoading: false };
    }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_CURRENT_CHANNEL': {
      const channel = action.payload;
      // Handle clearing the current channel (back button)
      if (!channel) {
        return { ...state, currentChannel: null };
      }
      const recent = state.recentChannels.filter((c) => c.id !== channel.id);
      const updatedRecent = [channel, ...recent].slice(0, 20);
      saveToStorage(STORAGE_KEYS.RECENT, updatedRecent);
      saveToStorage(STORAGE_KEYS.LAST_CHANNEL, channel.id);
      return { ...state, currentChannel: channel, recentChannels: updatedRecent };
    }
    case 'SET_SEARCH': {
      const filtered = applyFilter(state, { query: action.payload });
      return { ...state, searchQuery: action.payload, filteredChannels: filtered };
    }
    case 'SET_GROUP': {
      const filtered = applyFilter(state, { group: action.payload, showFavorites: false });
      return { ...state, selectedGroup: action.payload, filteredChannels: filtered, showFavorites: false };
    }
    case 'TOGGLE_FAVORITE': {
      const id = action.payload;
      let favorites;
      if (state.favorites.includes(id)) {
        favorites = state.favorites.filter((fid) => fid !== id);
      } else {
        favorites = [...state.favorites, id];
      }
      saveToStorage(STORAGE_KEYS.FAVORITES, favorites);
      return { ...state, favorites };
    }
    case 'SET_VOLUME': {
      saveToStorage(STORAGE_KEYS.VOLUME, action.payload);
      return { ...state, volume: action.payload };
    }
    case 'SET_MUTED': {
      saveToStorage(STORAGE_KEYS.MUTED, action.payload);
      return { ...state, isMuted: action.payload };
    }
    case 'TOGGLE_FAVORITES': {
      const showFav = !state.showFavorites;
      const filtered = applyFilter(state, { group: 'All', query: '', showFavorites: showFav });
      return { ...state, showFavorites: showFav, selectedGroup: 'All', searchQuery: '', filteredChannels: filtered };
    }
    case 'RESTORE_LAST_CHANNEL': {
      const lastId = action.payload;
      const found = state.channels.find((c) => c.id === lastId);
      if (found) {
        const recent = state.recentChannels.filter((c) => c.id !== found.id);
        saveToStorage(STORAGE_KEYS.RECENT, [found, ...recent].slice(0, 20));
        return { ...state, recentChannels: [found, ...recent].slice(0, 20) };
      }
      return state;
    }
    default:
      return state;
  }
}

// Category display order (Quick Access + Bangla-first priority)
const CATEGORY_ORDER = [
  '⚡ Quick Access', 'Bangla', 'Bangla News', 'Sports', 'News', 'Kids', 'Music',
  'Islamic', 'Religious', 'Entertainment', 'Educational', 'Information', 'Documentary',
  'Indian Bangla', 'India', 'Hindi', 'Pakistan', 'International', 'Travel',
  'BDIX', 'SM TV', 'Radio', 'Others', 'Live TV', 'Movies', 'External Links',
];

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const loadedRef = useRef(false);

  const loadPlaylist = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    let allChannels = [];

    // Load 8 channel parts (pre-built from m3u source)
    const channelParts = [
      '/channels_part1.json', '/channels_part2.json', '/channels_part3.json', '/channels_part4.json',
      '/channels_part5.json', '/channels_part6.json', '/channels_part7.json', '/channels_part8.json',
    ];
    const partResults = await Promise.allSettled(
      channelParts.map(async (url) => {
        const res = await fetch(url);
        if (!res.ok) return [];
        return res.json();
      })
    );

    for (const result of partResults) {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        const partChannels = result.value.map((ch) => ({
          name: ch.n || ch.name || 'Unknown',
          logo: ch.l || ch.logo || '',
          group: ch.g || ch.group || 'Others',
          url: ch.u || ch.url || '',
          type: ch.t || ch.type || 'stream',
          useProxy: ch.p || false,
          referer: ch.r || '',
          origin: ch.o || '',
        }));
        allChannels = [...allChannels, ...partChannels];
      }
    }

    // Load previously-linked external channels (links.json)
    try {
      const linkRes = await fetch('/links.json');
      if (linkRes.ok) {
        const links = await linkRes.json();
        const linkChannels = links.map((link) => ({
          name: link.name,
          logo: link.logo || '',
          group: link.group || 'External Links',
          url: link.url,
          type: 'link',
        }));
        allChannels = [...allChannels, ...linkChannels];
      }
    } catch {}

    if (allChannels.length === 0) {
      dispatch({ type: 'SET_ERROR', payload: 'No channels found. Check your internet connection.' });
      return;
    }

    // Deduplicate + assign stable IDs
    const seen = new Set();
    const unique = [];
    allChannels.forEach((ch, idx) => {
      if (!ch.url) return;
      const key = ch.name + ch.url;
      if (seen.has(key)) return;
      seen.add(key);
      unique.push({ ...ch, id: `ch-${idx}` });
    });

    // Build ordered group list
    const present = [...new Set(unique.map((ch) => ch.group))];
    const ordered = CATEGORY_ORDER.filter((g) => present.includes(g));
    const extras = present.filter((g) => !CATEGORY_ORDER.includes(g)).sort();
    const groups = ['All', ...ordered, ...extras];

    dispatch({ type: 'SET_CHANNELS', payload: { channels: unique, groups } });
    const lastId = loadFromStorage(STORAGE_KEYS.LAST_CHANNEL, null);
    if (lastId) {
      dispatch({ type: 'RESTORE_LAST_CHANNEL', payload: lastId });
    }
  }, []);

  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      loadPlaylist();
    }
  }, [loadPlaylist]);

  const setCurrentChannel = useCallback((channel) => {
    dispatch({ type: 'SET_CURRENT_CHANNEL', payload: channel });
  }, []);
  const setSearch = useCallback((query) => dispatch({ type: 'SET_SEARCH', payload: query }), []);
  const setGroup = useCallback((group) => dispatch({ type: 'SET_GROUP', payload: group }), []);
  const toggleFavorite = useCallback((id) => dispatch({ type: 'TOGGLE_FAVORITE', payload: id }), []);
  const setVolume = useCallback((vol) => dispatch({ type: 'SET_VOLUME', payload: vol }), []);
  const setMuted = useCallback((muted) => dispatch({ type: 'SET_MUTED', payload: muted }), []);
  const toggleFavorites = useCallback(() => dispatch({ type: 'TOGGLE_FAVORITES' }), []);

  const value = {
    ...state,
    setCurrentChannel, setSearch, setGroup, toggleFavorite,
    setVolume, setMuted, toggleFavorites, loadPlaylist,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
