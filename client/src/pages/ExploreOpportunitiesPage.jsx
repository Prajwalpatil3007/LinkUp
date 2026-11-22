import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { opportunityAPI } from '../services/api';
import { APPROVED_CATEGORIES, OPPORTUNITY_TYPES, OPPORTUNITY_MODES, URGENCY_LEVELS } from '../utils/constants';
import CategoryBadge from '../components/CategoryBadge';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Users, 
  Sparkles, 
  AlertCircle, 
  ArrowUpDown, 
  X, 
  PlusCircle, 
  CheckCircle2, 
  SlidersHorizontal 
} from 'lucide-react';

export default function ExploreOpportunitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedMode, setSelectedMode] = useState(searchParams.get('mode') || 'All');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'All');
  const [locationInput, setLocationInput] = useState(searchParams.get('location') || '');
  const [onlyAssistance, setOnlyAssistance] = useState(searchParams.get('isAssistanceRequest') === 'true');
  const [sortBy, setSortBy] = useState('newest');

  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch opportunities whenever query params change
  const fetchOpportunities = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedMode !== 'All') params.mode = selectedMode;
      if (selectedType !== 'All') params.type = selectedType;
      if (locationInput.trim()) params.location = locationInput.trim();
      if (onlyAssistance) params.isAssistanceRequest = true;
      params.sort = sortBy;

      const res = await opportunityAPI.getAll(params);
      if (res.data.success) {
        setOpportunities(res.data.opportunities);
      }
    } catch (err) {
      setError(err.message || 'Failed to load opportunities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [selectedCategory, selectedMode, selectedType, onlyAssistance, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOpportunities();
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedMode('All');
    setSelectedType('All');
    setLocationInput('');
    setOnlyAssistance(false);
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="main-content" style={{ paddingTop: 32 }}>
      <div className="container">
        
        {/* Header */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 28
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-teal)', fontSize: '13px', fontWeight: 600, marginBottom: 4 }}>
              <Sparkles size={16} /> ONE UNIFIED EXPLORATION BOARD
            </div>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--color-navy)', margin: 0 }}>
              Explore Opportunities
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', marginTop: 4 }}>
              Browse academic research, student hackathons, NGO volunteering, and community assistance in one unified catalog.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/opportunities/create?type=assistance" className="btn btn-outline-teal btn-sm">
              + Request Assistance
            </Link>
            <Link to="/opportunities/create" className="btn btn-primary btn-sm">
              <PlusCircle size={15} /> Publish Opportunity
            </Link>
          </div>
        </div>

        {/* Search & Main Filter Bar */}
        <div className="card" style={{ padding: '20px', marginBottom: 28 }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: '2 1 280px', position: 'relative' }}>
              <Search size={18} color="var(--color-text-light)" style={{ position: 'absolute', left: 14, top: 12 }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 42 }}
                placeholder="Search opportunities by title, keywords, skills, or organizer..."
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
                placeholder="Location / City..."
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-navy" style={{ flexShrink: 0 }}>
              <Search size={16} /> Search
            </button>
          </form>

          {/* Quick Filter Badges */}
          <div style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: '1px solid var(--color-border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 10
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-navy)', marginRight: 4 }}>
              Filter by Field:
            </span>

            <button
              onClick={() => setSelectedCategory('All')}
              className={`btn btn-sm ${selectedCategory === 'All' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '12px', padding: '4px 10px' }}
            >
              All 8 Fields
            </button>

            {APPROVED_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '12px', padding: '4px 10px' }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Secondary Controls: Mode, Type, Assistance Toggle, Sorting */}
          <div style={{
            marginTop: 14,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            fontSize: '13px'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
              {/* Mode Select */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Mode:</span>
                <select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', padding: '6px 10px', fontSize: '12.5px' }}
                >
                  {OPPORTUNITY_MODES.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Type Select */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Type:</span>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', padding: '6px 10px', fontSize: '12.5px' }}
                >
                  <option value="All">All Types</option>
                  {OPPORTUNITY_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Assistance Request Pill Toggle */}
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                backgroundColor: onlyAssistance ? 'var(--color-warning-bg)' : 'transparent',
                border: `1px solid ${onlyAssistance ? '#B45309' : 'var(--color-border)'}`,
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                color: onlyAssistance ? '#B45309' : 'var(--color-navy)',
                fontWeight: onlyAssistance ? 600 : 400
              }}>
                <input
                  type="checkbox"
                  checked={onlyAssistance}
                  onChange={(e) => setOnlyAssistance(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span>Community Assistance Requests Only</span>
              </label>
            </div>

            {/* Sort & Reset */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ArrowUpDown size={14} color="var(--color-text-muted)" />
                <span style={{ color: 'var(--color-text-muted)' }}>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', padding: '6px 10px', fontSize: '12.5px' }}
                >
                  <option value="newest">Newest First</option>
                  <option value="deadline">Approaching Deadline</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              <button
                onClick={clearAllFilters}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-navy)' }}>
            Showing {opportunities.length} {opportunities.length === 1 ? 'Opportunity' : 'Opportunities'}
          </span>
          {onlyAssistance && (
            <span className="badge badge-warning">Filtered: Community Assistance Requests</span>
          )}
        </div>

        {/* Opportunities List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
            <div style={{
              width: 36,
              height: 36,
              border: '3px solid var(--color-border)',
              borderTopColor: 'var(--color-teal)',
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 0.8s linear infinite'
            }} />
            <p>Loading opportunities across all fields...</p>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <AlertCircle size={40} color="var(--color-teal)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.3rem', marginBottom: 8 }}>No opportunities matched your filters</h3>
            <p style={{ color: 'var(--color-text-secondary)', maxWidth: 500, margin: '0 auto 20px' }}>
              Try adjusting your search keywords, clearing specific category filters, or publish a new opportunity for the community!
            </p>
            <button onClick={clearAllFilters} className="btn btn-outline-teal">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid-3">
            {opportunities.map((op) => (
              <div
                key={op._id}
                className="card card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <div>
                  {/* Category & Status badges */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                    <CategoryBadge category={op.category} size="sm" />
                    {op.isAssistanceRequest ? (
                      <span className="badge badge-warning" style={{ fontSize: '11px', fontWeight: 600 }}>
                        {op.assistanceDetails?.urgency ? `${op.assistanceDetails.urgency} Urgency` : 'Assistance'}
                      </span>
                    ) : (
                      <span className="badge badge-teal" style={{ fontSize: '11px' }}>
                        {op.mode}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <Link to={`/opportunities/${op._id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{
                      fontSize: '1.18rem',
                      color: 'var(--color-navy)',
                      marginBottom: 8,
                      lineHeight: 1.35
                    }}>
                      {op.title}
                    </h3>
                  </Link>

                  {/* Organiser / Org info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>
                    <span>By <strong>{op.organization?.name || op.organizer?.name || 'Community Member'}</strong></span>
                    {op.organization?.verificationStatus === 'Verified' && (
                      <span className="badge badge-teal" style={{ fontSize: '10px', padding: '1px 5px' }}>Verified Org</span>
                    )}
                  </div>

                  {/* Description */}
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

                  {/* Skills Required */}
                  {op.skillsRequired && op.skillsRequired.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                      {op.skillsRequired.slice(0, 3).map((sk) => (
                        <span key={sk} className="badge badge-neutral" style={{ fontSize: '11px' }}>
                          {sk}
                        </span>
                      ))}
                      {op.skillsRequired.length > 3 && (
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', alignSelf: 'center' }}>
                          +{op.skillsRequired.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer metadata & Action button */}
                <div style={{
                  paddingTop: 16,
                  borderTop: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: 'var(--color-text-muted)'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                      <MapPin size={13} color="var(--color-teal)" />
                      <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {op.location || 'Remote'}
                      </span>
                    </div>
                    {op.deadline && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '11px' }}>
                        <Calendar size={12} />
                        <span>Deadline: {op.deadline}</span>
                      </div>
                    )}
                  </div>

                  <Link to={`/opportunities/${op._id}`} className="btn btn-outline-teal btn-sm">
                    View Details
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
