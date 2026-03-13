'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star, Clock, Calendar, Globe, ChevronLeft, Bookmark,
  BookmarkCheck, Play, Users, Award
} from 'lucide-react';
import MovieCard from '../../../components/MovieCard';
import MovieRow from '../../../components/MovieRow';
import api from '../../../lib/api';
import { useAuthStore, useWatchlistStore } from '../../../lib/store';
import toast from 'react-hot-toast';

export default function MovieDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();

  const inWatchlist = movie ? isInWatchlist(movie.id) : false;

  useEffect(() => {
    const load = async () => {
      try {
        const [detailData, similarData] = await Promise.all([
          api.getMovieById(id),
          api.getSimilarMovies(id)
        ]);
        setMovie(detailData.movie);
        setReviews(detailData.reviews || []);
        setSimilar(similarData.movies || []);
      } catch {
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const handleWatchlist = async () => {
    if (!isAuthenticated()) {
      toast.error('로그인이 필요합니다.');
      return;
    }
    if (inWatchlist) {
      await removeFromWatchlist(movie.id);
      toast.success('찜 목록에서 제거했습니다.');
    } else {
      await addToWatchlist(movie.id);
      toast.success('찜 목록에 추가했습니다! 🎬');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16">
        <div className="w-full h-[50vh] skeleton" />
        <div className="max-w-5xl mx-auto px-6 mt-8 space-y-4">
          <div className="w-64 h-10 skeleton rounded" />
          <div className="w-full h-4 skeleton rounded" />
          <div className="w-3/4 h-4 skeleton rounded" />
        </div>
      </div>
    );
  }

  if (!movie) return null;

  const ratingColor = movie.rating >= 8 ? '#4ade80' : movie.rating >= 6 ? '#F5C518' : '#ef4444';

  return (
    <div className="min-h-screen">
      {/* Backdrop Hero */}
      <div className="relative h-[55vh] sm:h-[65vh] overflow-hidden">
        {movie.backdrop || movie.poster ? (
          <Image
            src={movie.backdrop || movie.poster}
            alt={movie.title}
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-surface-200 to-surface" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface/80 to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-20 left-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors bg-black/30 backdrop-blur-sm rounded-full px-3 py-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">뒤로</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
          {/* Poster */}
          <div className="hidden md:block">
            <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shadow-black/70 ring-1 ring-white/10">
              {movie.poster ? (
                <Image src={movie.poster} alt={movie.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-surface-100 flex items-center justify-center">
                  <span className="text-5xl">🎬</span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            {/* Badges */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {movie.is_new && (
                <span className="badge bg-brand-red text-white font-bold">신작</span>
              )}
              {movie.age_rating && (
                <span className="badge border border-white/20 text-white/60">{movie.age_rating}</span>
              )}
              {movie.genre?.map((g) => (
                <Link
                  key={g}
                  href={`/genre?g=${encodeURIComponent(g)}`}
                  className="badge bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
                >
                  {g}
                </Link>
              ))}
            </div>

            {/* Title */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl text-white mb-1 leading-none"
              style={{ fontFamily: 'Bebas Neue, serif', letterSpacing: '0.02em' }}
            >
              {movie.title}
            </h1>
            {movie.original_title && movie.original_title !== movie.title && (
              <p className="text-white/30 text-sm mb-4">{movie.original_title}</p>
            )}

            {/* Meta Row */}
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 fill-current" style={{ color: ratingColor }} />
                <span className="text-white font-bold text-xl">{movie.rating?.toFixed(1)}</span>
                <span className="text-white/30 text-sm">/ 10</span>
              </div>
              <div className="flex items-center gap-1 text-white/50 text-sm">
                <Clock className="w-4 h-4" />
                <span>{movie.duration}분</span>
              </div>
              {movie.release_year && (
                <div className="flex items-center gap-1 text-white/50 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{movie.release_year}</span>
                </div>
              )}
              {movie.country && (
                <div className="flex items-center gap-1 text-white/50 text-sm">
                  <Globe className="w-4 h-4" />
                  <span>{movie.country}</span>
                </div>
              )}
            </div>

            {/* OTT Platforms */}
            {movie.ott_platform?.length > 0 && (
              <div className="flex items-center gap-2 mb-5 flex-wrap">
                <span className="text-white/30 text-xs">시청 가능:</span>
                {movie.ott_platform.map((p) => (
                  <span key={p} className="text-xs bg-white/10 border border-white/10 px-2.5 py-1 rounded-full text-white/70">
                    {p}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={handleWatchlist}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  inWatchlist
                    ? 'bg-brand-red text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {inWatchlist ? (
                  <><BookmarkCheck className="w-5 h-5" /> 찜 완료</>
                ) : (
                  <><Bookmark className="w-5 h-5" /> 찜하기</>
                )}
              </button>
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className={`text-white/70 text-sm sm:text-base leading-relaxed ${!showFullDesc && 'line-clamp-4'}`}>
                {movie.description}
              </p>
              {movie.description?.length > 200 && (
                <button
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  className="text-white/40 text-sm mt-1 hover:text-white/70 transition-colors"
                >
                  {showFullDesc ? '접기' : '더 보기'}
                </button>
              )}
            </div>

            {/* Director & Cast */}
            <div className="grid grid-cols-2 gap-4">
              {movie.director && (
                <div>
                  <div className="flex items-center gap-1.5 text-white/30 text-xs mb-1">
                    <Award className="w-3 h-3" /> 감독
                  </div>
                  <p className="text-white text-sm font-medium">{movie.director}</p>
                </div>
              )}
              {movie.cast?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-white/30 text-xs mb-1">
                    <Users className="w-3 h-3" /> 출연
                  </div>
                  <p className="text-white text-sm">{movie.cast.slice(0, 3).join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar Movies */}
        {similar.length > 0 && (
          <div className="mt-16">
            <MovieRow title="비슷한 영화" movies={similar} />
          </div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="mt-10 pb-16">
            <h2
              className="text-2xl text-white mb-4 px-4 sm:px-6 lg:px-8"
              style={{ fontFamily: 'Bebas Neue, serif', letterSpacing: '0.05em' }}
            >
              관람 후기
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4 sm:px-6 lg:px-8">
              {reviews.map((r) => (
                <div key={r.id} className="bg-surface-50 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-sm font-medium">
                      {r.users?.username || '익명'}
                    </span>
                    <div className="flex items-center gap-1 text-brand-gold text-sm">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{r.rating?.toFixed(1)}</span>
                    </div>
                  </div>
                  {r.content && (
                    <p className="text-white/50 text-sm leading-relaxed">{r.content}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
