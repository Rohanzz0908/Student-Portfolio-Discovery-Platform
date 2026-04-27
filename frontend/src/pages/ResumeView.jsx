import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const ResumeView = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        if (user && user._id === userId) {
          // Owner viewing their own resume (could be unpublished)
          const [profileRes, projRes, certRes] = await Promise.all([
            api.get('/profiles/me'),
            api.get('/projects'),
            api.get('/certifications'),
          ]);
          setData({
            profile: profileRes.data,
            projects: projRes.data,
            certifications: certRes.data
          });
        } else {
          // Public view
          const res = await api.get(`/profiles/${userId}`);
          setData(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Portfolio not found or not published.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId, user]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="loader-wrapper"><div className="spinner" /></div>;
  if (error) return <div className="container"><div className="alert alert-error">{error}</div></div>;

  const { profile, projects, certifications } = data;

  return (
    <div className="resume-page">
      {/* Action Bar - Hidden during print */}
      <div className="resume-actions no-print">
        <div className="container">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
          <button className="btn btn-primary" onClick={handlePrint}>🖨️ Download / Print Resume</button>
        </div>
      </div>

      {/* Resume Document */}
      <div className="resume-document">
        <header className="resume-header">
          <h1 className="res-name">{profile.name || profile.userId?.username}</h1>
          <div className="res-contact">
            {profile.location && <span>📍 {profile.location}</span>}
            {profile.userId?.email && <span>📧 {profile.userId.email}</span>}
            {profile.githubLink && <span>🔗 GitHub</span>}
            {profile.linkedinLink && <span>💼 LinkedIn</span>}
          </div>
          {profile.bio && <p className="res-summary">{profile.bio}</p>}
        </header>

        <div className="resume-body">
          {/* Experience Section */}
          {profile.experience?.length > 0 && (
            <section className="res-section">
              <h2 className="res-section-title">Experience</h2>
              {profile.experience.map((exp, i) => (
                <div key={i} className="res-item">
                  <div className="res-item-header">
                    <h3 className="res-item-title">{exp.title}</h3>
                    <span className="res-item-date">{exp.from} – {exp.to}</span>
                  </div>
                  <div className="res-item-sub">{exp.company}</div>
                  <p className="res-item-desc">{exp.description}</p>
                </div>
              ))}
            </section>
          )}

          {/* Education Section */}
          {profile.education?.length > 0 && (
            <section className="res-section">
              <h2 className="res-section-title">Education</h2>
              {profile.education.map((edu, i) => (
                <div key={i} className="res-item">
                  <div className="res-item-header">
                    <h3 className="res-item-title">{edu.degree} in {edu.fieldOfStudy}</h3>
                    <span className="res-item-date">{edu.from} – {edu.to}</span>
                  </div>
                  <div className="res-item-sub">{edu.institution}</div>
                </div>
              ))}
            </section>
          )}

          {/* Projects Section */}
          {projects?.length > 0 && (
            <section className="res-section">
              <h2 className="res-section-title">Key Projects</h2>
              {projects.map((proj, i) => (
                <div key={i} className="res-item">
                  <div className="res-item-header">
                    <h3 className="res-item-title">{proj.projectTitle} {proj.repoOwner && <span style={{ fontSize: '0.8rem', fontWeight: '400', color: '#666' }}> (@{proj.repoOwner})</span>}</h3>
                  </div>
                  <p className="res-item-desc">{proj.description}</p>
                  <div className="res-tech-stack">
                    <strong>Tech Stack:</strong> {proj.technologies?.join(', ')}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Skills Section */}
          {profile.skills?.length > 0 && (
            <section className="res-section">
              <h2 className="res-section-title">Technical Skills</h2>
              <div className="res-skills-grid">
                {profile.skills.map((skill, i) => (
                  <span key={i} className="res-skill-tag">{skill}</span>
                ))}
              </div>
            </section>
          )}

          {/* Certifications Section */}
          {certifications?.length > 0 && (
            <section className="res-section">
              <h2 className="res-section-title">Certifications</h2>
              <ul className="res-cert-list">
                {certifications.map((cert, i) => (
                  <li key={i}>
                    <strong>{cert.certificateName}</strong> — {cert.issuedBy} ({cert.issueDate})
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeView;
