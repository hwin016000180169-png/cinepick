// routes/users.js
const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { authenticate } = require('../middleware/auth');

/**
 * GET /api/users/me
 * 내 프로필 조회
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // User not in DB yet, create it
      const { data: newUser } = await supabase
        .from('users')
        .insert({ id: req.user.id, email: req.user.email })
        .select()
        .single();
      return res.json({ user: newUser });
    }

    if (error) throw error;
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: '사용자 정보를 불러오는데 실패했습니다.' });
  }
});

/**
 * PUT /api/users/me/preferences
 * 사용자 선호도 업데이트
 */
router.put('/me/preferences', authenticate, async (req, res) => {
  try {
    const { genres, moods, languages, max_duration } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({
        preferences: { genres, moods, languages, max_duration }
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ user: data });
  } catch (error) {
    res.status(500).json({ error: '선호도 업데이트에 실패했습니다.' });
  }
});

/**
 * POST /api/users/me/watch-history
 * 시청 기록 추가
 */
router.post('/me/watch-history', authenticate, async (req, res) => {
  try {
    const { movie_id } = req.body;

    const { data: user } = await supabase
      .from('users')
      .select('watch_history')
      .eq('id', req.user.id)
      .single();

    const history = user?.watch_history || [];
    if (!history.includes(movie_id)) {
      history.unshift(movie_id); // Add to front
      if (history.length > 50) history.pop(); // Keep max 50
    }

    const { data, error } = await supabase
      .from('users')
      .update({ watch_history: history })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, watch_history: data.watch_history });
  } catch (error) {
    res.status(500).json({ error: '시청 기록 추가에 실패했습니다.' });
  }
});

module.exports = router;
