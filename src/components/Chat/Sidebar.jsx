import { useState, useRef, useEffect } from 'react'
import ConversationItem from './ConversationItem'
import UserSearchModal from './UserSearchModal'
import Avatar from '../Common/Avatar'
import Button from '../Common/Button'
import { useAuth } from '../../contexts/AuthContext'

export default function Sidebar({
    conversations,
    loading,
    activeId,
    onSelectConversation,
    onStartConversation
}) {
    const [showSearch, setShowSearch] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const settingsRef = useRef(null)
    const { profile, signOut } = useAuth()

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (settingsRef.current && !settingsRef.current.contains(e.target)) {
                setShowSettings(false)
            }
        }

        if (showSettings) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showSettings])

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => setShowSearch(true)}
                >
                    + New Chat
                </Button>
            </div>

            <div className="sidebar-conversations">
                {loading ? (
                    <div className="sidebar-loading">Loading...</div>
                ) : conversations.length === 0 ? (
                    <div className="sidebar-empty">
                        <p>No conversations yet</p>
                        <p className="sidebar-empty-hint">Click "New Chat" to start</p>
                    </div>
                ) : (
                    conversations.map(conv => (
                        <ConversationItem
                            key={conv.id}
                            conversation={conv}
                            isActive={conv.id === activeId}
                            onClick={() => onSelectConversation(conv.id)}
                        />
                    ))
                )}
            </div>

            <div className="sidebar-footer">
                <div className="sidebar-user-info">
                    <Avatar
                        src={profile?.avatar_url}
                        name={profile?.username}
                        size="sm"
                    />
                    <span className="sidebar-username">{profile?.username || 'User'}</span>
                </div>
                <div className="sidebar-settings" ref={settingsRef}>
                    <button
                        className="settings-btn"
                        onClick={() => setShowSettings(!showSettings)}
                        aria-label="Settings"
                    >
                        ⚙️
                    </button>
                    {showSettings && (
                        <div className="settings-dropdown">
                            <button className="settings-dropdown-item" onClick={signOut}>
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showSearch && (
                <UserSearchModal
                    onClose={() => setShowSearch(false)}
                    onSelectUser={(user) => {
                        onStartConversation(user.id, user)
                        setShowSearch(false)
                    }}
                />
            )}
        </aside>
    )
}
