-- ============================================
-- System Messages Feature Migration
-- Adds support for system-generated messages
-- ============================================

-- Add type column to messages
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'user' 
    CHECK (type IN ('user', 'system'));

-- Update create_group_conversation to add "Group created" system message
CREATE OR REPLACE FUNCTION public.create_group_conversation(
    group_name TEXT,
    participant_ids UUID[]
)
RETURNS UUID AS $$
DECLARE
    new_conv_id UUID;
    creator_id UUID;
    other_ids UUID[];
    creator_username TEXT;
BEGIN
    -- Validate at least 3 participants (creator + 2 others)
    IF array_length(participant_ids, 1) < 3 THEN
        RAISE EXCEPTION 'Group must have at least 3 participants';
    END IF;
    
    -- First participant is the creator (admin)
    creator_id := participant_ids[1];
    other_ids := participant_ids[2:array_length(participant_ids, 1)];
    
    -- Get creator's username for system message
    SELECT username INTO creator_username
    FROM public.profiles
    WHERE id = creator_id;
    
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
    
    -- Create "Group created" system message
    INSERT INTO public.messages (conversation_id, sender_id, content, type)
    VALUES (new_conv_id, creator_id, creator_username || ' created the group', 'system');
    
    RETURN new_conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update leave_group to add "X left the group" system message
CREATE OR REPLACE FUNCTION public.leave_group(
    p_conversation_id UUID
)
RETURNS TEXT AS $$
DECLARE
    remaining_count INTEGER;
    leaving_username TEXT;
    leaving_user_id UUID;
BEGIN
    -- Get current user info
    leaving_user_id := auth.uid();
    
    -- Get username before leaving
    SELECT username INTO leaving_username
    FROM public.profiles
    WHERE id = leaving_user_id;
    
    -- Remove the calling user from the conversation
    DELETE FROM public.conversation_participants
    WHERE conversation_id = p_conversation_id
      AND user_id = leaving_user_id;
    
    -- Check if anyone was actually removed
    IF NOT FOUND THEN
        RAISE EXCEPTION 'You are not a member of this conversation';
    END IF;
    
    -- Count remaining participants
    SELECT COUNT(*) INTO remaining_count
    FROM public.conversation_participants
    WHERE conversation_id = p_conversation_id;
    
    -- If no one left, delete the conversation
    IF remaining_count = 0 THEN
        DELETE FROM public.conversations
        WHERE id = p_conversation_id;
        RETURN 'deleted';
    END IF;
    
    -- Add "X left the group" system message (only if conversation still exists)
    INSERT INTO public.messages (conversation_id, sender_id, content, type)
    VALUES (p_conversation_id, leaving_user_id, leaving_username || ' left the group', 'system');
    
    RETURN 'left';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions (already exist but ensure they're there)
GRANT EXECUTE ON FUNCTION public.create_group_conversation(TEXT, UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_group(UUID) TO authenticated;
