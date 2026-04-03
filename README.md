# QuantTrade Pro

A professional F&O Intraday Trading SaaS Platform with AI Signals.

## Features
- **Intraday F&O Screener**: Detects top bullish and bearish stocks based on OI, Volume, and Momentum.
- **AI Probability Scoring**: Scores trades from 0-100% using weighted metrics.
- **Smart Position Sizing**: Calculates recommended position size based on risk parameters.
- **Pro Auto-Trading**: Mock integration for automated execution.
- **Admin Control Panel**: Manage users, plans, and a global kill switch.

## Tech Stack
- **Frontend & Backend**: Next.js (App Router), React, Tailwind CSS
- **Authentication**: JWT (Mocked)
- **Database**: In-memory (Mocked for preview environment)
- **Deployment**: Docker & Nginx (Configurations provided in `/infra`)

## Getting Started

### Local Development
1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000)

### Docker Deployment
1. Navigate to the `infra` directory.
2. Run `docker-compose up -d --build`.
3. Access the application via Nginx on port 80.

## Default Admin Account
- **Email**: admin@quant.com
- **Password**: admin123
