import { PredictionCategory } from '@/types';

export interface CategoryTheme {
    id: PredictionCategory;
    label: string;
    emoji: string;
    colors: {
        text: string;     // Main text color (e.g., text-blue-600)
        bg: string;       // Background color (e.g., bg-blue-50)
        border: string;   // Border color
        hex: string;      // Primary hex color for custom styles
        bgHex: string;    // Background hex
    };
    // Share Card specific themes
    share: {
        gradient: string;
        cardBg: string;
        badge: {
            bg: string;
            text: string;
            border: string;
        }
    }
}

export const CATEGORY_CONFIG: Record<PredictionCategory, CategoryTheme> = {
    'not-on-my-bingo': {
        id: 'not-on-my-bingo',
        label: 'On My Bingo',
        emoji: '🎯',
        colors: {
            text: 'text-fuchsia-600',
            bg: 'bg-fuchsia-50',
            border: 'border-fuchsia-200',
            hex: '#8b5cf6',
            bgHex: '#f5f3ff'
        },
        share: {
            gradient: 'from-violet-400 to-purple-600',
            cardBg: '#f5f3ff',
            badge: { bg: 'rgba(255, 255, 255, 0.6)', text: '#7c3aed', border: '#8b5cf6' }
        }
    },
    'sports': {
        id: 'sports',
        label: 'Sports',
        emoji: '⚽',
        colors: {
            text: 'text-sky-600',
            bg: 'bg-sky-50',
            border: 'border-sky-200',
            hex: '#3b82f6',
            bgHex: '#eff6ff'
        },
        share: {
            gradient: 'from-blue-400 to-indigo-600',
            cardBg: '#eff6ff',
            badge: { bg: 'rgba(255, 255, 255, 0.6)', text: '#2563eb', border: '#3b82f6' }
        }
    },
    'world-events': {
        id: 'world-events',
        label: 'World Events',
        emoji: '🌍',
        colors: {
            text: 'text-orange-600',
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            hex: '#ef4444',
            bgHex: '#fef2f2'
        },
        share: {
            gradient: 'from-red-400 to-orange-600',
            cardBg: '#fef2f2',
            badge: { bg: 'rgba(255, 255, 255, 0.6)', text: '#dc2626', border: '#ef4444' }
        }
    },
    'financial-markets': {
        id: 'financial-markets',
        label: 'Financial Markets',
        emoji: '📈',
        colors: {
            text: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            hex: '#10b981',
            bgHex: '#f0fdf4'
        },
        share: {
            gradient: 'from-emerald-400 to-green-600',
            cardBg: '#f0fdf4',
            badge: { bg: 'rgba(255, 255, 255, 0.6)', text: '#059669', border: '#10b981' }
        }
    },
    'politics': {
        id: 'politics',
        label: 'Politics',
        emoji: '🏛️',
        colors: {
            text: 'text-slate-600',
            bg: 'bg-slate-50',
            border: 'border-slate-200',
            hex: '#64748b',
            bgHex: '#f8fafc'
        },
        share: {
            gradient: 'from-slate-400 to-gray-600',
            cardBg: '#f8fafc',
            badge: { bg: 'rgba(255, 255, 255, 0.6)', text: '#334155', border: '#cbd5e1' }
        }
    },
    'entertainment': {
        id: 'entertainment',
        label: 'Entertainment',
        emoji: '🎬',
        colors: {
            text: 'text-rose-600',
            bg: 'bg-rose-50',
            border: 'border-rose-200',
            hex: '#f43f5e',
            bgHex: '#fff1f2'
        },
        share: {
            gradient: 'from-rose-400 to-pink-600',
            cardBg: '#fff1f2',
            badge: { bg: 'rgba(255, 255, 255, 0.6)', text: '#be123c', border: '#fda4af' }
        }
    },
    'technology': {
        id: 'technology',
        label: 'Technology',
        emoji: '🤖',
        colors: {
            text: 'text-indigo-600',
            bg: 'bg-indigo-50',
            border: 'border-indigo-200',
            hex: '#6366f1',
            bgHex: '#eef2ff'
        },
        share: {
            gradient: 'from-indigo-400 to-violet-600',
            cardBg: '#eef2ff',
            badge: { bg: 'rgba(255, 255, 255, 0.6)', text: '#4338ca', border: '#a5b4fc' }
        }
    },
    'health': {
        id: 'health',
        label: 'Health',
        emoji: '🏥',
        colors: {
            text: 'text-teal-600',
            bg: 'bg-teal-50',
            border: 'border-teal-200',
            hex: '#0d9488',
            bgHex: '#f0fdfa'
        },
        share: {
            gradient: 'from-teal-400 to-emerald-600',
            cardBg: '#f0fdfa',
            badge: { bg: 'rgba(255, 255, 255, 0.6)', text: '#0f766e', border: '#14b8a6' }
        }
    }
};

export const CATEGORY_IDS = Object.keys(CATEGORY_CONFIG) as PredictionCategory[];

export function getCategoryRaw(category: PredictionCategory | string): CategoryTheme {
    return CATEGORY_CONFIG[category as PredictionCategory] || CATEGORY_CONFIG['not-on-my-bingo'];
}
