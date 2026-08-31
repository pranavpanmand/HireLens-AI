import { motion } from "framer-motion";

export const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-background perspective-1000">
      {/* 3D Animated Grid */}
      <div className="absolute inset-0 z-0 opacity-10">
        <motion.div
          animate={{
            y: [0, 50],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transformOrigin: '50% 100%',
            transform: 'rotateX(60deg) scale(2.5)',
            top: '-50%'
          }}
        />
        {/* Fade out top of grid */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-background" />
      </div>

      {/* Ambient Drifting Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/40 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1000),
            scale: Math.random() * 2 + 0.5,
          }}
          animate={{
            x: [
              Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
              Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
              Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000)
            ],
            y: [
              Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1000),
              Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1000),
              Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1000)
            ],
          }}
          transition={{
            duration: Math.random() * 20 + 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/10 blur-[100px] mix-blend-multiply dark:mix-blend-screen"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -100, 0],
          y: [0, 100, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-secondary/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen"
      />
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.1, 0.2, 0.1],
          x: [0, 50, -50, 0],
          y: [0, 50, -50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-[40%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-accent-gold/10 blur-[100px] mix-blend-multiply dark:mix-blend-screen"
      />
    </div>
  );
};
