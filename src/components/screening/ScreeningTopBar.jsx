import { Link } from "react-router-dom";
import Button from "../ui/Button";

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ScreeningTopBar({ elapsedSeconds = 0, onExit }) {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/70 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/logo.png" alt="Mindo" className="h-8 w-8 rounded-full shadow-soft" />
          <span className="font-display text-lg font-bold text-ink">Mindo</span>
        </Link>

        {elapsedSeconds > 0 && (
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3 py-1 font-mono text-xs text-ink-soft">
            {formatTime(elapsedSeconds)} / 5:00
          </span>
        )}

        <Button variant="secondary" onClick={onExit}>
          Exit
        </Button>
      </div>
    </header>
  );
}