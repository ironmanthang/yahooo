-- ============================================
-- Admin Delete Group Feature Migration
-- Allows admins to permanently delete a group
-- ============================================

-- RPC function to delete a group (admin only)
CREATE OR REPLACE FUNCTION public.delete_group(
    p_conversation_id UUID
)
RETURNS TEXT AS $$
DECLARE
    v_requester_id UUID;
    v_requester_role TEXT;
BEGIN
    v_requester_id := auth.uid();

    -- Check if requester is an admin of the group
    SELECT role INTO v_requester_role
    FROM public.conversation_participants
    WHERE conversation_id = p_conversation_id
      AND user_id = v_requester_id;

    IF v_requester_role IS DISTINCT FROM 'admin' THEN
        RAISE EXCEPTION 'Only admins can delete the group';
    END IF;

    -- Delete the conversation (CASCADE handles messages + participants)
    DELETE FROM public.conversations
    WHERE id = p_conversation_id;

    -- Check if anything was deleted
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Group not found';
    END IF;

    RETURN 'deleted';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.delete_group(UUID) TO authenticated;
