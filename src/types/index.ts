export type PredictionCategory = 'not-on-my-bingo' | 'sports' | 'world-events' | 'financial-markets' | 'politics' | 'entertainment' | 'technology' | 'health';

export type PredictionOutcome = 'pending' | 'true' | 'false';

export interface Prediction {
    id: string;
    userId: string;
    category: PredictionCategory;
    prediction: string;
    createdAt: string;
    targetDate?: string;
    outcome: PredictionOutcome;
    shareUrl?: string;
    evidenceImageUrl?: string;
    meta?: {
        tags?: string[];
        entities?: string[];
        subject?: string;
        action?: string;
        confidence?: number;
    };
    author?: {
        name: string;
        username?: string;
        avatarUrl?: string;
    };
    reactions?: Record<string, number>; // e.g., { 'like': 10, 'laugh': 5 }
    userReactions?: string[]; // e.g., ['like']
    isBookmarked?: boolean;
}

export interface User {
    id: string;
    email: string;
    name?: string;
    provider: 'email' | 'google' | 'apple';
    following?: string[];
    role?: 'user' | 'admin' | 'moderator';
    avatarUrl?: string;
}

export interface Profile {
    id: string;
    email: string;
    role: 'user' | 'admin' | 'moderator';
    username?: string;
    full_name?: string;
    avatar_url?: string;
}

export interface Advertisement {
    id: string;
    title: string;
    description?: string;
    image_url?: string;
    link_url: string;
    cta_text: string;
    category?: PredictionCategory;
    is_active: boolean;
    views?: number; // Virtual field for UI
    clicks?: number; // Virtual field for UI
}

export interface Affiliate {
    id: string;
    label: string;
    url: string;
    description?: string;
    color?: string;
    category?: PredictionCategory;
    is_active: boolean;
}
