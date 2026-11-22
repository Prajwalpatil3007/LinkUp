import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { organizationAPI } from '../services/api';
import { APPROVED_CATEGORIES } from '../utils/constants';
import CategoryBadge from '../components/CategoryBadge';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Building2, 
  Search, 
  MapPin, 
  CheckCircle2, 
  PlusCircle, 
  ExternalLink, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';

export default function OrganizationsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [organizations, setOrganizations] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [loading, setLoading] = useState(true);

  // Register Organization Modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: APPROVED_CATEGORIES[0],
    type: 'NGO',
    website: '',
    location: '',
    contactEmail: user?.email || '',
    contactPhone: '',
    logo: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedType !== 'All') params.type = selectedType;

      const res = await organizationAPI.getAll(params);
      if (res.data.success) {
        setOrganizations(res.data.organizations);
      }
    } catch (err) {
      console.error('Error fetching organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [selectedCategory, selectedType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrganizations();
  };

  const handleRegisterOrg = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please log in to register an organization.', 'info');
      return;
    }

    setSubmitting(true);
    try {
      const res = await organizationAPI.create(formData);
      if (res.data.success) {
        addToast('Organization profile registered and submitted for verification!', 'success');
        setShowRegisterModal(false);
        fetchOrganizations();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-content" style={{ paddingTop: 32 }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 28 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-teal)', fontSize: '13px', fontWeight: 600, marginBottom: 4 }}>
              <Building2 size={16} /> COMMUNITY ECOSYSTEM
            </div>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--color-navy)', margin: 0 }}>
              Verified Organisations
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', marginTop: 4 }}>
              Connect with accredited NGOs, university research labs, startups, and community groups driving social impact.
            </p>
          </div>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="btn btn-primary"
          >
            <PlusCircle size={16} /> Register Organisation
          </button>
        </div>

        {/* Filter Card */}
        <div className="card" style={{ padding: '20px', marginBottom: 28 }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} color="var(--color-text-light)" style={{ position: 'absolute', left: 14, top: 12 }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 42 }}
                placeholder="Search organizations by name, mission, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-navy">
              Search
            </button>
          </form>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-navy)' }}>Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '12.5px' }}
              >
                <option value="All">All Entity Types</option>
                <option value="NGO">NGO / Non-profit</option>
                <option value="Educational Institution">Educational Institution</option>
                <option value="Startup / Business">Startup / Business</option>
                <option value="Community Group">Community Group</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-navy)' }}>Field:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '12.5px' }}
              >
                <option value="All">All Categories</option>
                {APPROVED_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Organizations Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
            <p>Loading organizations directory...</p>
          </div>
        ) : organizations.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
            <Building2 size={40} color="var(--color-teal)" style={{ margin: '0 auto 12px' }} />
            <h3>No organisations found</h3>
            <p style={{ color: 'var(--color-text-secondary)', margin: '8px 0 18px' }}>
              Register your NGO or institution to connect with eager student volunteers!
            </p>
            <button onClick={() => setShowRegisterModal(true)} className="btn btn-primary">
              Register Organisation
            </button>
          </div>
        ) : (
          <div className="grid-3">
            {organizations.map(org => (
              <div
                key={org._id}
                className="card card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <img
                      src={org.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(org.name)}&background=142B3B&color=ffffff`}
                      alt={org.name}
                      style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                    />
                    <div>
                      <Link to={`/organizations/${org._id}`} style={{ textDecoration: 'none' }}>
                        <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy)', lineHeight: 1.3 }}>
                          {org.name}
                        </h3>
                      </Link>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {org.type}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <CategoryBadge category={org.category} size="sm" />
                    {org.verificationStatus === 'Verified' ? (
                      <span className="badge badge-teal" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    ) : (
                      <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                        {org.verificationStatus}
                      </span>
                    )}
                  </div>

                  <p style={{
                    fontSize: '13px',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.5,
                    marginBottom: 16,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {org.description}
                  </p>
                </div>

                <div style={{
                  paddingTop: 14,
                  borderTop: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: 'var(--color-text-muted)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={13} color="var(--color-teal)" />
                    <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {org.location}
                    </span>
                  </div>

                  <Link to={`/organizations/${org._id}`} className="btn btn-outline btn-sm">
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Register Organization Modal */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Register an Organisation"
      >
        <form onSubmit={handleRegisterOrg}>
          <div className="form-group">
            <label className="form-label">Organisation Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. CivicReach Foundation"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid-2" style={{ gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Entity Classification *</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="NGO">NGO / Non-profit</option>
                <option value="Educational Institution">Educational Institution</option>
                <option value="Startup / Business">Startup / Business</option>
                <option value="Community Group">Community Group</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Primary Field *</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {APPROVED_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mission & Description *</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Describe your organisation's civic or academic purpose..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid-2" style={{ gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Official Location (City, State) *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Chicago, IL"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Website</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://..."
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2" style={{ gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Contact Email *</label>
              <input
                type="email"
                className="form-input"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                className="form-input"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowRegisterModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Registering...' : 'Submit Profile for Verification'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
