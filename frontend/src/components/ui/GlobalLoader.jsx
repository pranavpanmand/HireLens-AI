import { motion } from "framer-motion";

export function GlobalLoader({ message = "AI is analyzing...", fullScreen = false }) {
  const containerClasses = fullScreen 
    ? "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-md"
    : "flex flex-col items-center justify-center p-8 w-full h-full min-h-[300px]";

  return (
    <div className={containerClasses}>
      <div className="relative flex items-center justify-center w-32 h-32 mb-8">
        {/* Core Glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
            boxShadow: [
              "0 0 20px rgba(43,157,128,0.3)",
              "0 0 60px rgba(43,157,128,0.8)",
              "0 0 20px rgba(43,157,128,0.3)",
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-12 h-12 bg-secondary rounded-full blur-[10px]"
        />
        
        {/* Inner Solid Core */}
        <div className="absolute w-10 h-10 bg-secondary rounded-full border-2 border-white/50 z-10 shadow-[0_0_15px_rgba(43,157,128,0.8)]" />

        {/* Outer Ring 1 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute w-20 h-20 border-2 border-dashed border-secondary/40 rounded-full"
        />

        {/* Outer Ring 2 */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute w-28 h-28 border border-primary/30 rounded-full flex items-center justify-center"
        >
          {/* Node */}
          <div className="absolute top-0 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),1)]" />
          <div className="absolute bottom-0 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),1)]" />
        </motion.div>

        {/* Outer Ring 3 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-36 h-36 border border-accent-gold/20 rounded-full"
        >
          <div className="absolute bottom-1/4 left-0 w-1.5 h-1.5 bg-accent-gold rounded-full shadow-[0_0_8px_rgba(var(--accent-gold),1)]" />
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <h3 className="font-display font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent-gold animate-gradient-x mb-3">
          JobMatch AI
        </h3>
        <motion.div className="flex items-center justify-center gap-1">
          <p className="text-secondary font-medium tracking-widest uppercase text-xs">{message}</p>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-secondary"
          >
            _
          </motion.span>
        </motion.div>
      </motion.div>
    </div>
  );
}
