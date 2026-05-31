import Dexie from 'dexie';

export const db = new Dexie('MusicAppDB');

db.version(3).stores({
  tracks: 'id, title, artist, album, albumArtist, genre, year, duration, bitrate, codec, sampleRate, bitDepth, playCount, liked, lastPlayed, artworkId, addedAt',
  albums: 'id, title, artist, year, artUrl, trackCount',
  artists: 'id, name, trackCount, albumCount',
  playlists: 'id, name, type, createdAt', 
  playlistTracks: 'id, playlistId, trackId, sortOrder',
  directories: 'id, path, handle' 
});
