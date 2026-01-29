import { motion } from "framer-motion";

const LoadingSpinner = () => {
  const petals = Array.from({ length: 8 });

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-16 h-16">
        {petals.map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            style={{
              transform: `rotate(${i * 45}deg)`,
            }}
          >
            <motion.div
              className="w-3 h-3 rounded-full bg-primary mx-auto"
              animate={{
                scale: [0.8, 1, 0.8],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner;
