const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, 'data', 'predictions.json');

// Helper to read data
const readData = () => {
    const raw = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(raw);
};

// Helper to write data
const writeData = (data) => {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// Get user profile
app.get('/api/users/:id', (req, res) => {
    const data = readData();
    const user = data.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
});

// Follow user
app.post('/api/users/:id/follow', (req, res) => {
    const data = readData();
    const { currentUserId } = req.body;
    const targetUserId = req.params.id;

    const userIndex = data.users.findIndex(u => u.id === currentUserId);
    if (userIndex === -1) return res.status(404).json({ error: 'Current user not found' });

    const currentUser = data.users[userIndex];
    if (!currentUser.following) currentUser.following = [];

    if (!currentUser.following.includes(targetUserId)) {
        currentUser.following.push(targetUserId);
        writeData(data);
    }

    res.json(currentUser);
});

// Unfollow user
app.post('/api/users/:id/unfollow', (req, res) => {
    const data = readData();
    const { currentUserId } = req.body;
    const targetUserId = req.params.id;

    const userIndex = data.users.findIndex(u => u.id === currentUserId);
    if (userIndex === -1) return res.status(404).json({ error: 'Current user not found' });

    const currentUser = data.users[userIndex];
    if (currentUser.following) {
        currentUser.following = currentUser.following.filter(id => id !== targetUserId);
        writeData(data);
    }

    res.json(currentUser);
});

// Get all predictions for a user
app.get('/api/predictions', (req, res) => {
    const userId = req.query.userId || 'user-1'; // Default to demo user
    const data = readData();
    const userPredictions = data.predictions.filter(p => p.userId === userId);
    res.json(userPredictions);
});

// Get single prediction (for sharing)
app.get('/api/predictions/share/:id', (req, res) => {
    const data = readData();
    const prediction = data.predictions.find(p => p.id === req.params.id);

    if (!prediction) {
        return res.status(404).json({ error: 'Prediction not found' });
    }

    res.json(prediction);
});

// Create new prediction
app.post('/api/predictions', (req, res) => {
    const data = readData();
    const newPrediction = {
        id: `pred-${Date.now()}`,
        userId: req.body.userId || 'user-1',
        category: req.body.category,
        prediction: req.body.prediction,
        createdAt: new Date().toISOString(),
        targetDate: req.body.targetDate,
        outcome: 'pending',
        shareUrl: `${req.protocol}://${req.get('host')}/share/pred-${Date.now()}`
    };

    data.predictions.push(newPrediction);
    writeData(data);

    res.status(201).json(newPrediction);
});

// Update prediction outcome
app.patch('/api/predictions/:id', (req, res) => {
    const data = readData();
    const index = data.predictions.findIndex(p => p.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ error: 'Prediction not found' });
    }

    data.predictions[index] = {
        ...data.predictions[index],
        outcome: req.body.outcome,
        evidenceImageUrl: req.body.evidenceImageUrl || data.predictions[index].evidenceImageUrl
    };

    writeData(data);
    res.json(data.predictions[index]);
});

// Delete prediction
app.delete('/api/predictions/:id', (req, res) => {
    const data = readData();
    const index = data.predictions.findIndex(p => p.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ error: 'Prediction not found' });
    }

    data.predictions.splice(index, 1);
    writeData(data);

    res.status(204).send();
});

// AI Parse Endpoint (Proxy to Ollama)
app.post('/api/ai/parse', async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    console.log('🤖 AI Processing:', text);

    try {
        const prompt = `
            You are a prediction parser. Extract structured data from the text.
            
            Return JSON with:
            1. category: (one of: 'sports', 'world-events', 'financial-markets', 'politics', 'entertainment', 'technology', 'not-on-my-bingo')
            2. targetDate: (YYYY-MM-DD format, relative to today ${new Date().toISOString().split('T')[0]})
            3. meta: {
                tags: string[],      // General keywords (e.g. "NBA", "Crypto", "Election")
                entities: string[],  // Specific names/teams/stocks (e.g. "Lakers", "Bitcoin", "Trump")
                subject: string,     // Primary actor (e.g. "Lakers")
                action: string,      // What will happen (e.g. "win championship")
                confidence: number   // 0.0 to 1.0 (how confident you are in this parsing)
            }

            Rules:
            - If no date is mentioned, use one year from today.
            - Default category is 'not-on-my-bingo'.
            - Return ONLY JSON. No markdown.

            Text: "${text}"
        `;

        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3.2',
                prompt: prompt,
                stream: false,
                format: 'json'
            })
        });

        if (!response.ok) {
            throw new Error('Ollama connection failed');
        }

        const data = await response.json();
        console.log('🤖 Ollama Response:', data.response);

        try {
            const parsed = JSON.parse(data.response);
            res.json(parsed);
        } catch (e) {
            console.error('Failed to parse (trying cleanup):', data.response);
            // Fallback: try to find JSON in the text
            const match = data.response.match(/\{[\s\S]*\}/);
            if (match) {
                res.json(JSON.parse(match[0]));
            } else {
                throw new Error('Could not parse JSON from AI response');
            }
        }

    } catch (error) {
        console.error('AI Error:', error);
        // Fallback mock response if AI fails (so app doesn't break during dev)
        res.json({
            category: 'not-on-my-bingo',
            targetDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Mock API running on http://localhost:${PORT}`);
});
