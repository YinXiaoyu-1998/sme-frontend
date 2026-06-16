# SME Frontend

Frontend application for the SME analytics product. It provides the user-facing workspace for sign-in, file upload, chat-based analysis, and rendering AI-generated outputs.

## What This Service Does

`sme-frontend` is the web client that operators use to interact with the product. It talks to `sme-backend` for authentication, file management, chat history, and generated file URLs.

## Core Features

- Email/password login flow
- Data center workspace for Excel/PDF upload
- Uploaded file list with backend-backed persistence
- Chat interface for asking business questions in natural language
- Markdown-style answer rendering
- Inline display of generated charts and downloadable generated files
- Clear-chat action that removes current chat history from the backend

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Ant Design 6
- Axios
- React Markdown + `remark-gfm`
- Tailwind CSS 4

## Project Structure

- `app/login` - login page
- `app/home` - main workspace page
- `app/components` - chat panel, uploader, shared UI pieces
- `app/services` - API wrappers for backend endpoints
- `app/store` - auth state management

## Local Development

Install dependencies:

```bash
npm ci
```

Start the dev server:

```bash
npm run dev
```

The app runs on [http://localhost:3000](http://localhost:3000) by default.

## Environment Variables

Create `.env.local` for local development:

```bash
NEXT_PUBLIC_SME_BACKEND_URL=http://localhost:4000
```

## Useful Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Service Relationships

- Sends API requests to `sme-backend`
- Renders generated charts/files whose URLs are served by `sme-backend`
- Does not directly access PostgreSQL, Redis, or LLM services
