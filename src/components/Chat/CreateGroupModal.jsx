import { useState } from 'react'
import { useUsers } from '../../hooks/useUsers'
import { useAuth } from '../../contexts/AuthContext'
import Avatar from '../Common/Avatar'
import Input from '../Common/Input'
import Button from '../Common/Button'

export default function CreateGroupModal({ onClose, onCreateGroup, existingGroups = [] }) {
    const [groupName, setGroupName] = useState('')
    const [search, setSearch] = useState('')
    const [selectedUsers, setSelectedUsers] = useState([])
    const [creating, setCreating] = useState(false)
    const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
    const { users, loading } = useUsers(search)
    const { user } = useAuth()

    function toggleUser(user) {
        setSelectedUsers(prev => {
            const exists = prev.find(u => u.id === user.id)
            if (exists) {
                return prev.filter(u => u.id !== user.id)
            } else {
                return [...prev, user]
            }
        })
    }

    function isSelected(userId) {
        return selectedUsers.some(u => u.id === userId)
    }

    // Check for duplicate group (same name + same members)
    function checkForDuplicate(name, memberIds) {
        // Include current user (creator) in comparison since existing groups have creator as participant
        const allMemberIds = user ? [...memberIds, user.id].sort() : [...memberIds].sort()
        return existingGroups.find(group => {
            // Case-insensitive name comparison
            if (group.name?.toLowerCase() !== name.toLowerCase()) return false

            // Check if member sets match (existing group includes creator)
            const groupMemberIds = group.participants?.map(p => p.id).sort() || []
            if (groupMemberIds.length !== allMemberIds.length) return false
            return groupMemberIds.every((id, idx) => id === allMemberIds[idx])
        })
    }


    async function handleCreate() {
        if (!groupName.trim() || selectedUsers.length < 2) return

        // Check for duplicate before creating
        const memberIds = selectedUsers.map(u => u.id)
        const duplicate = checkForDuplicate(groupName.trim(), memberIds)

        if (duplicate && !showDuplicateWarning) {
            setShowDuplicateWarning(true)
            return  // Show warning first, don't create yet
        }

        setCreating(true)
        try {
            await onCreateGroup(groupName.trim(), memberIds)
            onClose()
        } catch (err) {
            console.error('Error creating group:', err)
        } finally {
            setCreating(false)
        }
    }

    // Reset warning when name or members change
    function handleNameChange(e) {
        setGroupName(e.target.value)
        setShowDuplicateWarning(false)
    }

    function toggleUserWithReset(user) {
        toggleUser(user)
        setShowDuplicateWarning(false)
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create Group</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <Input
                        placeholder="Group name..."
                        value={groupName}
                        onChange={handleNameChange}
                        autoFocus
                    />

                    {/* Duplicate warning */}
                    {showDuplicateWarning && (
                        <div className="duplicate-warning">
                            ⚠️ A group with this name and members already exists.
                        </div>
                    )}

                    {/* Selected users chips */}
                    {selectedUsers.length > 0 && (
                        <div className="selected-users">
                            {selectedUsers.map(user => (
                                <div key={user.id} className="selected-user-chip">
                                    <span>{user.username}</span>
                                    <button
                                        className="chip-remove"
                                        onClick={() => toggleUserWithReset(user)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <Input
                        placeholder="Search users to add..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />

                    <div className="user-list">
                        {loading ? (
                            <div className="user-list-loading">Searching...</div>
                        ) : users.length === 0 ? (
                            <div className="user-list-empty">
                                {search ? 'No users found' : 'Type to search users'}
                            </div>
                        ) : (
                            users.map(user => (
                                <div
                                    key={user.id}
                                    className={`user-list-item ${isSelected(user.id) ? 'user-list-item-selected' : ''}`}
                                    onClick={() => toggleUserWithReset(user)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected(user.id)}
                                        onChange={() => { }}
                                        className="user-checkbox"
                                    />
                                    <Avatar
                                        src={user.avatar_url}
                                        name={user.username}
                                        status={user.status}
                                        size="md"
                                    />
                                    <span className="user-list-name">{user.username}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button
                        variant="primary"
                        onClick={handleCreate}
                        disabled={!groupName.trim() || selectedUsers.length < 2 || creating}
                        loading={creating}
                    >
                        {showDuplicateWarning ? 'Create Anyway' : `Create Group (${selectedUsers.length} members)`}
                    </Button>
                </div>
            </div>
        </div>
    )
}
