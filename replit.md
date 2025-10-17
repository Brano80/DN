# Digital Notary - Slovak Digital Identity & Document Signing Platform

## Overview

Digital Notary is a government/legal application for digital identity verification and electronic document signing, designed for Slovak users. The platform integrates with the EU Digital Identity Wallet (EUDI) for authentication and enables users to create, sign, verify, and manage digital contracts and documents. The application emphasizes trust, clarity, and accessibility with Slovak language support and professional design optimized for legal/governmental contexts.

## Recent Changes

**October 17, 2025:**
- Refocused application to 2 primary contract workflows: Vehicle Purchase Contracts and Rental Contracts
- Updated CreateDocument page to display only 2 active templates (vehicle and rental) with dedicated form pages
- Implemented comprehensive vehicle contract form (CreateVehicleContract.tsx) with Slovak legal fields:
  - Seller information (name, birth number, address)
  - Buyer information (name, birth number, address)
  - Vehicle details (brand, model, year, VIN, license plate, mileage)
  - Purchase price and payment terms
- Implemented comprehensive rental contract form (CreateRentalContract.tsx) with Slovak legal fields:
  - Landlord information (name, birth number, address)
  - Tenant information (name, birth number, address)
  - Property details (address, type, floor area, rooms)
  - Rent, deposit, and rental period
- Converted contract storage from hardcoded data to database persistence:
  - Contracts saved via POST /api/contracts with JSON.stringify(content)
  - MyContracts page now loads from GET /api/contracts?ownerEmail=...
  - ContractDetailModal fetches by ID and renders based on type
- Fixed contract content format: changed from plain text to structured JSON objects
- Fixed virtual office database loading and display:
  - Replaced hardcoded office cards with dynamic database loading via GET /api/virtual-offices?ownerEmail=...
  - Fixed React Query queryKey format bug (changed from array with objects to single URL string)
  - Added cache invalidation after office creation to refresh list immediately
  - Added loading and empty states for better UX
  - Fixed date formatting to handle null createdAt values gracefully
  - Both list and detail views now load from database correctly
- Successfully tested full workflows: 
  - Contract: template selection → form fill → save → display in MyContracts → view details
  - Virtual Office: create office → display in list → view detail → attach contract
- All data properly persisted and displayed dynamically from database

**October 16, 2025:**
- Implemented multi-step digital signing workflows following DN v51 specifications
  - House/property contracts: 5-step process (signing → escrow → kataster → transfer → completed)
  - Vehicle sales: 7-step process (signing → payment → office submission → registration → notarial record → archiving → completed)
  - Power of attorney: 3-step process (signing → verification → completed)
- Built complete DigitalSigning page with state management and progress timeline visualization
- Fixed progress bar rendering logic to correctly display completed steps (green checkmark), active step (primary color), and future steps (gray)
- Created ContractDetailModal and CompletedTransactionModal for virtual office transactions
- Established Virtual Office workflow: "Otvoriť" opens transaction details, "Pokračovať v procese" navigates to digital signing with appropriate workflow type
- All workflows tested end-to-end with proper step progression and completion screens

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite with custom SSR setup for development
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** TanStack Query (React Query) for server state
- **UI Framework:** shadcn/ui components built on Radix UI primitives
- **Styling:** Tailwind CSS with custom design system

**Design System:**
- Custom color palette focused on governmental trust (primary blue: 221 83% 53%)
- Light/dark mode support with theme toggle
- Typography: Inter font family optimized for Slovak language
- Semantic color system for document states (success green, warning amber, error red)
- Professional minimalism with accessible UI components

**Key Pages:**
- Home: Authentication and main menu
- Create Document: Template selection and document creation
- My Documents: Personal document management (identity, education, property)
- My Contracts: Contract lifecycle management
- Verify Document: QR code and verification code validation
- Virtual Office: Multi-party document signing sessions with active/completed transaction management
- Digital Signing: Multi-step signing workflows following DN v51 specifications (house: 5 steps, vehicle: 7 steps, attorney: 3 steps)

### Backend Architecture

**Server Framework:** Express.js with TypeScript
- Middleware-based request/response handling
- Custom Vite integration for development HMR
- Session-based authentication (placeholder for EUDI integration)

**Storage Layer:**
- **Current:** In-memory storage implementation (`MemStorage`)
- **Configured for:** PostgreSQL via Drizzle ORM
- **Database Provider:** Neon Database (@neondatabase/serverless)

**Data Models:**
- Users table with username/password (placeholder schema)
- Designed to extend for documents, contracts, signatures, and verifications

**API Design:**
- RESTful endpoints prefixed with `/api`
- JSON request/response format
- Centralized error handling middleware

### Authentication & Identity

**EU Digital Identity Wallet (EUDI) Integration:**
- Frontend authentication flow initiated via EUDI Wallet button
- Currently simulated with localStorage persistence
- Designed for future OpenID Connect/OAuth2 integration
- Session management prepared for connect-pg-simple

**Document Verification:**
- QR code generation for document verification (using qrcode library)
- Unique verification codes (format: DN-2024-XXXXXXXXX)
- Digital signature validation workflow

### Document Management

**Document Types:**
- Identity documents (ID cards, driver's license)
- Educational credentials (diplomas, certificates)
- Property documents (vehicle registration, real estate)
- Contracts (purchase agreements, rental contracts, power of attorney)

**Contract Lifecycle:**
- Template-based document creation
- Multi-party signing with status tracking (signed/pending/rejected)
- Document upload support (PDF, DOC, DOCX)
- Virtual office for synchronized signing sessions

**Verification System:**
- QR code scanning capability
- Verification code input validation
- Signature chain validation
- Document authenticity confirmation

## External Dependencies

### Third-Party UI Libraries
- **Radix UI:** Accessible component primitives (dialogs, dropdowns, popovers, etc.)
- **shadcn/ui:** Pre-built component library following design system
- **Lucide React:** Icon library for consistent iconography

### Development Tools
- **Vite:** Fast build tool with custom SSR setup
- **Replit Plugins:** Runtime error modal, cartographer, dev banner
- **TypeScript:** Type safety across frontend and backend
- **ESBuild:** Production build bundling for server code

### Database & ORM
- **Drizzle ORM:** Type-safe database queries and migrations
- **Neon Database:** Serverless PostgreSQL provider
- **Drizzle Kit:** Schema management and migrations

### Form & Data Management
- **React Hook Form:** Form state management
- **Zod:** Schema validation with Drizzle integration
- **date-fns:** Date formatting and manipulation

### Utilities
- **QRCode:** QR code generation for document verification
- **Wouter:** Lightweight routing solution
- **clsx & tailwind-merge:** Conditional CSS class composition
- **class-variance-authority:** Component variant styling

### Session Management
- **connect-pg-simple:** PostgreSQL session store for Express (configured but not yet active)

### Build & Deployment
- **Node.js:** Runtime environment
- **tsx:** TypeScript execution for development
- **PostCSS:** CSS processing with Tailwind and Autoprefixer