import Avatar from '../Common/Avatar'

export default function MessageBubble({ message, isSent, isGroup = false }) {
    const { content, created_at, profiles, type } = message

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
                <p className="message-text">{content}</p>
                <span className="message-time">{formatTime(created_at)}</span>
            </div>
        </div>
    )
}
