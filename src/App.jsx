import { useEffect } from "react";
import { AppProviders } from "./app/provider";
import { AppLayout } from "./components/layouts/AppLayout";
import { BootSequence } from "./components/player/BootSequence";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useUIStore } from "./store/playerStore";
import { LibraryView } from "./features/library/LibraryView";
import { ScannerService } from "./features/scanner/ScannerService";
import { ErrorPopup } from "./components/player/ErrorPopup";

function SettingsView() {
  const replayBootSequence = useUIStore((state) => state.replayBootSequence);
  
  return (
    <div className="p-4 space-y-4">
      <div className="border-b border-dashed border-border pb-2 uppercase tracking-widest flex justify-between">
        <span>C:\SETTINGS.INI</span>
        <span>[ESC] BACK</span>
      </div>
      <p className="text-muted-foreground">System configuration parameters.</p>
      
      <div className="mt-8">
        <button 
          className="dos-button px-4 py-2 border border-border text-primary"
          onClick={replayBootSequence}
        >
          &gt; REBOOT SYSTEM
        </button>
      </div>
    </div>
  );
}

import { AlbumView } from "./features/library/AlbumView";

function MainApp() {
  const hasBooted = useUIStore((state) => state.hasBooted);

  if (!hasBooted) {
    return <BootSequence />;
  }

  return (
    <>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/library" element={<LibraryView />} />
            <Route path="/albums" element={<AlbumView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="*" element={<Navigate to="/library" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
      <ErrorPopup />
    </>
  );
}

export default function App() {
  useEffect(() => {
    ScannerService.init();
  }, []);

  return (
    <AppProviders>
      <MainApp />
    </AppProviders>
  );
}