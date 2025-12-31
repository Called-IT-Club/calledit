-- Seed Affiliates (Based on previous config)
INSERT INTO public.affiliates (label, url, description, color, category, is_active)
VALUES
    ('Trade on eToro', 'https://www.etoro.com', 'Capitalize on your market insights', 'bg-green-600 hover:bg-green-700 text-white', 'financial-markets', true),
    ('Bet on DraftKings', 'https://www.draftkings.com', 'Place a wager on this game', 'bg-blue-600 hover:bg-blue-700 text-white', 'sports', true),
    ('Search Google News', 'https://news.google.com', 'Read more context', 'bg-gray-600 hover:bg-gray-700 text-white', 'world-events', true),
    ('See Latest Polls', 'https://projects.fivethirtyeight.com/polls/', 'Track the data', 'bg-orange-600 hover:bg-orange-700 text-white', 'politics', true),
    ('Get Tickets', 'https://www.fandango.com', 'Don''t miss the show', 'bg-pink-600 hover:bg-pink-700 text-white', 'entertainment', true),
    ('Shop Latest Tech', 'https://www.bestbuy.com', 'Upgrade your gear', 'bg-indigo-600 hover:bg-indigo-700 text-white', 'technology', true),
    ('Generic Bingo', 'https://bingo.com', 'Play Bingo', 'bg-purple-600 hover:bg-purple-700 text-white', 'not-on-my-bingo', true);

-- Seed Advertisements
INSERT INTO public.advertisements (title, description, image_url, link_url, cta_text, category, is_active)
VALUES
    ('Premium Prediction Tools', 'Unlock advanced analytics for your predictions.', 'https://placehold.co/600x400/png', 'https://example.com/premium', 'Go Premium', NULL, true), -- Global Ad
    ('Sports Betting 101', 'Learn how to make smarter bets today.', 'https://placehold.co/600x400/png', 'https://example.com/sports-tips', 'Read Guide', 'sports', true),
    ('Tech Trends 2025', 'What is coming next in the world of AI?', 'https://placehold.co/600x400/png', 'https://example.com/tech-report', 'Download Report', 'technology', true);
