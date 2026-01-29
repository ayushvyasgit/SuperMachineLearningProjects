import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Film, Heart, AlertCircle } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import MovieSearch from "@/components/MovieSearch";
import MovieCarousel from "@/components/MovieCarousel";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import {
  getRecommendations as getBackendRecommendations,
  getAllMovies,
  checkApiHealth,
  Movie,
  MovieRecommendation,
} from "@/api/recommendations";

const Index = () => {
  const [selectedMovie, setSelectedMovie] = useState("");
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [apiError, setApiError] = useState(false);

  // Fetch available movies on component mount
  useEffect(() => {
    const initializeApp = async () => {
      const isHealthy = await checkApiHealth();
      if (!isHealthy) {
        setApiError(true);
        console.error("Backend API is not available");
        return;
      }
      setApiError(false);
      const availableMovies = await getAllMovies();
      setMovies(availableMovies);
    };
    initializeApp();
  }, []);

  const handleRecommend = useCallback(async () => {
    if (!selectedMovie) return;

    setIsLoading(true);
    const recs = await getBackendRecommendations(selectedMovie, 5);
    setRecommendations(recs);
    setIsLoading(false);
  }, [selectedMovie]);

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* API Error Banner */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-red-500/10 border-b border-red-500/20 px-4 py-3"
          >
            <div className="max-w-6xl mx-auto flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>
                Backend API is not running. Please start the FastAPI server using:
                <code className="ml-2 bg-red-500/5 px-2 py-1 rounded">
                  python backend.py
                </code>
              </span>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full py-4 px-4 md:px-8 shrink-0"
        >
          <nav className="max-w-6xl mx-auto flex items-center justify-between">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                <Film className="w-5 h-5 text-accent-foreground" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gradient-pink">
                Lovable Movie Magic
              </h1>
            </motion.div>

            <motion.div
              className="flex items-center gap-1 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Heart className="w-4 h-4 text-primary fill-primary" />
              <span className="hidden sm:inline">Made with love</span>
            </motion.div>
          </nav>
        </motion.header>

        {/* Main Section */}
        <main className="flex-1 flex flex-col items-center px-4 overflow-hidden">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center max-w-2xl mx-auto mb-4"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-3"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary-foreground">
                AI-Powered Recommendations
              </span>
            </motion.div>

            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 leading-tight">
              Discover Your Next{" "}
              <span className="text-gradient-pink">Favorite Film</span>
            </h2>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full max-w-md mx-auto"
          >
            <MovieSearch
              onSelect={setSelectedMovie}
              selectedMovie={selectedMovie}
              movies={movies}
            />

            <motion.div
              className="mt-3 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={handleRecommend}
                disabled={!selectedMovie || isLoading}
                className="btn-haptic px-6 py-5 text-base font-semibold rounded-2xl bg-gradient-to-r from-primary to-accent text-accent-foreground shadow-glow hover:shadow-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner />
                    Finding magic...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Recommend
                  </span>
                )}
              </Button>
            </motion.div>
          </motion.div>

          {/* Results Section (FIXED) */}
          <div className="flex-1 w-full max-w-6xl mx-auto flex justify-center items-start min-h-0">
            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-3 mt-6"
                >
                  <LoadingSpinner />
                  <p className="text-muted-foreground animate-pulse text-sm">
                    Sprinkling some movie magic...
                  </p>
                </motion.div>
              )}

              {!isLoading && recommendations.length > 0 && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="w-full flex justify-center -mt-6"
                >
                  <MovieCarousel recommendations={recommendations} />
                </motion.div>
              )}

              {!isLoading && recommendations.length === 0 && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center mt-6"
                >
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                    <Film className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Search for a movie to get personalized recommendations
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
