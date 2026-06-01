import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import ProductManager from './components/ProductManager';
import CustomerManager from './components/CustomerManager';
import OrderManager from './components/OrderManager';
import Toast from './components/Toast';

// Configure dynamic API endpoint supporting both dev (localhost) and Vercel env configs
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function App() {
  const [activeTab, setActiveTab] = useState('products'); // Default to products for e-commerce feel
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');

  // Application Data States
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);

  // Helper to add toast alert
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- FETCH SERVICES ---

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchCustomers(),
        fetchOrders(),
        fetchStats()
      ]);
    } catch (err) {
      console.error("Error loading startup data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Redirect to products tab immediately when user starts typing a product search query
  useEffect(() => {
    if (globalSearch.trim() !== '') {
      setActiveTab('products');
    }
  }, [globalSearch]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      showToast("Could not connect to products database", "error");
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/customers`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      showToast("Could not connect to customer database", "error");
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      showToast("Could not connect to orders database", "error");
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/dashboard`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      showToast("Could not fetch dashboard analytics", "error");
    }
  };

  // --- PRODUCT API CRUD TRIGGERS ---

  const handleCreateProduct = async (productData) => {
    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Product "${productData.name}" created successfully!`);
        fetchProducts();
        fetchStats();
      } else {
        showToast(data.detail || "Failed to create product", "error");
      }
    } catch (err) {
      showToast("Network error creating product", "error");
    }
  };

  const handleUpdateProduct = async (id, productData) => {
    try {
      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Product details updated successfully!");
        fetchProducts();
        fetchStats();
      } else {
        showToast(data.detail || "Failed to update product", "error");
      }
    } catch (err) {
      showToast("Network error updating product", "error");
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Product deleted successfully.");
        fetchProducts();
        fetchStats();
      } else {
        showToast(data.detail || "Failed to delete product", "error");
      }
    } catch (err) {
      showToast("Network error deleting product", "error");
    }
  };

  const handleRestockProduct = async (id, amount) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const newQty = product.quantity_in_stock + amount;
    handleUpdateProduct(id, { quantity_in_stock: newQty });
  };

  // --- CUSTOMER API CRUD TRIGGERS ---

  const handleCreateCustomer = async (customerData) => {
    try {
      const res = await fetch(`${API_BASE}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Customer "${customerData.full_name}" registered!`);
        fetchCustomers();
        fetchStats();
      } else {
        showToast(data.detail || "Failed to register customer", "error");
      }
    } catch (err) {
      showToast("Network error registering customer", "error");
    }
  };

  const handleDeleteCustomer = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/customers/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Customer profile deleted.");
        fetchCustomers();
        fetchOrders(); /* Since delete customer cascades and removes their orders */
        fetchStats();
      } else {
        showToast(data.detail || "Failed to delete customer", "error");
      }
    } catch (err) {
      showToast("Network error deleting customer", "error");
    }
  };

  // --- ORDER API CRUD TRIGGERS ---

  const handleCreateOrder = async (orderData) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Sales Order #STRX-${data.id.toString().padStart(5, '0')} checkout successful!`);
        fetchOrders();
        fetchProducts(); /* To fetch reduced stock counts */
        fetchStats();
      } else {
        showToast(data.detail || "Failed to finalize checkout order", "error");
      }
    } catch (err) {
      showToast("Network error processing order", "error");
    }
  };

  const handleDeleteOrder = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Sales Order cancelled. Stock levels restored.");
        fetchOrders();
        fetchProducts();
        fetchStats();
      } else {
        showToast(data.detail || "Failed to cancel order", "error");
      }
    } catch (err) {
      showToast("Network error cancelling order", "error");
    }
  };

  return (
    <div className="app-container">
      {/* Top Navbar Header */}
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        globalSearch={globalSearch}
        setGlobalSearch={setGlobalSearch}
      />

      {/* Main Panel Viewport */}
      <main className="main-content">
        {loading && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '3px',
            background: 'var(--accent-primary)',
            zIndex: 9999,
            animation: 'fadeIn 0.5s infinite alternate'
          }} />
        )}

        {/* Dynamic Route Switching */}
        {activeTab === 'dashboard' && (
          <Dashboard
            stats={stats}
            onRestock={handleRestockProduct}
            loading={loading}
            refreshStats={loadAllData}
          />
        )}

        {activeTab === 'products' && (
          <ProductManager
            products={products}
            onCreate={handleCreateProduct}
            onUpdate={handleUpdateProduct}
            onDelete={handleDeleteProduct}
            searchTerm={globalSearch}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerManager
            customers={customers}
            onCreate={handleCreateCustomer}
            onDelete={handleDeleteCustomer}
            searchTerm={globalSearch}
          />
        )}

        {activeTab === 'orders' && (
          <OrderManager
            orders={orders}
            customers={customers}
            products={products}
            onCreate={handleCreateOrder}
            onDelete={handleDeleteOrder}
            searchTerm={globalSearch}
          />
        )}
      </main>

      {/* Toast Alert Portal */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
