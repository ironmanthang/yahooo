import Avatar from '../Common/Avatar'

export default function ConversationItem({ conversation, isActive, onClick }) {
    const { otherUser, lastMessage, lastMessageTime } = conversation

    function formatTime(timestamp) {
        if (!timestamp) return ''
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now - date

        // Today: show time
        if (diff < 24 * 60 * 60 * 1000) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        // This week: show day
        if (diff < 7 * 24 * 60 * 60 * 1000) {
            return date.toLocaleDateString([], { weekday: 'short' })
        }
        // Older: show date
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }

    return (
        <div
            className={`conversation-item ${isActive ? 'conversation-item-active' : ''}`}
            onClick={onClick}
        >
            <Avatar
                src={otherUser?.avatar_url}
                name={otherUser?.username}
                status={otherUser?.status}
                size="md"
            />
            <div className="conversation-info">
                <div className="conversation-header">
                    <span className="conversation-name">{otherUser?.username || 'Unknown'}</span>
                    <span className="conversation-time">{formatTime(lastMessageTime)}</span>
                </div>
                <p className="conversation-preview">
                    {lastMessage || 'No messages yet'}
                </p>
            </div>
        </div>
    )
}
