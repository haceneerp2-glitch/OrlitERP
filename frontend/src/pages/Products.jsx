import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import useToastStore from '../store/toastStore';
import { getErrorMessage } from '../utils/errorHandler';
import ConfirmDialog from '../components/ConfirmDialog';
import FormInput from '../components/FormInput';
import FormSection from '../components/FormSection';

const Products = () => {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        product_code: '',
        product_name: '',
        description: '',
        price: '',
        stock_quantity: 0,
    });
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, name: '' });

    const addToast = useToastStore((state) => state.addToast);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setFetching(true);
        try {
            const response = await api.get('/master-data/products/');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            addToast(getErrorMessage(error), 'error');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (product) => {
        setFormData({
            product_code: product.product_code,
            product_name: product.product_name,
            description: product.description || '',
            price: product.price,
            stock_quantity: product.stock_quantity || 0,
        });
        setEditingId(product.product_id);
        setShowForm(true);
    };

    const handleDeleteClick = (product) => {
        setDeleteConfirm({
            isOpen: true,
            id: product.product_id,
            name: product.product_name,
        });
    };

    const handleDelete = async () => {
        if (!deleteConfirm.id) return;
        try {
            await api.delete(`/master-data/products/${deleteConfirm.id}`);
            addToast(t('products.deletedSuccess'), 'success');
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
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
                price: parseFloat(formData.price),
                stock_quantity: parseInt(formData.stock_quantity, 10),
            };

            if (editingId) {
                await api.put(`/master-data/products/${editingId}`, payload);
                addToast(t('products.updatedSuccess'), 'success');
            } else {
                await api.post('/master-data/products/', payload);
                addToast(t('products.createdSuccess'), 'success');
            }
            fetchProducts();
            handleCancel();
        } catch (error) {
            console.error('Error saving product:', error);
            addToast(getErrorMessage(error), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            product_code: '',
            product_name: '',
            description: '',
            price: '',
            stock_quantity: 0,
        });
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{t('products.title')}</h2>
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
                    {showForm ? t('common.cancel') : `+ ${t('products.addProduct')}`}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-slideIn">
                    <h3 className="text-xl font-bold mb-6 text-gray-800 pb-2 border-b">
                        {editingId ? t('products.editProduct') : t('products.newProduct')}
                    </h3>

                    <FormSection title={t('common.basicInfo')} icon="🏷️">
                        <FormInput
                            label={t('products.productCode') || "Product Code"}
                            name="product_code"
                            value={formData.product_code}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="PROD001"
                        />
                        <FormInput
                            label={t('products.productName')}
                            name="product_name"
                            value={formData.product_name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder={t('products.productName')}
                        />
                        <FormInput
                            label={t('products.description')}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder={t('products.description')}
                        />
                    </FormSection>

                    <FormSection title={t('products.pricing')} icon="💰">
                        <FormInput
                            label={t('products.price')}
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="0.00"
                            icon="$"
                        />
                        <FormInput
                            label={t('products.stockQuantity')}
                            name="stock_quantity"
                            type="number"
                            value={formData.stock_quantity}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="0"
                            icon="📦"
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
                            {editingId ? t('products.updateProduct') : t('products.saveProduct')}
                        </button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                    <div
                        key={product.product_id}
                        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="h-48 bg-gray-100 flex items-center justify-center relative overflow-hidden group">
                            <span className="text-6xl group-hover:scale-110 transition-transform duration-500">🏷️</span>
                            <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                ${product.price?.toLocaleString()}
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">{product.product_name}</h3>
                            <p className="text-gray-500 text-sm mb-1 truncate">Code: {product.product_code}</p>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">{product.description || t('common.noDescription')}</p>

                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
                                <span className="text-sm text-gray-500">
                                    {t('products.stockQuantity')}:
                                    <span className={`ml-1 font-bold ${product.stock_quantity > 10 ? 'text-green-600' : 'text-red-500'}`}>
                                        {product.stock_quantity}
                                    </span>
                                </span>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all duration-300 flex items-center gap-1 text-sm font-bold"
                                >
                                    ✏️ {t('common.edit')}
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(product)}
                                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300 flex items-center gap-1 text-sm font-bold"
                                >
                                    🗑️ {t('common.delete')}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {products.length === 0 && !fetching && (
                <div className="text-center py-24 bg-white rounded-3xl shadow-inner border-2 border-dashed border-gray-100">
                    <div className="text-8xl mb-6 opacity-20">🏷️</div>
                    <p className="text-gray-400 text-xl font-medium">{t('common.noData')}</p>
                </div>
            )}

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDelete}
                title={t('products.deleteProduct')}
                message={`${t('customers.deleteConfirm')} "${deleteConfirm.name}"? ${t('customers.deleteConfirmMessage')}`}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                type="danger"
            />
        </div>
    );
};

export default Products;
