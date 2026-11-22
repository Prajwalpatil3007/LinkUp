import React from 'react';
import { Link } from 'react-router-dom';
import { APPROVED_CATEGORIES } from '../utils/constants';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--color-navy)',
      color: '#FFFFFF',
      paddingTop: '60px',
      paddingBottom: '30px',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          paddingBottom: '40px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Brand info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#FFFFFF', fontFamily: 'var(--font-display)' }}>
                Link<span style={{ color: '#5eead4' }}>Up</span>
              </span>
            </div>

            <p style={{ color: '#94A3B8', fontSize: '13.5px', lineHeight: 1.6, marginBottom: 16 }}>
              A unified platform connecting students, residents, professionals, NGOs, educational institutions, and startups for collaborative community impact.
            </p>

            <div style={{
              fontSize: '12px',
              fontStyle: 'italic',
              color: '#38BDF8',
              lineHeight: 1.5,
              padding: '8px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-sm)'
            }}>
              "Discover Opportunities. Connect with People. Create an Impact."
            </div>
          </div>

          {/* Quick Platform Navigation */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '14px', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Platform Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '13.5px' }}>
              <li><Link to="/explore" style={{ color: '#CBD5E1' }}>Explore Opportunities</Link></li>
              <li><Link to="/explore?isAssistanceRequest=true" style={{ color: '#CBD5E1' }}>Community Assistance Requests</Link></li>
              <li><Link to="/projects" style={{ color: '#CBD5E1' }}>Projects & Collaboration</Link></li>
              <li><Link to="/communities" style={{ color: '#CBD5E1' }}>Join Communities</Link></li>
              <li><Link to="/people" style={{ color: '#CBD5E1' }}>People Discovery & Matching</Link></li>
              <li><Link to="/organizations" style={{ color: '#CBD5E1' }}>Verified Organisations</Link></li>
              <li><Link to="/knowledge" style={{ color: '#CBD5E1' }}>Knowledge Centre</Link></li>
            </ul>
          </div>

          {/* Approved Focus Areas */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '14px', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Approved Focus Fields
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '12.5px' }}>
              {APPROVED_CATEGORIES.map(cat => (
                <li key={cat}>
                  <Link to={`/explore?category=${encodeURIComponent(cat)}`} style={{ color: '#94A3B8' }}>
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* User Segments & Safety */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '14px', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Community Standards
            </h4>
            <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: 1.6, marginBottom: 12 }}>
              LinkUp exclusively supports verified academic, digital awareness, social service, startup, professional, ecological, financial, and public health initiatives.
            </p>
            <div style={{ fontSize: '12px', color: '#64748B' }}>
              <div>• Zero spam & transparent privacy</div>
              <div>• Verified NGO & institution badges</div>
              <div>• Role-based permission controls</div>
            </div>
          </div>
        </div>

        {/* Copyright and system font acknowledgment */}
        <div style={{
          paddingTop: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          fontSize: '12.5px',
          color: '#64748B'
        }}>
          <div>
            © {new Date().getFullYear()} LinkUp. All rights reserved. Connecting Students and Communities.
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <span style={{ color: '#94A3B8' }}>Styled with Apple San Francisco Native Typography</span>
            <span>•</span>
            <Link to="/explore" style={{ color: '#94A3B8' }}>Privacy Policy</Link>
            <span>•</span>
            <Link to="/explore" style={{ color: '#94A3B8' }}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
