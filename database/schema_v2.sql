-- ============================================
-- CinePick Database Schema (수정본 v2)
-- cast → cast_members 로 변경 (예약어 충돌 해결)
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- MOVIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS movies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  original_title VARCHAR(255),
  poster VARCHAR(500),
  backdrop VARCHAR(500),
  trailer_url VARCHAR(500),
  genre TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  mood TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  duration INTEGER NOT NULL,
  rating DECIMAL(3, 1) DEFAULT 0.0,
  description TEXT,
  director VARCHAR(255),
  cast_members TEXT[] DEFAULT ARRAY[]::TEXT[],
  release_year INTEGER,
  language VARCHAR(50) DEFAULT 'en',
  country VARCHAR(100),
  age_rating VARCHAR(20),
  ott_platform TEXT[] DEFAULT ARRAY[]::TEXT[],
  trending_score INTEGER DEFAULT 0,
  is_new BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100),
  avatar_url VARCHAR(500),
  preferences JSONB DEFAULT '{"genres": [], "moods": [], "languages": [], "max_duration": 180}'::jsonb,
  watch_history UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- WATCHLIST TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  watched BOOLEAN DEFAULT FALSE,
  watched_at TIMESTAMP WITH TIME ZONE,
  user_rating DECIMAL(3, 1),
  notes TEXT,
  UNIQUE(user_id, movie_id)
);

-- ============================================
-- AI RECOMMENDATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  prompt_data JSONB NOT NULL,
  recommended_movie_ids UUID[] DEFAULT ARRAY[]::UUID[],
  ai_reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  rating DECIMAL(3, 1) NOT NULL CHECK (rating >= 0 AND rating <= 10),
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_movies_genre ON movies USING GIN(genre);
CREATE INDEX IF NOT EXISTS idx_movies_mood ON movies USING GIN(mood);
CREATE INDEX IF NOT EXISTS idx_movies_trending ON movies(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_movies_new ON movies(is_new, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_movie ON watchlist(movie_id);
CREATE INDEX IF NOT EXISTS idx_reviews_movie ON reviews(movie_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own watchlist" ON watchlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own watchlist" ON watchlist
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Movies are publicly readable" ON movies
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Reviews are publicly readable" ON reviews
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Users can manage own reviews" ON reviews
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_movies_updated_at
  BEFORE UPDATE ON movies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION get_quick_pick_movies(
  p_mood TEXT,
  p_max_duration INTEGER,
  p_genre TEXT
)
RETURNS SETOF movies AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM movies
  WHERE
    (p_mood = ANY(mood) OR p_mood IS NULL)
    AND duration <= p_max_duration
    AND (p_genre = ANY(genre) OR p_genre IS NULL OR p_genre = 'all')
  ORDER BY rating DESC, trending_score DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;
