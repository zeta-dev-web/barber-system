import { useState, useEffect } from 'react';
import { empleadosAPI, horariosAPI } from '../../services/api';

function GestionEmpleados() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [empleadoEdit, setEmpleadoEdit] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [mostrarHorarios, setMostrarHorarios] = useState(null);
  const [horarios, setHorarios] = useState([]);
  
  const [formData, setFormData] = useState({
    nombre: '',
    foto: '',
    activo: true
  });
  const [archivoFoto, setArchivoFoto] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(null);

  const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const cargarEmpleados = async () => {
    try {
      const response = await empleadosAPI.obtenerTodosAdmin();
      setEmpleados(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarHorarios = async (empleadoId) => {
    try {
      const response = await horariosAPI.obtenerPorEmpleado(empleadoId);
      setHorarios(response.data);
      setMostrarHorarios(empleadoId);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, etc.)');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        return;
      }
      
      setArchivoFoto(file);
      
      // Crear vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        setVistaPrevia(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const limpiarForm = () => {
    setFormData({
      nombre: '',
      foto: '',
      activo: true
    });
    setArchivoFoto(null);
    setVistaPrevia(null);
    setEmpleadoEdit(null);
    setMostrarForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Si hay un archivo nuevo, subirlo primero
      let fotoUrl = formData.foto;
      if (archivoFoto) {
        const formDataArchivo = new FormData();
        formDataArchivo.append('foto', archivoFoto);
        
        const responseSubida = await empleadosAPI.subirFoto(formDataArchivo);
        fotoUrl = responseSubida.data.url;
      }
      
      const datosEmpleado = {
        ...formData,
        foto: fotoUrl
      };
      
      if (empleadoEdit) {
        await empleadosAPI.actualizar(empleadoEdit.id, datosEmpleado);
        setMensaje('Empleado actualizado exitosamente');
      } else {
        await empleadosAPI.crear(datosEmpleado);
        setMensaje('Empleado creado exitosamente');
      }
      cargarEmpleados();
      limpiarForm();
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      alert('Error al guardar empleado: ' + (error.response?.data?.error || error.message));
    }
  };

  const editarEmpleado = (empleado) => {
    setEmpleadoEdit(empleado);
    setFormData({
      nombre: empleado.nombre,
      foto: empleado.foto || '',
      activo: empleado.activo
    });
    // Si hay una foto existente, mostrarla como vista previa
    if (empleado.foto) {
      setVistaPrevia(`http://localhost:3000${empleado.foto}`);
    }
    setMostrarForm(true);
  };

  const eliminarEmpleado = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este empleado? Esto desactivará al empleado.')) return;
    
    try {
      await empleadosAPI.eliminar(id);
      setMensaje('Empleado eliminado');
      cargarEmpleados();
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      alert('Error al eliminar empleado');
    }
  };

  const eliminarHorario = async (horarioId, empleadoId) => {
    if (!confirm('¿Eliminar este horario?')) return;
    try {
      await horariosAPI.eliminar(horarioId);
      setMensaje('Horario eliminado');
      cargarHorarios(empleadoId);
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      alert('Error al eliminar horario');
    }
  };

  const guardarHorario = async (empleadoId, dia, horaInicio, horaFin) => {
    try {
      await horariosAPI.guardar({
        empleado_id: empleadoId,
        dia_semana: dia,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        activo: true
      });
      setMensaje('Horario guardado');
      cargarHorarios(empleadoId);
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      alert('Error al guardar horario');
    }
  };

  if (loading) return <div className="loading">Cargando empleados...</div>;

  return (
    <div className="fade-in">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ margin: 0 }}>Gestión de Empleados</h2>
        <button 
          onClick={() => setMostrarForm(!mostrarForm)}
          className="btn btn-primary"
        >
          {mostrarForm ? 'Cancelar' : '+ Nuevo Empleado'}
        </button>
      </div>

      {mensaje && (
        <div className="success-message" style={{ marginBottom: '1.5rem' }}>
          ✓ {mensaje}
        </div>
      )}

      {mostrarForm && (
        <div style={{
          background: 'var(--neutral-dark)',
          padding: '2rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          border: '1px solid var(--neutral-gray)'
        }}>
          <h3 style={{ marginTop: 0 }}>
            {empleadoEdit ? 'Editar Empleado' : 'Nuevo Empleado'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre Completo *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Foto del Empleado (opcional)</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileChange}
                style={{
                  padding: '0.5rem',
                  cursor: 'pointer'
                }}
              />
              <small style={{ color: 'var(--neutral-silver)', display: 'block', marginTop: '0.5rem' }}>
                Formatos permitidos: JPG, PNG. Tamaño máximo: 5MB
              </small>
              {vistaPrevia && (
                <div style={{ marginTop: '1rem' }}>
                  <img 
                    src={vistaPrevia} 
                    alt="Vista previa" 
                    style={{
                      maxWidth: '200px',
                      maxHeight: '200px',
                      borderRadius: '8px',
                      border: '2px solid var(--neutral-gray)',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              )}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  style={{ margin: 0, flexShrink: 0 }}
                />
                <span style={{ color: 'var(--neutral-light)', fontWeight: '500' }}>Empleado Activo</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary">
                {empleadoEdit ? 'Actualizar' : 'Crear'} Empleado
              </button>
              <button type="button" onClick={limpiarForm} className="btn btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th className="hide-mobile">ID</th>
              <th>Foto</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleados.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                  No hay empleados registrados
                </td>
              </tr>
            ) : (
              empleados.map((empleado) => (
                <>
                  <tr key={empleado.id}>
                    <td className="hide-mobile">{empleado.id}</td>
                    <td>
                      {empleado.foto ? (
                        <img 
                          src={`http://localhost:3000${empleado.foto}`} 
                          alt={empleado.nombre}
                          style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid var(--primary-gold)'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'var(--neutral-gray)',
                        display: empleado.foto ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--neutral-silver)',
                        fontSize: '1.5rem',
                        fontWeight: 'bold'
                      }}>
                        {empleado.nombre.charAt(0).toUpperCase()}
                      </div>
                    </td>
                    <td style={{ fontWeight: '600' }}>{empleado.nombre}</td>
                    <td>
                      <span className={`badge badge-${empleado.activo ? 'success' : 'secondary'}`}>
                        {empleado.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => editarEmpleado(empleado)}
                          className="btn btn-small"
                          style={{ padding: '0.4rem 0.8rem' }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => cargarHorarios(empleado.id)}
                          className="btn btn-small"
                          style={{ padding: '0.4rem 0.8rem', background: 'var(--primary-gold)', color: 'var(--neutral-dark)' }}
                        >
                          Horarios
                        </button>
                        <button
                          onClick={() => eliminarEmpleado(empleado.id)}
                          className="btn btn-secondary btn-small"
                          style={{ padding: '0.4rem 0.8rem' }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                  {mostrarHorarios === empleado.id && (
                    <tr>
                      <td colSpan="5" style={{ background: 'var(--bg-dark)', padding: '1.5rem' }}>
                        <h4 style={{ marginTop: 0, color: 'var(--primary-gold)' }}>
                          Horarios de {empleado.nombre}
                        </h4>
                        
                        {/* Horarios existentes */}
                        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                          {horarios.length === 0 ? (
                            <div style={{ 
                              padding: '2rem', 
                              textAlign: 'center', 
                              color: 'var(--neutral-silver)',
                              background: 'var(--neutral-dark)',
                              borderRadius: '6px'
                            }}>
                              No hay horarios configurados. Usa el botón "+ Agregar Día" para añadir horarios.
                            </div>
                          ) : (
                            horarios.map(horario => (
                              <div key={horario.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                background: 'var(--neutral-dark)',
                                borderRadius: '6px',
                                border: '1px solid var(--neutral-gray)'
                              }}>
                                <div style={{ 
                                  minWidth: '100px', 
                                  textTransform: 'capitalize', 
                                  fontWeight: '600',
                                  color: 'var(--primary-gold)'
                                }}>
                                  {horario.diaSemana}
                                </div>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ color: 'var(--neutral-light)' }}>{horario.horaInicio}</span>
                                  <span style={{ color: 'var(--neutral-silver)' }}>-</span>
                                  <span style={{ color: 'var(--neutral-light)' }}>{horario.horaFin}</span>
                                </div>
                                <button
                                  onClick={() => eliminarHorario(horario.id, empleado.id)}
                                  className="btn btn-danger btn-small"
                                  style={{ padding: '0.4rem 0.8rem' }}
                                >
                                  ✕ Eliminar
                                </button>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Formulario para agregar nuevo día */}
                        <div style={{
                          padding: '1.5rem',
                          background: 'var(--neutral-charcoal)',
                          borderRadius: '6px',
                          border: '1px solid var(--primary-gold)'
                        }}>
                          <h5 style={{ marginTop: 0, color: 'var(--primary-gold)' }}>
                            + Agregar Día de Trabajo
                          </h5>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            flexWrap: 'wrap'
                          }}>
                            <div>
                              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Día</label>
                              <select id={`nuevo-dia-${empleado.id}`} style={{ minWidth: '150px' }}>
                                {diasSemana
                                  .filter(dia => !horarios.some(h => h.diaSemana === dia))
                                  .map(dia => (
                                    <option key={dia} value={dia}>
                                      {dia.charAt(0).toUpperCase() + dia.slice(1)}
                                    </option>
                                  ))
                                }
                              </select>
                            </div>
                            <div>
                              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Hora Inicio</label>
                              <input
                                type="time"
                                defaultValue="10:00"
                                id={`nuevo-inicio-${empleado.id}`}
                                style={{ width: '120px' }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Hora Fin</label>
                              <input
                                type="time"
                                defaultValue="18:00"
                                id={`nuevo-fin-${empleado.id}`}
                                style={{ width: '120px' }}
                              />
                            </div>
                            <button
                              onClick={() => {
                                const dia = document.getElementById(`nuevo-dia-${empleado.id}`).value;
                                const inicio = document.getElementById(`nuevo-inicio-${empleado.id}`).value;
                                const fin = document.getElementById(`nuevo-fin-${empleado.id}`).value;
                                if (dia && inicio && fin) {
                                  guardarHorario(empleado.id, dia, inicio, fin);
                                }
                              }}
                              className="btn btn-primary"
                              style={{ padding: '0.6rem 1.5rem', marginTop: '1.5rem' }}
                              disabled={horarios.length >= 7}
                            >
                              + Agregar
                            </button>
                          </div>
                          {horarios.length >= 7 && (
                            <div style={{ 
                              marginTop: '1rem', 
                              color: 'var(--neutral-silver)', 
                              fontSize: '0.9rem' 
                            }}>
                              Ya tienes todos los días de la semana configurados.
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => setMostrarHorarios(null)}
                          className="btn btn-secondary"
                          style={{ marginTop: '1.5rem' }}
                        >
                          Cerrar
                        </button>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GestionEmpleados;
