import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import useToastStore from '../store/toastStore';
import { getErrorMessage } from '../utils/errorHandler';
import ConfirmDialog from '../components/ConfirmDialog';
import FormInput from '../components/FormInput';
import FormSection from '../components/FormSection';
import FormSelect from '../components/FormSelect';

const InventoryLevels = () => {
    const { t } = useTranslation();
    const [levels, setLevels] = useState([]);
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({
        item_id: '',
        on_hand: '',
        available: '',
        min_level: '',
        max_level: '',
        reorder_point: '',
    });
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, name: '' });

    const addToast = useToastStore((state) => state.addToast);

    useEffect(() => {
        fetchLevels();
        fetchItems();
    }, []);

    const fetchLevels = async () => {
        setFetching(true);
        try {
            const response = await api.get('/inventory/levels/');
            setLevels(response.data);
        } catch (error) {
            console.error('Error fetching inventory levels:', error);
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

    const handleEdit = (level) => {
        setFormData({
            item_id: level.item_id,
            on_hand: level.on_hand || '',
            available: level.available || '',
            min_level: level.min_level || '',
            max_level: level.max_level || '',
            reorder_point: level.reorder_point || '',
        });
        setEditingId(level.inventory_id);
        setShowForm(true);
    };

    const handleDeleteClick = (level) => {
        const item = items.find(i => i.item_id === level.item_id);
        setDeleteConfirm({
            isOpen: true,
            id: level.inventory_id,
            name: item ? item.item_name : level.item_id,
        });
    };

    const handleDelete = async () => {
        if (!deleteConfirm.id) return;
        try {
            await api.delete(`/inventory/levels/${deleteConfirm.id}`);
            addToast(t('inventory.deletedSuccess') || 'Inventory level deleted', 'success');
            fetchLevels();
        } catch (error) {
            console.error('Error deleting inventory level:', error);
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
                item_id: parseInt(formData.item_id),
                on_hand: parseFloat(formData.on_hand) || 0,
                available: parseFloat(formData.available) || 0,
                min_level: parseFloat(formData.min_level) || 0,
                max_level: parseFloat(formData.max_level) || 0,
                reorder_point: parseFloat(formData.reorder_point) || 0,
            };

            if (editingId) {
                await api.put(`/inventory/levels/${editingId}`, payload);
                addToast(t('inventory.updatedSuccess') || 'Inventory level updated', 'success');
            } else {
                await api.post('/inventory/levels/', payload);
                addToast(t('inventory.createdSuccess') || 'Inventory level created', 'success');
            }

            fetchLevels();
            handleCancel();
        } catch (error) {
            console.error('Error saving inventory level:', error);
            addToast(getErrorMessage(error), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            item_id: '',
            on_hand: '',
            available: '',
            min_level: '',
            max_level: '',
            reorder_point: '',
        });
    };

    const getItemName = (itemId) => {
        const item = items.find((i) => i.item_id === itemId);
        return item ? item.item_name : itemId;
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{t('inventory.title')}</h2>
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
                    {showForm ? t('common.cancel') : `+ ${t('inventory.addLevel') || 'Add Level'}`}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-slideIn">
                    <h3 className="text-xl font-bold mb-6 text-gray-800 pb-2 border-b">
                        {editingId ? t('inventory.editLevel') || 'Edit Level' : t('inventory.newLevel') || 'New Level'}
                    </h3>

                    <FormSection title={t('common.basicInfo')} icon="📦">
                        <FormSelect
                            label={t('inventory.item')}
                            name="item_id"
                            value={formData.item_id}
                            onChange={handleChange}
                            required
                            disabled={editingId !== null || loading}
                            placeholder={t('inventory.selectItem') || 'Select Item'}
                            options={items.map(item => ({ value: item.item_id, label: `${item.item_name} (${item.item_code})` }))}
                        />
                    </FormSection>

                    <FormSection title={t('inventory.levels') || 'Current Levels'} icon="📈">
                        <FormInput
                            label={t('inventory.onHand')}
                            name="on_hand"
                            type="number"
                            value={formData.on_hand}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="0"
                            icon="#"
                        />
                        <FormInput
                            label={t('inventory.available')}
                            name="available"
                            type="number"
                            value={formData.available}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="0"
                            icon="✔️"
                        />
                    </FormSection>

                    <FormSection title={t('inventory.thresholds') || 'Thresholds'} icon="🛡️">
                        <FormInput
                            label={t('inventory.minLevel') || 'Min Level'}
                            name="min_level"
                            type="number"
                            value={formData.min_level}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="0"
                        />
                        <FormInput
                            label={t('inventory.maxLevel') || 'Max Level'}
                            name="max_level"
                            type="number"
                            value={formData.max_level}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="0"
                        />
                        <FormInput
                            label={t('inventory.reorderPoint') || 'Reorder Point'}
                            name="reorder_point"
                            type="number"
                            value={formData.reorder_point}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="0"
                            icon="🔔"
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
                            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center gap-2 font-semibold"
                        >
                            {loading && (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            )}
                            {editingId ? t('inventory.updateLevel') || 'Update Level' : t('inventory.saveLevel') || 'Save Level'}
                        </button>
                    </div>
                </form>
            )}

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {fetching && levels.length > 0 && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 animate-pulse"></div>
                )}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('inventory.item')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('inventory.onHand')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('inventory.available')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('inventory.reorderPoint')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('inventory.status') || 'Status'}</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{t('common.actions_title')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {levels.map((level, index) => {
                                const item = items.find(i => i.item_id === level.item_id);
                                const isLowStock = level.available <= level.reorder_point;
                                return (
                                    <tr
                                        key={level.inventory_id}
                                        className="hover:bg-blue-50/30 transition-colors duration-200"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-bold text-gray-900">{getItemName(level.item_id)}</div>
                                            <div className="text-xs text-gray-400">{item?.item_code}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">{level.on_hand}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`font-bold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                                                {level.available}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 italic">{level.reorder_point}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded text-xs font-bold border ${isLowStock ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
                                                }`}>
                                                {isLowStock ? (t('inventory.lowStock') || 'Low Stock') : (t('inventory.inStock') || 'In Stock')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(level)}
                                                className="text-white bg-indigo-500 hover:bg-indigo-600 p-2 rounded-lg mr-2 transition-all duration-200 shadow-sm"
                                                title={t('common.edit')}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(level)}
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
                {levels.length === 0 && !fetching && (
                    <div className="text-center py-16 bg-gray-50">
                        <div className="text-6xl mb-4 text-gray-300">📈</div>
                        <p className="text-gray-500 text-lg font-medium">{t('common.noData')}</p>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDelete}
                title={t('inventory.deleteLevel') || 'Delete Level'}
                message={`${t('customers.deleteConfirm')} "${deleteConfirm.name}"? ${t('customers.deleteConfirmMessage')}`}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                type="danger"
            />
        </div>
    );
};

export default InventoryLevels;
