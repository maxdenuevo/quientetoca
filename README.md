<div align="center">

# quiéntetoca

### Free Secret Santa Organizer

_Organiza tu amigo secreto en minutos_

[![Live Demo](https://img.shields.io/badge/demo-quienteto.ca-FF00FF?style=flat&logo=vercel)](https://www.quienteto.ca)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**[quienteto.ca](https://www.quienteto.ca)**

</div>

---

## How It Works

1. **Create** - Set group name, deadline, and budget
2. **Share** - Single invite link (WhatsApp, copy, QR)
3. **Join** - Participants login with Google/Microsoft
4. **Vote** - Everyone votes on budget range
5. **Customize** - Add wishlists and restrictions
6. **Match** - Auto-raffle at deadline, emails sent

---

## Features

| Feature | Description |
|---------|-------------|
| **One Link** | Single invite link per group |
| **OAuth Login** | Google/Microsoft - no passwords |
| **Budget Voting** | Democratic price range selection |
| **Restrictions** | Exclude pairings (couples, families) |
| **Wishlists** | Participants add gift hints |
| **Auto-Raffle** | Runs at deadline, sends emails |
| **Realtime** | See participants join live |
| **Dark Mode** | Neon Editorial design system |

---

## Tech Stack

```
Frontend:   React 18 + Vite + Tailwind CSS
Auth:       Supabase Auth (Google, Microsoft OAuth)
Database:   Supabase PostgreSQL + RLS
Realtime:   Supabase Realtime subscriptions
Backend:    Supabase Edge Functions (Deno)
Emails:     Resend API
Hosting:    Vercel + Supabase
```

---

## Quick Start

### Requirements

- Node.js 18+
- Supabase account (free tier works)

### Setup

```bash
# Clone
git clone https://github.com/maxdenuevo/quientetoca.git
cd quientetoca/frontend
npm install

# Configure
cp .env.example .env
# Edit .env with your Supabase credentials

# Run
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]
```

### Database Setup

1. Create project at [supabase.com](https://supabase.com)
2. Run `database/supabase-schema.sql` in SQL Editor
3. Run `database/supabase-rls-policies.sql`
4. Enable Google/Microsoft OAuth in Authentication > Providers
5. See [docs/OAUTH_SETUP_GUIDE.md](docs/OAUTH_SETUP_GUIDE.md) for OAuth configuration

---

## Project Structure

```
quientetoca/
├── frontend/
│   └── src/
│       ├── pages/          # Home, GroupPage, AuthCallback, NotFound
│       ├── components/     # ~20 React components
│       ├── hooks/          # useRealtime
│       ├── lib/            # api-client, supabase, auth, config, icons
│       ├── utils/          # validation, formatters
│       └── styles/         # Neon Editorial design tokens
├── supabase/functions/
│   ├── execute-raffle/     # Matching + emails
│   └── check-deadlines/    # Cron for auto-raffle
├── database/
│   ├── supabase-schema.sql
│   └── supabase-rls-policies.sql
└── docs/
    ├── DESIGN_SYSTEM.md
    ├── DATA_FLOW.md
    └── OAUTH_SETUP_GUIDE.md
```

---

## Commands

```bash
npm run dev        # Development server
npm run build      # Production build
npm test           # Run tests
npm run preview    # Preview production build
```

---

## Deployment

### Frontend (Vercel)

1. Import repo
2. Root Directory: `frontend`
3. Framework: Vite
4. Add environment variables
5. Deploy

### Edge Functions (Supabase)

```bash
supabase login
supabase link --project-ref [ref]
supabase functions deploy execute-raffle
supabase functions deploy check-deadlines
```

### Cron Job

In Supabase Dashboard > Database > Cron Jobs:

```sql
select cron.schedule(
  'check-deadlines',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://[project].supabase.co/functions/v1/check-deadlines',
    headers := '{"Authorization": "Bearer [service-role-key]"}'::jsonb
  );
  $$
);
```

---

## Contributing

PRs welcome for bug fixes, features, and translations.

```bash
git checkout -b feature/my-feature
git commit -m "Add: my feature"
git push origin feature/my-feature
```

---

## License

MIT
