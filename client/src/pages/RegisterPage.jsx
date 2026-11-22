import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { USER_ROLES, APPROVED_CATEGORIES } from '../utils/constants';
import { UserPlus, User, Mail, Lock, MapPin, Tag, CheckSquare, Square } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    primaryRole: 'Student',
    skills: '',
    bio: ''
  });

  const [selectedInterests, setSelectedInterests] = useState(['Academics and Research', 'Technology and Digital Awareness']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleInterest = (category) => {
    if (selectedInterests.includes(category)) {
      setSelectedInterests(selectedInterests.filter(c => c !== category));
    } else {
      setSelectedInterests([...selectedInterests, category]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        roles: [formData.primaryRole],
        location: formData.location,
        bio: formData.bio,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        interests: selectedInterests
      });

      addToast('Registration complete! Welcome to the LinkUp community.', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      backgroundColor: 'var(--color-bg)'
    }}>
      <div className="card" style={{ maxWidth: 640, width: '100%', padding: '36px 32px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-teal)',
            color: '#FFFFFF',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12
          }}>
            <UserPlus size={22} />
          </div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--color-navy)' }}>Join the LinkUp Community</h2>
          <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginTop: 4 }}>
            Connect with students, residents, researchers, and organizations in one unified platform.
          </p>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13.5px',
            marginBottom: 20,
            border: '1px solid #FCA5A5'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--color-text-light)" style={{ position: 'absolute', left: 14, top: 13 }} />
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  style={{ paddingLeft: 40 }}
                  placeholder="e.g. Alex Rivera"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--color-text-light)" style={{ position: 'absolute', left: 14, top: 13 }} />
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  style={{ paddingLeft: 40 }}
                  placeholder="alex@domain.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--color-text-light)" style={{ position: 'absolute', left: 14, top: 13 }} />
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  style={{ paddingLeft: 40 }}
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--color-text-light)" style={{ position: 'absolute', left: 14, top: 13 }} />
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-input"
                  style={{ paddingLeft: 40 }}
                  placeholder="Confirm matching password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Primary Community Role *</label>
              <select
                name="primaryRole"
                className="form-select"
                value={formData.primaryRole}
                onChange={handleChange}
              >
                {USER_ROLES.filter(r => r !== 'Administrator').map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <div className="form-hint">You can participate flexibly across multiple capacities.</div>
            </div>

            <div className="form-group">
              <label className="form-label">General Location</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} color="var(--color-text-light)" style={{ position: 'absolute', left: 14, top: 13 }} />
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  style={{ paddingLeft: 40 }}
                  placeholder="City, State / Region (No private addresses)"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Your Skills & Capabilities</label>
            <input
              type="text"
              name="skills"
              className="form-input"
              placeholder="e.g. Python, React, Public Speaking, Teaching, First Aid (comma separated)"
              value={formData.skills}
              onChange={handleChange}
            />
            <div className="form-hint">These help match you with relevant opportunities and collaborators.</div>
          </div>

          <div className="form-group">
            <label className="form-label">Select Your Interest Fields (Approved Categories)</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 8,
              marginTop: 6
            }}>
              {APPROVED_CATEGORIES.map(category => {
                const isChecked = selectedInterests.includes(category);
                return (
                  <div
                    key={category}
                    onClick={() => toggleInterest(category)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${isChecked ? 'var(--color-teal)' : 'var(--color-border)'}`,
                      backgroundColor: isChecked ? 'var(--color-teal-light)' : '#FFFFFF',
                      cursor: 'pointer',
                      fontSize: '12.5px',
                      color: isChecked ? 'var(--color-teal)' : 'var(--color-navy)',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {isChecked ? <CheckSquare size={16} /> : <Square size={16} color="var(--color-text-light)" />}
                    <span style={{ fontWeight: isChecked ? 600 : 400 }}>{category}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Short Biography / Introduction</label>
            <textarea
              name="bio"
              className="form-textarea"
              rows={3}
              placeholder="Share what you hope to achieve, learn, or contribute on LinkUp..."
              value={formData.bio}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={submitting}
            style={{ width: '100%', marginTop: 12 }}
          >
            {submitting ? 'Creating LinkUp Account...' : 'Create Account & Proceed'}
          </button>
        </form>

        {/* Existing login link */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '13.5px', color: 'var(--color-text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600, color: 'var(--color-teal)' }}>
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
