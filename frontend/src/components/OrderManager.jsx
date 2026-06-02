import React, { useState } from 'react';
import { Plus, Trash2, Search, X, ShoppingCart, Calendar, User, FileText, ArrowRight } from 'lucide-react';

// Help parse timezone-naive UTC ISO strings and format them accurately in India Standard Time (IST)
const formatOrderDateTime = (dateString) => {
  if (!dateString) return '';
  
  // Extract date components assuming they are saved as UTC from the backend
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})/);
  let date;
  if (match) {
    const [_, year, month, day, hour, minute, second] = match;
    date = new Date(Date.UTC(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    ));
  } else {
    date = new Date(dateString);
  }

  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

const formatOrderDateOnly = (dateString) => {
  if (!dateString) return '';
  
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  let date;
  if (match) {
    const [_, year, month, day] = match;
    // Default to noon UTC to avoid date shifts when converting timezone
    date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0));
  } else {
    date = new Date(dateString);
  }

  return date.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export default function OrderManager({ orders, customers, products, onCreate, onDelete, searchTerm, showToast }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Checkout Form States
  const [customerId, setCustomerId] = useState('');
  const [cartItems, setCartItems] = useState([{ product_id: '', quantity: 1 }]);

  const openCreateModal = () => {
    setCustomerId('');
    setCartItems([{ product_id: '', quantity: 1 }]);
    setIsCreateModalOpen(true);
  };

  const handleAddCartItem = () => {
    setCartItems([...cartItems, { product_id: '', quantity: 1 }]);
  };

  const handleRemoveCartItem = (index) => {
    const updated = cartItems.filter((_, i) => i !== index);
    setCartItems(updated.length ? updated : [{ product_id: '', quantity: 1 }]);
  };

  const handleCartItemChange = (index, field, value) => {
    const updated = [...cartItems];
    updated[index][field] = value;
    setCartItems(updated);
  };

  // Compute local real-time checkout sum
  const calculateCartTotal = () => {
    return cartItems.reduce((sum, item) => {
      const product = products.find(p => p.id === parseInt(item.product_id));
      if (!product) return sum;
      return sum + (product.price * (parseInt(item.quantity) || 0));
    }, 0);
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!customerId) {
      showToast('Please select a customer.', 'error');
      return;
    }

    // Verify all cart items have valid product selected and positive quantity
    const itemsPayload = [];
    const aggregatedQuantities = {};

    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      if (!item.product_id) {
        showToast('Please select a product for all rows.', 'error');
        return;
      }
      const qty = parseInt(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        showToast('Quantities must be greater than zero.', 'error');
        return;
      }

      const pId = parseInt(item.product_id);
      aggregatedQuantities[pId] = (aggregatedQuantities[pId] || 0) + qty;
    }

    // Validate stock levels locally first before invoking backend
    for (const [pId, qty] of Object.entries(aggregatedQuantities)) {
      const product = products.find(p => p.id === parseInt(pId));
      if (!product) continue;
      if (product.quantity_in_stock < qty) {
        showToast(`Insufficient stock for "${product.name}". Available: ${product.quantity_in_stock}, Requested: ${qty}`, 'error');
        return;
      }
      itemsPayload.push({
        product_id: parseInt(pId),
        quantity: qty
      });
    }

    onCreate({
      customer_id: parseInt(customerId),
      items: itemsPayload
    });

    setIsCreateModalOpen(false);
  };

  const filteredOrders = orders;

  return (
    <div>
      <div className="top-header">
        <div className="header-title">
          <h1>Order Fulfillment</h1>
          {searchTerm ? (
            <p className="search-status">
              Showing {filteredOrders.length} of {orders.length} orders matching <span className="highlight-term">&ldquo;{searchTerm}&rdquo;</span>
            </p>
          ) : (
            <p>Process, list, and examine incoming client transactions.</p>
          )}
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} />
          Create New Order
        </button>
      </div>



      {/* Orders Directory Card */}
      <div className="card">
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-secondary)' }}>
            <ShoppingCart size={52} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>No Orders Found</p>
            <p style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '0.25rem' }}>
              {searchTerm ? "No orders match your current filter." : "Create orders to begin tracking sales and stock."}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Purchase Date</th>
                  <th>Total Amount</th>
                  <th>Items Count</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span className="badge badge-info" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        #STRX-{order.id.toString().padStart(5, '0')}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.customer?.full_name || 'Deleted Customer'}</div>
                      <small style={{ color: 'var(--text-muted)' }}>{order.customer?.email}</small>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                        <Calendar size={14} />
                        {formatOrderDateOnly(order.created_at)}
                      </div>
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--accent-success)' }}>
                      ₹{order.total_amount.toFixed(2)}
                    </td>
                    <td>
                      <span className="badge badge-success" style={{ fontWeight: 600 }}>
                        {order.items?.reduce((total, item) => total + item.quantity, 0) || 0} units
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                        <button
                          className="btn-icon"
                          onClick={() => setSelectedOrder(order)}
                          title="View Invoice"
                        >
                          <FileText size={16} />
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => {
                            if (confirm(`Are you sure you want to cancel order #STRX-${order.id.toString().padStart(5, '0')}? Stock levels will be restored.`)) {
                              onDelete(order.id);
                            }
                          }}
                          title="Cancel Order"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Viewer Modal */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-close" onClick={() => setSelectedOrder(null)}>
              <X size={20} />
            </div>

            <div className="invoice-container">
              <div className="invoice-header">
                <div>
                  <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>INVOICE</h2>
                  <span className="badge badge-info" style={{ fontFamily: 'monospace' }}>
                    #STRX-{selectedOrder.id.toString().padStart(5, '0')}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h3 style={{ color: 'var(--accent-primary)', fontSize: '1.4rem' }}>STRATEX INC</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Enterprise Inventory Logistics</p>
                </div>
              </div>

              <div className="invoice-details">
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Billed To:</h4>
                  <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedOrder.customer?.full_name || 'Deleted Customer'}</p>
                  <p>{selectedOrder.customer?.email}</p>
                  <p>{selectedOrder.customer?.phone_number}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Date Issued:</h4>
                  <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatOrderDateTime(selectedOrder.created_at)}</p>
                </div>
              </div>

              <div className="table-container" style={{ margin: '1.5rem 0' }}>
                <table className="custom-table" style={{ fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      <th>Product Details</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th style={{ textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{item.product?.name || 'Deleted Product'}</div>
                          <small style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>SKU: {item.product?.sku}</small>
                        </td>
                        <td>{item.quantity} units</td>
                        <td>₹{item.unit_price.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                          ₹{(item.quantity * item.unit_price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="invoice-total-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px', paddingBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  <span>Subtotal:</span>
                  <span>₹{selectedOrder.total_amount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px', paddingBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  <span>Taxes & Shipping:</span>
                  <span>₹0.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px', paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-success)' }}>
                  <span>Total Due:</span>
                  <span>₹{selectedOrder.total_amount.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>
                  Close Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Drawer / Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <div className="modal-close" onClick={() => setIsCreateModalOpen(false)}>
              <X size={20} />
            </div>

            <h2 style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <ShoppingCart size={22} color="var(--accent-primary)" />
              Create Sales Order
            </h2>

            <form onSubmit={handleCheckout}>
              {/* Select Customer */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Select Billed Customer</label>
                <select
                  required
                  className="input-field"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                  ))}
                </select>
                {customers.length === 0 && (
                  <small style={{ color: 'var(--accent-danger)', marginTop: '0.25rem' }}>
                    * No customers available. Please add a customer first in the Customer tab.
                  </small>
                )}
              </div>

              {/* Order Basket Section */}
              <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                Order Basket Items
              </h3>

              <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '0.25rem', marginBottom: '1.5rem' }}>
                {cartItems.map((item, index) => {
                  const selectedProduct = products.find(p => p.id === parseInt(item.product_id));
                  const availableStock = selectedProduct ? selectedProduct.quantity_in_stock : 0;
                  
                  return (
                    <div key={index} style={{ display: 'grid', gridTemplateColumns: '3fr 1.5fr 1fr auto', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                      {/* Product select */}
                      <select
                        required
                        className="input-field"
                        value={item.product_id}
                        onChange={(e) => handleCartItemChange(index, 'product_id', e.target.value)}
                      >
                        <option value="">-- Choose Product --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id} disabled={p.quantity_in_stock === 0}>
                            {p.name} - ₹{p.price.toFixed(2)} ({p.quantity_in_stock} in stock)
                          </option>
                        ))}
                      </select>

                      {/* Quantity input */}
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          min="1"
                          required
                          placeholder="Qty"
                          className="input-field"
                          value={item.quantity}
                          onChange={(e) => handleCartItemChange(index, 'quantity', e.target.value)}
                        />
                        {selectedProduct && (
                          <small style={{
                            position: 'absolute',
                            bottom: '-1.15rem',
                            left: '0.25rem',
                            fontSize: '0.65rem',
                            color: parseInt(item.quantity) > availableStock ? 'var(--accent-danger)' : 'var(--text-secondary)'
                          }}>
                            Max: {availableStock}
                          </small>
                        )}
                      </div>

                      {/* Line subtotal */}
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', textAlign: 'right' }}>
                        ₹{selectedProduct ? (selectedProduct.price * (parseInt(item.quantity) || 0)).toFixed(2) : '0.00'}
                      </div>

                      {/* Remove row */}
                      <button
                        type="button"
                        className="btn-icon delete"
                        onClick={() => handleRemoveCartItem(index)}
                        style={{ padding: '0.4rem' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Action row to add items */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddCartItem}
                  style={{ display: 'flex', gap: '0.25rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  <Plus size={16} />
                  Add Another Item
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Checkout Total:</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-success)' }}>
                    ₹{calculateCartTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={products.length === 0 || customers.length === 0}
                  style={{ display: 'flex', gap: '0.5rem' }}
                >
                  Checkout Order
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
