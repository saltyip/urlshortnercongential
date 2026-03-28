# 🔗 URL Shortener

A production-style URL shortening service built with Node.js and PostgreSQL.
Focuses on reliability, performance, and security rather than just the core shortening logic.

## Features

- **URL Shortening** — Counter-based shortening using base62 encoding for clean, compact slugs
- **User Accounts** — Register/login with JWT authentication and bcrypt password hashing
- **Redis Caching** — Frequently accessed URLs served from cache to reduce DB load
- **ACID Compliance** — Transactional integrity for all database operations
- **Request Logging** — Middleware-level logging for every incoming request

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Database | PostgreSQL |
| Cache | Redis |
| Auth | JWT + bcrypt |

## How the Shortening Works

Each new URL gets an auto-incremented ID from the database.
That ID is converted to a base62 string (a-z, A-Z, 0-9),
producing short slugs like `aB3x`. Redirects resolve by
decoding the slug back to the original ID and looking up the URL,
with Redis caching hot entries.



\```bash
git clone https://github.com/saltyip/urlshortnercongential
cd urlshortnercongential
npm install
\```

Set up your `.env`:
\```env
JWT_SECRET=your_secret
config db.js
\```

\```bash
npm start
\```
