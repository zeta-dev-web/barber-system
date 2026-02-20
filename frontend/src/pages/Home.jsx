import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { serviciosAPI } from '../services/api';
import Navbar from '../components/Navbar';

function Home() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      const response = await serviciosAPI.obtenerTodos();
      setServicios(response.data);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  };

  const features = [
    {
      icon: <div style={{ fontSize: '2.5rem' }}>👨‍💼</div>,
      title: 'Maestros Barberos',
      description: 'Profesionales certificados con años de experiencia'
    },
    {
      icon: <div style={{ fontSize: '2.5rem' }}>✨</div>,
      title: 'Productos Premium',
      description: 'Utilizamos únicamente las mejores marcas internacionales'
    },
    {
      icon: <div style={{ fontSize: '2.5rem' }}>⏰</div>,
      title: 'Horarios Flexibles',
      description: 'Lunes a Sábado de 10:00 AM a 6:00 PM'
    },
    {
      icon: <div style={{ fontSize: '2.5rem' }}>🏆</div>,
      title: 'Ambiente Exclusivo',
      description: 'Un espacio diseñado para tu comodidad total'
    },
    {
      icon: <div style={{ fontSize: '2.5rem' }}>📱</div>,
      title: 'Sistema Digital',
      description: 'Reservá online 24/7 y recibí recordatorios automáticos'
    },
    {
      icon: <div style={{ fontSize: '2.5rem' }}>✂️</div>,
      title: 'Atención Personalizada',
      description: 'Cada cliente recibe un servicio único'
    }
  ];

  return (
    <div className="fade-in">
      <Navbar />

      {/* Hero Section */}
      <motion.div 
        className="hero"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Estilo & Distinción
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Experimentá el arte del cuidado masculino en su máxima expresión. Tradición, elegancia y perfección en cada detalle.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Link to="/reservar" className="btn btn-primary">
            Reservar Cita
          </Link>
        </motion.div>
      </motion.div>

      {/* Servicios */}
      <div className="container">
        <motion.h2 
          style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '4rem' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Nuestros Servicios
        </motion.h2>
        
        {loading ? (
          <div className="loading">Cargando servicios exclusivos...</div>
        ) : (
          <motion.div 
            className="grid grid-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {servicios.map((servicio) => (
              <motion.div 
                key={servicio.id} 
                className="service-card"
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 10px 30px rgba(212, 175, 55, 0.3)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <h3>{servicio.nombre}</h3>
                <p>{servicio.descripcion}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div className="price">
                      ${parseFloat(servicio.precio).toLocaleString('es-CO')}
                    </div>
                    <div className="duration">
                      ⏱️ {servicio.duracion} minutos
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="container">
          <motion.h2 
            style={{ textAlign: 'center', marginBottom: '3rem' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            La Experiencia Highbury
          </motion.h2>
          
          <motion.div 
            className="features-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="feature-card"
                variants={itemVariants}
                whileHover={{ 
                  y: -10,
                  transition: { type: 'spring', stiffness: 300 }
                }}
              >
                <motion.div 
                  style={{ marginBottom: '1rem' }}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {feature.icon}
                </motion.div>
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Call to Action */}
      <motion.div 
        className="container" 
        style={{ textAlign: 'center', padding: '5rem 2rem' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <motion.h2 
          style={{ marginBottom: '1.5rem' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Transformá Tu Estilo Hoy
        </motion.h2>
        <motion.p 
          style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Dale a tu imagen la importancia que merece. Reservá tu cita y descubrí la diferencia de un servicio verdaderamente premium.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Link to="/reservar" className="btn btn-primary" style={{ fontSize: '1.1rem' }}>
            Reservar Mi Cita
          </Link>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <footer style={{ 
        background: 'var(--neutral-dark)', 
        borderTop: '1px solid var(--primary-gold)',
        padding: '3rem 2rem',
        textAlign: 'center'
      }}>
        <div className="container">
          <h3 style={{ color: 'var(--primary-gold)', marginBottom: '1rem' }}>
            HIGHBURY BARBER
          </h3>
          <p style={{ color: 'var(--neutral-silver)', marginBottom: '1rem' }}>
            Bogotá, Colombia • Lun - Sáb: 10:00 - 18:00
          </p>
          <p style={{ color: 'var(--neutral-gray)', fontSize: '0.9rem' }}>
            © 2026 Made by ZetaDev & Matias Ahumada. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
