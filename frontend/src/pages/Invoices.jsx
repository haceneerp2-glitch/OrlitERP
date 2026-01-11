import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import useToastStore from '../store/toastStore';
import { getErrorMessage } from '../utils/errorHandler';
import ConfirmDialog from '../components/ConfirmDialog';
import FormInput from '../components/FormInput';
import FormSection from '../components/FormSection';

const Invoices = () => {
    const { t } = useTranslation();
    const [invoices, setInvoices] = useState([]);
    const [orders, setOrders] = useState([]);
    const [formData, setFormData] = useState({
        invoice_number: '',
        order_id: '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date().toISOString().split('T')[0],
        amount: '',
        status: 'unpaid',
    });
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, name: '' });

    const addToast = useToastStore((state) => state.addToast);

    useEffect(() => {
        fetchInvoices();
        fetchOrders();
    }, []);

    const fetchInvoices = async () => {
        setFetching(true);
        try {
            const response = await api.get('/accounting/invoices/');
            setInvoices(response.data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            addToast(getErrorMessage(error), 'error');
        } finally {
            setFetching(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders/');
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (invoice) => {
        setFormData({
            invoice_number: invoice.invoice_number,
            order_id: invoice.order_id,
            issue_date: invoice.issue_date,
            due_date: invoice.due_date,
            amount: invoice.amount,
            status: invoice.status || 'unpaid',
        });
        setEditingId(invoice.invoice_id);
        setShowForm(true);
    };

    const handleDeleteClick = (invoice) => {
        setDeleteConfirm({
            isOpen: true,
            id: invoice.invoice_id,
            name: invoice.invoice_number,
        });
    };

    const handleDelete = async () => {
        if (!deleteConfirm.id) return;
        try {
            await api.delete(`/accounting/invoices/${deleteConfirm.id}`);
            addToast(t('invoices.deletedSuccess'), 'success');
            fetchInvoices();
        } catch (error) {
            console.error('Error deleting invoice:', error);
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
                order_id: parseInt(formData.order_id, 10),
                amount: parseFloat(formData.amount),
            };

            if (editingId) {
                await api.put(`/accounting/invoices/${editingId}`, payload);
                addToast(t('invoices.updatedSuccess'), 'success');
            } else {
                await api.post('/accounting/invoices/', payload);
                addToast(t('invoices.createdSuccess'), 'success');
            }
            fetchInvoices();
            handleCancel();
        } catch (error) {
            console.error('Error saving invoice:', error);
            addToast(getErrorMessage(error), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            invoice_number: '',
            order_id: '',
            issue_date: new Date().toISOString().split('T')[0],
            due_date: new Date().toISOString().split('T')[0],
            amount: '',
            status: 'unpaid',
        });
        setShowForm(false);
        setEditingId(null);
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{t('invoices.title')}</h2>
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
                    {showForm ? t('common.cancel') : `+ ${t('invoices.createInvoice')}`}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-slideIn">
                    <h3 className="text-xl font-bold mb-6 text-gray-800 pb-2 border-b">
                        {editingId ? t('invoices.editInvoice') : t('invoices.newInvoice')}
                    </h3>

                    <FormSection title={t('common.basicInfo')} icon="📄">
                        <FormInput
                            label={t('invoices.invoiceNumber')}
                            name="invoice_number"
                            value={formData.invoice_number}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder={t('invoices.invoiceNumber')}
                            icon="🔢"
                        />
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">{t('invoices.orderNumber')}</label>
                            <select
                                name="order_id"
                                value={formData.order_id}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-all duration-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                                disabled={loading}
                            >
                                <option value="">{t('invoices.orderNumber')}</option>
                                {orders.map((order) => (
                                    <option key={order.order_id} value={order.order_id}>
                                        #{order.order_number} - {order.order_type}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </FormSection>

                    <FormSection title={t('addressInfo')} icon="📅">
                        <FormInput
                            label={t('invoices.invoiceDate')}
                            name="issue_date"
                            type="date"
                            value={formData.issue_date}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                        <FormInput
                            label={t('invoices.dueDate')}
                            name="due_date"
                            type="date"
                            value={formData.due_date}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </FormSection>

                    <FormSection title={t('invoices.totalAmount')} icon="💰">
                        <FormInput
                            label={t('invoices.totalAmount')}
                            name="amount"
                            type="number"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="0.00"
                            icon="$"
                        />
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">{t('invoices.status')}</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-all duration-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                disabled={loading}
                            >
                                <option value="unpaid">{t('invoices.unpaid')}</option>
                                <option value="paid">{t('invoices.paid')}</option>
                                <option value="overdue">{t('invoices.overdue')}</option>
                            </select>
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
                            {editingId ? t('invoices.updateInvoice') : t('invoices.saveInvoice')}
                        </button>
                    </div>
                </form>
            )}

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {fetching && invoices.length > 0 && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 animate-pulse"></div>
                )}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('invoices.invoiceNumber')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('invoices.orderNumber')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('invoices.totalAmount')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('invoices.status')}</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{t('common.actions_title')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {invoices.map((invoice, index) => {
                                const order = orders.find(o => o.order_id === invoice.order_id);
                                return (
                                    <tr
                                        key={invoice.invoice_id}
                                        className="hover:bg-blue-50/30 transition-colors duration-200"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-bold text-gray-900"># {invoice.invoice_number}</div>
                                            <div className="text-xs text-gray-400">{invoice.issue_date}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            {order ? `#${order.order_number}` : `ID: ${invoice.order_id}`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                                            ${invoice.amount?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${invoice.status === 'paid' ? 'bg-green-100 text-green-800 border-green-200' :
                                                invoice.status === 'overdue' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                }`}>
                                                {t(`invoices.${invoice.status}`)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(invoice)}
                                                className="text-white bg-indigo-500 hover:bg-indigo-600 p-2 rounded-lg mr-2 transition-all duration-200 shadow-sm"
                                                title={t('common.edit')}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(invoice)}
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
                {invoices.length === 0 && !fetching && (
                    <div className="text-center py-16 bg-gray-50">
                        <div className="text-6xl mb-4 text-gray-300">💰</div>
                        <p className="text-gray-500 text-lg font-medium">{t('common.noData')}</p>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDelete}
                title={t('invoices.deleteInvoice')}
                message={`${t('customers.deleteConfirm')} "${deleteConfirm.name}"? ${t('customers.deleteConfirmMessage')}`}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                type="danger"
            />
        </div>
    );
};

export default Invoices;
