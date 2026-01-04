import { useState } from 'react'
import { useUsers } from '../../hooks/useUsers'
import Avatar from '../Common/Avatar'
import Input from '../Common/Input'
import Button from '../Common/Button'

export default function AddMemberModal({ onClose, onAdd, existingMemberIds = [] }) {
    const [search, setSearch] = useState('')
    const [selectedUsers, setSelectedUsers] = useState([])
    const [adding, setAdding] = useState(false)
    const { users, loading } = useUsers(search)

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

    // Filter out users who are already members
    const availableUsers = users.filter(u => !existingMemberIds.includes(u.id))

    async function handleAdd() {
        if (selectedUsers.length === 0) return

        setAdding(true)
        try {
            await onAdd(selectedUsers.map(u => u.id))
            onClose()
        } catch (err) {
            console.error('Error adding members:', err)
        } finally {
            setAdding(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add Members</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {/* Selected users chips */}
                    {selectedUsers.length > 0 && (
                        <div className="selected-users">
                            {selectedUsers.map(user => (
                                <div key={user.id} className="selected-user-chip">
                                    <span>{user.username}</span>
                                    <button
                                        className="chip-remove"
                                        onClick={() => toggleUser(user)}
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
                        autoFocus
                    />

                    <div className="user-list">
                        {loading ? (
                            <div className="user-list-loading">Searching...</div>
                        ) : availableUsers.length === 0 ? (
                            <div className="user-list-empty">
                                {search ? 'No new users found' : 'Type to search users'}
                            </div>
                        ) : (
                            availableUsers.map(user => (
                                <div
                                    key={user.id}
                                    className={`user-list-item ${isSelected(user.id) ? 'user-list-item-selected' : ''}`}
                                    onClick={() => toggleUser(user)}
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
                        onClick={handleAdd}
                        disabled={selectedUsers.length === 0 || adding}
                        loading={adding}
                    >
                        Add {selectedUsers.length} Member{selectedUsers.length !== 1 ? 's' : ''}
                    </Button>
                </div>
            </div>
        </div>
    )
}
