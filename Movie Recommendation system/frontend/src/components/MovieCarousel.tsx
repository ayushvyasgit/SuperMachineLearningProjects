import { useState, useCallback, useEffect } from "react";
import { motion, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Movie, getRandomMovies } from "@/data/movies";
import MovieCard from "./MovieCard";
import { Button } from "@/components/ui/button";

interface MovieCarouselProps {
  recommendations: Movie[];
}

const MovieCarousel = ({ recommendations }: MovieCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [movies, setMovies] = useState<Movie[]>(recommendations);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setMovies(recommendations);
    setCurrentIndex(0);
  }, [recommendations]);

  // Extend with random movies for infinite scroll feeling
  useEffect(() => {
    if (movies.length < 10 && movies.length > 0) {
      const existingIds = movies.map((m) => m.id);
      const extraMovies = getRandomMovies(10 - movies.length, existingIds);
      setMovies((prev) => [...prev, ...extraMovies]);
    }
  }, [movies]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? movies.length - 1 : prev - 1));
  }, [movies.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === movies.length - 1 ? 0 : prev + 1));
  }, [movies.length]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 50;
    if (info.offset.x > threshold) {
      handlePrev();
    } else if (info.offset.x < -threshold) {
      handleNext();
    }
  };

  const getVisibleCards = () => {
    const cards = [];
    for (let i = -2; i <= 2; i++) {
      let index = currentIndex + i;
      // Wrap around for infinite loop
      if (index < 0) index = movies.length + index;
      if (index >= movies.length) index = index - movies.length;
      
      if (movies[index]) {
        cards.push({
          movie: movies[index],
          position: i,
        });
      }
    }
    return cards;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext]);

  if (movies.length === 0) return null;

  return (
    <div className="relative w-full h-[400px] md:h-[450px]">
      {/* Carousel Container */}
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        style={{ perspective: "1200px" }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
      >
        {getVisibleCards().map(({ movie, position }) => (
          <MovieCard
            key={`${movie.id}-${position}`}
            movie={movie}
            position={position}
            isActive={position === 0}
          />
        ))}
      </motion.div>

      {/* Navigation Buttons */}
      <div className="absolute left-2 right-2 md:left-4 md:right-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
        <Button
          onClick={handlePrev}
          variant="ghost"
          size="icon"
          className="pointer-events-auto w-10 h-10 md:w-12 md:h-12 rounded-full bg-card/80 backdrop-blur-xl border border-primary/20 shadow-soft hover:bg-card hover:shadow-glow hover:scale-110 transition-all duration-300"
          aria-label="Previous movie"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
        </Button>
        <Button
          onClick={handleNext}
          variant="ghost"
          size="icon"
          className="pointer-events-auto w-10 h-10 md:w-12 md:h-12 rounded-full bg-card/80 backdrop-blur-xl border border-primary/20 shadow-soft hover:bg-card hover:shadow-glow hover:scale-110 transition-all duration-300"
          aria-label="Next movie"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
        </Button>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {movies.slice(0, Math.min(movies.length, 10)).map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300 ${
              index === currentIndex % 10
                ? "bg-primary w-4 md:w-6"
                : "bg-primary/30 hover:bg-primary/50"
            }`}
            whileHover={{ scale: 1.2 }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default MovieCarousel;
