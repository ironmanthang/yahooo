import '../../styles/components.css'

export default function Avatar({ src, name, size = 'md', status, className = '' }) {
    const initials = name ? name.slice(0, 2).toUpperCase() : '??'

    const sizeClass = {
        sm: 'avatar-sm',
        md: 'avatar-md',
        lg: 'avatar-lg'
    }[size] || 'avatar-md'

    return (
        <div className={`avatar ${sizeClass} ${className}`}>
            {src ? (
                <img src={src} alt={name} className="avatar-img" />
            ) : (
                <span className="avatar-initials">{initials}</span>
            )}
            {status && (
                <span className={`avatar-status avatar-status-${status}`} />
            )}
        </div>
    )
}
