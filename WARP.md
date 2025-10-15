# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**AetherMind** is a RAG-powered knowledge explorer application built as a modern React application. It allows users to upload documents (PDF, TXT, DOCX) and query them using natural language, providing AI-synthesized answers with source citations.

This is a Lovable project that can be edited both locally and through the Lovable web interface at https://lovable.dev/projects/fb48d448-f51e-4601-98c1-449afa224dcf

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **3D Graphics**: @react-three/fiber and @react-three/drei
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **Theme**: next-themes for dark/light mode

## Development Commands

```bash
# Install dependencies
npm i

# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development
npm run build:dev

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Project Architecture

### Core Application Structure

The app follows a page-based routing structure with two main views:

1. **Landing Page** (`/`) - Marketing page showcasing the RAG knowledge explorer
2. **Explorer Page** (`/explorer`) - Main application interface with three panels:
   - Left sidebar: Document ingestion interface
   - Center: Query interface with chat-like conversation
   - Right sidebar: Chat history and settings

### Key Components

- **DocumentIngestion**: Handles file upload with drag-and-drop, shows processing status (uploading → embedding → indexed), and displays chunk counts
- **QueryInterface**: Main chat interface with streaming responses, source citations, and metadata display
- **ChatHistory**: Shows conversation history with settings access
- **ThemeToggle**: Dark/light mode switcher
- **LavaLamp**: 3D animated background using React Three Fiber

### Design System

The project uses a comprehensive design system defined in `src/index.css`:

- **Glass morphism effects**: `.glass` and `.glass-strong` utility classes
- **Neon color palette**: Violet, fuchsia, emerald, cyan with HSL definitions
- **Custom animations**: glow-pulse, float, fade-in, slide-up
- **Gradient utilities**: `.gradient-text` for multi-color text effects
- **CSS variables**: All colors and effects use HSL CSS custom properties

### State Management

- Uses React's built-in state management (useState)
- TanStack Query for server state (though currently mocked)
- Component-level state for UI interactions

### File Organization

```
src/
├── components/
│   ├── ui/           # shadcn/ui components (40+ components)
│   ├── DocumentIngestion.tsx
│   ├── QueryInterface.tsx
│   ├── ChatHistory.tsx
│   ├── ThemeToggle.tsx
│   └── SettingsDialog.tsx
├── pages/
│   ├── Landing.tsx   # Marketing landing page
│   ├── Explorer.tsx  # Main app interface
│   └── NotFound.tsx
├── lib/
│   └── utils.ts      # Tailwind class merging utility
└── App.tsx           # Router setup with providers
```

## Development Guidelines

### Component Patterns

- All components use TypeScript with proper interfaces
- Framer Motion for animations (initial/animate/exit patterns)
- shadcn/ui components as building blocks
- Glass morphism styling with custom utilities

### Styling Conventions

- Tailwind CSS with custom design system
- HSL color definitions for all theme colors
- Glass morphism effects using backdrop-blur
- Gradient text effects using CSS background-clip
- Custom animations defined in tailwind.config.ts

### Code Style

- TypeScript with relaxed settings (noImplicitAny: false)
- ESLint configuration with React hooks rules
- Unused parameters and variables allowed
- Path aliases: `@/*` points to `src/*`

## Current Implementation Notes

- **Simulated Backend**: All AI responses and document processing are currently mocked with setTimeout
- **No Real RAG**: Document ingestion shows fake progress and chunk counts
- **Mock API Responses**: Uses simulated response times and token counts
- **File Upload**: Currently only handles the UI - no actual file processing
- **No Tests**: No testing framework currently configured

## Integration Points

### Lovable Platform

- Changes made via Lovable web interface automatically commit to this repo
- Local changes pushed to git will reflect in Lovable
- Uses `lovable-tagger` plugin for development mode component tagging

### Vite Configuration

- Development server runs on host "::" port 8080
- Path alias `@` resolves to `./src`
- React SWC plugin for fast refresh
- Component tagger only enabled in development mode

### shadcn/ui Integration

- Components configured in `components.json`
- Uses default style with CSS variables
- TypeScript enabled with path aliases
- Slate base color theme

## Future Development Areas

When implementing real functionality:

1. **Backend Integration**: Replace mocked responses with actual RAG pipeline
2. **File Processing**: Implement real PDF/TXT/DOCX parsing and chunking
3. **Vector Database**: Add embeddings storage and similarity search
4. **LLM Integration**: Connect to actual language models (GPT-4, Llama, etc.)
5. **Testing**: Add Vitest or Jest for component and integration tests
6. **Error Handling**: Implement comprehensive error boundaries and user feedback
7. **Performance**: Add virtualization for large document lists and chat history

## Windows Development

This project is developed on Windows with PowerShell. All commands and paths are Windows-compatible.