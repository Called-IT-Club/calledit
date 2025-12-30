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

2. Install mock API dependencies:
```bash
cd mock-api
npm install
cd ..
```

### Running the App

You need to run both the Next.js app and the mock API server:

**Terminal 1 - Next.js App:**
```bash
npm run dev
```

**Terminal 2 - Mock API:**
```bash
cd mock-api
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend** (Development): Express.js mock API
- **AI**: Simple keyword-based categorization (ready for real AI integration)

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
├── mock-api/
│   ├── data/
│   │   └── predictions.json    # Mock data store
│   └── server.js               # Express API server
└── public/                     # Static assets
```

## License

MIT
