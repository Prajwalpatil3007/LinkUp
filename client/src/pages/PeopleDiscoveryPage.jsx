import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import { USER_ROLES, APPROVED_CATEGORIES } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import { 
  UserCheck, 
  Search, 
  MapPin, 
  MessageSquare, 
  Sparkles, 
  ArrowRight, 
  GraduationCap 
} from 'lucide-react';

export default function PeopleDiscoveryPage() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedRole !== 'All') params.role = selectedRole;
      if (selectedSkill.trim()) params.skill = selectedSkill.trim();
      if (locationInput.trim()) params.location = locationInput.trim();
      if (user) params.matchForUserId = user._id;

      const res = await userAPI.getUsers(params);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  return (
    <div className="main-content" style={{ paddingTop: 32 }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-teal)', fontSize: '13px', fontWeight: 600, marginBottom: 4 }}>
            <Sparkles size={16} /> RULE-BASED SKILL & INTEREST MATCHING
          </div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--color-navy)', margin: 0 }}>
            People Discovery & Teammate Matching
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', marginTop: 4 }}>
            Discover students, local mentors, community volunteers, and researchers based on verified skills and overlapping focus areas.
          </p>
        </div>

        {/* Filter Card */}
        <div className="card" style={{ padding: '20px', marginBottom: 28 }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: '2 1 260px', position: 'relative' }}>
              <Search size={18} color="var(--color-text-light)" style={{ position: 'absolute', left: 14, top: 12 }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 42 }}
                placeholder="Search by name, skill, interest, or background..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ flex: '1 1 180px', position: 'relative' }}>
              <MapPin size={18} color="var(--color-text-light)" style={{ position: 'absolute', left: 14, top: 12 }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 42 }}
                placeholder="Location..."
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-navy" style={{ flexShrink: 0 }}>
              Search People
            </button>
          </form>

          {/* Role pills */}
          <div style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: '1px solid var(--color-border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 8
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-navy)', marginRight: 4 }}>
              Filter Role:
            </span>
            <button
              onClick={() => setSelectedRole('All')}
              className={`btn btn-sm ${selectedRole === 'All' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '12px' }}
            >
              All Roles
            </button>
            {USER_ROLES.filter(r => r !== 'Administrator').map(role => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`btn btn-sm ${selectedRole === role ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '12px' }}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
            <p>Scanning community directory...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
            <UserCheck size={40} color="var(--color-teal)" style={{ margin: '0 auto 12px' }} />
            <h3>No profiles matched your criteria</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: 6 }}>
              Try searching with broader terms or clear role filters.
            </p>
          </div>
        ) : (
          <div className="grid-3">
            {users.map(person => {
              const hasSharedSkills = person.sharedSkills && person.sharedSkills.length > 0;
              const hasSharedInterests = person.sharedInterests && person.sharedInterests.length > 0;
              return (
                <div
                  key={person._id}
                  className="card card-hover"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: 'var(--radius-lg)'
                  }}
                >
                  <div>
                    {/* Top Row: Avatar & Match Score Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <img
                        src={person.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=176B87&color=ffffff`}
                        alt={person.name}
                        style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-border)' }}
                      />

                      {person.matchScore > 0 && (
                        <span className="badge badge-success" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Sparkles size={11} /> {person.matchScore} Match Pts
                        </span>
                      )}
                    </div>

                    <Link to={`/people/${person._id}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontSize: '1.2rem', color: 'var(--color-navy)', marginBottom: 4 }}>
                        {person.name}
                      </h3>
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <span className="badge badge-teal" style={{ fontSize: '11px' }}>
                        {person.roles?.[0] || 'Member'}
                      </span>
                      {person.location && (
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <MapPin size={12} /> {person.location}
                        </span>
                      )}
                    </div>

                    <p style={{
                      fontSize: '13px',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.5,
                      marginBottom: 16,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {person.bio || 'LinkUp contributor open to collaboration, project initiatives, and knowledge sharing.'}
                    </p>

                    {/* Shared Skills Highlight */}
                    {hasSharedSkills && (
                      <div style={{
                        backgroundColor: 'var(--color-teal-light)',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '11.5px',
                        color: 'var(--color-teal)',
                        fontWeight: 500,
                        marginBottom: 12
                      }}>
                        Shared skills: {person.sharedSkills.join(', ')}
                      </div>
                    )}

                    {/* Skills badges */}
                    {person.skills && person.skills.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                        {person.skills.slice(0, 4).map(sk => (
                          <span key={sk} className="badge badge-neutral" style={{ fontSize: '11px' }}>
                            {sk}
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
                    gap: 8
                  }}>
                    <Link to={`/people/${person._id}`} className="btn btn-outline btn-sm" style={{ flex: 1 }}>
                      View Profile
                    </Link>
                    <Link to={`/messages?user=${person._id}`} className="btn btn-primary btn-sm">
                      <MessageSquare size={13} /> Message
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
