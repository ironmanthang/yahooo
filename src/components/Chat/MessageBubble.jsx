import Avatar from '../Common/Avatar'
import ReplyPreview from './ReplyPreview'

export default function MessageBubble({ message, isSent, isGroup = false, onReply }) {
    const { content, created_at, profiles, type, replied_message } = message

    function formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // System messages have special styling
    if (type === 'system') {
        return (
            <div className="system-message">
                <span className="system-message-text">{content}</span>
                <span className="system-message-time">{formatTime(created_at)}</span>
            </div>
        )
    }

    return (
        <div className={`message-bubble ${isSent ? 'message-sent' : 'message-received'}`}>
            {!isSent && (
                <Avatar
                    src={profiles?.avatar_url}
                    name={profiles?.username}
                    size="sm"
                />
            )}
            <div className="message-content">
                {!isSent && isGroup && (
                    <span className="message-sender-name">{profiles?.username}</span>
                )}

                {/* Show quoted message if this is a reply */}
                {replied_message && (
                    <ReplyPreview message={replied_message} compact />
                )}

                <p className="message-text">{content}</p>
                <div className="message-footer">
                    <span className="message-time">{formatTime(created_at)}</span>
                </div>
            </div>

            {/* Reply action button */}
            {onReply && (
                <button
                    className="message-action-btn reply-btn"
                    onClick={() => onReply(message)}
                    aria-label="Reply to message"
                    title="Reply"
                >
                    ↩
                </button>
            )}
        </div>
    )
}
