import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { communityAPI } from '../services/api';
import { APPROVED_CATEGORIES } from '../utils/constants';
import CategoryBadge from '../components/CategoryBadge';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Users, 
  Search, 
  PlusCircle, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck 
} from 'lucide-react';

export default function CommunitiesPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [communities, setCommunities] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // Create Community Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: APPROVED_CATEGORIES[0],
    rules: ''
  });
  const [creating, setCreating] = useState(false);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const res = await communityAPI.getAll(params);
      if (res.data.success) {
        setCommunities(res.data.communities);
      }
    } catch (err) {
      console.error('Error fetching communities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCommunities();
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please log in to launch a community.', 'info');
      return;
    }

    setCreating(true);
    try {
      const res = await communityAPI.create({
        ...formData,
        rules: formData.rules ? formData.rules.split('\n').filter(Boolean) : undefined
      });

      if (res.data.success) {
        addToast('Community established successfully!', 'success');
        setShowCreateModal(false);
        setFormData({
          name: '',
          description: '',
          category: APPROVED_CATEGORIES[0],
          rules: ''
        });
        fetchCommunities();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="main-content" style={{ paddingTop: 32 }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 28 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-teal)', fontSize: '13px', fontWeight: 600, marginBottom: 4 }}>
              <Users size={16} /> COLLABORATIVE HUBS
            </div>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--color-navy)', margin: 0 }}>
              Discover Communities
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', marginTop: 4 }}>
              Join topic-specific communities across the eight approved fields to share resources, hold discussions, and network.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <PlusCircle size={16} /> Create Community
          </button>
        </div>

        {/* Filter & Search */}
        <div className="card" style={{ padding: '20px', marginBottom: 28 }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} color="var(--color-text-light)" style={{ position: 'absolute', left: 14, top: 12 }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 42 }}
                placeholder="Search communities by name or topic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-navy">
              Search
            </button>
          </form>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-navy)', marginRight: 4 }}>
              Field:
            </span>
            <button
              onClick={() => setSelectedCategory('All')}
              className={`btn btn-sm ${selectedCategory === 'All' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '12px' }}
            >
              All Categories
            </button>
            {APPROVED_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '12px' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Communities Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
            <p>Loading communities...</p>
          </div>
        ) : communities.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
            <Users size={40} color="var(--color-teal)" style={{ margin: '0 auto 14px' }} />
            <h3>No communities found</h3>
            <p style={{ color: 'var(--color-text-secondary)', margin: '8px 0 20px' }}>
              Create the first community in this focus area!
            </p>
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
              Create Community
            </button>
          </div>
        ) : (
          <div className="grid-3">
            {communities.map(comm => (
              <div
                key={comm._id}
                className="card card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <CategoryBadge category={comm.category} size="sm" />
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users size={13} color="var(--color-teal)" /> {comm.membersCount || 1} members
                    </span>
                  </div>

                  <Link to={`/communities/${comm._id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--color-navy)', marginBottom: 8, lineHeight: 1.35 }}>
                      {comm.name}
                    </h3>
                  </Link>

                  <p style={{
                    fontSize: '13.5px',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.5,
                    marginBottom: 16,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {comm.description}
                  </p>
                </div>

                <div style={{
                  paddingTop: 16,
                  borderTop: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    Led by {comm.creator?.name || 'Community Member'}
                  </div>

                  <Link to={`/communities/${comm._id}`} className="btn btn-outline-teal btn-sm">
                    Enter Community <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Create Community Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Establish a Community"
      >
        <form onSubmit={handleCreateCommunity}>
          <div className="form-group">
            <label className="form-label">Community Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. AI & Data Science for Social Good"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Approved Focus Field *</label>
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

          <div className="form-group">
            <label className="form-label">Description & Mission *</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Explain what topics are discussed, goals, and who should join..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Community Guidelines / Rules (One per line)</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Be respectful and constructive&#10;Share verified academic materials&#10;No commercial solicitations"
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Creating...' : 'Launch Community'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
