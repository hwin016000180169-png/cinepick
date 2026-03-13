'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bookmark, Star, Clock, Check, Trash2, Lock } from 'lucide-react';
import { useAuthStore, useWatchlistStore } from '../../lib/store';
import toast from 'react-hot-toast';

export default function WatchlistPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { items, fetchWatchlist, removeFromWatchlist, isLoading } = useWatchlistStore();
  const [filter, setFilter] = useState('all'); // all | unwatched | watched

  useEffect(() => {
    if (isAuthenticated()) fetchWatchlist();
  }, []);

  const handleRemove = async (movieId, title) => {
    const result = await removeFromWatchlist(movieId);
    if (result.success) toast.success(`"${title}" 제거했습니다.`);
  };

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-white/20" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">로그인이 필요합니다</h2>
          <p className="text-white/40 mb-8">찜 목록을 이용하려면 로그인해주세요</p>
          <Link href="/login" className="btn-primary mx-auto">
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  const filteredItems = items.filter(item => {
    if (filter === 'watched') return item.watched;
    if (filter === 'unwatched') return !item.watched;
    return true;
  });

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-4xl sm:text-5xl text-white"
              style={{ fontFamily: 'Bebas Neue, serif', letterSpacing: '0.05em' }}
            >
              내 찜 목록
            </h1>
            <p className="text-white/40 mt-1 text-sm">{items.length}개의 영화</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-white/5 rounded-lg p-1">
            {[
              { value: 'all', label: '전체' },
              { value: 'unwatched', label: '미시청' },
              { value: 'watched', label: '시청완료' }
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                  filter === f.value
                    ? 'bg-brand-red text-white'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 skeleton rounded-xl" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-24">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Bookmark className="w-12 h-12 text-white/10" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {filter === 'all' ? '찜한 영화가 없어요' : filter === 'watched' ? '시청 완료한 영화가 없어요' : '미시청 영화가 없어요'}
            </h3>
            <p className="text-white/40 mb-8">
              {filter === 'all' ? '마음에 드는 영화를 찜해보세요!' : ''}
            </p>
            {filter === 'all' && (
              <Link href="/" className="btn-primary mx-auto">
                영화 둘러보기
              </Link>
            )}
          </div>
        )}

        {/* Movie List */}
        {!isLoading && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const movie = item.movies;
              if (!movie) return null;
              return (
                <div
                  key={item.id}
                  className={`group relative bg-surface-50 rounded-xl overflow-hidden border transition-all duration-200 ${
                    item.watched
                      ? 'border-white/5 opacity-70'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <Link href={`/movie/${movie.id}`}>
                    <div className="flex gap-4 p-4">
                      {/* Thumbnail */}
                      <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-surface-100">
                        {movie.poster ? (
                          <Image src={movie.poster} alt={movie.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🎬</div>
                        )}
                        {item.watched && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Check className="w-6 h-6 text-green-400" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-brand-red transition-colors">
                            {movie.title}
                          </h3>
                          {item.watched && (
                            <span className="badge bg-green-500/20 text-green-400 flex-shrink-0">완료</span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-white/40 mb-2">
                          {movie.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-brand-gold text-brand-gold" />
                              <span>{movie.rating?.toFixed(1)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{movie.duration}분</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-wrap">
                          {movie.genre?.slice(0, 2).map((g) => (
                            <span key={g} className="badge bg-white/10 text-white/50 text-xs">{g}</span>
                          ))}
                        </div>

                        {item.user_rating && (
                          <div className="flex items-center gap-1 mt-2 text-brand-gold text-xs">
                            <Star className="w-3 h-3 fill-current" />
                            <span>내 평점: {item.user_rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(movie.id, movie.title)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white/40 hover:text-red-400 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-all"
                    title="찜 목록에서 제거"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
