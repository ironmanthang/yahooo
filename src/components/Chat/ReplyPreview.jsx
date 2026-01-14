import './ReplyPreview.css'

export default function ReplyPreview({ message, onCancel, compact = false }) {
    if (!message) return null

    const senderName = message.profiles?.username || 'Unknown'
    const content = message.content || ''
    const truncatedContent = content.length > 80 ? content.slice(0, 80) + '...' : content

    return (
        <div className={`reply-preview ${compact ? 'reply-preview-compact' : ''}`}>
            <div className="reply-preview-bar" />
            <div className="reply-preview-content">
                <span className="reply-preview-sender">{senderName}</span>
                <span className="reply-preview-text">{truncatedContent}</span>
            </div>
            {onCancel && (
                <button
                    className="reply-preview-cancel"
                    onClick={onCancel}
                    type="button"
                    aria-label="Cancel reply"
                >
                    ✕
                </button>
            )}
        </div>
    )
}
