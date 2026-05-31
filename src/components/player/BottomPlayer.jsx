import { useState } from 'react';
import { usePlayerStore, useUIStore } from '../../store/playerStore';
import { ScannerService } from '../../features/scanner/ScannerService';
import { useNavigate } from 'react-router-dom';

import { db } from '../../lib/db/db';

export function BottomPlayer() {
  const [inputStr, setInputStr] = useState('');
  const [feedback, setFeedback] = useState('');
  const { currentTrack, setCurrentTrack, playbackState, setPlaybackState, volume, setVolume, queue, setQueue, currentTime } = usePlayerStore();
  const setSearchQuery = useUIStore(state => state.setSearchQuery);
  const setSelectedAlbumFilter = useUIStore(state => state.setSelectedAlbumFilter);
  const navigate = useNavigate();

  const handleCommand = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = inputStr.trim().toUpperCase();
      
      switch(cmd) {
        case 'PLAY':
          setPlaybackState('playing');
          setFeedback('Command executed: PLAY');
          break;
        case 'PAUSE':
          setPlaybackState('paused');
          setFeedback('Command executed: PAUSE');
          break;
        case 'MOUNT':
          setFeedback('Awaiting directory selection...');
          ScannerService.startMountProcess()
            .then(count => {
              setFeedback(`Scan complete: ${count} tracks added.`);
            })
            .catch(err => {
              if (err?.name === 'AbortError') {
                setFeedback('Mount aborted by user.');
              } else {
                setFeedback(`Error: ${err?.message}`);
              }
            });
          break;
        case 'RANDSONG':
          setFeedback('Command not yet implemented: RANDSONG');
          break;
        case 'RANDALB':
          setFeedback('Command not yet implemented: RANDALB');
          break;
        case 'QUEUELIST':
          if (queue.length === 0) {
            setFeedback('Queue is empty.');
          } else {
            setFeedback(`Queue: ${queue.length} track(s). Next: ${queue[0]?.title || 'None'}`);
          }
          break;
        case 'QUEUENEW':
          setQueue([]);
          setFeedback('Created new empty queue.');
          break;
        case 'PLAYLIST':
          setFeedback('Command not yet implemented: PLAYLIST');
          break;
        case 'NEXT':
          if (queue.length > 0) {
            import('../../lib/services/AudioPlayerService').then(({ playerService }) => playerService.playNext());
            setFeedback('Command executed: NEXT');
          } else {
            setFeedback('Queue is empty.');
          }
          break;
        case 'PREV':
          if (queue.length > 0) {
            import('../../lib/services/AudioPlayerService').then(({ playerService }) => playerService.playPrev());
            setFeedback('Command executed: PREV');
          } else {
            setFeedback('Queue is empty.');
          }
          break;
        case 'HELP':
          setFeedback('Commands: PLAY, PAUSE, NEXT, PREV, MOUNT, QUEUE, QUEUENEW, VOL, SEEK, SEARCH, CLEAR, ALBUM, SONGLIST, RESETDB');
          break;
        case 'RESETDB':
          db.delete().then(() => {
            window.location.reload();
          });
          break;
        case 'CLEAR':
          setSearchQuery('');
          setSelectedAlbumFilter(null);
          setFeedback('Search and album filters cleared.');
          break;
        case 'ALBUM':
          navigate('/albums');
          setFeedback('Switched to Album Cover Flow.');
          break;
        case 'SONGLIST':
          setSelectedAlbumFilter(null);
          navigate('/library');
          setFeedback('Switched to full song list.');
          break;
        case '':
          break;
        default:
          if (cmd.startsWith('VOL')) {
            const v = parseInt(cmd.split(' ')[1]);
            if (!isNaN(v) && v >= 0 && v <= 100) {
              setVolume(v);
              setFeedback(`Volume set to ${v}%`);
            } else {
              setFeedback('Invalid volume parameter. Use VOL 0-100');
            }
          } else if (cmd.startsWith('SEEK')) {
            const s = parseInt(cmd.split(' ')[1]);
            if (!isNaN(s)) {
              import('../../lib/services/AudioPlayerService').then(({ playerService }) => playerService.seek(s));
              setFeedback(`Seeked to ${s} seconds`);
            } else {
              setFeedback('Invalid seek parameter. Use SEEK <SECONDS>');
            }
          } else if (cmd.startsWith('QUEUE ')) {
            const songName = inputStr.substring(6).trim();
            db.tracks.filter(t => t.title.toLowerCase().includes(songName.toLowerCase())).first().then(track => {
              if (track) {
                // Must get latest queue state in case it changed
                const currentQueue = usePlayerStore.getState().queue;
                setQueue([...currentQueue, track]);
                setFeedback(`Added to queue: ${track.title}`);
                
                // If nothing is currently playing, start playing this newly queued song!
                const currentTrackState = usePlayerStore.getState().currentTrack;
                if (!currentTrackState) {
                  setCurrentTrack(track);
                  import('../../lib/services/AudioPlayerService').then(({ playerService }) => playerService.bless());
                }
              } else {
                setFeedback(`Track not found matching: ${songName}`);
              }
            });
          } else if (cmd.startsWith('SEARCH ')) {
            const query = inputStr.substring(7).trim();
            setSearchQuery(query);
            setFeedback(`Searching for: ${query}`);
          } else {
            setFeedback(`Unknown command: ${cmd}. Type HELP for list.`);
          }
          break;
      }
      setInputStr('');
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const renderProgressBar = () => {
    if (!currentTrack || !currentTrack.duration) return `[${' '.repeat(30)}] 00:00 / 00:00`;
    const percent = Math.min(1, currentTime / currentTrack.duration);
    const filled = Math.round(percent * 30);
    const empty = 30 - filled;
    const bar = '='.repeat(Math.max(0, filled - 1)) + (filled > 0 ? '>' : '') + ' '.repeat(Math.max(0, empty));
    return `[${bar}] ${formatTime(currentTime)} / ${formatTime(currentTrack.duration)}`;
  };

  const statusStr = currentTrack 
    ? `PLAYING: ${currentTrack.artist} - ${currentTrack.title}`
    : `IDLE - NO MEDIA`;

  return (
    <div className="border-t border-dashed border-border flex flex-col justify-between p-2 bg-background crt-effect">
      <div className="flex justify-between text-xs text-muted-foreground uppercase tracking-widest px-2 mb-1">
        <span>STATUS: [{playbackState.toUpperCase()}]</span>
        <span className="truncate mx-4">{statusStr}</span>
        <span>VOL: [{volume}%]</span>
      </div>
      
      <div className="px-2 text-primary font-mono text-xs mb-2">
        {renderProgressBar()}
      </div>
      
      {feedback && (
        <div className="px-2 text-accent text-sm mt-1 animate-pulse">
          {feedback}
        </div>
      )}
      
      <div className="flex items-center gap-2 text-primary text-lg px-2 mt-1 border-t border-dashed border-border/50 pt-2">
        <span>&gt;</span>
        <input 
          type="text" 
          value={inputStr}
          onChange={(e) => setInputStr(e.target.value)}
          onKeyDown={handleCommand}
          className="bg-transparent border-none outline-none flex-1 uppercase text-primary caret-primary"
          autoFocus
          spellCheck="false"
          autoComplete="off"
        />
        <span className="blink text-primary">_</span>
      </div>
    </div>
  );
}
