# ResearchForge

ResearchForge is a SaaS MVP for students and researchers.

It includes:

- User authentication with secure cookie sessions
- A documents dashboard for academic PDF uploads
- Page-level PDF text extraction and chunking
- Embedding generation for retrieval
- Grounded PDF chat that answers only from uploaded document context
- Mandatory page citations on answers
- Auto-generated paper summaries
- Literature search through OpenAlex, Semantic Scholar, and Crossref
- Citation helper for research claims
- Notes per document
- Stripe-ready Free and Pro billing flow

## Tech Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- PostgreSQL + pgvector
- OpenAI for embeddings and summaries
- Stripe for subscriptions

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
SESSION_SECRET=replace-with-a-long-random-secret
DATABASE_URL=postgres://postgres:password@localhost:5432/researchforge
OPENAI_API_KEY=
OPENAI_CHAT_MODEL=gpt-4.1-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
```

3. Enable pgvector and create the schema:

```sql
\i db/migrations/0001_researchforge.sql
```

4. Start the development server:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Demo Mode

If `DATABASE_URL` is missing, ResearchForge falls back to demo mode so the UI still renders with a sample paper and grounded-output examples. Real uploads, persistence, and billing require the environment variables above.

## Important Product Rules

- Answers must stay grounded in retrieved PDF chunks.
- If the answer is not in the document, the app should say so.
- Every grounded answer includes page citations.
- Dense academic language should be explained in simpler wording.
