# TeamFlow Frontend

Next.js client for the TeamFlow Go API. This stage establishes generated API types, authentication transport, query defaults, and test tooling; product feature routes are not included yet.

## Requirements

- Node.js 20.9 or newer
- Bun 1.4.2
- TeamFlow backend reachable at `http://localhost:8080`

Create `.env.local` in this directory:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

The value is the API origin; the client appends `/api/v1`. Install dependencies with `bun install`, then run `bun run dev`.

## Scripts

| Command                | Purpose                                                        |
| ---------------------- | -------------------------------------------------------------- |
| `bun run dev`          | Start Next.js with Turbopack                                   |
| `bun run build`        | Create a production build                                      |
| `bun run start`        | Serve the production build                                     |
| `bun run lint`         | Run ESLint 9 flat-config CLI                                   |
| `bun run typecheck`    | Run strict TypeScript checks                                   |
| `bun run test`         | Run Vitest and MSW unit tests                                  |
| `bun run test:e2e`     | Run Playwright tests                                           |
| `bun run gen:api`      | Regenerate types from `../team-flow-backend/docs/openapi.yaml` |
| `bun run format`       | Format frontend files with Prettier                            |
| `bun run format:check` | Check formatting                                               |

Install Playwright browsers once with `bunx playwright install` before E2E runs.

## Pinned Versions

Versions were queried from npm on 2026-10-02 and are pinned exactly in `package.json`.

| Package                                    | Version                  |
| ------------------------------------------ | ------------------------ |
| Next.js                                    | 16.3.8                   |
| React / React DOM                          | 19.3.0 / 19.3.0          |
| TypeScript                                 | 5.9.3                    |
| TanStack Query                             | 5.104.1                  |
| Axios                                      | 1.20.0                   |
| React Hook Form / resolvers                | 7.89.0 / 5.9.1           |
| Zod                                        | 4.6.5                    |
| Tailwind CSS / PostCSS plugin              | 4.3.3 / 4.3.3            |
| shadcn CLI                                 | 4.21.1                   |
| lucide-react                               | 1.50.0                   |
| Zustand                                    | 5.0.15                   |
| openapi-typescript                         | 7.13.0                   |
| Vitest                                     | 5.0.3                    |
| Testing Library React / jest-dom           | 16.3.3 / 7.0.1           |
| MSW                                        | 3.0.1                    |
| Playwright                                 | 1.63.0                   |
| ESLint / eslint-config-next                | 9.39.5 / 16.3.8          |
| typescript-eslint                          | 8.71.0                   |
| Prettier                                   | 3.9.9                    |
| babel-plugin-react-compiler                | 1.0.0                    |
| jsdom                                      | 30.1.1                   |
| Type definitions: Node / React / React DOM | 26.6.4 / 19.3.0 / 19.3.0 |

TypeScript 7.0.2 was the latest registry version at setup time, but `openapi-typescript` declares a `^5.x` TypeScript peer range and fails at runtime with TypeScript 7. The project therefore pins the newest supported TypeScript 5 release, 5.9.3. ESLint is pinned to the newest 9.x release because the requested stack specifies ESLint 9.

## Architecture and Security

- `src/types/api.d.ts` is generated from the backend OpenAPI document. `api-envelope.ts` derives generic success, paginated, and error envelope types from it.
- `NEXT_PUBLIC_API_BASE_URL` configures the API origin; endpoint requests use `/api/v1` and the shared Axios instance.
- Access tokens exist only in the non-persisted Zustand auth store. `tokenService` is the only code that stores refresh tokens; it uses `sessionStorage` to support reload recovery, with an in-memory fallback if browser storage is unavailable.
- **Known risk:** `sessionStorage` refresh tokens are readable by same-origin JavaScript and therefore exposed if an XSS occurs. A backend-supported httpOnly, Secure, SameSite refresh-cookie flow is the preferred follow-up.
- Axios shares one in-flight refresh request across concurrent 401s, rotates the stored refresh token, and replays each protected request once. A failed refresh clears auth state and query cache, then redirects to login with the current path as `next`.
- Query retries are disabled for 4xx responses. A 429 emits an accessible, non-blocking notice using `Retry-After` when available.
- Security headers include CSP, `X-Content-Type-Options`, `Referrer-Policy`, and frame restrictions. CSP `connect-src` is derived from the configured API origin.
- The backend must allow the deployed frontend origin through CORS. No browser `X-API-Key` support is implemented.

## Contract Follow-Up

The backend validator and tests enforce passwords of 8–72 UTF-8 bytes containing letters and digits. The OpenAPI registration schema instead sets `minLength: 12`, which is character-based. The registration UI follows the backend implementation with `TextEncoder`; reconcile the OpenAPI contract with the backend before relying on generated validation metadata.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
