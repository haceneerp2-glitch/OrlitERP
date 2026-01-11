import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import useToastStore from '../store/toastStore';
import { getErrorMessage } from '../utils/errorHandler';
import ConfirmDialog from '../components/ConfirmDialog';
import FormInput from '../components/FormInput';
import FormSection from '../components/FormSection';

const Items = () => {
    const { t } = useTranslation();
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({
        item_code: '',
        item_name: '',
        category: '',
        unit: '',
    });
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, name: '' });

    const addToast = useToastStore((state) => state.addToast);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setFetching(true);
        try {
            const response = await api.get('/master-data/items/');
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching items:', error);
            addToast(getErrorMessage(error), 'error');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (item) => {
        setFormData({
            item_code: item.item_code,
            item_name: item.item_name,
            category: item.category || '',
            unit: item.unit,
        });
        setEditingId(item.item_id);
        setShowForm(true);
    };

    const handleDeleteClick = (item) => {
        setDeleteConfirm({
            isOpen: true,
            id: item.item_id,
            name: item.item_name,
        });
    };

    const handleDelete = async () => {
        if (!deleteConfirm.id) return;
        try {
            await api.delete(`/master-data/items/${deleteConfirm.id}`);
            addToast(t('items.deletedSuccess'), 'success');
            fetchItems();
        } catch (error) {
            console.error('Error deleting item:', error);
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
                await api.put(`/master-data/items/${editingId}`, formData);
                addToast(t('items.updatedSuccess'), 'success');
            } else {
                await api.post('/master-data/items/', formData);
                addToast(t('items.createdSuccess'), 'success');
            }
            fetchItems();
            handleCancel();
        } catch (error) {
            console.error('Error saving item:', error);
            addToast(getErrorMessage(error), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            item_code: '',
            item_name: '',
            category: '',
            unit: '',
        });
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{t('items.title')}</h2>
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
                    {showForm ? t('common.cancel') : `+ ${t('items.addItem')}`}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-slideIn">
                    <h3 className="text-xl font-bold mb-6 text-gray-800 pb-2 border-b">
                        {editingId ? t('items.editItem') : t('items.newItem')}
                    </h3>

                    <FormSection title={t('common.basicInfo')} icon="📦">
                        <FormInput
                            label={t('items.itemCode')}
                            name="item_code"
                            value={formData.item_code}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder={t('items.itemCode')}
                            icon="🔢"
                        />
                        <FormInput
                            label={t('items.itemName')}
                            name="item_name"
                            value={formData.item_name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder={t('items.itemName')}
                        />
                    </FormSection>

                    <FormSection title={t('common.additionalInfo')} icon="🏷️">
                        <FormInput
                            label={t('items.category')}
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder={t('items.category')}
                        />
                        <FormInput
                            label={t('items.unit')}
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder={t('items.unit')}
                            icon="⚖️"
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
                            {editingId ? t('items.updateItem') : t('items.saveItem')}
                        </button>
                    </div>
                </form>
            )}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                {fetching && items.length > 0 && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 animate-pulse"></div>
                )}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('items.itemCode')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('items.itemName')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('items.category')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('items.unit')}</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{t('common.actions_title')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {items.map((item, index) => (
                                <tr
                                    key={item.item_id}
                                    className="hover:bg-blue-50/30 transition-colors duration-200"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-600">{item.item_code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{item.item_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{item.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{item.unit}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-white bg-indigo-500 hover:bg-indigo-600 p-2 rounded-lg mr-2 transition-all duration-200 shadow-sm"
                                            title={t('common.edit')}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(item)}
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
                {items.length === 0 && !fetching && (
                    <div className="text-center py-16 bg-gray-50">
                        <div className="text-6xl mb-4 text-gray-300">📦</div>
                        <p className="text-gray-500 text-lg font-medium">{t('common.noData')}</p>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDelete}
                title={t('items.deleteItem')}
                message={`${t('customers.deleteConfirm')} "${deleteConfirm.name}"? ${t('customers.deleteConfirmMessage')}`}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                type="danger"
            />
        </div>
    );
};

export default Items;
