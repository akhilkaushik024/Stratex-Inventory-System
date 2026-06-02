import React, { useState } from 'react';
import { Plus, Trash2, Search, X, Users, Mail, Phone } from 'lucide-react';

export default function CustomerManager({ customers, onCreate, onDelete, searchTerm, showToast }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const openCreateModal = () => {
    setFullName('');
    setEmail('');
    setPhoneNumber('');
    setIsModalOpen(true);
  };

  // Only allow digits in the phone field, max 10
  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '');
    if (digits.length <= 10) {
      setPhoneNumber(digits);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phoneNumber.trim()) return;

    // Phone must be exactly 10 digits
    if (phoneNumber.length !== 10) {
      showToast('Phone number must be exactly 10 digits.', 'error');
      return;
    }

    // Email must end with .com
    const emailLower = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
    if (!emailRegex.test(emailLower)) {
      showToast('Only .com email addresses are accepted.', 'error');
      return;
    }

    // Check for duplicate customer by email
    const emailExists = customers.some(
      (c) => c.email.toLowerCase() === emailLower
    );
    if (emailExists) {
      showToast(`A customer with email "${emailLower}" is already registered.`, 'error');
      return;
    }

    const customerData = {
      full_name: fullName.trim(),
      email: emailLower,
      phone_number: phoneNumber.trim()
    };

    onCreate(customerData);
    setIsModalOpen(false);
  };

  const filteredCustomers = customers;

  return (
    <div>
      <div className="top-header">
        <div className="header-title">
          <h1>Customer Directory</h1>
          {searchTerm ? (
            <p className="search-status">
              Showing {filteredCustomers.length} of {customers.length} customers matching <span className="highlight-term">&ldquo;{searchTerm}&rdquo;</span>
            </p>
          ) : (
            <p>Register and manage customer profiles and account records.</p>
          )}
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} />
          Add Customer
        </button>
      </div>



      {/* Customers Table Card */}
      <div className="card">
        {filteredCustomers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-secondary)' }}>
            <Users size={52} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>No Customers Registered</p>
            <p style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '0.25rem' }}>
              {searchTerm ? "Try modifying your search filter." : "Create customer files to allow them to place orders."}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'rgba(99, 102, 241, 0.1)',
                          color: 'var(--accent-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}>
                          {customer.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        {customer.full_name}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                        {customer.email}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                        {customer.phone_number}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-icon delete"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${customer.full_name}"? This will also cancel all related orders.`)) {
                            onDelete(customer.id);
                          }
                        }}
                        title="Delete Customer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Customer Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-close" onClick={() => setIsModalOpen(false)}>
              <X size={20} />
            </div>

            <h2 style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Users size={22} color="var(--accent-primary)" />
              Register New Customer
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="input-field"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john.doe@example.com"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <small style={{ color: 'var(--text-muted)' }}>Must be a unique .com email address.</small>
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label>Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  className="input-field"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  maxLength={10}
                  inputMode="numeric"
                  pattern="\d{10}"
                  title="Enter exactly 10 digits"
                />
                <small style={{ color: phoneNumber.length > 0 && phoneNumber.length < 10 ? 'var(--accent-danger)' : 'var(--text-muted)' }}>
                  {phoneNumber.length}/10 digits {phoneNumber.length === 10 ? '✓' : '(exactly 10 required)'}
                </small>
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
                  Register Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
