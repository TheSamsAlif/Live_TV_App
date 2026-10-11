import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';

const AppContext = createContext();

const STORAGE_KEYS = {
  FAVORITES: 'samsalif_favorites',
  RECENT: 'samsalif_recent',
  LAST_CHANNEL: 'samsalif_last_channel',
  VOLUME: 'samsalif_volume',
  MUTED: 'samsalif_muted',
  OFFLINE: 'samsalif_offline_channels',
  ONLY_ONLINE: 'samsalif_only_online',
  VIEW_MODE: 'samsalif_view_mode',
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

const CATEGORY_ORDER = [
  'All',
  'Bangla',
  'Sports',
  'News',
  'Movies',
  'Entertainment',
  'Music',
  'Kids',
  'Documentary',
  'Religious'
];

const initialState = {
  channels: [],
  groups: CATEGORY_ORDER,
  filteredChannels: [],
  currentChannel: null,
  searchQuery: '',
  selectedGroup: 'All',
  isLoading: true,
  error: null,
  favorites: loadFromStorage(STORAGE_KEYS.FAVORITES, []),
  recentChannels: loadFromStorage(STORAGE_KEYS.RECENT, []),
  offlineChannels: loadFromStorage(STORAGE_KEYS.OFFLINE, []),
  hideOffline: loadFromStorage(STORAGE_KEYS.ONLY_ONLINE, true),
  viewMode: loadFromStorage(STORAGE_KEYS.VIEW_MODE, 'sections'), // 'sections' or 'grid'
  playerMode: 'hidden', // 'hidden', 'modal', 'mini'
  volume: loadFromStorage(STORAGE_KEYS.VOLUME, 0.8),
  isMuted: loadFromStorage(STORAGE_KEYS.MUTED, false),
  sidebarOpen: false,
  showFavorites: false,
};

function filterChannels(channels, { searchQuery, selectedGroup, showFavorites, favorites, offlineChannels, hideOffline }) {
  let list = channels;

  // Filter out offline channels if toggle is ON
  if (hideOffline) {
    list = list.filter((ch) => !offlineChannels.includes(ch.id) && ch.isOnline !== false);
  }

  // Filter by favorites
  if (showFavorites) {
    list = list.filter((ch) => favorites.includes(ch.id));
  }

  // Filter by category
  if (selectedGroup && selectedGroup !== 'All') {
    list = list.filter((ch) => ch.group === selectedGroup);
  }

  // Filter by search
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter((ch) =>
      ch.name.toLowerCase().includes(q) ||
      (ch.group && ch.group.toLowerCase().includes(q))
    );
  }

  return list;
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_CHANNELS': {
      const channels = action.payload;
      const discoveredGroups = [...new Set(channels.map((ch) => ch.group).filter(Boolean))];
      // Keep defined order and append any unexpected groups
      const ordered = [
        'All',
        ...CATEGORY_ORDER.slice(1).filter((g) => discoveredGroups.includes(g)),
        ...discoveredGroups.filter((g) => !CATEGORY_ORDER.includes(g))
      ];

      const filtered = filterChannels(channels, {
        searchQuery: state.searchQuery,
        selectedGroup: state.selectedGroup,
        showFavorites: state.showFavorites,
        favorites: state.favorites,
        offlineChannels: state.offlineChannels,
        hideOffline: state.hideOffline,
      });

      return {
        ...state,
        channels,
        groups: ordered,
        filteredChannels: filtered,
        isLoading: false,
        error: null,
      };
    }

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_CURRENT_CHANNEL': {
      const channel = action.payload;
      if (!channel) return { ...state, currentChannel: null, playerMode: 'hidden' };

      const recent = state.recentChannels.filter((c) => c.id !== channel.id);
      const updatedRecent = [channel, ...recent].slice(0, 20);
      saveToStorage(STORAGE_KEYS.RECENT, updatedRecent);
      saveToStorage(STORAGE_KEYS.LAST_CHANNEL, channel.id);

      return {
        ...state,
        currentChannel: channel,
        recentChannels: updatedRecent,
        playerMode: state.playerMode === 'hidden' ? 'modal' : state.playerMode,
      };
    }

    case 'SET_PLAYER_MODE':
      return { ...state, playerMode: action.payload };

    case 'CLOSE_PLAYER':
      return { ...state, playerMode: 'hidden', currentChannel: null };

    case 'SET_SEARCH': {
      const searchQuery = action.payload;
      const filtered = filterChannels(state.channels, {
        searchQuery,
        selectedGroup: state.selectedGroup,
        showFavorites: state.showFavorites,
        favorites: state.favorites,
        offlineChannels: state.offlineChannels,
        hideOffline: state.hideOffline,
      });
      return { ...state, searchQuery, filteredChannels: filtered };
    }

    case 'SET_GROUP': {
      const selectedGroup = action.payload;
      const filtered = filterChannels(state.channels, {
        searchQuery: state.searchQuery,
        selectedGroup,
        showFavorites: false,
        favorites: state.favorites,
        offlineChannels: state.offlineChannels,
        hideOffline: state.hideOffline,
      });
      return { ...state, selectedGroup, filteredChannels: filtered, showFavorites: false };
    }

    case 'TOGGLE_FAVORITE': {
      const id = action.payload;
      const favorites = state.favorites.includes(id)
        ? state.favorites.filter((fid) => fid !== id)
        : [...state.favorites, id];
      saveToStorage(STORAGE_KEYS.FAVORITES, favorites);

      const filtered = filterChannels(state.channels, {
        searchQuery: state.searchQuery,
        selectedGroup: state.selectedGroup,
        showFavorites: state.showFavorites,
        favorites,
        offlineChannels: state.offlineChannels,
        hideOffline: state.hideOffline,
      });

      return { ...state, favorites, filteredChannels: filtered };
    }

    case 'TOGGLE_FAVORITES_VIEW': {
      const showFavorites = !state.showFavorites;
      const filtered = filterChannels(state.channels, {
        searchQuery: state.searchQuery,
        selectedGroup: 'All',
        showFavorites,
        favorites: state.favorites,
        offlineChannels: state.offlineChannels,
        hideOffline: state.hideOffline,
      });
      return { ...state, showFavorites, selectedGroup: 'All', filteredChannels: filtered };
    }

    case 'MARK_CHANNEL_OFFLINE': {
      const id = action.payload;
      if (!id || state.offlineChannels.includes(id)) return state;
      const offlineChannels = [...state.offlineChannels, id];
      saveToStorage(STORAGE_KEYS.OFFLINE, offlineChannels);

      const filtered = filterChannels(state.channels, {
        searchQuery: state.searchQuery,
        selectedGroup: state.selectedGroup,
        showFavorites: state.showFavorites,
        favorites: state.favorites,
        offlineChannels,
        hideOffline: state.hideOffline,
      });

      return { ...state, offlineChannels, filteredChannels: filtered };
    }

    case 'RESET_OFFLINE_CHANNELS': {
      saveToStorage(STORAGE_KEYS.OFFLINE, []);
      const filtered = filterChannels(state.channels, {
        searchQuery: state.searchQuery,
        selectedGroup: state.selectedGroup,
        showFavorites: state.showFavorites,
        favorites: state.favorites,
        offlineChannels: [],
        hideOffline: state.hideOffline,
      });
      return { ...state, offlineChannels: [], filteredChannels: filtered };
    }

    case 'TOGGLE_HIDE_OFFLINE': {
      const hideOffline = !state.hideOffline;
      saveToStorage(STORAGE_KEYS.ONLY_ONLINE, hideOffline);
      const filtered = filterChannels(state.channels, {
        searchQuery: state.searchQuery,
        selectedGroup: state.selectedGroup,
        showFavorites: state.showFavorites,
        favorites: state.favorites,
        offlineChannels: state.offlineChannels,
        hideOffline,
      });
      return { ...state, hideOffline, filteredChannels: filtered };
    }

    case 'SET_VIEW_MODE': {
      const viewMode = action.payload;
      saveToStorage(STORAGE_KEYS.VIEW_MODE, viewMode);
      return { ...state, viewMode };
    }

    case 'SET_VOLUME': {
      saveToStorage(STORAGE_KEYS.VOLUME, action.payload);
      return { ...state, volume: action.payload };
    }

    case 'SET_MUTED': {
      saveToStorage(STORAGE_KEYS.MUTED, action.payload);
      return { ...state, isMuted: action.payload };
    }

    case 'RESTORE_LAST_CHANNEL': {
      const lastId = action.payload;
      const found = state.channels.find((c) => c.id === lastId);
      if (found) {
        return { ...state, currentChannel: found };
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

    try {
      // Primary: load curated verified 8K/HD channels
      const res = await fetch('/channels.json');
      if (res.ok) {
        const channels = await res.json();
        if (Array.isArray(channels) && channels.length > 0) {
          dispatch({ type: 'SET_CHANNELS', payload: channels });
          const lastId = loadFromStorage(STORAGE_KEYS.LAST_CHANNEL, null);
          if (lastId) {
            dispatch({ type: 'RESTORE_LAST_CHANNEL', payload: lastId });
          }
          return;
        }
      }
    } catch (e) {
      console.warn('Error loading local channels.json, checking fallback...', e);
    }

    // Fallback if channels.json had an issue
    try {
      const res = await fetch('https://iptv-org.github.io/iptv/countries/bd.m3u');
      if (res.ok) {
        const text = await res.text();
        const lines = text.split('\n');
        const fallback = [];
        let cur = {};
        for (let l of lines) {
          l = l.trim();
          if (l.startsWith('#EXTINF:')) {
            const name = l.split(',').pop().trim();
            const logoMatch = l.match(/tvg-logo="([^"]+)"/);
            cur = { name, logo: logoMatch ? logoMatch[1] : '', group: 'Bangla' };
          } else if (l && !l.startsWith('#')) {
            cur.url = l;
            cur.id = 'ch-' + Math.random().toString(36).substring(2, 8);
            cur.type = 'stream';
            fallback.push({ ...cur });
            cur = {};
          }
        }
        if (fallback.length > 0) {
          dispatch({ type: 'SET_CHANNELS', payload: fallback });
          return;
        }
      }
    } catch {}

    dispatch({ type: 'SET_ERROR', payload: 'Unable to load channel list. Please verify your connection.' });
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

  const setPlayerMode = useCallback((mode) => {
    dispatch({ type: 'SET_PLAYER_MODE', payload: mode });
  }, []);

  const closePlayer = useCallback(() => {
    dispatch({ type: 'CLOSE_PLAYER' });
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

  const toggleFavoritesView = useCallback(() => {
    dispatch({ type: 'TOGGLE_FAVORITES_VIEW' });
  }, []);

  const markChannelOffline = useCallback((channelId) => {
    dispatch({ type: 'MARK_CHANNEL_OFFLINE', payload: channelId });
  }, []);

  const resetOfflineChannels = useCallback(() => {
    dispatch({ type: 'RESET_OFFLINE_CHANNELS' });
  }, []);

  const toggleHideOffline = useCallback(() => {
    dispatch({ type: 'TOGGLE_HIDE_OFFLINE' });
  }, []);

  const setViewMode = useCallback((mode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  const setVolume = useCallback((vol) => {
    dispatch({ type: 'SET_VOLUME', payload: vol });
  }, []);

  const setMuted = useCallback((muted) => {
    dispatch({ type: 'SET_MUTED', payload: muted });
  }, []);

  const playNextChannel = useCallback(() => {
    if (!state.currentChannel || state.filteredChannels.length === 0) return;
    const currentIndex = state.filteredChannels.findIndex((c) => c.id === state.currentChannel.id);
    const nextIndex = (currentIndex + 1) % state.filteredChannels.length;
    dispatch({ type: 'SET_CURRENT_CHANNEL', payload: state.filteredChannels[nextIndex] });
  }, [state.currentChannel, state.filteredChannels]);

  const playPrevChannel = useCallback(() => {
    if (!state.currentChannel || state.filteredChannels.length === 0) return;
    const currentIndex = state.filteredChannels.findIndex((c) => c.id === state.currentChannel.id);
    const prevIndex = (currentIndex - 1 + state.filteredChannels.length) % state.filteredChannels.length;
    dispatch({ type: 'SET_CURRENT_CHANNEL', payload: state.filteredChannels[prevIndex] });
  }, [state.currentChannel, state.filteredChannels]);

  const value = {
    ...state,
    setCurrentChannel,
    setPlayerMode,
    closePlayer,
    setSearch,
    setGroup,
    toggleFavorite,
    toggleFavoritesView,
    markChannelOffline,
    resetOfflineChannels,
    toggleHideOffline,
    setViewMode,
    setVolume,
    setMuted,
    playNextChannel,
    playPrevChannel,
    loadPlaylist,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
