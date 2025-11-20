# 📧 Email Setup Guide for quienteto.ca

Email notifications are **optional** in quienteto.ca. The app works perfectly fine without emails - participants can access their matches via unique links.

However, if you want to send automated email notifications, this guide will help you set it up.

---

## 🎯 Why Add Emails?

With email notifications, you can automatically:

- Send match notifications to participants
- Send wishlist reminders
- Notify when the deadline approaches
- Share group links via email

---

## 📋 Email Provider Options

quienteto.ca supports multiple email providers. Choose based on your needs:

| Provider                               | Free Tier      | Best For        | Setup Difficulty |
| -------------------------------------- | -------------- | --------------- | ---------------- |
| [Resend](#option-1-resend-recommended) | 100 emails/day | Modern projects | ⭐ Easy          |
| [SendGrid](#option-2-sendgrid)         | 100 emails/day | Reliability     | ⭐⭐ Medium      |
| [Gmail SMTP](#option-3-gmail-smtp)     | 500 emails/day | Quick testing   | ⭐ Easy          |
| [Custom SMTP](#option-4-custom-smtp)   | Varies         | Existing server | ⭐⭐⭐ Advanced  |

---

## Option 1: Resend (Recommended)

### Why Resend?

- ✅ Modern, developer-friendly API
- ✅ Generous free tier (100 emails/day)
- ✅ Great deliverability
- ✅ Simple setup

### Setup Steps

1. **Create Account**

   - Go to [resend.com](https://resend.com)
   - Sign up (free)

2. **Get API Key**

   - Go to API Keys section
   - Click "Create API Key"
   - Copy the key (starts with `re_`)

3. **Configure quienteto.ca**

   Add to your `.env` file:

   ```env
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_your_api_key_here
   SMTP_FROM_EMAIL=noreply@yourdomain.com
   ```

   Update `frontend/.env`:

   ```env
   VITE_ENABLE_EMAILS=true
   ```

4. **Verify Domain (Optional but Recommended)**
   - In Resend dashboard, add your domain
   - Add DNS records they provide
   - Verify domain
   - Now emails come from your domain!

---

## Option 2: SendGrid

### Setup Steps

1. **Create Account**

   - Go to [sendgrid.com](https://sendgrid.com)
   - Sign up (free tier: 100 emails/day)

2. **Create API Key**

   - Go to Settings → API Keys
   - Create API Key with "Full Access"
   - Copy the key (starts with `SG.`)

3. **Verify Sender**

   - Go to Settings → Sender Authentication
   - Verify an email address or domain

4. **Configure quienteto.ca**

   Add to your `.env` file:

   ```env
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.your_api_key_here
   SMTP_FROM_EMAIL=noreply@yourdomain.com
   ```

   Update `frontend/.env`:

   ```env
   VITE_ENABLE_EMAILS=true
   ```

---

## Option 3: Gmail SMTP

### Setup Steps

⚠️ **Note**: Best for testing only. Gmail limits sending and may mark emails as spam.

1. **Enable 2-Factor Authentication**

   - Go to Google Account settings
   - Enable 2FA

2. **Generate App Password**

   - Go to Security → App passwords
   - Generate password for "Mail"
   - Copy the 16-character password

3. **Configure quienteto.ca**

   Add to your `.env` file:

   ```env
   EMAIL_PROVIDER=smtp
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=youremail@gmail.com
   SMTP_PASSWORD=your_16_char_app_password
   SMTP_FROM_EMAIL=youremail@gmail.com
   ```

   Update `frontend/.env`:

   ```env
   VITE_ENABLE_EMAILS=true
   ```

---

## Option 4: Custom SMTP

If you have your own mail server:

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=your_username
SMTP_PASSWORD=your_password
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_SECURE=true  # Optional: use TLS
```

---

## 🧪 Testing Your Setup

### 1. Check Configuration

```bash
# Ensure variables are set
docker-compose config | grep EMAIL
```

### 2. Test Email Sending

Create a test group and add your email as a participant to receive test notifications.

### 3. Check Logs

```bash
# View backend logs
docker-compose logs -f backend

# Look for email send confirmations or errors
```

---

## Email Templates

quienteto.ca sends these types of emails:

### 1. **Match Notification**

```
Subject: 🎁 Your Secret Santa Match!

Hi [Name],

You're participating in [Group Name]!

You're the Secret Santa for: [Receiver Name]

Event Date: [Date]
Budget: $[Min] - $[Max]

View your match and their wishlist:
[Unique Link]

Happy gifting! 🎄
```

### 2. **Wishlist Reminder**

```
Subject: ⏰ Don't forget your wishlist!

Hi [Name],

The deadline for [Group Name] is approaching!

Please add your wishlist items so your Secret Santa knows what you'd like.

[Unique Link]
```

---

## 🎨 Customizing Email Templates

Email templates are in the backend code. To customize:

1. Navigate to email service:

   ```bash
   # For Supabase Edge Function
   supabase/functions/send-email/

   # For Flask backend (if using)
   backend/services/email_service.py
   ```

2. Edit template HTML/text

3. Restart services

---

## 🐛 Troubleshooting

### Emails Not Sending

**Check environment variables:**

```bash
docker-compose config | grep -i email
```

**Check logs:**

```bash
docker-compose logs backend | grep -i email
```

**Common issues:**

- API key not set correctly
- `VITE_ENABLE_EMAILS` is false
- Domain not verified (for Resend/SendGrid)
- SMTP credentials incorrect

### Emails Going to Spam

**Solutions:**

- Verify your domain with email provider
- Set up SPF, DKIM, DMARC DNS records
- Use a proper "From" address (not @gmail.com in production)
- Don't send from localhost

### Rate Limits

Free tiers have limits:

- **Resend**: 100/day
- **SendGrid**: 100/day
- **Gmail**: 500/day (but with restrictions)

For more:

- Upgrade to paid plan
- Use multiple providers (failover)

---

## 🔒 Security Best Practices

1. **Never commit API keys**

   ```bash
   # Make sure .env is in .gitignore
   cat .gitignore | grep .env
   ```

2. **Use environment variables**

   - Store keys in `.env` only
   - Never hardcode in source

3. **Rotate keys periodically**

   - Generate new keys every 6 months
   - Revoke old keys

4. **Use domain verification**
   - Prevents email spoofing
   - Better deliverability

---

## 💰 Cost Comparison

| Provider | Free Tier | Paid Tier    | When to Upgrade            |
| -------- | --------- | ------------ | -------------------------- |
| Resend   | 100/day   | $20/mo (50K) | >3K emails/month           |
| SendGrid | 100/day   | $15/mo (40K) | >3K emails/month           |
| Gmail    | 500/day\* | N/A          | Never (not for production) |

\*With restrictions and potential spam issues

---

## 🚀 Production Recommendations

For production deployment:

1. **Use Resend or SendGrid** (not Gmail)
2. **Verify your domain**
3. **Set up proper DNS records** (SPF, DKIM, DMARC)
4. **Monitor sending quotas**
5. **Have a fallback plan** if emails fail
6. **Test thoroughly** before launch

---

## 📚 Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [SendGrid Documentation](https://docs.sendgrid.com)
- [Email Best Practices](https://sendgrid.com/blog/email-best-practices/)
- [SMTP Configuration Guide](https://www.siteground.com/kb/what-is-smtp/)

---

## ❓ FAQ

**Q: Are emails required for quienteto.ca to work?**
A: No! Emails are completely optional. Participants access their matches via unique links.

**Q: Can I use multiple email providers?**
A: Currently no, but you can easily switch providers by changing env vars.

**Q: What if I don't want to set up emails?**
A: Just keep `VITE_ENABLE_EMAILS=false` and share links manually.

**Q: Can I customize email content?**
A: Yes! Edit the email templates in the backend code.

---

Need help? Open an [issue](https://github.com/yourusername/quienteto/issues) or check our [Discord](https://discord.gg/quienteto)!

Happy gifting! 🎁📧
