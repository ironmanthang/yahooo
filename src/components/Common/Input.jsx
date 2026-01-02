import '../../styles/components.css'

export default function Input({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    disabled = false,
    id,
    className = '',
    ...props
}) {
    return (
        <div className={`input-group ${error ? 'input-error' : ''} ${className}`}>
            {label && <label htmlFor={id} className="input-label">{label}</label>}
            <input
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="input-field"
                {...props}
            />
            {error && <span className="input-error-text">{error}</span>}
        </div>
    )
}
