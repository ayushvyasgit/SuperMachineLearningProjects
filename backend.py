from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pickle
import requests
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pydantic import BaseModel
from typing import List
import os

# Initialize FastAPI app
app = FastAPI(title="Movie Recommender API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TMDB API config
API_KEY = "6275249884fabd9aecbacf106da3b47b"

# Load movies data
try:
    movies = pickle.load(open('movies.pkl', 'rb'))
except FileNotFoundError:
    print("Error: movies.pkl not found. Make sure it's in the root directory.")
    movies = None

# Create similarity matrix
if movies is not None:
    cv = CountVectorizer(max_features=3000, stop_words='english')
    vectors = cv.fit_transform(movies['tags']).toarray()
    similarity = cosine_similarity(vectors)
else:
    similarity = None

# Models
class RecommendationRequest(BaseModel):
    movie_title: str
    num_recommendations: int = 5

class MovieRecommendation(BaseModel):
    title: str
    movie_id: int
    poster_path: str | None = None
    genres: str | None = None
    overview: str | None = None

class RecommendationResponse(BaseModel):
    recommendations: List[MovieRecommendation]
    message: str | None = None

# Helper function to fetch poster from TMDB
def fetch_poster(movie_id):
    try:
        url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={API_KEY}"
        data = requests.get(url, timeout=5).json()
        poster_path = data.get("poster_path")
        if poster_path:
            return "https://image.tmdb.org/t/p/w500" + poster_path
        return None
    except Exception as e:
        print(f"Error fetching poster for movie {movie_id}: {e}")
        return None

# Routes
@app.get("/")
async def root():
    return {
        "message": "Movie Recommender API",
        "version": "1.0.0",
        "endpoints": {
            "get_movies": "/api/movies",
            "get_recommendations": "/api/recommend"
        }
    }

@app.get("/api/movies")
async def get_movies():
    """Get all available movies"""
    if movies is None:
        return {"error": "Movies data not loaded"}
    
    movies_list = movies[['title', 'movie_id']].to_dict('records')
    return {
        "total": len(movies_list),
        "movies": movies_list
    }

@app.post("/api/recommend")
async def recommend(request: RecommendationRequest):
    """Get movie recommendations based on selected movie"""
    if movies is None or similarity is None:
        return {"error": "Movies data not loaded"}
    
    try:
        # Find the movie index
        movie_mask = movies['title'] == request.movie_title
        if not movie_mask.any():
            return {
                "error": f"Movie '{request.movie_title}' not found",
                "message": "Please select a valid movie title"
            }
        
        index = movies[movie_mask].index[0]
        distances = similarity[index]

        # Get top recommendations
        movie_list = sorted(
            list(enumerate(distances)),
            key=lambda x: x[1],
            reverse=True
        )[1:request.num_recommendations + 1]

        recommendations = []
        for i in movie_list:
            movie_data = movies.iloc[i[0]]
            poster_url = fetch_poster(movie_data.get('movie_id', 0))
            
            recommendations.append(MovieRecommendation(
                title=movie_data.get('title', 'Unknown'),
                movie_id=int(movie_data.get('movie_id', 0)),
                poster_path=poster_url,
                genres=movie_data.get('genres', ''),
                overview=movie_data.get('overview', '')
            ))

        return RecommendationResponse(
            recommendations=recommendations,
            message=f"Found {len(recommendations)} recommendations for '{request.movie_title}'"
        )
    
    except Exception as e:
        return {
            "error": str(e),
            "message": "Error processing recommendation request"
        }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "movies_loaded": movies is not None,
        "similarity_matrix_ready": similarity is not None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
