import express from 'express';
import whatsappController from '../controllers/whatsappController.js';

const router = express.Router();

// Rutas públicas (sin autenticación)
router.get('/confirmar/:token', whatsappController.confirmarCita);
router.get('/cancelar/:token', whatsappController.mostrarFormularioCancelacion);
router.post('/cancelar/:token', express.urlencoded({ extended: true }), whatsappController.cancelarCita);

export default router;
