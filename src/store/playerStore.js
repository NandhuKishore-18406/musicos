import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePlayerStore = create(
  persist(
    (set) => ({
      currentTrack: null,
      queue: [],
      history: [],
      playbackState: 'stopped', // 'playing' | 'paused' | 'stopped'
      volume: 100,
      shuffle: false,
      repeat: 'none', // 'none' | 'all' | 'one'
      currentTime: 0,
      
      // Actions
      setCurrentTrack: (track) => set({ currentTrack: track }),
      setPlaybackState: (state) => set({ playbackState: state }),
      setVolume: (volume) => set({ volume }),
      setQueue: (queue) => set({ queue }),
      toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
      setRepeat: (repeat) => set({ repeat }),
      setCurrentTime: (time) => set({ currentTime: time }), // Added action for restoring
    }),
    {
      name: 'musicos-player-session',
      partialize: (state) => ({
        currentTrack: state.currentTrack,
        queue: state.queue,
        volume: state.volume,
        shuffle: state.shuffle,
        repeat: state.repeat,
        currentTime: state.currentTime,
      }),
    }
  )
);

export const useUIStore = create((set) => ({
  activePanel: 'library', // 'library' | 'lyrics' | 'queue' | 'full-player'
  hasBooted: false,
  searchQuery: '',
  selectedAlbumFilter: null,
  errorPopup: null, // { title: string, message: string } | null
  
  // Actions
  setActivePanel: (panel) => set({ activePanel: panel }),
  setHasBooted: (status) => set({ hasBooted: status }),
  replayBootSequence: () => set({ hasBooted: false }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedAlbumFilter: (album) => set({ selectedAlbumFilter: album }),
  setErrorPopup: (popup) => set({ errorPopup: popup }),
}));
