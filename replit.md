# SydAI Chat Application

## Overview

SydAI is a chat application with AI integration that features a gamification system based on user points and leaderboards. Users can chat with an AI assistant, complete daily check-ins to earn points, and compete on a leaderboard. The application includes a notification system and customizable user settings.

**Tech Stack:**
- Frontend: React with TypeScript, Vite
- UI Framework: shadcn/ui with Radix UI components
- Styling: Tailwind CSS with custom luxury gold gradient design system
- Backend: Express.js
- Database ORM: Drizzle ORM (configured for PostgreSQL)
- State Management: TanStack Query (React Query)
- Routing: Wouter

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Component Structure:**
- Uses shadcn/ui component library with custom "new-york" style configuration
- Component organization follows path aliases: `@/components`, `@/lib`, `@/hooks`
- Design system implements a hybrid luxury aesthetic with strategic gold gradient accents
- Theme system supports both light and dark modes with persistent storage

**Routing:**
- Client-side routing using Wouter (lightweight alternative to React Router)
- Main routes: Chat (`/`), Leaderboard (`/leaderboard`), Notifications (`/notifications`), Settings (`/settings`)
- Sidebar navigation with social media links integration

**State Management:**
- TanStack Query for server state and API data fetching
- Custom hooks pattern for reusable logic (mobile detection, toast notifications)
- React Context API for theme provider functionality

**Design System:**
- Custom color palette with luxury gold gradients (`#D4AF37` to `#FFD700`)
- Typography: Inter (primary), Poppins (display headings)
- Consistent spacing using Tailwind CSS utilities
- Custom elevation system with hover and active states
- Border radius customization (lg: 9px, md: 6px, sm: 3px)

### Backend Architecture

**Server Framework:**
- Express.js server with TypeScript
- Vite middleware integration for development with HMR support
- Custom logging middleware for API request tracking
- JSON body parsing with raw body preservation for webhooks

**Storage Layer:**
- In-memory storage implementation (`MemStorage`) as default
- Interface-based design (`IStorage`) allows easy swapping to database implementations
- Supports user management, messages, notifications, and settings

**API Design:**
- RESTful API endpoints under `/api` prefix
- Demo user system (single default user for demonstration purposes)
- Points-based gamification (message sending, daily check-ins)
- Pagination support for leaderboard

**Key API Endpoints:**
- `GET/POST /api/messages` - Chat message operations
- `POST /api/checkin` - Daily check-in system
- `GET /api/leaderboard` - Paginated leaderboard data
- `GET/POST/PATCH/DELETE /api/notifications` - Notification management
- `GET/PATCH /api/settings` - User settings management

### Data Model

**Core Entities:**
- **Users**: ID, username, password, points, last check-in timestamp, avatar URL
- **Messages**: ID, user ID, content, sender flag (user/AI), timestamp
- **Notifications**: ID, user ID, title, message, read status, timestamp
- **Settings**: ID, user ID, theme preference, notification preferences
- **Leaderboard**: Derived from users table, sorted by points

**Database Schema:**
- PostgreSQL dialect configured via Drizzle ORM
- UUID primary keys with automatic generation
- Foreign key relationships between users and related entities
- Timestamp tracking for all entities

### External Dependencies

**UI Component Library:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui configuration and component patterns
- Component categories: Accordion, Alert Dialog, Avatar, Badge, Button, Calendar, Card, Carousel, Chart, Checkbox, Dialog, Dropdown Menu, Form, Input, Select, Tabs, Toast, Tooltip, and more

**Styling and Design:**
- Tailwind CSS with custom configuration
- PostCSS for CSS processing
- Google Fonts integration (Inter, Poppins)
- Class Variance Authority (CVA) for variant-based styling

**Data Fetching:**
- TanStack Query v5 for server state management
- Custom query client with credential-based requests
- Automatic cache invalidation patterns

**Form Handling:**
- React Hook Form with Zod schema validation
- @hookform/resolvers for schema integration
- Drizzle-Zod for database schema to Zod schema conversion

**Database:**
- Drizzle ORM for type-safe database operations
- Neon Database serverless driver (@neondatabase/serverless)
- Migration system via drizzle-kit
- Connection pooling with connect-pg-simple for sessions

**Utility Libraries:**
- date-fns for date formatting and manipulation
- clsx and tailwind-merge for className composition
- nanoid for unique ID generation
- Lucide React for icons
- React Icons for social media icons

**Development Tools:**
- Vite for build tooling and development server
- esbuild for server-side bundling
- tsx for TypeScript execution
- Replit-specific plugins for development environment integration

**Build and Deployment:**
- Separate client and server build processes
- Static file serving in production
- Environment variable based configuration (DATABASE_URL)
- SSR-ready architecture with Vite SSR mode