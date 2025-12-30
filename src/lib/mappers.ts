import { Prediction } from '@/types';

export const mapPrediction = (row: any): Prediction => ({
    id: row.id,
    userId: row.user_id,
    category: row.category,
    prediction: row.prediction,
    createdAt: row.created_at,
    targetDate: row.target_date,
    outcome: row.outcome || 'pending',
    evidenceImageUrl: row.evidence_image_url,
    meta: row.meta
});
