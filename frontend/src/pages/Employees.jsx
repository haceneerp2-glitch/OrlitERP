import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import useToastStore from '../store/toastStore';
import { getErrorMessage } from '../utils/errorHandler';
import ConfirmDialog from '../components/ConfirmDialog';
import FormInput from '../components/FormInput';
import FormSection from '../components/FormSection';

const Employees = () => {
    const { t } = useTranslation();
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        job_position: '',
        department: '',
        basic_salary: '',
    });
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, name: '' });

    const addToast = useToastStore((state) => state.addToast);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setFetching(true);
        try {
            const response = await api.get('/hr/employees/');
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
            addToast(getErrorMessage(error), 'error');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (employee) => {
        setFormData({
            first_name: employee.first_name,
            last_name: employee.last_name,
            email: employee.email,
            phone: employee.phone || '',
            job_position: employee.job_position || '',
            department: employee.department || '',
            basic_salary: employee.basic_salary || '',
        });
        setEditingId(employee.employee_id);
        setShowForm(true);
    };

    const handleDeleteClick = (employee) => {
        setDeleteConfirm({
            isOpen: true,
            id: employee.employee_id,
            name: `${employee.first_name} ${employee.last_name}`,
        });
    };

    const handleDelete = async () => {
        if (!deleteConfirm.id) return;
        try {
            await api.delete(`/hr/employees/${deleteConfirm.id}`);
            addToast(t('employees.deletedSuccess'), 'success');
            fetchEmployees();
        } catch (error) {
            console.error('Error deleting employee:', error);
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
                await api.put(`/hr/employees/${editingId}`, formData);
                addToast(t('employees.updatedSuccess'), 'success');
            } else {
                await api.post('/hr/employees/', formData);
                addToast(t('employees.createdSuccess'), 'success');
            }
            fetchEmployees();
            handleCancel();
        } catch (error) {
            console.error('Error saving employee:', error);
            addToast(getErrorMessage(error), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            job_position: '',
            department: '',
            basic_salary: '',
        });
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{t('employees.title')}</h2>
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
                    {showForm ? t('common.cancel') : `+ ${t('employees.addEmployee')}`}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-slideIn">
                    <h3 className="text-xl font-bold mb-6 text-gray-800 pb-2 border-b">
                        {editingId ? t('employees.editEmployee') : t('employees.newEmployee')}
                    </h3>

                    <FormSection title={t('common.basicInfo')} icon="👤">
                        <FormInput
                            label={t('employees.firstName')}
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder={t('employees.firstName')}
                        />
                        <FormInput
                            label={t('employees.lastName')}
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder={t('employees.lastName')}
                        />
                    </FormSection>

                    <FormSection title={t('common.contactDetails')} icon="📞">
                        <FormInput
                            label={t('employees.email')}
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder={t('employees.email')}
                            icon="📧"
                        />
                        <FormInput
                            label={t('employees.phone')}
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder={t('employees.phone')}
                            icon="📱"
                        />
                    </FormSection>

                    <FormSection title={t('employees.jobPosition')} icon="👔">
                        <FormInput
                            label={t('employees.jobPosition')}
                            name="job_position"
                            value={formData.job_position}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder={t('employees.jobPosition')}
                        />
                        <FormInput
                            label={t('employees.department')}
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder={t('employees.department')}
                            icon="🏢"
                        />
                        <FormInput
                            label={t('employees.basicSalary')}
                            name="basic_salary"
                            type="number"
                            value={formData.basic_salary}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder={t('employees.basicSalary')}
                            icon="💰"
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
                            {editingId ? t('employees.updateEmployee') : t('employees.saveEmployee')}
                        </button>
                    </div>
                </form>
            )}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                {fetching && employees.length > 0 && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 animate-pulse"></div>
                )}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('employees.firstName')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('employees.jobPosition')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('employees.department')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('employees.email')}</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{t('common.actions_title')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {employees.map((employee, index) => (
                                <tr
                                    key={employee.employee_id}
                                    className="hover:bg-blue-50/30 transition-colors duration-200"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-semibold text-gray-900">{employee.first_name} {employee.last_name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                                            {employee.job_position}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{employee.department}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{employee.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(employee)}
                                            className="text-white bg-indigo-500 hover:bg-indigo-600 p-2 rounded-lg mr-2 transition-all duration-200 shadow-sm"
                                            title={t('common.edit')}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(employee)}
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
                {employees.length === 0 && !fetching && (
                    <div className="text-center py-16 bg-gray-50">
                        <div className="text-6xl mb-4 text-gray-300">👤</div>
                        <p className="text-gray-500 text-lg font-medium">{t('common.noData')}</p>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDelete}
                title={t('employees.deleteEmployee')}
                message={`${t('customers.deleteConfirm')} "${deleteConfirm.name}"? ${t('customers.deleteConfirmMessage')}`}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                type="danger"
            />
        </div>
    );
};

export default Employees;
