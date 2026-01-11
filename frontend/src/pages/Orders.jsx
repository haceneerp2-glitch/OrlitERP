import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import useToastStore from '../store/toastStore';
import { getErrorMessage } from '../utils/errorHandler';
import ConfirmDialog from '../components/ConfirmDialog';
import FormInput from '../components/FormInput';
import FormSection from '../components/FormSection';
import FormSelect from '../components/FormSelect';

const Orders = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [items, setItems] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [formData, setFormData] = useState({
        order_number: '',
        order_type: 'purchase',
        order_date: new Date().toISOString().split('T')[0],
        supplier_id: '',
        customer_id: '',
        status: 'pending',
        items: [{ item_id: '', quantity: '', unit_price: '', discount: 0 }],
    });
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, name: '' });

    const addToast = useToastStore((state) => state.addToast);

    useEffect(() => {
        fetchOrders();
        fetchItems();
        fetchSuppliers();
        fetchCustomers();
    }, []);

    const fetchOrders = async () => {
        setFetching(true);
        try {
            const response = await api.get('/orders/');
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
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

    const fetchSuppliers = async () => {
        try {
            const response = await api.get('/master-data/suppliers/');
            setSuppliers(response.data);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/master-data/customers/');
            setCustomers(response.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleItemChange = (index, e) => {
        const newItems = [...formData.items];
        newItems[index][e.target.name] = e.target.value;
        setFormData({ ...formData, items: newItems });
    };

    const addItem = () => {
        setFormData({ ...formData, items: [...formData.items, { item_id: '', quantity: '', unit_price: '', discount: 0 }] });
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleEdit = (order) => {
        setFormData({
            order_number: order.order_number,
            order_type: order.order_type,
            order_date: order.order_date || new Date().toISOString().split('T')[0],
            supplier_id: order.supplier_id || '',
            customer_id: order.customer_id || '',
            status: order.status || 'pending',
            items: order.items.map(i => ({
                item_id: i.item_id,
                quantity: i.quantity,
                unit_price: i.unit_price,
                discount: i.discount || 0
            }))
        });
        setEditingId(order.order_id);
        setShowForm(true);
    };

    const handleDeleteClick = (order) => {
        setDeleteConfirm({
            isOpen: true,
            id: order.order_id,
            name: order.order_number,
        });
    };

    const handleDelete = async () => {
        if (!deleteConfirm.id) return;
        try {
            await api.delete(`/orders/${deleteConfirm.id}`);
            addToast(t('orders.deletedSuccess'), 'success');
            fetchOrders();
        } catch (error) {
            console.error('Error deleting order:', error);
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
                supplier_id: formData.order_type === 'purchase' ? (formData.supplier_id ? parseInt(formData.supplier_id) : null) : null,
                customer_id: formData.order_type === 'sales' ? (formData.customer_id ? parseInt(formData.customer_id) : null) : null,
                items: formData.items.map(item => ({
                    ...item,
                    item_id: parseInt(item.item_id),
                    quantity: parseInt(item.quantity),
                    unit_price: parseFloat(item.unit_price),
                    discount: parseFloat(item.discount || 0)
                }))
            };

            if (editingId) {
                await api.put(`/orders/${editingId}`, payload);
                addToast(t('orders.updatedSuccess'), 'success');
            } else {
                await api.post('/orders/', payload);
                addToast(t('orders.createdSuccess'), 'success');
            }
            fetchOrders();
            handleCancel();
        } catch (error) {
            console.error('Error saving order:', error);
            addToast(getErrorMessage(error), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            order_number: '',
            order_type: 'purchase',
            order_date: new Date().toISOString().split('T')[0],
            supplier_id: '',
            customer_id: '',
            status: 'pending',
            items: [{ item_id: '', quantity: '', unit_price: '', discount: 0 }],
        });
        setShowForm(false);
        setEditingId(null);
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{t('orders.title')}</h2>
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
                    {showForm ? t('common.cancel') : `+ ${t('orders.createOrder')}`}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-slideIn">
                    <h3 className="text-xl font-bold mb-6 text-gray-800 pb-2 border-b">
                        {editingId ? t('orders.editOrder') : t('orders.newOrder')}
                    </h3>

                    <FormSection title={t('common.basicInfo')} icon="📝">
                        <FormInput
                            label={t('orders.orderNumber')}
                            name="order_number"
                            value={formData.order_number}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder={t('orders.orderNumber')}
                            icon="🔢"
                        />
                        <FormSelect
                            label={t('orders.orderType')}
                            name="order_type"
                            value={formData.order_type}
                            onChange={handleChange}
                            disabled={loading}
                            options={[
                                { value: 'purchase', label: t('orders.purchaseOrder') },
                                { value: 'sales', label: t('orders.salesOrder') }
                            ]}
                        />
                        <FormInput
                            label={t('orders.orderDate')}
                            name="order_date"
                            type="date"
                            value={formData.order_date}
                            onChange={handleChange}
                            disabled={loading}
                            icon="📅"
                        />
                        <FormSelect
                            label={t('orders.status')}
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            disabled={loading}
                            options={[
                                { value: 'pending', label: t('stockMovements.pending') },
                                { value: 'approved', label: t('leaves.approved') },
                                { value: 'shipped', label: 'Shipped' },
                                { value: 'received', label: 'Received' },
                                { value: 'cancelled', label: t('stockMovements.cancelled') }
                            ]}
                        />

                        {formData.order_type === 'purchase' ? (
                            <FormSelect
                                label={t('orders.selectSupplier')}
                                name="supplier_id"
                                value={formData.supplier_id}
                                onChange={handleChange}
                                disabled={loading}
                                required
                                placeholder={t('orders.selectSupplier')}
                                options={suppliers.map(s => ({ value: s.supplier_id, label: s.company_name }))}
                            />
                        ) : (
                            <FormSelect
                                label={t('orders.selectCustomer')}
                                name="customer_id"
                                value={formData.customer_id}
                                onChange={handleChange}
                                disabled={loading}
                                required
                                placeholder={t('orders.selectCustomer')}
                                options={customers.map(c => ({ value: c.customer_id, label: c.full_name }))}
                            />
                        )}
                    </FormSection>

                    <FormSection title={t('orders.items')} icon="📦" className="lg:grid-cols-1 md:grid-cols-1">
                        <div className="space-y-4">
                            {formData.items.map((item, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-4 items-end bg-gray-50 p-6 rounded-xl border border-gray-100 relative group animate-fadeIn overflow-x-auto md:overflow-x-visible">
                                    <div className="w-full md:w-5/12 min-w-[200px]">
                                        <FormSelect
                                            label={index === 0 ? t('orders.item') : ""}
                                            name="item_id"
                                            value={item.item_id}
                                            onChange={(e) => handleItemChange(index, e)}
                                            required
                                            disabled={loading}
                                            placeholder={t('orders.item')}
                                            options={items.map(i => ({ value: i.item_id, label: `${i.item_name} (${i.item_code})` }))}
                                        />
                                    </div>
                                    <div className="w-full md:w-1/6 min-w-[80px]">
                                        <FormInput
                                            label={index === 0 ? t('orders.qty') : ""}
                                            name="quantity"
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, e)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="w-full md:w-1/6 min-w-[100px]">
                                        <FormInput
                                            label={index === 0 ? t('orders.unitPrice') : ""}
                                            name="unit_price"
                                            type="number"
                                            value={item.unit_price}
                                            onChange={(e) => handleItemChange(index, e)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="w-full md:w-1/6 min-w-[100px]">
                                        <FormInput
                                            label={index === 0 ? t('orders.discount') : ""}
                                            name="discount"
                                            type="number"
                                            value={item.discount}
                                            onChange={(e) => handleItemChange(index, e)}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="w-full md:w-auto self-end">
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="w-full h-[52px] px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300 font-bold border border-red-100 flex items-center justify-center gap-2 group-hover:shadow-md"
                                            disabled={loading || formData.items.length === 1}
                                        >
                                            🗑️ <span className="md:hidden lg:inline">{t('orders.remove')}</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addItem}
                                className="w-full py-3 border-2 border-dashed border-blue-200 text-blue-600 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 font-bold flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                ✨ {t('orders.addItem')}
                            </button>
                        </div>
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
                            {editingId ? t('orders.updateOrder') : t('orders.saveOrder')}
                        </button>
                    </div>
                </form>
            )}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                {fetching && orders.length > 0 && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 animate-pulse"></div>
                )}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('orders.orderNumber')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('orders.orderType')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('orders.status')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{t('common.actions_title')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {orders.map((order, index) => (
                                <tr
                                    key={order.order_id}
                                    className="hover:bg-blue-50/30 transition-colors duration-200"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-bold text-gray-900"># {order.order_number}</div>
                                        <div className="text-xs text-gray-400">{order.order_date}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.order_type === 'purchase' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {order.order_type === 'purchase' ? t('orders.purchaseOrder') : t('orders.salesOrder')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="capitalize px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium border">
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                                        ${order.total_amount?.toLocaleString()}
                                    </td>
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
                        <div className="text-6xl mb-4 text-gray-300">🛒</div>
                        <p className="text-gray-500 text-lg font-medium">{t('common.noData')}</p>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDelete}
                title={t('orders.deleteOrder')}
                message={`${t('customers.deleteConfirm')} "${deleteConfirm.name}"? ${t('customers.deleteConfirmMessage')}`}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                type="danger"
            />
        </div>
    );
};

export default Orders;
