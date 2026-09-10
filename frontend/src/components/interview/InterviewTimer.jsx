import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

/**
 * Counts elapsed answer time and, when a limit is given, counts down against it.
 *
 * The parent owns "should the clock run" via `running`, and reads elapsed time
 * back through `onTick` so it can be stored with the answer. The timer never
 * calls back into the parent during render — only from its interval — which
 * keeps it from causing update loops.
 */
export const InterviewTimer = ({
  running = false,
  limitSeconds = 0,
  resetKey,
  onTick,
  onExpire,
  className,
}) => {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(null);
  const baseRef = useRef(0);
  const rafRef = useRef(null);
  const onTickRef = useRef(onTick);
  const onExpireRef = useRef(onExpire);
  const expiredRef = useRef(false);

  // Keep the latest callbacks without retriggering the interval effect.
  useEffect(() => {
    onTickRef.current = onTick;
    onExpireRef.current = onExpire;
  });

  // A change of question resets the clock.
  useEffect(() => {
    setElapsed(0);
    baseRef.current = 0;
    startRef.current = null;
    expiredRef.current = false;
  }, [resetKey]);

  const tick = useCallback(() => {
    if (startRef.current == null) return;
    const now = Date.now();
    const seconds = baseRef.current + Math.floor((now - startRef.current) / 1000);
    setElapsed(seconds);
    onTickRef.current?.(seconds);
    if (limitSeconds > 0 && seconds >= limitSeconds && !expiredRef.current) {
      expiredRef.current = true;
      onExpireRef.current?.();
    }
  }, [limitSeconds]);

  useEffect(() => {
    if (!running) {
      // Freeze accumulated time so pausing/resuming is seamless.
      if (startRef.current != null) {
        baseRef.current += Math.floor((Date.now() - startRef.current) / 1000);
        startRef.current = null;
      }
      return undefined;
    }

    startRef.current = Date.now();
    const id = setInterval(tick, 250);
    rafRef.current = id;
    return () => clearInterval(id);
  }, [running, tick]);

  const format = (total) => {
    const m = Math.floor(total / 60)
      .toString()
      .padStart(2, "0");
    const s = (total % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const overLimit = limitSeconds > 0 && elapsed >= limitSeconds;
  const nearLimit = limitSeconds > 0 && elapsed >= limitSeconds * 0.8 && !overLimit;
  const display = limitSeconds > 0 ? Math.max(0, limitSeconds - elapsed) : elapsed;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-mono font-semibold tabular-nums border transition-colors",
        overLimit
          ? "bg-destructive/10 text-destructive border-destructive/30"
          : nearLimit
          ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
          : "bg-muted text-foreground border-border",
        className
      )}
      role="timer"
      aria-live="off"
    >
      <span
        className={cn(
          "w-2 h-2 rounded-full",
          running ? "bg-current animate-pulse" : "bg-muted-foreground/40"
        )}
        aria-hidden="true"
      />
      {format(display)}
      {limitSeconds > 0 && (
        <span className="text-[10px] font-normal opacity-70">
          {overLimit ? "over time" : "left"}
        </span>
      )}
    </div>
  );
};

export default InterviewTimer;
