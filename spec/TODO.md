# Tasks

## Phase 1: Supabase Setup
- [x] Run `database/schema.sql` in Supabase SQL Editor
- [x] Enable Realtime for `messages` and `conversations` tables
- [x] Test signup/login in Supabase Auth dashboard

## Phase 2: Project Init
- [x] Create Vite + React project
- [x] Install `@supabase/supabase-js` and `react-router-dom`
- [x] Create `.env` with Supabase credentials
- [x] Set up folder structure (components, hooks, pages, styles)
- [x] Create base CSS with dark theme variables

## Phase 3: Authentication
- [x] Create `lib/supabase.js`
- [x] Create `lib/errorHandler.js`
- [x] Build `AuthContext.jsx` with session state
- [x] Create `useAuth` hook (in AuthContext.jsx)
- [x] Create Login page
- [x] Create Signup page (with username field)
- [x] Add protected route (redirect if not logged in)
- [x] Style auth pages (glassmorphism card)

## Phase 4: Chat Core
- [] `useUsers.js` - Fetch all users for search
- [] `useConversations.js` - Fetch user's conversations
- [] `useMessages.js` - Real-time messages with pagination
- [] `ChatLayout.jsx` - Sidebar + chat area container
- [] `Sidebar.jsx` - Conversation list + "New Chat" button
- [] `ConversationItem.jsx` - Preview card in sidebar
- [] `UserSearchModal.jsx` - Find and select user to chat
- [] `Avatar.jsx` - Reusable avatar component
- [] `Button.jsx`, `Input.jsx` - Reusable UI components
- [] `MessageList.jsx` - Scrollable messages with load more
- [] `MessageBubble.jsx` - Sent vs received styling
- [] `MessageInput.jsx` - Text input + send button



## Phase 5: Deploy
- [] `npm run build` - verify production build
- [] Create Cloudflare Pages project
- [] Connect GitHub repo
- [] Set environment variables
- [] Deploy and test
