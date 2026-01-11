import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';
import LanguageSwitcher from './LanguageSwitcher';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const addToast = useToastStore((state) => state.addToast);
    const { t } = useTranslation();

    const menuItems = [
        { path: '/', labelKey: 'menu.dashboard', icon: '📊' },
        { path: '/suppliers', labelKey: 'menu.suppliers', icon: '🏭' },
        { path: '/customers', labelKey: 'menu.customers', icon: '👥' },
        { path: '/items', labelKey: 'menu.items', icon: '📦' },
        { path: '/products', labelKey: 'menu.products', icon: '🏷️' },
        { path: '/employees', labelKey: 'menu.employees', icon: '👔' },
        { path: '/attendance', labelKey: 'menu.attendance', icon: '📅' },
        { path: '/leaves', labelKey: 'menu.leaveRequests', icon: '🏖️' },
        { path: '/inventory', labelKey: 'menu.inventoryLevels', icon: '📈' },
        { path: '/movements', labelKey: 'menu.stockMovements', icon: '🔄' },
        { path: '/orders', labelKey: 'menu.orders', icon: '🛒' },
        { path: '/invoices', labelKey: 'menu.invoices', icon: '💰' },
        { path: '/production', labelKey: 'menu.manufacturing', icon: '⚙️' },
    ];

    const handleLogout = () => {
        logout();
        addToast(t('auth.logoutSuccess'), 'success');
        navigate('/login');
    };

    return (
        <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen p-4 flex flex-col">
            <div className="mb-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    OrlitERP
                </h1>
                {user && (
                    <div className="mt-2 text-sm text-gray-400">
                        <span className="block">{user.username}</span>
                        <span className="inline-block px-2 py-0.5 text-xs bg-blue-600/30 text-blue-300 rounded-full mt-1">
                            {user.role}
                        </span>
                    </div>
                )}
            </div>

            <nav className="flex-1 overflow-y-auto">
                <ul className="space-y-1">
                    {menuItems.map((item, index) => (
                        <li
                            key={item.path}
                            className="animate-slideIn"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <Link
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 transform hover:scale-[1.02] ${location.pathname === item.path
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25'
                                        : 'hover:bg-white/10'
                                    }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span className="font-medium">{t(item.labelKey)}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="pt-4 border-t border-gray-700 space-y-3">
                <div className="flex justify-center">
                    <LanguageSwitcher />
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-all duration-300"
                >
                    <span className="text-lg">🚪</span>
                    <span className="font-medium">{t('auth.logout')}</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
