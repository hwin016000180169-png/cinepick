'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, ChevronDown } from 'lucide-react';
import MovieCard from '../../components/MovieCard';
import api from '../../lib/api';

const ALL_GENRES = [
  { value: 'all', label: '전체', emoji: '🎬' },
  { value: '액션', label: '액션', emoji: '💥' },
  { value: '드라마', label: '드라마', emoji: '🎭' },
  { value: '코미디', label: '코미디', emoji: '😄' },
  { value: '로맨스', label: '로맨스', emoji: '💕' },
  { value: '스릴러', label: '스릴러', emoji: '😱' },
  { value: '공포', label: '공포', emoji: '👻' },
  { value: 'SF', label: 'SF', emoji: '🚀' },
  { value: '애니메이션', label: '애니메이션', emoji: '✨' },
  { value: '어드벤처', label: '어드벤처', emoji: '🗺️' },
  { value: '뮤지컬', label: '뮤지컬', emoji: '🎵' },
  { value: '미스터리', label: '미스터리', emoji: '🔍' },
  { value: '범죄', label: '범죄', emoji: '🕵️' },
  { value: '역사', label: '역사', emoji: '📜' },
  { value: '전기', label: '전기', emoji: '👤' }
];

const SORT_OPTIONS = [
  { value: 'trending_score', label: '인기순' },
  { value: 'rating', label: '평점순' },
  { value: 'release_year', label: '최신순' }
];

export default function GenrePage() {
  const searchParams = useSearchParams();
  const initialGenre = searchParams.get('g') || 'all';

  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [sortBy, setSortBy] = useState('trending_score');
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadMovies(true);
  }, [selectedGenre, sortBy]);

  const loadMovies = async (reset = false) => {
    setIsLoading(true);
    const currentPage = reset ? 1 : page;
    try {
      const params = {
        sort: sortBy,
        limit: 24,
        page: currentPage
      };
      if (selectedGenre !== 'all') params.genre = selectedGenre;

      const data = await api.getMovies(params);
      const newMovies = data.movies || [];

      if (reset) {
        setMovies(newMovies);
        setPage(2);
      } else {
        setMovies(prev => [...prev, ...newMovies]);
        setPage(p => p + 1);
      }
      setHasMore(newMovies.length === 24);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
    setPage(1);
    setHasMore(true);
  };

  const currentGenre = ALL_GENRES.find(g => g.value === selectedGenre);

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Genre Header */}
      <div
        className="relative py-12 px-4 sm:px-6 lg:px-8 mb-8"
        style={{ background: 'linear-gradient(to bottom, rgba(229,9,20,0.08), transparent)' }}
      >
        <div className="max-w-7xl mx-auto">
          <h1
            className="text-4xl sm:text-5xl text-white mb-6"
            style={{ fontFamily: 'Bebas Neue, serif', letterSpacing: '0.05em' }}
          >
            {currentGenre ? `${currentGenre.emoji} ${currentGenre.label}` : '🎬 전체'}
          </h1>

          {/* Genre Pills */}
          <div className="flex gap-2 flex-wrap">
            {ALL_GENRES.map((g) => (
              <button
                key={g.value}
                onClick={() => handleGenreChange(g.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedGenre === g.value
                    ? 'bg-brand-red text-white shadow-lg shadow-brand-red/30'
                    : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                }`}
              >
                {g.emoji} {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <Filter className="w-4 h-4" />
            <span>{movies.length}개 결과</span>
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-surface-100 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-red pr-8"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
        </div>

        {/* Movie Grid */}
        {isLoading && movies.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] skeleton rounded-lg" />
            ))}
          </div>
        ) : movies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-10">
                <button
                  onClick={() => loadMovies(false)}
                  disabled={isLoading}
                  className="btn-secondary px-10 disabled:opacity-50"
                >
                  {isLoading ? '불러오는 중...' : '더 보기'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-white/40 text-lg">해당 장르의 영화가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
