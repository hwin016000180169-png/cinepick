'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Film, Eye, EyeOff, Zap } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, signup, isLoading } = useAuthStore();
  const [isSignup, setIsSignup] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', username: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return;

    if (isSignup) {
      const result = await signup(form.email, form.password, form.username);
      if (result.success) {
        toast.success('회원가입 완료! 로그인해주세요.');
        setIsSignup(false);
        setForm({ ...form, password: '' });
      } else {
        toast.error(result.error || '회원가입에 실패했습니다.');
      }
    } else {
      const result = await login(form.email, form.password);
      if (result.success) {
        toast.success('로그인했습니다! 🎬');
        router.push('/');
      } else {
        toast.error(result.error || '로그인에 실패했습니다.');
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Cinematic Background */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0505 100%)'
        }}
      >
        {/* Decorative Circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand-red/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-brand-red/5 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-16 text-center">
          <div className="w-16 h-16 bg-brand-red rounded-xl flex items-center justify-center mb-6 shadow-2xl shadow-brand-red/50">
            <Film className="w-8 h-8 text-white" />
          </div>
          <h2
            className="text-6xl text-white mb-4"
            style={{ fontFamily: 'Bebas Neue, serif', letterSpacing: '0.08em' }}
          >
            CinePick
          </h2>
          <p className="text-white/50 text-lg leading-relaxed max-w-sm">
            AI가 당신의 기분과 취향을 분석해<br />
            오늘 밤 완벽한 영화를 추천해드려요
          </p>

          {/* Feature List */}
          <div className="mt-12 space-y-4 w-full max-w-xs text-left">
            {[
              { icon: '⚡', text: '3가지 질문으로 딱 맞는 영화 추천' },
              { icon: '🤖', text: 'GPT-4 기반 AI 큐레이션' },
              { icon: '🎬', text: '장르별, 기분별 콘텐츠 탐색' },
              { icon: '📌', text: '나만의 찜 목록 관리' }
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-white/60">
                <span className="text-lg">{f.icon}</span>
                <span className="text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-surface">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-brand-red rounded flex items-center justify-center">
              <Film className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-2xl text-brand-red"
              style={{ fontFamily: 'Bebas Neue, serif', letterSpacing: '0.08em' }}
            >
              CinePick
            </span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-1">
            {isSignup ? '회원가입' : '로그인'}
          </h1>
          <p className="text-white/40 text-sm mb-8">
            {isSignup
              ? '계정을 만들고 AI 영화 추천을 경험하세요'
              : '다시 만나서 반가워요 👋'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-sm text-white/50 mb-1.5">닉네임 (선택)</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="닉네임을 입력하세요"
                  className="w-full bg-surface-100 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-brand-red transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-white/50 mb-1.5">이메일</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
                required
                className="w-full bg-surface-100 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-brand-red transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-white/50 mb-1.5">비밀번호</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-surface-100 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-brand-red transition-colors pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !form.email || !form.password}
              className="w-full btn-primary justify-center py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  처리 중...
                </span>
              ) : isSignup ? '계정 만들기' : '로그인'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setForm({ email: '', password: '', username: '' });
              }}
              className="text-sm text-white/40 hover:text-white transition-colors"
            >
              {isSignup ? '이미 계정이 있나요? 로그인' : '계정이 없나요? 회원가입'}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface px-3 text-white/20">또는</span>
            </div>
          </div>

          {/* Guest Mode */}
          <button
            onClick={() => router.push('/')}
            className="w-full btn-secondary justify-center py-3"
          >
            비회원으로 둘러보기
          </button>

          <p className="text-center text-white/20 text-xs mt-8">
            로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의합니다
          </p>
        </div>
      </div>
    </div>
  );
}
