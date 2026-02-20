import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import GestionServicios from './GestionServicios';
import GestionEmpleados from './GestionEmpleados';
import GestionBloqueos from './GestionBloqueos';
import GestionReportes from './GestionReportes';
import Configuracion from './Configuracion';
import ThemeToggle from '../../components/ThemeToggle';

// Función helper para formatear fechas correctamente
const formatearFecha = (fechaString) => {
  try {
    if (!fechaString) return 'N/A';
    // Dividir la fecha en partes [año, mes, día]
    const partes = fechaString.split('-').map(n => parseInt(n, 10));
    if (partes.length !== 3) return 'Fecha inválida';
    
    // Crear fecha local sin problemas de zona horaria
    const fecha = new Date(partes[0], partes[1] - 1, partes[2]);
    
    return fecha.toLocaleDateString('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Fecha inválida';
  }
};

// Componente para gestión de citas con diseño premium
function GestionCitas() {
  const [citas, setCitas] = useState([]);
  const [citasFiltradas, setCitasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busquedaNombre, setBusquedaNombre] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargarCitas();
  }, [filtroEstado]);

  useEffect(() => {
    // Filtrar por nombre cuando cambie la búsqueda
    if (busquedaNombre.trim() === '') {
      setCitasFiltradas(citas);
    } else {
      const filtradas = citas.filter(cita => 
        cita.cliente_nombre.toLowerCase().includes(busquedaNombre.toLowerCase())
      );
      setCitasFiltradas(filtradas);
    }
  }, [busquedaNombre, citas]);

  const cargarCitas = async () => {
    try {
      const response = await adminAPI.obtenerCitas(filtroEstado);
      setCitas(response.data);
      setCitasFiltradas(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id, accion) => {
    try {
      if (accion === 'confirmar') {
        await adminAPI.confirmarCita(id);
        setMensaje('Cita confirmada exitosamente');
      }
      if (accion === 'cancelar') {
        const motivo = prompt('Ingresá el motivo de la cancelación:');
        if (!motivo) return; // Si cancela el prompt, no hace nada
        await adminAPI.cancelarCita(id, { motivo });
        setMensaje('Cita cancelada');
      }
      if (accion === 'completar') {
        await adminAPI.completarCita(id);
        setMensaje('Cita completada');
      }
      cargarCitas();
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      alert('Error al cambiar estado');
    }
  };

  if (loading) return <div className="loading">Cargando citas...</div>;

  return (
    <div className="fade-in">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <h2 style={{ margin: 0 }}>Gestión de Citas</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ color: 'var(--neutral-light)', fontWeight: '500' }}>
              Buscar:
            </label>
            <input
              type="text"
              placeholder="Nombre del cliente..."
              value={busquedaNombre}
              onChange={(e) => setBusquedaNombre(e.target.value)}
              style={{ 
                minWidth: '200px',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--neutral-gray)',
                background: 'var(--neutral-dark)',
                color: 'var(--neutral-light)'
              }}
            />
            {busquedaNombre && (
              <button
                onClick={() => setBusquedaNombre('')}
                style={{
                  padding: '0.5rem',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--neutral-silver)',
                  cursor: 'pointer',
                  fontSize: '1.2rem'
                }}
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ color: 'var(--neutral-light)', fontWeight: '500' }}>
              Estado:
            </label>
            <select 
              value={filtroEstado} 
              onChange={(e) => setFiltroEstado(e.target.value)}
              style={{ minWidth: '180px' }}
            >
              <option value="">Todas las Citas</option>
              <option value="pendiente">Pendientes</option>
              <option value="confirmada">Confirmadas</option>
              <option value="cancelada">Canceladas</option>
              <option value="completada">Completadas</option>
            </select>
          </div>
        </div>
      </div>

      {busquedaNombre && (
        <div style={{ 
          marginBottom: '1rem', 
          color: 'var(--neutral-silver)',
          fontSize: '0.9rem'
        }}>
          {citasFiltradas.length === 0 ? (
            <span>❌ No se encontraron citas con "{busquedaNombre}"</span>
          ) : (
            <span>🔍 Mostrando {citasFiltradas.length} resultado(s) para "{busquedaNombre}"</span>
          )}
        </div>
      )}

      {mensaje && (
        <div className="success-message" style={{ marginBottom: '1.5rem' }}>
          ✓ {mensaje}
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th style={{ minWidth: '140px' }}>Cliente</th>
              <th style={{ width: '120px' }}>Teléfono</th>
              <th style={{ minWidth: '130px' }}>Fecha</th>
              <th style={{ width: '80px' }}>Hora</th>
              <th style={{ minWidth: '100px' }}>Servicio</th>
              <th style={{ minWidth: '120px' }}>Barbero</th>
              <th style={{ width: '100px' }}>Estado</th>
              <th style={{ minWidth: '180px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {citasFiltradas.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-silver)' }}>
                  {busquedaNombre ? 
                    `No se encontraron citas para "${busquedaNombre}"` : 
                    `No hay citas ${filtroEstado ? `en estado "${filtroEstado}"` : 'registradas'}`
                  }
                </td>
              </tr>
            ) : (
              citasFiltradas.map((cita) => (
                <tr key={cita.id}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{cita.cliente_nombre}</div>
                  </td>
                  <td style={{ fontWeight: '500' }}>
                    {cita.cliente_telefono}
                  </td>
                  <td style={{ 
                    fontWeight: '600', 
                    fontSize: '0.95rem',
                    whiteSpace: 'nowrap',
                    padding: '1rem'
                  }}>
                    {formatearFecha(cita.fecha)}
                  </td>
                  <td style={{ fontSize: '1.1rem', fontWeight: 'bold', textAlign: 'center' }}>
                    {cita.hora.substring(0, 5)}
                  </td>
                  <td>{cita.servicio_nombre}</td>
                  <td>{cita.empleado_nombre}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge badge-${cita.estado}`}>
                      {cita.estado}
                    </span>
                  </td>
                  <td>
                    <div style={{ 
                      display: 'flex', 
                      gap: '0.5rem', 
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      {/* Estado: PENDIENTE - Solo confirmar o cancelar */}
                      {cita.estado === 'pendiente' && (
                        <>
                          <button 
                            onClick={() => cambiarEstado(cita.id, 'confirmar')}
                            className="btn btn-primary" 
                            style={{ 
                              padding: '0.5rem 1rem', 
                              fontSize: '0.85rem',
                              minWidth: '90px'
                            }}
                          >
                            ✓ Confirmar
                          </button>
                          <button 
                            onClick={() => cambiarEstado(cita.id, 'cancelar')}
                            className="btn btn-danger" 
                            style={{ 
                              padding: '0.5rem 1rem', 
                              fontSize: '0.85rem',
                              minWidth: '90px'
                            }}
                          >
                            ✗ Cancelar
                          </button>
                        </>
                      )}
                      
                      {/* Estado: CONFIRMADA - Completar o cancelar */}
                      {cita.estado === 'confirmada' && (
                        <>
                          <button 
                            onClick={() => cambiarEstado(cita.id, 'completar')}
                            className="btn btn-primary" 
                            style={{ 
                              padding: '0.5rem 1rem', 
                              fontSize: '0.85rem',
                              minWidth: '90px'
                            }}
                          >
                            ✓ Completar
                          </button>
                          <button 
                            onClick={() => cambiarEstado(cita.id, 'cancelar')}
                            className="btn btn-danger" 
                            style={{ 
                              padding: '0.5rem 1rem', 
                              fontSize: '0.85rem',
                              minWidth: '90px'
                            }}
                          >
                            ✗ Cancelar
                          </button>
                        </>
                      )}
                      
                      {/* Estado: COMPLETADA - Sin acciones */}
                      {cita.estado === 'completada' && (
                        <span style={{ 
                          color: 'var(--neutral-silver)', 
                          fontSize: '0.85rem',
                          fontStyle: 'italic'
                        }}>
                          Servicio completado
                        </span>
                      )}
                      
                      {/* Estado: CANCELADA - Reactivar como confirmada */}
                      {cita.estado === 'cancelada' && (
                        <button 
                          onClick={() => cambiarEstado(cita.id, 'confirmar')}
                          className="btn btn-primary" 
                          style={{ 
                            padding: '0.5rem 1rem', 
                            fontSize: '0.85rem',
                            minWidth: '90px'
                          }}
                        >
                          ↻ Reactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem',
        background: 'var(--neutral-dark)',
        borderRadius: '6px',
        border: '1px solid var(--neutral-gray)'
      }}>
        <h4 style={{ marginBottom: '1rem', color: 'var(--primary-gold)' }}>
          Estadísticas
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-gold)' }}>
              {citas.length}
            </div>
            <div style={{ color: 'var(--neutral-silver)', fontSize: '0.9rem' }}>
              Total Citas
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffd54f' }}>
              {citas.filter(c => c.estado === 'pendiente').length}
            </div>
            <div style={{ color: 'var(--neutral-silver)', fontSize: '0.9rem' }}>
              Pendientes
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#64b5f6' }}>
              {citas.filter(c => c.estado === 'confirmada').length}
            </div>
            <div style={{ color: 'var(--neutral-silver)', fontSize: '0.9rem' }}>
              Confirmadas
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#81c784' }}>
              {citas.filter(c => c.estado === 'completada').length}
            </div>
            <div style={{ color: 'var(--neutral-silver)', fontSize: '0.9rem' }}>
              Completadas
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard principal con diseño premium
function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [seccionActiva, setSeccionActiva] = useState('citas');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminData = localStorage.getItem('admin');
    
    if (!token || !adminData) {
      navigate('/admin/login');
      return;
    }
    
    setAdmin(JSON.parse(adminData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    navigate('/');
  };

  if (!admin) return null;

  // Renderizar contenido según sección activa
  const renderContenido = () => {
    switch(seccionActiva) {
      case 'citas':
        return <GestionCitas />;
      case 'servicios':
        return <GestionServicios />;
      case 'empleados':
        return <GestionEmpleados />;
      case 'bloqueos':
        return <GestionBloqueos />;
      case 'reportes':
        return <GestionReportes />;
      case 'configuracion':
        return <Configuracion />;
      default:
        return <GestionCitas />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', overflow: 'hidden' }}>
      {/* Header Premium */}
      <nav style={{
        background: 'var(--neutral-dark)',
        borderBottom: '1px solid var(--primary-gold)',
        padding: '1rem 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{
          maxWidth: '100%',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center'
        }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(1rem, 3vw, 1.3rem)', color: 'var(--primary-gold)', marginRight: 'auto' }}>HIGHBURY BARBER - ADMIN</h1>
          
          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="desktop-only">
            <ThemeToggle />
            <button 
              onClick={handleLogout} 
              className="btn btn-danger"
              style={{ padding: '0.7rem 1.5rem', fontSize: '0.9rem' }}
            >
              Cerrar Sesión
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
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
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{
            display: 'block',
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--neutral-gray)'
          }} className="mobile-only">
            <div style={{ padding: '0.75rem 0' }}>
              <ThemeToggle />
            </div>
            <button 
              onClick={handleLogout} 
              className="btn btn-danger"
              style={{ padding: '0.7rem 1.5rem', width: '100%', marginTop: '1rem' }}
            >
              Cerrar Sesión
            </button>
          </div>
        )}

        <style>{
          `@media (min-width: 769px) {
            .mobile-only { display: none !important; }
          }
          @media (max-width: 768px) {
            .desktop-only { display: none !important; }
            .mobile-only { display: block !important; }
          }`
        }</style>
      </nav>

      <div className="admin-layout" style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', overflow: 'hidden' }}>
        {/* Sidebar Premium */}
        <div className="admin-sidebar" style={{ 
          width: '220px', 
          background: 'var(--neutral-charcoal)',
          borderRight: '1px solid var(--neutral-gray)',
          padding: '2rem 0'
        }}>
          <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
            <h3 style={{ 
              color: 'var(--primary-gold)', 
              fontSize: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '1.5rem'
            }}>
              Menú Principal
            </h3>
          </div>
          
          <nav style={{ display: 'flex', flexDirection: 'column' }}>
            <button 
              onClick={() => setSeccionActiva('citas')}
              style={{ 
                color: seccionActiva === 'citas' ? 'var(--primary-gold)' : 'var(--neutral-light)',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                padding: '0.9rem 1rem',
                borderLeft: seccionActiva === 'citas' ? '4px solid var(--primary-gold)' : '4px solid transparent',
                backgroundColor: seccionActiva === 'citas' ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                fontWeight: seccionActiva === 'citas' ? '600' : '400',
                transition: 'var(--transition)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                fontSize: '0.95rem'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>📅</span>
              <span>Citas</span>
            </button>
            
            <button 
              onClick={() => setSeccionActiva('servicios')}
              style={{ 
                color: seccionActiva === 'servicios' ? 'var(--primary-gold)' : 'var(--neutral-light)',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                padding: '0.9rem 1rem',
                borderLeft: seccionActiva === 'servicios' ? '4px solid var(--primary-gold)' : '4px solid transparent',
                backgroundColor: seccionActiva === 'servicios' ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                fontWeight: seccionActiva === 'servicios' ? '600' : '400',
                transition: 'var(--transition)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                fontSize: '0.95rem'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>✂️</span>
              <span>Servicios</span>
            </button>
            
            <button 
              onClick={() => setSeccionActiva('empleados')}
              style={{ 
                color: seccionActiva === 'empleados' ? 'var(--primary-gold)' : 'var(--neutral-light)',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                padding: '0.9rem 1rem',
                borderLeft: seccionActiva === 'empleados' ? '4px solid var(--primary-gold)' : '4px solid transparent',
                backgroundColor: seccionActiva === 'empleados' ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                fontWeight: seccionActiva === 'empleados' ? '600' : '400',
                transition: 'var(--transition)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                fontSize: '0.95rem'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>👥</span>
              <span>Empleados</span>
            </button>
            
            <button 
              onClick={() => setSeccionActiva('bloqueos')}
              style={{ 
                color: seccionActiva === 'bloqueos' ? 'var(--primary-gold)' : 'var(--neutral-light)',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                padding: '0.9rem 1rem',
                borderLeft: seccionActiva === 'bloqueos' ? '4px solid var(--primary-gold)' : '4px solid transparent',
                backgroundColor: seccionActiva === 'bloqueos' ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                fontWeight: seccionActiva === 'bloqueos' ? '600' : '400',
                transition: 'var(--transition)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                fontSize: '0.95rem'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🚫</span>
              <span>Bloqueos</span>
            </button>
            
            <button 
              onClick={() => setSeccionActiva('reportes')}
              style={{ 
                color: seccionActiva === 'reportes' ? 'var(--primary-gold)' : 'var(--neutral-light)',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                padding: '0.9rem 1rem',
                borderLeft: seccionActiva === 'reportes' ? '4px solid var(--primary-gold)' : '4px solid transparent',
                backgroundColor: seccionActiva === 'reportes' ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                fontWeight: seccionActiva === 'reportes' ? '600' : '400',
                transition: 'var(--transition)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                fontSize: '0.95rem'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>📊</span>
              <span>Reportes</span>
            </button>
            
            <button 
              onClick={() => setSeccionActiva('configuracion')}
              style={{ 
                color: seccionActiva === 'configuracion' ? 'var(--primary-gold)' : 'var(--neutral-light)',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                padding: '0.9rem 1rem',
                borderLeft: seccionActiva === 'configuracion' ? '4px solid var(--primary-gold)' : '4px solid transparent',
                backgroundColor: seccionActiva === 'configuracion' ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                fontWeight: seccionActiva === 'configuracion' ? '600' : '400',
                transition: 'var(--transition)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                fontSize: '0.95rem'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>⚙️</span>
              <span>Configuración</span>
            </button>
            
            <Link 
              to="/" 
              style={{ 
                color: 'var(--neutral-light)',
                textDecoration: 'none',
                padding: '0.9rem 1rem',
                borderLeft: '4px solid transparent',
                fontWeight: '400',
                transition: 'var(--transition)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                marginTop: '1rem',
                borderTop: '1px solid var(--neutral-gray)',
                fontSize: '0.95rem'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🏠</span>
              <span>Sitio Web</span>
            </Link>
          </nav>
        </div>

        {/* Contenido principal */}
        <div className="admin-content" style={{ 
          flex: 1, 
          padding: '2.5rem', 
          background: 'var(--bg-dark)',
          overflowY: 'auto'
        }}>
          <div className="fade-in">
            {renderContenido()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
