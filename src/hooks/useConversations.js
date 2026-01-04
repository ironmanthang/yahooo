import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useConversations() {
    const [conversations, setConversations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const isInitialLoad = useRef(true)
    const fetchConversationsRef = useRef(null)  // Store fetch function for manual refetch
    const { user } = useAuth()

    useEffect(() => {
        if (!user) return

        async function fetchConversations() {
            // Only show loading on first fetch, not on refetches
            if (isInitialLoad.current) setLoading(true)
            try {
                // Get conversations where user is a participant
                const { data: participantData, error: participantError } = await supabase
                    .from('conversation_participants')
                    .select('conversation_id')
                    .eq('user_id', user.id)

                if (participantError) throw participantError

                const conversationIds = participantData.map(p => p.conversation_id)

                if (conversationIds.length === 0) {
                    setConversations([])
                    setLoading(false)
                    return
                }

                // Get conversations with other participant's profile and last message
                const { data: convData, error: convError } = await supabase
                    .from('conversations')
                    .select(`
                        id,
                        type,
                        name,
                        avatar_url,
                        created_at,
                        updated_at,
                        conversation_participants!inner (
                            user_id,
                            role,
                            profiles:user_id (
                                id,
                                username,
                                avatar_url,
                                status
                            )
                        ),
                        messages (
                            content,
                            created_at,
                            sender_id
                        )
                    `)
                    .in('id', conversationIds)
                    .order('updated_at', { ascending: false })

                if (convError) throw convError

                // Format conversations with support for both direct and group types
                const formatted = convData.map(conv => {
                    const lastMessage = conv.messages.sort(
                        (a, b) => new Date(b.created_at) - new Date(a.created_at)
                    )[0]

                    if (conv.type === 'group') {
                        // Group conversation
                        return {
                            id: conv.id,
                            type: 'group',
                            name: conv.name || 'Unnamed Group',
                            avatarUrl: conv.avatar_url,
                            participants: conv.conversation_participants.map(p => ({
                                ...p.profiles,
                                role: p.role || 'member'
                            })),
                            lastMessage: lastMessage?.content,
                            lastMessageTime: lastMessage?.created_at,
                            updatedAt: conv.updated_at
                        }
                    } else {
                        // Direct message
                        const otherParticipant = conv.conversation_participants.find(
                            p => p.user_id !== user.id
                        )
                        return {
                            id: conv.id,
                            type: 'direct',
                            otherUser: otherParticipant?.profiles,
                            lastMessage: lastMessage?.content,
                            lastMessageTime: lastMessage?.created_at,
                            updatedAt: conv.updated_at
                        }
                    }
                })

                // Show conversations with messages OR groups (even empty ones)
                // Sort by last message time or creation time (most recent first)
                const withMessages = formatted
                    .filter(conv => conv.lastMessage || conv.type === 'group')
                    .sort((a, b) => {
                        const timeA = a.lastMessageTime || a.updatedAt
                        const timeB = b.lastMessageTime || b.updatedAt
                        return new Date(timeB) - new Date(timeA)
                    })
                setConversations(withMessages)
            } catch (err) {
                console.error('Error fetching conversations:', err)
                setError(err.message)
            } finally {
                setLoading(false)
                isInitialLoad.current = false
            }
        }

        // Store the fetch function for manual refetch
        fetchConversationsRef.current = fetchConversations

        fetchConversations()

        // Subscribe to new messages (to update last message preview)
        const channel = supabase
            .channel('conversations-updates')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'messages' },
                () => {
                    // Refetch conversations when any message changes
                    fetchConversations()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user])

    // Helper to find or create a conversation with another user
    async function getOrCreateConversation(otherUserId) {
        if (!user) throw new Error('Not authenticated')

        // Check if conversation already exists
        const { data: myConvs } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', user.id)

        const myConvIds = myConvs?.map(c => c.conversation_id) || []

        if (myConvIds.length > 0) {
            const { data: existingConv } = await supabase
                .from('conversation_participants')
                .select('conversation_id')
                .eq('user_id', otherUserId)
                .in('conversation_id', myConvIds)
                .limit(1)
                .single()

            if (existingConv) {
                return existingConv.conversation_id
            }
        }

        // Create new conversation using RPC function (bypasses RLS)
        const { data: newConvId, error: convError } = await supabase
            .rpc('create_conversation', {
                user1_id: user.id,
                user2_id: otherUserId
            })

        if (convError) throw convError

        return newConvId
    }

    // Create a new group conversation with multiple users
    async function createGroupConversation(groupName, participantIds) {
        if (!user) throw new Error('Not authenticated')

        // Include current user in participants
        const allParticipants = [...new Set([user.id, ...participantIds])]

        const { data: newConvId, error: convError } = await supabase
            .rpc('create_group_conversation', {
                group_name: groupName,
                participant_ids: allParticipants
            })

        if (convError) throw convError

        // Trigger refetch to update sidebar immediately
        if (fetchConversationsRef.current) {
            fetchConversationsRef.current()
        }

        return newConvId
    }

    // Manual refetch function
    function refetch() {
        if (fetchConversationsRef.current) {
            fetchConversationsRef.current()
        }
    }

    // Leave a group conversation
    async function leaveGroup(conversationId) {
        if (!user) throw new Error('Not authenticated')

        const { data: result, error: leaveError } = await supabase
            .rpc('leave_group', {
                p_conversation_id: conversationId
            })

        if (leaveError) throw leaveError

        // Refetch conversations to update sidebar
        if (fetchConversationsRef.current) {
            fetchConversationsRef.current()
        }

        return result  // 'left' or 'deleted'
    }

    // Add members to a group
    async function addMembersToGroup(conversationId, newMemberIds) {
        if (!user) throw new Error('Not authenticated')

        const { data: result, error: addError } = await supabase
            .rpc('add_group_members', {
                p_conversation_id: conversationId,
                p_new_member_ids: newMemberIds
            })

        if (addError) throw addError

        // Refetch to update member list
        if (fetchConversationsRef.current) {
            fetchConversationsRef.current()
        }

        return result
    }

    // Remove a member from a group (kick)
    async function removeMemberFromGroup(conversationId, targetUserId) {
        if (!user) throw new Error('Not authenticated')

        const { data: result, error: removeError } = await supabase
            .rpc('remove_group_member', {
                p_conversation_id: conversationId,
                p_target_user_id: targetUserId
            })

        if (removeError) throw removeError

        // Refetch to update member list
        if (fetchConversationsRef.current) {
            fetchConversationsRef.current()
        }

        return result
    }

    // Delete a group (admin only)
    async function deleteGroup(conversationId) {
        if (!user) throw new Error('Not authenticated')

        const { data: result, error: deleteError } = await supabase
            .rpc('delete_group', {
                p_conversation_id: conversationId
            })

        if (deleteError) throw deleteError

        // Refetch to update sidebar
        if (fetchConversationsRef.current) {
            fetchConversationsRef.current()
        }

        return result
    }

    return {
        conversations,
        loading,
        error,
        getOrCreateConversation,
        createGroupConversation,
        leaveGroup,
        addMembersToGroup,
        removeMemberFromGroup,
        deleteGroup,
        refetch
    }
}
