# Real-time DM Chat - Technical Plan

> **Goal**: A real-time Direct Message chat app with premium dark UI  
> **Scope**: 1-on-1 private chats only (no group chats in v1)

---

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Frontend | React + Vite | Fast, modern, great DX |
| Styling | Vanilla CSS | No framework overhead, full control |
| Auth | Supabase Auth | Email/Password, handles sessions |
| Database | Supabase PostgreSQL | Stores users, conversations, messages |
| Real-time | Supabase Realtime | WebSocket push for instant messages |
| Hosting | Cloudflare Pages | Free, global CDN, unlimited bandwidth |

---

## Supabase Project

| Key | Value |
|-----|-------|
| Dashboard | https://supabase.com/dashboard/project/wijquffmvqhzhghfqtdi |
| Project URL | `https://wijquffmvqhzhghfqtdi.supabase.co` |
| Anon Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpanF1ZmZtdnFoemhnaGZxdGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3MTg0ODIsImV4cCI6MjA1MTI5NDQ4Mn0.sb_publishable_dceE1hzBoWYKPye0iQPguw_JIattg3n` |

> ⚠️ The Anon Key is safe for client-side (RLS protected). Never expose Service Role Key.

---

## Database Design

### Why "Conversations + Participants" model?

| Model | Use Case |
|-------|----------|
| Channels | Public rooms (Slack, Discord) |
| **Conversations + Participants** | Private DMs (Messenger, WhatsApp) ✅ |

### Schema

```
profiles ──────────┬──── conversation_participants ────┬──── conversations
   │               │                                   │
   └─── messages ──┴───────────────────────────────────┘
```

**Tables:**
- `profiles` - User data (username, avatar, status)
- `conversations` - Chat threads (type: direct/group)
- `conversation_participants` - Who is in which conversation
- `messages` - Message content + sender + timestamp

See `database/schema.sql` for full SQL scripts.

---

## Project Structure

```
yahooo/
├── spec/                    ← You are here
│   ├── PLAN.md
│   ├── TASKS.md
│   ├── mockups/
│   └── database/
├── src/
│   ├── components/
│   │   ├── Auth/            (Login, Signup, AuthLayout)
│   │   ├── Chat/            (ChatLayout, Sidebar, MessageList, etc.)
│   │   └── Common/          (Button, Input, Avatar, Toast)
│   ├── contexts/            (AuthContext)
│   ├── hooks/               (useAuth, useConversations, useMessages, useUsers)
│   ├── lib/                 (supabase.js, errorHandler.js)
│   ├── pages/               (LoginPage, SignupPage, ChatPage)
│   ├── styles/              (index.css, auth.css, chat.css, components.css)
│   ├── App.jsx
│   └── main.jsx
├── .env
├── index.html
├── package.json
└── vite.config.js
```

---

## UI Design

### Theme: Dark + Glassmorphism

```css
:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --bg-glass: rgba(255, 255, 255, 0.05);
  --accent: #6366f1;
  --accent-hover: #818cf8;
  --text-primary: #ffffff;
  --text-secondary: #a1a1aa;
  --border: rgba(255, 255, 255, 0.1);
  --success: #22c55e;
  --glass-blur: blur(20px);
  --shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  --radius: 12px;
}
```

### Mockups

| Login | Chat |
|-------|------|
| ![Login](./mockups/login_page.png) | ![Chat](./mockups/chat_interface.png) |

---

## Key Features (v1)

| Feature | Description |
|---------|-------------|
| Sign Up | Email + Password + Username |
| Log In | Email + Password |
| User Search | Find users to start a chat |
| Start DM | Create conversation with another user |
| Send Message | Real-time delivery via WebSocket |
| Message History | Cursor-based pagination (load older on scroll) |
| Online Status | Show last seen / online indicator |

---

## Security & Performance

### Rate Limiting
- Max 5 messages per 10 seconds per user
- Enforced via PostgreSQL function in RLS policy
- See `database/schema.sql` for implementation

### Message Pagination
- Cursor-based using `created_at` timestamp
- Load 50 messages at a time
- "Load older" on scroll to top

### Error Handling
- Centralized error handler (`lib/errorHandler.js`)
- Toast notifications for user feedback
- Auto-redirect on session expiry

### Supabase Auth Note
- When fetching profile inside `onAuthStateChange`, wrap in `setTimeout(0)` to avoid deadlock
- Only use `onAuthStateChange` (not `getSession`) for initial session check

### Offline Handling
- Connection status banner (online/offline indicator)
- Browser `online`/`offline` event listeners

---

## Development Workflow

1. **Setup Supabase** - Run SQL scripts in dashboard
2. **Init Project** - `npm create vite@latest ./ -- --template react`
3. **Install Dependencies** - `npm install @supabase/supabase-js react-router-dom`
4. **Build Auth** - Login/Signup pages + AuthContext
5. **Build Chat** - Hooks + Components + Real-time subscriptions
6. **Polish** - Loading states, error handling, responsive design
7. **Deploy** - Push to GitHub → Cloudflare Pages

---

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server at localhost:5173
npm run build        # Production build
npm run preview      # Preview production locally
```

---

## Future Versions

| Version | Features |
|---------|----------|
| v1 (now) | Direct Messages, Email Auth |
| v2 | Group Chats, Typing Indicators |
| v3 | File Uploads, Reactions |
| v4 | Voice Messages, Read Receipts, Voice and video call |
