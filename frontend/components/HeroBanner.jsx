'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Info, Star, Clock, Bookmark, BookmarkCheck } from 'lucide-react';
import { useWatchlistStore, useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';

export default function HeroBanner({ movies = [] }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();

  const featured = movies[currentIdx];

  useEffect(() => {
    if (movies.length <= 1) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % movies.length);
        setIsTransitioning(false);
      }, 500);
    }, 8000);
    return () => clearInterval(interval);
  }, [movies.length]);

  if (!featured) return null;

  const inWatchlist = isInWatchlist(featured.id);

  const handleWatchlist = async () => {
    if (!isAuthenticated()) {
      toast.error('로그인이 필요합니다.');
      return;
    }
    if (inWatchlist) {
      await removeFromWatchlist(featured.id);
      toast.success('찜 목록에서 제거했습니다.');
    } else {
      await addToWatchlist(featured.id);
      toast.success('찜 목록에 추가했습니다! 🎬');
    }
  };

  return (
    <div className="relative w-full h-[85vh] min-h-[500px] overflow-hidden">
      {/* Backdrop Image */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {featured.backdrop || featured.poster ? (
          <Image
            src={featured.backdrop || featured.poster}
            alt={featured.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-surface-200 to-surface" />
        )}
        {/* Overlays */}
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
      </div>

      {/* Content */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-6 sm:p-12 lg:p-16 transition-all duration-500 ${
          isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="max-w-2xl">
          {/* Genres */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {featured.is_new && (
              <span className="badge bg-brand-red text-white font-bold text-xs">신작</span>
            )}
            {featured.genre?.slice(0, 3).map((g) => (
              <span key={g} className="badge bg-white/10 text-white/80 backdrop-blur-sm text-xs">
                {g}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-3 leading-tight"
            style={{ fontFamily: 'Bebas Neue, serif', letterSpacing: '0.03em' }}
          >
            {featured.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 mb-4 text-sm text-white/70">
            <div className="flex items-center gap-1 text-brand-gold">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-semibold text-white">{featured.rating?.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{featured.duration}분</span>
            </div>
            {featured.release_year && <span>{featured.release_year}</span>}
            {featured.age_rating && (
              <span className="border border-white/30 px-1.5 rounded text-xs">{featured.age_rating}</span>
            )}
          </div>

          {/* Description */}
          <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-6 line-clamp-3 max-w-lg">
            {featured.description}
          </p>

          {/* OTT Platforms */}
          {featured.ott_platform?.length > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <span className="text-white/40 text-xs">시청 가능:</span>
              {featured.ott_platform.map((platform) => (
                <span
                  key={platform}
                  className="text-xs bg-white/10 px-2 py-0.5 rounded text-white/70"
                >
                  {platform}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <Link href={`/movie/${featured.id}`} className="btn-primary shadow-xl shadow-brand-red/30">
              <Play className="w-5 h-5 fill-white" />
              상세보기
            </Link>

            <button onClick={handleWatchlist} className="btn-secondary">
              {inWatchlist ? (
                <>
                  <BookmarkCheck className="w-5 h-5" />
                  찜 완료
                </>
              ) : (
                <>
                  <Bookmark className="w-5 h-5" />
                  찜하기
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Dots Navigation */}
      {movies.length > 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5">
          {movies.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              className={`transition-all duration-300 rounded-full ${
                i === currentIdx ? 'w-6 h-1.5 bg-brand-red' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
