import { useRef, useState } from "react";
import { motion } from "framer-motion";

export const TiltCard = ({ children, className = "" }) => {
  const ref = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const rotateY = ((mouseX / width) - 0.5) * 20; // Max 10 deg
    const rotateX = ((mouseY / height) - 0.5) * -20; // Max 10 deg

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: rotation.x,
        rotateY: rotation.y,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
      style={{ transformStyle: "preserve-3d" }}
      className={`perspective-1000 ${className}`}
    >
      {/* Container for the 3D translation effect on children */}
      <div 
        style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }} 
        className="w-full h-full"
      >
        {children}
      </div>
    </motion.div>
  );
};
