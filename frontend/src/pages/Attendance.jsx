import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import useToastStore from '../store/toastStore';
import { getErrorMessage } from '../utils/errorHandler';
import ConfirmDialog from '../components/ConfirmDialog';
import FormInput from '../components/FormInput';
import FormSection from '../components/FormSection';

const Attendance = () => {
    const { t } = useTranslation();
    const [attendance, setAttendance] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        employee_id: '',
        date: new Date().toISOString().split('T')[0],
        status: 'present',
    });
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, name: '' });

    const addToast = useToastStore((state) => state.addToast);

    useEffect(() => {
        fetchAttendance();
        fetchEmployees();
    }, []);

    const fetchAttendance = async () => {
        setFetching(true);
        try {
            const response = await api.get('/hr/attendance/');
            setAttendance(response.data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
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
            date: record.date,
            status: record.status || 'present',
        });
        setEditingId(record.attendance_id);
        setShowForm(true);
    };

    const handleDeleteClick = (record) => {
        const emp = employees.find(e => e.employee_id === record.employee_id);
        setDeleteConfirm({
            isOpen: true,
            id: record.attendance_id,
            name: emp ? `${emp.first_name} ${emp.last_name} (${record.date})` : record.date,
        });
    };

    const handleDelete = async () => {
        if (!deleteConfirm.id) return;
        try {
            await api.delete(`/hr/attendance/${deleteConfirm.id}`);
            addToast(t('attendance.deletedSuccess'), 'success');
            fetchAttendance();
        } catch (error) {
            console.error('Error deleting attendance record:', error);
            addToast(getErrorMessage(error), 'error');
        } finally {
            setDeleteConfirm({ isOpen: false, id: null, name: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.employee_id) {
            addToast(t('attendance.selectEmployee'), 'error');
            return;
        }
        setLoading(true);
        try {
            const payload = {
                ...formData,
                employee_id: parseInt(formData.employee_id, 10),
            };

            if (editingId) {
                await api.put(`/hr/attendance/${editingId}`, payload);
                addToast(t('attendance.updatedSuccess'), 'success');
            } else {
                await api.post('/hr/attendance/', payload);
                addToast(t('attendance.createdSuccess'), 'success');
            }

            fetchAttendance();
            handleCancel();
        } catch (error) {
            console.error('Error recording/updating attendance:', error);
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
            date: new Date().toISOString().split('T')[0],
            status: 'present',
        });
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{t('attendance.title')}</h2>
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
                    {showForm ? t('common.cancel') : `+ ${t('attendance.recordAttendance')}`}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-slideIn">
                    <h3 className="text-xl font-bold mb-6 text-gray-800 pb-2 border-b">
                        {editingId ? t('attendance.editAttendance') : t('attendance.newAttendance')}
                    </h3>

                    <FormSection title={t('common.basicInfo')} icon="📅">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">{t('attendance.employee')}</label>
                            <select
                                name="employee_id"
                                value={formData.employee_id}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-all duration-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                                disabled={loading}
                            >
                                <option value="">{t('attendance.selectEmployee')}</option>
                                {employees.map((emp) => (
                                    <option key={emp.employee_id} value={emp.employee_id}>
                                        {emp.first_name} {emp.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <FormInput
                            label={t('attendance.date')}
                            name="date"
                            type="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            icon="🕙"
                        />
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">{t('attendance.status')}</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-all duration-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                disabled={loading}
                            >
                                <option value="present">{t('attendance.present')}</option>
                                <option value="absent">{t('attendance.absent')}</option>
                                <option value="late">{t('attendance.late')}</option>
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
                            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center gap-2 font-semibold"
                        >
                            {loading && (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            )}
                            {editingId ? t('attendance.updateAttendance') : t('attendance.saveAttendance')}
                        </button>
                    </div>
                </form>
            )}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                {fetching && attendance.length > 0 && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 animate-pulse"></div>
                )}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('attendance.employee')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('attendance.date')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('attendance.status')}</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{t('common.actions_title')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {attendance.map((record, index) => {
                                const emp = employees.find(e => e.employee_id === record.employee_id);
                                return (
                                    <tr
                                        key={record.attendance_id}
                                        className="hover:bg-blue-50/30 transition-colors duration-200"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-semibold text-gray-900">
                                                {emp ? `${emp.first_name} ${emp.last_name}` : `ID: ${record.employee_id}`}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{record.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${record.status === 'present' ? 'bg-green-100 text-green-800 border-green-200' :
                                                record.status === 'absent' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                }`}>
                                                {t(`attendance.${record.status}`)}
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
                {attendance.length === 0 && !fetching && (
                    <div className="text-center py-16 bg-gray-50">
                        <div className="text-6xl mb-4 text-gray-300">📅</div>
                        <p className="text-gray-500 text-lg font-medium">{t('common.noData')}</p>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDelete}
                title={t('attendance.deleteAttendance')}
                message={`${t('customers.deleteConfirm')} "${deleteConfirm.name}"? ${t('customers.deleteConfirmMessage')}`}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                type="danger"
            />
        </div>
    );
};

export default Attendance;
