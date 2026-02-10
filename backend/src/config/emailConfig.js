import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter = null;

// Solo configurar si hay credenciales válidas
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && 
    !process.env.EMAIL_USER.includes('tu_email') && 
    !process.env.EMAIL_PASSWORD.includes('tu_password')) {
    
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Verificar configuración
    transporter.verify()
        .then(() => {
            console.log('✅ Servidor de email configurado correctamente');
        })
        .catch(err => {
            console.warn('⚠️  Error en la configuración de email (opcional):', err.message);
            transporter = null;
        });
} else {
    console.warn('⚠️  Credenciales de email no configuradas (opcional)');
}

export default transporter;
