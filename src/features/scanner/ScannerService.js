import { parseBlob } from 'music-metadata';
import { db } from '../../lib/db/db';

export class ScannerService {
  // We'll keep a temporary in-memory map for the fallback method
  static temporaryFileMap = new Map();

  static async init() {
    if (typeof window.showDirectoryPicker !== 'function') {
      // If we are in fallback mode, any tracks from a previous session are dead. Wipe them.
      await db.tracks.clear();
      await db.directories.clear();
      const { usePlayerStore } = await import('../../store/playerStore');
      usePlayerStore.setState({ queue: [], currentTrack: null, playbackState: 'stopped' });
    }
  }

  static async startMountProcess() {
    if (typeof window.showDirectoryPicker === 'function') {
      try {
        const directoryHandle = await window.showDirectoryPicker({ mode: 'read' });
        return await this.scanDirectory(directoryHandle);
      } catch (err) {
        if (err.name === 'AbortError') throw err;
        console.warn("showDirectoryPicker failed, falling back to input", err);
      }
    }
    
    // Fallback using traditional input element
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true;
      input.directory = true;
      input.multiple = true;
      input.onchange = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
          const count = await this.scanFiles(e.target.files);
          resolve(count);
        } else {
          resolve(0);
        }
      };
      
      // Ensure the element is temporarily in the DOM for mobile browsers to trust the click
      input.style.display = 'none';
      document.body.appendChild(input);
      input.click();
      setTimeout(() => document.body.removeChild(input), 1000);
    });
  }

  static async scanDirectory(directoryHandle) {
    try {
      if (directoryHandle) {
        await db.directories.put({
          id: directoryHandle.name,
          path: directoryHandle.name,
          handle: directoryHandle
        });

        let scannedCount = 0;
        for await (const entry of this.getFilesRecursively(directoryHandle)) {
          if (entry.name.match(/\.(mp3|flac|m4a|wav|ogg)$/i)) {
            const success = await this.processAudioFile(entry, null);
            if (success) scannedCount++;
          }
        }
        return scannedCount;
      }
    } catch (err) {
      console.error("Scan aborted or failed:", err);
      return 0;
    }
  }

  static async scanFiles(fileList) {
    let scannedCount = 0;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.name.match(/\.(mp3|flac|m4a|wav|ogg)$/i)) {
        const success = await this.processAudioFile(null, file);
        if (success) scannedCount++;
      }
    }
    return scannedCount;
  }

  static async *getFilesRecursively(directoryHandle) {
    for await (const entry of directoryHandle.values()) {
      if (entry.kind === 'file') {
        yield entry;
      } else if (entry.kind === 'directory') {
        yield* this.getFilesRecursively(entry);
      }
    }
  }

  static async processAudioFile(fileHandle, directFile) {
    try {
      const file = fileHandle ? await fileHandle.getFile() : directFile;
      const metadata = await parseBlob(file);
      
      const fileName = fileHandle ? fileHandle.name : file.name;
      const trackId = `${fileName}-${file.size}`;
      
      const track = {
        id: trackId,
        title: metadata.common.title || fileName,
        artist: metadata.common.artist || 'Unknown Artist',
        album: metadata.common.album || 'Unknown Album',
        albumArtist: metadata.common.albumartist || metadata.common.artist || 'Unknown Artist',
        genre: metadata.common.genre?.[0] || '',
        year: metadata.common.year || '',
        duration: metadata.format.duration || 0,
        trackNumber: metadata.common.track?.no || null,
        discNumber: metadata.common.disk?.no || null,
        bitrate: metadata.format.bitrate || null,
        codec: metadata.format.codec || '',
        sampleRate: metadata.format.sampleRate || null,
        bitDepth: metadata.format.bitsPerSample || null,
        playCount: 0,
        liked: false,
        lastPlayed: null,
        artworkId: null, // Placeholder for artwork handling
        addedAt: Date.now(),
        handle: fileHandle || null 
      };

      // If we don't have a file handle (fallback method), store the file in memory to play it this session
      if (!fileHandle) {
        this.temporaryFileMap.set(trackId, file);
      }

      const existingTrack = await db.tracks.get(trackId);
      await db.tracks.put(track);

      // Simple album indexing
      if (track.album !== 'Unknown Album') {
        const albumTracksCount = await db.tracks.where('album').equals(track.album).count();
        const existingAlbum = await db.albums.get(track.album);
        
        if (!existingAlbum) {
          await db.albums.put({
            id: track.album,
            title: track.album,
            artist: track.artist,
            year: track.year,
            trackCount: albumTracksCount,
          });
        } else {
          await db.albums.update(track.album, { trackCount: albumTracksCount });
        }
      }
      return true;
    } catch (err) {
      console.error(`Failed to process:`, err);
      return false;
    }
  }
}
