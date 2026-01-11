import React from 'react';

const FormSection = ({ title, icon, children, className = "" }) => {
    return (
        <div className={`mb-8 ${className}`}>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                {icon && <span className="text-xl">{icon}</span>}
                <h4 className="text-lg font-bold text-gray-800 uppercase tracking-wide">{title}</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {children}
            </div>
        </div>
    );
};

export default FormSection;
