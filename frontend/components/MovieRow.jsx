'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

export default function MovieRow({ title, movies = [], showAiReason = false, icon }) {
  const rowRef = useRef(null);

  const scroll = (dir) => {
    if (rowRef.current) {
      const amount = 600;
      rowRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  if (!movies.length) return null;

  return (
    <section className="relative group/row mb-10">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
        <h2
          className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2"
          style={{ fontFamily: 'Bebas Neue, serif', letterSpacing: '0.05em' }}
        >
          {icon && <span className="text-brand-red">{icon}</span>}
          {title}
        </h2>
        <button className="text-sm text-white/50 hover:text-white transition-colors hidden group-hover/row:block">
          모두 보기 →
        </button>
      </div>

      {/* Scroll Buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-6 z-10 w-10 h-24 bg-gradient-to-r from-surface to-transparent flex items-center justify-start pl-1 opacity-0 group-hover/row:opacity-100 transition-opacity"
      >
        <div className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </div>
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-6 z-10 w-10 h-24 bg-gradient-to-l from-surface to-transparent flex items-center justify-end pr-1 opacity-0 group-hover/row:opacity-100 transition-opacity"
      >
        <div className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
          <ChevronRight className="w-5 h-5 text-white" />
        </div>
      </button>

      {/* Movie List */}
      <div
        ref={rowRef}
        className="scroll-container flex gap-3 px-4 sm:px-6 lg:px-8 pb-2"
      >
        {movies.map((movie) => (
          <div key={movie.id} className="flex-shrink-0 w-36 sm:w-44 md:w-48">
            <MovieCard movie={movie} showAiReason={showAiReason} />
          </div>
        ))}
      </div>
    </section>
  );
}
