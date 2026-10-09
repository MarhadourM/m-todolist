# m-todolist

TodoList synchronisée sur tous tes appareils (téléphone et ordinateur) — PWA React + TypeScript + Supabase.

## Stack

- **Frontend** : React + TypeScript + Vite, Tailwind CSS, installable en PWA
- **Backend** : Supabase (Auth, Postgres + RLS, Realtime)
- **Hébergement** : GitHub Pages

## Développement

```bash
npm install
npm run dev
```

L'app tourne sur http://localhost:5173/m-todolist/

## Variables d'environnement

Copie `.env.example` vers `.env.local` et renseigne tes identifiants Supabase :

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-key
```

`.env.local` n'est jamais commité (voir `.gitignore`). Seule la clé publique (`anon`/`publishable`) est utilisée côté client ; la sécurité repose sur les Row Level Security de Supabase.

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build de production
- `npm run preview` — prévisualiser le build
- `npm run lint` — linter (oxlint)
