const API_URL = "http://localhost:8000/api";

export interface Movie {
  id: number;
  title: string;
  tags: string;
  genres: string[];
  overview: string;
  poster_path?: string;
  movie_id?: number;
}

export interface MovieRecommendation {
  title: string;
  movie_id: number;
  poster_path?: string;
  genres?: string;
  overview?: string;
}

export interface RecommendationResponse {
  recommendations: MovieRecommendation[];
  message?: string;
  error?: string;
}

// Fetch all available movies
export async function getAllMovies(): Promise<Movie[]> {
  try {
    const response = await fetch(`${API_URL}/movies`);
    if (!response.ok) throw new Error("Failed to fetch movies");
    const data = await response.json();
    return data.movies.map((m: any) => ({
      id: m.movie_id,
      movie_id: m.movie_id,
      title: m.title,
      tags: "",
      genres: [],
      overview: "",
    }));
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
}

// Get recommendations for a movie
export async function getRecommendations(
  movieTitle: string,
  count: number = 5
): Promise<MovieRecommendation[]> {
  try {
    const response = await fetch(`${API_URL}/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        movie_title: movieTitle,
        num_recommendations: count,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get recommendations");
    }

    const data: RecommendationResponse = await response.json();

    if (data.error) {
      console.error("API Error:", data.error);
      return [];
    }

    return data.recommendations || [];
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return [];
  }
}

// Check API health
export async function checkApiHealth() {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error("API health check failed:", error);
    return false;
  }
}
