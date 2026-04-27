import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const SKILL_SUGGESTIONS = [
  'test', 'Node.js', 'Python', 'JavaScript', 'MongoDB', 'Express.js',
  'Java', 'C++', 'Machine Learning', 'TypeScript', 'SQL', 'AWS',
  'Docker', 'Git', 'Flutter', 'Django', 'Vue.js', 'Angular',
];

const EditProfile = () => {
  const [form, setForm] = useState({
    name: '', bio: '', location: '', portfolioLink: '', githubLink: '', githubUsername: '', linkedinLink: '',
    skills: [],
    education: [{ institution: '', degree: '', fieldOfStudy: '', from: '', to: '' }],
    experience: [{ title: '', company: '', from: '', to: '', description: '' }],
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/profiles/me');
        setForm({
          name: data.name || '',
          bio: data.bio || '',
          location: data.location || '',
          portfolioLink: data.portfolioLink || '',
          githubLink: data.githubLink || '',
          githubUsername: data.githubUsername || '',
          linkedinLink: data.linkedinLink || '',
          skills: data.skills || [],
          education: data.education?.length ? data.education : [{ institution: '', degree: '', fieldOfStudy: '', from: '', to: '' }],
          experience: data.experience?.length ? data.experience : [{ title: '', company: '', from: '', to: '', description: '' }],
        });
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !form.skills.includes(trimmed)) {
      setForm({ ...form, skills: [...form.skills, trimmed] });
    }
    setSkillInput('');
  };
  const removeSkill = (s) => setForm({ ...form, skills: form.skills.filter((x) => x !== s) });

  const handleEduChange = (i, field, val) => {
    const edu = [...form.education];
    edu[i][field] = val;
    setForm({ ...form, education: edu });
  };
  const addEdu = () => setForm({ ...form, education: [...form.education, { institution: '', degree: '', fieldOfStudy: '', from: '', to: '' }] });
  const removeEdu = (i) => setForm({ ...form, education: form.education.filter((_, idx) => idx !== i) });

  const handleExpChange = (i, field, val) => {
    const exp = [...form.experience];
    exp[i][field] = val;
    setForm({ ...form, experience: exp });
  };
  const addExp = () => setForm({ ...form, experience: [...form.experience, { title: '', company: '', from: '', to: '', description: '' }] });
  const removeExp = (i) => setForm({ ...form, experience: form.experience.filter((_, idx) => idx !== i) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.put('/profiles/me', form);
      setSuccess('✅ Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loader-wrapper"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container edit-container">
        <div className="edit-header">
          <h1 className="section-title">✏️ Edit Profile</h1>
          <p className="section-sub">Keep your portfolio up-to-date to attract more opportunities.</p>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="edit-section glass-card">
            <h2 className="edit-section-title">👤 Basic Info</h2>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input name="name" className="form-input" value={form.name} onChange={handleChange} placeholder="Enter your full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input name="location" className="form-input" value={form.location} onChange={handleChange} placeholder="Enter your location" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea name="bio" className="form-textarea" value={form.bio} onChange={handleChange} placeholder="Tell us about yourself..." rows={3} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">GitHub Profile URL</label>
                <input name="githubLink" className="form-input" value={form.githubLink} onChange={handleChange} placeholder="Enter your GitHub profile URL" />
              </div>
              <div className="form-group">
                <label className="form-label">GitHub Username (for syncing)</label>
                <input name="githubUsername" className="form-input" value={form.githubUsername} onChange={handleChange} placeholder="Enter your GitHub username" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">LinkedIn URL</label>
                <input name="linkedinLink" className="form-input" value={form.linkedinLink} onChange={handleChange} placeholder="Enter your LinkedIn URL" />
              </div>
              <div className="form-group">
                <label className="form-label">Portfolio URL</label>
                <input name="portfolioLink" className="form-input" value={form.portfolioLink} onChange={handleChange} placeholder="Enter your portfolio URL" />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="edit-section glass-card">
            <h2 className="edit-section-title">🛠 Skills</h2>
            <div className="skills-input-row">
              <input
                className="form-input"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Type a skill and press Enter..."
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }}
              />
              <button type="button" className="btn btn-primary" onClick={() => addSkill(skillInput)}>+ Add</button>
            </div>
            <div className="suggestions">
              {SKILL_SUGGESTIONS.filter((s) => !form.skills.includes(s)).slice(0, 8).map((s) => (
                <button key={s} type="button" className="suggestion-chip" onClick={() => addSkill(s)}>{s}</button>
              ))}
            </div>
            <div className="skills-list">
              {form.skills.map((s) => (
                <span key={s} className="skill-chip badge badge-purple">
                  {s} <button type="button" onClick={() => removeSkill(s)}>×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="edit-section glass-card">
            <div className="section-flex">
              <h2 className="edit-section-title">🎓 Education</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addEdu}>+ Add</button>
            </div>
            {form.education.map((edu, i) => (
              <div key={i} className="sub-card">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Institution</label>
                    <input className="form-input" value={edu.institution} onChange={(e) => handleEduChange(i, 'institution', e.target.value)} placeholder="Enter university name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Degree</label>
                    <input className="form-input" value={edu.degree} onChange={(e) => handleEduChange(i, 'degree', e.target.value)} placeholder="Enter your degree" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Field of Study</label>
                    <input className="form-input" value={edu.fieldOfStudy} onChange={(e) => handleEduChange(i, 'fieldOfStudy', e.target.value)} placeholder="Enter your field of study" />
                  </div>
                  <div className="form-group year-row">
                    <div>
                      <label className="form-label">From</label>
                      <input className="form-input" value={edu.from} onChange={(e) => handleEduChange(i, 'from', e.target.value)} placeholder="Start year" />
                    </div>
                    <div>
                      <label className="form-label">To</label>
                      <input className="form-input" value={edu.to} onChange={(e) => handleEduChange(i, 'to', e.target.value)} placeholder="End year" />
                    </div>
                  </div>
                </div>
                {form.education.length > 1 && (
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removeEdu(i)}>Remove</button>
                )}
              </div>
            ))}
          </div>

          {/* Experience */}
          <div className="edit-section glass-card">
            <div className="section-flex">
              <h2 className="edit-section-title">💼 Experience</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addExp}>+ Add</button>
            </div>
            {form.experience.map((exp, i) => (
              <div key={i} className="sub-card">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Job Title</label>
                    <input className="form-input" value={exp.title} onChange={(e) => handleExpChange(i, 'title', e.target.value)} placeholder="Enter your job title" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <input className="form-input" value={exp.company} onChange={(e) => handleExpChange(i, 'company', e.target.value)} placeholder="Enter company name" />
                  </div>
                  <div className="form-group year-row">
                    <div>
                      <label className="form-label">From</label>
                      <input className="form-input" value={exp.from} onChange={(e) => handleExpChange(i, 'from', e.target.value)} placeholder="Start date" />
                    </div>
                    <div>
                      <label className="form-label">To</label>
                      <input className="form-input" value={exp.to} onChange={(e) => handleExpChange(i, 'to', e.target.value)} placeholder="End date" />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={exp.description} onChange={(e) => handleExpChange(i, 'description', e.target.value)} placeholder="Describe your role..." rows={2} />
                </div>
                {form.experience.length > 1 && (
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removeExp(i)}>Remove</button>
                )}
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'right' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
