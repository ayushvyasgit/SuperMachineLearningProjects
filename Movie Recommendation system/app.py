import streamlit as st
import pickle
import requests
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ---------------- LOAD DATA ----------------
movies = pickle.load(open('movies.pkl', 'rb'))

# ---------------- CREATE SIMILARITY ----------------
cv = CountVectorizer(max_features=3000, stop_words='english')
vectors = cv.fit_transform(movies['tags']).toarray()
similarity = cosine_similarity(vectors)

# ---------------- TMDB CONFIG ----------------
API_KEY = "6275249884fabd9aecbacf106da3b47b"

def fetch_poster(movie_id):
    url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={API_KEY}"
    data = requests.get(url).json()
    poster_path = data.get("poster_path")
    if poster_path:
        return "https://image.tmdb.org/t/p/w500" + poster_path
    return None

# ---------------- STREAMLIT UI ----------------
st.title("🎬 Simple Movie Recommender")

selected_movie = st.selectbox(
    "Select a movie:",
    movies['title'].values
)

# ---------------- RECOMMEND FUNCTION ----------------
def recommend(movie):
    index = movies[movies['title'] == movie].index[0]
    distances = similarity[index]

    movie_list = sorted(
        list(enumerate(distances)),
        key=lambda x: x[1],
        reverse=True
    )[1:6]

    recommended_movies = []
    recommended_posters = []

    for i in movie_list:
        recommended_movies.append(movies.iloc[i[0]].title)
        recommended_posters.append(
            fetch_poster(movies.iloc[i[0]].movie_id)
        )

    return recommended_movies, recommended_posters

# ---------------- BUTTON ----------------
if st.button("Recommend"):
    names, posters = recommend(selected_movie)

    st.subheader("Top 5 Recommended Movies")
    cols = st.columns(5)

    for i in range(5):
        with cols[i]:
            st.image(posters[i])
            st.caption(names[i])
