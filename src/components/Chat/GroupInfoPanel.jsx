import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Avatar from '../Common/Avatar'
import AddMemberModal from './AddMemberModal'

export default function GroupInfoPanel({ conversation, onClose, onLeaveGroup, onAddMembers, onRemoveMember, onDeleteGroup }) {
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [memberToRemove, setMemberToRemove] = useState(null)
    const [leaving, setLeaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const { user } = useAuth()

    if (!conversation) return null

    const { name, participants = [] } = conversation

    // Get initials from group name (first 2 letters of first 2 words)
    const getInitials = (groupName) => {
        if (!groupName) return 'G'
        const words = groupName.trim().split(/\s+/)
        if (words.length === 1) {
            return words[0].substring(0, 2).toUpperCase()
        }
        return (words[0][0] + words[1][0]).toUpperCase()
    }

    async function handleLeaveGroup() {
        setLeaving(true)
        try {
            await onLeaveGroup()
            onClose()
        } catch (err) {
            console.error('Error leaving group:', err)
            setLeaving(false)
        }
    }

    async function handleAddMembers(userIds) {
        if (!onAddMembers) return
        await onAddMembers(conversation.id, userIds)
    }

    async function handleRemoveMember() {
        if (!memberToRemove || !onRemoveMember) return

        try {
            await onRemoveMember(conversation.id, memberToRemove.id)
            setMemberToRemove(null)
        } catch (err) {
            console.error('Error removing member:', err)
        }
    }

    // Check if current user is admin
    const currentParticipant = participants.find(p => p.id === user?.id)
    const isAdmin = currentParticipant?.role === 'admin'

    async function handleDeleteGroup() {
        if (!onDeleteGroup) return
        setDeleting(true)
        try {
            await onDeleteGroup(conversation.id)
            onClose()
        } catch (err) {
            console.error('Error deleting group:', err)
            setDeleting(false)
        }
    }

    // Leave confirmation modal
    if (showLeaveConfirm) {
        return (
            <div className="modal-overlay" onClick={() => setShowLeaveConfirm(false)}>
                <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Leave Group?</h2>
                        <button className="modal-close" onClick={() => setShowLeaveConfirm(false)}>×</button>
                    </div>
                    <div className="modal-body">
                        <p className="confirm-text">
                            Are you sure you want to leave <strong>{name}</strong>?
                        </p>
                        <p className="confirm-hint">
                            You won't be able to see messages from this group anymore.
                        </p>
                    </div>
                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowLeaveConfirm(false)}
                            disabled={leaving}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={handleLeaveGroup}
                            disabled={leaving}
                        >
                            {leaving ? 'Leaving...' : 'Leave Group'}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Remove member confirmation modal
    if (memberToRemove) {
        return (
            <div className="modal-overlay" onClick={() => setMemberToRemove(null)}>
                <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Remove Member?</h2>
                        <button className="modal-close" onClick={() => setMemberToRemove(null)}>×</button>
                    </div>
                    <div className="modal-body">
                        <p className="confirm-text">
                            Are you sure you want to remove <strong>{memberToRemove.username}</strong> from the group?
                        </p>
                    </div>
                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setMemberToRemove(null)}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={handleRemoveMember}
                        >
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Add Member Modal
    if (showAddModal) {
        return (
            <AddMemberModal
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddMembers}
                existingMemberIds={participants.map(p => p.id)}
            />
        )
    }

    // Delete group confirmation modal
    if (showDeleteConfirm) {
        return (
            <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Delete Group?</h2>
                        <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>×</button>
                    </div>
                    <div className="modal-body">
                        <p className="confirm-text">
                            Are you sure you want to permanently delete <strong>{name}</strong>?
                        </p>
                        <p className="confirm-hint confirm-hint-danger">
                            This action cannot be undone. All messages and members will be removed.
                        </p>
                    </div>
                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={deleting}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={handleDeleteGroup}
                            disabled={deleting}
                        >
                            {deleting ? 'Deleting...' : 'Delete Group'}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal group-info-panel" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Group Info</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {/* Group header with avatar and name */}
                    <div className="group-info-header">
                        <div className="group-avatar group-avatar-lg">
                            <span className="group-avatar-text">{getInitials(name)}</span>
                        </div>
                        <div className="group-info-name">
                            <h3>{name || 'Unnamed Group'}</h3>
                            <span className="group-info-count">
                                {participants.length} members
                            </span>
                        </div>
                    </div>

                    {/* Member list */}
                    <div className="group-info-members">
                        <div className="members-header">
                            <h4>Members</h4>
                            {isAdmin && (
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => setShowAddModal(true)}
                                >
                                    + Add
                                </button>
                            )}
                        </div>
                        <div className="member-list">
                            {participants.map(member => (
                                <div key={member.id} className="member-list-item">
                                    <Avatar
                                        src={member.avatar_url}
                                        name={member.username}
                                        status={member.status}
                                        size="md"
                                    />
                                    <span className="member-name">{member.username}</span>
                                    {member.role === 'admin' && (
                                        <span className="member-role-badge">Admin</span>
                                    )}
                                    {isAdmin && member.id !== user.id && (
                                        <button
                                            className="member-action-btn"
                                            title="Remove member"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setMemberToRemove(member)
                                            }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="modal-footer group-info-footer">
                    <div className="group-info-actions">
                        <button
                            className="btn btn-danger"
                            onClick={() => setShowLeaveConfirm(true)}
                        >
                            Leave Group
                        </button>
                        {isAdmin && (
                            <button
                                className="btn btn-danger-outline"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                Delete Group
                            </button>
                        )}
                    </div>
                    <button className="btn btn-secondary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
