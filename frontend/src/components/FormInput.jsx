import React from 'react';

const FormInput = ({
    label,
    id,
    name,
    type = 'text',
    placeholder,
    value,
    onChange,
    required = false,
    disabled = false,
    icon,
    error,
    className = ""
}) => {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {label && (
                <label htmlFor={id || name} className="text-sm font-semibold text-gray-700 flex items-center gap-1 whitespace-nowrap">
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                )}
                <input
                    id={id || name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={`w-full p-3 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900
                        ${icon ? 'pl-10' : 'pl-4'}
                        ${error ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}
                        ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}
                    `}
                />
            </div>
            {error && <span className="text-xs text-red-500 mt-1 animate-fadeIn">{error}</span>}
        </div>
    );
};

export default FormInput;
