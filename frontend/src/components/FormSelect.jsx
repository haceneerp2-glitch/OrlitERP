import React from 'react';

const FormSelect = ({
    label,
    id,
    name,
    options = [], // [{ value, label }]
    value,
    onChange,
    required = false,
    disabled = false,
    error,
    className = "",
    placeholder
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
                <select
                    id={id || name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    disabled={disabled}
                    className={`w-full p-3 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em] text-gray-900
                        ${error ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}
                        ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}
                    `}
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`
                    }}
                >
                    {placeholder && <option value="">{placeholder}</option>}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
            {error && <span className="text-xs text-red-500 mt-1 animate-fadeIn">{error}</span>}
        </div>
    );
};

export default FormSelect;
