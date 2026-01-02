import Avatar from '../Common/Avatar'

export default function MessageBubble({ message, isSent }) {
    const { content, created_at, profiles } = message

    function formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        })
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
                <p className="message-text">{content}</p>
                <span className="message-time">{formatTime(created_at)}</span>
            </div>
        </div>
    )
}
