import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  Compass, 
  FolderKanban, 
  Users, 
  UserCheck, 
  Building2, 
  BookOpen, 
  Bell, 
  MessageSquare, 
  PlusCircle, 
  Menu, 
  X, 
  LogOut, 
  User as UserIcon, 
  LayoutDashboard, 
  ShieldAlert, 
  FileCheck 
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const userDropdownRef = useRef();
  const notifDropdownRef = useRef();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Communities', path: '/communities', icon: Users },
    { name: 'Find People', path: '/people', icon: UserCheck },
    { name: 'Organisations', path: '/organizations', icon: Building2 },
    { name: 'Knowledge', path: '/knowledge', icon: BookOpen }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="glass-header">
      <div className="container-wide" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-navy)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(20, 43, 59, 0.2)'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '1.28rem', fontWeight: 700, color: 'var(--color-navy)', letterSpacing: '-0.025em', fontFamily: 'var(--font-display)' }}>
                Link<span style={{ color: 'var(--color-teal)' }}>Up</span>
              </span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 500, letterSpacing: '-0.01em', marginTop: -2 }}>
              Students & Communities
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="desktop-nav">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  color: active ? 'var(--color-teal)' : 'var(--color-text-secondary)',
                  backgroundColor: active ? 'var(--color-teal-light)' : 'transparent',
                  fontWeight: active ? 600 : 500,
                  fontSize: '13.5px',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons / Auth Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              {/* Quick Action: Publish */}
              <Link to="/opportunities/create" className="btn btn-primary btn-sm desktop-only">
                <PlusCircle size={15} />
                <span>Post Opportunity</span>
              </Link>

              {/* Messages shortcut */}
              <Link
                to="/messages"
                title="Messages"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  backgroundColor: '#FFFFFF',
                  position: 'relative'
                }}
              >
                <MessageSquare size={17} />
              </Link>

              {/* Notifications Dropdown */}
              <div style={{ position: 'relative' }} ref={notifDropdownRef}>
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 38,
                    height: 38,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#FFFFFF',
                    color: 'var(--color-navy)',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  aria-label="Notifications"
                >
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      backgroundColor: 'var(--color-danger)',
                      color: '#FFFFFF',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      borderRadius: 10,
                      padding: '1px 5px',
                      minWidth: 17,
                      textAlign: 'center',
                      boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Menu */}
                {notifDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 340,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--color-border)',
                    overflow: 'hidden',
                    zIndex: 100
                  }}>
                    <div style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'var(--color-bg)'
                    }}>
                      <span style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--color-navy)' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-teal)',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => {
                              if (!n.read) markAsRead(n._id);
                              if (n.link) navigate(n.link);
                              setNotifDropdownOpen(false);
                            }}
                            style={{
                              padding: '12px 16px',
                              borderBottom: '1px solid var(--color-border-subtle)',
                              backgroundColor: n.read ? '#FFFFFF' : 'var(--color-teal-subtle)',
                              cursor: 'pointer',
                              transition: 'background var(--transition-fast)'
                            }}
                          >
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-navy)', marginBottom: 2 }}>
                              {n.title}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                              {n.message}
                            </div>
                            <div style={{ fontSize: '10.5px', color: 'var(--color-text-light)', marginTop: 4 }}>
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar & Dropdown */}
              <div style={{ position: 'relative' }} ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'none',
                    border: '1px solid var(--color-border)',
                    padding: '4px 10px 4px 4px',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=176B87&color=ffffff`}
                    alt={user.name}
                    style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-navy)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 230,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--color-border)',
                    padding: '8px 0',
                    zIndex: 100
                  }}>
                    <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-border)' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-navy)' }}>{user.name}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                      <div style={{ marginTop: 4 }}>
                        <span className="badge badge-teal" style={{ fontSize: '10.5px' }}>{user.roles?.[0] || 'Member'}</span>
                      </div>
                    </div>

                    <div style={{ padding: '6px 0' }}>
                      <Link
                        to="/dashboard"
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', fontSize: '13px', color: 'var(--color-navy)' }}
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <LayoutDashboard size={15} color="var(--color-teal)" />
                        <span>My Dashboard</span>
                      </Link>

                      <Link
                        to="/profile"
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', fontSize: '13px', color: 'var(--color-navy)' }}
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <UserIcon size={15} color="var(--color-teal)" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/applications"
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', fontSize: '13px', color: 'var(--color-navy)' }}
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <FileCheck size={15} color="var(--color-teal)" />
                        <span>My Applications</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '8px 16px',
                            fontSize: '13px',
                            color: '#B45309',
                            backgroundColor: 'var(--color-warning-bg)'
                          }}
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <ShieldAlert size={15} />
                          <span style={{ fontWeight: 600 }}>Admin Console</span>
                        </Link>
                      )}
                    </div>

                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 6 }}>
                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 16px',
                          fontSize: '13px',
                          color: 'var(--color-danger)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <LogOut size={15} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link to="/login" className="btn btn-ghost btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle-btn"
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              background: 'none',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              color: 'var(--color-navy)'
            }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--color-border)',
          padding: '16px 20px',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    color: active ? 'var(--color-teal)' : 'var(--color-navy)',
                    backgroundColor: active ? 'var(--color-teal-light)' : 'transparent',
                    fontWeight: active ? 600 : 500,
                    fontSize: '14px'
                  }}
                >
                  <Icon size={18} />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {user && (
              <>
                <Link
                  to="/opportunities/create"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-teal)',
                    fontWeight: 600,
                    fontSize: '14px'
                  }}
                >
                  <PlusCircle size={18} />
                  <span>Post Opportunity</span>
                </Link>

                <div style={{ borderTop: '1px solid var(--color-border)', margin: '8px 0' }} />

                <Link to="/dashboard" style={{ padding: '8px 14px', fontSize: '13.5px', color: 'var(--color-navy)' }}>
                  Dashboard
                </Link>
                <Link to="/profile" style={{ padding: '8px 14px', fontSize: '13.5px', color: 'var(--color-navy)' }}>
                  Profile
                </Link>
                <Link to="/applications" style={{ padding: '8px 14px', fontSize: '13.5px', color: 'var(--color-navy)' }}>
                  My Applications
                </Link>
                {isAdmin && (
                  <Link to="/admin" style={{ padding: '8px 14px', fontSize: '13.5px', color: '#B45309', fontWeight: 600 }}>
                    Admin Console
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '8px 14px',
                    fontSize: '13.5px',
                    color: 'var(--color-danger)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  Log Out
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Responsive CSS for navbar */}
      <style>{`
        @media (max-width: 860px) {
          .desktop-nav, .desktop-only { display: none !important; }
          .mobile-toggle-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
