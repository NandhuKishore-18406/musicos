import { useState, useEffect } from 'react';
import { useUIStore } from '../../store/playerStore';

const BOOT_LINES = [
  { text: "Starting MUSICOS...", delay: 500 },
  { text: "Checking memory ........ OK", delay: 1000 },
  { text: "Mounting C:\\ .......... OK", delay: 1400 },
  { text: "Scanning library ...... OK", delay: 1800 },
  { text: "Loading playlists ..... OK", delay: 2100 },
  { text: "Initializing audio .... OK", delay: 2400 },
  { text: "Loading shell ......... OK", delay: 2800 },
];

export function BootSequence() {
  const [lines, setLines] = useState([]);
  const [stage, setStage] = useState('booting'); // 'booting' | 'dir' | 'run'
  const setHasBooted = useUIStore((state) => state.setHasBooted);

  useEffect(() => {
    let timeouts = [];

    // Boot lines sequence
    BOOT_LINES.forEach((line, index) => {
      const t = setTimeout(() => {
        setLines((prev) => [...prev, line.text]);
      }, line.delay);
      timeouts.push(t);
    });

    // Move to DIR stage
    const dirTimeout = setTimeout(() => {
      setStage('dir');
      setLines((prev) => [
        ...prev, 
        "",
        "C:\\> DIR",
        " Volume in drive C is MUSICOS",
        " Volume Serial Number is 1337-BEEF",
        " ",
        " Directory of C:\\MUSIC",
        " ",
        "AESTHETIC          <DIR>      05-31-26  12:00p",
        "SYNTHWAVE          <DIR>      05-31-26  12:01p",
        "JAZZ               <DIR>      05-31-26  12:02p",
        "CLASSICAL          <DIR>      05-31-26  12:03p",
        "               4 File(s)              0 bytes",
        "               2 Dir(s)   1,024,000,000 bytes free"
      ]);
    }, 3500);
    timeouts.push(dirTimeout);

    // Move to RUN stage
    const runTimeout = setTimeout(() => {
      setStage('run');
      setLines((prev) => [...prev, "", "C:\\> MUSIC.EXE"]);
    }, 5500);
    timeouts.push(runTimeout);

    // Finish boot
    const finishTimeout = setTimeout(() => {
      setHasBooted(true);
    }, 6500);
    timeouts.push(finishTimeout);

    return () => timeouts.forEach(clearTimeout);
  }, [setHasBooted]);

  return (
    <div className="h-screen w-screen bg-background text-foreground font-mono p-4 crt-effect overflow-hidden">
      <div className="max-w-3xl">
        {lines.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">{line}</div>
        ))}
        <span className="blink">_</span>
      </div>
    </div>
  );
}
