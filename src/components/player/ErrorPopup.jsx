import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { useUIStore } from "../../store/playerStore";

export function ErrorPopup() {
  const errorPopup = useUIStore(state => state.errorPopup);
  const setErrorPopup = useUIStore(state => state.setErrorPopup);

  if (!errorPopup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md bg-background border-accent shadow-[0_0_15px_rgba(var(--accent),0.3)] crt-effect">
        <CardHeader className="border-b border-dashed border-border/50 pb-4">
          <CardTitle className="text-accent uppercase tracking-widest text-lg font-mono">
            {errorPopup.title || "SYSTEM_ERROR"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-primary font-mono text-sm leading-relaxed uppercase">
            {errorPopup.message}
          </p>
        </CardContent>
        <CardFooter className="flex justify-end pt-4">
          <button
            onClick={() => setErrorPopup(null)}
            className="dos-button px-6 py-2 border border-accent text-accent hover:bg-accent hover:text-accent-foreground font-mono font-bold uppercase transition-colors"
          >
            [OK]
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
