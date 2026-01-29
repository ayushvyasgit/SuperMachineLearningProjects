import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Movie } from "@/data/movies";

interface MovieCardProps {
  movie: Movie;
  isActive?: boolean;
  position: number; // -2, -1, 0, 1, 2 for carousel positioning
}

const TMDB_API_KEY = "8265bd1679663a7ea12ac168da84d2e8"; // Public TMDB API key for demo
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const MovieCard = ({ movie, isActive = false, position }: MovieCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  // Fetch poster on mount
  useEffect(() => {
    const fetchPoster = async () => {
      const movieId = movie.movie_id || movie.id;
      if (!movieId) {
        setImageError(true);
        return;
      }
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}`
        );
        const data = await response.json();
        if (data.poster_path) {
          setPosterUrl(`${TMDB_IMAGE_BASE}${data.poster_path}`);
        } else {
          setImageError(true);
        }
      } catch (error) {
        setImageError(true);
      }
    };
    fetchPoster();
  }, [movie.id, movie.movie_id]);

  // Calculate 3D transform based on position
  const getTransform = () => {
    const baseRotateY = position * 25;
    const baseTranslateX = position * 100;
    const baseTranslateZ = isActive ? 80 : -Math.abs(position) * 60;
    const baseScale = isActive ? 1 : 0.8 - Math.abs(position) * 0.1;

    return {
      rotateY: baseRotateY,
      translateX: baseTranslateX,
      translateZ: baseTranslateZ,
      scale: baseScale,
    };
  };

  const transform = getTransform();

  return (
    <motion.div
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
        position: "absolute",
        left: "50%",
        top: "50%",
      }}
      animate={{
        x: transform.translateX - (transform.scale * 110), // Center based on card width
        y: (transform.translateY || 0) - 50,
        rotateY: transform.rotateY,
        scale: transform.scale,
        zIndex: isActive ? 10 : 5 - Math.abs(position),
        opacity: Math.abs(position) > 2 ? 0 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      <motion.div
        className="relative w-[220px] h-[330px] md:w-[260px] md:h-[390px] rounded-2xl overflow-hidden cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          boxShadow: isActive
            ? "0 25px 80px -20px hsl(350 100% 70% / 0.4), 0 0 40px hsl(350 100% 80% / 0.3)"
            : "0 15px 40px -10px hsl(350 100% 70% / 0.25)",
        }}
        whileHover={isActive ? { scale: 1.02, y: -10 } : {}}
        transition={{ duration: 0.3 }}
      >
        {/* Poster Image */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/30">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/40 animate-pulse flex items-center justify-center">
              <span className="text-6xl">🎬</span>
            </div>
          )}
          {posterUrl && !imageError && (
            <img
              src={posterUrl}
              alt={movie.title}
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
          {imageError && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/40 flex items-center justify-center">
              <div className="text-center p-4">
                <span className="text-6xl mb-4 block">🎬</span>
                <p className="text-sm text-foreground/70">Poster unavailable</p>
              </div>
            </div>
          )}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isActive ? 1 : 0.7, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xl md:text-2xl font-bold text-card mb-1 drop-shadow-lg">
              {movie.title}
            </h3>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(Array.isArray(movie.genres) ? movie.genres : []).slice(0, 3).map((genre) => (
                <span
                  key={genre}
                  className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/80 text-accent-foreground"
                >
                  {genre}
                </span>
              ))}
            </div>
            {isActive && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-card/80 line-clamp-2"
              >
                {movie.overview}
              </motion.p>
            )}
          </motion.div>
        </div>

        {/* Sparkle effect for active card */}
        {isActive && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: [
                "radial-gradient(circle at 20% 80%, hsl(350 100% 80% / 0.15) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 20%, hsl(350 100% 80% / 0.15) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 80%, hsl(350 100% 80% / 0.15) 0%, transparent 50%)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default MovieCard;
