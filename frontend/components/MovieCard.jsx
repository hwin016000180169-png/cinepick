'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock, Bookmark, BookmarkCheck, Play, Zap } from 'lucide-react';
import { useAuthStore, useWatchlistStore } from '../lib/store';
import toast from 'react-hot-toast';

export default function MovieCard({ movie, showAiReason = false }) {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();

  const inWatchlist = isInWatchlist(movie.id);

  const handleWatchlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated()) {
      toast.error('로그인이 필요합니다.', { icon: '🔐' });
      return;
    }

    if (inWatchlist) {
      const result = await removeFromWatchlist(movie.id);
      if (result.success) toast.success('찜 목록에서 제거했습니다.');
    } else {
      const result = await addToWatchlist(movie.id);
      if (result.success) toast.success('찜 목록에 추가했습니다! 🎬');
      else toast.error(result.error);
    }
  };

  const ratingColor =
    movie.rating >= 8 ? 'text-green-400' :
    movie.rating >= 6 ? 'text-brand-gold' : 'text-red-400';

  return (
    <Link href={`/movie/${movie.id}`}>
      <div
        className="movie-card relative group cursor-pointer rounded-lg overflow-hidden bg-surface-50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden">
          {!imgError && movie.poster ? (
            <Image
              src={movie.poster}
              alt={movie.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImgError(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-surface-100 to-surface-200 flex flex-col items-center justify-center p-4">
              <div className="text-4xl mb-2">🎬</div>
              <p className="text-white/40 text-xs text-center line-clamp-2">{movie.title}</p>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Hover Actions */}
          <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                {movie.genre.slice(0, 2).map((g) => (
                  <span key={g} className="badge bg-white/20 text-white/90 backdrop-blur-sm">
                    {g}
                  </span>
                ))}
              </div>
              <button
                onClick={handleWatchlistToggle}
                className={`p-1.5 rounded-full transition-colors ${
                  inWatchlist
                    ? 'bg-brand-red text-white'
                    : 'bg-black/50 text-white/80 hover:bg-brand-red hover:text-white'
                }`}
              >
                {inWatchlist ? (
                  <BookmarkCheck className="w-4 h-4" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Play Button */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-1.5 bg-white text-black rounded-md px-3 py-1.5 text-sm font-semibold hover:bg-white/90 transition-colors">
                <Play className="w-3.5 h-3.5 fill-black" />
                상세보기
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {movie.is_new && (
              <span className="badge bg-brand-red text-white text-xs font-bold shadow-lg">NEW</span>
            )}
            {movie.match_score && (
              <span className="badge bg-green-500/90 text-white text-xs font-bold flex items-center gap-0.5 shadow-lg">
                <Zap className="w-2.5 h-2.5" />
                {movie.match_score}%
              </span>
            )}
          </div>
        </div>

        {/* Card Info */}
        <div className="p-2.5">
          <h3 className="text-white font-semibold text-sm line-clamp-1 group-hover:text-brand-red transition-colors">
            {movie.title}
          </h3>

          <div className="flex items-center gap-2 mt-1">
            <div className={`flex items-center gap-0.5 text-xs ${ratingColor}`}>
              <Star className="w-3 h-3 fill-current" />
              <span className="font-medium">{movie.rating?.toFixed(1)}</span>
            </div>
            <span className="text-white/30 text-xs">·</span>
            <div className="flex items-center gap-0.5 text-white/40 text-xs">
              <Clock className="w-3 h-3" />
              <span>{movie.duration}분</span>
            </div>
            {movie.release_year && (
              <>
                <span className="text-white/30 text-xs">·</span>
                <span className="text-white/40 text-xs">{movie.release_year}</span>
              </>
            )}
          </div>

          {/* AI Reason */}
          {showAiReason && movie.ai_reason && (
            <div className="mt-2 flex items-start gap-1.5 bg-brand-red/10 rounded-md px-2 py-1.5">
              <Zap className="w-3 h-3 text-brand-red mt-0.5 flex-shrink-0" />
              <p className="text-xs text-white/70 leading-relaxed">{movie.ai_reason}</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
