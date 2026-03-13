const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate movie recommendations based on user preferences
 * @param {Object} params
 * @param {string} params.mood - User's current mood
 * @param {number} params.duration - Available watch time in minutes
 * @param {string} params.genre - Preferred genre
 * @param {Array} params.watchHistory - Previous movies watched
 * @param {Array} params.availableMovies - Movies from database to choose from
 */
async function getAIRecommendations({ mood, duration, genre, watchHistory = [], availableMovies = [] }) {
  const movieList = availableMovies.map(m =>
    `- ID: ${m.id} | ${m.title} (${m.release_year}) | 장르: ${m.genre.join(', ')} | 분위기: ${m.mood.join(', ')} | 상영시간: ${m.duration}분 | 평점: ${m.rating}`
  ).join('\n');

  const watchedTitles = watchHistory.length > 0
    ? `시청 기록: ${watchHistory.join(', ')}`
    : '시청 기록 없음';

  const prompt = `
당신은 영화 추천 전문가입니다. 사용자의 상황에 맞는 최적의 영화를 추천해주세요.

## 사용자 정보
- 현재 기분: ${mood}
- 가용 시청 시간: ${duration}분 이하
- 선호 장르: ${genre}
- ${watchedTitles}

## 사용 가능한 영화 목록
${movieList}

## 지시사항
위 영화 목록에서 사용자의 기분, 가용 시간, 선호 장르를 고려하여 최적의 영화 3-5개를 추천하세요.

반드시 다음 JSON 형식으로만 응답하세요:
{
  "recommendations": [
    {
      "movie_id": "영화 UUID",
      "reason": "이 영화를 추천하는 이유 (30자 이내, 한국어)",
      "match_score": 85
    }
  ],
  "overall_message": "전체 추천 메시지 (50자 이내, 한국어)"
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('AI 추천 생성 중 오류가 발생했습니다.');
  }
}

/**
 * Generate a movie summary/review using AI
 */
async function generateMovieSummary(movie) {
  const prompt = `
영화 "${movie.title}" (${movie.release_year})에 대해 한국어로 간단하고 흥미로운 소개글을 작성해주세요.
- 2-3문장으로 간결하게
- 스포일러 없이
- 시청 욕구를 자극하는 톤으로
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    max_tokens: 200
  });

  return response.choices[0].message.content;
}

module.exports = { getAIRecommendations, generateMovieSummary };
