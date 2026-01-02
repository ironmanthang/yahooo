import { useState } from 'react'
import { useUsers } from '../../hooks/useUsers'
import Avatar from '../Common/Avatar'
import Input from '../Common/Input'
import Button from '../Common/Button'

export default function UserSearchModal({ onClose, onSelectUser }) {
    const [search, setSearch] = useState('')
    const { users, loading } = useUsers(search)

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>New Chat</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        autoFocus
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
                                    className="user-list-item"
                                    onClick={() => onSelectUser(user)}
                                >
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
                </div>
            </div>
        </div>
    )
}
