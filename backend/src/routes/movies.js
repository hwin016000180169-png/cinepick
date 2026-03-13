const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { optionalAuth } = require('../middleware/auth');

/**
 * GET /api/movies
 * 영화 목록 조회 (필터링, 페이지네이션)
 */
router.get('/', async (req, res) => {
  try {
    const {
      genre,
      mood,
      max_duration,
      trending,
      is_new,
      search,
      page = 1,
      limit = 20,
      sort = 'trending_score'
    } = req.query;

    let query = supabase.from('movies').select('*');

    // Filters
    if (genre) query = query.contains('genre', [genre]);
    if (mood) query = query.contains('mood', [mood]);
    if (max_duration) query = query.lte('duration', parseInt(max_duration));
    if (trending === 'true') query = query.order('trending_score', { ascending: false });
    if (is_new === 'true') query = query.eq('is_new', true);
    if (search) query = query.ilike('title', `%${search}%`);

    // Sorting
    if (sort === 'rating') query = query.order('rating', { ascending: false });
    else if (sort === 'release_year') query = query.order('release_year', { ascending: false });
    else if (sort === 'trending_score') query = query.order('trending_score', { ascending: false });

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: movies, error, count } = await query;

    if (error) throw error;

    res.json({
      movies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count
      }
    });
  } catch (error) {
    console.error('Movies fetch error:', error);
    res.status(500).json({ error: '영화 목록을 불러오는데 실패했습니다.' });
  }
});

/**
 * GET /api/movies/trending
 * 트렌딩 영화 목록
 */
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('trending_score', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;
    res.json({ movies: data });
  } catch (error) {
    res.status(500).json({ error: '트렌딩 영화를 불러오는데 실패했습니다.' });
  }
});

/**
 * GET /api/movies/new-releases
 * 신작 영화 목록
 */
router.get('/new-releases', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('is_new', true)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;
    res.json({ movies: data });
  } catch (error) {
    res.status(500).json({ error: '신작 영화를 불러오는데 실패했습니다.' });
  }
});

/**
 * GET /api/movies/quick-pick
 * 퀵픽 추천 (기분/시간/장르 기반)
 */
router.get('/quick-pick', async (req, res) => {
  try {
    const { mood, max_duration = 180, genre } = req.query;

    if (!mood) {
      return res.status(400).json({ error: '기분(mood) 파라미터가 필요합니다.' });
    }

    let query = supabase.from('movies').select('*');

    if (mood) query = query.contains('mood', [mood]);
    if (max_duration) query = query.lte('duration', parseInt(max_duration));
    if (genre && genre !== 'all') query = query.contains('genre', [genre]);

    query = query.order('rating', { ascending: false }).limit(6);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ movies: data, count: data.length });
  } catch (error) {
    res.status(500).json({ error: '퀵픽 추천을 불러오는데 실패했습니다.' });
  }
});

/**
 * GET /api/movies/genres
 * 사용 가능한 장르 목록
 */
router.get('/genres', async (req, res) => {
  try {
    const { data, error } = await supabase.from('movies').select('genre');
    if (error) throw error;

    const allGenres = new Set();
    data.forEach(movie => movie.genre.forEach(g => allGenres.add(g)));

    res.json({ genres: Array.from(allGenres).sort() });
  } catch (error) {
    res.status(500).json({ error: '장르 목록을 불러오는데 실패했습니다.' });
  }
});

/**
 * GET /api/movies/:id
 * 영화 상세 정보
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: movie, error } = await supabase
      .from('movies')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !movie) {
      return res.status(404).json({ error: '영화를 찾을 수 없습니다.' });
    }

    // Get reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*, users(username, avatar_url)')
      .eq('movie_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Check if in user's watchlist
    let inWatchlist = false;
    if (req.user) {
      const { data: wl } = await supabase
        .from('watchlist')
        .select('id')
        .eq('user_id', req.user.id)
        .eq('movie_id', id)
        .single();
      inWatchlist = !!wl;
    }

    res.json({ movie, reviews: reviews || [], inWatchlist });
  } catch (error) {
    res.status(500).json({ error: '영화 정보를 불러오는데 실패했습니다.' });
  }
});

/**
 * GET /api/movies/:id/similar
 * 유사한 영화 추천
 */
router.get('/:id/similar', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: movie } = await supabase
      .from('movies')
      .select('genre, mood')
      .eq('id', id)
      .single();

    if (!movie) return res.status(404).json({ error: '영화를 찾을 수 없습니다.' });

    const { data: similar } = await supabase
      .from('movies')
      .select('*')
      .neq('id', id)
      .overlaps('genre', movie.genre)
      .order('rating', { ascending: false })
      .limit(6);

    res.json({ movies: similar || [] });
  } catch (error) {
    res.status(500).json({ error: '유사 영화를 불러오는데 실패했습니다.' });
  }
});

module.exports = router;
