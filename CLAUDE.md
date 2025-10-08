# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application built with TypeScript, React 19, and Tailwind CSS v4. The project uses the Next.js App Router architecture and integrates shadcn/ui components for the UI layer.

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Architecture

### UI Component System

The project uses **shadcn/ui** components configured via `components.json`:
- **Style**: "new-york" variant
- **Base color**: neutral
- **Icon library**: lucide-react
- **Path aliases**:
  - `@/components` → components directory
  - `@/ui` or `@/components/ui` → UI components
  - `@/lib` → utility functions
  - `@/hooks` → custom React hooks

### Component Organization

Components exist in two locations due to migration:
1. `components/` - Main component directory (includes `app-sidebar.tsx`, navigation components, and UI components)
2. `ui/` - Legacy UI components directory

When working with UI components, prefer the `components/ui/` directory.

### State Management Pattern

The application uses **React client-side state** with the `"use client"` directive:
- Main pages (`app/page.tsx`) wrap content in provider components (e.g., `SidebarProvider`)
- State is lifted to parent components and passed down via props
- Sidebar state is managed via the `useSidebar()` hook from `@/components/ui/sidebar`

### Key Architectural Patterns

1. **Layout Structure**: Root layout (`app/layout.tsx`) configures fonts (Geist Sans & Geist Mono) and applies them globally
2. **Sidebar Navigation**: Uses a collapsible sidebar pattern with two modes:
   - `"icon"` mode when no conversation is selected
   - `"offcanvas"` mode when viewing a conversation
3. **Conversation View**: Selected conversation state triggers UI transitions between workspace view and design canvas view

## Styling

- **Tailwind CSS v4** with PostCSS (`@tailwindcss/postcss`)
- CSS variables for theming (configured in `app/globals.css`)
- Use `cn()` utility from `@/lib/utils` for conditional class merging (combines `clsx` and `tailwind-merge`)

## Key Dependencies

- **Forms**: react-hook-form + @hookform/resolvers + zod for validation
- **UI Primitives**: Radix UI components (@radix-ui/react-*)
- **Charts**: recharts for data visualization
- **Carousel**: embla-carousel-react
- **Notifications**: sonner for toast notifications
- **Themes**: next-themes for dark mode support
- **Analytics**: @vercel/analytics

## Working with Components

When adding new UI components, use the shadcn/ui CLI pattern (components are copied into the project, not imported from a package). Components should be added to `components/ui/` directory.
