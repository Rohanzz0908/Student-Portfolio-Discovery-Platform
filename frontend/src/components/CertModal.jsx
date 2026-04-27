import React, { useState } from 'react';
import api from '../api/axios';

const CertModal = ({ cert, onClose, onSaved }) => {
  const [form, setForm] = useState({
    certificateName: cert?.certificateName || '',
    issuedBy: cert?.issuedBy || '',
    issueDate: cert?.issueDate || '',
    credentialUrl: cert?.credentialUrl || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let res;
      if (cert) {
        res = await api.put(`/certifications/${cert._id}`, form);
      } else {
        res = await api.post('/certifications', form);
      }
      onSaved(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save certification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{cert ? '✏️ Edit Certification' : '🏆 Add Certification'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Certificate Name *</label>
            <input name="certificateName" className="form-input" value={form.certificateName} onChange={handleChange} placeholder="Enter certificate name" required />
          </div>
          <div className="form-group">
            <label className="form-label">Issued By</label>
            <input name="issuedBy" className="form-input" value={form.issuedBy} onChange={handleChange} placeholder="Enter issuing organization" />
          </div>
          <div className="form-group">
            <label className="form-label">Issue Date</label>
            <input name="issueDate" className="form-input" value={form.issueDate} onChange={handleChange} placeholder="Enter issue date" />
          </div>
          <div className="form-group">
            <label className="form-label">Credential URL</label>
            <input name="credentialUrl" className="form-input" value={form.credentialUrl} onChange={handleChange} placeholder="https://..." />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : cert ? 'Update' : 'Add Certification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CertModal;
