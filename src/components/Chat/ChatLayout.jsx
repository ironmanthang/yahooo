import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import GroupInfoPanel from './GroupInfoPanel'
import { useMessages } from '../../hooks/useMessages'
import { useConversations } from '../../hooks/useConversations'
import '../../styles/chat.css'

export default function ChatLayout() {
    const [activeConversationId, setActiveConversationId] = useState(null)
    const [pendingUser, setPendingUser] = useState(null)  // User info before conversations refetch
    const [pendingGroup, setPendingGroup] = useState(null)  // Group info before conversations refetch
    const [showGroupInfo, setShowGroupInfo] = useState(false)  // Group info panel visibility
    const [replyTo, setReplyTo] = useState(null)  // Message being replied to
    const {
        conversations,
        loading: convsLoading,
        getOrCreateConversation,
        createGroupConversation,
        leaveGroup,
        addMembersToGroup,
        removeMemberFromGroup,
        deleteGroup
    } = useConversations()
    const { messages, loading: msgsLoading, hasMore, loadMore, sendMessage } = useMessages(activeConversationId)

    // Find active conversation details
    const activeConversation = conversations.find(c => c.id === activeConversationId)

    // Use pending user as fallback until conversations refetch
    const displayUser = activeConversation?.otherUser || pendingUser

    // Determine header display based on conversation type
    // Use pendingGroup as fallback for newly created groups
    const isGroup = activeConversation?.type === 'group' || pendingGroup
    const headerTitle = isGroup
        ? (activeConversation?.name || pendingGroup?.name || 'Group')
        : displayUser?.username || 'Chat'
    const headerSubtitle = isGroup
        ? `${activeConversation?.participants?.length || pendingGroup?.memberCount || 0} members`
        : displayUser?.status || 'offline'

    async function handleStartConversation(userId, userProfile) {
        try {
            setPendingUser(userProfile)  // Show user info immediately
            const conversationId = await getOrCreateConversation(userId)
            setActiveConversationId(conversationId)
        } catch (err) {
            console.error('Error starting conversation:', err)
            setPendingUser(null)
        }
    }

    async function handleCreateGroup(name, participantIds) {
        // Set pending group info immediately for header display
        setPendingGroup({ name, memberCount: participantIds.length + 1 })  // +1 for creator
        const conversationId = await createGroupConversation(name, participantIds)
        setActiveConversationId(conversationId)
        return conversationId
    }

    // Clear pending states once real conversation data loads
    useEffect(() => {
        if (activeConversation) {
            if (pendingUser) setPendingUser(null)
            if (pendingGroup) setPendingGroup(null)
        }
    }, [activeConversation, pendingUser, pendingGroup])

    async function handleSendMessage(content, replyToId = null) {
        try {
            await sendMessage(content, replyToId)
        } catch (err) {
            console.error('Error sending:', err)
        }
    }

    // Handle reply to a message
    function handleReply(message) {
        setReplyTo(message)
    }

    // Clear reply when switching conversations
    useEffect(() => {
        setReplyTo(null)
    }, [activeConversationId])

    async function handleLeaveGroup() {
        if (!activeConversationId) return
        try {
            await leaveGroup(activeConversationId)
            setActiveConversationId(null)  // Clear active conversation
            setShowGroupInfo(false)  // Close panel
        } catch (err) {
            console.error('Error leaving group:', err)
        }
    }

    async function handleDeleteGroup(conversationId) {
        try {
            await deleteGroup(conversationId)
            setActiveConversationId(null)  // Clear active conversation
            setShowGroupInfo(false)  // Close panel
        } catch (err) {
            console.error('Error deleting group:', err)
        }
    }

    return (
        <div className="chat-layout">
            <Sidebar
                conversations={conversations}
                loading={convsLoading}
                activeId={activeConversationId}
                onSelectConversation={(convId) => {
                    setPendingUser(null)  // Clear pending when selecting existing
                    setPendingGroup(null)  // Clear pending group too
                    setActiveConversationId(convId)
                }}
                onStartConversation={handleStartConversation}
                onCreateGroup={handleCreateGroup}
            />

            <main className="chat-main">
                {activeConversationId ? (
                    <>
                        <header
                            className={`chat-header ${isGroup ? 'chat-header-clickable' : ''}`}
                            onClick={() => isGroup && setShowGroupInfo(true)}
                        >
                            <div className="chat-header-user">
                                <h2>{headerTitle}</h2>
                                <span className="chat-header-status">
                                    {headerSubtitle}
                                </span>
                            </div>
                        </header>

                        <MessageList
                            messages={messages}
                            loading={msgsLoading}
                            hasMore={hasMore}
                            onLoadMore={loadMore}
                            isGroup={isGroup}
                            onReply={handleReply}
                        />

                        <MessageInput
                            onSend={handleSendMessage}
                            replyTo={replyTo}
                            onCancelReply={() => setReplyTo(null)}
                        />
                    </>
                ) : (
                    <div className="chat-empty">
                        <div className="chat-empty-content">
                            <span className="chat-empty-icon">💬</span>
                            <h2>Welcome to Yahooo</h2>
                            <p>Select a conversation or start a new chat</p>
                        </div>
                    </div>
                )}
            </main>

            {/* Group Info Panel */}
            {showGroupInfo && isGroup && (
                <GroupInfoPanel
                    conversation={activeConversation}
                    onClose={() => setShowGroupInfo(false)}
                    onLeaveGroup={handleLeaveGroup}
                    onAddMembers={addMembersToGroup}
                    onRemoveMember={removeMemberFromGroup}
                    onDeleteGroup={handleDeleteGroup}
                />
            )}
        </div>
    )
}

