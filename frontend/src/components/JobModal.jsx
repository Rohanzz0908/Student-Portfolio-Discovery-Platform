import React, { useState } from 'react';
import api from '../api/axios';

const JobModal = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    requirements: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        requirements: form.requirements.split(',').map((r) => r.trim()).filter(Boolean),
      };
      const { data } = await api.post('/jobs', payload);
      onSaved(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box job-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">📢 Post a New Opportunity</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Job Title *</label>
              <input name="title" className="form-input" value={form.title} onChange={handleChange} required placeholder="Enter job title" />
            </div>
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input name="company" className="form-input" value={form.company} onChange={handleChange} required placeholder="Enter company name" />
            </div>
          </div>
          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Location</label>
              <input name="location" className="form-input" value={form.location} onChange={handleChange} placeholder="Enter job location" />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select name="type" className="form-input" value={form.type} onChange={handleChange}>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Salary</label>
              <input name="salary" className="form-input" value={form.salary} onChange={handleChange} placeholder="Enter salary" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea name="description" className="form-textarea" value={form.description} onChange={handleChange} required rows={4} placeholder="Describe the role and responsibilities..." />
          </div>
          <div className="form-group">
            <label className="form-label">Requirements (comma separated)</label>
            <input name="requirements" className="form-input" value={form.requirements} onChange={handleChange} placeholder="Enter required skills (comma separated)" />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Posting...' : '🚀 Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobModal;
