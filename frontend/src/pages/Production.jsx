import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import useToastStore from '../store/toastStore';
import { getErrorMessage } from '../utils/errorHandler';
import ConfirmDialog from '../components/ConfirmDialog';
import FormInput from '../components/FormInput';
import FormSection from '../components/FormSection';
import FormSelect from '../components/FormSelect';

const Production = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        production_order_number: '',
        product_id: '',
        quantity_required: '',
        start_date: new Date().toISOString().split('T')[0],
        status: 'planned'
    });
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, name: '' });

    const addToast = useToastStore((state) => state.addToast);

    useEffect(() => {
        fetchOrders();
        fetchProducts();
    }, []);

    const fetchOrders = async () => {
        setFetching(true);
        try {
            const response = await api.get('/production/orders/');
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching manufacturing orders:', error);
            addToast(getErrorMessage(error), 'error');
        } finally {
            setFetching(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/master-data/products/');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (order) => {
        setFormData({
            production_order_number: order.production_order_number,
            product_id: order.product_id,
            quantity_required: order.quantity_required,
            start_date: order.start_date || new Date().toISOString().split('T')[0],
            status: order.status || 'planned',
        });
        setEditingId(order.mo_id);
        setShowForm(true);
    };

    const handleDeleteClick = (order) => {
        setDeleteConfirm({
            isOpen: true,
            id: order.mo_id,
            name: order.production_order_number,
        });
    };

    const handleDelete = async () => {
        if (!deleteConfirm.id) return;
        try {
            await api.delete(`/production/orders/${deleteConfirm.id}`);
            addToast(t('production.deletedSuccess'), 'success');
            fetchOrders();
        } catch (error) {
            console.error('Error deleting manufacturing order:', error);
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
                product_id: parseInt(formData.product_id),
                quantity_required: parseFloat(formData.quantity_required),
            };

            if (editingId) {
                await api.put(`/production/orders/${editingId}`, payload);
                addToast(t('production.updatedSuccess'), 'success');
            } else {
                await api.post('/production/orders/', payload);
                addToast(t('production.createdSuccess'), 'success');
            }

            fetchOrders();
            handleCancel();
        } catch (error) {
            console.error('Error saving manufacturing order:', error);
            addToast(getErrorMessage(error), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            production_order_number: '',
            product_id: '',
            quantity_required: '',
            start_date: new Date().toISOString().split('T')[0],
            status: 'planned'
        });
        setShowForm(false);
        setEditingId(null);
    };

    const getProductName = (productId) => {
        const product = products.find((p) => p.product_id === productId);
        return product ? product.product_name : productId;
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{t('production.title')}</h2>
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
                    {showForm ? t('common.cancel') : `+ ${t('production.createOrder')}`}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-slideIn">
                    <h3 className="text-xl font-bold mb-6 text-gray-800 pb-2 border-b">
                        {editingId ? t('production.editOrder') : t('production.newOrder')}
                    </h3>

                    <FormSection title={t('common.basicInfo')} icon="⚙️">
                        <FormInput
                            label={t('production.orderNumber')}
                            name="production_order_number"
                            value={formData.production_order_number}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder={t('production.orderNumber')}
                            icon="🔢"
                        />
                        <FormSelect
                            label={t('production.selectProduct')}
                            name="product_id"
                            value={formData.product_id}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder={t('production.selectProduct')}
                            options={products.map(p => ({ value: p.product_id, label: p.product_name }))}
                        />
                        <FormInput
                            label={t('production.quantity')}
                            name="quantity_required"
                            type="number"
                            value={formData.quantity_required}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="0"
                            icon="#"
                        />
                    </FormSection>

                    <FormSection title={t('common.contactDetails')} icon="📅">
                        <FormInput
                            label={t('production.startDate')}
                            name="start_date"
                            type="date"
                            value={formData.start_date}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                        <FormSelect
                            label={t('production.status')}
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            disabled={loading}
                            options={[
                                { value: 'planned', label: t('production.planned') },
                                { value: 'in_progress', label: t('production.inProgress') },
                                { value: 'completed', label: t('production.completed') },
                                { value: 'cancelled', label: t('production.cancelled') }
                            ]}
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
                            {editingId ? t('production.updateOrder') : t('production.saveOrder')}
                        </button>
                    </div>
                </form>
            )}

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {fetching && orders.length > 0 && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 animate-pulse"></div>
                )}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('production.orderNumber')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('production.product')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('production.quantity')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('production.status')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('production.startDate')}</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{t('common.actions_title')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {orders.map((order, index) => (
                                <tr
                                    key={order.mo_id}
                                    className="hover:bg-blue-50/30 transition-colors duration-200"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{order.production_order_number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{getProductName(order.product_id)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">{order.quantity_required}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${order.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                                            order.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                order.status === 'planned' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'
                                            }`}>
                                            {t(`production.${order.status.includes('_') ? order.status.replace(/_([a-z])/g, (g) => g[1].toUpperCase()) : order.status}`)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{order.start_date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(order)}
                                            className="text-white bg-indigo-500 hover:bg-indigo-600 p-2 rounded-lg mr-2 transition-all duration-200 shadow-sm"
                                            title={t('common.edit')}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(order)}
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
                {orders.length === 0 && !fetching && (
                    <div className="text-center py-16 bg-gray-50">
                        <div className="text-6xl mb-4 text-gray-300">⚙️</div>
                        <p className="text-gray-500 text-lg font-medium">{t('common.noData')}</p>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDelete}
                title={t('production.deleteOrder')}
                message={`${t('customers.deleteConfirm')} "${deleteConfirm.name}"? ${t('customers.deleteConfirmMessage')}`}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                type="danger"
            />
        </div>
    );
};

export default Production;
