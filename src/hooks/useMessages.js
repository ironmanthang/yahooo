import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const MESSAGES_PER_PAGE = 50

export function useMessages(conversationId) {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [hasMore, setHasMore] = useState(true)
    const [error, setError] = useState(null)
    const { user } = useAuth()

    // Fetch messages for the conversation
    const fetchMessages = useCallback(async (cursor = null) => {
        if (!conversationId || !user) return

        setLoading(true)
        try {
            let query = supabase
                .from('messages')
                .select(`
                    id,
                    content,
                    created_at,
                    sender_id,
                    is_read,
                    profiles:sender_id (
                        username,
                        avatar_url
                    )
                `)
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: false })
                .limit(MESSAGES_PER_PAGE)

            if (cursor) {
                query = query.lt('created_at', cursor)
            }

            const { data, error } = await query

            if (error) throw error

            const newMessages = data.reverse() // Show oldest first

            if (cursor) {
                setMessages(prev => [...newMessages, ...prev])
            } else {
                setMessages(newMessages)
            }

            setHasMore(data.length === MESSAGES_PER_PAGE)
        } catch (err) {
            console.error('Error fetching messages:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [conversationId, user])

    // Load older messages (pagination)
    const loadMore = useCallback(() => {
        if (messages.length > 0 && hasMore) {
            const oldestMessage = messages[0]
            fetchMessages(oldestMessage.created_at)
        }
    }, [messages, hasMore, fetchMessages])

    // Initial fetch and real-time subscription
    useEffect(() => {
        if (!conversationId) {
            setMessages([])
            return
        }

        fetchMessages()

        // Subscribe to new messages
        const channel = supabase
            .channel(`messages:${conversationId}`)
            .on('postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => {
                    // Fetch the full message with sender profile
                    supabase
                        .from('messages')
                        .select(`
                            id,
                            content,
                            created_at,
                            sender_id,
                            is_read,
                            profiles:sender_id (
                                username,
                                avatar_url
                            )
                        `)
                        .eq('id', payload.new.id)
                        .single()
                        .then(({ data }) => {
                            if (data) {
                                setMessages(prev => [...prev, data])
                            }
                        })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [conversationId, fetchMessages])

    // Send a message
    async function sendMessage(content) {
        if (!conversationId || !user || !content.trim()) return

        const { error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: user.id,
                content: content.trim()
            })

        if (error) {
            console.error('Error sending message:', error)
            throw error
        }
        // Note: Conversation list is sorted by lastMessageTime on client-side
        // No need to update conversations.updated_at
    }

    return {
        messages,
        loading,
        hasMore,
        error,
        loadMore,
        sendMessage,
        refetch: fetchMessages
    }
}
