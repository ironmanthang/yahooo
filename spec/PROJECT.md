# Yahooo Chat App

> Real-time chat application with premium dark UI.

## Live

- URL: https://yahoooo.pages.dev
- GitHub: https://github.com/ironmanthang/yahooo

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite |
| Styling | Vanilla CSS (dark theme + glassmorphism) |
| Auth | Supabase Auth (email/password) |
| Database | Supabase PostgreSQL |
| Real-time | Supabase Realtime (WebSocket) |
| Hosting | Cloudflare Pages |

---

## Supabase Project

| Key | Value |
|-----|-------|
| Dashboard | https://supabase.com/dashboard/project/wijquffmvqhzhghfqtdi |
| Project URL | https://wijquffmvqhzhghfqtdi.supabase.co |

---

## Features

### V1 - Direct Messages [DONE]
- Sign up / Log in (email + password)
- User search
- 1-on-1 direct messaging
- Real-time message delivery
- Message history with pagination
- Online status indicator

### V1.1 - Group Chat Basic [DONE]
- Create group with 3+ members (minimum)
- Group name and initials avatar
- Member count display
- Sender names in group messages

### V1.1.1 - Group Chat Polish [IN PROGRESS]
- [DONE] Group info panel (click header to view members)
- [DONE] Leave group functionality
- [DONE] Admin role for group creator
- [DONE] System messages ("X created group", "Y left")
- Member management (add/remove by admin)

### Future Ideas (V1.2+)
- @ Mentions (notify specific users)
- Message reactions (emoji responses)
- Reply to specific message
- Typing indicators
- File/image uploads
- Voice messages
- Read receipts
- Voice/video calls

---

## Database Schema

```
profiles ----------+---- conversation_participants ----+---- conversations
   |               |                                   |
   +--- messages --+-----------------------------------+
```

Tables:
- `profiles` - User data (username, avatar, status)
- `conversations` - Chat threads (type: direct/group, name, avatar_url)
- `conversation_participants` - Who is in which conversation (has `role`: admin/member)
- `messages` - Message content + sender + timestamp + type (user/system)

See `database/schema.sql` for full SQL.

---

## Project Structure

```
yahooo/
├── spec/                    <- Documentation for AI
│   ├── NOTES.md             <- Read first, caveats and rules
│   ├── PROJECT.md           <- This file, tech stack
│   └── TODO.md              <- Task history and current work
├── supabase/
│   └── migrations/          <- Database migrations
├── src/
│   ├── components/
│   │   ├── Auth/            (Login, Signup)
│   │   ├── Chat/            (ChatLayout, Sidebar, Messages, etc.)
│   │   └── Common/          (Button, Input, Avatar)
│   ├── contexts/            (AuthContext)
│   ├── hooks/               (useConversations, useMessages, useUsers)
│   ├── lib/                 (supabase.js)
│   ├── pages/               (LoginPage, SignupPage, ChatPage)
│   └── styles/              (CSS files)
├── .env
└── package.json
```

---

## Development Workflow

### Local Development
```bash
npm install          # Install dependencies
npm run dev          # Dev server at localhost:5173
```

### Database Changes
```bash
npx supabase login                    # Login to Supabase CLI
npx supabase link                     # Link to project
npx supabase migration new <name>     # Create migration
npx supabase db push                  # Push to production
```

### Deploy
```bash
git add .
git commit -m "message"
git push origin main     # Auto-deploys to Cloudflare Pages
```

---

## Theme

```css
:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --accent: #6366f1;
  --text-primary: #ffffff;
  --text-secondary: #a1a1aa;
}
```
