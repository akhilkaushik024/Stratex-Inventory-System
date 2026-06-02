import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Package, Star, ShoppingCart, X } from 'lucide-react';

export default function ProductManager({ products, onCreate, onUpdate, onDelete, searchTerm, showToast }) {
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
      showToast('Price must be a positive number.', 'error');
      return;
    }
    if (isNaN(parsedStock) || parsedStock < 0) {
      showToast('Stock quantity cannot be negative.', 'error');
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
          <h1>Product Catalog</h1>
          {searchTerm ? (
            <p className="search-status">
              Showing {filteredProducts.length} of {products.length} products matching <span className="highlight-term">&ldquo;{searchTerm}&rdquo;</span>
            </p>
          ) : (
            <p>Manage your storefront inventory, pricing, and details.</p>
          )}
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} />
          Add New Product
        </button>
      </div>



      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-secondary)' }}>
          <Package size={52} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>No Products Found</p>
          <p style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '0.25rem' }}>
            {searchTerm ? "Try modifying your search filter." : "Get started by adding your first product to the catalog!"}
          </p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.quantity_in_stock === 0;
            
            // Extract a clean, highly matched search keyword for product images
            const nameLower = product.name.toLowerCase();
            let searchKeyword = '';
            
            if (nameLower.includes('keyboard')) {
              searchKeyword = 'keyboard';
            } else if (nameLower.includes('mouse')) {
              searchKeyword = 'computermouse';
            } else if (nameLower.includes('laptop') || nameLower.includes('macbook') || nameLower.includes('computer')) {
              searchKeyword = 'laptop';
            } else if (nameLower.includes('headphone') || nameLower.includes('earphone') || nameLower.includes('audio') || nameLower.includes('mic')) {
              searchKeyword = 'headphones';
            } else if (nameLower.includes('phone') || nameLower.includes('mobile') || nameLower.includes('iphone') || nameLower.includes('android')) {
              searchKeyword = 'smartphone';
            } else if (nameLower.includes('monitor') || nameLower.includes('screen') || nameLower.includes('display') || nameLower.includes('tv')) {
              searchKeyword = 'monitor';
            } else if (nameLower.includes('watch') || nameLower.includes('clock')) {
              searchKeyword = 'smartwatch';
            } else if (nameLower.includes('camera') || nameLower.includes('lens')) {
              searchKeyword = 'camera';
            } else if (nameLower.includes('chair') || nameLower.includes('desk') || nameLower.includes('table')) {
              searchKeyword = 'officechair';
            } else if (nameLower.includes('bag') || nameLower.includes('backpack') || nameLower.includes('luggage')) {
              searchKeyword = 'backpack';
            } else if (nameLower.includes('bottle') || nameLower.includes('flask') || nameLower.includes('cup') || nameLower.includes('mug')) {
              searchKeyword = 'waterbottle';
            } else {
              // Fallback: use the first two alphanumeric words of the product name
              searchKeyword = product.name
                .replace(/[^a-zA-Z0-9\s]/g, '')
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .join(',')
                .toLowerCase() || 'gadget';
            }

            // Generate deterministic matched image matching name & ID lock
            const imageUrl = `https://loremflickr.com/400/300/${encodeURIComponent(searchKeyword)}?lock=${product.id}`;

            return (
              <div key={product.id} className="product-card">
                <div className="product-image-placeholder">
                  <img src={imageUrl} alt={product.name} />
                  <div className="product-actions-overlay">
                    <button className="btn-icon" onClick={() => openEditModal(product)} title="Edit Product">
                      <Edit2 size={16} />
                    </button>
                    <button className="btn-icon delete" onClick={() => {
                      if (confirm(`Are you sure you want to delete "${product.name}"?`)) onDelete(product.id);
                    }} title="Delete Product">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="product-details">
                  <div className="product-title">{product.name}</div>
                  


                  <div className="product-price">
                    <span className="product-price-symbol">₹</span>
                    {product.price.toFixed(2)}
                  </div>
                  
                  <div className="product-stock">
                    {isOutOfStock ? (
                      <span className="stock-out">Currently unavailable.</span>
                    ) : product.quantity_in_stock < 10 ? (
                      <span className="stock-low">Only {product.quantity_in_stock} left in stock - order soon.</span>
                    ) : (
                      <span className="stock-in">In stock ({product.quantity_in_stock} available).</span>
                    )}
                  </div>
                  
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                    SKU: {product.sku}
                  </div>


                </div>
              </div>
            );
          })}
        </div>
      )}

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
              <div className="form-group">
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

              <div className="form-group">
                <label>SKU / Product Code</label>
                <input
                  type="text"
                  required
                  disabled={!!editingProduct}
                  placeholder="e.g. KB-MECH-87"
                  className="input-field"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Unit Price (₹)</label>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
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
