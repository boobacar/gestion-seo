# gestion-seo

Application SEO multi-projets (Next.js + Prisma + Supabase Auth) pour agréger Google Search Console + Google Analytics 4.

## Setup rapide

1. Copier l'env
```bash
cp .env.example .env
```

2. Renseigner `.env`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `DATABASE_URL`

3. Installer + DB
```bash
npm install
npx prisma migrate dev --name init
```

4. Lancer
```bash
npm run dev
```

## Auth
- Email/password via Supabase
- Google OAuth via Supabase (recommandé pour remonter les données GSC/GA4 via provider token)

## Modèle projet
- `name`
- `repoUrl`
- `domain`
- `gscSiteUrl`
- `ga4PropertyId`

## Notes
- Si token Google absent, l'API `/api/seo/overview` retourne un mode démo.
- En prod Vercel, utilisez un Postgres (pas sqlite).
