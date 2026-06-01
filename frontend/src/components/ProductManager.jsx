import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, X, Package } from 'lucide-react';

export default function ProductManager({ products, onCreate, onUpdate, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form States
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setSku('');
    setPrice('');
    setStock('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setSku(product.sku);
    setPrice(product.price.toString());
    setStock(product.quantity_in_stock.toString());
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim() || !price || !stock) return;

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock);

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      alert("Price must be a positive number.");
      return;
    }
    if (isNaN(parsedStock) || parsedStock < 0) {
      alert("Stock quantity cannot be negative.");
      return;
    }

    const productData = {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      price: parsedPrice,
      quantity_in_stock: parsedStock
    };

    if (editingProduct) {
      onUpdate(editingProduct.id, productData);
    } else {
      onCreate(productData);
    }
    setIsModalOpen(false);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="top-header">
        <div className="header-title">
          <h1>Product Management</h1>
          <p>Maintain your product catalog, prices, and stock counts.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              className="input-field"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="card">
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-secondary)' }}>
            <Package size={52} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>No Products Found</p>
            <p style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '0.25rem' }}>
              {searchTerm ? "Try modifying your search filter." : "Get started by adding your first product to the catalog!"}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU Code</th>
                  <th>Unit Price</th>
                  <th>Quantity in Stock</th>
                  <th>Inventory Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const isLowStock = product.quantity_in_stock < 10;
                  const isOutOfStock = product.quantity_in_stock === 0;

                  return (
                    <tr key={product.id} className={isLowStock ? 'low-stock-row' : ''}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{product.name}</div>
                      </td>
                      <td>
                        <span className="badge badge-info">{product.sku}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        ${product.price.toFixed(2)}
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {product.quantity_in_stock} units
                      </td>
                      <td>
                        {isOutOfStock ? (
                          <span className="badge badge-danger">Out of Stock</span>
                        ) : isLowStock ? (
                          <span className="badge badge-warning">Low Stock</span>
                        ) : (
                          <span className="badge badge-success">Optimal</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                          <button
                            className="btn-icon"
                            onClick={() => openEditModal(product)}
                            title="Edit Product"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="btn-icon delete"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
                                onDelete(product.id);
                              }
                            }}
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-close" onClick={() => setIsModalOpen(false)}>
              <X size={20} />
            </div>
            
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Package size={22} color="var(--accent-primary)" />
              {editingProduct ? 'Edit Catalog Product' : 'Add New Product'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanical Keyboard"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>SKU / Product Code</label>
                <input
                  type="text"
                  required
                  disabled={!!editingProduct} /* Prevent SKU mutation in editing for strict safety */
                  placeholder="e.g. KB-MECH-87"
                  className="input-field"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  style={{ textTransform: 'uppercase' }}
                />
                {!editingProduct && <small style={{ color: 'var(--text-muted)' }}>Must be globally unique.</small>}
              </div>

              <div className="form-grid" style={{ marginBottom: '2rem' }}>
                <div className="form-group">
                  <label>Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="29.99"
                    className="input-field"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Initial Stock Qty</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="150"
                    className="input-field"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
