const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  constructor() {
    this.baseURL = API_URL;
  }

  getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('cinepick_token');
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Movies
  getMovies(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/movies?${query}`);
  }

  getTrending(limit = 10) {
    return this.request(`/api/movies/trending?limit=${limit}`);
  }

  getNewReleases(limit = 10) {
    return this.request(`/api/movies/new-releases?limit=${limit}`);
  }

  getMovieById(id) {
    return this.request(`/api/movies/${id}`);
  }

  getSimilarMovies(id) {
    return this.request(`/api/movies/${id}/similar`);
  }

  getQuickPick(params) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/movies/quick-pick?${query}`);
  }

  getGenres() {
    return this.request('/api/movies/genres');
  }

  getMoviesByGenre(genre, limit = 10) {
    return this.request(`/api/movies?genre=${encodeURIComponent(genre)}&limit=${limit}`);
  }

  // AI
  getAIRecommendations(data) {
    return this.request('/api/ai/recommend', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  getPersonalizedRecommendations() {
    return this.request('/api/ai/personalized');
  }

  // Watchlist
  getWatchlist() {
    return this.request('/api/watchlist');
  }

  addToWatchlist(movieId) {
    return this.request('/api/watchlist', {
      method: 'POST',
      body: JSON.stringify({ movie_id: movieId })
    });
  }

  removeFromWatchlist(movieId) {
    return this.request(`/api/watchlist/${movieId}`, { method: 'DELETE' });
  }

  markAsWatched(movieId, rating) {
    return this.request(`/api/watchlist/${movieId}/watched`, {
      method: 'PATCH',
      body: JSON.stringify({ watched: true, user_rating: rating })
    });
  }

  // Auth
  login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  signup(email, password, username) {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, username })
    });
  }

  logout() {
    return this.request('/api/auth/logout', { method: 'POST' });
  }

  // User
  getMe() {
    return this.request('/api/users/me');
  }

  updatePreferences(preferences) {
    return this.request('/api/users/me/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences)
    });
  }
}

const api = new ApiClient();
export default api;
