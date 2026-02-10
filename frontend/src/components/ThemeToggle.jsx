import { useState, useEffect } from 'react';

function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div
      onClick={toggleTheme}
      style={{
        position: 'relative',
        width: '50px',
        height: '24px',
        background: 'transparent',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'var(--transition)',
        border: '2px solid var(--primary-gold)'
      }}
      title={theme === 'dark' ? 'Modo oscuro' : 'Modo claro'}
    >
      <div
        style={{
          position: 'absolute',
          top: '2px',
          left: theme === 'dark' ? '2px' : '26px',
          width: '16px',
          height: '16px',
          background: 'var(--primary-gold)',
          borderRadius: '50%',
          transition: 'var(--transition)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '12px'
        }}
      >
        {theme === 'dark' ? '🌙' : '☀'}
      </div>
    </div>
  );
}

export default ThemeToggle;
