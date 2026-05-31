import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db/db';
import { useUIStore } from '../../store/playerStore';
import { useNavigate } from 'react-router-dom';

export function AlbumView() {
  const albums = useLiveQuery(() => db.albums.toArray()) || [];
  const [activeIndex, setActiveIndex] = useState(0);
  const setSelectedAlbumFilter = useUIStore(state => state.setSelectedAlbumFilter);
  const navigate = useNavigate();

  const handleNext = () => {
    setActiveIndex(prev => Math.min(albums.length - 1, prev + 1));
  };

  const handlePrev = () => {
    setActiveIndex(prev => Math.max(0, prev - 1));
  };

  const handleSelectAlbum = (album) => {
    setSelectedAlbumFilter(album.title);
    navigate('/library');
  };

  if (albums.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground uppercase tracking-widest text-sm animate-pulse">
        NO ALBUMS INDEXED
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col uppercase bg-background relative overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-dashed border-border/50">
        <div>
          <h2 className="text-xl font-bold tracking-widest text-primary">ALBUMS.DAT</h2>
          <div className="text-xs text-muted-foreground mt-1">
            TOTAL_ALBUMS: {albums.length} | COVER_FLOW_ACTIVE
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          USE [PREV]/[NEXT] BUTTONS OR ARROW KEYS
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative perspective-[1000px]">
        {/* Carousel Container */}
        <div className="relative w-full h-[300px] flex items-center justify-center transform-style-3d">
          {albums.map((album, index) => {
            const offset = index - activeIndex;
            const absOffset = Math.abs(offset);
            
            // Cover flow math
            const zIndex = 100 - absOffset;
            const translateX = offset * 120;
            const rotateY = offset === 0 ? 0 : (offset > 0 ? -45 : 45);
            const scale = offset === 0 ? 1 : 0.8;
            const opacity = absOffset > 3 ? 0 : (1 - (absOffset * 0.2));
            
            const isActive = offset === 0;

            return (
              <div 
                key={album.id}
                onClick={() => isActive ? handleSelectAlbum(album) : setActiveIndex(index)}
                className={`absolute w-[200px] h-[200px] border-2 cursor-pointer transition-all duration-500 ease-out flex flex-col items-center justify-center text-center p-2
                  ${isActive ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.4)]' : 'border-muted-foreground/30 bg-background hover:border-primary/50'}`}
                style={{
                  transform: `translateX(${translateX}px) translateZ(${-absOffset * 100}px) rotateY(${rotateY}deg) scale(${scale})`,
                  zIndex,
                  opacity,
                  pointerEvents: opacity === 0 ? 'none' : 'auto'
                }}
              >
                {/* ASCII/Text retro album cover */}
                <div className="flex-1 flex flex-col items-center justify-center w-full">
                  <div className={`text-3xl font-bold mb-2 ${isActive ? 'text-primary' : 'text-muted-foreground/50'}`}>
                    {album.trackCount}
                  </div>
                  <div className={`text-sm font-bold break-words w-full line-clamp-2 ${isActive ? 'text-primary' : 'text-muted-foreground/70'}`}>
                    {album.title}
                  </div>
                  <div className={`text-xs mt-1 break-words w-full line-clamp-1 ${isActive ? 'text-accent' : 'text-muted-foreground/40'}`}>
                    {album.artist}
                  </div>
                </div>
                <div className={`text-[10px] mt-2 border-t border-dashed w-full pt-1 ${isActive ? 'border-primary/50 text-primary/70' : 'border-muted-foreground/20 text-muted-foreground/30'}`}>
                  TRACKS: {album.trackCount}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Album Details */}
        <div className="mt-8 h-20 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-xl font-bold text-primary tracking-widest bg-primary/10 px-4 py-1 border border-primary/30">
            {albums[activeIndex]?.title}
          </div>
          <div className="text-sm text-accent mt-2 tracking-widest">
            {albums[activeIndex]?.artist}
          </div>
        </div>
        
        {/* Controls */}
        <div className="mt-4 flex gap-4">
          <button 
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className="dos-button px-4 py-1 border border-primary text-primary disabled:opacity-30 hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            &lt;&lt; PREV
          </button>
          <button 
            onClick={() => handleSelectAlbum(albums[activeIndex])}
            className="dos-button px-8 py-1 border border-accent text-accent font-bold hover:bg-accent hover:text-accent-foreground shadow-[0_0_10px_rgba(var(--accent),0.2)] transition-colors"
          >
            [ OPEN ALBUM ]
          </button>
          <button 
            onClick={handleNext}
            disabled={activeIndex === albums.length - 1}
            className="dos-button px-4 py-1 border border-primary text-primary disabled:opacity-30 hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            NEXT &gt;&gt;
          </button>
        </div>
      </div>
    </div>
  );
}
