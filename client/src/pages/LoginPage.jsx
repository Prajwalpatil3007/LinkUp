import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../services/api';
import Modal from '../components/Modal';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1: send token, 2: enter token & new password
  const [forgotLoading, setForgotLoading] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      addToast('Welcome back to LinkUp!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPass = 'Password123!') => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      const res = await authAPI.forgotPassword(forgotEmail);
      if (res.data.success) {
        setResetToken(res.data.resetToken || '');
        setResetStep(2);
        addToast(res.data.message, 'info');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetToken || !newPassword) return;
    setForgotLoading(true);
    try {
      const res = await authAPI.resetPassword({
        email: forgotEmail,
        resetToken,
        newPassword
      });
      if (res.data.success) {
        addToast('Password reset successfully! Please log in.', 'success');
        setShowForgotModal(false);
        setResetStep(1);
        setEmail(forgotEmail);
        setPassword(newPassword);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      backgroundColor: 'var(--color-bg)'
    }}>
      <div className="card" style={{ maxWidth: 460, width: '100%', padding: '36px 32px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-navy)',
            color: '#FFFFFF',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12
          }}>
            <Lock size={22} color="var(--color-teal)" />
          </div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--color-navy)' }}>Log In to LinkUp</h2>
          <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginTop: 4 }}>
            Access your collaborative dashboard, opportunities, and messages.
          </p>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13.5px',
            marginBottom: 20,
            border: '1px solid #FCA5A5'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={17} color="var(--color-text-light)" style={{ position: 'absolute', left: 14, top: 13 }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: 42 }}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setShowForgotModal(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-teal)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={17} color="var(--color-text-light)" style={{ position: 'absolute', left: 14, top: 13 }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: 42 }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ width: '100%', marginTop: 8, padding: '12px 0' }}
          >
            {submitting ? 'Authenticating...' : 'Sign In to LinkUp'}
          </button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Instant Demo Sign-In
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '12px', justifyContent: 'flex-start' }}
              onClick={() => fillDemoAccount('admin@linkup.org')}
            >
              <ShieldCheck size={14} color="#B45309" /> Admin
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '12px', justifyContent: 'flex-start' }}
              onClick={() => fillDemoAccount('sarah.chen@university.edu')}
            >
              <UserCheck size={14} color="var(--color-teal)" /> Student
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '12px', justifyContent: 'flex-start' }}
              onClick={() => fillDemoAccount('robert.martinez@gmail.com')}
            >
              <UserCheck size={14} color="#0284C7" /> Resident
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '12px', justifyContent: 'flex-start' }}
              onClick={() => fillDemoAccount('priya.sharma@techlead.io')}
            >
              <UserCheck size={14} color="#4F46E5" /> Mentor
            </button>
          </div>
        </div>

        {/* Register link */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '13.5px', color: 'var(--color-text-secondary)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ fontWeight: 600, color: 'var(--color-teal)' }}>
            Create an Account
          </Link>
        </div>

      </div>

      {/* Forgot / Reset Password Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => {
          setShowForgotModal(false);
          setResetStep(1);
        }}
        title="Reset LinkUp Password"
        maxWidth={460}
      >
        {resetStep === 1 ? (
          <form onSubmit={handleForgotPassword}>
            <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginBottom: 16 }}>
              Enter your registered email address and we will generate a secure password reset token for you.
            </p>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowForgotModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={forgotLoading}
              >
                {forgotLoading ? 'Processing...' : 'Send Reset Code'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div style={{
              backgroundColor: 'var(--color-info-bg)',
              color: '#1E40AF',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              marginBottom: 16
            }}>
              One-time reset code: <strong>{resetToken}</strong>
            </div>

            <div className="form-group">
              <label className="form-label">Reset Token / Code</label>
              <input
                type="text"
                className="form-input"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setResetStep(1)}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={forgotLoading}
              >
                {forgotLoading ? 'Updating...' : 'Set New Password'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
