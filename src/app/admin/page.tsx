'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import { Advertisement, PredictionCategory } from '@/types';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const { user, isAdmin, isLoading } = useAuth();
    const router = useRouter();
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [loadingAds, setLoadingAds] = useState(true);

    // Form State
    const [isCreating, setIsCreating] = useState(false);
    const [newAd, setNewAd] = useState<Partial<Advertisement>>({
        title: '',
        link_url: '',
        cta_text: 'Learn More',
        is_active: true
    });

    useEffect(() => {
        if (!isLoading && !isAdmin) {
            router.push('/dashboard');
        }
    }, [isLoading, isAdmin, router]);

    const fetchAds = async () => {
        try {
            // Fetch Ads
            const { data: adsData, error } = await supabase
                .from('advertisements')
                .select('*')
                .order('created_at', { ascending: false });

            if (adsData) setAds(adsData as Advertisement[]); // Type assertion needed until Supabase types gen generated

            if (error) throw error;

            // Enrich with Stats (This handles the "count" join loosely)
            // Ideally use rpc or dedicated view, but iterating is fine for v1
            const enriched = await Promise.all((adsData || []).map(async (ad) => {
                const { count: views } = await supabase
                    .from('ad_events')
                    .select('*', { count: 'exact', head: true })
                    .eq('ad_id', ad.id)
                    .eq('type', 'view');

                const { count: clicks } = await supabase
                    .from('ad_events')
                    .select('*', { count: 'exact', head: true })
                    .eq('ad_id', ad.id)
                    .eq('type', 'click');

                return { ...ad, views: views || 0, clicks: clicks || 0 };
            }));

            setAds(enriched as Advertisement[]);

        } catch (err) {
            console.error('Error fetching ads:', err);
        } finally {
            setLoadingAds(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchAds();
        }
    }, [isAdmin]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('advertisements')
                .insert([{ ...newAd, created_by: user?.id }]);

            if (error) throw error;

            setIsCreating(false);
            setNewAd({ title: '', link_url: '', cta_text: 'Learn More', is_active: true });
            fetchAds();
        } catch (err) {
            alert('Error creating ad');
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this ad?')) return;
        await supabase.from('advertisements').delete().eq('id', id);
        fetchAds();
    };

    const toggleActive = async (id: string, current: boolean) => {
        await supabase.from('advertisements').update({ is_active: !current }).eq('id', id);
        fetchAds();
    };

    if (isLoading || !isAdmin) return <div className="p-8 text-center">Loading Admin...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <button onClick={() => setIsCreating(!isCreating)} className="btn btn-primary">
                        {isCreating ? 'Cancel' : '+ Create Ad'}
                    </button>
                </div>

                {isCreating && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8 fade-in">
                        <h3 className="text-xl font-semibold mb-4">New Advertisement</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input className="w-full border p-2 rounded" value={newAd.title} onChange={e => setNewAd({ ...newAd, title: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                                <textarea className="w-full border p-2 rounded" value={newAd.description || ''} onChange={e => setNewAd({ ...newAd, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Link URL</label>
                                    <input className="w-full border p-2 rounded" value={newAd.link_url} onChange={e => setNewAd({ ...newAd, link_url: e.target.value })} required placeholder="https://..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Image URL (Optional)</label>
                                    <input className="w-full border p-2 rounded" value={newAd.image_url || ''} onChange={e => setNewAd({ ...newAd, image_url: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">CTA Text</label>
                                    <input className="w-full border p-2 rounded" value={newAd.cta_text} onChange={e => setNewAd({ ...newAd, cta_text: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Category Target</label>
                                    <select className="w-full border p-2 rounded" value={newAd.category || ''} onChange={e => setNewAd({ ...newAd, category: e.target.value as any || null })}>
                                        <option value="">Global (All Categories)</option>
                                        <option value="sports">Sports</option>
                                        <option value="politics">Politics</option>
                                        <option value="financial-markets">Finance</option>
                                        {/* Add others as needed */}
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary w-full">Launch Ad</button>
                        </form>
                    </div>
                )}

                <div className="space-y-4">
                    {ads.map(ad => (
                        <div key={ad.id} className={`bg-white p-4 rounded-lg shadow border-l-4 ${ad.is_active ? 'border-green-500' : 'border-gray-300'} flex items-center justify-between`}>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-lg">{ad.title}</h3>
                                    {ad.category && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full uppercase">{ad.category}</span>}
                                    {!ad.is_active && <span className="text-gray-400 text-xs italic">(Inactive)</span>}
                                </div>
                                <p className="text-sm text-gray-600 truncate max-w-md">{ad.link_url}</p>
                                <div className="mt-2 flex gap-4 text-xs font-mono text-gray-500">
                                    <span>👁 {ad.views || 0} Views</span>
                                    <span>👆 {ad.clicks || 0} Clicks</span>
                                    <span>📊 {ad.views ? Math.round(((ad.clicks || 0) / ad.views) * 1000) / 10 : 0}% CTR</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => toggleActive(ad.id, ad.is_active)} className={`px-3 py-1 rounded text-sm font-medium ${ad.is_active ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                                    {ad.is_active ? 'Pause' : 'Activate'}
                                </button>
                                <button onClick={() => handleDelete(ad.id)} className="text-red-500 hover:text-red-700 p-2">
                                    🗑
                                </button>
                            </div>
                        </div>
                    ))}
                    {ads.length === 0 && !loadingAds && <p className="text-center text-gray-500">No ads found.</p>}
                </div>
            </main>
        </div>
    );
}
