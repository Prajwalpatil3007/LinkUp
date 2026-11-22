import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../services/api';
import { APPROVED_CATEGORIES } from '../utils/constants';
import CategoryBadge from '../components/CategoryBadge';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  FolderKanban, 
  Search, 
  Users, 
  PlusCircle, 
  Clock, 
  Github, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

export default function ProjectsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // Create Project Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: APPROVED_CATEGORIES[0],
    requiredSkills: '',
    teamSize: 4,
    duration: '3 months',
    githubUrl: ''
  });
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const res = await projectAPI.getAll(params);
      if (res.data.success) {
        setProjects(res.data.projects);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please log in to create collaborative projects.', 'info');
      return;
    }

    setCreating(true);
    try {
      const res = await projectAPI.create({
        ...formData,
        requiredSkills: formData.requiredSkills ? formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean) : []
      });

      if (res.data.success) {
        addToast('Collaborative project created successfully!', 'success');
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          category: APPROVED_CATEGORIES[0],
          requiredSkills: '',
          teamSize: 4,
          duration: '3 months',
          githubUrl: ''
        });
        fetchProjects();
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
              <FolderKanban size={16} /> COLLABORATION ENGINE
            </div>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--color-navy)', margin: 0 }}>
              Projects & Teammate Discovery
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', marginTop: 4 }}>
              Build hackathon solutions, open research tools, and civic technology initiatives with passionate peers.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <PlusCircle size={16} /> Start a Project
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="card" style={{ padding: '20px', marginBottom: 28 }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} color="var(--color-text-light)" style={{ position: 'absolute', left: 14, top: 12 }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 42 }}
                placeholder="Search projects by title, description, or required tech..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-navy">
              Search
            </button>
          </form>

          {/* Categories */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-navy)', marginRight: 4 }}>
              Filter by Field:
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

        {/* Project Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
            <p>Loading collaborative projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
            <FolderKanban size={40} color="var(--color-teal)" style={{ margin: '0 auto 14px' }} />
            <h3>No projects found</h3>
            <p style={{ color: 'var(--color-text-secondary)', margin: '8px 0 20px' }}>
              Be the first to launch a collaborative project in this domain!
            </p>
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid-3">
            {projects.map(proj => (
              <div
                key={proj._id}
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
                    <CategoryBadge category={proj.category} size="sm" />
                    <span className="badge badge-teal" style={{ fontSize: '11px' }}>
                      {proj.status}
                    </span>
                  </div>

                  <Link to={`/projects/${proj._id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--color-navy)', marginBottom: 8, lineHeight: 1.35 }}>
                      {proj.title}
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
                    {proj.description}
                  </p>

                  {/* Skills tags */}
                  {proj.requiredSkills && proj.requiredSkills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                      {proj.requiredSkills.slice(0, 3).map(sk => (
                        <span key={sk} className="badge badge-neutral" style={{ fontSize: '11px' }}>
                          {sk}
                        </span>
                      ))}
                      {proj.requiredSkills.length > 3 && (
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          +{proj.requiredSkills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div style={{
                  paddingTop: 16,
                  borderTop: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: 'var(--color-text-muted)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users size={14} color="var(--color-teal)" /> {proj.members?.length || 1} / {proj.teamSize}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={14} /> {proj.duration}
                    </span>
                  </div>

                  <Link to={`/projects/${proj._id}`} className="btn btn-outline btn-sm">
                    View Project
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Start Project Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Start a Collaborative Project"
      >
        <form onSubmit={handleCreateProject}>
          <div className="form-group">
            <label className="form-label">Project Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Smart Waste Classification Vision Model"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            <label className="form-label">Project Goals & Description *</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Explain the problem your project solves, target users, and what milestones you aim to achieve..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Required Skills (Comma separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Python, PyTorch, React, UI/UX"
              value={formData.requiredSkills}
              onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
            />
          </div>

          <div className="grid-2" style={{ gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Target Team Size</label>
              <input
                type="number"
                min={2}
                max={20}
                className="form-input"
                value={formData.teamSize}
                onChange={(e) => setFormData({ ...formData, teamSize: parseInt(e.target.value) || 4 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Duration</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 3 months / Semester"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">GitHub Repository / Public URL (Optional)</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://github.com/..."
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Launching...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
