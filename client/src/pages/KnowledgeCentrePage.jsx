import React, { useState, useEffect } from 'react';
import { resourceAPI } from '../services/api';
import { APPROVED_CATEGORIES } from '../utils/constants';
import CategoryBadge from '../components/CategoryBadge';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  BookOpen, 
  Search, 
  ThumbsUp, 
  ExternalLink, 
  PlusCircle, 
  Tag, 
  FileText, 
  Bookmark 
} from 'lucide-react';

export default function KnowledgeCentrePage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [loading, setLoading] = useState(true);

  // Submit Resource Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: APPROVED_CATEGORIES[0],
    url: '',
    type: 'Guide',
    tags: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedType !== 'All') params.type = selectedType;

      const res = await resourceAPI.getAll(params);
      if (res.data.success) {
        setResources(res.data.resources);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedCategory, selectedType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const handleUpvote = async (id) => {
    if (!user) {
      addToast('Please log in to upvote resources.', 'info');
      return;
    }

    try {
      const res = await resourceAPI.upvote(id);
      if (res.data.success) {
        setResources(prev => prev.map(r => {
          if (r._id === id) {
            const upvotes = r.upvotes || [];
            const userIndex = upvotes.findIndex(u => (u._id || u) === user._id);
            let newUpvotes;
            if (userIndex > -1) {
              newUpvotes = upvotes.filter(u => (u._id || u) !== user._id);
            } else {
              newUpvotes = [...upvotes, user._id];
            }
            return { ...r, upvotes: newUpvotes };
          }
          return r;
        }));
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please log in to submit educational resources.', 'info');
      return;
    }

    setSubmitting(true);
    try {
      const res = await resourceAPI.create({
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      });

      if (res.data.success) {
        addToast('Resource published to Knowledge Centre!', 'success');
        setShowSubmitModal(false);
        setFormData({
          title: '',
          description: '',
          category: APPROVED_CATEGORIES[0],
          url: '',
          type: 'Guide',
          tags: ''
        });
        fetchResources();
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
              <BookOpen size={16} /> EDUCATIONAL REPOSITORY
            </div>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--color-navy)', margin: 0 }}>
              Knowledge Centre
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', marginTop: 4 }}>
              Peer-reviewed articles, research roadmaps, cybersecurity manuals, and civic guides across the eight approved fields.
            </p>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="btn btn-primary"
          >
            <PlusCircle size={16} /> Submit Resource
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
                placeholder="Search educational resources, tutorials, or guides..."
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
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-navy)' }}>Format:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '12.5px' }}
              >
                <option value="All">All Formats</option>
                <option value="Article">Article</option>
                <option value="Guide">Guide / Toolkit</option>
                <option value="Video / Tutorial">Video / Tutorial</option>
                <option value="Code / Repository">Code / Repository</option>
                <option value="Whitepaper / Report">Whitepaper / Report</option>
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
                <option value="All">All Approved Fields</option>
                {APPROVED_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
            <p>Loading knowledge resources...</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
            <BookOpen size={40} color="var(--color-teal)" style={{ margin: '0 auto 12px' }} />
            <h3>No resources found</h3>
            <p style={{ color: 'var(--color-text-secondary)', margin: '8px 0 18px' }}>
              Share an article or educational guide with the community!
            </p>
            <button onClick={() => setShowSubmitModal(true)} className="btn btn-primary">
              Submit Resource
            </button>
          </div>
        ) : (
          <div className="grid-3">
            {resources.map(res => {
              const userHasUpvoted = user && (res.upvotes || []).some(u => (u._id || u) === user._id);
              return (
                <div
                  key={res._id}
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
                      <CategoryBadge category={res.category} size="sm" />
                      <span className="badge badge-teal" style={{ fontSize: '11px' }}>
                        {res.type}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', color: 'var(--color-navy)', marginBottom: 8, lineHeight: 1.35 }}>
                      {res.title}
                    </h3>

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
                      {res.description}
                    </p>

                    {/* Tags */}
                    {res.tags && res.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                        {res.tags.slice(0, 3).map(t => (
                          <span key={t} className="badge badge-neutral" style={{ fontSize: '11px' }}>
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{
                    paddingTop: 14,
                    borderTop: '1px solid var(--color-border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <button
                      onClick={() => handleUpvote(res._id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: userHasUpvoted ? 'var(--color-teal)' : 'var(--color-text-muted)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600
                      }}
                    >
                      <ThumbsUp size={15} fill={userHasUpvoted ? 'var(--color-teal)' : 'none'} />
                      <span>{res.upvotes?.length || 0} Helpful</span>
                    </button>

                    {res.url ? (
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-teal btn-sm"
                      >
                        Access Material <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        In-app resource
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Submit Resource Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Contribute Educational Resource"
      >
        <form onSubmit={handleCreateResource}>
          <div className="form-group">
            <label className="form-label">Resource Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Student Guide to System Design Interview Prep"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="grid-2" style={{ gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Focus Field (Approved Categories) *</label>
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
              <label className="form-label">Material Format</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Guide">Guide / Toolkit</option>
                <option value="Article">Article</option>
                <option value="Video / Tutorial">Video / Tutorial</option>
                <option value="Code / Repository">Code / Repository</option>
                <option value="Whitepaper / Report">Whitepaper / Report</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Summary / Abstract *</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Explain what concepts are covered and how it helps students or community volunteers..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">External Resource Link / Article URL</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://..."
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. System Design, Career, Architecture"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowSubmitModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Publishing...' : 'Publish Resource'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
