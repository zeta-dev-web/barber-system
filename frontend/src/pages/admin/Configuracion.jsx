import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import './Configuracion.css';

function Configuracion() {
    const [whatsappNumero, setWhatsappNumero] = useState('');
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    useEffect(() => {
        const admin = JSON.parse(localStorage.getItem('admin') || '{}');
        if (admin.whatsappNumero) {
            setWhatsappNumero(admin.whatsappNumero);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMensaje({ tipo: '', texto: '' });

        try {
            await adminAPI.actualizarConfiguracion({ whatsappNumero });
            
            // Actualizar localStorage
            const admin = JSON.parse(localStorage.getItem('admin') || '{}');
            admin.whatsappNumero = whatsappNumero;
            localStorage.setItem('admin', JSON.stringify(admin));

            setMensaje({ tipo: 'success', texto: 'Configuración actualizada exitosamente' });
        } catch (error) {
            console.error('Error al actualizar configuración:', error);
            setMensaje({ tipo: 'error', texto: 'Error al actualizar la configuración' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="configuracion-container">
            <h2>⚙️ Configuración</h2>

            <div className="config-card">
                <h3>📱 WhatsApp</h3>
                <p className="config-description">
                    Configurá tu número de WhatsApp para recibir notificaciones cuando un cliente haga una reserva.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Número de WhatsApp</label>
                        <input
                            type="text"
                            value={whatsappNumero}
                            onChange={(e) => setWhatsappNumero(e.target.value)}
                            placeholder="+5493816456456"
                            className="form-control"
                        />
                        <small className="form-text">
                            Ingresá el número con código de país (ej: +5493816456456)
                        </small>
                    </div>

                    {mensaje.texto && (
                        <div className={`alert alert-${mensaje.tipo}`}>
                            {mensaje.texto}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Configuracion;
