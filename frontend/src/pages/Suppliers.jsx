import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import useToastStore from '../store/toastStore';
import { getErrorMessage } from '../utils/errorHandler';
import ConfirmDialog from '../components/ConfirmDialog';
import FormInput from '../components/FormInput';
import FormSection from '../components/FormSection';

const Suppliers = () => {
    const { t } = useTranslation();
    const [suppliers, setSuppliers] = useState([]);
    const [formData, setFormData] = useState({
        company_name: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
    });
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, name: '' });

    const addToast = useToastStore((state) => state.addToast);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        setFetching(true);
        try {
            const response = await api.get('/master-data/suppliers/');
            setSuppliers(response.data);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            addToast(getErrorMessage(error), 'error');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (supplier) => {
        setFormData({
            company_name: supplier.company_name,
            first_name: supplier.first_name || '',
            last_name: supplier.last_name || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
        });
        setEditingId(supplier.supplier_id);
        setShowForm(true);
    };

    const handleDeleteClick = (supplier) => {
        setDeleteConfirm({
            isOpen: true,
            id: supplier.supplier_id,
            name: supplier.company_name,
        });
    };

    const handleDelete = async () => {
        if (!deleteConfirm.id) return;
        try {
            await api.delete(`/master-data/suppliers/${deleteConfirm.id}`);
            addToast(`${t('suppliers.deletedSuccess')}`, 'success');
            fetchSuppliers();
        } catch (error) {
            console.error('Error deleting supplier:', error);
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
                await api.put(`/master-data/suppliers/${editingId}`, formData);
                addToast(t('suppliers.updatedSuccess'), 'success');
            } else {
                await api.post('/master-data/suppliers/', formData);
                addToast(t('suppliers.createdSuccess'), 'success');
            }
            fetchSuppliers();
            handleCancel();
        } catch (error) {
            console.error('Error saving supplier:', error);
            addToast(getErrorMessage(error), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            company_name: '',
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
        });
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{t('suppliers.title')}</h2>
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
                    {showForm ? t('common.cancel') : `+ ${t('suppliers.addSupplier')}`}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-xl shadow-lg animate-slideIn border border-gray-100">
                    <h3 className="text-xl font-bold mb-6 text-gray-800 pb-2 border-b">
                        {editingId ? t('suppliers.editSupplier') : t('suppliers.newSupplier')}
                    </h3>

                    <FormSection title={t('common.basicInfo')} icon="🏢">
                        <FormInput
                            label={t('suppliers.companyName')}
                            name="company_name"
                            value={formData.company_name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder={t('suppliers.companyName')}
                        />
                    </FormSection>

                    <FormSection title={t('common.contactDetails')} icon="👤">
                        <FormInput
                            label={t('suppliers.firstName')}
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder={t('suppliers.firstName')}
                        />
                        <FormInput
                            label={t('suppliers.lastName')}
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder={t('suppliers.lastName')}
                        />
                        <FormInput
                            label={t('suppliers.email')}
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder={t('suppliers.email')}
                            icon="📧"
                        />
                        <FormInput
                            label={t('suppliers.phone')}
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder={t('suppliers.phone')}
                            icon="📞"
                        />
                    </FormSection>

                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 font-semibold"
                            disabled={loading}
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center gap-2 font-semibold"
                        >
                            {loading && (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            )}
                            {editingId ? t('suppliers.updateSupplier') : t('suppliers.saveSupplier')}
                        </button>
                    </div>
                </form>
            )}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                {fetching && suppliers.length > 0 && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 animate-pulse"></div>
                )}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('suppliers.companyName')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('common.contactDetails')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('suppliers.email')}</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{t('common.actions_title')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {suppliers.map((supplier, index) => (
                                <tr
                                    key={supplier.supplier_id}
                                    className="hover:bg-blue-50/30 transition-colors duration-200"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-semibold text-gray-900">{supplier.company_name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                        {supplier.first_name} {supplier.last_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{supplier.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(supplier)}
                                            className="text-white bg-indigo-500 hover:bg-indigo-600 p-2 rounded-lg mr-2 transition-all duration-200 shadow-sm"
                                            title={t('common.edit')}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(supplier)}
                                            className="text-white bg-red-500 hover:bg-red-600 p-2 rounded-lg transition-all duration-200 shadow-sm"
                                            title={t('common.delete')}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {suppliers.length === 0 && !fetching && (
                    <div className="text-center py-16 bg-gray-50">
                        <div className="text-6xl mb-4 text-gray-300">🏢</div>
                        <p className="text-gray-500 text-lg font-medium">{t('common.noData')}</p>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDelete}
                title={t('suppliers.deleteSupplier')}
                message={`${t('customers.deleteConfirm')} "${deleteConfirm.name}"? ${t('customers.deleteConfirmMessage')}`}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                type="danger"
            />
        </div>
    );
};

export default Suppliers;
