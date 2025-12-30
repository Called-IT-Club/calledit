import { useEffect, useRef } from "react";
import { Advertisement } from "@/types";

interface SponsoredCardProps {
    ad: Advertisement;
}

export default function SponsoredCard({ ad }: SponsoredCardProps) {
    const hasViewed = useRef(false);

    useEffect(() => {
        // Simple View Tracking (fires once per mount)
        if (!hasViewed.current) {
            fetch('/api/ads/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adId: ad.id, type: 'view' })
            }).catch(e => console.error('Track View Error:', e));
            hasViewed.current = true;
        }
    }, [ad.id]);

    const handleClick = () => {
        fetch('/api/ads/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adId: ad.id, type: 'click' })
        }).catch(e => console.error('Track Click Error:', e));
    };

    return (
        <div className="card p-5 border border-gray-100 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 bg-gray-100 dark:bg-gray-700">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Promoted</span>
                    </div>

                    <h3 className="text-lg font-semibold mb-2">
                        {ad.title}
                    </h3>
                    {ad.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                            {ad.description}
                        </p>
                    )}

                    <a
                        href={ad.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleClick}
                        className="btn bg-green-600 hover:bg-green-700 text-white w-full text-center block text-sm py-2.5"
                    >
                        {ad.cta_text || 'Learn More'}
                    </a>
                </div>
                {ad.image_url && (
                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                    </div>
                )}
            </div>
        </div>
    );
}
