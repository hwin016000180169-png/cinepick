'use client';

import { useState } from 'react';
import { Zap, ChevronRight, ChevronLeft, Sparkles, RotateCcw } from 'lucide-react';
import MovieCard from '../../components/MovieCard';
import api from '../../lib/api';

const MOODS = [
  { value: '감동적인', emoji: '🥺', label: '감동적인', desc: '눈물 한 방울 흘리고 싶어' },
  { value: '흥미진진한', emoji: '🤩', label: '흥미진진한', desc: '두근두근 설레는 이야기' },
  { value: '유쾌한', emoji: '😂', label: '유쾌한', desc: '웃고 싶은 기분' },
  { value: '긴장감있는', emoji: '😰', label: '긴장감있는', desc: '손에 땀을 쥐는 스릴' },
  { value: '로맨틱한', emoji: '💕', label: '로맨틱한', desc: '달콤한 사랑 이야기' },
  { value: '서사적인', emoji: '🎭', label: '서사적인', desc: '웅장한 대서사시' },
  { value: '어두운', emoji: '🌑', label: '어두운', desc: '묵직하고 깊은 이야기' },
  { value: '생각하게하는', emoji: '🤔', label: '생각하게하는', desc: '생각할 거리가 있는 영화' }
];

const DURATIONS = [
  { value: 90, label: '90분 이하', desc: '가볍게 한 편', emoji: '⚡' },
  { value: 120, label: '2시간 내외', desc: '적당한 길이', emoji: '🎬' },
  { value: 150, label: '2시간 30분', desc: '여유있게 감상', emoji: '🍿' },
  { value: 300, label: '시간 상관없어', desc: '몰입해서 보고 싶어', emoji: '🌙' }
];

const GENRES = [
  { value: 'all', label: '상관없어', emoji: '🎲' },
  { value: '액션', label: '액션', emoji: '💥' },
  { value: '로맨스', label: '로맨스', emoji: '💕' },
  { value: '스릴러', label: '스릴러', emoji: '😱' },
  { value: '코미디', label: '코미디', emoji: '😄' },
  { value: '드라마', label: '드라마', emoji: '🎭' },
  { value: 'SF', label: 'SF', emoji: '🚀' },
  { value: '공포', label: '공포', emoji: '👻' },
  { value: '애니메이션', label: '애니메이션', emoji: '✨' }
];

const STEPS = ['mood', 'duration', 'genre'];

export default function QuickPickPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ mood: '', duration: 120, genre: 'all' });
  const [results, setResults] = useState([]);
  const [aiMessage, setAiMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSelect = (key, value) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setDone(true);
    try {
      // Try AI first, fallback to quick-pick
      try {
        const data = await api.getAIRecommendations({
          mood: answers.mood,
          duration: answers.duration,
          genre: answers.genre,
          session_id: `qp_${Date.now()}`
        });
        setResults(data.movies || []);
        setAiMessage(data.message || '');
      } catch {
        const data = await api.getQuickPick({
          mood: answers.mood,
          max_duration: answers.duration,
          genre: answers.genre
        });
        setResults(data.movies || []);
        setAiMessage('기분에 맞는 영화를 찾았어요!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setAnswers({ mood: '', duration: 120, genre: 'all' });
    setResults([]);
    setAiMessage('');
    setDone(false);
  };

  const currentKey = STEPS[step];
  const currentValue = answers[currentKey];
  const canProceed = currentValue !== '' && currentValue !== null;

  // Results view
  if (done) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-brand-red" />
                <h1
                  className="text-3xl sm:text-4xl text-white"
                  style={{ fontFamily: 'Bebas Neue, serif', letterSpacing: '0.05em' }}
                >
                  AI 추천 결과
                </h1>
              </div>
              {aiMessage && (
                <p className="text-white/60 text-sm sm:text-base">{aiMessage}</p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="badge bg-white/10 text-white/70">
                  {MOODS.find(m => m.value === answers.mood)?.emoji} {answers.mood}
                </span>
                <span className="badge bg-white/10 text-white/70">
                  ⏱ {DURATIONS.find(d => d.value === answers.duration)?.label}
                </span>
                <span className="badge bg-white/10 text-white/70">
                  {GENRES.find(g => g.value === answers.genre)?.emoji} {answers.genre === 'all' ? '장르 무관' : answers.genre}
                </span>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="btn-secondary py-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              다시 하기
            </button>
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-brand-red/30 border-t-brand-red rounded-full animate-spin mb-4" />
              <p className="text-white/50">AI가 최적의 영화를 분석 중...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {results.map((movie) => (
                <MovieCard key={movie.id} movie={movie} showAiReason />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎬</div>
              <p className="text-white/50 text-lg">조건에 맞는 영화를 찾지 못했어요</p>
              <button onClick={handleReset} className="btn-primary mt-6 mx-auto">
                다시 시도
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="flex items-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex items-center gap-1">
              <div
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i <= step ? 'bg-brand-red' : 'bg-white/10'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Step Icon */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center text-sm font-bold">
            {step + 1}
          </div>
          <span className="text-white/40 text-sm">{step + 1} / {STEPS.length}</span>
        </div>

        {/* Question */}
        <h2
          className="text-4xl sm:text-5xl text-white mb-2"
          style={{ fontFamily: 'Bebas Neue, serif', letterSpacing: '0.03em' }}
        >
          {step === 0 && '지금 기분이 어때요?'}
          {step === 1 && '얼마나 시간이 있어요?'}
          {step === 2 && '어떤 장르가 끌려요?'}
        </h2>
        <p className="text-white/40 text-sm mb-8">
          {step === 0 && '지금 이 순간의 감정을 선택해주세요'}
          {step === 1 && '오늘 영화에 쓸 수 있는 시간을 알려주세요'}
          {step === 2 && '오늘 특별히 보고 싶은 장르가 있나요?'}
        </p>

        {/* Options Grid */}
        <div className={`grid gap-3 mb-10 ${
          step === 0 ? 'grid-cols-2 sm:grid-cols-4' :
          step === 1 ? 'grid-cols-2' :
          'grid-cols-3'
        }`}>
          {step === 0 && MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => handleSelect('mood', m.value)}
              className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                answers.mood === m.value
                  ? 'border-brand-red bg-brand-red/10 shadow-lg shadow-brand-red/20'
                  : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
              }`}
            >
              <div className="text-2xl mb-2">{m.emoji}</div>
              <div className="text-white font-medium text-sm">{m.label}</div>
              <div className="text-white/40 text-xs mt-0.5">{m.desc}</div>
            </button>
          ))}

          {step === 1 && DURATIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => handleSelect('duration', d.value)}
              className={`p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                answers.duration === d.value
                  ? 'border-brand-red bg-brand-red/10 shadow-lg shadow-brand-red/20'
                  : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
              }`}
            >
              <div className="text-3xl mb-2">{d.emoji}</div>
              <div className="text-white font-semibold">{d.label}</div>
              <div className="text-white/40 text-sm mt-0.5">{d.desc}</div>
            </button>
          ))}

          {step === 2 && GENRES.map((g) => (
            <button
              key={g.value}
              onClick={() => handleSelect('genre', g.value)}
              className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                answers.genre === g.value
                  ? 'border-brand-red bg-brand-red/10 shadow-lg shadow-brand-red/20'
                  : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
              }`}
            >
              <div className="text-2xl mb-1">{g.emoji}</div>
              <div className="text-white text-sm font-medium">{g.label}</div>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              step === 0
                ? 'text-white/20 cursor-not-allowed'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            이전
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
              canProceed
                ? 'bg-brand-red hover:bg-brand-red-dark text-white shadow-lg shadow-brand-red/30 animate-pulse-glow'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            {step === STEPS.length - 1 ? (
              <>
                <Zap className="w-5 h-5" />
                AI 추천 받기
              </>
            ) : (
              <>
                다음
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
