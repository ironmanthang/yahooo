-- ============================================
-- Group Chat Feature Migration
-- Adds support for group conversations
-- ============================================

-- Add group name and avatar columns to conversations
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- RPC function to create a group conversation
-- Requirements:
--   - Minimum 3 participants (creator + 2 others)
--   - Creator is automatically set as admin
CREATE OR REPLACE FUNCTION public.create_group_conversation(
    group_name TEXT,
    participant_ids UUID[]
)
RETURNS UUID AS $$
DECLARE
    new_conv_id UUID;
    creator_id UUID;
    other_ids UUID[];
BEGIN
    -- Validate at least 3 participants (creator + 2 others)
    IF array_length(participant_ids, 1) < 3 THEN
        RAISE EXCEPTION 'Group must have at least 3 participants';
    END IF;
    
    -- First participant is the creator (admin)
    creator_id := participant_ids[1];
    other_ids := participant_ids[2:array_length(participant_ids, 1)];
    
    -- Create the conversation
    INSERT INTO public.conversations (type, name)
    VALUES ('group', group_name)
    RETURNING id INTO new_conv_id;
    
    -- Add creator as admin
    INSERT INTO public.conversation_participants (conversation_id, user_id, role)
    VALUES (new_conv_id, creator_id, 'admin');
    
    -- Add other participants as members
    INSERT INTO public.conversation_participants (conversation_id, user_id, role)
    SELECT new_conv_id, unnest(other_ids), 'member';
    
    RETURN new_conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_group_conversation(TEXT, UUID[]) TO authenticated;
