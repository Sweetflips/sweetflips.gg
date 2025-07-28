# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git Commit Guidelines

- When generating commit messages, leave off the lines:
  - `🤖 Generated with Claude Code`
  - `Co-Authored-By: Claude <noreply@anthropic.com>`
- Aim to create comprehensive commits with detailed, descriptive messages

## Branch Management

- Only push to the dashboard-tg-crm branch for now, not the main branch

## Common Development Commands

### Development Server
```bash
npm run dev  # Start development server on http://localhost:3000
```

### Build and Deployment
```bash
npm run build          # Build for production
npm run start          # Start production server
npm run vercel-build   # Build for Vercel deployment (includes Prisma generation)
```

### Code Quality
```bash
npm run lint           # Run ESLint
```

### Database Operations
```bash
npx prisma generate    # Generate Prisma client (runs automatically on postinstall)
npx prisma migrate dev # Apply database migrations
npx prisma studio      # Open Prisma Studio for database management
```

## Project Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth with custom Kick.com OAuth integration
- **Styling**: Tailwind CSS with DaisyUI components
- **State Management**: Zustand and React Context

### Key Directory Structure
- `src/app/` - Next.js 14 App Router pages and layouts
- `src/components/` - React components organized by feature
- `src/pages/api/` - API routes (legacy Pages Router for APIs)
- `src/contexts/` - React Context providers (AuthContext, TokenContext)
- `lib/` - Utility functions and configurations
- `prisma/` - Database schema and migrations

### Database Models
- **User**: Main user accounts with token balances and Kick.com linking
- **UserData**: Extended user statistics from Botrix integration
- **Product/Order**: E-commerce system for token-based purchases
- **StreamSchedule**: Streaming schedule management
- **GiveawayCounter**: Site-wide giveaway counter
- **TokenSettings**: Configurable token conversion rates

### Authentication Flow
The application uses a hybrid authentication system:
1. **Supabase Auth**: Primary authentication for email/password users
2. **Kick.com OAuth**: Custom OAuth integration for Kick streamers
3. **Account Linking**: Users can link Kick accounts to existing accounts

### Key Features
- **Gaming Elements**: Plinko game, coinflip, fortune wheel
- **E-commerce**: Token-based shop system with digital products
- **Admin Panel**: User management, product management, schedule management
- **Leaderboards**: Integration with external APIs (Botrix, Luxdrop, Razed)
- **Live Status**: Real-time streaming status display

### External Integrations
- **Botrix API**: User statistics and leaderboard data
- **Kick.com API**: OAuth and streaming status
- **Luxdrop/Razed APIs**: Third-party leaderboards
- **Vercel Analytics**: Usage tracking

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SUPABASE_URL` and `SUPABASE_ANON_KEY`: Supabase configuration
- Various API keys for external integrations

### Component Organization
Components are organized by feature rather than type:
- Major features have their own directories (Plinko, Coinflip, Shop, etc.)
- Shared components in `common/` directory
- Admin components grouped together
- UI components (buttons, forms) in dedicated directories