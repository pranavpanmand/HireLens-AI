import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export const Reveal = ({ children, width = "100%", delay = 0.15 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <div ref={ref} style={{ width, position: "relative", overflow: "visible" }}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 50, filter: "blur(8px)", scale: 0.95 },
          visible: { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 },
        }}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
};
