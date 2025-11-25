# Memory Tap Backend Setup

## Prerequisites
- Node.js (v18+)
- Supabase Account
- OpenAI API Key

## Setup

1.  **Backend Setup**
    - Navigate to `backend/` directory: `cd backend`
    - Install dependencies: `npm install`
    - Copy `.env.example` to `.env`: `cp .env.example .env` (or manually create it)
    - **For Free AI**: Set `AI_PROVIDER=groq` and get a free API key from [console.groq.com](https://console.groq.com). Fill in `GROQ_API_KEY`.
    - **For OpenAI**: Set `AI_PROVIDER=openai` and fill in `OPENAI_API_KEY`.
    - Fill in your `SUPABASE_URL` and `SUPABASE_KEY`.

2.  **Database Setup**
    - Go to your Supabase project SQL Editor.
    - Copy the contents of `backend/schema.sql` and run it to create the tables.

3.  **Frontend Setup**
    - Navigate to root directory.
    - Install dependencies: `npm install`

## Running the App

1.  **Start Backend**
    - In `backend/` directory: `npm run dev`
    - Server runs on `http://localhost:3000`

2.  **Start Frontend**
    - In root directory: `npm run dev`
    - App runs on `http://localhost:8080` (or whatever Vite assigns)

## API Endpoints
- `POST /api/upload_audio`
- `POST /api/transcribe`
- `POST /api/create_memory`
- `GET /api/memories`
- `GET /api/memories/:id`
- `PUT /api/memories/:id`
- `POST /api/search`
- `POST /api/create_reminder`
- `GET /api/reminders`
