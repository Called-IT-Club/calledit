'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import { Affiliate, PredictionCategory } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminAffiliatesPage() {
    const { user, isAdmin, isLoading } = useAuth();
    const router = useRouter();
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [isCreating, setIsCreating] = useState(false);
    const [newItem, setNewItem] = useState<Partial<Affiliate>>({
        label: '',
        url: '',
        description: '',
        color: 'bg-blue-600 hover:bg-blue-700 text-white',
        category: undefined,
        is_active: true
    });

    useEffect(() => {
        if (!isLoading && !isAdmin) {
            router.push('/dashboard');
        }
    }, [isLoading, isAdmin, router]);

    const fetchAffiliates = async () => {
        try {
            const res = await fetch('/api/admin/affiliates');
            if (!res.ok) throw new Error('Failed to fetch');

            const { affiliates: data } = await res.json();
            setAffiliates(data || []);
        } catch (err) {
            console.error('Error fetching affiliates:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchAffiliates();
        }
    }, [isAdmin]);

    const [editingId, setEditingId] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = '/api/admin/affiliates';
            const method = editingId ? 'PUT' : 'POST';
            const body = editingId ? { ...newItem, id: editingId } : newItem;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `Failed to ${editingId ? 'update' : 'create'}`);
            }

            setIsCreating(false);
            setEditingId(null);
            setNewItem({ label: '', url: '', description: '', color: 'bg-blue-600 hover:bg-blue-700 text-white', category: undefined, is_active: true });
            fetchAffiliates();
        } catch (err: any) {
            alert(`Error saving: ${err.message}`);
        }
    };

    const handleEdit = (item: Affiliate) => {
        setNewItem({
            label: item.label,
            url: item.url,
            description: item.description,
            color: item.color,
            category: item.category,
            is_active: item.is_active
        });
        setEditingId(item.id);
        setIsCreating(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this affiliate?')) return;

        try {
            const res = await fetch(`/api/admin/affiliates?id=${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to delete');
            fetchAffiliates();
        } catch (err) {
            alert('Failed to delete');
        }
    };

    const toggleActive = async (id: string, current: boolean) => {
        try {
            const res = await fetch('/api/admin/affiliates', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, is_active: !current })
            });

            if (!res.ok) throw new Error('Failed to update');
            fetchAffiliates();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    if (isLoading || !isAdmin) return <div className="p-8 text-center">Loading Admin...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin" className="text-gray-500 hover:text-gray-900">
                        &larr; Back to Ads
                    </Link>
                    <h1 className="text-3xl font-bold">Affiliate Manager</h1>
                </div>

                <div className="flex justify-between items-center mb-8">
                    <p className="text-gray-600">Manage recommended links for each category.</p>
                    <button onClick={() => {
                        setIsCreating(!isCreating);
                        if (!isCreating) {
                            setEditingId(null);
                            setNewItem({ label: '', url: '', description: '', color: 'bg-blue-600 hover:bg-blue-700 text-white', category: undefined, is_active: true });
                        }
                    }} className="btn btn-primary">
                        {isCreating ? 'Cancel' : '+ New Affiliate Link'}
                    </button>
                </div>

                {isCreating && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8 fade-in">
                        <h3 className="text-xl font-semibold mb-4">{editingId ? 'Edit Affiliate Link' : 'New Affiliate Link'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Label (Button Text)</label>
                                    <input className="w-full border p-2 rounded" value={newItem.label} onChange={e => setNewItem({ ...newItem, label: e.target.value })} required placeholder="e.g. Bet on DraftKings" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Target URL</label>
                                    <input className="w-full border p-2 rounded" value={newItem.url} onChange={e => setNewItem({ ...newItem, url: e.target.value })} required placeholder="https://..." />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description (Tooltip/Alt)</label>
                                <input className="w-full border p-2 rounded" value={newItem.description || ''} onChange={e => setNewItem({ ...newItem, description: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Visual Style (Tailwind Classes)</label>
                                    <input className="w-full border p-2 rounded font-mono text-sm" value={newItem.color || ''} onChange={e => setNewItem({ ...newItem, color: e.target.value })} placeholder="bg-blue-600 text-white..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Category Target</label>
                                    <select className="w-full border p-2 rounded" value={newItem.category || ''} onChange={e => setNewItem({ ...newItem, category: e.target.value as any || null })}>
                                        <option value="">Global (All Categories)</option>
                                        <option value="sports">Sports</option>
                                        <option value="politics">Politics</option>
                                        <option value="financial-markets">Finance</option>
                                        <option value="entertainment">Entertainment</option>
                                        <option value="technology">Technology</option>
                                        <option value="world-events">World Events</option>
                                        <option value="not-on-my-bingo">Bingo</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary w-full">{editingId ? 'Update Affiliate Link' : 'Save Affiliate Link'}</button>
                        </form>
                    </div>
                )}

                <div className="space-y-4">
                    {affiliates.map(item => (
                        <div key={item.id} className={`bg-white p-4 rounded-lg shadow border-l-4 ${item.is_active ? 'border-green-500' : 'border-gray-300'} flex items-center justify-between`}>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-lg">{item.label}</h3>
                                    {item.category && <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full uppercase">{item.category}</span>}
                                    {!item.is_active && <span className="text-gray-400 text-xs italic">(Inactive)</span>}
                                </div>
                                <div className="text-sm text-gray-600 truncate max-w-md flex items-center gap-2">
                                    <a href={item.url} target="_blank" className="text-blue-500 hover:underline">{item.url}</a>
                                    {item.description && <span className="text-gray-400 border-l pl-2">{item.description}</span>}
                                </div>
                                <div className="mt-2 text-xs font-mono text-gray-400 bg-gray-50 inline-block px-1 rounded">
                                    Class: {item.color}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => toggleActive(item.id, item.is_active)} className={`px-3 py-1 rounded text-sm font-medium ${item.is_active ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                                    {item.is_active ? 'Disable' : 'Enable'}
                                </button>
                                <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700 p-2">
                                    ✏️
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 p-2">
                                    🗑
                                </button>
                            </div>
                        </div>
                    ))}
                    {affiliates.length === 0 && !loading && <p className="text-center text-gray-500">No affiliate links found.</p>}
                </div>
            </main>
        </div>
    );
}
