import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import Button from '../Common/Button'
import { useAuth } from '../../contexts/AuthContext'

export default function MessageList({ messages, loading, hasMore, onLoadMore, isGroup = false }) {
    const { user } = useAuth()
    const bottomRef = useRef(null)
    const containerRef = useRef(null)

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    return (
        <div className="message-list" ref={containerRef}>
            {hasMore && (
                <div className="message-list-loadmore">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onLoadMore}
                        loading={loading}
                    >
                        Load older messages
                    </Button>
                </div>
            )}

            {loading && messages.length === 0 ? (
                <div className="message-list-loading">Loading messages...</div>
            ) : messages.length === 0 ? (
                <div className="message-list-empty">
                    <p>No messages yet</p>
                    <p className="message-list-hint">Send a message to start the conversation</p>
                </div>
            ) : (
                messages.map(msg => (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        isSent={msg.sender_id === user?.id}
                        isGroup={isGroup}
                    />
                ))
            )}

            <div ref={bottomRef} />
        </div>
    )
}

