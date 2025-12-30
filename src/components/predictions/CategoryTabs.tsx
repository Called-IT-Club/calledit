'use client';

import { PredictionCategory } from '@/types';

interface CategoryTabsProps {
    selected: PredictionCategory | 'all';
    onSelect: (category: PredictionCategory | 'all') => void;
    counts: {
        all: number;
        'not-on-my-bingo': number;
        'sports': number;
        'world-events': number;
        'financial-markets': number;
        'politics': number;
        'entertainment': number;
        'technology': number;
    };
}

export default function CategoryTabs({ selected, onSelect, counts }: CategoryTabsProps) {
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

    return (
        <div className="mb-6">
            <div className="flex flex-wrap gap-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => onSelect(tab.id)}
                        className={`
              px-4 py-2 rounded-lg font-medium transition-all duration-200
              flex items-center gap-2 whitespace-nowrap
              ${selected === tab.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }
            `}
                    >
                        <span>{tab.emoji}</span>
                        <span>{tab.label}</span>
                        <span className={`
              text-xs px-2 py-0.5 rounded-full
              ${selected === tab.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }
            `}>
                            {counts[tab.id]}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
