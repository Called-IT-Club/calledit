import { Prediction } from '@/types';

/**
 * Maps a database prediction row to the application Prediction type.
 * Transforms snake_case database fields to camelCase and enriches with author data.
 * 
 * @param row - Raw prediction row from database with joined profiles data
 * @param currentUserId - Optional ID of the currently authenticated user to check specific user interactions
 * @returns Formatted prediction object for the application
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapPrediction = (row: any, currentUserId?: string): Prediction => {
    // Process Reactions
    const reactionsMap: Record<string, number> = {};
    const userReactions: string[] = [];

    if (Array.isArray(row.prediction_reactions)) {
        row.prediction_reactions.forEach((r: any) => {
            // Count
            reactionsMap[r.reaction_type] = (reactionsMap[r.reaction_type] || 0) + 1;
            // Check User
            if (currentUserId && r.user_id === currentUserId) {
                userReactions.push(r.reaction_type);
            }
        });
    }

    // Process Bookmarks
    let isBookmarked = false;
    if (Array.isArray(row.prediction_bookmarks) && currentUserId) {
        isBookmarked = row.prediction_bookmarks.some((b: any) => b.user_id === currentUserId);
    }

    return {
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
        } : undefined,
        reactions: reactionsMap,
        userReactions: userReactions,
        isBookmarked: isBookmarked
    }
};
