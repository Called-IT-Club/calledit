export type PredictionCategory = 'not-on-my-bingo' | 'sports' | 'world-events' | 'financial-markets' | 'politics' | 'entertainment' | 'technology';

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
}

export interface User {
    id: string;
    email: string;
    name?: string;
    provider: 'email' | 'google' | 'apple';
    following?: string[];
}
