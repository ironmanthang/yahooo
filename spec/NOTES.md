# Notes for AI Assistant

> Read this file first when starting a new conversation.
> When you discover bugs or tricky implementation details, ADD them to the relevant section below.

---

## Quick Start

1. Read `PROJECT.md` for tech stack and features
2. Read `TODO.md` for current work and history
3. Dev server: `npm run dev` at http://localhost:5173
4. Deploy: `git push origin main` (auto-deploys to Cloudflare)

---

## Key Files Reference

### Entry Points
- `src/main.jsx` - React entry, renders App
- `src/App.jsx` - Router setup, AuthProvider wrapper

### Pages
- `src/pages/LoginPage.jsx` - Login form with email/password
- `src/pages/SignupPage.jsx` - Signup form with username
- `src/pages/ChatPage.jsx` - Main chat view (just renders ChatLayout)

### Chat Components (src/components/Chat/)
- `ChatLayout.jsx` - Main chat container, manages activeConversationId
  - Has `pendingUser` state for DMs, `pendingGroup` for groups
  - Header click opens group info panel
- `Sidebar.jsx` - Left panel with conversation list, "+ Chat" / "+ Group" buttons
- `ConversationItem.jsx` - Single conversation row in sidebar
- `MessageList.jsx` - Scrollable message container with load more
- `MessageBubble.jsx` - Single message display (handles sender name in groups)
- `MessageInput.jsx` - Text input with send button
- `CreateGroupModal.jsx` - Group creation modal (name + member selection)
- `UserSearchModal.jsx` - User search for starting DMs

### Common Components (src/components/Common/)
- `Avatar.jsx` - User avatar with status indicator
- `Button.jsx` - Styled button component
- `Input.jsx` - Styled input component

### Hooks (src/hooks/)
- `useConversations.js` - Fetches conversation list, creates conversations
  - Groups show immediately (even without messages)
  - Has `getOrCreateConversation()` for DMs
  - Has `createGroupConversation()` for groups
- `useMessages.js` - Real-time messages for active conversation
  - Subscribes to Supabase realtime channel
  - Has `sendMessage()` function
- `useUsers.js` - User search by username

### Context (src/contexts/)
- `AuthContext.jsx` - Auth state, signIn, signUp, signOut, profile

### Lib (src/lib/)
- `supabase.js` - Supabase client instance
- `errorHandler.js` - Error handling utilities

### Styles (src/styles/)
- `index.css` - CSS variables, global styles
- `auth.css` - Login/signup page styles
- `chat.css` - Chat layout styles (largest file, 11KB)
- `components.css` - Common component styles

### Database Migrations (supabase/migrations/)
- `20260103110232_remote_schema.sql` - Initial schema (profiles, conversations, messages)
- `20260103111201_add_group_chat.sql` - Group chat + RPC (3-min, admin role)
- `20260104110000_leave_group.sql` - Leave group RPC
- `20260104130000_add_admin_role.sql` - Role column on participants
- `20260104143000_add_profile_trigger.sql` - Auto profile creation trigger
- `20260104150000_system_messages.sql` - System message type + RPC updates

### Files Created (Phase 8)
- `GroupInfoPanel.jsx` - Group info modal with member list, leave button

---

## Code Caveats

### Supabase Auth
- Wrap profile fetch in `setTimeout(0)` inside `onAuthStateChange` to avoid deadlock
- Use `onAuthStateChange` not `getSession` for initial session

### React Inputs
- Do not use `.value =` directly on controlled inputs
- Use native setter or `dispatchEvent` for programmatic input

### Conversations
- DMs only show after first message is sent
- Groups show immediately (with system message)

### Group Chat
- Minimum 3 participants total (creator + 2 others)
- Group avatar shows initials from group name
- Sender names only show for RECEIVED messages in groups, not sent

---

## Group Chat Best Practices

> Reference: WhatsApp, Slack, Telegram, Messenger patterns

### UI/UX Patterns
- Group Info Panel: Click header to open panel with members, settings, leave option
- Member List: Show all members with role badges (Admin/Member)
- Message Display: Sender name above each message in groups
- System Messages: Centered, gray, no bubble (e.g., "X created the group")
- Avatars: Initials from group name or grid of member avatars

### Role Hierarchy
```
Creator (auto-admin) -> Admin -> Member
```

Admin permissions: Add/remove members, change group name/avatar, promote to admin, kick
Member permissions: Send messages, view members, leave group

### Leave Group Logic
- Member leaves: Remove from participants, show "X left the group"
- Admin leaves (other admins exist): Just leave
- Only admin leaves (members remain): Promote oldest member to admin
- Last person leaves: Delete the conversation

### Feature Priority
- [CRITICAL] Group Info Panel - users must see who is in the group
- [CRITICAL] Leave Group - users must be able to exit
- [CRITICAL] Admin Role - creator should have control
- [IMPORTANT] System Messages - "X joined", "Y left" for context
- [IMPORTANT] Add/Remove Members - admin can manage after creation
- [NICE-TO-HAVE] @ Mentions, Reactions, Reply to Message
- [OPTIONAL] Duplicate Prevention - most apps allow duplicate groups

---

## AI-Specific Notes

### Browser Automation Rules

**FORBIDDEN methods (not human-like):**
- JavaScript injection (document.querySelector, element.click)
- Direct DOM manipulation (setting .value bypasses React)
- Instant actions without delays
- Reading DOM/HTML to find elements
- Clicking invisible elements without scrolling first

**REQUIRED methods (human-like):**
- Pixel clicks at visible button locations
- Keyboard typing character by character
- Wait/delays between actions
- Scroll to bring elements into view
- Screenshots to "see" the page



### User Preferences
- Explain commands before running if they look suspicious
- Do not modify existing lines in TODO.md (append-only)
- Ask before making major architectural changes

### Database Changes
- Always use migrations in `supabase/migrations/`
- Push with `npx supabase db push`
- Never DROP tables with real user data - use ALTER

### File Editing (for AI)
- Re-read file before editing if previous edit failed
- View exact lines before attempting to match content
- Make smaller, targeted edits

---

## Test Accounts

| Email | Password | Username |
|-------|----------|----------|
| 1@gmail.com | 111111 | 111 |
| 2@gmail.com | 222222 | 222 |
| 3@gmail.com | 333333 | 333 |

---

## Discovered Issues Log

> Add new issues here with date. Future AI will learn from these.

### Jan 3, 2026
- Browser subagent rate limited after 100+ steps in one conversation
- Group members must be properly selected in CreateGroupModal before creation
- "tester" user could not see group because not added as member during creation

### Jan 4, 2026
- Group header shows "Chat" instead of group name immediately after creation [FIXED]
- New groups do not appear in sidebar until a message is sent (filter issue) [FIXED]
- Duplicate groups with same name + members are allowed (no prevention)
- No way to view member list after group is created [FIXED - GroupInfoPanel]
- No way to leave a group [FIXED - leave_group RPC]
- No admin role or member management [FIXED - role column added]
- Clicking group header does nothing (no info panel) [FIXED]
- Missing `on_auth_user_created` trigger in migrations [FIXED - add_profile_trigger.sql]
- Migration cleanup: removed redundant fix migrations, consolidated RPC in add_group_chat.sql
