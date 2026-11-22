import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { opportunityAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { APPROVED_CATEGORIES, OPPORTUNITY_TYPES, OPPORTUNITY_MODES, URGENCY_LEVELS } from '../utils/constants';
import { PlusCircle, Sparkles, AlertCircle, ArrowLeft, HeartHandshake } from 'lucide-react';

export default function CreateOpportunityPage() {
  const [searchParams] = useSearchParams();
  const isAssistanceInitial = searchParams.get('type') === 'assistance';

  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: APPROVED_CATEGORIES[0],
    type: isAssistanceInitial ? 'Community Assistance Request' : OPPORTUNITY_TYPES[0],
    mode: isAssistanceInitial ? 'Offline' : 'Online',
    location: '',
    skillsRequired: '',
    eligibility: '',
    startDate: '',
    endDate: '',
    deadline: '',
    availablePositions: isAssistanceInitial ? 2 : 5,
    contactInfo: user?.email || '',
    isAssistanceRequest: isAssistanceInitial,
    urgency: 'Medium',
    preferredTime: '',
    requesterType: user?.roles?.includes('NGO Representative') ? 'NGO Organization' : 'Individual Resident'
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.description || !formData.category) {
      setError('Please provide opportunity title, description, and an approved category.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        mode: formData.mode,
        location: formData.location || (formData.mode === 'Online' ? 'Remote / Online' : 'Local Community'),
        skillsRequired: formData.skillsRequired ? formData.skillsRequired.split(',').map(s => s.trim()).filter(Boolean) : [],
        eligibility: formData.eligibility || 'Open to all interested participants',
        startDate: formData.startDate,
        endDate: formData.endDate,
        deadline: formData.deadline,
        availablePositions: parseInt(formData.availablePositions) || 5,
        contactInfo: formData.contactInfo,
        isAssistanceRequest: formData.isAssistanceRequest,
        assistanceDetails: formData.isAssistanceRequest ? {
          urgency: formData.urgency,
          preferredTime: formData.preferredTime,
          requesterType: formData.requesterType,
          adminApproved: true
        } : {}
      };

      const res = await opportunityAPI.create(payload);
      if (res.data.success) {
        addToast(
          formData.isAssistanceRequest
            ? 'Community assistance request submitted and live on Explore board!'
            : 'Opportunity published successfully!',
          'success'
        );
        navigate(`/opportunities/${res.data.opportunity._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to publish opportunity.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-content" style={{ paddingTop: 32 }}>
      <div className="container" style={{ maxWidth: 840 }}>
        
        {/* Back Link */}
        <Link to="/explore" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: '13.5px', marginBottom: 20 }}>
          <ArrowLeft size={16} /> Back to opportunities
        </Link>

        <div className="card" style={{ padding: '36px 32px' }}>
          
          <div style={{ marginBottom: 28, borderBottom: '1px solid var(--color-border)', paddingBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-teal)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {formData.isAssistanceRequest ? <HeartHandshake size={20} /> : <PlusCircle size={20} />}
              </div>
              <h1 style={{ fontSize: '1.75rem', margin: 0, color: 'var(--color-navy)' }}>
                {formData.isAssistanceRequest ? 'Submit Community Assistance Request' : 'Publish Opportunity'}
              </h1>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
              All opportunities are cataloged under the common Explore Opportunities board. Categories are strictly limited to the eight approved collaboration fields.
            </p>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13.5px',
              marginBottom: 24,
              border: '1px solid #FCA5A5'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            
            {/* Toggle Opportunity vs Assistance Request */}
            <div style={{
              display: 'flex',
              gap: 12,
              backgroundColor: 'var(--color-bg)',
              padding: 6,
              borderRadius: 'var(--radius-md)',
              marginBottom: 24
            }}>
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  isAssistanceRequest: false,
                  type: 'Academic Project'
                })}
                className={`btn btn-sm ${!formData.isAssistanceRequest ? 'btn-navy' : 'btn-ghost'}`}
                style={{ flex: 1 }}
              >
                Standard Opportunity (Academic / Project / Mentorship)
              </button>
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  isAssistanceRequest: true,
                  type: 'Community Assistance Request'
                })}
                className={`btn btn-sm ${formData.isAssistanceRequest ? 'btn-primary' : 'btn-ghost'}`}
                style={{ flex: 1 }}
              >
                Community Assistance Request (Elderly / Literacy / Non-profit)
              </button>
            </div>

            {/* Title */}
            <div className="form-group">
              <label className="form-label">Opportunity Title *</label>
              <input
                type="text"
                name="title"
                className="form-input"
                placeholder={formData.isAssistanceRequest
                  ? "e.g. Volunteer Assistance Needed: Teaching Smartphone Basics to Seniors"
                  : "e.g. Open Source Climate Forecasting Research Study"
                }
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Approved Category Selection */}
            <div className="form-group">
              <label className="form-label">Focus Field (Approved Categories Only) *</label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {APPROVED_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="form-hint">
                LinkUp restricts listings strictly to these 8 academic, digital, social, entrepreneurial, professional, environmental, financial, and wellness categories.
              </div>
            </div>

            {/* Type & Mode */}
            <div className="grid-2" style={{ gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Opportunity Type *</label>
                <select
                  name="type"
                  className="form-select"
                  value={formData.type}
                  onChange={handleChange}
                >
                  {OPPORTUNITY_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Participation Mode *</label>
                <select
                  name="mode"
                  className="form-select"
                  value={formData.mode}
                  onChange={handleChange}
                >
                  <option value="Online">Online / Remote</option>
                  <option value="Offline">Offline / In-person</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            {/* Assistance Request Specific Fields */}
            {formData.isAssistanceRequest && (
              <div style={{
                backgroundColor: 'var(--color-warning-bg)',
                border: '1px solid #FCD34D',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                marginBottom: 24
              }}>
                <h4 style={{ color: '#92400E', fontSize: '1rem', marginBottom: 12 }}>
                  Community Assistance Metadata
                </h4>

                <div className="grid-3" style={{ gap: 14 }}>
                  <div>
                    <label className="form-label" style={{ color: '#78350F' }}>Urgency Level</label>
                    <select
                      name="urgency"
                      className="form-select"
                      value={formData.urgency}
                      onChange={handleChange}
                    >
                      {URGENCY_LEVELS.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ color: '#78350F' }}>Requester Entity</label>
                    <select
                      name="requesterType"
                      className="form-select"
                      value={formData.requesterType}
                      onChange={handleChange}
                    >
                      <option value="Individual Resident">Individual Resident</option>
                      <option value="NGO Organization">NGO / Non-profit</option>
                      <option value="Community Initiative">Community Initiative</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ color: '#78350F' }}>Preferred Time</label>
                    <input
                      type="text"
                      name="preferredTime"
                      className="form-input"
                      placeholder="e.g. Saturday Mornings"
                      value={formData.preferredTime}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: '#B45309', marginTop: 10 }}>
                  Note: Do not enter private home street addresses. Use neighborhood or civic center locations.
                </div>
              </div>
            )}

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Detailed Description *</label>
              <textarea
                name="description"
                className="form-textarea"
                rows={5}
                placeholder="Describe the initiative goals, responsibilities, expected impact, and schedule..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            {/* Skills & Location */}
            <div className="grid-2" style={{ gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Required Skills / Capabilities</label>
                <input
                  type="text"
                  name="skillsRequired"
                  className="form-input"
                  placeholder="e.g. Python, Public Speaking, Smartphone Basics (comma separated)"
                  value={formData.skillsRequired}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">General Location</label>
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  placeholder="e.g. Seattle, WA or Remote Zoom"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Dates & Capacity */}
            <div className="grid-3" style={{ gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  className="form-input"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Application Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  className="form-input"
                  value={formData.deadline}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Positions / Volunteers Needed</label>
                <input
                  type="number"
                  name="availablePositions"
                  className="form-input"
                  min={1}
                  value={formData.availablePositions}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Eligibility & Contact */}
            <div className="grid-2" style={{ gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Eligibility Criteria</label>
                <input
                  type="text"
                  name="eligibility"
                  className="form-input"
                  placeholder="e.g. Open to all students, or Requires basic JS knowledge"
                  value={formData.eligibility}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Method / Email</label>
                <input
                  type="text"
                  name="contactInfo"
                  className="form-input"
                  placeholder="Contact email or In-app messaging"
                  value={formData.contactInfo}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <Link to="/explore" className="btn btn-ghost">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={submitting}
              >
                {submitting ? 'Publishing...' : formData.isAssistanceRequest ? 'Submit Assistance Request' : 'Publish Opportunity'}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
