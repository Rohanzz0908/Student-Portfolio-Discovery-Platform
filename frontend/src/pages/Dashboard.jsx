import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ProjectModal from '../components/ProjectModal.jsx';
import CertModal from '../components/CertModal.jsx';

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingCert, setEditingCert] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState('');
  const [ghUrl, setGhUrl] = useState('');
  const [ghLoading, setGhLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [profileRes, projRes, certRes] = await Promise.all([
        api.get('/profiles/me'),
        api.get('/projects'),
        api.get('/certifications'),
      ]);
      setProfile(profileRes.data);
      setProjects(projRes.data);
      setCerts(certRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const { data } = await api.put('/profiles/publish');
      setProfile((p) => ({ ...p, publishedStatus: data.publishedStatus }));
      setMessage(data.publishedStatus ? '🚀 Portfolio published!' : '📦 Portfolio unpublished.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    await api.delete(`/projects/${id}`);
    setProjects((prev) => prev.filter((p) => p._id !== id));
  };

  const handleDeleteCert = async (id) => {
    if (!window.confirm('Delete this certification?')) return;
    await api.delete(`/certifications/${id}`);
    setCerts((prev) => prev.filter((c) => c._id !== id));
  };

  const handleGithubImport = async (e) => {
    e.preventDefault();
    if (!ghUrl.includes('github.com')) {
      alert('Please enter a valid GitHub repository URL.');
      return;
    }
    setGhLoading(true);
    try {
      // Extract owner/repo from URL
      const parts = ghUrl.replace('https://', '').replace('github.com/', '').split('/');
      const owner = parts[0];
      const repo = parts[1]?.split('?')[0];

      if (!owner || !repo) throw new Error('Invalid URL format');

      const { data } = await api.get(`/projects/github/${owner}/${repo}`);
      
      // Save to database
      const newProj = await api.post('/projects', {
        projectTitle: data.title,
        description: data.description,
        technologies: [data.language].filter(Boolean),
        githubLink: data.url,
        repoOwner: data.owner
      });

      setProjects([newProj.data, ...projects]);
      setGhUrl('');
      setMessage('✅ GitHub Project Imported!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to import project. Make sure the repo is public.');
    } finally {
      setGhLoading(false);
    }
  };

  if (loading) {
    return <div className="loader-wrapper"><div className="spinner" /></div>;
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header glass-card">
          <div className="dash-avatar">
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <div className="dash-info">
            <h1 className="dash-name">{profile?.name || user.username}</h1>
            <p className="dash-bio">{profile?.bio || (user.role === 'recruiter' ? 'Manage your job postings and find top talent.' : 'No bio yet. Edit your profile!')}</p>
            <div className="dash-meta">
              {profile?.location && <span>📍 {profile.location}</span>}
              {user.role === 'student' && (
                <span className={`badge ${profile?.publishedStatus ? 'badge-green' : 'badge-yellow'}`}>
                  {profile?.publishedStatus ? '🟢 Published' : '🟡 Draft'}
                </span>
              )}
            </div>
          </div>
          <div className="dash-actions">
            <Link to="/profile/edit">
              <button className="btn btn-secondary">✏️ Edit Profile</button>
            </Link>
            {user.role === 'student' && (
              <>
                <button
                  className={`btn ${profile?.publishedStatus ? 'btn-danger' : 'btn-success'}`}
                  onClick={handlePublish}
                  disabled={publishing}
                >
                  {profile?.publishedStatus ? '📦 Unpublish' : '🚀 Publish'}
                </button>
                <Link to={`/resume/${user._id}`}>
                  <button className="btn btn-primary">📄 My Resume</button>
                </Link>
              </>
            )}
          </div>
        </div>

        {message && <div className="alert alert-success">{message}</div>}

        {user.role === 'recruiter' ? (
          <div className="recruiter-dashboard glass-card" style={{ marginTop: '2rem', textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
            <h2 className="section-title">Welcome, Recruiter!</h2>
            <p className="section-sub" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
              From here you can manage your identity. To post new jobs or see applicants, head over to the Jobs Board.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/jobs" className="btn btn-primary btn-lg">💼 Go to Job Board</Link>
              <Link to="/messages" className="btn btn-secondary btn-lg">💬 Check Messages</Link>
            </div>
          </div>
        ) : (
          <>
            {/* Skills preview */}
            {profile?.skills?.length > 0 && (
              <div className="skills-preview glass-card">
                <h3>🛠 Skills</h3>
                <div className="skills-list">
                  {profile.skills.map((s) => (
                    <span key={s} className="badge badge-purple">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="dash-tabs">
              <button
                className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
                onClick={() => setActiveTab('projects')}
              >
                Projects ({projects.length})
              </button>
              <button
                className={`tab-btn ${activeTab === 'certs' ? 'active' : ''}`}
                onClick={() => setActiveTab('certs')}
              >
                Certifications ({certs.length})
              </button>
            </div>

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div>
                <div className="tab-header">
                  <h2 className="section-title">Projects</h2>
                  <button className="btn btn-primary btn-sm" onClick={() => { setEditingProject(null); setShowProjectModal(true); }}>
                    + Add Manually
                  </button>
                </div>

                {/* GitHub Import */}
                <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <form onSubmit={handleGithubImport} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <label className="form-label" style={{ marginBottom: '0.2rem', fontSize: '0.75rem' }}>Import from GitHub</label>
                      <input
                        className="form-input"
                        placeholder="https://github.com/username/repo"
                        value={ghUrl}
                        onChange={(e) => setGhUrl(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn btn-secondary" style={{ marginTop: '1.4rem' }} disabled={ghLoading}>
                      {ghLoading ? 'Importing...' : '⚡ Sync Repo'}
                    </button>
                  </form>
                  {ghLoading && <div className="sync-status sync-loading">⏳ Syncing your repository...</div>}
                </div>
                {projects.length === 0 ? (
                  <div className="empty-state glass-card">
                    <div className="empty-icon">📂</div>
                    <h3>No projects yet</h3>
                    <p>Showcase your work by adding your first project!</p>
                    <button className="btn btn-primary" style={{ marginTop: '1rem' }}
                      onClick={() => { setEditingProject(null); setShowProjectModal(true); }}>
                      + Add Your First Project
                    </button>
                  </div>
                ) : (
                  <div className="grid-3">
                    {projects.map((proj) => (
                      <div key={proj._id} className="project-card glass-card">
                        <div className="project-card-header">
                          <div className="project-info">
                            <h3 className="project-title">{proj.projectTitle}</h3>
                            {proj.repoOwner && <p className="repo-owner">@{proj.repoOwner}</p>}
                          </div>
                          <div className="card-actions">
                            <button className="icon-btn" title="Edit"
                              onClick={() => { setEditingProject(proj); setShowProjectModal(true); }}>✏️</button>
                            <button className="icon-btn danger" title="Delete"
                              onClick={() => handleDeleteProject(proj._id)}>🗑</button>
                          </div>
                        </div>
                        {proj.images?.length > 0 && (
                          <div className="project-images-preview">
                            {proj.images.map((img, idx) => (
                              <img key={idx} src={img} alt={`Screenshot ${idx}`} className="proj-thumb" />
                            ))}
                          </div>
                        )}
                        <p className="project-desc">{proj.description}</p>
                        <div className="tech-tags">
                          {proj.technologies?.map((t) => (
                            <span key={t} className="badge badge-cyan">{t}</span>
                          ))}
                        </div>
                        <div className="project-links">
                          {proj.githubLink && (
                            <a href={proj.githubLink} target="_blank" rel="noreferrer" className="project-link">
                              🔗 GitHub
                            </a>
                          )}
                          {proj.liveLink && (
                            <a href={proj.liveLink} target="_blank" rel="noreferrer" className="project-link">
                              🌐 Live Demo
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Certifications Tab */}
            {activeTab === 'certs' && (
              <div>
                <div className="tab-header">
                  <h2 className="section-title">My Certifications</h2>
                  <button className="btn btn-primary" onClick={() => { setEditingCert(null); setShowCertModal(true); }}>
                    + Add Certification
                  </button>
                </div>
                {certs.length === 0 ? (
                  <div className="empty-state glass-card">
                    <div className="empty-icon">📜</div>
                    <h3>No certifications yet</h3>
                    <p>Add your first certification to boost your profile!</p>
                    <button className="btn btn-primary" style={{ marginTop: '1rem' }}
                      onClick={() => { setEditingCert(null); setShowCertModal(true); }}>
                      + Add Certification
                    </button>
                  </div>
                ) : (
                  <div className="grid-2">
                    {certs.map((cert) => (
                      <div key={cert._id} className="cert-card glass-card">
                        <div className="cert-icon">🏆</div>
                        <div className="cert-info">
                          <h3 className="cert-name">{cert.certificateName}</h3>
                          <p className="cert-issuer">Issued by <strong>{cert.issuedBy}</strong></p>
                          {cert.issueDate && <p className="cert-date">📅 {cert.issueDate}</p>}
                          {cert.credentialUrl && (
                            <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="project-link">
                              🔗 View Credential
                            </a>
                          )}
                        </div>
                        <div className="card-actions">
                          <button className="icon-btn" onClick={() => { setEditingCert(cert); setShowCertModal(true); }}>✏️</button>
                          <button className="icon-btn danger" onClick={() => handleDeleteCert(cert._id)}>🗑</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showProjectModal && (
        <ProjectModal
          project={editingProject}
          onClose={() => setShowProjectModal(false)}
          onSaved={(p) => {
            if (editingProject) {
              setProjects((prev) => prev.map((x) => x._id === p._id ? p : x));
            } else {
              setProjects((prev) => [p, ...prev]);
            }
            setShowProjectModal(false);
          }}
        />
      )}
      {showCertModal && (
        <CertModal
          cert={editingCert}
          onClose={() => setShowCertModal(false)}
          onSaved={(c) => {
            if (editingCert) {
              setCerts((prev) => prev.map((x) => x._id === c._id ? c : x));
            } else {
              setCerts((prev) => [c, ...prev]);
            }
            setShowCertModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
