import { Link, useLocation } from 'react-router-dom';
import { useUIStore } from '../../store/playerStore';

export function Sidebar() {
  const { isSidebarOpen } = useUIStore();
  const location = useLocation();

  if (!isSidebarOpen) return null;

  const navItems = [
    { name: 'LIBRARY', path: '/library', shortcut: '[1]' },
    { name: 'ALBUMS', path: '/albums', shortcut: '[2]' },
    { name: 'RECENT', path: '/recent', shortcut: '[3]' },
    { name: 'SETTINGS', path: '/settings', shortcut: '[0]' },
  ];

  return (
    <aside className="w-64 border-r border-dashed border-border flex flex-col h-full bg-background p-2">
      <div className="text-center border-b border-dashed border-border pb-4 mb-4">
        <h1 className="font-bold text-xl tracking-widest uppercase text-primary">
          MUSICOS v1.0
        </h1>
        <div className="text-xs text-muted-foreground">LOCAL NODE</div>
      </div>
      
      <nav className="flex-1 space-y-2 crt-effect">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex justify-between items-center px-2 py-1 dos-button ${
                isActive 
                  ? 'bg-primary text-primary-foreground font-bold' 
                  : 'text-muted-foreground'
              }`}
            >
              <span>{item.name}</span>
              <span className="text-xs opacity-50">{item.shortcut}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="pt-4 border-t border-dashed border-border text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>MEM: 640K</span>
          <span>OK</span>
        </div>
      </div>
    </aside>
  );
}
