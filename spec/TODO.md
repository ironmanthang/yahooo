# Tasks

## Phase 1: Supabase Setup ✅
- [x] Run `database/schema.sql` in Supabase SQL Editor
- [x] Enable Realtime for `messages` and `conversations` tables
- [x] Test signup/login in Supabase Auth dashboard

## Phase 2: Project Init ✅
- [x] Create Vite + React project
- [x] Install `@supabase/supabase-js` and `react-router-dom`
- [x] Create `.env` with Supabase credentials
- [x] Set up folder structure (components, hooks, pages, styles)
- [x] Create base CSS with dark theme variables

## Phase 3: Authentication ✅
- [x] Create `lib/supabase.js`
- [x] Create `lib/errorHandler.js`
- [x] Build `AuthContext.jsx` with session state
- [x] Create `useAuth` hook (in AuthContext.jsx)
- [x] Create Login page
- [x] Create Signup page (with username field)
- [x] Add protected route (redirect if not logged in)
- [x] Style auth pages (glassmorphism card)

## Phase 4: Chat Core ✅
- [x] `useUsers.js` - Fetch users for search (only shows results when typing)
- [x] `useConversations.js` - Fetch user's conversations (sorted by last message)
- [x] `useMessages.js` - Real-time messages with pagination
- [x] `ChatLayout.jsx` - Sidebar + chat area container
- [x] `Sidebar.jsx` - Conversation list + "New Chat" button + Settings gear
- [x] `ConversationItem.jsx` - Preview card in sidebar
- [x] `UserSearchModal.jsx` - Find and select user to chat
- [x] `Avatar.jsx` - Reusable avatar component
- [x] `Button.jsx`, `Input.jsx` - Reusable UI components
- [x] `MessageList.jsx` - Scrollable messages with load more
- [x] `MessageBubble.jsx` - Sent vs received styling
- [x] `MessageInput.jsx` - Text input + send button (auto-refocus after send)

## Phase 5: UX Polish ✅
- [x] Aligned sidebar/chat header and footer borders
- [x] Settings dropdown with click-outside-to-close
- [x] Username truncation for long names
- [x] Centered send button icon
- [x] Fixed sidebar loading flash on realtime updates
- [x] Auto-dismiss validation errors after 2 seconds

## Phase 6: Deploy ✅
- [x] `npm run build` - verified production build
- [x] Created Cloudflare Pages project
- [x] Connected GitHub repo (ironmanthang/yahooo)
- [x] Set environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [x] Deployed to https://yahoooo.pages.dev
- [x] Auto-deploy on git push enabled

---

## 🎉 V1 Complete!

**Live URL**: https://yahoooo.pages.dev
**GitHub**: https://github.com/ironmanthang/yahooo

