import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const StudentPortfolio = () => {
  const { user } = useAuth();
  const { userId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/profiles/${userId}`);
        setData(res.data);
      } catch (err) {
        setError('Portfolio not found or not published.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId]);

  if (loading) return <div className="loader-wrapper"><div className="spinner" /></div>;
  if (error) return (
    <div className="page-wrapper">
      <div className="container">
        <div className="empty-state glass-card">
          <div className="empty-icon">🔒</div>
          <h3>{error}</h3>
          <Link to="/discover"><button className="btn btn-primary" style={{ marginTop: '1rem' }}>← Back to Discover</button></Link>
        </div>
      </div>
    </div>
  );

  const { profile, projects, certifications } = data;

  return (
    <div className="page-wrapper">
      <div className="container portfolio-view">

        {/* Hero Banner */}
        <div className="portfolio-hero glass-card">
          <div className="portfolio-avatar">
            {(profile.name || profile.userId?.username || '?').charAt(0).toUpperCase()}
          </div>
          <div className="portfolio-identity">
            <h1 className="portfolio-name">{profile.name || profile.userId?.username}</h1>
            <p className="portfolio-username">@{profile.userId?.username}</p>
            {profile.location && <p className="portfolio-location">📍 {profile.location}</p>}
            {profile.bio && <p className="portfolio-bio">{profile.bio}</p>}
            <div className="portfolio-social">
              {profile.githubLink && <a href={profile.githubLink} target="_blank" rel="noreferrer" className="social-btn btn btn-secondary btn-sm">🔗 GitHub</a>}
              {profile.linkedinLink && <a href={profile.linkedinLink} target="_blank" rel="noreferrer" className="social-btn btn btn-secondary btn-sm">💼 LinkedIn</a>}
              {profile.portfolioLink && <a href={profile.portfolioLink} target="_blank" rel="noreferrer" className="social-btn btn btn-secondary btn-sm">🌐 Portfolio</a>}
              <Link to={`/resume/${profile.userId?._id}`} className="btn btn-primary btn-sm">📄 Generate Resume</Link>
              {user && user.role === 'recruiter' && (
                <Link to={`/messages?with=${profile.userId?._id}`} className="btn btn-secondary btn-sm">💬 Send Message</Link>
              )}
            </div>
          </div>
        </div>

        <div className="portfolio-body">
          {/* Left Sidebar */}
          <aside className="portfolio-sidebar">
            {/* Skills */}
            {profile.skills?.length > 0 && (
              <div className="sidebar-card glass-card">
                <h3 className="sidebar-title">🛠 Skills</h3>
                <div className="skills-list">
                  {profile.skills.map((s) => (
                    <span key={s} className="badge badge-purple">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {profile.education?.filter(e => e.institution).length > 0 && (
              <div className="sidebar-card glass-card">
                <h3 className="sidebar-title">🎓 Education</h3>
                {profile.education.filter(e => e.institution).map((edu, i) => (
                  <div key={i} className="edu-item">
                    <div className="edu-degree">{edu.degree} {edu.fieldOfStudy ? `– ${edu.fieldOfStudy}` : ''}</div>
                    <div className="edu-institution">{edu.institution}</div>
                    {(edu.from || edu.to) && <div className="edu-years">{edu.from} – {edu.to}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Experience */}
            {profile.experience?.filter(e => e.title).length > 0 && (
              <div className="sidebar-card glass-card">
                <h3 className="sidebar-title">💼 Experience</h3>
                {profile.experience.filter(e => e.title).map((exp, i) => (
                  <div key={i} className="edu-item">
                    <div className="edu-degree">{exp.title}</div>
                    <div className="edu-institution">{exp.company}</div>
                    {(exp.from || exp.to) && <div className="edu-years">{exp.from} – {exp.to}</div>}
                    {exp.description && <div className="edu-desc">{exp.description}</div>}
                  </div>
                ))}
              </div>
            )}
          </aside>

          {/* Main Content */}
          <main className="portfolio-main">
            {/* Projects */}
            <section>
              <h2 className="section-title">Projects</h2>
              {projects.length === 0 ? (
                <p className="no-items">No projects listed yet.</p>
              ) : (
                <div className="projects-grid">
                  {projects.map((proj) => (
                    <div key={proj._id} className="pub-project-card glass-card">
                      <h3 className="pub-proj-title">{proj.projectTitle}</h3>
                      {proj.repoOwner && <p className="repo-owner" style={{ fontSize: '0.8rem', color: 'var(--accent)', marginTop: '-0.3rem', marginBottom: '0.8rem' }}>@{proj.repoOwner}</p>}
                      <p className="pub-proj-desc">{proj.description}</p>
                      {proj.images?.length > 0 && (
                        <div className="pub-proj-images">
                          {proj.images.map((img, idx) => (
                            <img key={idx} src={img} alt="Project work" className="pub-proj-img" />
                          ))}
                        </div>
                      )}
                      <div className="tech-tags">
                        {proj.technologies?.map((t) => (
                          <span key={t} className="badge badge-cyan">{t}</span>
                        ))}
                      </div>
                      <div className="pub-proj-links">
                        {proj.githubLink && <a href={proj.githubLink} target="_blank" rel="noreferrer" className="project-link">🔗 GitHub</a>}
                        {proj.liveLink && <a href={proj.liveLink} target="_blank" rel="noreferrer" className="project-link">🌐 Live Demo</a>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Certifications */}
            {certifications.length > 0 && (
              <section style={{ marginTop: '2.5rem' }}>
                <h2 className="section-title">📜 Certifications</h2>
                <div className="certs-grid">
                  {certifications.map((cert) => (
                    <div key={cert._id} className="pub-cert-card glass-card">
                      <div className="cert-medal">🏆</div>
                      <div>
                        <div className="cert-name">{cert.certificateName}</div>
                        <div className="cert-issuer">by {cert.issuedBy}</div>
                        {cert.issueDate && <div className="cert-date">📅 {cert.issueDate}</div>}
                        {cert.credentialUrl && (
                          <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="project-link">🔗 View</a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default StudentPortfolio;
