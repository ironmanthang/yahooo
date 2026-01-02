import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useConversations() {
    const [conversations, setConversations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const isInitialLoad = useRef(true)
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
                        created_at,
                        updated_at,
                        conversation_participants!inner (
                            user_id,
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

                // Format conversations with other user info and last message
                const formatted = convData.map(conv => {
                    const otherParticipant = conv.conversation_participants.find(
                        p => p.user_id !== user.id
                    )
                    const lastMessage = conv.messages.sort(
                        (a, b) => new Date(b.created_at) - new Date(a.created_at)
                    )[0]

                    return {
                        id: conv.id,
                        otherUser: otherParticipant?.profiles,
                        lastMessage: lastMessage?.content,
                        lastMessageTime: lastMessage?.created_at,
                        updatedAt: conv.updated_at
                    }
                })

                // Only show conversations with at least one message
                // Sort by last message time (most recent first)
                const withMessages = formatted
                    .filter(conv => conv.lastMessage)
                    .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime))
                setConversations(withMessages)
            } catch (err) {
                console.error('Error fetching conversations:', err)
                setError(err.message)
            } finally {
                setLoading(false)
                isInitialLoad.current = false
            }
        }

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

    return { conversations, loading, error, getOrCreateConversation }
}
