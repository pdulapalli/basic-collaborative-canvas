# Basic Collaborative Canvas

A real-time collaborative drawing canvas built with React, TypeScript, and Supabase. Multiple users can draw and interact on the same canvas simultaneously.

## Technologies Used

This project is built with:

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI framework
- **shadcn/ui** - Modern UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend and real-time database

## Prerequisites

Before getting started, make sure you have:

- **Node.js** (version 16 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** (comes with Node.js)
- **Supabase account** - [Sign up at supabase.com](https://supabase.com)

## Environment Setup

1. **Copy the environment template:**

   ```bash
   cp .env.sample .env
   ```

2. **Configure your Supabase project:**
   - Go to your [Supabase dashboard](https://supabase.com/dashboard)
   - Create a new project or select an existing one
   - Navigate to Project Settings > API
   - Copy your Project URL and anon public key
   - Paste these values into your `.env` file

## Quick Start

Follow these steps to get the project running locally:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The development server will start and you'll see output similar to:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the collaborative canvas.
