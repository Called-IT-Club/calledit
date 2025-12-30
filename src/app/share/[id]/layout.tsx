
import { Metadata } from 'next';

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    // Fallback to localhost if env var not set (for dev), implies production url should be set in real app
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const imageUrl = `${baseUrl}/share/${id}/image`;

    return {
        openGraph: {
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: 'Called It Prediction',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            images: [imageUrl],
        },
    };
}

export default function ShareLayout({ children }: { children: React.ReactNode }) {
    return children;
}
