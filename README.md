# gestion-seo

Application SEO multi-projets (Next.js + Prisma + NextAuth Google) pour agréger Google Search Console + Google Analytics 4.

## Setup rapide

1. Copier l'env
```bash
cp .env.example .env
```

2. Renseigner dans `.env`:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

3. Installer + DB
```bash
npm install
npx prisma migrate dev --name init
```

4. Lancer
```bash
npm run dev
```

## OAuth Google requis
Scopes:
- `https://www.googleapis.com/auth/webmasters.readonly`
- `https://www.googleapis.com/auth/analytics.readonly`
- `openid email profile`

Redirect URI dev:
- `http://localhost:3000/api/auth/callback/google`

## Modèle projet
- `name`
- `repoUrl`
- `domain`
- `gscSiteUrl`
- `ga4PropertyId`

## Notes
- Si token Google absent, l'API `/api/seo/overview` retourne un mode démo.
- Les secrets ne doivent jamais être commités.
