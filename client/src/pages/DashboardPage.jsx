import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { opportunityAPI, userAPI, projectAPI, communityAPI, applicationAPI } from '../services/api';
import CategoryBadge from '../components/CategoryBadge';
import { 
  PlusCircle, 
  Search, 
  Sparkles, 
  FolderKanban, 
  Users, 
  UserCheck, 
  FileCheck, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';

export default function DashboardPage() {
  const { user, profile } = useAuth();

  const [recommendedOpportunities, setRecommendedOpportunities] = useState([]);
  const [recentOpportunities, setRecentOpportunities] = useState([]);
  const [suggestedPeople, setSuggestedPeople] = useState([]);
  const [userProjects, setUserProjects] = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [opRes, peopleRes, projRes, commRes, appRes] = await Promise.all([
          opportunityAPI.getAll({ limit: 12 }),
          userAPI.getUsers({ limit: 6, matchForUserId: user?._id }),
          projectAPI.getAll({ limit: 4 }),
          communityAPI.getAll({ limit: 4 }),
          applicationAPI.getMyApplications()
        ]);

        if (opRes.data.success) {
          const allOps = opRes.data.opportunities;
          // Split into recommended (matching user skills/interests) and recent
          const userSkills = (user?.skills || []).map(s => s.toLowerCase());
          const userInterests = (user?.interests || []);

          const matched = allOps.filter(op => {
            const hasCatMatch = userInterests.includes(op.category);
            const hasSkillMatch = (op.skillsRequired || []).some(s => userSkills.includes(s.toLowerCase()));
            return hasCatMatch || hasSkillMatch;
          });

          setRecommendedOpportunities(matched.length > 0 ? matched.slice(0, 4) : allOps.slice(0, 4));
          setRecentOpportunities(allOps.slice(0, 4));
        }

        if (peopleRes.data.success) {
          setSuggestedPeople(peopleRes.data.users.slice(0, 4));
        }

        if (projRes.data.success) {
          setUserProjects(projRes.data.projects.slice(0, 3));
        }

        if (commRes.data.success) {
          setUserCommunities(commRes.data.communities.slice(0, 3));
        }

        if (appRes.data.success) {
          setMyApplications(appRes.data.applications);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Profile completion calculation
  const calculateProfileCompletion = () => {
    let score = 20; // user created
    if (user?.bio) score += 20;
    if (user?.location) score += 15;
    if (user?.skills && user.skills.length > 0) score += 20;
    if (user?.interests && user.interests.length > 0) score += 15;
    if (profile?.education && profile.education.length > 0) score += 10;
    return Math.min(100, score);
  };

  const profileScore = calculateProfileCompletion();

  return (
    <div className="main-content" style={{ paddingTop: 32 }}>
      <div className="container">
        
        {/* 1. TOP WELCOME & STATS BANNER */}
        <div className="card" style={{
          backgroundColor: '#FFFFFF',
          borderLeft: '5px solid var(--color-teal)',
          padding: '28px 32px',
          marginBottom: 32
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=176B87&color=ffffff`}
                alt={user?.name}
                style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-border)' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h1 style={{ fontSize: '1.65rem', margin: 0 }}>Welcome back, {user?.name}!</h1>
                  <span className="badge badge-teal">{user?.roles?.[0] || 'Member'}</span>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                  {user?.bio || 'Explore opportunities, join collaborative projects, and assist community members.'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  {user?.location && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={14} color="var(--color-teal)" /> {user.location}
                    </span>
                  )}
                  <span>•</span>
                  <span>{user?.skills?.length || 0} skills listed</span>
                  <span>•</span>
                  <span>{myApplications.length} applications tracked</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <Link to="/opportunities/create" className="btn btn-primary btn-sm">
                <PlusCircle size={15} /> Post Opportunity
              </Link>
              <Link to="/opportunities/create?type=assistance" className="btn btn-outline-teal btn-sm">
                Request Assistance
              </Link>
              <Link to="/people" className="btn btn-outline btn-sm">
                <UserCheck size={15} /> Find People
              </Link>
            </div>
          </div>

          {/* Profile Completion Meter */}
          {profileScore < 100 && (
            <div style={{
              marginTop: 22,
              paddingTop: 18,
              borderTop: '1px solid var(--color-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Profile Completion: {profileScore}%</span>
                  <Link to="/profile" style={{ color: 'var(--color-teal)', fontWeight: 500 }}>
                    Complete Profile &rarr;
                  </Link>
                </div>
                <div style={{ height: 6, backgroundColor: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${profileScore}%`, height: '100%', backgroundColor: 'var(--color-teal)', borderRadius: 3, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. MAIN TWO-COLUMN DASHBOARD LAYOUT */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }} className="dashboard-grid">
          
          {/* LEFT COLUMN: Recommended & Recent Opportunities */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            
            {/* Recommended Opportunities */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={18} color="var(--color-teal)" />
                  <h2 style={{ fontSize: '1.35rem' }}>Recommended for You</h2>
                </div>
                <Link to="/explore" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-teal)' }}>
                  Explore All &rarr;
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {recommendedOpportunities.map(op => (
                  <div key={op._id} className="card card-hover" style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 10 }}>
                      <CategoryBadge category={op.category} size="sm" />
                      {op.isAssistanceRequest ? (
                        <span className="badge badge-warning" style={{ fontSize: '11px' }}>Assistance Request</span>
                      ) : (
                        <span className="badge badge-teal" style={{ fontSize: '11px' }}>{op.mode}</span>
                      )}
                    </div>

                    <Link to={`/opportunities/${op._id}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy)', marginBottom: 6 }}>
                        {op.title}
                      </h3>
                    </Link>

                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                      {op.description.substring(0, 140)}...
                    </p>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--color-border-subtle)',
                      paddingTop: 12,
                      fontSize: '12.5px',
                      color: 'var(--color-text-muted)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={14} color="var(--color-teal)" />
                        <span>{op.location || 'Remote'}</span>
                      </div>
                      <Link to={`/opportunities/${op._id}`} className="btn btn-primary btn-sm">
                        View Opportunity
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Active Applications Tracker */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileCheck size={18} color="var(--color-teal)" />
                  <h3 style={{ fontSize: '1.25rem' }}>My Applications ({myApplications.length})</h3>
                </div>
                <Link to="/applications" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-teal)' }}>
                  Manage All &rarr;
                </Link>
              </div>

              {myApplications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--color-text-muted)' }}>
                  <p style={{ fontSize: '13.5px' }}>You haven't submitted any applications yet.</p>
                  <Link to="/explore" className="btn btn-outline-teal btn-sm" style={{ marginTop: 12 }}>
                    Discover Opportunities to Apply
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {myApplications.slice(0, 3).map(app => (
                    <div
                      key={app._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-bg)',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-navy)' }}>
                          {app.opportunity?.title || 'Opportunity Application'}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', marginTop: 2 }}>
                          Applied on {new Date(app.appliedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <span className={`badge ${
                        app.status === 'Approved' ? 'badge-success' :
                        app.status === 'Rejected' ? 'badge-danger' :
                        app.status === 'Withdrawn' ? 'badge-neutral' : 'badge-warning'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Suggested Collaborators, Projects, Communities */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            
            {/* Suggested People (Rule-based match) */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UserCheck size={18} color="var(--color-teal)" />
                  <h3 style={{ fontSize: '1.15rem' }}>Suggested People</h3>
                </div>
                <Link to="/people" style={{ fontSize: '12.5px', color: 'var(--color-teal)', fontWeight: 600 }}>
                  Find More &rarr;
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {suggestedPeople.map(person => (
                  <div key={person._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img
                        src={person.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=176B87&color=ffffff`}
                        alt={person.name}
                        style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <Link to={`/people/${person._id}`} style={{ textDecoration: 'none', color: 'var(--color-navy)', fontSize: '13.5px', fontWeight: 600 }}>
                          {person.name}
                        </Link>
                        <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                          {person.roles?.[0] || 'Community Member'} • {person.location || 'Online'}
                        </div>
                      </div>
                    </div>

                    <Link to={`/messages?user=${person._id}`} className="btn btn-outline btn-sm" style={{ padding: '4px 8px', fontSize: '12px' }}>
                      Message
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Projects */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FolderKanban size={18} color="var(--color-teal)" />
                  <h3 style={{ fontSize: '1.15rem' }}>Active Projects</h3>
                </div>
                <Link to="/projects/create" className="btn btn-outline-teal btn-sm" style={{ padding: '2px 8px', fontSize: '11px' }}>
                  + New
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {userProjects.map(proj => (
                  <Link
                    key={proj._id}
                    to={`/projects/${proj._id}`}
                    style={{
                      textDecoration: 'none',
                      padding: '10px 12px',
                      backgroundColor: 'var(--color-bg)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'block'
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-navy)' }}>
                      {proj.title}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {proj.category} • Team: {proj.teamSize}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Joined / Suggested Communities */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Users size={18} color="var(--color-teal)" />
                  <h3 style={{ fontSize: '1.15rem' }}>Communities</h3>
                </div>
                <Link to="/communities" style={{ fontSize: '12.5px', color: 'var(--color-teal)', fontWeight: 600 }}>
                  Explore &rarr;
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {userCommunities.map(comm => (
                  <Link
                    key={comm._id}
                    to={`/communities/${comm._id}`}
                    style={{
                      textDecoration: 'none',
                      padding: '10px 12px',
                      backgroundColor: 'var(--color-bg)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-navy)' }}>
                        {comm.name}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                        {comm.membersCount} members
                      </div>
                    </div>
                    <ArrowRight size={14} color="var(--color-teal)" />
                  </Link>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
