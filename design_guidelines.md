# Design Guidelines: AI Chat Website with Gamification

## Design Approach
**System-Based Approach** using Material Design principles, tailored for a utility-focused chat application with gamification elements. This ensures consistency, accessibility, and scalability while supporting the interactive nature of real-time chat and point tracking.

**Core Design Principles:**
- Clarity over decoration - information hierarchy is paramount
- Immediate feedback for all user actions
- Seamless transitions between chat, dashboard, and leaderboard
- Progressive disclosure of complex features
- Mobile-first responsive design

---

## Typography System

**Font Stack:**
- Primary: Inter (via Google Fonts CDN) - body text, UI elements
- Accent: Poppins (via Google Fonts CDN) - headings, emphasis

**Hierarchy:**
- H1: Poppins, 2.5rem (40px), weight 700 - Page titles
- H2: Poppins, 2rem (32px), weight 600 - Section headers  
- H3: Poppins, 1.5rem (24px), weight 600 - Card titles
- H4: Poppins, 1.25rem (20px), weight 500 - Subsections
- Body Large: Inter, 1.125rem (18px), weight 400 - Primary content
- Body: Inter, 1rem (16px), weight 400 - Default text
- Body Small: Inter, 0.875rem (14px), weight 400 - Captions, metadata
- Caption: Inter, 0.75rem (12px), weight 400 - Timestamps, labels

---

## Layout & Spacing System

**Tailwind Spacing Primitives:** Use units of 2, 4, 8, 12, 16, 24
- Tight spacing: p-2, m-2 (8px) - Between closely related items
- Standard spacing: p-4, m-4 (16px) - Default component padding
- Generous spacing: p-8, gap-8 (32px) - Section separation
- Extra spacing: p-12, p-16 (48-64px) - Major layout divisions

**Responsive Breakpoints:**
- Mobile: base (< 768px) - Single column, stacked navigation
- Tablet: md (768px+) - Two column where appropriate
- Desktop: lg (1024px+) - Full multi-column layouts

**Container Strategy:**
- Chat interface: Full width with max-w-4xl centered
- Dashboard: max-w-7xl with grid layouts
- Forms: max-w-md centered

---

## Component Library

### Navigation
**Top Navigation Bar:**
- Fixed position with backdrop blur
- Logo/brand (left), main nav links (center), user profile + notifications (right)
- Mobile: Hamburger menu with slide-in drawer
- Height: h-16 (64px)
- Include notification badge counter (absolute positioned, small circle)

### Chat Interface
**Message Container:**
- User messages: Right-aligned, rounded-2xl, max-w-md
- AI messages: Left-aligned, rounded-2xl, max-w-md  
- Spacing between messages: gap-4
- Include avatar icons (w-8 h-8 rounded-full)
- Timestamps below messages (text-xs, opacity-70)

**Chat Input Area:**
- Sticky bottom position
- Input field with rounded-full borders, p-4 padding
- Send button integrated inline (absolute right-2)
- Typing indicator: Three animated dots when AI is "typing"

**Check-in Flow:**
- Large centered card for START/CHECK-IN prompts
- Success state: Confetti animation + points display (text-4xl, font-bold)
- Progress indicator showing streak/weekly completion

### Dashboard
**Statistics Cards Grid:**
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Each card: rounded-xl, p-6, shadow-lg
- Icon + metric + label layout
- Hover: Subtle lift effect (transform scale-105)

**Metrics Display:**
- Total Points: Large emphasized number (text-5xl)
- Daily Streak: Fire icon + number
- Referrals: Users icon + count
- Rank Position: Trophy icon + position

**Progress Visualization:**
- Weekly check-in progress: Horizontal segmented bar (7 segments for days)
- Each day: w-12 h-12 rounded square, filled/unfilled states
- Include day labels (M, T, W, T, F, S, S)

### Leaderboard
**Leaderboard Table:**
- Header with toggle tabs: "Weekly" / "All Time"
- Top 3 users: Highlighted with medals (🥇🥉🥉), larger cards
- Remaining users: Compact list items (flex justify-between)
- Current user: Highlighted row with border emphasis
- Columns: Rank | Avatar + Name | Points | Badge (if top 10)

**Ranking Cards (Top 3):**
- Grid: grid-cols-1 md:grid-cols-3
- Podium visual hierarchy: 2nd place left, 1st center (larger), 3rd right
- Include animated number counters on load

### Referral Section
**Referral Dashboard:**
- Hero card showing referral code (text-3xl, font-mono, letter-spacing-wide)
- Copy button with success state animation
- QR code display (w-48 h-48, centered)
- Share buttons row: WhatsApp, Twitter, Email, Copy Link
- Statistics below: Total referrals | Active referrals | Points earned

**Referral Activity List:**
- Timeline layout with vertical line connector
- Each entry: Avatar + Name + Action + Timestamp + Points badge
- Use relative time ("2 hours ago")

### Notifications Panel
**Notification Dropdown:**
- Triggered from nav bar bell icon
- Overlay panel: w-96, max-h-96, overflow-y-auto
- Each notification: p-4, border-b, hover state
- Unread: Bold title, filled indicator dot
- Read: Normal weight, hollow indicator
- Action buttons: Mark as read, Clear all

**Notification Items:**
- Icon (type-specific) + Title + Message + Timestamp
- Types: Check-in success, Referral bonus, Leaderboard update, Reminders

### Forms (Auth)
**Login/Register Pages:**
- Centered card: max-w-md, rounded-2xl, p-8, shadow-2xl
- Logo at top (centered, mb-8)
- Input fields: rounded-lg, p-3, w-full, mb-4
- Labels: text-sm, font-medium, mb-2
- Submit button: w-full, rounded-lg, p-3, font-semibold
- Toggle link at bottom: "Don't have an account? Register"
- Include referral code field on register (optional appearance)

**Input States:**
- Default: Border standard width
- Focus: Ring outline, border highlighted
- Error: Border error state, helper text below (text-sm, text-red-600)
- Success: Border success state, checkmark icon

### Modals & Overlays
**Modal Structure:**
- Backdrop: Fixed inset-0, backdrop-blur-sm
- Content: max-w-lg, rounded-2xl, p-6, centered
- Header with close button (absolute top-4 right-4)
- Content area with appropriate padding
- Action buttons at bottom (flex justify-end gap-3)

### Buttons
**Primary Button:**
- rounded-lg, px-6, py-3, font-semibold
- Hover: Brightness adjustment + subtle scale
- Disabled: Reduced opacity, cursor-not-allowed

**Secondary Button:**
- Outlined variant with border-2
- Same dimensions as primary
- Hover: Filled state transition

**Icon Buttons:**
- w-10 h-10, rounded-full, flex items-center justify-center
- Used for actions like copy, share, close

### Toast Notifications
**Position:** Fixed top-right, stack vertically with gap-2
**Structure:** rounded-lg, p-4, shadow-lg, max-w-sm
**Types:** Success (green accent), Error (red accent), Info (blue accent), Warning (yellow accent)
**Animation:** Slide in from right, auto-dismiss after 5s with progress bar

### Loading States
**Skeleton Screens:**
- Use for initial data loads (leaderboard, chat history)
- Animated gradient shimmer effect
- Match actual content structure

**Spinners:**
- Centered for full-page loads
- Inline for button actions (w-5 h-5)

---

## Responsive Behavior

**Mobile (< 768px):**
- Stack all grid layouts to single column
- Bottom navigation bar for main sections (fixed bottom-0)
- Full-width chat interface
- Compact dashboard cards
- Drawer navigation from hamburger

**Tablet (768px - 1024px):**
- Two-column grid for dashboard
- Side-by-side leaderboard view (top 3 + list)
- Chat maintains centered layout with max-width

**Desktop (1024px+):**
- Multi-column layouts fully utilized
- Sidebar navigation option (persistent left nav)
- Chat can show history panel alongside (split view)
- Larger spacing throughout (p-8 instead of p-4)

---

## Interactive Elements & Feedback

**Hover States:**
- Subtle scale transform (scale-105) for cards
- Opacity change for icons/buttons (opacity-80)
- Background fill for outlined buttons

**Active States:**
- Scale down slightly (scale-95) for tactile feedback
- Brief color intensity increase

**Transitions:**
- Use transition-all duration-200 for most interactions
- Page transitions: Fade + slight scale (0.97 to 1)
- Drawer/modal: Slide animations (translate-x-full to 0)

**Micro-interactions:**
- Check-in success: Confetti burst from center
- Points gained: Number count-up animation
- Leaderboard rank change: Slide up/down animation
- Copy action: Brief "Copied!" tooltip appearance
- Notification receive: Gentle shake + badge pulse

---

## Icons
**Library:** Heroicons (via CDN)
**Usage:**
- Outline style for navigation and non-active states
- Solid style for active states and emphasis
- Size: w-5 h-5 for inline, w-6 h-6 for standalone, w-8 h-8 for featured

---

## Accessibility
- All interactive elements: min-h-11 (44px touch target)
- Focus rings visible on all focusable elements
- ARIA labels on icon-only buttons
- Keyboard navigation support throughout
- Color contrast meets WCAG AA standards (maintained through existing color scheme)
- Form validation with clear error messaging

---

## Special Considerations
- **Real-time Updates:** Use pulse animation for live data changes
- **Empty States:** Friendly illustrations/messages when no data (e.g., "No notifications yet")
- **Error States:** Clear error boundaries with retry actions
- **Offline Indicator:** Banner at top when connection lost
- **Session Persistence:** Show "Session expires in..." warning modal before timeout