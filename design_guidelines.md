# Digital Notary - Design Guidelines

## Design Approach: Utility-First Professional System

**Selected Approach:** Design System with trust-centric principles
**Rationale:** Government/legal application requiring clarity, professionalism, and user confidence over visual experimentation. Information hierarchy and accessibility are paramount.

**Core Design Principles:**
- Trust through clarity and consistency
- Professional minimalism without sterility  
- Efficient information architecture
- Accessible to all user demographics
- Slovak language optimization with proper typography

---

## Core Design Elements

### A. Color Palette

**Primary Colors (Trust & Authority):**
- Primary Blue: 221 83% 53% (governmental trust, CTAs)
- Primary Dark: 222 47% 11% (headings, emphasis)
- Background: 220 13% 96% (light mode body)
- Surface White: 0 0% 100% (cards, containers)

**Dark Mode (Professional Night Reading):**
- Background: 222 47% 11%
- Surface: 217 33% 17%
- Primary Blue: 221 83% 63% (adjusted for contrast)

**Semantic Colors:**
- Success Green: 142 71% 45% (verified documents, active status)
- Warning Amber: 38 92% 50% (pending actions)
- Error Red: 0 84% 60% (invalid documents)
- Info Blue: 199 89% 48% (system messages)

**Neutral Scale:** Use Tailwind gray-50 through gray-900 for text hierarchy and borders

### B. Typography

**Font Family:**
- Primary: 'Inter' (already implemented via Google Fonts)
- Fallback: system-ui, -apple-system, sans-serif

**Type Scale:**
- Hero/H1: text-4xl font-bold (36px, legal document headers)
- H2: text-2xl font-semibold (24px, section titles)
- H3: text-lg font-semibold (18px, card headers)
- Body: text-base font-normal (16px, document content)
- Small: text-sm (14px, metadata, timestamps)
- Micro: text-xs (12px, status badges, helper text)

**Line Heights:** Use Tailwind defaults (leading-normal for body, leading-tight for headings)

### C. Layout System

**Spacing Primitives:** Use Tailwind units of **4, 6, 8** as primary rhythm
- Component padding: p-4, p-6 (mobile), p-6, p-8 (desktop)
- Section spacing: space-y-6, space-y-8
- Grid gaps: gap-4, gap-6
- Margins: mt-4, mb-6, mt-8

**Container Strategy:**
- Max width: max-w-4xl for forms, max-w-6xl for dashboards
- Responsive padding: px-4 (mobile), px-6 (tablet), px-8 (desktop)
- Centered containers with mx-auto

**Grid Patterns:**
- Document cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Form layouts: single column max-w-2xl
- Dashboard widgets: grid-cols-1 lg:grid-cols-2

### D. Component Library

**Navigation:**
- Top app bar with logo, user info, logout
- Breadcrumb navigation (Back arrows with text labels)
- Tab navigation for document categories

**Cards & Containers:**
- Document cards: white bg, rounded-xl, border border-gray-200, shadow-sm
- Status cards: bg-gray-50 with colored left border (4px) for category indication
- Hover state: hover:bg-gray-100 transition-colors

**Forms:**
- Input fields: border-gray-300, focus:border-indigo-500, focus:ring-2 focus:ring-indigo-200
- Labels: text-sm font-medium text-gray-700 mb-2
- Helper text: text-xs text-gray-500 mt-1
- Dark mode inputs: bg-gray-800 border-gray-600 text-white

**Buttons:**
- Primary: bg-indigo-600 hover:bg-indigo-700 text-white (document actions)
- Secondary: bg-gray-200 hover:bg-gray-300 text-gray-700 (navigation)
- Outline: border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 (alternative actions)
- Size: py-3 px-6 rounded-lg font-semibold

**Data Display:**
- Status badges: rounded-full px-3 py-1 text-xs font-medium (green/amber/red variants)
- Document lists: space-y-3 with hover:bg-gray-50 clickable rows
- QR codes: centered in white rounded-lg containers with 16px padding
- Metadata: text-sm text-gray-500 with icon prefixes

**Icons:**
- Library: Heroicons (already partially implemented)
- Size: h-5 w-5 (inline text), h-6 w-6 (standalone), h-12 w-12 (feature icons)
- Color: text-gray-400 (neutral), text-indigo-600 (interactive)

**Overlays:**
- Modals: fixed inset-0 bg-black/50 backdrop-blur-sm, centered content in white rounded-2xl max-w-lg
- Toasts: fixed top-4 right-4, slide-in animation, auto-dismiss after 5s
- Loading states: inline spinners or skeleton screens (avoid full-page loaders)

### E. Animations

**Minimal, purposeful motion only:**
- Hover transitions: transition-colors duration-200
- Modal entry: fade + scale from 95% to 100%
- Status updates: subtle pulse animation once
- NO scroll-triggered animations, NO decorative motion

---

## Images

**Document Illustrations:**
- Location: Empty states in "My Contracts" and "My E-Documents" when no documents exist
- Style: Clean line illustrations in indigo-100/indigo-600 color scheme
- Description: Abstract document/folder icons with checkmarks, 200x200px centered

**Identity Verification:**
- Location: Authentication section as reassurance visual
- Style: EU Digital Identity Wallet logo or simplified lock/shield icon
- Description: 48x48px icon next to "Prihlásiť sa cez EUDI Wallet" button

**No hero image needed** - this is a utility application, not a marketing page. Lead directly with authentication and functionality.