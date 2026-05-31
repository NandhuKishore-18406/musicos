import { usePlayerStore } from '../../store/playerStore';

class AudioPlayerService {
  constructor() {
    this.audio = new Audio();
    this.isBlessed = false;
    
    // Restore session time on startup if a track exists
    const initialState = usePlayerStore.getState();
    if (initialState.currentTrack && initialState.currentTime > 0) {
      this.playTrack(initialState.currentTrack, initialState.currentTime, false);
    }
    
    // Listeners for store sync
    this.audio.addEventListener('timeupdate', () => {
      usePlayerStore.setState({ currentTime: this.audio.currentTime });
    });
    
    this.audio.addEventListener('ended', () => {
      this.handleSongEnd();
    });
    
    this.audio.addEventListener('play', () => {
      usePlayerStore.setState({ playbackState: 'playing' });
    });
    
    this.audio.addEventListener('pause', () => {
      if (this.audio.currentTime !== this.audio.duration) {
        usePlayerStore.setState({ playbackState: 'paused' });
      }
    });

    // Subscribe to store changes to reflect onto audio element
    usePlayerStore.subscribe((state, prevState) => {
      // Volume change
      if (state.volume !== prevState.volume) {
        this.audio.volume = state.volume / 100;
      }
      
      // Playback State change (triggered via UI)
      if (state.playbackState !== prevState.playbackState) {
        if (state.playbackState === 'playing' && this.audio.src) {
          this.audio.play().catch(e => {
            console.error("Playback failed (User Interaction Required):", e);
            usePlayerStore.setState({ playbackState: 'paused' });
          });
        } else if (state.playbackState === 'paused' || state.playbackState === 'stopped') {
          this.audio.pause();
        }
      }
      
      // Track change
      if (state.currentTrack !== prevState.currentTrack && state.currentTrack) {
        this.playTrack(state.currentTrack, 0, true);
      }
    });
  }

  bless() {
    if (!this.isBlessed) {
      this.audio.play().catch(() => {});
      this.audio.pause();
      this.isBlessed = true;
    }
  }

  async playTrack(track, startTime = 0, autoPlay = true) {
    try {
      let file;
      if (track.handle) {
        try {
          file = await track.handle.getFile();
        } catch (e) {
          console.error("Permission lost or file missing:", e);
        }
      } else {
        const { ScannerService } = await import('../../features/scanner/ScannerService');
        file = ScannerService.temporaryFileMap.get(track.id);
      }
      
      // Prevent Rapid-Click Race Condition:
      // If the user clicked another track while we were awaiting the file, abort this load!
      if (usePlayerStore.getState().currentTrack?.id !== track.id) {
        return;
      }
      
      if (!file) {
        console.error("File data missing for playback. Please remount the directory.");
        usePlayerStore.setState({ playbackState: 'stopped', currentTrack: null });
        const { useUIStore } = await import('../../store/playerStore');
        useUIStore.getState().setErrorPopup({
          title: "ERR_FILE_NOT_FOUND",
          message: "Audio file is missing. If you refreshed the page, you must execute 'MOUNT_DIR' again."
        });
        return;
      }
      
      // Prevent Memory Leaks: revoke previous object URL
      if (this.currentObjectURL) {
        URL.revokeObjectURL(this.currentObjectURL);
      }
      
      this.currentObjectURL = URL.createObjectURL(file);
      this.audio.src = this.currentObjectURL;
      
      // Prevent multiple listeners piling up from rapid calls
      if (this.onLoadedMetaData) {
        this.audio.removeEventListener('loadedmetadata', this.onLoadedMetaData);
      }
      
      if (startTime > 0) {
        this.onLoadedMetaData = () => {
          this.audio.currentTime = startTime;
          this.audio.removeEventListener('loadedmetadata', this.onLoadedMetaData);
          this.onLoadedMetaData = null;
        };
        this.audio.addEventListener('loadedmetadata', this.onLoadedMetaData);
      }
      
      if (autoPlay) {
        usePlayerStore.setState({ playbackState: 'playing' });
        // Call play() explicitly because Zustand won't trigger subscriber if state is ALREADY 'playing'
        this.audio.play().catch(e => {
          console.error("Playback failed (User Interaction Required):", e);
          usePlayerStore.setState({ playbackState: 'paused' });
        });
      } else {
        usePlayerStore.setState({ playbackState: 'paused' });
      }
      
    } catch (error) {
      console.error("Error playing track:", error);
      usePlayerStore.setState({ playbackState: 'stopped' });
    }
  }

  playNext() {
    const state = usePlayerStore.getState();
    const currentIndex = state.queue.findIndex(t => t.id === state.currentTrack?.id);
    if (currentIndex >= 0 && currentIndex < state.queue.length - 1) {
      usePlayerStore.setState({ currentTrack: state.queue[currentIndex + 1] });
    } else if (state.queue.length > 0) {
      usePlayerStore.setState({ currentTrack: state.queue[0] });
    }
  }

  playPrev() {
    const state = usePlayerStore.getState();
    const currentIndex = state.queue.findIndex(t => t.id === state.currentTrack?.id);
    if (currentIndex > 0) {
      usePlayerStore.setState({ currentTrack: state.queue[currentIndex - 1] });
    } else if (state.queue.length > 0) {
      usePlayerStore.setState({ currentTrack: state.queue[state.queue.length - 1] });
    }
  }

  seek(seconds) {
    if (this.audio && this.audio.src) {
      this.audio.currentTime = seconds;
    }
  }

  handleSongEnd() {
    const state = usePlayerStore.getState();
    if (state.repeat === 'one') {
      this.audio.currentTime = 0;
      this.audio.play();
      return;
    }
    
    const currentIndex = state.queue.findIndex(t => t.id === state.currentTrack?.id);
    if (currentIndex >= 0 && currentIndex < state.queue.length - 1) {
      usePlayerStore.setState({ currentTrack: state.queue[currentIndex + 1] });
    } else if (state.repeat === 'all' && state.queue.length > 0) {
      usePlayerStore.setState({ currentTrack: state.queue[0] });
    } else {
      usePlayerStore.setState({ playbackState: 'stopped' });
    }
  }
}

export const playerService = new AudioPlayerService();
