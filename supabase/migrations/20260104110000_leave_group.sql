-- ============================================
-- Leave Group Feature Migration
-- Allows users to leave group conversations
-- ============================================

-- RPC function to leave a group conversation
CREATE OR REPLACE FUNCTION public.leave_group(
    p_conversation_id UUID
)
RETURNS TEXT AS $$
DECLARE
    remaining_count INTEGER;
BEGIN
    -- Remove the calling user from the conversation
    DELETE FROM public.conversation_participants
    WHERE conversation_id = p_conversation_id
      AND user_id = auth.uid();
    
    -- Check if anyone was actually removed
    IF NOT FOUND THEN
        RAISE EXCEPTION 'You are not a member of this conversation';
    END IF;
    
    -- Count remaining participants
    SELECT COUNT(*) INTO remaining_count
    FROM public.conversation_participants
    WHERE conversation_id = p_conversation_id;
    
    -- If no one left, delete the conversation (CASCADE will clean up messages)
    IF remaining_count = 0 THEN
        DELETE FROM public.conversations
        WHERE id = p_conversation_id;
        RETURN 'deleted';
    END IF;
    
    RETURN 'left';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.leave_group(UUID) TO authenticated;
