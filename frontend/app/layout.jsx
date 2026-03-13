import { Bebas_Neue, DM_Sans } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import './globals.css';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap'
});

const dmSans = DM_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap'
});

export const metadata = {
  title: 'CinePick — AI가 골라주는 오늘의 영화',
  description: 'AI 기반 OTT 콘텐츠 추천 플랫폼. 기분, 시간, 장르에 맞는 완벽한 영화를 찾아드립니다.',
  keywords: 'OTT, 영화 추천, AI 추천, 넷플릭스, 왓챠',
  openGraph: {
    title: 'CinePick',
    description: 'AI가 골라주는 오늘의 완벽한 영화',
    type: 'website'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={`${bebasNeue.variable} ${dmSans.variable}`}>
      <body className="bg-surface text-white min-h-screen">
        <Navbar />
        <main>{children}</main>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1f1f1f',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px'
            },
            success: {
              iconTheme: { primary: '#E50914', secondary: '#fff' }
            }
          }}
        />
      </body>
    </html>
  );
}
