import { useState, useRef, useEffect } from 'react'
import ReplyPreview from './ReplyPreview'

export default function MessageInput({ onSend, replyTo, onCancelReply }) {
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [justSent, setJustSent] = useState(false)
    const inputRef = useRef(null)

    // Refocus input after message is sent and component re-renders
    useEffect(() => {
        if (justSent && !sending) {
            inputRef.current?.focus()
            setJustSent(false)
        }
    }, [justSent, sending])

    // Focus input when starting a reply
    useEffect(() => {
        if (replyTo) {
            inputRef.current?.focus()
        }
    }, [replyTo])

    async function handleSubmit(e) {
        e.preventDefault()
        if (!message.trim() || sending) return

        setSending(true)
        try {
            // Pass replyToId if replying to a message
            await onSend(message, replyTo?.id || null)
            setMessage('')
            setJustSent(true)
            // Clear the reply after sending
            if (onCancelReply) {
                onCancelReply()
            }
        } catch (err) {
            console.error('Failed to send:', err)
        } finally {
            setSending(false)
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
        // Cancel reply with Escape
        if (e.key === 'Escape' && replyTo && onCancelReply) {
            onCancelReply()
        }
    }

    return (
        <div className="message-input-container">
            {/* Show reply preview when replying */}
            {replyTo && (
                <ReplyPreview
                    message={replyTo}
                    onCancel={onCancelReply}
                />
            )}

            <form className="message-input" onSubmit={handleSubmit}>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={replyTo ? "Reply to message..." : "Type a message..."}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={sending}
                    className="message-input-field"
                    autoComplete="off"
                />
                <button
                    type="submit"
                    className="message-send-btn"
                    disabled={!message.trim() || sending}
                >
                    {sending ? '...' : '➤'}
                </button>
            </form>
        </div>
    )
}
