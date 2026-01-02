import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import { useMessages } from '../../hooks/useMessages'
import { useConversations } from '../../hooks/useConversations'
import '../../styles/chat.css'

export default function ChatLayout() {
    const [activeConversationId, setActiveConversationId] = useState(null)
    const [pendingUser, setPendingUser] = useState(null)  // User info before conversations refetch
    const { conversations, loading: convsLoading, getOrCreateConversation } = useConversations()
    const { messages, loading: msgsLoading, hasMore, loadMore, sendMessage } = useMessages(activeConversationId)

    // Find active conversation details
    const activeConversation = conversations.find(c => c.id === activeConversationId)

    // Use pending user as fallback until conversations refetch
    const displayUser = activeConversation?.otherUser || pendingUser

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

    // Clear pendingUser once real conversation data loads
    useEffect(() => {
        if (activeConversation && pendingUser) {
            setPendingUser(null)
        }
    }, [activeConversation, pendingUser])

    async function handleSendMessage(content) {
        try {
            await sendMessage(content)
        } catch (err) {
            console.error('Error sending:', err)
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
                    setActiveConversationId(convId)
                }}
                onStartConversation={handleStartConversation}
            />

            <main className="chat-main">
                {activeConversationId ? (
                    <>
                        <header className="chat-header">
                            <div className="chat-header-user">
                                <h2>{displayUser?.username || 'Chat'}</h2>
                                <span className="chat-header-status">
                                    {displayUser?.status || 'offline'}
                                </span>
                            </div>
                        </header>

                        <MessageList
                            messages={messages}
                            loading={msgsLoading}
                            hasMore={hasMore}
                            onLoadMore={loadMore}
                        />

                        <MessageInput onSend={handleSendMessage} />
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
        </div>
    )
}
 