# Yahooo - Development Log

> Append-only history of tasks and progress. Add new entries at the bottom.

---

## Jan 2, 2026 - V1 Launch

### Phase 1: Supabase Setup [DONE]
- [x] Run `database/schema.sql` in Supabase SQL Editor
- [x] Enable Realtime for `messages` and `conversations` tables
- [x] Test signup/login in Supabase Auth dashboard

### Phase 2: Project Init [DONE]
- [x] Create Vite + React project
- [x] Install `@supabase/supabase-js` and `react-router-dom`
- [x] Create `.env` with Supabase credentials
- [x] Set up folder structure
- [x] Create base CSS with dark theme

### Phase 3: Authentication [DONE]
- [x] Create `lib/supabase.js`
- [x] Build `AuthContext.jsx` with session state
- [x] Create Login and Signup pages
- [x] Add protected routes
- [x] Style auth pages (glassmorphism)

### Phase 4: Chat Core [DONE]
- [x] `useUsers.js` - User search
- [x] `useConversations.js` - Conversations list
- [x] `useMessages.js` - Real-time messages
- [x] Chat UI components (Sidebar, MessageList, MessageBubble, etc.)

### Phase 5: UX Polish [DONE]
- [x] Settings dropdown
- [x] Username truncation
- [x] Auto-dismiss errors
- [x] Loading states

### Phase 6: Deploy [DONE]
- [x] Production build
- [x] Cloudflare Pages setup
- [x] GitHub auto-deploy

V1 Complete: https://yahoooo.pages.dev

---

## Jan 3, 2026 - V1.1 Group Chat

### Phase 7: Group Chat Feature [BLOCKED]
- [x] Database migration (`20260103111201_add_group_chat.sql`)
- [x] Add `name`, `avatar_url` columns to conversations
- [x] Create `create_group_conversation` RPC function
- [x] Update `useConversations.js` for group support
- [x] Create `CreateGroupModal.jsx`
- [x] Update `Sidebar.jsx` with "+ Group" button
- [x] Update `ConversationItem.jsx` for group display
- [x] Update `ChatLayout.jsx` for group header
- [x] Update `MessageBubble.jsx` to show sender names
- [x] Add group CSS styles
- [x] Push migration to production
- [ ] Test multi-user group messaging  ← BLOCKED BY 8.1 bug fixes
- [ ] Push code to GitHub

---

## Jan 4, 2026 - V1.1.1 Group Chat Polish

### Phase 8: Group Chat Polish [IN PROGRESS]

> Make group chat feature-complete like a normal messenger.
> Priority based on WhatsApp/Slack/Telegram research.
> NOTE: Completing 8.1 will unblock Phase 7 testing.

#### Implementation Order

| Order | Phase | Priority | Description |
|-------|-------|----------|-------------|
| 1 | 8.1 | CRITICAL | Bug Fixes (header, sidebar) |
| 2 | 8.2 | CRITICAL | Group Info Panel + Member List |
| 3 | 8.3 | CRITICAL | Leave Group |
| 4 | 8.4 | CRITICAL | Admin Role |
| 5 | 8.5 | IMPORTANT | System Messages |
| 6 | 8.6 | IMPORTANT | Member Management (add/remove) |
| 7 | 8.7 | OPTIONAL | Duplicate Prevention |

---

#### 8.1 Bug Fixes [DONE]
- [x] Header shows "Chat" instead of group name
  - Root: `pendingGroup` state missing in `ChatLayout.jsx`
  - Fix: Added state, passed from `handleCreateGroup`
- [x] Group does not appear in sidebar until message sent
  - Root: Filter in `useConversations.js` hides empty groups
  - Fix: Changed filter to `conv.lastMessage || conv.type === 'group'`

#### 8.2 Group Info Panel [DONE]
- [x] Create `GroupInfoPanel.jsx` (slide-out panel or modal)
- [x] Click header to open panel
- [x] Display group name and avatar
- [x] Display full member list with role badges
- [x] Add CSS styles for info panel

#### 8.3 Leave Group [DONE]
- [x] Create `leave_group` RPC function in database
- [x] Add "Leave Group" button in GroupInfoPanel
- [x] Show confirmation modal before leaving
- [x] Handle edge cases:
  - If admin leaves and other admins exist: just leave
  - If only admin leaves: promote oldest member to admin
  - If last member leaves: delete group
- [x] Update sidebar after leaving

#### 8.4 Admin Role [DONE]
- [x] Database: Add `role` column to `conversation_participants` (admin/member)
- [x] Auto-set creator as `admin` in `create_group_conversation` RPC
- [x] Show "Admin" badge next to admin names in member list
- [ ] Admin-only features: edit group name, edit avatar (moved to 8.6)

#### 8.5 System Messages [DONE]
- [x] Add `type` column to messages: `user` or `system`
- [x] Auto-create "Group created" message on creation
- [x] Auto-create "X left the group" message on leave
- [x] Style system messages differently (centered, gray, no bubble)
- NOTE: "X was removed" deferred to 8.6 (requires kick)

#### 8.6 Member Management [DONE]
- [x] Admin can remove members (kick)
- [x] Auto-create "X was removed" message on kick
- [x] Admin can add new members after creation
- [x] Create `add_group_members` and `remove_group_member` RPC functions
- [x] Add "Add Members" button in GroupInfoPanel (admin only)

#### 8.7 Duplicate Prevention [DONE]
- [x] Warn if creating group with same name + same members
- [x] Frontend check before calling RPC
- [x] Allow user to proceed anyway (just warning, not blocking)

#### 8.8 Admin Delete Group [DONE]
- [x] Admin can delete the entire group
- [x] Create `delete_group` RPC function (admin only)
- [x] Add "Delete Group" button in GroupInfoPanel (admin only)
- [x] Confirmation dialog before deleting
- [x] Cascade delete all messages and participants


---

#### Files to Modify

| File | Changes |
|------|---------|
| `ChatLayout.jsx` | Add `pendingGroup`, add header click handler |
| `useConversations.js` | Adjust filter, add `leaveGroup` function |
| `GroupInfoPanel.jsx` | [NEW] Group info modal/panel |
| `MessageBubble.jsx` | Handle system message type |
| `CreateGroupModal.jsx` | Add duplicate warning (optional) |
| `supabase/migrations/` | [NEW] Add `role` column, update RPCs |

#### Database Changes Needed

```sql
-- DONE: role column added to participants
ALTER TABLE conversation_participants 
ADD COLUMN role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member'));

-- TODO (8.5): Add type to messages  
ALTER TABLE messages
ADD COLUMN type TEXT DEFAULT 'user' CHECK (type IN ('user', 'system'));

-- RPC functions status:
-- DONE: leave_group(conversation_id)
-- TODO: update_group_members(conversation_id, add_ids[], remove_ids[])
-- TODO: update_group_info(conversation_id, name, avatar_url)
```

---

## Future Ideas (V1.2+)

- @ Mentions (notify specific users)
- Message reactions (emoji responses)
- Reply to specific message (thread context)
- Typing indicators ("Multiple users typing...")
- File/image uploads
- Voice messages
- Read receipts
- Ban list (prevent rejoining)
