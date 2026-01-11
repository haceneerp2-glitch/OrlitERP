import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import useToastStore from '../store/toastStore';
import { getErrorMessage } from '../utils/errorHandler';
import ConfirmDialog from '../components/ConfirmDialog';

const Customers = () => {
    const { t } = useTranslation();
    const [customers, setCustomers] = useState([]);
    const [formData, setFormData] = useState({
        full_name: '',
        contact_info: '',
        address: '',
    });
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, name: '' });
    
    const addToast = useToastStore((state) => state.addToast);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setFetching(true);
        try {
            const response = await api.get('/master-data/customers/');
            setCustomers(response.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
            addToast(getErrorMessage(error), 'error');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (customer) => {
        setFormData({
            full_name: customer.full_name,
            contact_info: customer.contact_info || '',
            address: customer.address || '',
        });
        setEditingId(customer.customer_id);
        setShowForm(true);
    };

    const handleDeleteClick = (customer) => {
        setDeleteConfirm({
            isOpen: true,
            id: customer.customer_id,
            name: customer.full_name,
        });
    };

    const handleDelete = async () => {
        if (!deleteConfirm.id) return;
        
        try {
            await api.delete(`/master-data/customers/${deleteConfirm.id}`);
            addToast(`${t('customers.deletedSuccess')}: "${deleteConfirm.name}"`, 'success');
            fetchCustomers();
        } catch (error) {
            console.error('Error deleting customer:', error);
            addToast(getErrorMessage(error), 'error');
        } finally {
            setDeleteConfirm({ isOpen: false, id: null, name: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await api.put(`/master-data/customers/${editingId}`, formData);
                addToast(t('customers.updatedSuccess'), 'success');
            } else {
                await api.post('/master-data/customers/', formData);
                addToast(t('customers.createdSuccess'), 'success');
            }
            fetchCustomers();
            setFormData({
                full_name: '',
                contact_info: '',
                address: '',
            });
            setShowForm(false);
            setEditingId(null);
        } catch (error) {
            console.error('Error saving customer:', error);
            addToast(getErrorMessage(error), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            full_name: '',
            contact_info: '',
            address: '',
        });
    };

    if (fetching && customers.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{t('customers.title')}</h2>
                <button
                    onClick={() => {
                        if (showForm) handleCancel();
                        else setShowForm(true);
                    }}
                    className={`px-4 py-2 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg ${showForm
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                        }`}
                >
                    {showForm ? t('common.cancel') : `+ ${t('customers.addCustomer')}`}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-xl shadow-lg animate-slideIn">
                    <h3 className="text-lg font-semibold mb-4">{editingId ? t('customers.editCustomer') : t('customers.newCustomer')}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('customers.fullName')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="full_name"
                                name="full_name"
                                placeholder={t('customers.fullName')}
                                value={formData.full_name}
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label htmlFor="contact_info" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('customers.contactInfo')}
                            </label>
                            <input
                                type="text"
                                id="contact_info"
                                name="contact_info"
                                placeholder={t('customers.contactInfo')}
                                value={formData.contact_info}
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                disabled={loading}
                            />
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('customers.address')}
                            </label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                placeholder={t('customers.address')}
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                        >
                            {loading && (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {editingId ? t('customers.updateCustomer') : t('customers.saveCustomer')}
                        </button>
                    </div>
                </form>
            )}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {fetching && customers.length > 0 ? (
                    <div className="p-4 text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Refreshing...</span>
                    </div>
                ) : null}
                <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('customers.fullName')}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('customers.contactInfo')}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('customers.address')}</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {customers.map((customer, index) => (
                            <tr
                                key={customer.customer_id}
                                className="hover:bg-gray-50 transition-colors duration-200"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{customer.full_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{customer.contact_info || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{customer.address || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(customer)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors duration-200"
                                        title={t('common.edit')}
                                    >
                                        {t('common.edit')}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(customer)}
                                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                                        title={t('common.delete')}
                                    >
                                        {t('common.delete')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {customers.length === 0 && !fetching && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">👥</div>
                        <p className="text-gray-500 text-lg mb-2">{t('customers.noCustomers')}</p>
                        <p className="text-gray-400 text-sm">{t('customers.addFirstCustomer')}</p>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDelete}
                title={t('customers.deleteCustomer')}
                message={`${t('customers.deleteConfirm')} "${deleteConfirm.name}"? ${t('customers.deleteConfirmMessage')}`}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                type="danger"
            />
        </div>
    );
};

export default Customers;
