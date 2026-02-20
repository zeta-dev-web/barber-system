import { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const isLoggedIn = !!localStorage.getItem('token');
  const adminLink = isLoggedIn ? '/admin' : '/admin/login';
  const adminText = isLoggedIn ? 'Panel Admin' : 'Administración';

  return (
    <nav style={{
      background: 'var(--neutral-dark)',
      borderBottom: '1px solid var(--primary-gold)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center'
      }}>
        {/* Logo */}
        <Link to="/" style={{
          fontSize: '1.3rem',
          fontWeight: 'bold',
          color: 'var(--primary-gold)',
          textDecoration: 'none',
          marginRight: 'auto'
        }}>
          HIGHBURY BARBER
        </Link>

        {/* Desktop Menu */}
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'center'
        }} className="desktop-only">
          <Link to="/" style={{ color: 'var(--neutral-silver)', textDecoration: 'none' }}>Inicio</Link>
          <Link to="/reservar" style={{ color: 'var(--neutral-silver)', textDecoration: 'none' }}>Reservar Cita</Link>
          <Link to={adminLink} style={{ color: 'var(--neutral-silver)', textDecoration: 'none' }}>{adminText}</Link>
          <ThemeToggle />
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary-gold)',
            fontSize: '1.8rem',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'none'
          }}
          className="mobile-only"
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div style={{
          display: 'block',
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--neutral-gray)'
        }} className="mobile-only">
          <Link to="/" onClick={() => setIsOpen(false)} style={{ color: 'var(--neutral-silver)', textDecoration: 'none', padding: '0.75rem 0', display: 'block' }}>Inicio</Link>
          <Link to="/reservar" onClick={() => setIsOpen(false)} style={{ color: 'var(--neutral-silver)', textDecoration: 'none', padding: '0.75rem 0', display: 'block' }}>Reservar Cita</Link>
          <Link to={adminLink} onClick={() => setIsOpen(false)} style={{ color: 'var(--neutral-silver)', textDecoration: 'none', padding: '0.75rem 0', display: 'block' }}>{adminText}</Link>
          <div style={{ padding: '0.75rem 0' }}>
            <ThemeToggle />
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 769px) {
          .mobile-only {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-only {
            display: block !important;
          }
        }
        .desktop-only a:hover {
          color: var(--primary-gold) !important;
          transition: color 0.3s ease;
        }
      `}</style>
    </nav>
  );
}

export default Navbar;
