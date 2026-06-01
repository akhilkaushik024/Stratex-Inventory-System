import React from 'react';
import { Search } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, globalSearch, setGlobalSearch }) {
  return (
    <header>
      {/* Main Top Nav */}
      <div className="navbar-top">
        <div className="nav-logo-container" onClick={() => setActiveTab('products')}>
          <div className="logo-text">
            Stratex<span>.</span>in
          </div>
        </div>



        <div className="nav-search-bar">
          <select className="nav-search-select" onChange={(e) => {
            // Optional: could change activeTab based on select
            if(e.target.value !== 'All') setActiveTab(e.target.value.toLowerCase());
          }}>
            <option value="All">All Categories</option>
            <option value="products">Products</option>
            <option value="customers">Customers</option>
            <option value="orders">Orders</option>
          </select>
          <input 
            type="text" 
            className="nav-search-input" 
            placeholder="Search catalog, customers, or orders..." 
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
          <button className="nav-search-btn">
            <Search size={20} />
          </button>
        </div>

        <div className="nav-links">
          <div 
            className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            <div className="nav-item-line1">Manage</div>
            <div className="nav-item-line2">Customers</div>
          </div>

          <div 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <div className="nav-item-line1">Returns</div>
            <div className="nav-item-line2">& Orders</div>
          </div>
        </div>
      </div>

      {/* Sub Nav Bar */}
      <div className="navbar-sub">
        <div className={`sub-nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Products Catalog</div>
        <div className={`sub-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Analytics Dashboard</div>
      </div>
    </header>
  );
}
