import { useState, useRef, useEffect } from 'react'

export default function MessageInput({ onSend }) {
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

    async function handleSubmit(e) {
        e.preventDefault()
        if (!message.trim() || sending) return

        setSending(true)
        try {
            await onSend(message)
            setMessage('')
            setJustSent(true)
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
    }

    return (
        <form className="message-input" onSubmit={handleSubmit}>
            <input
                ref={inputRef}
                type="text"
                placeholder="Type a message..."
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
    )
}
