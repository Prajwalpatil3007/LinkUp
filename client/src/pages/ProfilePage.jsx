import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { APPROVED_CATEGORIES, USER_ROLES } from '../utils/constants';
import Modal from '../components/Modal';
import { 
  User, 
  MapPin, 
  Mail, 
  Briefcase, 
  GraduationCap, 
  Clock, 
  Edit3, 
  MessageSquare, 
  CheckCircle, 
  Sparkles, 
  PlusCircle, 
  Calendar 
} from 'lucide-react';

export default function ProfilePage() {
  const { id } = useParams(); // If id is present, viewing other user; otherwise viewing self
  const { user: currentUser, profile: currentProfile, updateUserData } = useAuth();
  const { addToast } = useToast();

  const isSelf = !id || (currentUser && currentUser._id === id);

  const [targetUser, setTargetUser] = useState(null);
  const [targetProfile, setTargetProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Profile Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    bio: '',
    location: '',
    avatar: '',
    skills: '',
    headline: '',
    availability: 'Flexible',
    projectExperience: '',
    degree: '',
    institution: '',
    fieldOfStudy: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const userId = (id && id !== 'undefined') ? id : (currentUser?._id || currentUser?.id);
        if (!userId) {
          setLoading(false);
          return;
        }

        const res = await userAPI.getUserById(userId);
        if (res.data.success) {
          setTargetUser(res.data.user);
          setTargetProfile(res.data.profile);

          if (isSelf) {
            setEditFormData({
              name: res.data.user.name || '',
              bio: res.data.user.bio || '',
              location: res.data.user.location || '',
              avatar: res.data.user.avatar || '',
              skills: (res.data.user.skills || []).join(', '),
              headline: res.data.profile?.headline || '',
              availability: res.data.profile?.availability || 'Flexible',
              projectExperience: res.data.profile?.projectExperience || '',
              degree: res.data.profile?.education?.[0]?.degree || '',
              institution: res.data.profile?.education?.[0]?.institution || '',
              fieldOfStudy: res.data.profile?.education?.[0]?.fieldOfStudy || ''
            });
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, currentUser]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Update User basic info
      const userRes = await userAPI.updateMe({
        name: editFormData.name,
        bio: editFormData.bio,
        location: editFormData.location,
        avatar: editFormData.avatar,
        skills: editFormData.skills.split(',').map(s => s.trim()).filter(Boolean)
      });

      // 2. Update Profile detailed info
      const profileRes = await userAPI.updateMyProfile({
        headline: editFormData.headline,
        availability: editFormData.availability,
        projectExperience: editFormData.projectExperience,
        education: editFormData.institution ? [{
          institution: editFormData.institution,
          degree: editFormData.degree,
          fieldOfStudy: editFormData.fieldOfStudy
        }] : []
      });

      if (userRes.data.success) {
        setTargetUser(userRes.data.user);
        setTargetProfile(profileRes.data.profile);
        updateUserData(userRes.data.user, profileRes.data.profile);
        addToast('Profile updated successfully!', 'success');
        setShowEditModal(false);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <p>Loading member profile...</p>
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Profile Not Found</h2>
        <Link to="/people" className="btn btn-primary" style={{ marginTop: 20 }}>
          Back to People Discovery
        </Link>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ paddingTop: 32 }}>
      <div className="container" style={{ maxWidth: 960 }}>
        
        {/* Profile Header Card */}
        <div className="card" style={{ padding: '36px', marginBottom: 28, position: 'relative' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <img
                src={targetUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetUser.name)}&background=176B87&color=ffffff`}
                alt={targetUser.name}
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid var(--color-teal)',
                  boxShadow: 'var(--shadow-md)'
                }}
              />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h1 style={{ fontSize: '1.9rem', color: 'var(--color-navy)', margin: 0 }}>
                    {targetUser.name}
                  </h1>
                  <span className="badge badge-teal">
                    {targetUser.roles?.[0] || 'Member'}
                  </span>
                </div>

                <div style={{ fontSize: '14.5px', color: 'var(--color-teal)', fontWeight: 500, marginTop: 4 }}>
                  {targetProfile?.headline || `${targetUser.roles?.[0]} on LinkUp Platform`}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, fontSize: '13px', color: 'var(--color-text-muted)', marginTop: 8 }}>
                  {targetUser.location && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={14} color="var(--color-teal)" /> {targetUser.location}
                    </span>
                  )}
                  {targetProfile?.availability && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={14} color="var(--color-teal)" /> Availability: {targetProfile.availability}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              {isSelf ? (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="btn btn-outline-teal"
                >
                  <Edit3 size={15} /> Edit Profile
                </button>
              ) : (
                <Link
                  to={`/messages?user=${targetUser._id}`}
                  className="btn btn-primary"
                >
                  <MessageSquare size={16} /> Direct Message
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 28 }} className="profile-layout">
          
          {/* Left Column: Bio, Experience, Education */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Biography */}
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: 12 }}>About & Background</h3>
              <p style={{ fontSize: '14.5px', color: 'var(--color-text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {targetUser.bio || 'This member has not yet added a biography.'}
              </p>
            </div>

            {/* Project Experience */}
            {targetProfile?.projectExperience && (
              <div className="card">
                <h3 style={{ fontSize: '1.25rem', marginBottom: 12 }}>Project & Initiative Experience</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {targetProfile.projectExperience}
                </p>
              </div>
            )}

            {/* Education / Credentials */}
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: 14 }}>Education & Background</h3>
              {targetProfile?.education && targetProfile.education.length > 0 ? (
                targetProfile.education.map((edu, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 12, marginBottom: idx < targetProfile.education.length - 1 ? 14 : 0 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-teal-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-teal)',
                      flexShrink: 0
                    }}>
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--color-navy)' }}>
                        {edu.institution}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                        {edu.degree} in {edu.fieldOfStudy}
                      </div>
                      {(edu.startYear || edu.endYear) && (
                        <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', marginTop: 2 }}>
                          {edu.startYear} - {edu.endYear || 'Present'}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted)' }}>
                  No education history added yet.
                </p>
              )}
            </div>

          </div>

          {/* Right Column: Skills & Interests */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Skills */}
            <div className="card">
              <h4 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Skills & Capabilities</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {targetUser.skills && targetUser.skills.length > 0 ? (
                  targetUser.skills.map(s => (
                    <span key={s} className="badge badge-teal" style={{ padding: '6px 12px', fontSize: '12.5px' }}>
                      {s}
                    </span>
                  ))
                ) : (
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No skills listed.</p>
                )}
              </div>
            </div>

            {/* Approved Focus Areas / Interests */}
            <div className="card">
              <h4 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Interest Fields</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {targetUser.interests && targetUser.interests.length > 0 ? (
                  targetUser.interests.map(i => (
                    <span key={i} className="badge badge-neutral" style={{ padding: '6px 12px', fontSize: '12.5px' }}>
                      {i}
                    </span>
                  ))
                ) : (
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No interests specified.</p>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit LinkUp Profile"
        maxWidth={620}
      >
        <form onSubmit={handleSaveProfile}>
          <div className="grid-2" style={{ gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location (City, Region)</label>
              <input
                type="text"
                className="form-input"
                value={editFormData.location}
                onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Headline / Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Senior CS Student & Climate Data Enthusiast"
              value={editFormData.headline}
              onChange={(e) => setEditFormData({ ...editFormData, headline: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Avatar URL</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://images.unsplash.com/..."
              value={editFormData.avatar}
              onChange={(e) => setEditFormData({ ...editFormData, avatar: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Biography & Objectives</label>
            <textarea
              className="form-textarea"
              rows={4}
              value={editFormData.bio}
              onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Skills (Comma separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Python, Machine Learning, Public Speaking"
              value={editFormData.skills}
              onChange={(e) => setEditFormData({ ...editFormData, skills: e.target.value })}
            />
          </div>

          <div className="grid-2" style={{ gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Availability</label>
              <select
                className="form-select"
                value={editFormData.availability}
                onChange={(e) => setEditFormData({ ...editFormData, availability: e.target.value })}
              >
                <option value="Flexible">Flexible</option>
                <option value="Weekends Only">Weekends Only</option>
                <option value="Part-time (10 hrs/week)">Part-time (10 hrs/week)</option>
                <option value="Full-time">Full-time</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Institution / University</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Metro State University"
                value={editFormData.institution}
                onChange={(e) => setEditFormData({ ...editFormData, institution: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Degree & Field of Study</label>
            <div className="grid-2" style={{ gap: 12 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Degree (e.g. B.S., M.S.)"
                value={editFormData.degree}
                onChange={(e) => setEditFormData({ ...editFormData, degree: e.target.value })}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Field (e.g. Computer Science)"
                value={editFormData.fieldOfStudy}
                onChange={(e) => setEditFormData({ ...editFormData, fieldOfStudy: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowEditModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile Details'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        @media (max-width: 860px) {
          .profile-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
