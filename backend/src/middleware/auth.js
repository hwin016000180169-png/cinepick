const { supabase } = require('../lib/supabase');

/**
 * Verify JWT token from Supabase Auth
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({ error: '인증 처리 중 오류가 발생했습니다.' });
  }
}

/**
 * Optional authentication - doesn't fail if no token
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user } } = await supabase.auth.getUser(token);
    req.user = user || null;
  } catch {
    req.user = null;
  }
  next();
}

module.exports = { authenticate, optionalAuth };
