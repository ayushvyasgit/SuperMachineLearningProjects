import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface Petal {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  delay: number;
  duration: number;
  opacity: number;
}

const AnimatedBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [petals, setPetals] = useState<Petal[]>([]);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 50, stiffness: 100 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Generate petals
    const newPetals: Petal[] = [];
    for (let i = 0; i < 20; i++) {
      newPetals.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 40 + Math.random() * 80,
        rotation: Math.random() * 360,
        delay: Math.random() * 5,
        duration: 15 + Math.random() * 10,
        opacity: 0.1 + Math.random() * 0.2,
      });
    }
    setPetals(newPetals);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 30;
        mouseX.set(x);
        mouseY.set(y);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{
        background: "linear-gradient(180deg, hsl(350 100% 98%) 0%, hsl(0 0% 100%) 30%, hsl(350 100% 97%) 70%, hsl(350 100% 95%) 100%)",
      }}
    >
      {/* Soft radial gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 30% 20%, hsl(350 100% 92% / 0.4) 0%, transparent 50%)",
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 70% 80%, hsl(350 100% 90% / 0.3) 0%, transparent 50%)",
        }}
      />

      {/* Floating petals */}
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute"
          style={{
            left: `${petal.x}%`,
            top: `${petal.y}%`,
            width: petal.size,
            height: petal.size,
            x: smoothMouseX,
            y: smoothMouseY,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, -10, 0],
            rotate: [petal.rotation, petal.rotation + 20, petal.rotation],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            style={{ opacity: petal.opacity }}
          >
            <defs>
              <linearGradient id={`petalGrad${petal.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(350 100% 92%)" />
                <stop offset="100%" stopColor="hsl(350 100% 85%)" />
              </linearGradient>
            </defs>
            <ellipse
              cx="50"
              cy="50"
              rx="45"
              ry="25"
              fill={`url(#petalGrad${petal.id})`}
              transform="rotate(45 50 50)"
            />
          </svg>
        </motion.div>
      ))}

      {/* Wave layers */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-64"
        style={{
          x: smoothMouseX,
        }}
      >
        <svg
          viewBox="0 0 1440 320"
          className="absolute bottom-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(350 100% 92% / 0.3)" />
              <stop offset="100%" stopColor="hsl(350 100% 95% / 0.1)" />
            </linearGradient>
          </defs>
          <motion.path
            fill="url(#waveGrad1)"
            animate={{
              d: [
                "M0,160L48,170.7C96,181,192,203,288,192C384,181,480,139,576,128C672,117,768,139,864,165.3C960,192,1056,224,1152,218.7C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                "M0,192L48,181.3C96,171,192,149,288,160C384,171,480,213,576,224C672,235,768,213,864,186.7C960,160,1056,128,1152,133.3C1248,139,1344,181,1392,202.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        </svg>
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-48"
        style={{
          x: smoothMouseX,
        }}
      >
        <svg
          viewBox="0 0 1440 320"
          className="absolute bottom-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(350 100% 88% / 0.4)" />
              <stop offset="100%" stopColor="hsl(350 100% 92% / 0.2)" />
            </linearGradient>
          </defs>
          <motion.path
            fill="url(#waveGrad2)"
            animate={{
              d: [
                "M0,256L48,240C96,224,192,192,288,181.3C384,171,480,181,576,186.7C672,192,768,192,864,181.3C960,171,1056,149,1152,154.7C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                "M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,229.3C672,235,768,213,864,202.7C960,192,1056,192,1152,186.7C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              ],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
        </svg>
      </motion.div>
    </div>
  );
};

export default AnimatedBackground;
