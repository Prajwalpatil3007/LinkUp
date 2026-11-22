import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import CategoryBadge from '../components/CategoryBadge';
import { 
  FileCheck, 
  Clock, 
  MapPin, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  MinusCircle 
} from 'lucide-react';

export default function ApplicationsPage() {
  const { addToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyApplications = async () => {
    setLoading(true);
    try {
      const res = await applicationAPI.getMyApplications();
      if (res.data.success) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    try {
      const res = await applicationAPI.withdraw(appId);
      if (res.data.success) {
        addToast('Application withdrawn successfully.', 'info');
        fetchMyApplications();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="main-content" style={{ paddingTop: 32 }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-teal)', fontSize: '13px', fontWeight: 600, marginBottom: 4 }}>
            <FileCheck size={16} /> PARTICIPATION MANAGEMENT
          </div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--color-navy)', margin: 0 }}>
            My Applications & Submissions
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', marginTop: 4 }}>
            Track the status of your research applications, hackathon entries, volunteer offers, and community assistance proposals.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
            <p>Loading your applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <FileCheck size={42} color="var(--color-teal)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.3rem' }}>No applications on record</h3>
            <p style={{ color: 'var(--color-text-secondary)', maxWidth: 460, margin: '8px auto 20px' }}>
              You haven't submitted any applications or assistance offers yet. Discover opportunities matching your capabilities!
            </p>
            <Link to="/explore" className="btn btn-primary">
              Explore Opportunities Board
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {applications.map(app => (
              <div
                key={app._id}
                className="card"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      {app.opportunity?.category && (
                        <CategoryBadge category={app.opportunity.category} size="sm" />
                      )}
                      <span className="badge badge-teal" style={{ fontSize: '11px' }}>
                        {app.opportunity?.type || 'Initiative'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', margin: '0 0 6px' }}>
                      {app.opportunity?.title || 'Opportunity'}
                    </h3>

                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
                      <span>Applied on: {new Date(app.appliedAt).toLocaleDateString()}</span>
                      {app.opportunity?.location && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={13} color="var(--color-teal)" /> {app.opportunity.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className={`badge ${
                      app.status === 'Approved' ? 'badge-success' :
                      app.status === 'Rejected' ? 'badge-danger' :
                      app.status === 'Withdrawn' ? 'badge-neutral' : 'badge-warning'
                    }`} style={{ padding: '6px 14px', fontSize: '13px', fontWeight: 600 }}>
                      {app.status === 'Approved' && <CheckCircle2 size={14} />}
                      {app.status === 'Rejected' && <XCircle size={14} />}
                      {app.status === 'Withdrawn' && <MinusCircle size={14} />}
                      {app.status === 'Pending' && <Clock size={14} />}
                      <span>{app.status}</span>
                    </span>

                    {app.status === 'Pending' && (
                      <button
                        onClick={() => handleWithdraw(app._id)}
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--color-danger)', borderColor: '#FCA5A5' }}
                      >
                        Withdraw
                      </button>
                    )}

                    <Link
                      to={`/opportunities/${app.opportunity?._id || app.opportunity}`}
                      className="btn btn-outline-teal btn-sm"
                    >
                      View Opportunity <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>

                {/* Cover note submitted */}
                <div style={{
                  backgroundColor: 'var(--color-bg)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13.5px',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.5
                }}>
                  <strong style={{ color: 'var(--color-navy)' }}>Your Note to Organizer:</strong> {app.message}
                </div>

                {/* Organizer feedback if any */}
                {app.feedback && (
                  <div style={{
                    backgroundColor: 'var(--color-teal-light)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    color: 'var(--color-teal)',
                    lineHeight: 1.5
                  }}>
                    <strong>Organizer Feedback:</strong> {app.feedback}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
