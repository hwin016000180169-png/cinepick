const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { getAIRecommendations } = require('../lib/openai');
const { authenticate, optionalAuth } = require('../middleware/auth');

/**
 * POST /api/ai/recommend
 * AI 기반 영화 추천
 */
router.post('/recommend', optionalAuth, async (req, res) => {
  try {
    const { mood, duration, genre, session_id } = req.body;

    if (!mood || !duration) {
      return res.status(400).json({ error: '기분(mood)과 시청 가능 시간(duration)이 필요합니다.' });
    }

    // Get watch history if user is logged in
    let watchHistory = [];
    if (req.user) {
      const { data: userData } = await supabase
        .from('users')
        .select('watch_history')
        .eq('id', req.user.id)
        .single();
      watchHistory = userData?.watch_history || [];
    }

    // Fetch candidate movies
    let query = supabase.from('movies').select('*').lte('duration', parseInt(duration));
    if (genre && genre !== 'all') query = query.contains('genre', [genre]);
    const { data: availableMovies } = await query.limit(30);

    // Get AI recommendations
    const aiResult = await getAIRecommendations({
      mood,
      duration: parseInt(duration),
      genre,
      watchHistory,
      availableMovies: availableMovies || []
    });

    // Fetch full movie details for recommended IDs
    const recommendedIds = aiResult.recommendations.map(r => r.movie_id);
    const { data: recommendedMovies } = await supabase
      .from('movies')
      .select('*')
      .in('id', recommendedIds);

    // Merge AI reasoning with movie data
    const enrichedMovies = (recommendedMovies || []).map(movie => {
      const aiData = aiResult.recommendations.find(r => r.movie_id === movie.id);
      return { ...movie, ai_reason: aiData?.reason, match_score: aiData?.match_score };
    });

    // Cache the recommendation
    const { data: cachedRec } = await supabase.from('ai_recommendations').insert({
      user_id: req.user?.id || null,
      session_id: session_id || null,
      prompt_data: { mood, duration, genre },
      recommended_movie_ids: recommendedIds,
      ai_reasoning: aiResult.overall_message
    }).select().single();

    res.json({
      movies: enrichedMovies,
      message: aiResult.overall_message,
      recommendation_id: cachedRec?.id
    });
  } catch (error) {
    console.error('AI recommend error:', error);
    res.status(500).json({ error: 'AI 추천 생성 중 오류가 발생했습니다.' });
  }
});

/**
 * GET /api/ai/personalized
 * 사용자 맞춤형 추천 (로그인 필요)
 */
router.get('/personalized', authenticate, async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('preferences, watch_history')
      .eq('id', req.user.id)
      .single();

    const preferences = user?.preferences || {};
    const mood = preferences.moods?.[0] || '감동적인';
    const genre = preferences.genres?.[0] || 'all';
    const duration = preferences.max_duration || 150;

    let query = supabase.from('movies').select('*').lte('duration', duration);
    if (genre !== 'all') query = query.contains('genre', [genre]);
    const { data: availableMovies } = await query.limit(20);

    const aiResult = await getAIRecommendations({
      mood,
      duration,
      genre,
      watchHistory: user?.watch_history || [],
      availableMovies: availableMovies || []
    });

    const recommendedIds = aiResult.recommendations.map(r => r.movie_id);
    const { data: movies } = await supabase
      .from('movies')
      .select('*')
      .in('id', recommendedIds);

    res.json({
      movies: movies || [],
      message: aiResult.overall_message
    });
  } catch (error) {
    res.status(500).json({ error: '맞춤 추천 생성 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
