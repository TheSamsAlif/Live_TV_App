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
  sidebarOpen: true,
  showFavorites: false,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_CHANNELS': {
      const channels = action.payload;
      const groups = ['All', ...new Set(channels.map((ch) => ch.group).filter(Boolean))].sort();
      return { ...state, channels, groups, filteredChannels: channels, isLoading: false };
    }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_CURRENT_CHANNEL': {
      const channel = action.payload;
      const recent = state.recentChannels.filter((c) => c.id !== channel.id);
      const updatedRecent = [channel, ...recent].slice(0, 20);
      saveToStorage(STORAGE_KEYS.RECENT, updatedRecent);
      saveToStorage(STORAGE_KEYS.LAST_CHANNEL, channel.id);
      return { ...state, currentChannel: channel, recentChannels: updatedRecent };
    }
    case 'SET_SEARCH': {
      const query = action.payload.toLowerCase();
      const filtered = state.channels.filter(
        (ch) =>
          ch.name.toLowerCase().includes(query) &&
          (state.selectedGroup === 'All' || ch.group === state.selectedGroup)
      );
      return { ...state, searchQuery: action.payload, filteredChannels: filtered };
    }
    case 'SET_GROUP': {
      const group = action.payload;
      const filtered = state.channels.filter(
        (ch) => group === 'All' || ch.group === group
      );
      return { ...state, selectedGroup: group, filteredChannels: filtered, showFavorites: false };
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
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'TOGGLE_FAVORITES':
      return { ...state, showFavorites: !state.showFavorites, selectedGroup: 'All', searchQuery: '' };
    case 'SHOW_ALL':
      return { ...state, showFavorites: false };
    case 'RESTORE_LAST_CHANNEL': {
      const lastId = action.payload;
      const found = state.channels.find((c) => c.id === lastId);
      if (found) {
        const recent = state.recentChannels.filter((c) => c.id !== found.id);
        saveToStorage(STORAGE_KEYS.RECENT, [found, ...recent].slice(0, 20));
        return { ...state, currentChannel: found, recentChannels: [found, ...recent].slice(0, 20) };
      }
      return state;
    }
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const loadedRef = useRef(false);

  const loadPlaylist = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    let allChannels = [];

    // Load from local channels.json (pre-built from m3u + JSON sources)
    try {
      const res = await fetch('/channels.json');
      if (res.ok) {
        const data = await res.json();
        allChannels = data.map((ch, idx) => ({
          id: `ch-${idx}-${Math.random().toString(36).slice(2, 7)}`,
          name: ch.name || 'Unknown',
          logo: ch.logo || '',
          group: ch.group || 'Other',
          url: ch.url || '',
          type: ch.type || 'stream',
          useProxy: ch.useProxy || false,
          referer: ch.referer || '',
          origin: ch.origin || '',
        }));
      }
    } catch (err) {
      console.error('Failed to load channels.json:', err);
    }

    // Also load external links
    try {
      const linkRes = await fetch('/links.json');
      if (linkRes.ok) {
        const links = await linkRes.json();
        const linkChannels = links.map((link, i) => ({
          id: `link-${i}`,
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

    const seen = new Set();
    const unique = allChannels.filter((ch) => {
      if (!ch.url) return false;
      const key = ch.name + ch.url;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    dispatch({ type: 'SET_CHANNELS', payload: unique });
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
  const setSearch = useCallback((query) => {
    dispatch({ type: 'SET_SEARCH', payload: query });
  }, []);
  const setGroup = useCallback((group) => {
    dispatch({ type: 'SET_GROUP', payload: group });
  }, []);
  const toggleFavorite = useCallback((id) => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: id });
  }, []);
  const setVolume = useCallback((vol) => {
    dispatch({ type: 'SET_VOLUME', payload: vol });
  }, []);
  const setMuted = useCallback((muted) => {
    dispatch({ type: 'SET_MUTED', payload: muted });
  }, []);
  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);
  const toggleFavorites = useCallback(() => {
    dispatch({ type: 'TOGGLE_FAVORITES' });
  }, []);
  const showAll = useCallback(() => {
    dispatch({ type: 'SHOW_ALL' });
  }, []);

  const value = {
    ...state,
    setCurrentChannel, setSearch, setGroup, toggleFavorite,
    setVolume, setMuted, toggleSidebar, toggleFavorites, showAll, loadPlaylist,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}