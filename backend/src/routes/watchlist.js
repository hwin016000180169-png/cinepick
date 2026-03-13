const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { authenticate } = require('../middleware/auth');

/**
 * GET /api/watchlist
 * 내 찜 목록 조회
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('watchlist')
      .select('*, movies(*)')
      .eq('user_id', req.user.id)
      .order('added_at', { ascending: false });

    if (error) throw error;
    res.json({ watchlist: data });
  } catch (error) {
    res.status(500).json({ error: '찜 목록을 불러오는데 실패했습니다.' });
  }
});

/**
 * POST /api/watchlist
 * 찜 목록에 추가
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { movie_id } = req.body;
    if (!movie_id) return res.status(400).json({ error: 'movie_id가 필요합니다.' });

    const { data, error } = await supabase
      .from('watchlist')
      .insert({ user_id: req.user.id, movie_id })
      .select('*, movies(*)')
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: '이미 찜 목록에 있는 영화입니다.' });
      }
      throw error;
    }

    res.status(201).json({ item: data, message: '찜 목록에 추가되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '찜 목록 추가에 실패했습니다.' });
  }
});

/**
 * DELETE /api/watchlist/:movie_id
 * 찜 목록에서 제거
 */
router.delete('/:movie_id', authenticate, async (req, res) => {
  try {
    const { movie_id } = req.params;

    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', req.user.id)
      .eq('movie_id', movie_id);

    if (error) throw error;
    res.json({ success: true, message: '찜 목록에서 제거되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '찜 목록 제거에 실패했습니다.' });
  }
});

/**
 * PATCH /api/watchlist/:movie_id/watched
 * 시청 완료 표시
 */
router.patch('/:movie_id/watched', authenticate, async (req, res) => {
  try {
    const { movie_id } = req.params;
    const { watched, user_rating } = req.body;

    const { data, error } = await supabase
      .from('watchlist')
      .update({
        watched,
        watched_at: watched ? new Date().toISOString() : null,
        user_rating: user_rating || null
      })
      .eq('user_id', req.user.id)
      .eq('movie_id', movie_id)
      .select()
      .single();

    if (error) throw error;
    res.json({ item: data });
  } catch (error) {
    res.status(500).json({ error: '시청 완료 처리에 실패했습니다.' });
  }
});

module.exports = router;
