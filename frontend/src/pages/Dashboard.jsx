import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import useToastStore from '../store/toastStore';
import { getErrorMessage } from '../utils/errorHandler';

const Dashboard = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState(null);
    const addToast = useToastStore((state) => state.addToast);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/dashboard/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            addToast(getErrorMessage(error), 'error');
        }
    };

    if (!stats) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">{t('dashboard.title')}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500 transform hover:-translate-y-1">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{t('dashboard.totalSales')}</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">${stats.financials.total_sales.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-green-500 transform hover:-translate-y-1">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{t('dashboard.totalPurchases')}</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">${stats.financials.total_purchases.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-red-500 transform hover:-translate-y-1">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{t('dashboard.pendingInvoices')}</h3>
                    <p className="text-3xl font-bold text-red-600 mt-2">{stats.financials.pending_invoices}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-purple-500 transform hover:-translate-y-1">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{t('dashboard.activeProduction')}</h3>
                    <p className="text-3xl font-bold text-purple-600 mt-2">{stats.production.active_mos}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                        <span className="p-2 bg-blue-50 rounded-lg text-blue-600">📊</span>
                        {t('dashboard.masterDataOverview')}
                    </h3>
                    <ul className="space-y-4">
                        <li className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                            <span className="flex items-center gap-3">
                                <span className="text-2xl">👥</span>
                                <span className="font-medium text-gray-700">{t('menu.customers')}</span>
                            </span>
                            <span className="px-4 py-1 bg-blue-100 text-blue-700 font-bold rounded-full">{stats.counts.customers}</span>
                        </li>
                        <li className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                            <span className="flex items-center gap-3">
                                <span className="text-2xl">🏭</span>
                                <span className="font-medium text-gray-700">{t('menu.suppliers')}</span>
                            </span>
                            <span className="px-4 py-1 bg-blue-100 text-blue-700 font-bold rounded-full">{stats.counts.suppliers}</span>
                        </li>
                        <li className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                            <span className="flex items-center gap-3">
                                <span className="text-2xl">📦</span>
                                <span className="font-medium text-gray-700">{t('menu.items')}</span>
                            </span>
                            <span className="px-4 py-1 bg-blue-100 text-blue-700 font-bold rounded-full">{stats.counts.items}</span>
                        </li>
                        <li className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                            <span className="flex items-center gap-3">
                                <span className="text-2xl">👔</span>
                                <span className="font-medium text-gray-700">{t('menu.employees')}</span>
                            </span>
                            <span className="px-4 py-1 bg-blue-100 text-blue-700 font-bold rounded-full">{stats.counts.employees}</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                        <span className="p-2 bg-red-50 rounded-lg text-red-600">🔔</span>
                        {t('dashboard.inventoryAlerts')}
                    </h3>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-500 text-white rounded-xl shadow-lg animate-pulse">
                                    ⚠️
                                </div>
                                <div>
                                    <p className="text-red-800 font-bold text-lg">{t('dashboard.lowStockItems')}</p>
                                    <p className="text-red-600 text-sm">{t('inventory.thresholds') || 'Immediate attention required'}</p>
                                </div>
                            </div>
                            <span className="text-4xl font-black text-red-700">{stats.inventory.low_stock_items}</span>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 italic text-blue-800 text-sm">
                            {t('common.additionalInfo') || 'View the inventory section for more details.'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
