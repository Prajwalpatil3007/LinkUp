import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { opportunityAPI, communityAPI, projectAPI } from '../services/api';
import { APPROVED_CATEGORIES, CATEGORY_DETAILS } from '../utils/constants';
import CategoryBadge from '../components/CategoryBadge';
import { 
  Search, 
  ArrowRight, 
  GraduationCap, 
  Terminal, 
  HeartHandshake, 
  Rocket, 
  Briefcase, 
  Leaf, 
  Landmark, 
  Activity, 
  MapPin, 
  Users, 
  Calendar, 
  CheckCircle, 
  Sparkles, 
  ShieldCheck, 
  FolderKanban, 
  Clock 
} from 'lucide-react';

const ICON_MAP = {
  GraduationCap,
  Terminal,
  HeartHandshake,
  Rocket,
  Briefcase,
  Leaf,
  Landmark,
  Activity
};

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredOpportunities, setFeaturedOpportunities] = useState([]);
  const [popularCommunities, setPopularCommunities] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [opRes, commRes, projRes] = await Promise.all([
          opportunityAPI.getAll({ limit: 6 }),
          communityAPI.getAll({ limit: 4 }),
          projectAPI.getAll({ limit: 3 })
        ]);

        if (opRes.data.success) setFeaturedOpportunities(opRes.data.opportunities);
        if (commRes.data.success) setPopularCommunities(commRes.data.communities);
        if (projRes.data.success) setActiveProjects(projRes.data.projects);
      } catch (err) {
        console.error('Landing page data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%)',
        padding: '72px 0 80px',
        borderBottom: '1px solid var(--color-border)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative background glow */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '10%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(23, 107, 135, 0.08) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'var(--color-teal-light)',
            color: 'var(--color-teal)',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: 20
          }}>
            <Sparkles size={15} />
            <span>LinkUp • Connecting Students and Communities</span>
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            color: 'var(--color-navy)',
            fontWeight: 700,
            lineHeight: 1.15,
            maxWidth: 920,
            margin: '0 auto 18px',
            letterSpacing: '-0.03em'
          }}>
            One Unified Platform for Academic Discovery & Community Impact
          </h1>

          {/* Tagline */}
          <p style={{
            fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
            color: 'var(--color-teal)',
            fontWeight: 500,
            marginBottom: 14,
            letterSpacing: '-0.01em'
          }}>
            Discover Opportunities. Connect with People. Create an Impact.
          </p>

          <p style={{
            fontSize: '16px',
            color: 'var(--color-text-secondary)',
            maxWidth: 720,
            margin: '0 auto 36px',
            lineHeight: 1.6
          }}>
            Uniting students, neighborhood residents, mentors, NGOs, educational institutions, and startups into a single ecosystem. Explore verified research, social assistance requests, and collaborative projects.
          </p>

          {/* Interactive Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              maxWidth: 680,
              margin: '0 auto 32px',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              padding: '6px 8px 6px 20px',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--color-border)'
            }}
          >
            <Search size={20} color="var(--color-teal)" style={{ flexShrink: 0, marginRight: 12 }} />
            <input
              type="text"
              placeholder="Search opportunities, assistance requests, skills, or people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '15px',
                color: 'var(--color-navy)',
                backgroundColor: 'transparent'
              }}
            />
            <button type="submit" className="btn btn-primary btn-md" style={{ borderRadius: 'var(--radius-lg)' }}>
              Explore Now
            </button>
          </form>

          {/* Quick CTA Links */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
            <Link to="/explore" className="btn btn-navy">
              Browse All Opportunities <ArrowRight size={16} />
            </Link>
            <Link to="/explore?isAssistanceRequest=true" className="btn btn-outline-teal">
              View Community Assistance Requests
            </Link>
          </div>

        </div>
      </section>

      {/* 2. EIGHT APPROVED CATEGORIES GRID */}
      <section style={{ padding: '70px 0', backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-teal)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Explore by Focus Area
            </span>
            <h2 style={{ fontSize: '2rem', marginTop: 6, color: 'var(--color-navy)' }}>
              Eight Approved Collaboration Fields
            </h2>
            <p style={{ maxWidth: 620, margin: '8px auto 0', color: 'var(--color-text-secondary)' }}>
              Focused exclusively on academic rigor, technological empowerment, community service, and local civic well-being.
            </p>
          </div>

          <div className="grid-4">
            {APPROVED_CATEGORIES.map((cat) => {
              const details = CATEGORY_DETAILS[cat];
              const IconComp = ICON_MAP[details.icon] || GraduationCap;
              return (
                <Link
                  key={cat}
                  to={`/explore?category=${encodeURIComponent(cat)}`}
                  className="card card-hover"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                    padding: '24px 20px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    height: '100%',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: `${details.color}15`,
                      color: details.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16
                    }}>
                      <IconComp size={24} />
                    </div>

                    <h3 style={{ fontSize: '1.05rem', color: 'var(--color-navy)', marginBottom: 8, lineHeight: 1.35 }}>
                      {cat}
                    </h3>

                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                      {details.shortDesc}
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 18,
                    fontSize: '13px',
                    fontWeight: 600,
                    color: details.color
                  }}>
                    <span>Explore field</span>
                    <ArrowRight size={14} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. FEATURED & RECENT OPPORTUNITIES (ONE UNIFIED SECTION) */}
      <section style={{ padding: '70px 0', backgroundColor: 'var(--color-bg)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-teal)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Latest Opportunities
              </span>
              <h2 style={{ fontSize: '2rem', marginTop: 4 }}>
                Unified Opportunities & Assistance Requests
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>
                Discover research grants, student hackathons, NGO volunteer drives, and neighborhood assistance.
              </p>
            </div>
            <Link to="/explore" className="btn btn-outline-teal btn-sm">
              View All Opportunities <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid-3">
            {featuredOpportunities.map((op) => (
              <div
                key={op._id}
                className="card card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 'var(--radius-lg)',
                  height: '100%'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                    <CategoryBadge category={op.category} size="sm" />
                    {op.isAssistanceRequest ? (
                      <span className="badge badge-warning" style={{ fontSize: '11px', fontWeight: 600 }}>
                        Assistance Request
                      </span>
                    ) : (
                      <span className="badge badge-teal" style={{ fontSize: '11px' }}>
                        {op.mode}
                      </span>
                    )}
                  </div>

                  <Link to={`/opportunities/${op._id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{
                      fontSize: '1.15rem',
                      color: 'var(--color-navy)',
                      marginBottom: 10,
                      lineHeight: 1.35
                    }}>
                      {op.title}
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
                    {op.description}
                  </p>

                  {/* Skills tags */}
                  {op.skillsRequired && op.skillsRequired.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                      {op.skillsRequired.slice(0, 3).map((sk) => (
                        <span key={sk} className="badge badge-neutral" style={{ fontSize: '11.5px' }}>
                          {sk}
                        </span>
                      ))}
                      {op.skillsRequired.length > 3 && (
                        <span style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', alignSelf: 'center' }}>
                          +{op.skillsRequired.length - 3} more
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
                  fontSize: '12.5px',
                  color: 'var(--color-text-muted)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={14} color="var(--color-teal)" />
                    <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {op.location || 'Remote'}
                    </span>
                  </div>

                  <Link to={`/opportunities/${op._id}`} className="btn btn-outline btn-sm">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ACTIVE PROJECTS & POPULAR COMMUNITIES */}
      <section style={{ padding: '70px 0', backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div className="grid-2" style={{ gap: 40 }}>
            
            {/* Left: Popular Communities */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-teal)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Shared Hubs
                  </span>
                  <h3 style={{ fontSize: '1.5rem', marginTop: 4 }}>Popular Communities</h3>
                </div>
                <Link to="/communities" className="btn btn-ghost btn-sm">
                  View All <ArrowRight size={14} />
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {popularCommunities.map((comm) => (
                  <Link
                    key={comm._id}
                    to={`/communities/${comm._id}`}
                    className="card card-hover"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textDecoration: 'none',
                      padding: '16px 20px',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 42,
                        height: 42,
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-teal-light)',
                        color: 'var(--color-teal)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Users size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--color-navy)' }}>
                          {comm.name}
                        </div>
                        <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginTop: 2 }}>
                          {comm.membersCount || 1} members • {comm.category}
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={16} color="var(--color-teal)" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Active Projects */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-teal)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Team Collaboration
                  </span>
                  <h3 style={{ fontSize: '1.5rem', marginTop: 4 }}>Featured Projects</h3>
                </div>
                <Link to="/projects" className="btn btn-ghost btn-sm">
                  View All <ArrowRight size={14} />
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {activeProjects.map((proj) => (
                  <Link
                    key={proj._id}
                    to={`/projects/${proj._id}`}
                    className="card card-hover"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      textDecoration: 'none',
                      padding: '18px 20px',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span className="badge badge-teal" style={{ fontSize: '11px' }}>
                        {proj.category}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        Team size: {proj.teamSize}
                      </span>
                    </div>

                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-navy)', marginBottom: 4 }}>
                      {proj.title}
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.4, marginBottom: 12 }}>
                      {proj.description.substring(0, 110)}...
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {proj.requiredSkills?.slice(0, 3).map((s) => (
                        <span key={s} className="badge badge-neutral" style={{ fontSize: '11px' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. HOW LINKUP WORKS */}
      <section style={{ padding: '70px 0', backgroundColor: 'var(--color-bg)', borderTop: '1px solid var(--color-border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-teal)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Seamless Collaboration
          </span>
          <h2 style={{ fontSize: '2rem', marginTop: 6, marginBottom: 12 }}>
            How LinkUp Connects People
          </h2>
          <p style={{ maxWidth: 640, margin: '0 auto 48px', color: 'var(--color-text-secondary)' }}>
            Empowering students, local residents, professionals, and civic organizations through three straightforward steps.
          </p>

          <div className="grid-3">
            <div className="card" style={{ textAlign: 'left', padding: '32px 24px' }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-teal)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '18px',
                marginBottom: 20
              }}>
                1
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 10 }}>Discover & Filter</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.6 }}>
                Browse our unified Explore board across 8 approved academic and community fields. Filter by mode, location, skills, and urgency.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'left', padding: '32px 24px' }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-navy)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '18px',
                marginBottom: 20
              }}>
                2
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 10 }}>Connect & Match</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.6 }}>
                Our rule-based skill and interest engine suggests teammates, mentors, and local collaborators with overlapping passions.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'left', padding: '32px 24px' }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#059669',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '18px',
                marginBottom: 20
              }}>
                3
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 10 }}>Collaborate & Impact</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.6 }}>
                Apply to initiatives, manage participants, join project sprints, share knowledge, and support neighborhood residents directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BENEFITS BY PARTICIPANT TYPE */}
      <section style={{ padding: '70px 0', backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-teal)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Built for Everyone
            </span>
            <h2 style={{ fontSize: '2rem', marginTop: 6 }}>
              Tailored Benefits Across Community Roles
            </h2>
          </div>

          <div className="grid-3">
            {/* For Students */}
            <div className="card" style={{ borderTop: '4px solid var(--color-teal)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <GraduationCap size={24} color="var(--color-teal)" />
                <h3 style={{ fontSize: '1.2rem' }}>For Students</h3>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '13.5px', color: 'var(--color-text-secondary)' }}>
                <li style={{ display: 'flex', gap: 8 }}><CheckCircle size={16} color="var(--color-teal)" /> Find teammates for hackathons and coding builds</li>
                <li style={{ display: 'flex', gap: 8 }}><CheckCircle size={16} color="var(--color-teal)" /> Access university research collaboration positions</li>
                <li style={{ display: 'flex', gap: 8 }}><CheckCircle size={16} color="var(--color-teal)" /> Gain real-world civic and volunteer experience</li>
                <li style={{ display: 'flex', gap: 8 }}><CheckCircle size={16} color="var(--color-teal)" /> Connect 1-on-1 with industry mentors</li>
              </ul>
            </div>

            {/* For Residents */}
            <div className="card" style={{ borderTop: '4px solid #0284C7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <HeartHandshake size={24} color="#0284C7" />
                <h3 style={{ fontSize: '1.2rem' }}>For Residents</h3>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '13.5px', color: 'var(--color-text-secondary)' }}>
                <li style={{ display: 'flex', gap: 8 }}><CheckCircle size={16} color="#0284C7" /> Request assistance for senior smartphone & digital tasks</li>
                <li style={{ display: 'flex', gap: 8 }}><CheckCircle size={16} color="#0284C7" /> Participate in local tree planting & clean-up drives</li>
                <li style={{ display: 'flex', gap: 8 }}><CheckCircle size={16} color="#0284C7" /> Learn online safety & digital payment protection</li>
                <li style={{ display: 'flex', gap: 8 }}><CheckCircle size={16} color="#0284C7" /> Foster meaningful neighborhood ties</li>
              </ul>
            </div>

            {/* For NGOs & Institutions */}
            <div className="card" style={{ borderTop: '4px solid var(--color-navy)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <Building2 size={24} color="var(--color-navy)" />
                <h3 style={{ fontSize: '1.2rem' }}>For Organizations</h3>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '13.5px', color: 'var(--color-text-secondary)' }}>
                <li style={{ display: 'flex', gap: 8 }}><CheckCircle size={16} color="var(--color-navy)" /> Verified organization badge for public trust</li>
                <li style={{ display: 'flex', gap: 8 }}><CheckCircle size={16} color="var(--color-navy)" /> Recruit skilled student volunteers and researchers</li>
                <li style={{ display: 'flex', gap: 8 }}><CheckCircle size={16} color="var(--color-navy)" /> Manage opportunity applications in one central dashboard</li>
                <li style={{ display: 'flex', gap: 8 }}><CheckCircle size={16} color="var(--color-navy)" /> Amplify public seminars and civic drives</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION SECTION */}
      <section style={{
        backgroundColor: 'var(--color-navy)',
        color: '#FFFFFF',
        padding: '70px 0',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: 780 }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '2.3rem', marginBottom: 14 }}>
            Ready to Connect, Learn, and Make an Impact?
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '16px', lineHeight: 1.6, marginBottom: 32 }}>
            Join thousands of students, educators, local residents, and non-profits working together on LinkUp.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Create Your LinkUp Account
            </Link>
            <Link to="/explore" className="btn btn-outline btn-lg" style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)' }}>
              Explore Opportunities
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Building2(props) {
  return (
    <svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
      <path d="M10 6h4"/>
      <path d="M10 10h4"/>
      <path d="M10 14h4"/>
      <path d="M10 18h4"/>
    </svg>
  );
}
