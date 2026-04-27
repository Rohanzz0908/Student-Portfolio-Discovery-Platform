import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import JobModal from '../components/JobModal';

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');

  const [isProfilePublished, setIsProfilePublished] = useState(true);

  const fetchJobs = async () => {
    try {
      const { data } = await api.get('/jobs');
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const checkProfile = async () => {
      if (user && user.role === 'student') {
        try {
          const res = await api.get(`/profiles/${user._id}`);
          setIsProfilePublished(res.data.profile.publishedStatus);
        } catch (err) {
          setIsProfilePublished(false);
        }
      }
    };
    checkProfile();
  }, [user]);

  const handleApply = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/apply`);
      setMessage('✅ Application sent successfully!');
      setTimeout(() => setMessage(''), 3000);
      fetchJobs(); // refresh to show "Applied" state
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply');
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Remove this job posting?')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs(jobs.filter(j => j._id !== jobId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (jobId, userId, newStatus) => {
    try {
      await api.put(`/jobs/${jobId}/status`, { userId, status: newStatus });
      fetchJobs(); // refresh list
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="loader-wrapper"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="tab-header" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 className="section-title">💼 Job Board</h1>
            <p className="section-sub">Explore opportunities or hire top student talent.</p>
          </div>
          {user.role === 'recruiter' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              📢 Post a Job
            </button>
          )}
        </div>

        {user.role === 'student' && !isProfilePublished && (
          <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
            ⚠️ <strong>Profile Not Published:</strong> You must publish your profile from the <Link to="/dashboard" style={{ textDecoration: 'underline' }}>Dashboard</Link> before you can apply for jobs.
          </div>
        )}

        {message && <div className="alert alert-success">{message}</div>}

        <div className="jobs-list">
          {jobs.length === 0 ? (
            <div className="empty-state glass-card">
              <div className="empty-icon">🏢</div>
              <h3>No jobs posted yet</h3>
              <p>Check back later or post the first opportunity!</p>
            </div>
          ) : (
            jobs.map((job) => {
              const hasApplied = job.applicants?.some(a => a.user === user._id || a.user?._id === user._id);
              const isOwner = job.postedBy?._id === user._id || job.postedBy === user._id;

              return (
                <div key={job._id} className="job-card glass-card">
                  <div className="job-header-row">
                    <div className="job-main-info">
                      <h3 className="job-title">{job.title}</h3>
                      <div className="job-company">🏢 {job.company}</div>
                      <div className="job-meta">
                        <span>📍 {job.location}</span>
                        <span>⏰ {job.type}</span>
                        <span>💰 {job.salary}</span>
                      </div>
                      <p className="job-desc">{job.description}</p>
                      <div className="tech-tags">
                        {job.requirements?.map((req) => (
                          <span key={req} className="badge badge-purple">{req}</span>
                        ))}
                      </div>
                    </div>
                    <div className="job-actions">
                      {user.role === 'student' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                          {!hasApplied ? (
                            <button 
                              className="btn btn-primary" 
                              onClick={() => handleApply(job._id)}
                              disabled={!isProfilePublished}
                              title={!isProfilePublished ? "You must publish your profile first" : ""}
                              style={!isProfilePublished ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                            >
                              {isProfilePublished ? "Apply Now" : "Publish to Apply"}
                            </button>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: '600' }}>STATUS</span>
                              <span className={`status-badge ${job.applicants.find(a => a.user === user._id || a.user?._id === user._id)?.status.toLowerCase()}`}>
                                {job.applicants.find(a => a.user === user._id || a.user?._id === user._id)?.status}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      {isOwner && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(job._id)}>
                          Remove
                        </button>
                      )}
                      <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem'}}>
                        {job.applicants?.length || 0} applicants
                      </div>
                    </div>
                  </div>

                  {isOwner && job.applicants?.length > 0 && (
                    <div className="job-applicants-section">
                      <h4>👥 Applicants:</h4>
                      <div className="applicants-mini-list">
                        {job.applicants.map((app, i) => (
                          <div key={i} className="applicant-item">
                            <div className="app-info">
                              <span className="app-name">{app.user?.username || 'Applicant'}</span>
                              <span className="app-email">{app.user?.email}</span>
                            </div>
                            <div className="app-links">
                                <select 
                                  className="status-select" 
                                  value={app.status} 
                                  onChange={(e) => handleStatusUpdate(job._id, app.user?._id, e.target.value)}
                                >
                                  <option value="Applied">Applied</option>
                                  <option value="Shortlisted">Shortlisted</option>
                                  <option value="Rejected">Rejected</option>
                                  <option value="Hired">Hired</option>
                                </select>
                                <Link to={`/portfolio/${app.user?._id}`} className="btn btn-secondary btn-xs">View Portfolio</Link>
                                <Link to={`/messages?with=${app.user?._id}`} className="btn btn-primary btn-xs">Message</Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {showModal && (
        <JobModal 
          onClose={() => setShowModal(false)} 
          onSaved={(newJob) => {
            setJobs([newJob, ...jobs]);
            setShowModal(false);
            setMessage('🚀 Job posted successfully!');
            setTimeout(() => setMessage(''), 3000);
          }}
        />
      )}
    </div>
  );
};

export default Jobs;
