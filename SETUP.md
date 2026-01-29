# Movie Recommender System - Setup Guide

## Overview
This project integrates a FastAPI backend with a React/TypeScript frontend to provide AI-powered movie recommendations using content-based filtering.

## Prerequisites
- Python 3.8+
- Node.js 16+ with npm or bun
- The `movies.pkl` file in the root directory

## Backend Setup (FastAPI)

### 1. Install Python Dependencies
```bash
cd "c:\Users\ayush\Desktop\Movie Recommendation system"
pip install -r requirements.txt
```

Required packages:
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `scikit-learn` - ML library for similarity calculations
- `requests` - For TMDB API calls
- `pydantic` - Data validation

### 2. Start the Backend Server
```bash
python backend.py
```

The API will be available at `http://localhost:8000`

**API Endpoints:**
- `GET /` - Welcome message
- `GET /api/movies` - Get all available movies
- `POST /api/recommend` - Get recommendations for a selected movie
- `GET /api/health` - Health check

### 3. Test the API
```bash
# Get all movies
curl http://localhost:8000/api/movies

# Get recommendations
curl -X POST http://localhost:8000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"movie_title": "Avatar", "num_recommendations": 5}'
```

## Frontend Setup (React + TypeScript)

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
Using Bun (recommended):
```bash
bun install
```

Or using npm:
```bash
npm install
```

### 3. Start Development Server
Using Bun:
```bash
bun run dev
```

Or using npm:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Running Both Together

### Terminal 1 - Backend
```bash
cd "c:\Users\ayush\Desktop\Movie Recommendation system"
python backend.py
```

### Terminal 2 - Frontend
```bash
cd "c:\Users\ayush\Desktop\Movie Recommendation system\frontend"
bun run dev
```

## Project Structure

```
Movie Recommendation system/
├── backend.py              # FastAPI backend
├── requirements.txt        # Python dependencies
├── movies.pkl             # ML model data
├── tmdb_5000_movies.csv   # Movie data
├── tmdb_5000_credits.csv  # Credits data
├── app.py                 # Old Streamlit app (reference)
├── movie-recommender-system.ipynb  # Jupyter notebook
└── frontend/              # React frontend
    ├── src/
    │   ├── api/
    │   │   └── recommendations.ts  # API client
    │   ├── components/
    │   │   ├── MovieSearch.tsx
    │   │   ├── MovieCarousel.tsx
    │   │   └── ...other components
    │   ├── pages/
    │   │   └── Index.tsx    # Main app page
    │   └── App.tsx
    └── package.json
```

## How It Works

### Backend (FastAPI)
1. Loads the `movies.pkl` file containing movie data and similarity matrices
2. Uses scikit-learn's cosine similarity to find similar movies
3. Fetches movie posters from TMDB API
4. Provides REST API endpoints for the frontend

### Frontend (React)
1. Initializes by fetching available movies from the backend
2. User selects a movie and clicks "Recommend"
3. Frontend sends POST request to `/api/recommend`
4. Backend calculates similarity and returns 5 recommendations
5. Displays recommendations with posters and details

## Configuration

### TMDB API Key
The TMDB API key is hardcoded in `backend.py`. To use your own:
1. Get an API key from [TMDB](https://www.themoviedb.org/settings/api)
2. Update the `API_KEY` variable in `backend.py`

### CORS Settings
CORS is configured to allow requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative port)

To change, modify the `allow_origins` list in `backend.py`

## Troubleshooting

### "movies.pkl not found"
- Ensure `movies.pkl` is in the root directory
- Check file path and permissions

### "Backend API is not running"
- Start the backend with `python backend.py`
- Check if port 8000 is already in use

### CORS Errors
- Ensure both frontend and backend are running
- Check that frontend is running on localhost:5173
- Verify CORS configuration in backend.py

### Slow API Responses
- First request generates similarity matrix (takes ~10-30 seconds)
- Subsequent requests are faster
- TMDB API calls may be slow depending on network

## Development Notes

### Adding Features
- Backend endpoints: Modify `backend.py`
- Frontend components: Add/modify files in `frontend/src/components`
- API client: Update `frontend/src/api/recommendations.ts`

### Data Source
The application uses:
- TMDB 5000 Movies dataset
- Cosine similarity for recommendations
- Movie tags (overview, genres, etc.)

## Performance Tips

1. **Cache TMDB responses**: Reduce API calls
2. **Lazy load posters**: Load images on demand
3. **Pre-calculate similarity**: Already done in `movies.pkl`
4. **Add pagination**: For large movie lists

## Future Improvements

- [ ] Collaborative filtering
- [ ] User ratings and preferences
- [ ] Watchlist feature
- [ ] Advanced filtering by genre/year
- [ ] Search by actor/director
- [ ] Add authentication
- [ ] Movie details page
- [ ] User recommendations history
