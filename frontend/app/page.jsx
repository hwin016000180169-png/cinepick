'use client';

import { useState, useEffect } from 'react';
import { Flame, Sparkles, Clock, Zap, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import HeroBanner from '../components/HeroBanner';
import MovieRow from '../components/MovieRow';
import api from '../lib/api';
import { useAuthStore } from '../lib/store';

export default function HomePage() {
  const [trending, setTrending] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [aiPicks, setAiPicks] = useState([]);
  const [aiMessage, setAiMessage] = useState('');
  const [genreMovies, setGenreMovies] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  const featuredGenres = ['액션', '로맨스', '스릴러', '코미디'];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trendingData, newData] = await Promise.all([
          api.getTrending(12),
          api.getNewReleases(10)
        ]);

        setTrending(trendingData.movies || []);
        setNewReleases(newData.movies || []);

        // Load genre movies in parallel
        const genreResults = await Promise.all(
          featuredGenres.map((genre) => api.getMoviesByGenre(genre, 8))
        );
        const genreMap = {};
        featuredGenres.forEach((g, i) => {
          genreMap[g] = genreResults[i]?.movies || [];
        });
        setGenreMovies(genreMap);

        // AI picks if logged in
        if (isAuthenticated()) {
          try {
            const aiData = await api.getPersonalizedRecommendations();
            setAiPicks(aiData.movies || []);
            setAiMessage(aiData.message || '');
          } catch {}
        }
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen">
        {/* Skeleton Hero */}
        <div className="w-full h-[85vh] skeleton" />
        <div className="mt-10 space-y-10 px-8">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="w-40 h-7 skeleton rounded mb-4" />
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <div key={j} className="w-44 h-64 skeleton rounded-lg flex-shrink-0" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="pt-0">
        <HeroBanner movies={trending.slice(0, 5)} />
      </div>

      {/* Quick Pick CTA */}
      <div className="px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 mb-12">
        <Link href="/quick-pick">
          <div className="bg-gradient-to-r from-brand-red/20 to-brand-red/5 border border-brand-red/30 rounded-2xl p-6 hover:border-brand-red/60 transition-all duration-300 group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-5 h-5 text-brand-red" />
                  <span className="text-brand-red font-semibold text-sm tracking-wide uppercase">AI 퀵픽</span>
                </div>
                <h3 className="text-white text-xl font-bold mb-1">오늘 뭐 볼지 모르겠다면?</h3>
                <p className="text-white/50 text-sm">3가지 질문으로 딱 맞는 영화를 찾아드려요</p>
              </div>
              <div className="flex items-center gap-2 text-brand-red group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-medium hidden sm:block">시작하기</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* AI Personalized (logged in) */}
      {isAuthenticated() && aiPicks.length > 0 && (
        <div className="mb-2">
          {aiMessage && (
            <div className="px-4 sm:px-6 lg:px-8 mb-3">
              <div className="flex items-start gap-2 bg-brand-red/10 rounded-xl p-3 border border-brand-red/20">
                <Sparkles className="w-4 h-4 text-brand-red mt-0.5 flex-shrink-0" />
                <p className="text-sm text-white/70">{aiMessage}</p>
              </div>
            </div>
          )}
          <MovieRow
            title="AI 맞춤 추천"
            movies={aiPicks}
            showAiReason
            icon={<Sparkles className="w-5 h-5" />}
          />
        </div>
      )}

      {/* Trending */}
      <MovieRow
        title="지금 인기"
        movies={trending}
        icon={<Flame className="w-5 h-5" />}
      />

      {/* New Releases */}
      <MovieRow
        title="신작 & 화제작"
        movies={newReleases}
        icon={<Clock className="w-5 h-5" />}
      />

      {/* Genre Sections */}
      {featuredGenres.map((genre) =>
        genreMovies[genre]?.length > 0 ? (
          <MovieRow key={genre} title={`${genre} 영화`} movies={genreMovies[genre]} />
        ) : null
      )}

      {/* Footer Padding */}
      <div className="h-20" />
    </div>
  );
}
