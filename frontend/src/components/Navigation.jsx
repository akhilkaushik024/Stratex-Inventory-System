import React from 'react';
import { Package, Users, ShoppingCart, LayoutDashboard, Search, Menu, MapPin } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab }) {
  return (
    <header>
      {/* Main Top Nav */}
      <div className="navbar-top">
        <div className="nav-logo-container" onClick={() => setActiveTab('products')}>
          <div className="logo-text">
            Stratex<span>.</span>in
          </div>
        </div>

        <div className="nav-item" style={{ flexDirection: 'row', alignItems: 'center', gap: '5px' }}>
          <MapPin size={18} />
          <div>
            <div className="nav-item-line1">Delivering to Inventory</div>
            <div className="nav-item-line2">Update location</div>
          </div>
        </div>

        <div className="nav-search-bar">
          <select className="nav-search-select">
            <option>All</option>
            <option>Products</option>
            <option>Customers</option>
          </select>
          <input type="text" className="nav-search-input" placeholder="Search Stratex.in catalog..." />
          <button className="nav-search-btn">
            <Search size={20} />
          </button>
        </div>

        <div className="nav-links">
          <div 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="nav-item-line1">Analytics</div>
            <div className="nav-item-line2">Dashboard</div>
          </div>

          <div 
            className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            <div className="nav-item-line1">Hello, Admin</div>
            <div className="nav-item-line2">Customers</div>
          </div>

          <div 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <div className="nav-item-line1">Returns</div>
            <div className="nav-item-line2">& Orders</div>
          </div>

          <div 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
            style={{ flexDirection: 'row', alignItems: 'flex-end', gap: '5px' }}
          >
            <ShoppingCart size={32} />
            <span style={{ fontWeight: 'bold' }}>Cart</span>
          </div>
        </div>
      </div>

      {/* Sub Nav Bar */}
      <div className="navbar-sub">
        <div className="sub-nav-item" style={{ display: 'flex', gap: '5px', alignItems: 'center', fontWeight: 'bold' }}>
          <Menu size={16} /> All
        </div>
        <div className={`sub-nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Products Catalog</div>
        <div className={`sub-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Today's Deals (Dashboard)</div>
        <div className={`sub-nav-item ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>Customer Service</div>
        <div className="sub-nav-item">Sell</div>
        <div className="sub-nav-item">Best Sellers</div>
      </div>
    </header>
  );
}
