import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import useToastStore from '../store/toastStore';
import { getErrorMessage } from '../utils/errorHandler';
import ConfirmDialog from '../components/ConfirmDialog';
import FormInput from '../components/FormInput';
import FormSection from '../components/FormSection';

const LeaveRequests = () => {
    const { t } = useTranslation();
    const [leaves, setLeaves] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        employee_id: '',
        leave_type: 'annual',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        reason: '',
        status: 'pending',
    });
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, name: '' });

    const addToast = useToastStore((state) => state.addToast);

    useEffect(() => {
        fetchLeaves();
        fetchEmployees();
    }, []);

    const fetchLeaves = async () => {
        setFetching(true);
        try {
            const response = await api.get('/hr/leaves/');
            setLeaves(response.data);
        } catch (error) {
            console.error('Error fetching leaves:', error);
            addToast(getErrorMessage(error), 'error');
        } finally {
            setFetching(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/hr/employees/');
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (record) => {
        setFormData({
            employee_id: record.employee_id,
            leave_type: record.leave_type || 'annual',
            start_date: record.start_date,
            end_date: record.end_date,
            reason: record.reason || '',
            status: record.status || 'pending',
        });
        setEditingId(record.leave_id);
        setShowForm(true);
    };

    const handleDeleteClick = (record) => {
        const emp = employees.find(e => e.employee_id === record.employee_id);
        setDeleteConfirm({
            isOpen: true,
            id: record.leave_id,
            name: emp ? `${emp.first_name} ${emp.last_name} (${record.start_date})` : record.start_date,
        });
    };

    const handleDelete = async () => {
        if (!deleteConfirm.id) return;
        try {
            await api.delete(`/hr/leaves/${deleteConfirm.id}`);
            addToast(t('leaves.deletedSuccess'), 'success');
            fetchLeaves();
        } catch (error) {
            console.error('Error deleting leave request:', error);
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
                employee_id: parseInt(formData.employee_id, 10),
            };

            if (editingId) {
                await api.put(`/hr/leaves/${editingId}`, payload);
                addToast(t('leaves.updatedSuccess'), 'success');
            } else {
                await api.post('/hr/leaves/', payload);
                addToast(t('leaves.createdSuccess'), 'success');
            }

            fetchLeaves();
            handleCancel();
        } catch (error) {
            console.error('Error submitting leave request:', error);
            addToast(getErrorMessage(error), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            employee_id: '',
            leave_type: 'annual',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
            reason: '',
            status: 'pending',
        });
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{t('leaves.title')}</h2>
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
                    {showForm ? t('common.cancel') : `+ ${t('leaves.requestLeave')}`}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-slideIn">
                    <h3 className="text-xl font-bold mb-6 text-gray-800 pb-2 border-b">
                        {editingId ? t('leaves.editLeave') : t('leaves.newLeave')}
                    </h3>

                    <FormSection title={t('common.basicInfo')} icon="📅">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">{t('leaves.employee')}</label>
                            <select
                                name="employee_id"
                                value={formData.employee_id}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-all duration-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                                disabled={loading}
                            >
                                <option value="">{t('leaves.selectEmployee')}</option>
                                {employees.map((emp) => (
                                    <option key={emp.employee_id} value={emp.employee_id}>
                                        {emp.first_name} {emp.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">{t('leaves.leaveType')}</label>
                            <select
                                name="leave_type"
                                value={formData.leave_type}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-all duration-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                disabled={loading}
                            >
                                <option value="annual">{t('leaves.annual')}</option>
                                <option value="sick">{t('leaves.sick')}</option>
                                <option value="unpaid">{t('leaves.unpaid')}</option>
                                <option value="other">{t('leaves.other')}</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">{t('leaves.status')}</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-all duration-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                disabled={loading}
                            >
                                <option value="pending">{t('leaves.pending')}</option>
                                <option value="approved">{t('leaves.approved')}</option>
                                <option value="rejected">{t('leaves.rejected')}</option>
                            </select>
                        </div>
                    </FormSection>

                    <FormSection title={t('addressInfo')} icon="🕙">
                        <FormInput
                            label={t('leaves.startDate')}
                            name="start_date"
                            type="date"
                            value={formData.start_date}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                        <FormInput
                            label={t('leaves.endDate')}
                            name="end_date"
                            type="date"
                            value={formData.end_date}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </FormSection>

                    <FormSection title={t('common.additionalInfo')} icon="💬">
                        <div className="md:col-span-2">
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">{t('leaves.reason')}</label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                rows="3"
                                className="w-full p-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-all duration-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                disabled={loading}
                                placeholder={t('leaves.reason')}
                            ></textarea>
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
                            {editingId ? t('leaves.updateRequest') : t('leaves.saveRequest')}
                        </button>
                    </div>
                </form>
            )}

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {fetching && leaves.length > 0 && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 animate-pulse"></div>
                )}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('leaves.employee')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('leaves.leaveType')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('leaves.startDate')} / {t('leaves.endDate')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('leaves.status')}</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{t('common.actions_title')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {leaves.map((record, index) => {
                                const emp = employees.find(e => e.employee_id === record.employee_id);
                                return (
                                    <tr
                                        key={record.leave_id}
                                        className="hover:bg-blue-50/30 transition-colors duration-200"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-semibold text-gray-900">
                                                {emp ? `${emp.first_name} ${emp.last_name}` : `ID: ${record.employee_id}`}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="capitalize px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold">
                                                {t(`leaves.${record.leave_type}`)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{record.start_date}</span>
                                                <span className="text-gray-400 text-xs">{record.end_date}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${record.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                                                record.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                }`}>
                                                {t(`leaves.${record.status}`)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(record)}
                                                className="text-white bg-indigo-500 hover:bg-indigo-600 p-2 rounded-lg mr-2 transition-all duration-200 shadow-sm"
                                                title={t('common.edit')}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(record)}
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
                {leaves.length === 0 && !fetching && (
                    <div className="text-center py-16 bg-gray-50">
                        <div className="text-6xl mb-4 text-gray-300">🏖️</div>
                        <p className="text-gray-500 text-lg font-medium">{t('common.noData')}</p>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDelete}
                title={t('leaves.deleteRequest')}
                message={`${t('customers.deleteConfirm')} "${deleteConfirm.name}"? ${t('customers.deleteConfirmMessage')}`}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                type="danger"
            />
        </div>
    );
};

export default LeaveRequests;
