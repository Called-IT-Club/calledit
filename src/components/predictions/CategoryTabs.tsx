'use client';

import { PredictionCategory } from '@/types';
import { useRef, useEffect } from 'react';

interface CategoryTabsProps {
    selected: PredictionCategory | 'all';
    onSelect: (category: PredictionCategory | 'all') => void;
}

export default function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const tabs = [
        { id: 'all' as const, emoji: '📋', label: 'All' },
        { id: 'not-on-my-bingo' as const, emoji: '🎯', label: 'On My Bingo' },
        { id: 'sports' as const, emoji: '⚽', label: 'Sports' },
        { id: 'world-events' as const, emoji: '🌍', label: 'World' },
        { id: 'financial-markets' as const, emoji: '📈', label: 'Financial' },
        { id: 'politics' as const, emoji: '🏛️', label: 'Politics' },
        { id: 'entertainment' as const, emoji: '🎬', label: 'Entertainment' },
        { id: 'technology' as const, emoji: '🤖', label: 'Tech' },
    ];

    // Scroll active item into view
    useEffect(() => {
        if (scrollContainerRef.current) {
            const activeTab = scrollContainerRef.current.querySelector('[data-active="true"]');
            if (activeTab) {
                activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [selected]);

    return (
        <div className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-sm -mx-4 px-4 py-3 border-b border-gray-100/50 mb-6 transition-all">
            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto no-scrollbar gap-2 pb-1 snap-x"
            >
                {tabs.map(tab => {
                    const isActive = selected === tab.id;

                    return (
                        <button
                            key={tab.id}
                            data-active={isActive}
                            onClick={() => onSelect(tab.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 
                                whitespace-nowrap snap-start border select-none
                                ${isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent text-white shadow-lg shadow-blue-500/30 scale-105'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-blue-50/30 hover:text-blue-600 shadow-sm hover:shadow-md'
                                }
                            `}
                        >
                            <span className={`transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-80 grayscale-[0.5]'}`}>{tab.emoji}</span>
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>
            {/* Gradient Fade for scroll indication */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none md:hidden"></div>
        </div>
    );
}
