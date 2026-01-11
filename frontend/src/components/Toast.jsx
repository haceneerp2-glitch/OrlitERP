import React, { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500',
    }[type];

    const icon = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
    }[type];

    return (
        <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center justify-between min-w-[300px] max-w-[500px] animate-slideInRight mb-4`}>
            <div className="flex items-center gap-3">
                <span className="text-xl font-bold">{icon}</span>
                <span className="font-medium">{message}</span>
            </div>
            <button
                onClick={onClose}
                className="ml-4 text-white hover:text-gray-200 font-bold text-xl leading-none"
            >
                ×
            </button>
        </div>
    );
};

export default Toast;

