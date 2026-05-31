import { Sidebar } from './Sidebar';
import { BottomPlayer } from '../player/BottomPlayer';

export function AppLayout({ children }) {
  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground font-mono overflow-hidden crt-effect">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 flex flex-col overflow-hidden p-2">
          <div className="flex-1 overflow-y-auto dos-panel h-full border-none p-0">
            {children}
          </div>
        </main>
      </div>
      
      <BottomPlayer />
    </div>
  );
}
