import React from 'react';
import { LayoutDashboard, Package, Users, ShoppingCart } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Package size={22} color="#ffffff" />
        </div>
        <span className="logo-text">Stratex</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <IconComponent size={20} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <p>Stratex v1.0.0</p>
        <p style={{ marginTop: '0.2rem', fontSize: '0.75rem', opacity: 0.6 }}>© 2026 Enterprise</p>
      </div>
    </aside>
  );
}
