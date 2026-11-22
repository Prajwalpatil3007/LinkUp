import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { organizationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CategoryBadge from '../components/CategoryBadge';
import Modal from '../components/Modal';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  CheckCircle2, 
  ArrowLeft, 
  PlusCircle, 
  ShieldCheck, 
  Calendar 
} from 'lucide-react';

export default function OrganizationDetailPage() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const { addToast } = useToast();

  const [organization, setOrganization] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verification request modal
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationDoc, setVerificationDoc] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchOrgDetails = async () => {
    setLoading(true);
    try {
      const res = await organizationAPI.getById(id);
      if (res.data.success) {
        setOrganization(res.data.organization);
        setOpportunities(res.data.opportunities);
      }
    } catch (err) {
      console.error('Error fetching organization details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgDetails();
  }, [id]);

  const isOwner = user && (organization?.createdBy?._id || organization?.createdBy) === user._id;

  const handleRequestVerification = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await organizationAPI.submitVerification(id, {
        verificationDoc,
        verificationNotes
      });
      if (res.data.success) {
        addToast('Verification documents submitted for admin review.', 'success');
        setShowVerifyModal(false);
        fetchOrgDetails();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <p>Loading organisation details...</p>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Organisation Not Found</h2>
        <Link to="/organizations" className="btn btn-primary" style={{ marginTop: 20 }}>
          Back to Organisations
        </Link>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ paddingTop: 32 }}>
      <div className="container">
        
        <Link to="/organizations" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: '13.5px', marginBottom: 20 }}>
          <ArrowLeft size={16} /> Back to all organisations
        </Link>

        {/* Organization Header */}
        <div className="card" style={{ padding: '36px', marginBottom: 28 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <img
                src={organization.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(organization.name)}&background=142B3B&color=ffffff`}
                alt={organization.name}
                style={{ width: 80, height: 80, borderRadius: 'var(--radius-lg)', objectFit: 'cover', border: '1px solid var(--color-border)' }}
              />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h1 style={{ fontSize: '1.9rem', color: 'var(--color-navy)', margin: 0 }}>
                    {organization.name}
                  </h1>
                  {organization.verificationStatus === 'Verified' ? (
                    <span className="badge badge-teal" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={13} /> Verified Organisation
                    </span>
                  ) : (
                    <span className="badge badge-warning">
                      {organization.verificationStatus}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                  <CategoryBadge category={organization.category} size="sm" />
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{organization.type}</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 18, fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: 10 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MapPin size={14} color="var(--color-teal)" /> {organization.location}
                  </span>
                  {organization.website && (
                    <a href={organization.website} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--color-teal)' }}>
                      <Globe size={14} /> Website
                    </a>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Mail size={14} color="var(--color-teal)" /> {organization.contactEmail}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification trigger for owner */}
            {isOwner && organization.verificationStatus !== 'Verified' && (
              <button
                onClick={() => setShowVerifyModal(true)}
                className="btn btn-outline-teal"
              >
                <ShieldCheck size={16} /> Submit Verification Docs
              </button>
            )}
          </div>
        </div>

        {/* Two-Column Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }} className="org-layout">
          
          {/* Published Opportunities */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--color-navy)' }}>
                Published Opportunities ({opportunities.length})
              </h3>
              {isOwner && (
                <Link to="/opportunities/create" className="btn btn-primary btn-sm">
                  <PlusCircle size={14} /> New Opportunity
                </Link>
              )}
            </div>

            {opportunities.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
                No opportunities published by this organization yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {opportunities.map(op => (
                  <div key={op._id} className="card card-hover" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <CategoryBadge category={op.category} size="sm" />
                      <span className="badge badge-teal" style={{ fontSize: '11px' }}>{op.mode}</span>
                    </div>

                    <Link to={`/opportunities/${op._id}`} style={{ textDecoration: 'none' }}>
                      <h4 style={{ fontSize: '1.15rem', color: 'var(--color-navy)', marginBottom: 6 }}>
                        {op.title}
                      </h4>
                    </Link>

                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
                      {op.description.substring(0, 140)}...
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      <span>Positions: {op.availablePositions}</span>
                      <Link to={`/opportunities/${op._id}`} className="btn btn-outline btn-sm">
                        View Opportunity
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* About / Mission sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="card">
              <h4 style={{ fontSize: '1.1rem', color: 'var(--color-navy)', marginBottom: 12 }}>
                About Our Mission
              </h4>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {organization.description}
              </p>
            </div>

            <div className="card">
              <h4 style={{ fontSize: '1.1rem', color: 'var(--color-navy)', marginBottom: 12 }}>
                Trust & Verification
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {organization.verificationStatus === 'Verified' 
                  ? 'This organization has provided official institutional or government non-profit registration certificates verified by LinkUp administrators.'
                  : 'This profile is currently undergoing verification review by platform administrators.'
                }
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Verification Submission Modal */}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        title="Submit Verification Credentials"
      >
        <form onSubmit={handleRequestVerification}>
          <div className="form-group">
            <label className="form-label">Official Registration ID / Charter Reference *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 501(c)(3) EIN: XX-XXXXXXX or State Charity Registration #"
              value={verificationDoc}
              onChange={(e) => setVerificationDoc(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes for Administrator Review</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Provide institutional links, official registry portal link, or representative details..."
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowVerifyModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Credentials'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        @media (max-width: 860px) {
          .org-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
