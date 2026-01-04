import Avatar from '../Common/Avatar'

export default function ConversationItem({ conversation, isActive, onClick }) {
    const { type, otherUser, name, participants, lastMessage, lastMessageTime } = conversation

    // Determine display info based on conversation type
    const isGroup = type === 'group'
    const displayName = isGroup ? name : otherUser?.username || 'Unknown'
    const displayAvatar = isGroup ? null : otherUser?.avatar_url
    const displayStatus = isGroup ? null : otherUser?.status

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

    // Generate initials for group avatar
    function getGroupInitials(groupName) {
        return groupName
            .split(' ')
            .map(word => word[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
    }

    return (
        <div
            className={`conversation-item ${isActive ? 'conversation-item-active' : ''}`}
            onClick={onClick}
        >
            {isGroup ? (
                <div className="group-avatar">
                    <span className="group-avatar-text">{getGroupInitials(name)}</span>
                </div>
            ) : (
                <Avatar
                    src={displayAvatar}
                    name={displayName}
                    status={displayStatus}
                    size="md"
                />
            )}
            <div className="conversation-info">
                <div className="conversation-header">
                    <span className="conversation-name">{displayName}</span>
                    <span className="conversation-time">{formatTime(lastMessageTime)}</span>
                </div>
                {isGroup && participants && (
                    <span className="conversation-members">{participants.length} members</span>
                )}
                <p className="conversation-preview">
                    {lastMessage || 'No messages yet'}
                </p>
            </div>
        </div>
    )
}

