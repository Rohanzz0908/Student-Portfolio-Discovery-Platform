import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const ALL_SKILLS = [
  'React', 'Node.js', 'Python', 'JavaScript', 'MongoDB', 'Express.js',
  'Java', 'C++', 'Machine Learning', 'TypeScript', 'SQL', 'AWS',
  'Docker', 'Flutter', 'Django', 'Vue.js', 'Angular', 'Git',
];

const Discover = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 9;

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (search) params.append('search', search);
      if (selectedSkills.length) params.append('skills', selectedSkills.join(','));
      const { data } = await api.get(`/profiles/discover?${params}`);
      setProfiles(data.profiles);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedSkills, page]);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="page-wrapper">
      <div className="container" style={{ position: 'relative' }}>

        {/* Blur overlay for non-logged-in users */}
        {!user && (
          <div className="discover-lock-overlay">
            <div className="lock-card glass-card">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
              <h2 style={{ marginBottom: '.5rem' }}>Login to Discover Talent</h2>
              <p style={{ color: 'var(--text2)', marginBottom: '1.5rem' }}>
                Sign in to browse student portfolios, filter by skills, and connect with top talent.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link to="/login"><button className="btn btn-primary">Login</button></Link>
                <Link to="/register"><button className="btn btn-secondary">Sign Up</button></Link>
              </div>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="discover-header">
          <h1 className="section-title">🔍 Discover Talent</h1>
          <p className="section-sub">Browse published student portfolios and find the perfect match.</p>
        </div>

        {/* Search + Filters */}
        <div className="discover-filters glass-card">
          <div className="search-row">
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="form-input search-input"
                placeholder="Search by name, bio, or skills..."
                value={search}
                onChange={handleSearchChange}
              />
            </div>
            {(search || selectedSkills.length > 0) && (
              <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setSelectedSkills([]); setPage(1); }}>
                Clear Filters
              </button>
            )}
          </div>
          <div className="skill-filters">
            <span className="filter-label">Filter by skill:</span>
            {ALL_SKILLS.map((s) => (
              <button
                key={s}
                className={`skill-filter-btn ${selectedSkills.includes(s) ? 'active' : ''}`}
                onClick={() => toggleSkill(s)}
              >
                {s}
              </button>
            ))}
          </div>
          {(search || selectedSkills.length > 0) && (
            <p className="results-count">
              Found <strong>{total}</strong> student{total !== 1 ? 's' : ''}
              {search && ` matching "${search}"`}
              {selectedSkills.length > 0 && ` with skills: ${selectedSkills.join(', ')}`}
            </p>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="loader-wrapper"><div className="spinner" /></div>
        ) : profiles.length === 0 ? (
          <div className="empty-state glass-card">
            <div className="empty-icon">🔭</div>
            <h3>No portfolios found</h3>
            <p>Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid-3">
            {profiles.map((profile) => (
              <Link key={profile._id} to={`/portfolio/${profile.userId?._id}`} className="profile-card glass-card">
                <div className="profile-card-top">
                  <div className="profile-avatar">
                    {(profile.name || profile.userId?.username || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="profile-info">
                    <h3 className="profile-name">{profile.name || profile.userId?.username}</h3>
                    <p className="profile-username">@{profile.userId?.username}</p>
                    {profile.location && <p className="profile-location">📍 {profile.location}</p>}
                  </div>
                </div>
                {profile.bio && (
                  <p className="profile-bio">{profile.bio}</p>
                )}
                <div className="profile-skills">
                  {profile.skills?.slice(0, 5).map((s) => (
                    <span key={s} className="badge badge-purple">{s}</span>
                  ))}
                  {profile.skills?.length > 5 && (
                    <span className="badge badge-cyan">+{profile.skills.length - 5}</span>
                  )}
                </div>
                  <div className="profile-footer" onClick={(e) => e.stopPropagation()}>
                    <div className="profile-links">
                      {profile.githubLink && <span>🔗 GitHub</span>}
                      {profile.portfolioLink && <span>🌐 Portfolio</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {user && user.role === 'recruiter' && (
                        <Link to={`/messages?with=${profile.userId?._id}`} title="Message Student" style={{ color: 'var(--accent-purple)', fontSize: '1.2rem' }}>💬</Link>
                      )}
                      <span className="view-btn">View →</span>
                    </div>
                  </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span className="page-info">Page {page} of {totalPages}</span>
            <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
