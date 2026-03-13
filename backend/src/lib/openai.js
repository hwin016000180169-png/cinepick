const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

/**
 * Generate movie recommendations based on user preferences
 */
async function getAIRecommendations({ mood, duration, genre, watchHistory = [], availableMovies = [] }) {
  if (!genAI) {
    throw new Error('AI 기능을 사용하려면 GEMINI_API_KEY가 필요합니다.');
  }

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

반드시 다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('AI 추천 생성 중 오류가 발생했습니다.');
  }
}

/**
 * Generate a movie summary/review using AI
 */
async function generateMovieSummary(movie) {
  if (!genAI) {
    throw new Error('AI 기능을 사용하려면 GEMINI_API_KEY가 필요합니다.');
  }

  const prompt = `
영화 "${movie.title}" (${movie.release_year})에 대해 한국어로 간단하고 흥미로운 소개글을 작성해주세요.
- 2-3문장으로 간결하게
- 스포일러 없이
- 시청 욕구를 자극하는 톤으로
`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('AI 요약 생성 중 오류가 발생했습니다.');
  }
}

module.exports = { getAIRecommendations, generateMovieSummary };
