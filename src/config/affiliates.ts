import { PredictionCategory } from '@/types';

export interface AffiliateLink {
    label: string;
    url: string;
    description: string;
    color: string;
}

export const AFFILIATE_LINKS: Partial<Record<PredictionCategory, AffiliateLink>> = {
    'financial-markets': {
        label: "Trade on eToro",
        url: "https://www.etoro.com",
        description: "Capitalize on your market insights",
        color: "bg-green-600 hover:bg-green-700 text-white"
    },
    'sports': {
        label: "Bet on DraftKings",
        url: "https://www.draftkings.com",
        description: "Place a wager on this game",
        color: "bg-blue-600 hover:bg-blue-700 text-white"
    },
    'world-events': {
        label: "Search Google News",
        url: "https://news.google.com",
        description: "Read more context",
        color: "bg-gray-600 hover:bg-gray-700 text-white"
    },
    'politics': {
        label: "See Latest Polls",
        url: "https://projects.fivethirtyeight.com/polls/",
        description: "Track the data",
        color: "bg-orange-600 hover:bg-orange-700 text-white"
    },
    'entertainment': {
        label: "Get Tickets",
        url: "https://www.fandango.com",
        description: "Don't miss the show",
        color: "bg-pink-600 hover:bg-pink-700 text-white"
    },
    'technology': {
        label: "Shop Latest Tech",
        url: "https://www.bestbuy.com",
        description: "Upgrade your gear",
        color: "bg-indigo-600 hover:bg-indigo-700 text-white"
    }
};
