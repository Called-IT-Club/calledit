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
└── public/                     # Static assets
```

## License

MIT
