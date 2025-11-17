# SydAI Chat Application - Design Guidelines

## Design Approach

**Selected Approach**: Hybrid - Premium design system with luxury aesthetics
- Base: Modern productivity app patterns (Discord, Slack inspiration)
- Enhancement: Luxurious gold gradient treatment throughout
- Focus: Balance premium aesthetics with functional clarity

## Core Design Principles

1. **Luxury Through Restraint**: Gold accents are powerful - use strategically, not everywhere
2. **Functional Elegance**: Premium appearance never compromises usability
3. **Smooth Interactions**: Polished transitions create premium feel
4. **Clear Hierarchy**: Important actions stand out through size and placement

---

## Color Strategy

### Light Mode
- **Primary Background**: Pure white (#FFFFFF)
- **Secondary Background**: Soft warm gray (#F8F7F5)
- **Gold Gradient Primary**: Linear gradient from warm gold (#D4AF37) to rich amber (#FFD700)
- **Gold Gradient Accent**: Lighter gold (#F4E5C2) to medium gold (#E6C84F)
- **Text Primary**: Rich charcoal (#1A1A1A)
- **Text Secondary**: Medium gray (#666666)

### Dark Mode
- **Primary Background**: Deep black (#0A0A0A)
- **Secondary Background**: Elevated black (#1A1A1A)
- **Gold Gradient Primary**: Same luxury gold gradient (#D4AF37 to #FFD700)
- **Gold Gradient Accent**: Muted gold (#B8963D) to warm gold (#D4AF37)
- **Text Primary**: Pure white (#FFFFFF)
- **Text Secondary**: Soft gray (#CCCCCC)

### Application Rules
- **Gradients**: Apply to key interactive elements (primary buttons, active nav items, important badges)
- **Backgrounds**: Use subtle gold tints (5-10% opacity) for hover states
- **Borders**: Gold gradients at 20-30% opacity for premium containers
- **Never**: Full gold backgrounds - always use as accents

---

## Typography

**Font Stack**: 
- Primary: Inter (Google Fonts) - clean, modern, professional
- Display: Poppins (Google Fonts) - for headings and brand elements

**Hierarchy**:
- Brand/Logo (SydAI): text-2xl md:text-3xl, font-bold, Poppins
- Page Titles: text-xl md:text-2xl, font-semibold
- Section Headers: text-lg font-semibold
- Body Text: text-base font-normal
- Captions/Meta: text-sm, slightly muted
- Leaderboard Numbers: text-3xl md:text-4xl, font-bold, gradient text fill

---

## Layout System

**Spacing Units**: Tailwind spacing - 2, 4, 6, 8, 12, 16, 24
- Compact spacing: 2, 4 (between related items)
- Standard spacing: 6, 8 (component padding, gaps)
- Section spacing: 12, 16, 24 (between major sections)

**Layout Structure**:
- Sidebar navigation: Fixed left, 280px wide on desktop, collapsible on mobile
- Main content area: Full height with 6-8 internal padding
- Maximum content width: None (full available space)
- Grid gaps: 4 for tight layouts, 6 for standard spacing

---

## Component Library

### Navigation Sidebar
- **Structure**: Fixed left panel, full height
- **Background**: Dark mode (#1A1A1A), Light mode (#F8F7F5)
- **Active Item**: Gold gradient background, white text, rounded-lg
- **Inactive Items**: Subtle hover with gold tint (10% opacity)
- **Logo Area**: Top section with SydAI branding, gold gradient text effect
- **Social Icons Section**: Bottom left, above logout button
  - Icons: X (Twitter), Discord, Telegram, YouTube
  - Layout: Horizontal row with 3-4 gap
  - Size: 20x20px icons
  - Hover: Gold gradient fill
- **Copyright**: Absolute bottom, text-xs, centered, muted text color
  - Text: "© SydAI 2025"
  - Padding: 4 from bottom

### Menu Items Order (Top to Bottom)
1. SydAI (Chat) - with chat bubble icon
2. Leaderboard - with trophy icon
3. Notifications - with bell icon
4. Settings - with gear icon
5. [Spacer]
6. Social Icons (X, Discord, Telegram, YouTube)
7. Logout Button
8. Copyright Text

### Chat Interface
- **Header**: "Chat with SydAI and complete your daily check-in to get points!"
- **Message Bubbles**: 
  - User: Right-aligned, gold gradient background, white text, rounded-2xl
  - SydAI: Left-aligned, secondary background, primary text, rounded-2xl
  - Avatar: 40x40px circle for SydAI responses
- **Input Field**: Bottom-fixed, elevated with subtle shadow, rounded-full design
- **Send Button**: Gold gradient, circular, icon-based

### Leaderboard
- **Header Section**: 
  - Title with trophy icon
  - Subtitle showing total registered users: "1,000+ registered users"
- **Rank Cards (1-10)**:
  - Card design: Elevated with subtle shadow, rounded-lg
  - Top 3 special treatment: Larger size, gold/silver/bronze accent borders
  - Layout: Rank number (large, gradient), username, points value
  - Point display: Gold gradient text
- **Pagination**: 
  - Bottom right placement
  - "Next" button with gold gradient on hover
  - Page indicator: "1-10 of [total]"
- **Spacing**: 4 gap between rank cards

### Buttons
- **Primary (Gold)**: Gold gradient background, white text, hover: brightness increase, rounded-lg
- **Secondary**: Border with gold gradient, transparent background, gold text, hover: subtle gold fill
- **Icon Buttons**: Circular or square with rounded-lg, hover: gold tint background
- **Button Sizes**: 
  - Large: px-8 py-3, text-base
  - Medium: px-6 py-2, text-sm
  - Small: px-4 py-2, text-xs

### Cards & Containers
- **Elevated Cards**: Subtle shadow, rounded-xl, padding 6-8
- **Premium Cards** (Top 3 leaderboard): Gold gradient border (2px), enhanced shadow
- **Hover States**: Slight scale (1.02), shadow increase, gold border glow

---

## Animations & Transitions

**Use Sparingly - Premium Subtlety**:
- **Page Transitions**: Fade in (300ms ease-in-out)
- **Button Hovers**: Scale 1.05, 200ms ease-out
- **Gradient Shifts**: Animate gradient position on hover (500ms)
- **Rank Cards**: Stagger fade-in on load (100ms delay each)
- **Message Bubbles**: Slide up + fade in (250ms)

**Never Animate**:
- Continuous pulsing or spinning
- Aggressive parallax effects
- Auto-playing carousels

---

## Icons

**Library**: Heroicons (outline for navigation, solid for actions)
- CDN: `https://cdn.jsdelivr.net/npm/heroicons@2.0.18/outline/`
- Navigation: 24x24px
- Actions: 20x20px
- Social media: 20x20px (use brand colors on hover)

---

## Responsive Behavior

- **Desktop (lg+)**: Full sidebar visible, multi-column leaderboard possible
- **Tablet (md)**: Collapsible sidebar, single-column content
- **Mobile (base)**: Hamburger menu, bottom navigation option, stacked layouts
- **Breakpoint Strategy**: Mobile-first, enhance for larger screens

---

## Premium UI Touches

1. **Gradient Text**: Apply to SydAI branding, leaderboard numbers, point values
2. **Glassmorphism**: Subtle backdrop blur on modals/overlays
3. **Micro-interactions**: Gold sparkle on check-in complete, subtle bounce on button press
4. **Shadows**: Multi-layer shadows for depth (combine soft + sharp shadows)
5. **Border Treatments**: Gold gradient borders for premium elements (0.5-1px)

---

## Key Screens Layout

### Chat Screen
- Full-height layout
- Header with greeting and points prompt
- Scrollable message area (flex-1)
- Fixed bottom input with gold gradient send button

### Leaderboard Screen
- Header with total user count badge
- Grid of rank 1-10 cards
- Pagination controls bottom-right
- Top 3 prominently featured with larger cards

### Settings Screen (New)
- Vertical list of setting categories
- Toggle switches with gold gradient active state
- Theme selector (Light/Dark) with visual preview
- Profile section at top