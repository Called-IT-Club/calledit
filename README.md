# I Call It

A simple, beautiful predictions app. Make your calls across sports, world events, stocks & markets, and personal predictions.

## Features

- 🎯 **AI-Powered Categorization**: Just type your prediction and let AI determine the category
- 📊 **Category-Based Organization**: Sports, World Events, Stocks & Markets, Personal predictions
- 🎉 **Celebration Animations**: Cards celebrate when your predictions come true!
- 📱 **Mobile-First Design**: Clean, responsive interface
- 🔗 **Simple Sharing**: Share your predictions with a single click

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```



### Running the App

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **AI**: Google Generative AI (Gemini 2.5 Flash Lite)

## API Documentation

All API routes are server-side and require authentication unless otherwise noted.

### Predictions

#### `POST /api/predictions`
Create a new prediction.

**Authentication**: Required

**Request Body**:
```json
{
  "prediction": "string (required)",
  "category": "sports | world-events | financial-markets | politics | entertainment | technology | not-on-my-bingo",
  "targetDate": "YYYY-MM-DD",
  "isPrivate": "boolean",
  "meta": {
    "tags": ["string"],
    "entities": ["string"],
    "subject": "string",
    "action": "string",
    "confidence": "number"
  }
}
```

**Response**: `{ prediction: Prediction }`

#### `PUT /api/predictions`
Update an existing prediction (outcome, evidence, or soft delete).

**Authentication**: Required (must own the prediction)

**Request Body**:
```json
{
  "id": "string (required)",
  "outcome": "correct | incorrect | pending",
  "evidenceImageUrl": "string",
  "deletedAt": "ISO timestamp (for soft delete)"
}
```

**Response**: `{ success: true }`

#### `DELETE /api/predictions?id={id}`
Soft delete a prediction.

**Authentication**: Required (must own the prediction)

**Response**: `{ success: true }`

#### `POST /api/predictions/analyze`
Analyze a prediction to determine its outcome status.

**Authentication**: Required

**Request Body**:
```json
{
  "predictionId": "string"
}
```

---

### AI Parsing

#### `POST /api/ai/parse`
Parse prediction text using AI to extract category, target date, and metadata.

**Authentication**: Required

**Request Body**:
```json
{
  "text": "string (max 280 characters)"
}
```

**Response**:
```json
{
  "category": "string",
  "targetDate": "YYYY-MM-DD",
  "meta": {
    "tags": ["string"],
    "entities": ["string"],
    "subject": "string",
    "action": "string",
    "confidence": "number"
  }
}
```

---

### Feed & Dashboard

#### `GET /api/feed?limit={limit}&cursor={cursor}`
Get public predictions feed with pagination.

**Authentication**: Optional (public endpoint)

**Query Parameters**:
- `limit`: Number of predictions to return (default: 20)
- `cursor`: Created timestamp for pagination

**Response**: `{ predictions: Prediction[] }`

#### `GET /api/dashboard`
Get all predictions for the authenticated user.

**Authentication**: Required

**Response**: `{ predictions: Prediction[] }`

---

### Advertisements

#### `GET /api/ads`
Get active advertisements.

**Authentication**: Optional

**Response**: `{ ads: Advertisement[] }`

#### `POST /api/ads/track`
Track advertisement interaction.

**Authentication**: Optional

**Request Body**:
```json
{
  "adId": "string",
  "action": "view | click"
}
```

---

### Affiliates

#### `GET /api/affiliates`
Get active affiliate links.

**Authentication**: Optional

**Response**: `{ affiliates: Affiliate[] }`

#### `POST /api/affiliates/track`
Track affiliate link click.

**Authentication**: Optional

**Request Body**:
```json
{
  "affiliateId": "string"
}
```

---

### Friends & Social

#### `GET /api/profiles/[userId]`
Get a user's public profile information.

**Authentication**: Not required

**Response**:
```json
{
  "profile": {
    "id": "string",
    "full_name": "string",
    "username": "string",
    "avatar_url": "string"
  }
}
```

#### `GET /api/friends/check?targetUserId={userId}`
Check if the authenticated user is following a target user.

**Authentication**: Required

**Query Parameters**:
- `targetUserId`: ID of the user to check

**Response**: `{ isFollowing: boolean }`

#### `POST /api/friends/follow`
Follow another user.

**Authentication**: Required

**Request Body**:
```json
{
  "targetUserId": "string"
}
```

**Response**: `{ success: true }`

---

### Admin (Protected)

#### `GET /api/admin/ads`
Get all advertisements (admin only).

**Authentication**: Required (admin role)

#### `POST /api/admin/ads`
Create or update advertisement (admin only).

**Authentication**: Required (admin role)

#### `GET /api/admin/affiliates`
Get all affiliate links (admin only).

**Authentication**: Required (admin role)

#### `POST /api/admin/affiliates`
Create or update affiliate link (admin only).

**Authentication**: Required (admin role)

---

### Other

#### `GET /api/og?prediction={text}`
Generate Open Graph image for sharing.

**Authentication**: Not required

**Query Parameters**:
- `prediction`: Prediction text to display

**Response**: PNG image

#### `POST /api/seed`
Seed database with sample data (development only).

**Authentication**: Required

## Project Structure

```
icallit/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── dashboard/          # Main dashboard
│   │   ├── globals.css         # Global styles & animations
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── predictions/        # Prediction components
│   │   │   ├── CategoryTabs.tsx
│   │   │   ├── PredictionCard.tsx
│   │   │   └── PredictionForm.tsx
│   └── types/                  # TypeScript types
└── public/                     # Static assets
```

## License

MIT
