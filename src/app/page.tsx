import Link from 'next/link';
import HomeCarousel from '@/components/home/HomeCarousel';
import HomeAuthButtons from '@/components/home/HomeAuthButtons';

const CATEGORIES = [
  { id: 'bingo', label: 'On My Bingo', emoji: '🎯', color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'sports', label: 'Sports', emoji: '⚽', color: '#3b82f6', bg: '#eff6ff' },
  { id: 'world', label: 'World Events', emoji: '🌍', color: '#ef4444', bg: '#fef2f2' },
  { id: 'finance', label: 'Financial Markets', emoji: '📈', color: '#10b981', bg: '#f0fdf4' },
];

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-screen py-12">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center mb-16">

        {/* Left Col: Text Content */}
        <div className="space-y-8 fade-in text-center lg:text-left order-1">
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-4 lg:gap-6">
              <div className="bg-white p-2 rounded-2xl shadow-lg border border-blue-50 rotate-3">
                <img src="/logo.png" alt="Called It Logo" className="w-16 h-16 sm:w-24 sm:h-24 object-contain" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black italic tracking-tighter text-blue-700 leading-tight">
                CALLED IT!
              </h1>
            </div>

            <p className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Join the Club. Make the Call.
            </p>

            <p className="text-lg text-gray-500 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              The ultimate platform to track your predictions, compete with friends, and prove you saw it coming all along.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            <Link
              href="/dashboard"
              className="btn btn-primary text-lg px-8 py-4 shadow-xl shadow-blue-600/20 hover:-translate-y-1 transition-transform font-bold"
            >
              Get Started
            </Link>
            <Link
              href="/feed"
              className="btn bg-gray-50 text-gray-900 border border-gray-200 hover:bg-gray-100 text-lg px-8 py-4 inline-flex items-center justify-center gap-2 hover:-translate-y-1 transition-transform font-medium"
            >
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </div>
              Live Feed
            </Link>
          </div>

          <div className="pt-8 border-t border-gray-100 mt-8 max-w-sm mx-auto lg:mx-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 text-center lg:text-left">
              Or continue with
            </p>
            <HomeAuthButtons />
          </div>
        </div>

        {/* Right Col: Carousel (Order 2 on Mobile) */}
        <div className="fade-in delay-100 order-2 w-full max-w-md mx-auto lg:max-w-full">
          <div className="relative">
            <HomeCarousel />
          </div>
        </div>

      </div>

      {/* Categories Footer Section */}
      <div className="w-full max-w-5xl fade-in delay-200">
        <p className="text-center text-gray-400 text-sm font-medium mb-6 uppercase tracking-widest">
          Predict Anything
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="p-4 rounded-xl flex items-center gap-3 justify-center transition-transform hover:scale-105 cursor-default border border-transparent hover:border-gray-100 hover:shadow-sm"
              style={{ backgroundColor: cat.bg }}
            >
              <span className="text-2xl filter drop-shadow-sm">{cat.emoji}</span>
              <span className="font-semibold text-sm" style={{ color: cat.color }}>
                {cat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
