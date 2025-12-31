'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { Advertisement } from '@/types';

export default function AdminPage() {
    const { isAdmin, isLoading } = useAuth();
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
            const res = await fetch('/api/admin/ads');
            if (!res.ok) throw new Error('Failed to fetch ads');

            const { ads: adsData } = await res.json();
            setAds(adsData || []);
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

    const [editingId, setEditingId] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = '/api/admin/ads';
            const method = editingId ? 'PUT' : 'POST';
            const body = editingId ? { ...newAd, id: editingId } : newAd;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `Failed to ${editingId ? 'update' : 'create'} ad`);
            }

            setIsCreating(false);
            setEditingId(null);
            setNewAd({ title: '', link_url: '', cta_text: 'Learn More', is_active: true, description: '', image_url: '', category: null });
            fetchAds();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            alert(`Error saving ad: ${errorMessage}`);
            console.error(err);
        }
    };

    const handleEdit = (ad: Advertisement) => {
        setNewAd({
            title: ad.title,
            link_url: ad.link_url,
            cta_text: ad.cta_text,
            is_active: ad.is_active,
            description: ad.description,
            image_url: ad.image_url,
            category: ad.category
        });
        setEditingId(ad.id);
        setIsCreating(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this ad?')) return;

        try {
            const res = await fetch(`/api/admin/ads?id=${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to delete ad');

            fetchAds();
        } catch (err) {
            console.error('Error deleting ad:', err);
            alert('Failed to delete ad');
        }
    };

    const toggleActive = async (id: string, current: boolean) => {
        try {
            const res = await fetch('/api/admin/ads', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, is_active: !current })
            });

            if (!res.ok) throw new Error('Failed to update ad');

            fetchAds();
        } catch (err) {
            console.error('Error updating ad:', err);
            alert('Failed to update status');
        }
    };

    if (isLoading || !isAdmin) return <div className="p-8 text-center">Loading Admin...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold">Ads Admin</h1>
                        <Link href="/admin/affiliates" className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full transition-colors">
                            Manage Affiliates &rarr;
                        </Link>
                    </div>
                    <button onClick={() => {
                        setIsCreating(!isCreating);
                        if (!isCreating) {
                            setEditingId(null);
                            setNewAd({ title: '', link_url: '', cta_text: 'Learn More', is_active: true });
                        }
                    }} className="btn btn-primary">
                        {isCreating ? 'Cancel' : '+ Create Ad'}
                    </button>
                </div>

                {isCreating && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8 fade-in">
                        <h3 className="text-xl font-semibold mb-4">{editingId ? 'Edit Advertisement' : 'New Advertisement'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                    <select className="w-full border p-2 rounded" value={newAd.category || ''} onChange={e => setNewAd({ ...newAd, category: (e.target.value as Advertisement['category']) || null })}>
                                        <option value="">Global (All Categories)</option>
                                        <option value="sports">Sports</option>
                                        <option value="politics">Politics</option>
                                        <option value="financial-markets">Finance</option>
                                        {/* Add others as needed */}
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary w-full">{editingId ? 'Update Ad' : 'Launch Ad'}</button>
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
                                <button onClick={() => handleEdit(ad)} className="text-blue-500 hover:text-blue-700 p-2">
                                    ✏️
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
