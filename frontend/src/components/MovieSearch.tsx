import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Movie } from "@/api/recommendations";

interface MovieSearchProps {
  onSelect: (title: string) => void;
  selectedMovie: string;
  movies?: Movie[];
}

const MovieSearch = ({ onSelect, selectedMovie, movies = [] }: MovieSearchProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filteredMovies = query
    ? movies
        .filter((movie) =>
          movie.title.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8)
    : movies.slice(0, 8);

  useEffect(() => {
    if (selectedMovie) {
      setQuery(selectedMovie);
    }
  }, [selectedMovie]);

  const handleSelect = (title: string) => {
    setQuery(title);
    setIsOpen(false);
    onSelect(title);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredMovies.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && filteredMovies[highlightedIndex]) {
      handleSelect(filteredMovies[highlightedIndex].title);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Pick your favorite film..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          className="w-full pl-12 pr-4 py-4 h-14 text-base bg-card/80 backdrop-blur-xl border-2 border-primary/20 rounded-2xl shadow-soft focus:border-primary focus:shadow-glow focus:ring-2 focus:ring-primary/20 transition-all duration-300 placeholder:text-muted-foreground"
        />
      </div>

      <AnimatePresence>
        {isOpen && filteredMovies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-card/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-hover overflow-hidden"
          >
            <ul ref={listRef} className="py-2 max-h-80 overflow-y-auto">
              {filteredMovies.map((movie, index) => (
                <motion.li
                  key={movie.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(movie.title)}
                    className={`w-full px-4 py-3 text-left transition-all duration-200 flex items-center gap-3 ${
                      highlightedIndex === index
                        ? "bg-primary/20 text-foreground"
                        : "hover:bg-primary/10"
                    }`}
                  >
                    <div className="w-10 h-14 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-xs font-medium text-primary-foreground">
                      🎬
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{movie.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {movie.genres?.length > 0 ? movie.genres.join(" • ") : "Movie"}
                      </p>
                    </div>
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MovieSearch;

