import React, { useState, useEffect } from 'react';
import { adminAPI, organizationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import { 
  ShieldAlert, 
  Users, 
  Building2, 
  Flag, 
  CheckCircle2, 
  XCircle, 
  Compass, 
  FolderKanban, 
  Search, 
  AlertTriangle 
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [orgsList, setOrgsList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'organizations', 'reports'
  const [loading, setLoading] = useState(true);

  // Search filter for users
  const [userSearch, setUserSearch] = useState('');

  // Org verification modal
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [verifyNotes, setVerifyNotes] = useState('');
  const [verifying, setVerifying] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, orgsRes, reportsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        organizationAPI.getAll(),
        adminAPI.getReports()
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (usersRes.data.success) setUsersList(usersRes.data.users);
      if (orgsRes.data.success) setOrgsList(orgsRes.data.organizations);
      if (reportsRes.data.success) setReportsList(reportsRes.data.reports);
    } catch (err) {
      console.error('Error fetching admin console data:', err);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserSuspension = async (userId) => {
    try {
      const res = await adminAPI.toggleSuspend(userId);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setUsersList(prev => prev.map(u => u._id === userId ? { ...u, isSuspended: res.data.user.isSuspended } : u));
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleVerifyOrganization = async (orgId, status) => {
    setVerifying(true);
    try {
      const res = await adminAPI.verifyOrganization(orgId, {
        status,
        notes: verifyNotes || `Organization ${status.toLowerCase()} by admin.`
      });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setSelectedOrg(null);
        setVerifyNotes('');
        fetchAdminData();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleResolveReport = async (reportId, status) => {
    try {
      const res = await adminAPI.resolveReport(reportId, { status });
      if (res.data.success) {
        addToast(`Report marked as ${status}.`, 'info');
        setReportsList(prev => prev.map(r => r._id === reportId ? { ...r, status } : r));
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.roles?.some(r => r.toLowerCase().includes(userSearch.toLowerCase()))
  );

  return (
    <div className="main-content" style={{ paddingTop: 32 }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#B45309', fontSize: '13px', fontWeight: 600, marginBottom: 4 }}>
            <ShieldAlert size={16} /> ADMINISTRATOR CONTROL CONSOLE
          </div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--color-navy)', margin: 0 }}>
            Platform Administration & Governance
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', marginTop: 4 }}>
            Monitor ecosystem health, verify non-profit institutions, moderate community content, and enforce platform standards.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 28, borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`btn btn-sm ${activeTab === 'overview' ? 'btn-navy' : 'btn-ghost'}`}
          >
            Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`btn btn-sm ${activeTab === 'users' ? 'btn-navy' : 'btn-ghost'}`}
          >
            User Management ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('organizations')}
            className={`btn btn-sm ${activeTab === 'organizations' ? 'btn-navy' : 'btn-ghost'}`}
          >
            Organisation Verification ({orgsList.filter(o => o.verificationStatus === 'Pending').length} Pending)
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`btn btn-sm ${activeTab === 'reports' ? 'btn-navy' : 'btn-ghost'}`}
          >
            Safety & Reports ({reportsList.filter(r => r.status === 'Pending').length} Pending)
          </button>
        </div>

        {/* 1. OVERVIEW & METRICS */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid-4" style={{ marginBottom: 32 }}>
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Members</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-navy)', marginTop: 4 }}>
                  {stats?.totalUsers || 0}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-teal)', marginTop: 4 }}>Students, Residents & Mentors</div>
              </div>

              <div className="card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Opportunities</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-navy)', marginTop: 4 }}>
                  {stats?.totalOpportunities || 0}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-teal)', marginTop: 4 }}>Across all 8 focus fields</div>
              </div>

              <div className="card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Assistance Requests</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#D97706', marginTop: 4 }}>
                  {stats?.totalAssistanceRequests || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#B45309', marginTop: 4 }}>Elderly & digital literacy requests</div>
              </div>

              <div className="card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Applications Tracked</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#059669', marginTop: 4 }}>
                  {stats?.totalApplications || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#059669', marginTop: 4 }}>Collaborative matches</div>
              </div>
            </div>

            <div className="grid-2">
              <div className="card">
                <h3 style={{ fontSize: '1.2rem', marginBottom: 14 }}>Approved Fields Compliance</h3>
                <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                  Backend input validation ensures all opportunities strictly adhere to the 8 approved fields:
                </p>
                <div style={{ fontSize: '12.5px', color: 'var(--color-navy)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div>✓ Academics and Research</div>
                  <div>✓ Technology and Digital Awareness</div>
                  <div>✓ Social Service and Community Support</div>
                  <div>✓ Entrepreneurship and Startups</div>
                  <div>✓ Career and Professional Development</div>
                  <div>✓ Environment and Sustainability</div>
                  <div>✓ Financial and Digital Awareness</div>
                  <div>✓ Health and Well-being</div>
                </div>
                <div style={{ marginTop: 14, fontSize: '12px', color: 'var(--color-danger)', backgroundColor: 'var(--color-danger-bg)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                  Enforced Restriction: Sports, entertainment, concerts, party nightlife, and ticket booking are automatically blocked by the input sanitizer middleware.
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize: '1.2rem', marginBottom: 14 }}>Governance Actions Required</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 500 }}>Pending Organisation Verifications</span>
                    <button onClick={() => setActiveTab('organizations')} className="btn btn-outline-teal btn-sm">
                      {orgsList.filter(o => o.verificationStatus === 'Pending').length} Pending Review
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 500 }}>Content Moderation Reports</span>
                    <button onClick={() => setActiveTab('reports')} className="btn btn-outline btn-sm">
                      {reportsList.filter(r => r.status === 'Pending').length} Open Reports
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <h3 style={{ fontSize: '1.25rem' }}>Registered Users Directory</h3>
              <div style={{ position: 'relative', width: 280 }}>
                <Search size={16} color="var(--color-text-light)" style={{ position: 'absolute', left: 12, top: 11 }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: 36, padding: '8px 12px 8px 36px', fontSize: '13px' }}
                  placeholder="Filter users by name, email, or role..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--color-navy)' }}>Member</th>
                    <th style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--color-navy)' }}>Role</th>
                    <th style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--color-navy)' }}>Location</th>
                    <th style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--color-navy)' }}>Status</th>
                    <th style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--color-navy)', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img
                            src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=176B87&color=ffffff`}
                            alt={u.name}
                            style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{u.name}</div>
                            <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <span className="badge badge-teal" style={{ fontSize: '11px' }}>
                          {u.roles?.[0] || 'Member'}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px', color: 'var(--color-text-secondary)' }}>
                        {u.location || 'Online'}
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <span className={`badge ${u.isSuspended ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '11px' }}>
                          {u.isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        {!u.roles?.includes('Administrator') && (
                          <button
                            onClick={() => handleToggleUserSuspension(u._id)}
                            className={`btn btn-sm ${u.isSuspended ? 'btn-outline-teal' : 'btn-ghost'}`}
                            style={{ fontSize: '11.5px', color: u.isSuspended ? 'var(--color-teal)' : 'var(--color-danger)' }}
                          >
                            {u.isSuspended ? 'Reactivate' : 'Suspend'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. ORGANISATION VERIFICATION */}
        {activeTab === 'organizations' && (
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: 16 }}>
              Organisation Verification Requests
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {orgsList.map(org => (
                <div
                  key={org._id}
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: org.verificationStatus === 'Pending' ? 'var(--color-warning-bg)' : 'var(--color-bg)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 14 }}>
                      <img
                        src={org.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(org.name)}&background=142B3B&color=ffffff`}
                        alt={org.name}
                        style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-navy)' }}>
                          {org.name}
                        </div>
                        <div style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                          {org.type} • {org.location} • {org.contactEmail}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 6 }}>
                          <strong>Verification Credentials:</strong> {org.verificationDoc || 'Standard Institutional Profile'}
                        </div>
                        {org.verificationNotes && (
                          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                            <strong>Applicant Notes:</strong> {org.verificationNotes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className={`badge ${
                        org.verificationStatus === 'Verified' ? 'badge-success' :
                        org.verificationStatus === 'Rejected' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {org.verificationStatus}
                      </span>

                      {org.verificationStatus !== 'Verified' && (
                        <button
                          onClick={() => handleVerifyOrganization(org._id, 'Verified')}
                          className="btn btn-primary btn-sm"
                        >
                          <CheckCircle2 size={14} /> Approve Verification
                        </button>
                      )}

                      {org.verificationStatus !== 'Rejected' && (
                        <button
                          onClick={() => handleVerifyOrganization(org._id, 'Rejected')}
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--color-danger)' }}
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. CONTENT MODERATION REPORTS */}
        {activeTab === 'reports' && (
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: 16 }}>
              Community Safety & Content Reports
            </h3>

            {reportsList.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13.5px' }}>
                No active user-submitted content reports. The ecosystem is in good standing!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {reportsList.map(rep => (
                  <div
                    key={rep._id}
                    style={{
                      padding: '18px 20px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span className="badge badge-danger">{rep.targetType} Report</span>
                          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                            Filed on {new Date(rep.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--color-navy)' }}>
                          Reason: {rep.reason}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                          Target: <strong>{rep.targetTitle || rep.targetId}</strong>
                        </div>
                        {rep.details && (
                          <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginTop: 4 }}>
                            Details: "{rep.details}"
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`badge ${rep.status === 'Pending' ? 'badge-warning' : 'badge-success'}`}>
                          {rep.status}
                        </span>

                        {rep.status === 'Pending' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => handleResolveReport(rep._id, 'Action Taken')}
                              className="btn btn-primary btn-sm"
                            >
                              Action Taken
                            </button>
                            <button
                              onClick={() => handleResolveReport(rep._id, 'Dismissed')}
                              className="btn btn-ghost btn-sm"
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
