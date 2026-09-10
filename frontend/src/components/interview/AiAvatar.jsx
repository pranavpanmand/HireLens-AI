import { motion, AnimatePresence } from "framer-motion";
import { Bot, Mic, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The AI interviewer's "presence" indicator.
 *
 * Deliberately drawn with SVG/CSS rather than a stock video file: it needs no
 * binary asset, carries no third-party licensing question, scales to any size,
 * and respects prefers-reduced-motion for free via Framer Motion.
 *
 * States:
 *  - speaking : concentric rings pulse outward while the question is read aloud
 *  - listening: an equaliser bar animation while the candidate is answering
 *  - thinking : a slow shimmer while the answer is being evaluated
 *  - idle     : still
 */
export const AiAvatar = ({
  state = "idle",
  name = "Alex",
  role = "AI Interviewer",
  size = 132,
  className,
}) => {
  const isSpeaking = state === "speaking";
  const isListening = state === "listening";
  const isThinking = state === "thinking";

  const ringColor = isSpeaking
    ? "border-primary/40"
    : isListening
    ? "border-emerald-500/40"
    : "border-muted-foreground/20";

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Pulsing rings — only while actively speaking or listening */}
        <AnimatePresence>
          {(isSpeaking || isListening) &&
            [0, 1, 2].map((i) => (
              <motion.span
                key={i}
                aria-hidden="true"
                className={cn("absolute rounded-full border-2", ringColor)}
                style={{ width: size, height: size }}
                initial={{ scale: 0.75, opacity: 0.55 }}
                animate={{ scale: 1.28, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.55,
                  ease: "easeOut",
                }}
              />
            ))}
        </AnimatePresence>

        {/* Core disc */}
        <motion.div
          className={cn(
            "relative rounded-full flex items-center justify-center shadow-lg overflow-hidden",
            "bg-gradient-to-br from-primary/90 via-primary to-primary/70"
          )}
          style={{ width: size * 0.72, height: size * 0.72 }}
          animate={
            isSpeaking
              ? { scale: [1, 1.045, 1] }
              : isThinking
              ? { opacity: [1, 0.72, 1] }
              : { scale: 1, opacity: 1 }
          }
          transition={
            isSpeaking
              ? { duration: 0.85, repeat: Infinity, ease: "easeInOut" }
              : isThinking
              ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.3 }
          }
        >
          {isListening ? (
            // Equaliser: the candidate is the one talking now.
            <div className="flex items-end gap-[3px] h-1/2" aria-hidden="true">
              {[0.45, 0.8, 1, 0.65, 0.35].map((peak, i) => (
                <motion.span
                  key={i}
                  className="w-[3px] rounded-full bg-primary-foreground"
                  animate={{ height: [`${peak * 30}%`, "100%", `${peak * 30}%`] }}
                  transition={{
                    duration: 0.7 + i * 0.12,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ height: "40%" }}
                />
              ))}
            </div>
          ) : (
            <Bot
              className="text-primary-foreground"
              style={{ width: size * 0.3, height: size * 0.3 }}
              aria-hidden="true"
            />
          )}
        </motion.div>

        {/* Status chip */}
        <AnimatePresence>
          {(isSpeaking || isListening) && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className={cn(
                "absolute -bottom-1 px-2.5 py-1 rounded-full text-[10px] font-semibold",
                "flex items-center gap-1 shadow-sm border",
                isSpeaking
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-emerald-500 text-white border-emerald-500"
              )}
            >
              {isSpeaking ? (
                <>
                  <Volume2 className="w-3 h-3" /> Speaking
                </>
              ) : (
                <>
                  <Mic className="w-3 h-3" /> Listening
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>

      {/* Screen-reader announcement of what the interviewer is doing */}
      <span className="sr-only" role="status" aria-live="polite">
        {isSpeaking
          ? "The interviewer is asking a question."
          : isListening
          ? "Recording your answer."
          : isThinking
          ? "Evaluating your answer."
          : "Interviewer is waiting."}
      </span>
    </div>
  );
};

export default AiAvatar;
