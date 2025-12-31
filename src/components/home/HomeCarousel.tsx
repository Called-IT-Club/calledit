'use client';

import { useState, useEffect } from 'react';
import { PredictionCategory } from '@/types';

interface ShowcasePrediction {
    id: string;
    category: PredictionCategory;
    prediction: string;
    user: string;
    date: string;
}

const SAMPLE_PREDICTIONS: ShowcasePrediction[] = [
    {
        id: '1',
        category: 'sports',
        prediction: 'The Chiefs will win the Super Bowl in overtime',
        user: 'Brad',
        date: 'Feb 12'
    },
    {
        id: '2',
        category: 'financial-markets',
        prediction: 'Bitcoin breaks $100k barrier before New Year',
        user: 'Sarah',
        date: 'Dec 15'
    },
    {
        id: '3',
        category: 'world-events',
        prediction: 'Solar eclipse will be visible from my backyard',
        user: 'Mike',
        date: 'Apr 8'
    },
    {
        id: '4',
        category: 'not-on-my-bingo',
        prediction: 'My cat will finally catch that red dot',
        user: 'Jenny',
        date: 'Oct 4'
    }
];

export default function HomeCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % SAMPLE_PREDICTIONS.length);
        }, 4000); // Rotate every 4 seconds

        return () => clearInterval(timer);
    }, []);

    const getCategoryTheme = (cat: PredictionCategory) => {
        const themes = {
            'not-on-my-bingo': { emoji: '🎯', label: 'On My Bingo', color: '#8b5cf6', bg: '#f5f3ff' },
            'sports': { emoji: '⚽', label: 'Sports', color: '#3b82f6', bg: '#eff6ff' },
            'world-events': { emoji: '🌍', label: 'World Events', color: '#ef4444', bg: '#fef2f2' },
            'financial-markets': { emoji: '📈', label: 'Financial Markets', color: '#10b981', bg: '#f0fdf4' },
            'politics': { emoji: '🏛️', label: 'Politics', color: '#64748b', bg: '#f8fafc' },
            'entertainment': { emoji: '🎬', label: 'Entertainment', color: '#db2777', bg: '#fdf2f8' },
            'technology': { emoji: '🤖', label: 'Technology', color: '#4f46e5', bg: '#eef2ff' },
        };
        return themes[cat] || themes['not-on-my-bingo'];
    };

    return (
        <div className="w-full max-w-sm mx-auto h-[280px] relative perspective-1000">
            {SAMPLE_PREDICTIONS.map((pred, index) => {
                const theme = getCategoryTheme(pred.category);
                const isActive = index === currentIndex;

                // Simple opacity/transform transition
                if (!isActive) return null;

                return (
                    <div
                        key={pred.id}
                        className="absolute inset-0 w-full animate-fadeIn"
                    >
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col h-full transform transition-all duration-500 hover:scale-[1.02]">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium`}
                                    style={{ backgroundColor: theme.bg, color: theme.color }}>
                                    <span>{theme.emoji}</span>
                                    {theme.label}
                                </div>
                                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide border border-green-200">
                                    Called It!
                                </span>
                            </div>

                            {/* Content */}
                            <p className="text-lg font-medium text-gray-800 flex-1 leading-snug">
                                "{pred.prediction}"
                            </p>

                            {/* Footer */}
                            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300"></div>
                                    <span>{pred.user}</span>
                                </div>
                                <span>{pred.date}</span>
                            </div>
                        </div>

                        {/* Stack effect behind */}
                        <div className="absolute top-2 left-2 right-[-8px] bottom-[-8px] bg-gray-50 rounded-xl border border-gray-100 -z-10"></div>
                    </div>
                );
            })}

            {/* Progress Indicators */}
            <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-2">
                {SAMPLE_PREDICTIONS.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-blue-600 w-4' : 'bg-gray-300'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
