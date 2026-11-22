import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { opportunityAPI, adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CategoryBadge from '../components/CategoryBadge';
import Modal from '../components/Modal';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Clock, 
  Building2, 
  User, 
  CheckCircle, 
  AlertTriangle, 
  ArrowLeft, 
  Send, 
  ShieldAlert, 
  Flag, 
  Mail, 
  ExternalLink 
} from 'lucide-react';

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [opportunity, setOpportunity] = useState(null);
  const [assistanceMeta, setAssistanceMeta] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Application Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [relevantExperience, setRelevantExperience] = useState('');
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Report Modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate Content');
  const [reportDetails, setReportDetails] = useState('');
  const [reporting, setReporting] = useState(false);

  // Active tab for organizer
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'applications'

  const fetchOpportunity = async () => {
    setLoading(true);
    try {
      const res = await opportunityAPI.getById(id);
      if (res.data.success) {
        setOpportunity(res.data.opportunity);
        setAssistanceMeta(res.data.assistanceMeta);
      }
    } catch (err) {
      setError(err.message || 'Opportunity not found.');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await opportunityAPI.getApplications(id);
      if (res.data.success) {
        setApplications(res.data.applications);
        if (user) {
          const already = res.data.applications.some(a => (a.applicant?._id || a.applicant) === user._id);
          setHasApplied(already);
        }
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchOpportunity();
  }, [id]);

  useEffect(() => {
    if (opportunity) {
      const isOrganizer = user && opportunity.organizer?._id === user._id;
      if (isOrganizer || isAdmin) {
        fetchApplications();
      }
    }
  }, [opportunity, user]);

  const isOwner = user && opportunity?.organizer?._id === user._id;

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please log in or create an account to apply.', 'info');
      navigate('/login');
      return;
    }

    if (!applyMessage.trim()) {
      addToast('Please provide an introduction statement for the organizer.', 'error');
      return;
    }

    setApplying(true);
    try {
      const res = await opportunityAPI.apply(id, {
        message: applyMessage,
        relevantExperience
      });
      if (res.data.success) {
        addToast('Application submitted successfully! The organizer will review your profile.', 'success');
        setHasApplied(true);
        setShowApplyModal(false);
        setApplyMessage('');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setApplying(false);
    }
  };

  const handleUpdateApplicationStatus = async (appId, newStatus) => {
    try {
      const res = await opportunityAPI.updateApplicationStatus(appId, { status: newStatus });
      if (res.data.success) {
        addToast(`Application marked as ${newStatus}.`, 'success');
        setApplications(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a));
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please log in to submit reports.', 'info');
      return;
    }
    setReporting(true);
    try {
      const res = await adminAPI.submitReport({
        targetType: 'Opportunity',
        targetId: id,
        targetTitle: opportunity.title,
        reason: reportReason,
        details: reportDetails
      });
      if (res.data.success) {
        addToast('Report submitted for moderation investigation.', 'info');
        setShowReportModal(false);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <p>Loading opportunity details...</p>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Opportunity Not Found</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 8 }}>{error}</p>
        <Link to="/explore" className="btn btn-primary" style={{ marginTop: 20 }}>
          Back to Explore Opportunities
        </Link>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ paddingTop: 32 }}>
      <div className="container">
        
        {/* Back Link */}
        <Link to="/explore" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: '13.5px', marginBottom: 20 }}>
          <ArrowLeft size={16} /> Back to all opportunities
        </Link>

        {/* Opportunity Header Card */}
        <div className="card" style={{ padding: '32px', marginBottom: 28 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <CategoryBadge category={opportunity.category} size="md" />
                {opportunity.isAssistanceRequest ? (
                  <span className="badge badge-warning" style={{ fontSize: '12px', fontWeight: 600 }}>
                    Community Assistance Request ({opportunity.assistanceDetails?.urgency || 'Medium'} Urgency)
                  </span>
                ) : (
                  <span className="badge badge-teal" style={{ fontSize: '12px' }}>
                    {opportunity.type} • {opportunity.mode}
                  </span>
                )}
                <span className={`badge ${opportunity.status === 'Open' ? 'badge-success' : 'badge-neutral'}`}>
                  {opportunity.status}
                </span>
              </div>

              <h1 style={{ fontSize: '1.9rem', color: 'var(--color-navy)', marginBottom: 12 }}>
                {opportunity.title}
              </h1>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, fontSize: '13.5px', color: 'var(--color-text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={16} color="var(--color-teal)" />
                  <span>{opportunity.location || 'Remote / Online'}</span>
                </div>
                {opportunity.startDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={16} color="var(--color-teal)" />
                    <span>Starts {opportunity.startDate}</span>
                  </div>
                )}
                {opportunity.deadline && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={16} color="var(--color-teal)" />
                    <span>Deadline: {opportunity.deadline}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={16} color="var(--color-teal)" />
                  <span>{opportunity.availablePositions} Openings</span>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 180 }}>
              {isOwner ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span className="badge badge-teal" style={{ textAlign: 'center', justifyContent: 'center' }}>
                    You Organised This
                  </span>
                  <button
                    onClick={() => setActiveTab(activeTab === 'details' ? 'applications' : 'details')}
                    className="btn btn-navy btn-sm"
                  >
                    {activeTab === 'details' ? `Review Applications (${applications.length})` : 'View Details'}
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="btn btn-primary btn-lg"
                    disabled={opportunity.status !== 'Open' || hasApplied}
                  >
                    {hasApplied ? 'Applied ✓' : opportunity.isAssistanceRequest ? 'Volunteer to Assist' : 'Apply Now'}
                  </button>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}
                  >
                    <Flag size={14} /> Report Content
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tab switcher for organizer */}
        {isOwner && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <button
              onClick={() => setActiveTab('details')}
              className={`btn btn-sm ${activeTab === 'details' ? 'btn-navy' : 'btn-outline'}`}
            >
              Opportunity Specifications
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`btn btn-sm ${activeTab === 'applications' ? 'btn-navy' : 'btn-outline'}`}
            >
              Applicant Review ({applications.length})
            </button>
          </div>
        )}

        {/* Content Tabs */}
        {activeTab === 'details' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }} className="details-grid">
            
            {/* Left Column: Description & Requirements */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              <div className="card">
                <h3 style={{ fontSize: '1.25rem', marginBottom: 14 }}>About This Opportunity</h3>
                <div style={{ fontSize: '14.5px', color: 'var(--color-text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                  {opportunity.description}
                </div>
              </div>

              {/* Assistance Details Banner if Assistance Request */}
              {opportunity.isAssistanceRequest && (
                <div className="card" style={{ borderLeft: '4px solid #F59E0B', backgroundColor: 'var(--color-warning-bg)' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#92400E', marginBottom: 10 }}>Community Assistance Specifics</h3>
                  <div style={{ fontSize: '13.5px', color: '#78350F', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div><strong>Urgency:</strong> {opportunity.assistanceDetails?.urgency || 'Medium'}</div>
                    <div><strong>Requester Type:</strong> {opportunity.assistanceDetails?.requesterType || 'Community Resident'}</div>
                    {opportunity.assistanceDetails?.beneficiaryGroup && (
                      <div><strong>Beneficiary:</strong> {opportunity.assistanceDetails.beneficiaryGroup}</div>
                    )}
                    {opportunity.assistanceDetails?.preferredTime && (
                      <div><strong>Preferred Time:</strong> {opportunity.assistanceDetails.preferredTime}</div>
                    )}
                    <div style={{ marginTop: 6, fontSize: '12px', fontStyle: 'italic', color: '#B45309' }}>
                      Notice: Exact residential addresses are shielded to protect community privacy. Location coordinates are shared upon application acceptance.
                    </div>
                  </div>
                </div>
              )}

              {/* Eligibility & Skills */}
              <div className="card">
                <h3 style={{ fontSize: '1.25rem', marginBottom: 14 }}>Eligibility & Requirements</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
                  {opportunity.eligibility || 'Open to all interested students and participants.'}
                </p>

                <h4 style={{ fontSize: '1rem', marginBottom: 10, color: 'var(--color-navy)' }}>
                  Skills & Capabilities Desired
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {opportunity.skillsRequired?.map(skill => (
                    <span key={skill} className="badge badge-teal" style={{ padding: '6px 12px', fontSize: '12.5px' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Organizer & Organization Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Organization Card */}
              {opportunity.organization && (
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <img
                      src={opportunity.organization.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(opportunity.organization.name)}&background=142B3B&color=ffffff`}
                      alt={opportunity.organization.name}
                      style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-navy)' }}>
                        {opportunity.organization.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {opportunity.organization.type}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
                    {opportunity.organization.description}
                  </p>

                  {opportunity.organization.verificationStatus === 'Verified' && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      color: 'var(--color-teal)',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: 'var(--color-teal-light)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: 14
                    }}>
                      <CheckCircle size={14} /> Verified Organisation Profile
                    </div>
                  )}

                  <Link to={`/organizations/${opportunity.organization._id}`} className="btn btn-outline btn-sm" style={{ width: '100%' }}>
                    View Organization Profile
                  </Link>
                </div>
              )}

              {/* Organizer Individual */}
              <div className="card">
                <h4 style={{ fontSize: '1rem', marginBottom: 14, color: 'var(--color-navy)' }}>
                  Published By
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <img
                    src={opportunity.organizer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(opportunity.organizer?.name || 'User')}&background=176B87&color=ffffff`}
                    alt={opportunity.organizer?.name}
                    style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--color-navy)' }}>
                      {opportunity.organizer?.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      {opportunity.organizer?.roles?.[0] || 'Community Member'} • {opportunity.organizer?.location || 'Online'}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
                  {opportunity.organizer?.bio || 'Active LinkUp member fostering collaborative learning and community development.'}
                </p>

                <Link to={`/people/${opportunity.organizer?._id || opportunity.organizer?.id || opportunity.organizer}`} className="btn btn-outline btn-sm" style={{ width: '100%' }}>
                  View Public Profile
                </Link>
              </div>

            </div>

          </div>
        ) : (
          /* Organizer Applicant Review Tab */
          <div className="card">
            <h3 style={{ fontSize: '1.3rem', marginBottom: 16 }}>
              Applicant Submissions ({applications.length})
            </h3>

            {applications.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No applications received yet for this opportunity.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {applications.map(app => (
                  <div
                    key={app._id}
                    style={{
                      padding: '18px 20px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={app.applicant?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.applicant?.name || 'Applicant')}&background=176B87&color=ffffff`}
                          alt={app.applicant?.name}
                          style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <Link to={`/people/${app.applicant?._id}`} style={{ textDecoration: 'none', color: 'var(--color-navy)', fontSize: '14.5px', fontWeight: 600 }}>
                            {app.applicant?.name}
                          </Link>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                            {app.applicant?.email} • {app.applicant?.roles?.[0] || 'Student'} • Applied {new Date(app.appliedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`badge ${
                          app.status === 'Approved' ? 'badge-success' :
                          app.status === 'Rejected' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {app.status}
                        </span>

                        {app.status === 'Pending' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => handleUpdateApplicationStatus(app._id, 'Approved')}
                              className="btn btn-primary btn-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateApplicationStatus(app._id, 'Rejected')}
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--color-danger)' }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginTop: 8 }}>
                      <strong>Applicant Statement:</strong> {app.message}
                    </div>

                    {app.applicant?.skills && app.applicant.skills.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                        {app.applicant.skills.map(s => (
                          <span key={s} className="badge badge-neutral" style={{ fontSize: '11px' }}>{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Application Submission Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title={opportunity.isAssistanceRequest ? 'Volunteer for Assistance Request' : `Apply to: ${opportunity.title}`}
      >
        <form onSubmit={handleApply}>
          <div className="form-group">
            <label className="form-label">
              Statement of Interest / Why would you like to participate? *
            </label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Introduce yourself, mention your relevant background or skills, and explain your motivation..."
              value={applyMessage}
              onChange={(e) => setApplyMessage(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Relevant Experience / Previous Work (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Completed similar coursework, tutored before, GitHub links..."
              value={relevantExperience}
              onChange={(e) => setRelevantExperience(e.target.value)}
            />
          </div>

          <div style={{
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            backgroundColor: 'var(--color-bg)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 20
          }}>
            Your public profile skills, education, and contact email will be shared securely with the organizer for review.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowApplyModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={applying}>
              {applying ? 'Submitting Application...' : 'Confirm Application'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Content Reporting Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Report Opportunity"
        maxWidth={460}
      >
        <form onSubmit={handleReport}>
          <div className="form-group">
            <label className="form-label">Reason for Report *</label>
            <select
              className="form-select"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <option value="Prohibited Event (Sports/Fitness/Entertainment/Music/Concert/Ticket)">
                Prohibited Category (Violates approved 8 fields policy)
              </option>
              <option value="Inappropriate or Misleading Information">Inappropriate or Misleading Information</option>
              <option value="Spam or Solicitations">Spam or Solicitations</option>
              <option value="Other Safety Concern">Other Safety Concern</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Additional Details</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Provide context for platform administrators..."
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowReportModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger" disabled={reporting}>
              {reporting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        @media (max-width: 860px) {
          .details-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
