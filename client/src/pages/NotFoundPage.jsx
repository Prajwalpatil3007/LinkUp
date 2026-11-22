import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh' }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-teal-light)',
        color: 'var(--color-teal)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20
      }}>
        <Compass size={32} />
      </div>

      <h1 style={{ fontSize: '2.4rem', color: 'var(--color-navy)', marginBottom: 12 }}>
        Page Not Found
      </h1>

      <p style={{ color: 'var(--color-text-secondary)', maxWidth: 460, margin: '0 auto 28px', fontSize: '15px' }}>
        The link you followed may be broken or the opportunity or community page may have been moved.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        <Link to="/" className="btn btn-navy">
          <ArrowLeft size={16} /> Return to Homepage
        </Link>
        <Link to="/explore" className="btn btn-primary">
          Explore Opportunities
        </Link>
      </div>
    </div>
  );
}
