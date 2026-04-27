import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const skillTags = ['React', 'Node.js', 'Python', 'MongoDB', 'Machine Learning', 'UI/UX', 'Java', 'AWS'];

const stats = [
  { value: '2,400+', label: 'Student Portfolios' },
  { value: '350+', label: 'Recruiters' },
  { value: '8,100+', label: 'Projects Showcased' },
  { value: '1,200+', label: 'Connections Made' },
];

const features = [
  {
    icon: '🎯',
    title: 'Smart Discovery',
    desc: 'Recruiters find talent by filtering skills, technologies, and experience with precision.',
  },
  {
    icon: '🚀',
    title: 'Portfolio Builder',
    desc: 'Students craft stunning portfolios with projects, certifications, and GitHub links.',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    desc: 'JWT authentication keeps your data safe. Publish when you\'re ready.',
  },
  {
    icon: '🌐',
    title: 'Public Profiles',
    desc: 'Share your portfolio link anywhere. Let your work speak for itself.',
  },
  {
    icon: '📜',
    title: 'Certifications',
    desc: 'Showcase your certifications from Coursera, Udemy, Google and more.',
  },
  {
    icon: '📊',
    title: 'Skill Tagging',
    desc: 'Tag your skills for maximum visibility in recruiter searches.',
  },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-badge">
            <span>✨</span> THE NEXT GENERATION OF RECRUITMENT
          </div>
          <h1 className="hero-title">
            Showcase Your Skills.<br />
            <span className="gradient-text">Get Discovered.</span>
          </h1>
          <p className="hero-desc">
            Build a high-performance digital portfolio, showcase your projects in 4K clarity,
            and connect with world-class recruiters all in one immersive ecosystem.
          </p>
          <div className="hero-cta">
            {user ? (
              <Link to="/dashboard">
                <button className="btn btn-primary btn-lg">Go to Dashboard →</button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <button className="btn btn-primary btn-lg">Start Building Free</button>
                </Link>
                <Link to="/discover">
                  <button className="btn btn-secondary btn-lg">Explore Portfolios</button>
                </Link>
              </>
            )}
          </div>
          {/* Skill tags */}
          <div className="hero-tags">
            {skillTags.map((tag) => (
              <span key={tag} className="hero-tag">{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((s) => (
              <div key={s.label} className="stat-card glass-card">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-sub">A complete platform for students and recruiters alike.</p>
          </div>
          <div className="grid-3">
            {features.map((f) => (
              <div key={f.title} className="feature-card glass-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-banner glass-card" style={{ background: '#000', color: '#fff' }}>
            <h2 style={{ color: '#fff' }}>Ready to get discovered?</h2>
            <p style={{ color: '#ccc' }}>Join thousands of students building their careers on PortfolioHub.</p>
            {!user && (
              <Link to="/register">
                <button className="btn btn-primary btn-lg">Create Your Portfolio →</button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
