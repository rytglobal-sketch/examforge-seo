# ResearchForge

ResearchForge is a SaaS MVP for students and researchers.

It includes:

- Passwordless magic-link authentication with secure cookie sessions
- A documents dashboard for academic PDF uploads
- Page-level PDF text extraction and chunking
- Embedding generation for retrieval
- Grounded PDF chat that answers only from uploaded document context
- Mandatory page citations on answers
- Auto-generated paper summaries
- Literature search through OpenAlex, Semantic Scholar, and Crossref
- Citation helper for research claims
- Notes per document
- Paystack-ready Free and Pro billing flow

## Tech Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- PostgreSQL + pgvector
- OpenAI for embeddings and grounded PDF chat
- OpenRouter for Deep Research synthesis
- Paystack for subscriptions

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file (you can start from `.env.local.example`):

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
SESSION_SECRET=replace-with-a-long-random-secret
DATABASE_URL=postgres://postgres:password@localhost:5432/researchforge
RESEND_API_KEY=
EMAIL_FROM="ResearchForge <hello@researchforge.app>"
OPENAI_API_KEY=
OPENAI_CHAT_MODEL=gpt-4.1-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENROUTER_API_KEY=
OPENROUTER_DEEP_RESEARCH_MODEL=openai/o3-deep-research
PAYSTACK_SECRET_KEY=
PAYSTACK_PRO_PLAN_CODE=
PAYSTACK_PRO_AMOUNT=
```

3. Enable pgvector and create the schema:

```sql
\i db/migrations/0001_researchforge.sql
\i db/migrations/0002_magic_links.sql
\i db/migrations/0003_paystack_billing.sql
```

4. Start the development server:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Demo Mode

If `DATABASE_URL` is missing, ResearchForge falls back to demo mode so the UI still renders with a sample paper and grounded-output examples. In local development, if `RESEND_API_KEY` and `EMAIL_FROM` are missing, the auth form exposes a preview magic link so the passwordless flow can still be tested without a mail provider. Real uploads, persistence, billing, and email delivery require the environment variables above.

If `OPENROUTER_API_KEY` is missing, the Deep Research workspace still works in a fallback ranking mode, but it will not use OpenRouter's latest deep-research model.

## Important Product Rules

- Answers must stay grounded in retrieved PDF chunks.
- If the answer is not in the document, the app should say so.
- Every grounded answer includes page citations.
- Dense academic language should be explained in simpler wording.
