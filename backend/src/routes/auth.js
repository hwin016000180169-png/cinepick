const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

/**
 * POST /api/auth/signup
 * 회원가입
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호가 필요합니다.' });
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return res.status(409).json({ error: '이미 가입된 이메일입니다.' });
      }
      throw authError;
    }

    // Create user profile
    await supabase.from('users').insert({
      id: authData.user.id,
      email,
      username: username || email.split('@')[0]
    });

    res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      user: { id: authData.user.id, email }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: '회원가입 처리 중 오류가 발생했습니다.' });
  }
});

/**
 * POST /api/auth/login
 * 로그인
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호가 필요합니다.' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: { id: data.user.id, email: data.user.email }
    });
  } catch (error) {
    res.status(500).json({ error: '로그인 처리 중 오류가 발생했습니다.' });
  }
});

/**
 * POST /api/auth/logout
 * 로그아웃
 */
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) await supabase.auth.admin.signOut(token);
    res.json({ message: '로그아웃되었습니다.' });
  } catch (error) {
    res.json({ message: '로그아웃되었습니다.' });
  }
});

/**
 * POST /api/auth/refresh
 * 토큰 갱신
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    const { data, error } = await supabase.auth.refreshSession({ refresh_token });
    if (error) return res.status(401).json({ error: '토큰 갱신에 실패했습니다.' });

    res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token
    });
  } catch (error) {
    res.status(500).json({ error: '토큰 갱신 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
