import React, { useState } from 'react';
import api from '../api/axios';

const ProjectModal = ({ project, onClose, onSaved }) => {
  const [form, setForm] = useState({
    projectTitle: project?.projectTitle || '',
    description: project?.description || '',
    technologies: project?.technologies?.join(', ') || '',
    githubLink: project?.githubLink || '',
    repoOwner: project?.repoOwner || '',
    liveLink: project?.liveLink || '',
    images: project?.images?.join(', ') || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const ensureAbsoluteUrl = (url) => {
    if (!url || url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = {
      ...form,
      githubLink: ensureAbsoluteUrl(form.githubLink),
      liveLink: ensureAbsoluteUrl(form.liveLink),
      technologies: form.technologies.split(',').map((t) => t.trim()).filter(Boolean),
      images: form.images.split(',').map((i) => i.trim()).filter(Boolean),
    };
    try {
      let res;
      if (project) {
        res = await api.put(`/projects/${project._id}`, payload);
      } else {
        res = await api.post('/projects', payload);
      }
      onSaved(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{project ? '✏️ Edit Project' : '➕ Add Project'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Title *</label>
            <input name="projectTitle" className="form-input" value={form.projectTitle} onChange={handleChange} placeholder="Enter project title" required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" className="form-textarea" value={form.description} onChange={handleChange} placeholder="What does this project do?" rows={3} />
          </div>
          <div className="form-group">
            <label className="form-label">Technologies (comma separated)</label>
            <input name="technologies" className="form-input" value={form.technologies} onChange={handleChange} placeholder="Enter technologies (comma separated)" />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">GitHub Link</label>
              <input name="githubLink" className="form-input" value={form.githubLink} onChange={handleChange} placeholder="https://github.com/..." />
            </div>
            <div className="form-group">
              <label className="form-label">Repo Owner (e.g. username)</label>
              <input name="repoOwner" className="form-input" value={form.repoOwner} onChange={handleChange} placeholder="GitHub Username" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Live Demo Link</label>
            <input name="liveLink" className="form-input" value={form.liveLink} onChange={handleChange} placeholder="https://..." />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>e.g. rohanz.in (will be saved as https://rohanz.in)</small>
          </div>
          <div className="form-group">
            <label className="form-label">Project Images (comma separated URLs)</label>
            <input name="images" className="form-input" value={form.images} onChange={handleChange} placeholder="Enter image URLs (comma separated)" />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : project ? 'Update Project' : 'Add Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
