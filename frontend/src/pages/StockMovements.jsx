import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import useToastStore from '../store/toastStore';
import { getErrorMessage } from '../utils/errorHandler';
import ConfirmDialog from '../components/ConfirmDialog';
import FormInput from '../components/FormInput';
import FormSection from '../components/FormSection';
import FormSelect from '../components/FormSelect';

const StockMovements = () => {
    const { t } = useTranslation();
    const [movements, setMovements] = useState([]);
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({
        item_id: '',
        movement_type: 'in',
        quantity: '',
        movement_date: new Date().toISOString().split('T')[0],
        reference_number: '',
    });
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, name: '' });

    const addToast = useToastStore((state) => state.addToast);

    useEffect(() => {
        fetchMovements();
        fetchItems();
    }, []);

    const fetchMovements = async () => {
        setFetching(true);
        try {
            const response = await api.get('/inventory/movements/');
            setMovements(response.data);
        } catch (error) {
            console.error('Error fetching movements:', error);
            addToast(getErrorMessage(error), 'error');
        } finally {
            setFetching(false);
        }
    };

    const fetchItems = async () => {
        try {
            const response = await api.get('/master-data/items/');
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (movement) => {
        setFormData({
            item_id: movement.item_id,
            movement_type: movement.movement_type,
            quantity: movement.quantity,
            movement_date: movement.movement_date,
            reference_number: movement.reference_number || '',
        });
        setEditingId(movement.movement_id);
        setShowForm(true);
    };

    const handleDeleteClick = (movement) => {
        const item = items.find(i => i.item_id === movement.item_id);
        setDeleteConfirm({
            isOpen: true,
            id: movement.movement_id,
            name: `${item ? item.item_name : 'Item'} (${movement.reference_number || movement.movement_date})`,
        });
    };

    const handleDelete = async () => {
        if (!deleteConfirm.id) return;
        try {
            await api.delete(`/inventory/movements/${deleteConfirm.id}`);
            addToast(t('stockMovements.deletedSuccess'), 'success');
            fetchMovements();
        } catch (error) {
            console.error('Error deleting movement:', error);
            addToast(getErrorMessage(error), 'error');
        } finally {
            setDeleteConfirm({ isOpen: false, id: null, name: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                item_id: parseInt(formData.item_id, 10),
                quantity: parseInt(formData.quantity, 10),
            };

            if (editingId) {
                await api.put(`/inventory/movements/${editingId}`, payload);
                addToast(t('stockMovements.updatedSuccess'), 'success');
            } else {
                await api.post('/inventory/movements/', payload);
                addToast(t('stockMovements.createdSuccess'), 'success');
            }
            fetchMovements();
            handleCancel();
        } catch (error) {
            console.error('Error saving movement:', error);
            addToast(getErrorMessage(error), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            item_id: '',
            movement_type: 'in',
            quantity: '',
            movement_date: new Date().toISOString().split('T')[0],
            reference_number: '',
        });
        setShowForm(false);
        setEditingId(null);
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{t('stockMovements.title')}</h2>
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
                    {showForm ? t('common.cancel') : `+ ${t('stockMovements.recordMovement')}`}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-slideIn">
                    <h3 className="text-xl font-bold mb-6 text-gray-800 pb-2 border-b">
                        {editingId ? t('stockMovements.editMovement') : t('stockMovements.newMovement')}
                    </h3>

                    <FormSection title={t('common.basicInfo')} icon="🔄">
                        <FormSelect
                            label={t('stockMovements.item')}
                            name="item_id"
                            value={formData.item_id}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder={t('stockMovements.selectItem')}
                            options={items.map(item => ({ value: item.item_id, label: `${item.item_name} (${item.item_code})` }))}
                        />
                        <FormSelect
                            label={t('stockMovements.movementType')}
                            name="movement_type"
                            value={formData.movement_type}
                            onChange={handleChange}
                            disabled={loading}
                            options={[
                                { value: 'in', label: t('stockMovements.in') },
                                { value: 'out', label: t('stockMovements.out') }
                            ]}
                        />
                    </FormSection>

                    <FormSection title={t('common.additionalInfo')} icon="📊">
                        <FormInput
                            label={t('stockMovements.qty')}
                            name="quantity"
                            type="number"
                            value={formData.quantity}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="0"
                            icon="#"
                        />
                        <FormInput
                            label={t('stockMovements.date')}
                            name="movement_date"
                            type="date"
                            value={formData.movement_date}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            icon="📅"
                        />
                        <FormInput
                            label={t('stockMovements.refNumber')}
                            name="reference_number"
                            value={formData.reference_number}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="EXP: #ORD-001"
                            icon="🔖"
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
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center gap-2 font-semibold"
                        >
                            {loading && (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            )}
                            {editingId ? t('stockMovements.updateMovement') : t('stockMovements.saveMovement')}
                        </button>
                    </div>
                </form>
            )}

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {fetching && movements.length > 0 && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 animate-pulse"></div>
                )}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('stockMovements.item')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('stockMovements.movementType')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('stockMovements.qty')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('stockMovements.date')}</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{t('common.actions_title')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {movements.map((movement, index) => {
                                const item = items.find(i => i.item_id === movement.item_id);
                                return (
                                    <tr
                                        key={movement.movement_id}
                                        className="hover:bg-blue-50/30 transition-colors duration-200"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-bold text-gray-900">{item ? item.item_name : `ID: ${movement.item_id}`}</div>
                                            <div className="text-xs text-gray-400">{movement.reference_number || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${movement.movement_type === 'in' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
                                                }`}>
                                                {movement.movement_type === 'in' ? '↑ ' + t('stockMovements.in') : '↓ ' + t('stockMovements.out')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                                            {movement.quantity} {item?.unit}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            {movement.movement_date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(movement)}
                                                className="text-white bg-indigo-500 hover:bg-indigo-600 p-2 rounded-lg mr-2 transition-all duration-200 shadow-sm"
                                                title={t('common.edit')}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(movement)}
                                                className="text-white bg-red-500 hover:bg-red-600 p-2 rounded-lg transition-all duration-200 shadow-sm"
                                                title={t('common.delete')}
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {movements.length === 0 && !fetching && (
                    <div className="text-center py-16 bg-gray-50">
                        <div className="text-6xl mb-4 text-gray-300">🔄</div>
                        <p className="text-gray-500 text-lg font-medium">{t('common.noData')}</p>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDelete}
                title={t('stockMovements.deleteMovement')}
                message={`${t('customers.deleteConfirm')} "${deleteConfirm.name}"? ${t('customers.deleteConfirmMessage')}`}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                type="danger"
            />
        </div>
    );
};

export default StockMovements;
