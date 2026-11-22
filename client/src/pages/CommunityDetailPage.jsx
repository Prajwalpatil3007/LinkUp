import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { communityAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CategoryBadge from '../components/CategoryBadge';
import Modal from '../components/Modal';
import { 
  Users, 
  ArrowLeft, 
  PlusCircle, 
  Heart, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  BellRing, 
  ShieldAlert, 
  UserCheck 
} from 'lucide-react';

export default function CommunityDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Post Modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postTags, setPostTags] = useState('');
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [posting, setPosting] = useState(false);

  // Active Comment inputs mapped by postId
  const [commentInputs, setCommentInputs] = useState({});

  const fetchCommunityData = async () => {
    setLoading(true);
    try {
      const [commRes, postsRes] = await Promise.all([
        communityAPI.getById(id),
        communityAPI.getPosts(id)
      ]);

      if (commRes.data.success) {
        setCommunity(commRes.data.community);
        setMembers(commRes.data.members);
        setIsMember(commRes.data.isMember);
      }
      if (postsRes.data.success) {
        setPosts(postsRes.data.posts);
      }
    } catch (err) {
      console.error('Error fetching community details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityData();
  }, [id]);

  const handleJoinLeave = async () => {
    if (!user) {
      addToast('Please log in to join communities.', 'info');
      return;
    }

    try {
      if (isMember) {
        await communityAPI.leave(id);
        setIsMember(false);
        addToast(`You have left ${community.name}.`, 'info');
      } else {
        await communityAPI.join(id);
        setIsMember(true);
        addToast(`Welcome to ${community.name}!`, 'success');
      }
      fetchCommunityData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please log in to post.', 'info');
      return;
    }

    setPosting(true);
    try {
      const res = await communityAPI.createPost(id, {
        title: postTitle,
        content: postContent,
        tags: postTags ? postTags.split(',').map(t => t.trim()).filter(Boolean) : [],
        isAnnouncement
      });

      if (res.data.success) {
        addToast('Post published in community!', 'success');
        setShowPostModal(false);
        setPostTitle('');
        setPostContent('');
        setPostTags('');
        setIsAnnouncement(false);
        // Refresh posts
        const updatedPosts = await communityAPI.getPosts(id);
        setPosts(updatedPosts.data.posts);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setPosting(false);
    }
  };

  const handleLikePost = async (postId) => {
    if (!user) {
      addToast('Please log in to like posts.', 'info');
      return;
    }

    try {
      const res = await communityAPI.likePost(postId);
      if (res.data.success) {
        setPosts(prev => prev.map(p => {
          if (p._id === postId) {
            const likes = p.likes || [];
            const userIndex = likes.findIndex(u => (u._id || u) === user._id);
            let newLikes;
            if (userIndex > -1) {
              newLikes = likes.filter(u => (u._id || u) !== user._id);
            } else {
              newLikes = [...likes, user._id];
            }
            return { ...p, likes: newLikes };
          }
          return p;
        }));
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    if (!user) {
      addToast('Please log in to comment.', 'info');
      return;
    }

    try {
      const res = await communityAPI.addComment(postId, { content: text });
      if (res.data.success) {
        setCommentInputs({ ...commentInputs, [postId]: '' });
        // Refresh posts
        const updatedPosts = await communityAPI.getPosts(id);
        setPosts(updatedPosts.data.posts);
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <p>Loading community discussion hub...</p>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Community Not Found</h2>
        <Link to="/communities" className="btn btn-primary" style={{ marginTop: 20 }}>
          Back to Communities
        </Link>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ paddingTop: 32 }}>
      <div className="container">
        
        <Link to="/communities" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: '13.5px', marginBottom: 20 }}>
          <ArrowLeft size={16} /> Back to all communities
        </Link>

        {/* Community Banner Card */}
        <div className="card" style={{ padding: '32px', marginBottom: 28 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <CategoryBadge category={community.category} size="md" />
                <span className="badge badge-teal">
                  <Users size={12} /> {members.length} Members
                </span>
              </div>

              <h1 style={{ fontSize: '2rem', color: 'var(--color-navy)', marginBottom: 10 }}>
                {community.name}
              </h1>

              <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.6, maxWidth: 780 }}>
                {community.description}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                onClick={handleJoinLeave}
                className={`btn ${isMember ? 'btn-outline' : 'btn-primary'}`}
              >
                {isMember ? 'Leave Community' : 'Join Community'}
              </button>

              <button
                onClick={() => setShowPostModal(true)}
                className="btn btn-navy"
              >
                <PlusCircle size={16} /> New Discussion
              </button>
            </div>
          </div>
        </div>

        {/* Main Feed & Sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }} className="comm-grid">
          
          {/* Discussions Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)' }}>
              Community Discussions & Announcements ({posts.length})
            </h3>

            {posts.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <MessageSquare size={36} color="var(--color-teal)" style={{ margin: '0 auto 12px' }} />
                <h4>No discussions posted yet</h4>
                <p style={{ color: 'var(--color-text-secondary)', margin: '8px 0 16px', fontSize: '13.5px' }}>
                  Start an educational conversation, share a research link, or ask a question to fellow members!
                </p>
                <button onClick={() => setShowPostModal(true)} className="btn btn-primary btn-sm">
                  Start First Discussion
                </button>
              </div>
            ) : (
              posts.map(post => {
                const userHasLiked = user && (post.likes || []).some(u => (u._id || u) === user._id);
                return (
                  <div key={post._id} className="card" style={{ padding: '24px' }}>
                    {/* Post Author & Announcement Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img
                          src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'User')}&background=176B87&color=ffffff`}
                          alt={post.author?.name}
                          style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-navy)' }}>
                            {post.author?.name || 'Community Member'}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {post.isAnnouncement && (
                        <span className="badge badge-warning" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <BellRing size={12} /> Announcement
                        </span>
                      )}
                    </div>

                    {/* Title & Content */}
                    <h4 style={{ fontSize: '1.15rem', color: 'var(--color-navy)', marginBottom: 8 }}>
                      {post.title}
                    </h4>

                    <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 16, whiteSpace: 'pre-line' }}>
                      {post.content}
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                        {post.tags.map(t => (
                          <span key={t} className="badge badge-neutral" style={{ fontSize: '11px' }}>
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Like & Comment bar */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 20,
                      paddingTop: 12,
                      borderTop: '1px solid var(--color-border-subtle)',
                      fontSize: '13px',
                      color: 'var(--color-text-muted)'
                    }}>
                      <button
                        onClick={() => handleLikePost(post._id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          color: userHasLiked ? 'var(--color-danger)' : 'var(--color-text-muted)',
                          cursor: 'pointer',
                          fontWeight: 500,
                          fontSize: '13px'
                        }}
                      >
                        <Heart size={16} fill={userHasLiked ? 'var(--color-danger)' : 'none'} />
                        <span>{post.likes?.length || 0} Likes</span>
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MessageSquare size={16} />
                        <span>{post.comments?.length || 0} Comments</span>
                      </div>
                    </div>

                    {/* Comments List */}
                    {post.comments && post.comments.length > 0 && (
                      <div style={{
                        marginTop: 16,
                        paddingTop: 14,
                        borderTop: '1px solid var(--color-border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12
                      }}>
                        {post.comments.map((c, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10, fontSize: '13px' }}>
                            <img
                              src={c.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.author?.name || 'User')}&background=142B3B&color=ffffff`}
                              alt={c.author?.name}
                              style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                            />
                            <div style={{
                              backgroundColor: 'var(--color-bg)',
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-md)',
                              flex: 1
                            }}>
                              <span style={{ fontWeight: 600, color: 'var(--color-navy)', marginRight: 6 }}>
                                {c.author?.name || 'Member'}:
                              </span>
                              <span style={{ color: 'var(--color-text-secondary)' }}>{c.content}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment input */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Write a comment..."
                        value={commentInputs[post._id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddComment(post._id);
                          }
                        }}
                        style={{ fontSize: '13px', padding: '8px 12px' }}
                      />
                      <button
                        onClick={() => handleAddComment(post._id)}
                        className="btn btn-outline-teal btn-sm"
                      >
                        <Send size={14} />
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar: Guidelines & Members */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Rules */}
            <div className="card">
              <h4 style={{ fontSize: '1.05rem', color: 'var(--color-navy)', marginBottom: 12 }}>
                Community Guidelines
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                {(community.rules || []).map((rule, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: 8 }}>
                    <CheckCircle size={15} color="var(--color-teal)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Members */}
            <div className="card">
              <h4 style={{ fontSize: '1.05rem', color: 'var(--color-navy)', marginBottom: 14 }}>
                Community Members ({members.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {members.slice(0, 6).map((m, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img
                      src={m.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.user?.name || 'Member')}&background=176B87&color=ffffff`}
                      alt={m.user?.name}
                      style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, fontSize: '13px' }}>
                      <Link to={`/people/${m.user?._id || m.user}`} style={{ fontWeight: 600, color: 'var(--color-navy)', textDecoration: 'none' }}>
                        {m.user?.name || 'Member'}
                      </Link>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {m.role || 'Member'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* New Post Modal */}
      <Modal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        title={`Share with ${community.name}`}
      >
        <form onSubmit={handleCreatePost}>
          <div className="form-group">
            <label className="form-label">Discussion Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Recommended Open-Access Machine Learning Datasets"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Content / Discussion Statement *</label>
            <textarea
              className="form-textarea"
              rows={5}
              placeholder="Share insights, educational resources, project updates, or questions..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Research, Tutorial, Python"
              value={postTags}
              onChange={(e) => setPostTags(e.target.value)}
            />
          </div>

          {user && (community.creator?._id === user._id || user.roles?.includes('Administrator')) && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', cursor: 'pointer', marginBottom: 20 }}>
              <input
                type="checkbox"
                checked={isAnnouncement}
                onChange={(e) => setIsAnnouncement(e.target.checked)}
              />
              <span style={{ fontWeight: 500, color: 'var(--color-navy)' }}>Mark as Community Announcement</span>
            </label>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowPostModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={posting}>
              {posting ? 'Posting...' : 'Post to Community'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        @media (max-width: 860px) {
          .comm-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
