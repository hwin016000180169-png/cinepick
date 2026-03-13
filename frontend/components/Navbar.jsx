'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Film, Search, Bookmark, User, Zap, Menu, X, LogOut } from 'lucide-react';
import { useAuthStore } from '../lib/store';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: '홈' },
    { href: '/quick-pick', label: '퀵픽', icon: Zap },
    { href: '/genre', label: '장르' },
    { href: '/watchlist', label: '찜 목록', icon: Bookmark }
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-surface/95 backdrop-blur-md shadow-2xl shadow-black/50'
            : 'bg-gradient-to-b from-black/80 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-brand-red rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span
                className="text-2xl text-brand-red tracking-widest"
                style={{ fontFamily: 'Bebas Neue, serif' }}
              >
                CinePick
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`text-sm font-medium transition-colors duration-200 hover:text-white ${
                    pathname === href ? 'text-white' : 'text-white/60'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              {showSearch ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="영화 검색..."
                    className="bg-surface-100 border border-white/10 rounded-full px-4 py-1.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-brand-red w-48 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSearch(false)}
                    className="ml-2 text-white/60 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}

              {/* Auth */}
              {isAuthenticated() ? (
                <div className="hidden md:flex items-center gap-3">
                  <Link href="/watchlist" className="text-white/60 hover:text-white transition-colors">
                    <Bookmark className="w-5 h-5" />
                  </Link>
                  <div className="flex items-center gap-2 group relative">
                    <button className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center text-sm font-bold hover:bg-brand-red-dark transition-colors">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </button>
                    <div className="absolute top-10 right-0 bg-surface-100 border border-white/10 rounded-lg p-2 hidden group-hover:block min-w-[140px] shadow-xl">
                      <p className="text-xs text-white/50 px-3 py-1 truncate">{user?.email}</p>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> 로그아웃
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:flex btn-primary py-1.5 text-sm"
                >
                  로그인
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden text-white/60 hover:text-white transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-surface/98 backdrop-blur-md border-t border-white/5">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    pathname === href
                      ? 'bg-brand-red/20 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {label}
                </Link>
              ))}
              {!isAuthenticated() && (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 mt-2 bg-brand-red text-white rounded-lg text-sm font-medium text-center"
                >
                  로그인 / 회원가입
                </Link>
              )}
              {isAuthenticated() && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white/60 hover:text-white"
                >
                  <LogOut className="w-4 h-4" /> 로그아웃
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
