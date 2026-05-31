import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db/db';
import { ScannerService } from '../scanner/ScannerService';
import { usePlayerStore, useUIStore } from '../../store/playerStore';
import { Virtuoso } from 'react-virtuoso';
import { playerService } from '../../lib/services/AudioPlayerService';
import Fuse from 'fuse.js';

export function LibraryView() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  
  const { setCurrentTrack, setQueue, currentTrack } = usePlayerStore();
  const searchQuery = useUIStore(state => state.searchQuery);
  const selectedAlbumFilter = useUIStore(state => state.selectedAlbumFilter);
  const setSelectedAlbumFilter = useUIStore(state => state.setSelectedAlbumFilter);

  const rawTracks = useLiveQuery(() => db.tracks.toArray()) || [];
  const directories = useLiveQuery(() => db.directories.toArray()) || [];

  const tracks = useMemo(() => {
    let filtered = rawTracks;
    
    // Apply album filter first
    if (selectedAlbumFilter) {
      filtered = filtered.filter(t => t.album === selectedAlbumFilter);
    }
    
    // Then apply search query
    if (!searchQuery) return filtered;
    const fuse = new Fuse(filtered, {
      keys: ['title', 'artist', 'album'],
      threshold: 0.4,
      ignoreLocation: true,
    });
    return fuse.search(searchQuery).map(result => result.item);
  }, [rawTracks, searchQuery, selectedAlbumFilter]);

  const handleMount = async () => {
    try {
      setIsScanning(true);
      setScanStatus('MOUNTING_DRIVE...');
      const count = await ScannerService.startMountProcess();
      setScanStatus(`SCAN_COMPLETE: ${count} FILE(S) ADDED`);
    } catch (err) {
      if (err?.name !== 'AbortError') {
        setScanStatus('ERROR: MOUNT_FAILED');
      }
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanStatus(''), 3000);
    }
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playerService.bless();
      setQueue(tracks);
      setCurrentTrack(tracks[0]);
    }
  };

  const handlePlayTrack = (track) => {
    playerService.bless();
    setQueue(tracks);
    setCurrentTrack(track);
  };

  const formatTime = (secs) => {
    if (!secs) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="h-full flex flex-col uppercase">
      <div className="flex items-center justify-between p-4 border-b border-dashed border-border/50">
        <div>
          <h2 className="text-xl font-bold tracking-widest text-primary">LIBRARY.DAT</h2>
          <div className="text-xs text-muted-foreground mt-1">
            DIRS_MOUNTED: {directories.length} | TRACKS_INDEXED: {rawTracks.length}
            {selectedAlbumFilter && (
              <span className="text-primary ml-2">| ALBUM: [{selectedAlbumFilter}]</span>
            )}
            {searchQuery && (
              <span className="text-accent ml-2">| SEARCH: "{searchQuery}"</span>
            )}
            {(selectedAlbumFilter || searchQuery) && (
              <span className="text-muted-foreground ml-2">({tracks.length} MATCHES)</span>
            )}
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={handlePlayAll}
            className="border border-primary text-primary hover:bg-primary hover:text-primary-foreground px-4 py-1 text-sm transition-colors"
            disabled={tracks.length === 0}
          >
            &gt; PLAY_ALL
          </button>
          <button 
            onClick={handleMount}
            disabled={isScanning}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-1 text-sm font-bold disabled:opacity-50 transition-colors"
          >
            {isScanning ? '[SCANNING...]' : '> MOUNT_DIR'}
          </button>
        </div>
      </div>

      {scanStatus && (
        <div className="px-4 py-2 text-xs text-accent animate-pulse border-b border-dashed border-border/50">
          {scanStatus}
        </div>
      )}

      <div className="flex-1 overflow-hidden p-4">
        {tracks.length === 0 ? (
          <p className="text-muted-foreground mt-8 text-center">
            DIRECTORY EMPTY. EXECUTE 'MOUNT_DIR' COMMAND.
          </p>
        ) : (
          <div className="h-full flex flex-col">
            <div className="grid grid-cols-[1fr_200px_80px] gap-4 mb-2 text-xs text-muted-foreground border-b border-dashed border-border/50 pb-2 px-2">
              <div>TRACK</div>
              <div>ARTIST</div>
              <div className="text-right">TIME</div>
            </div>
            
            <div className="flex-1">
              <Virtuoso
                data={tracks}
                className="h-full"
                itemContent={(index, track) => (
                  <div 
                    className={`grid grid-cols-[1fr_200px_80px] gap-4 py-1 px-2 text-sm cursor-pointer group ${currentTrack?.id === track.id ? 'bg-primary/20 text-primary font-bold' : 'hover:bg-primary hover:text-primary-foreground'}`}
                    onClick={() => handlePlayTrack(track)}
                  >
                    <div className="truncate">{track.title}</div>
                    <div className="truncate text-muted-foreground group-hover:text-primary-foreground/80">{track.artist}</div>
                    <div className="text-right text-muted-foreground group-hover:text-primary-foreground/80">{formatTime(track.duration)}</div>
                  </div>
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
