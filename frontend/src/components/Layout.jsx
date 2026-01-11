import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
            <Sidebar />
            <div className="flex-1 p-8 overflow-auto">
                <div className="animate-fadeIn">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
