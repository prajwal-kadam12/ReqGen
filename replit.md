# ReqGen - AI-Powered BRD Generator

## Overview

ReqGen is an enterprise-grade web application for generating and managing Business Requirement Documents (BRDs) and Purchase Orders. The application leverages AI-powered refinement to help business analysts transform rough notes into professional, structured documents. Users can create, preview, edit, and distribute documents through an intuitive interface designed with Material Design principles adapted for productivity workflows.

## User Preferences

Preferred communication style: Simple, everyday language.

## Email Integration Status

**Status**: SMTP email integration ACTIVE ✓
- Using nodemailer with SMTP credentials stored in Replit Secrets
- Required environment variables:
  - SMTP_HOST: SMTP server address
  - SMTP_PORT: Port number (587 for TLS, 465 for SSL)
  - SMTP_USER: Email username/address
  - SMTP_PASSWORD: Email password or app-specific password
  - SMTP_FROM_EMAIL: Sender email address
- Backend endpoint: POST /api/send-email
- Sends professional HTML documents with company branding (logo, header, footer)
- Email service file: server/email.ts
- User dismissed SendGrid integration - opted for SMTP instead

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server, providing fast HMR and optimized production builds
- Wouter for lightweight client-side routing instead of heavier alternatives like React Router

**UI Component Strategy**
- shadcn/ui component library built on Radix UI primitives for accessible, composable components
- Tailwind CSS for utility-first styling with custom design tokens
- Custom design system based on Material Design principles, emphasizing clarity and professional aesthetics
- Component variants managed through class-variance-authority (CVA) for consistent prop-based styling

**State Management**
- TanStack Query (React Query) for server state management, caching, and API data fetching
- React Hook Form with Zod resolvers for form state and validation
- Local component state via React hooks for UI-specific concerns

**Design System**
- Typography: Inter font for headings/UI, system-ui for body text
- Spacing system using Tailwind's 2/4/6/8/12/16 unit scale
- Color tokens defined as HSL CSS variables supporting light/dark modes
- Elevation system using layered backgrounds (elevate-1, elevate-2) for interactive states

### Backend Architecture

**Server Framework**
- Express.js running on Node.js for the HTTP server
- ESM modules throughout (type: "module" in package.json)
- Middleware pipeline: JSON body parsing, raw body capture for webhooks, request logging

**API Design**
- RESTful endpoints under `/api` prefix
- Resource-based routing (documents collection)
- Request validation using Zod schemas shared between client and server
- Standardized JSON responses with appropriate HTTP status codes

**Development Tooling**
- tsx for running TypeScript directly in development
- esbuild for production server bundling
- Vite middleware mode for integrated frontend development server
- Custom logging with timestamp formatting

### Data Storage

**Database Strategy**
- PostgreSQL via Neon serverless driver for production
- Drizzle ORM for type-safe database queries and migrations
- In-memory storage implementation (MemStorage) for development/testing
- Storage abstraction layer (IStorage interface) enabling swappable implementations

**Schema Design**
- Users table: id (UUID), username (unique), password
- Documents table: id (UUID), name, type (BRD/PO), content, originalNote, refinedNote, createdAt
- Drizzle-Zod integration for automatic validation schema generation from database schema
- UUID primary keys using PostgreSQL's gen_random_uuid()

**Migration Management**
- Drizzle Kit for schema migrations
- Migration files stored in `/migrations` directory
- Push-based workflow for development (db:push script)

### Authentication & Authorization

Currently implements a role-based routing system without actual authentication middleware:
- Three user roles: admin, client, analyst
- Role-based navigation redirects on login
- No session management or password hashing implemented yet (architectural placeholder)

### External Dependencies

**UI & Interaction Libraries**
- Radix UI: Comprehensive set of unstyled, accessible component primitives (dialogs, dropdowns, popovers, etc.)
- Lucide React: Icon library for consistent iconography
- cmdk: Command palette/search interface
- embla-carousel-react: Touch-friendly carousel component
- date-fns: Date manipulation and formatting

**Build & Development Tools**
- Vite with React plugin for frontend bundling
- @replit/vite-plugin-runtime-error-modal: Development error overlay
- @replit/vite-plugin-cartographer: Replit-specific development features
- PostCSS with Tailwind CSS and Autoprefixer

**Database & ORM**
- @neondatabase/serverless: PostgreSQL driver optimized for serverless/edge environments
- drizzle-orm: Type-safe ORM with SQL-like syntax
- drizzle-zod: Automatic Zod schema generation from Drizzle tables
- connect-pg-simple: PostgreSQL session store (configured but not actively used)

**Form Management**
- react-hook-form: Performant form state management with minimal re-renders
- @hookform/resolvers: Integration layer for validation libraries
- zod: Runtime type validation and schema definition

**Type Safety & Validation**
- TypeScript with strict mode enabled
- Zod for runtime validation at API boundaries
- Shared schema definitions between client and server (./shared/schema.ts)

**Hosting & Deployment**
- Designed for Replit deployment with custom Vite plugins
- Environment-based configuration (DATABASE_URL from environment variables)
- Separate build steps for client (Vite) and server (esbuild)