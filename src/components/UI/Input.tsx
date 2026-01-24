import React from 'react'

type InputProps = {
    label: string
    type?: string
    placeholder?: string
    value?: string
    onChange?: (value: string) => void
    readOnly?: boolean
}

export default function Input({
    label,
    type = 'text',
    placeholder = '',
    value,
    onChange,
    readOnly = false,
}: InputProps) {
    const isControlled = typeof value !== 'undefined'

    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">{label}</label>

            <input
                type={type}
                placeholder={placeholder}
                value={isControlled ? value : undefined}
                readOnly={readOnly}
                onChange={
                    onChange
                        ? (e) => onChange(e.target.value)
                        : undefined
                }
                className={`px-3 py-2 rounded-xl bg-white/70 backdrop-blur border border-white/40
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}
                `}
            />
        </div>
    )
}
