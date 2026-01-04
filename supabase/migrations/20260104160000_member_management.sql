-- ============================================
-- Member Management Feature Migration
-- Allows admins to add and remove members
-- ============================================

-- RPC function to remove a member from a group
CREATE OR REPLACE FUNCTION public.remove_group_member(
    p_conversation_id UUID,
    p_target_user_id UUID
)
RETURNS TEXT AS $$
DECLARE
    v_requester_id UUID;
    v_requester_role TEXT;
    v_target_username TEXT;
    v_requester_username TEXT;
BEGIN
    v_requester_id := auth.uid();

    -- Check if requester is an admin of the group
    SELECT role INTO v_requester_role
    FROM public.conversation_participants
    WHERE conversation_id = p_conversation_id
      AND user_id = v_requester_id;

    IF v_requester_role IS DISTINCT FROM 'admin' THEN
        RAISE EXCEPTION 'Only admins can remove members';
    END IF;

    -- Get usernames for system message
    SELECT username INTO v_target_username
    FROM public.profiles
    WHERE id = p_target_user_id;

    SELECT username INTO v_requester_username
    FROM public.profiles
    WHERE id = v_requester_id;

    -- Remove the target user
    DELETE FROM public.conversation_participants
    WHERE conversation_id = p_conversation_id
      AND user_id = p_target_user_id;
    
    -- Check if anyone was actually removed
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User is not a member of this conversation';
    END IF;

    -- Add system message
    INSERT INTO public.messages (conversation_id, sender_id, content, type)
    VALUES (
        p_conversation_id, 
        v_requester_id, 
        v_target_username || ' was removed by ' || v_requester_username, 
        'system'
    );
    
    RETURN 'removed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to add members to a group
CREATE OR REPLACE FUNCTION public.add_group_members(
    p_conversation_id UUID,
    p_new_member_ids UUID[]
)
RETURNS TEXT AS $$
DECLARE
    v_requester_id UUID;
    v_requester_role TEXT;
    v_requester_username TEXT;
    v_new_usernames TEXT[];
    v_username TEXT;
    v_new_id UUID;
BEGIN
    v_requester_id := auth.uid();

    -- Check if requester is an admin
    SELECT role INTO v_requester_role
    FROM public.conversation_participants
    WHERE conversation_id = p_conversation_id
      AND user_id = v_requester_id;

    IF v_requester_role IS DISTINCT FROM 'admin' THEN
        RAISE EXCEPTION 'Only admins can add members';
    END IF;

    -- Get requester username
    SELECT username INTO v_requester_username
    FROM public.profiles
    WHERE id = v_requester_id;

    -- Insert new members
    FOREACH v_new_id IN ARRAY p_new_member_ids
    LOOP
        -- Check if already exists to avoid errors (optional but good for safety)
        IF NOT EXISTS (
            SELECT 1 FROM public.conversation_participants 
            WHERE conversation_id = p_conversation_id AND user_id = v_new_id
        ) THEN
            INSERT INTO public.conversation_participants (conversation_id, user_id, role)
            VALUES (p_conversation_id, v_new_id, 'member');

            -- Collect username for message
            SELECT username INTO v_username
            FROM public.profiles
            WHERE id = v_new_id;
            
            v_new_usernames := array_append(v_new_usernames, v_username);
        END IF;
    END LOOP;

    -- Add system message if users were added
    IF array_length(v_new_usernames, 1) > 0 THEN
        INSERT INTO public.messages (conversation_id, sender_id, content, type)
        VALUES (
            p_conversation_id, 
            v_requester_id, 
            v_requester_username || ' added ' || array_to_string(v_new_usernames, ', '), 
            'system'
        );
    ELSE
        RETURN 'no_users_added';
    END IF;

    RETURN 'added';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.remove_group_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_group_members(UUID, UUID[]) TO authenticated;
