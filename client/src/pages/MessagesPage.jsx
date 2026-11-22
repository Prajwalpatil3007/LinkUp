import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { messageAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  MessageSquare, 
  Send, 
  User, 
  Clock, 
  Search, 
  ArrowLeft, 
  ShieldAlert 
} from 'lucide-react';

export default function MessagesPage() {
  const [searchParams] = useSearchParams();
  const directUserId = searchParams.get('user');

  const { user } = useAuth();
  const { addToast } = useToast();

  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const fetchConversations = async () => {
    setLoadingConv(true);
    try {
      const res = await messageAPI.getConversations();
      if (res.data.success) {
        setConversations(res.data.conversations);

        // If directUserId is passed in URL, check if in conversations or fetch user directly
        if (directUserId && directUserId !== user?._id) {
          const existing = res.data.conversations.find(c => c.partner?._id === directUserId);
          if (existing) {
            setActivePartner(existing.partner);
          } else {
            // Load direct partner profile
            const userRes = await userAPI.getUserById(directUserId);
            if (userRes.data.success) {
              setActivePartner(userRes.data.user);
            }
          }
        } else if (!activePartner && res.data.conversations.length > 0) {
          setActivePartner(res.data.conversations[0].partner);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConv(false);
    }
  };

  const fetchMessages = async (partnerId) => {
    if (!partnerId) return;
    setLoadingMsg(true);
    try {
      const res = await messageAPI.getMessages(partnerId);
      if (res.data.success) {
        setMessages(res.data.messages);
        if (res.data.partner) {
          setActivePartner(res.data.partner);
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMsg(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [directUserId]);

  useEffect(() => {
    if (activePartner) {
      fetchMessages(activePartner._id);
    }
  }, [activePartner?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!textInput.trim() || !activePartner) return;

    const sendingText = textInput.trim();
    setTextInput('');
    setSending(true);

    try {
      const res = await messageAPI.sendMessage({
        recipientId: activePartner._id,
        text: sendingText
      });

      if (res.data.success) {
        setMessages(prev => [...prev, res.data.message]);
        fetchConversations();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="main-content" style={{ paddingTop: 32 }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-teal)', fontSize: '13px', fontWeight: 600, marginBottom: 4 }}>
            <MessageSquare size={16} /> COLLABORATION MESSAGING
          </div>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-navy)', margin: 0 }}>
            Messages & Team Communications
          </h1>
        </div>

        {/* Messaging Layout */}
        <div className="card msg-layout" style={{
          padding: 0,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          height: '640px',
          borderRadius: 'var(--radius-xl)'
        }}>
          
          {/* Left Column: Conversations List */}
          <div style={{
            borderRight: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#FAFCFE'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--color-navy)' }}>
                Conversations ({conversations.length})
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loadingConv ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                  Loading chats...
                </div>
              ) : conversations.length === 0 && !activePartner ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                  No active conversations. Reach out to a collaborator via People Discovery or Opportunity pages!
                </div>
              ) : (
                conversations.map(conv => {
                  const isActive = activePartner && activePartner._id === conv.partner?._id;
                  return (
                    <div
                      key={conv.partner?._id}
                      onClick={() => setActivePartner(conv.partner)}
                      style={{
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--color-border-subtle)',
                        backgroundColor: isActive ? 'var(--color-teal-light)' : 'transparent',
                        transition: 'background var(--transition-fast)'
                      }}
                    >
                      <img
                        src={conv.partner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.partner?.name || 'User')}&background=176B87&color=ffffff`}
                        alt={conv.partner?.name}
                        style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }}
                      />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {conv.partner?.name}
                          </span>
                          {conv.unreadCount > 0 && (
                            <span className="badge badge-teal" style={{ fontSize: '10px', padding: '1px 6px' }}>
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 3 }}>
                          {conv.lastMessage?.text || 'Started conversation'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Chat Window */}
          <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
            {activePartner ? (
              <>
                {/* Active Partner Header */}
                <div style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#FFFFFF'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={activePartner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activePartner.name || 'User')}&background=176B87&color=ffffff`}
                      alt={activePartner.name}
                      style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-navy)' }}>
                        {activePartner.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {activePartner.roles?.[0] || 'Community Member'} • {activePartner.location || 'Online'}
                      </div>
                    </div>
                  </div>

                  <Link to={`/people/${activePartner._id}`} className="btn btn-outline btn-sm">
                    View Profile
                  </Link>
                </div>

                {/* Messages Body */}
                <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {loadingMsg ? (
                    <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px', margin: 'auto' }}>
                      Loading conversation...
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13.5px', margin: 'auto', maxWidth: 360 }}>
                      Say hello to {activePartner.name}! Discuss opportunities, exchange project requirements, or offer assistance.
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isMe = (msg.sender?._id || msg.sender) === user?._id;
                      return (
                        <div
                          key={msg._id}
                          style={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '70%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isMe ? 'flex-end' : 'flex-start'
                          }}
                        >
                          <div style={{
                            padding: '10px 16px',
                            borderRadius: 'var(--radius-lg)',
                            borderBottomRightRadius: isMe ? 2 : 'var(--radius-lg)',
                            borderBottomLeftRadius: isMe ? 'var(--radius-lg)' : 2,
                            backgroundColor: isMe ? 'var(--color-teal)' : 'var(--color-bg)',
                            color: isMe ? '#FFFFFF' : 'var(--color-navy)',
                            fontSize: '14px',
                            lineHeight: 1.5,
                            boxShadow: 'var(--shadow-sm)',
                            border: isMe ? 'none' : '1px solid var(--color-border)'
                          }}>
                            {msg.text}
                          </div>

                          <span style={{ fontSize: '10.5px', color: 'var(--color-text-light)', marginTop: 4, padding: '0 4px' }}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  style={{
                    padding: '16px 20px',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    gap: 12,
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <input
                    type="text"
                    className="form-input"
                    placeholder={`Message ${activePartner.name}...`}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={sending || !textInput.trim()}
                  >
                    <Send size={16} /> Send
                  </button>
                </form>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
                <MessageSquare size={48} color="var(--color-teal)" style={{ marginBottom: 16 }} />
                <h3 style={{ color: 'var(--color-navy)' }}>Select a conversation</h3>
                <p style={{ fontSize: '13.5px', maxWidth: 360, textAlign: 'center', marginTop: 4 }}>
                  Choose a chat from the left panel or discover people to begin collaborating.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 780px) {
          .msg-layout { grid-template-columns: 1fr !important; height: auto !important; }
        }
      `}</style>
    </div>
  );
}
