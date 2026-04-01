import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [generatingAI, setGeneratingAI] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'grocery',
        price: '',
        stock: '',
        unit: '1kg',
        brand: '',
        tags: []
    });

    useEffect(() => {
        fetchStores();
    }, []);

    useEffect(() => {
        if (selectedStore) {
            fetchProducts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedStore]);

    const fetchStores = async () => {
        try {
            const response = await api.stores.getMyStores();
            const storeList = response.data.data || [];
            setStores(storeList);
            if (storeList.length > 0) {
                setSelectedStore(storeList[0]._id);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stores:', error);
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.products.getByStore(selectedStore);
            setProducts(response.data.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const generateAIDescription = async () => {
        if (!formData.name) {
            alert('Please enter product name first');
            return;
        }

        try {
            setGeneratingAI(true);
            console.log('Generating description for:', formData.name);
            const response = await api.ai.generateProductDescription({
                productName: formData.name, // Changed from name to productName to match backend
                category: formData.category
            });
            console.log('AI Response:', response.data);
            setFormData({
                ...formData,
                description: response.data.data.description
            });
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to generate description');
        } finally {
            setGeneratingAI(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const productData = {
                ...formData,
                storeId: selectedStore,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock)
            };

            if (editingProduct) {
                await api.products.update(editingProduct._id, productData);
                alert('Product updated successfully');
            } else {
                await api.products.create(productData);
                alert('Product created successfully');
            }

            setShowForm(false);
            setEditingProduct(null);
            resetForm();
            await fetchProducts();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save product');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: 'grocery',
            price: '',
            stock: '',
            unit: '1kg',
            brand: '',
            tags: []
        });
    };

    const editProduct = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            category: product.category,
            price: product.price.toString(),
            stock: product.stock.toString(),
            unit: product.unit,
            brand: product.brand || '',
            tags: product.tags || []
        });
        setShowForm(true);
    };

    const deleteProduct = async (productId) => {
        if (!window.confirm('Delete this product?')) return;

        try {
            await api.products.delete(productId);
            alert('Product deleted successfully');
            await fetchProducts();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete product');
        }
    };

    const toggleProductStatus = async (productId, currentStatus) => {
        try {
            await api.products.update(productId, { isAvailable: !currentStatus });
            await fetchProducts();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update product status');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (stores.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">No stores found</h2>
                    <p className="text-gray-600 mb-8">Create a store first to add products</p>
                    <a href="/vendor/stores" className="btn-primary">Create Store</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Manage Products</h1>
                        <p className="text-gray-600 mt-2">{products.length} product(s)</p>
                    </div>
                    {!showForm && (
                        <button onClick={() => setShowForm(true)} className="btn-primary">
                            + Add Product
                        </button>
                    )}
                </div>

                {/* Store Selector */}
                <div className="card mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Store</label>
                    <select
                        value={selectedStore}
                        onChange={(e) => setSelectedStore(e.target.value)}
                        className="input-field max-w-md"
                    >
                        {stores.map(store => (
                            <option key={store._id} value={store._id}>{store.name}</option>
                        ))}
                    </select>
                </div>

                {/* Product Form */}
                {showForm && (
                    <div className="card mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="input-field"
                                        required
                                    >
                                        <option value="grocery">Grocery</option>
                                        <option value="vegetables">Vegetables</option>
                                        <option value="fruits">Fruits</option>
                                        <option value="dairy">Dairy</option>
                                        <option value="bakery">Bakery</option>
                                        <option value="meat">Meat & Seafood</option>
                                        <option value="beverages">Beverages</option>
                                        <option value="snacks">Snacks</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <button
                                        type="button"
                                        onClick={generateAIDescription}
                                        disabled={generatingAI}
                                        className="text-sm text-primary-600 hover:text-primary-700 font-semibold disabled:opacity-50"
                                    >
                                        {generatingAI ? '🤖 Generating...' : '🤖 Generate with AI'}
                                    </button>
                                </div>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field"
                                    rows="3"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
                                    <select
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        className="input-field"
                                        required
                                    >
                                        <option value="1kg">1 kg</option>
                                        <option value="500g">500 g</option>
                                        <option value="250g">250 g</option>
                                        <option value="1L">1 L</option>
                                        <option value="500ml">500 ml</option>
                                        <option value="1pc">1 piece</option>
                                        <option value="1dz">1 dozen</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                                <input
                                    type="text"
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button type="submit" className="btn-primary">
                                    {editingProduct ? 'Update Product' : 'Create Product'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingProduct(null);
                                        resetForm();
                                    }}
                                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Products List */}
                {products.length === 0 ? (
                    <div className="card text-center py-16">
                        <div className="text-8xl mb-6">📦</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">No products yet</h2>
                        <p className="text-gray-600 mb-8">Add your first product to start selling</p>
                        {!showForm && (
                            <button onClick={() => setShowForm(true)} className="btn-primary">
                                Add Product
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map(product => (
                            <div key={product._id} className="card">
                                <div className="h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                                    <span className="text-5xl">📦</span>
                                </div>

                                <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                                <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                                <p className="text-lg font-bold text-primary-600 mb-2">₹{product.price}</p>

                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                                    <button
                                        onClick={() => toggleProductStatus(product._id, product.isAvailable)}
                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        {product.isAvailable ? 'Active' : 'Inactive'}
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => editProduct(product)}
                                        className="flex-1 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteProduct(product._id)}
                                        className="flex-1 px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageProducts;
