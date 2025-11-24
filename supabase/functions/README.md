# Supabase Edge Functions

## Functions

### `execute-raffle`
Executes the Secret Santa matching algorithm and sends notification emails.

**Trigger**: HTTP POST (manual or from cron job)

**Payload**:
```json
{
  "group_id": "uuid",
  "organizer_id": "uuid (optional)",
  "send_emails": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Raffle completed successfully",
  "matches_count": 10,
  "emails": { "sent": 10, "failed": 0 }
}
```

### `check-deadlines`
Cron job that checks for groups past deadline and triggers automatic raffle.

**Trigger**: Supabase Cron (every hour) or manual HTTP POST

**Response**:
```json
{
  "success": true,
  "message": "Processed 3 groups",
  "processed": 3,
  "success_count": 3,
  "fail_count": 0,
  "results": [...]
}
```

## Deployment

### Prerequisites
1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link project: `supabase link --project-ref your-project-ref`

### Deploy Functions
```bash
# Deploy execute-raffle
supabase functions deploy execute-raffle

# Deploy check-deadlines
supabase functions deploy check-deadlines
```

### Environment Variables
Set in Supabase Dashboard → Settings → Edge Functions:

- `SUPABASE_URL` (auto-set)
- `SUPABASE_SERVICE_ROLE_KEY` (auto-set)
- `RESEND_API_KEY` (for email sending)

### Setup Cron Job
In Supabase Dashboard → Database → Cron Jobs:

```sql
-- Run every hour at minute 0
select cron.schedule(
  'check-deadlines',
  '0 * * * *',
  $$
  select
    net.http_post(
      url := 'https://your-project.supabase.co/functions/v1/check-deadlines',
      headers := '{"Authorization": "Bearer your-service-role-key"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);
```

## Local Development

```bash
# Start local Supabase
supabase start

# Serve functions locally
supabase functions serve

# Test execute-raffle
curl -X POST http://localhost:54321/functions/v1/execute-raffle \
  -H "Authorization: Bearer your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"group_id": "uuid-here"}'
```

## Email Integration (Resend)

1. Create account at [resend.com](https://resend.com)
2. Get API key from dashboard
3. Add domain and verify DNS records
4. Set `RESEND_API_KEY` environment variable

The email template is embedded in `execute-raffle/index.ts` with neobrutalist Christmas styling.
