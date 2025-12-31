
import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

// Portrait Aspect Ratio 4:5 (Matches the download card)
const size = {
    width: 600,
    height: 750,
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return new ImageResponse(
            (
                <div style={{
                    width: '100%', height: '100%', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#111827'
                }}>
                    <div style={{ fontSize: 24 }}>ID Required</div>
                </div>
            ),
            { ...size }
        );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: prediction } = await supabase
        .from('predictions')
        .select('*')
        .eq('id', id)
        .single();

    if (!prediction) {
        return new ImageResponse(
            (
                <div style={{
                    width: '100%', height: '100%', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#111827'
                }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: '#1e40af', marginBottom: 20 }}>CALLED IT!</div>
                    <div style={{ fontSize: 24 }}>Prediction not found</div>
                </div>
            ),
            { ...size }
        );
    }

    const getCategoryTheme = (category: string) => {
        switch (category) {
            case 'sports': return { bg: '#eff6ff', label: 'Sports', color: '#1d4ed8', emoji: '⚽' };
            case 'politics': return { bg: '#f8fafc', label: 'Politics', color: '#334155', emoji: '🗳️' };
            case 'financial-markets': return { bg: '#f0fdf4', label: 'Finance', color: '#15803d', emoji: '📈' };
            case 'entertainment': return { bg: '#fff1f2', label: 'Pop Culture', color: '#be123c', emoji: '🎬' };
            case 'technology': return { bg: '#eef2ff', label: 'Tech', color: '#4338ca', emoji: '💻' };
            case 'world-events': return { bg: '#fef2f2', label: 'World', color: '#b91c1c', emoji: '🌍' };
            default: return { bg: '#f5f3ff', label: 'General', color: '#6d28d9', emoji: '🔮' };
        }
    };

    const theme = getCategoryTheme(prediction.category);
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const isCalled = prediction.outcome === 'true';
    const isMissed = prediction.outcome === 'false';
    const { data: author } = await supabase
        .from('profiles')
        .select('full_name, username, email')
        .eq('id', prediction.user_id)
        .single();

    const displayName = author?.full_name || author?.username || author?.email?.split('@')[0] || "Anonymous Oracle";
    const authorName = displayName.split(' ')[0];

    return new ImageResponse(
        (
            <div style={{
                width: '100%',
                height: '100%',
                background: theme.bg,
                display: 'flex',
                flexDirection: 'column',
                fontFamily: 'sans-serif',
                position: 'relative',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '40px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ color: '#1e40af', fontSize: 24, fontWeight: 900, fontStyle: 'italic', letterSpacing: '-1px' }}>
                            CALLED IT!
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 500, color: '#6b7280', marginTop: 4, letterSpacing: '0.5px' }}>
                            Join the Club. Make the Call.
                        </div>
                    </div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '6px 14px',
                        background: 'white',
                        border: `1px solid ${theme.color}20`,
                        borderRadius: 999,
                        fontSize: 14,
                        fontWeight: 700,
                        color: theme.color,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                    }}>
                        <span>{theme.emoji}</span>
                        <span>{theme.label}</span>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 60px', position: 'relative' }}>
                    <div style={{ fontSize: 60, fontFamily: 'serif', color: '#d1d5db', lineHeight: 1 }}>"</div>
                    <div style={{ fontSize: 36, fontWeight: 800, color: '#111827', lineHeight: 1.3, margin: '10px 0' }}>
                        {prediction.prediction}
                    </div>
                    <div style={{ fontSize: 60, fontFamily: 'serif', color: '#d1d5db', lineHeight: 1, display: 'flex', justifyContent: 'flex-end' }}>"</div>

                    {/* Stamp - positioned absolutely within content area */}
                    {isCalled && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%) rotate(-10deg)',
                            background: '#22c55e',
                            color: 'white',
                            fontSize: 24,
                            fontWeight: 900,
                            padding: '12px 30px',
                            borderRadius: 50,
                            border: '4px solid white',
                        }}>
                            ✅ CAALLLLEDD IT!!!
                        </div>
                    )}

                    {isMissed && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: '#fee2e2',
                            color: 'white',
                            fontSize: 24,
                            fontWeight: 900,
                            padding: '12px 30px',
                            borderRadius: 50,
                            border: '4px solid white',
                        }}>
                            ❌ Missed it
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    background: '#f9fafb',
                    borderTop: '1px solid #f3f4f6',
                    padding: '24px 40px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16
                }}>
                    {/* User & Date Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 20, background: 'white', border: '1px solid #e5e7eb',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 'bold', color: '#4b5563'
                            }}>
                                {authorName[0]}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{authorName}</div>
                                <div style={{ fontSize: 12, color: '#6b7280' }}>{formatDate(prediction.created_at)}</div>
                            </div>
                        </div>

                        {prediction.target_date && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>TARGET</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>{formatDate(prediction.target_date)}</div>
                            </div>
                        )}
                    </div>

                    {/* Copyright */}
                    <div style={{ display: 'flex', justifyContent: 'center', fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 500 }}>
                        © {new Date().getFullYear()} Called It!
                    </div>
                </div>
            </div>
        ),
        { ...size }
    );
}
