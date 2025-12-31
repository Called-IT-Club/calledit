import { Prediction } from '@/types';

/**
 * Maps a database prediction row to the application Prediction type.
 * Transforms snake_case database fields to camelCase and enriches with author data.
 * 
 * @param row - Raw prediction row from database with joined profiles data
 * @returns Formatted prediction object for the application
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapPrediction = (row: any): Prediction => ({
    id: row.id,
    userId: row.user_id,
    category: row.category,
    prediction: row.prediction,
    createdAt: row.created_at,
    targetDate: row.target_date,
    outcome: row.outcome || 'pending',
    evidenceImageUrl: row.evidence_image_url,
    meta: row.meta,
    author: row.profiles ? {
        name: (row.profiles.full_name?.split(' ')[0]) || row.profiles.username || row.profiles.email?.split('@')[0] || 'Authenticated',
        username: row.profiles.username,
        avatarUrl: row.profiles.avatar_url,
    } : undefined
});
