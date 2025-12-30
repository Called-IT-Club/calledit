import Link from 'next/link';
import HomeCarousel from '@/components/home/HomeCarousel';
import HomeAuthButtons from '@/components/home/HomeAuthButtons';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-screen py-10">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center">
        {/* Left Col: Text */}
        <div className="space-y-8 fade-in text-left">
          <h1 className="text-6xl md:text-7xl font-black italic tracking-tighter text-blue-700 mb-2">
            CALLED IT!
          </h1>

          <p className="text-lg font-medium text-gray-500 mb-4 tracking-wide">
            Join the Club. Make the Call.
          </p>

          <p className="text-xl text-gray-600 leading-relaxed">
            Make predictions. Track outcomes.<br />Prove you saw it coming.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link href="/dashboard" className="btn btn-primary text-lg px-8 py-4 inline-block shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform">
              Get Started
            </Link>
            <Link href="/feed" className="btn bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 text-lg px-8 py-4 inline-flex items-center gap-2 shadow-sm hover:scale-105 transition-transform">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              View Live Feed
            </Link>
          </div>

          <div className="pt-4">
            <p className="text-sm text-gray-500 mb-3 block">
              Or sign in directly:
            </p>
            <HomeAuthButtons />
          </div>
        </div>

        {/* Right Col: Carousel */}
        <div className="fade-in delay-100 hidden md:block">
          <HomeCarousel />
        </div>
      </div>

      {/* Mobile Carousel (visible only on small screens) */}
      <div className="fade-in delay-100 md:hidden w-full py-8">
        <HomeCarousel />
      </div>

      {/* Categories Footer */}
      <div className="mt-16 sm:mt-24 grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl opacity-70">
        <div className="category-bingo p-3 rounded-lg flex items-center gap-2 justify-center" style={{ backgroundColor: 'var(--cat-bg)' }}>
          <div className="text-xl">🎯</div>
          <div className="font-medium text-sm" style={{ color: 'var(--cat-color)' }}>On My Bingo</div>
        </div>
        <div className="category-sports p-3 rounded-lg flex items-center gap-2 justify-center" style={{ backgroundColor: 'var(--cat-bg)' }}>
          <div className="text-xl">⚽</div>
          <div className="font-medium text-sm" style={{ color: 'var(--cat-color)' }}>Sports</div>
        </div>
        <div className="category-world p-3 rounded-lg flex items-center gap-2 justify-center" style={{ backgroundColor: 'var(--cat-bg)' }}>
          <div className="text-xl">🌍</div>
          <div className="font-medium text-sm" style={{ color: 'var(--cat-color)' }}>World Events</div>
        </div>
        <div className="category-financial p-3 rounded-lg flex items-center gap-2 justify-center" style={{ backgroundColor: 'var(--cat-bg)' }}>
          <div className="text-xl">📈</div>
          <div className="font-medium text-sm" style={{ color: 'var(--cat-color)' }}>Financial Markets</div>
        </div>
      </div>
    </div>
  );
}
