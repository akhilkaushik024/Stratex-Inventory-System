import React, { useState } from 'react';
import { Package, Users, ShoppingCart, AlertTriangle, ArrowUpRight, Plus, RefreshCw } from 'lucide-react';

export default function Dashboard({ stats, onRestock, loading, refreshStats }) {
  const [restockAmounts, setRestockAmounts] = useState({});

  const handleRestockSubmit = (productId) => {
    const amount = parseInt(restockAmounts[productId]);
    if (!amount || amount <= 0) return;
    onRestock(productId, amount);
    setRestockAmounts(prev => ({ ...prev, [productId]: '' }));
  };

  return (
    <div>
      <div className="top-header">
        <div className="header-title">
          <h1>Dashboard</h1>
          <p>Real-time analytics and inventory alerts overview.</p>
        </div>
        <button className="btn btn-secondary" onClick={refreshStats} disabled={loading} style={{ display: 'flex', gap: '0.5rem' }}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Refreshing...' : 'Refresh Stats'}
        </button>
      </div>

      {/* Stats Counter Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon products">
            <Package size={24} />
          </div>
          <div className="stat-details">
            <span>Total Products</span>
            <h3>{stats?.total_products ?? 0}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon customers">
            <Users size={24} />
          </div>
          <div className="stat-details">
            <span>Total Customers</span>
            <h3>{stats?.total_customers ?? 0}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-details">
            <span>Total Orders</span>
            <h3>{stats?.total_orders ?? 0}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon low-stock">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-details">
            <span>Low Stock Products</span>
            <h3>{stats?.low_stock_products?.length ?? 0}</h3>
          </div>
        </div>
      </div>

      {/* Main Dashboard Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <h2>
              <AlertTriangle size={20} color="#ef4444" />
              Critical Low Stock Alerts (Stock &lt; 10)
            </h2>
            <span className="badge badge-danger">Attention Required</span>
          </div>

          {stats?.low_stock_products?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-secondary)' }}>
              <Package size={48} style={{ opacity: 0.25, marginBottom: '1rem' }} />
              <p style={{ fontWeight: 500, fontSize: '1.05rem' }}>All product inventory levels are optimal!</p>
              <p style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '0.25rem' }}>No products are currently low in stock.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU Code</th>
                    <th>Current Stock</th>
                    <th>Price</th>
                    <th style={{ textAlign: 'right' }}>Quick Restock Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.low_stock_products?.map((product) => (
                    <tr key={product.id} className="low-stock-row">
                      <td style={{ fontWeight: 600 }}>{product.name}</td>
                      <td>
                        <span className="badge badge-info">{product.sku}</span>
                      </td>
                      <td>
                        <span className="badge badge-danger" style={{ fontWeight: 700 }}>
                          {product.quantity_in_stock} left
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>${product.price.toFixed(2)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                          <input
                            type="number"
                            placeholder="Qty"
                            className="input-field"
                            min="1"
                            value={restockAmounts[product.id] || ''}
                            onChange={(e) => setRestockAmounts({ ...restockAmounts, [product.id]: e.target.value })}
                            style={{ width: '80px', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                          />
                          <button
                            className="btn btn-primary"
                            onClick={() => handleRestockSubmit(product.id)}
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', gap: '0.25rem' }}
                          >
                            <Plus size={14} />
                            Add
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
      </div>
    </div>
  );
}
