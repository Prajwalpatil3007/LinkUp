import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CategoryBadge from '../components/CategoryBadge';
import Modal from '../components/Modal';
import { 
  ArrowLeft, 
  Users, 
  Clock, 
  Github, 
  CheckCircle, 
  Send, 
  UserPlus, 
  UserCheck, 
  ExternalLink 
} from 'lucide-react';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Join Modal state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [joining, setJoining] = useState(false);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const res = await projectAPI.getById(id);
      if (res.data.success) {
        setProject(res.data.project);
      }
    } catch (err) {
      setError(err.message || 'Project not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const isOwner = user && (project?.owner?._id || project?.owner) === user._id;
  const isMember = user && (project?.members || []).some(m => (m.user?._id || m.user) === user._id);
  const hasPendingRequest = user && (project?.joinRequests || []).some(r => (r.user?._id || r.user) === user._id && r.status === 'Pending');

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please log in to join projects.', 'info');
      navigate('/login');
      return;
    }

    setJoining(true);
    try {
      const res = await projectAPI.requestJoin(id, { message: joinMessage });
      if (res.data.success) {
        addToast('Join request sent to project lead!', 'success');
        setShowJoinModal(false);
        setJoinMessage('');
        fetchProject();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setJoining(false);
    }
  };

  const handleDecision = async (requestId, action) => {
    try {
      const res = await projectAPI.handleJoinRequest(id, requestId, action);
      if (res.data.success) {
        addToast(`Request ${action === 'accept' ? 'accepted' : 'rejected'}.`, 'success');
        fetchProject();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <p>Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Project Not Found</h2>
        <Link to="/projects" className="btn btn-primary" style={{ marginTop: 20 }}>
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ paddingTop: 32 }}>
      <div className="container">
        
        <Link to="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: '13.5px', marginBottom: 20 }}>
          <ArrowLeft size={16} /> Back to all projects
        </Link>

        {/* Project Header */}
        <div className="card" style={{ padding: '32px', marginBottom: 28 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <CategoryBadge category={project.category} size="md" />
                <span className="badge badge-teal">{project.status}</span>
              </div>

              <h1 style={{ fontSize: '1.9rem', color: 'var(--color-navy)', marginBottom: 12 }}>
                {project.title}
              </h1>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 18, fontSize: '13.5px', color: 'var(--color-text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={16} color="var(--color-teal)" /> {project.members?.length || 1} / {project.teamSize} Members
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={16} color="var(--color-teal)" /> Duration: {project.duration}
                </span>
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-teal)' }}
                  >
                    <Github size={16} /> Repository <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>

            {/* Action */}
            <div>
              {isOwner ? (
                <span className="badge badge-teal" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  You are Project Lead
                </span>
              ) : isMember ? (
                <span className="badge badge-success" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  Team Member ✓
                </span>
              ) : hasPendingRequest ? (
                <span className="badge badge-warning" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  Join Request Pending
                </span>
              ) : (
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="btn btn-primary btn-lg"
                >
                  <UserPlus size={16} /> Request to Join Team
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Two-Column */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }} className="project-grid">
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Description */}
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: 14 }}>Project Overview</h3>
              <p style={{ fontSize: '14.5px', color: 'var(--color-text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {project.description}
              </p>
            </div>

            {/* Required Skills */}
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: 14 }}>Required Tech Stack & Skills</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {project.requiredSkills?.map(s => (
                  <span key={s} className="badge badge-teal" style={{ padding: '6px 12px', fontSize: '13px' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Lead's Management Section: Join Requests */}
            {isOwner && (
              <div className="card">
                <h3 style={{ fontSize: '1.25rem', marginBottom: 16 }}>
                  Pending Join Requests ({(project.joinRequests || []).filter(r => r.status === 'Pending').length})
                </h3>

                {(project.joinRequests || []).filter(r => r.status === 'Pending').length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '13.5px' }}>
                    No pending join requests at this time.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {(project.joinRequests || []).filter(r => r.status === 'Pending').map(req => (
                      <div
                        key={req._id}
                        style={{
                          padding: '16px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-bg)',
                          border: '1px solid var(--color-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={req.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user?.name || 'User')}&background=176B87&color=ffffff`}
                            alt={req.user?.name}
                            style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-navy)' }}>
                              {req.user?.name}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                              "{req.message}"
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => handleDecision(req._id, 'accept')}
                            className="btn btn-primary btn-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleDecision(req._id, 'reject')}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--color-danger)' }}
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Team Roster */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: 16 }}>
                Team Members ({project.members?.length || 1})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {project.members?.map((m, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={m.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.user?.name || 'Member')}&background=176B87&color=ffffff`}
                      alt={m.user?.name}
                      style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <Link to={`/people/${m.user?._id || m.user}`} style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-navy)', textDecoration: 'none' }}>
                        {m.user?.name || 'Team Member'}
                      </Link>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {m.role || 'Collaborator'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Join Request Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title={`Request to Join: ${project.title}`}
        maxWidth={480}
      >
        <form onSubmit={handleJoinSubmit}>
          <div className="form-group">
            <label className="form-label">Message to Project Lead *</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Introduce yourself, what role or tasks you would like to handle, and your relevant tech experience..."
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowJoinModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={joining}>
              {joining ? 'Sending...' : 'Send Join Request'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        @media (max-width: 860px) {
          .project-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
