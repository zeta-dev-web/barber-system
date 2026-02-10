import transporter from '../config/emailConfig.js';
import moment from 'moment-timezone';

// Configurar moment en español
moment.locale('es');

const timezone = process.env.TIMEZONE || 'America/Bogota';
const emailFrom = process.env.EMAIL_FROM || 'Highbury Barber';

export async function enviarEmailConfirmacion(cita) {
    if (!transporter) {
        console.warn('⚠️  Email no configurado, saltando envío de confirmación');
        return null;
    }
    
    const fechaFormateada = moment.tz(cita.fecha, timezone).format('dddd, D [de] MMMM [de] YYYY');
    const horaFormateada = moment(cita.hora, 'HH:mm:ss').format('h:mm A');

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Montserrat', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1A1A1A; color: white; padding: 30px 20px; text-align: center; border-bottom: 3px solid #D4AF37; }
            .header h1 { margin: 0; font-size: 28px; letter-spacing: 2px; font-weight: 700; }
            .header p { margin: 10px 0 0; font-size: 14px; letter-spacing: 1px; color: #D4AF37; }
            .content { background-color: #f9f9f9; padding: 30px 20px; }
            .content h2 { color: #1A1A1A; margin-top: 0; }
            .info-box { background-color: white; padding: 20px; margin: 20px 0; border-left: 4px solid #D4AF37; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .info-box p { margin: 10px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #777; background-color: #f4f4f4; }
            .highlight { color: #D4AF37; font-weight: 600; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>HIGHBURY BARBER</h1>
                <p>Confirmación de Cita</p>
            </div>
            <div class="content">
                <h2>¡Hola ${cita.clienteNombre}!</h2>
                <p>Tu cita ha sido agendada exitosamente. Aquí están los detalles:</p>
                
                <div class="info-box">
                    <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                    <p><strong>Hora:</strong> ${horaFormateada}</p>
                    <p><strong>Servicio:</strong> ${cita.servicioNombre}</p>
                    <p><strong>Barbero:</strong> ${cita.empleadoNombre}</p>
                    <p><strong>Precio:</strong> $${parseFloat(cita.servicioPrecio).toLocaleString('es-CO')}</p>
                </div>
                
                <p><strong class="highlight">Importante:</strong> Te enviaremos un recordatorio por WhatsApp 3 horas antes de tu cita.</p>
                <p>Si necesitas cancelar o reprogramar, por favor contáctanos con anticipación.</p>
            </div>
            <div class="footer">
                <p>Gracias por preferirnos</p>
                <p><strong>Highbury Barber</strong> - Bogotá, Colombia</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: emailFrom,
        to: cita.clienteEmail,
        subject: 'Confirmación de tu Cita - Highbury Barber',
        html: htmlContent
    };

    return await transporter.sendMail(mailOptions);
}

export async function enviarEmailRecibo(cita) {
    if (!transporter) {
        console.warn('⚠️  Email no configurado, saltando envío de recibo');
        return null;
    }
    
    const fechaFormateada = moment.tz(cita.fecha, timezone).format('dddd, D [de] MMMM [de] YYYY');
    const horaFormateada = moment(cita.hora, 'HH:mm:ss').format('h:mm A');

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Montserrat', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1A1A1A; color: white; padding: 30px 20px; text-align: center; border-bottom: 3px solid #D4AF37; }
            .header h1 { margin: 0; font-size: 28px; letter-spacing: 2px; font-weight: 700; }
            .header p { margin: 10px 0 0; font-size: 14px; letter-spacing: 1px; color: #D4AF37; }
            .content { background-color: #f9f9f9; padding: 30px 20px; }
            .content h2 { color: #1A1A1A; margin-top: 0; }
            .recibo { background-color: white; padding: 25px; margin: 20px 0; border: 2px solid #D4AF37; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .recibo h3 { margin-top: 0; color: #1A1A1A; letter-spacing: 1px; }
            .recibo p { margin: 12px 0; }
            .total { font-size: 24px; color: #D4AF37; font-weight: bold; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #777; background-color: #f4f4f4; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>HIGHBURY BARBER</h1>
                <p>Recibo de Pago</p>
            </div>
            <div class="content">
                <h2>¡Gracias ${cita.clienteNombre}!</h2>
                <p>Apreciamos tu visita. Aquí está el recibo de tu servicio:</p>
                
                <div class="recibo">
                    <h3>RECIBO #${cita.id}</h3>
                    <hr>
                    <p><strong>Cliente:</strong> ${cita.clienteNombre}</p>
                    <p><strong>Cédula:</strong> ${cita.clienteCedula}</p>
                    <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                    <p><strong>Hora:</strong> ${horaFormateada}</p>
                    <hr>
                    <p><strong>Servicio:</strong> ${cita.servicioNombre}</p>
                    <p><strong>Atendido por:</strong> ${cita.empleadoNombre}</p>
                    <hr>
                    <p class="total">Total Pagado: $${parseFloat(cita.servicioPrecio).toLocaleString('es-CO')}</p>
                </div>
                
                <p>¡Esperamos verte pronto nuevamente!</p>
                <p>Si tienes alguna sugerencia o comentario, no dudes en contactarnos.</p>
            </div>
            <div class="footer">
                <p>Gracias por tu preferencia</p>
                <p><strong>Highbury Barber</strong> - Bogotá, Colombia</p>
                <p>WhatsApp: ${process.env.BARBERIA_WHATSAPP_NUMBER || 'Contacto disponible'}</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: emailFrom,
        to: cita.clienteEmail,
        subject: 'Recibo de tu Servicio - Highbury Barber',
        html: htmlContent
    };

    return await transporter.sendMail(mailOptions);
}

export async function enviarEmailCitaConfirmada(cita) {
    if (!transporter) {
        console.warn('⚠️  Email no configurado');
        return null;
    }
    
    const fechaFormateada = moment.tz(cita.fecha, timezone).format('dddd, D [de] MMMM [de] YYYY');
    const horaFormateada = moment(cita.hora, 'HH:mm:ss').format('h:mm A');

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Montserrat', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1A1A1A; color: white; padding: 30px 20px; text-align: center; border-bottom: 3px solid #4caf50; }
            .header h1 { margin: 0; font-size: 28px; letter-spacing: 2px; font-weight: 700; }
            .header p { margin: 10px 0 0; font-size: 14px; letter-spacing: 1px; color: #4caf50; }
            .content { background-color: #f9f9f9; padding: 30px 20px; }
            .content h2 { color: #1A1A1A; margin-top: 0; }
            .info-box { background-color: white; padding: 20px; margin: 20px 0; border-left: 4px solid #4caf50; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .info-box p { margin: 10px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #777; background-color: #f4f4f4; }
            .highlight { color: #4caf50; font-weight: 600; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>HIGHBURY BARBER</h1>
                <p>✅ Cita Confirmada</p>
            </div>
            <div class="content">
                <h2>¡Hola ${cita.clienteNombre}!</h2>
                <p>Tu cita ha sido <strong class="highlight">confirmada</strong> por nuestro equipo.</p>
                
                <div class="info-box">
                    <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                    <p><strong>Hora:</strong> ${horaFormateada}</p>
                    <p><strong>Servicio:</strong> ${cita.servicioNombre}</p>
                    <p><strong>Barbero:</strong> ${cita.empleadoNombre}</p>
                </div>
                
                <p>¡Te esperamos!</p>
            </div>
            <div class="footer">
                <p><strong>Highbury Barber</strong> - Bogotá, Colombia</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: emailFrom,
        to: cita.clienteEmail,
        subject: '✅ Tu Cita ha sido Confirmada - Highbury Barber',
        html: htmlContent
    };

    return await transporter.sendMail(mailOptions);
}

export async function enviarEmailCitaCancelada(cita, motivo = 'No especificado') {
    if (!transporter) {
        console.warn('⚠️  Email no configurado');
        return null;
    }
    
    const fechaFormateada = moment.tz(cita.fecha, timezone).format('dddd, D [de] MMMM [de] YYYY');
    const horaFormateada = moment(cita.hora, 'HH:mm:ss').format('h:mm A');

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Montserrat', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1A1A1A; color: white; padding: 30px 20px; text-align: center; border-bottom: 3px solid #ff6b6b; }
            .header h1 { margin: 0; font-size: 28px; letter-spacing: 2px; font-weight: 700; }
            .header p { margin: 10px 0 0; font-size: 14px; letter-spacing: 1px; color: #ff6b6b; }
            .content { background-color: #f9f9f9; padding: 30px 20px; }
            .content h2 { color: #1A1A1A; margin-top: 0; }
            .info-box { background-color: white; padding: 20px; margin: 20px 0; border-left: 4px solid #ff6b6b; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .info-box p { margin: 10px 0; }
            .motivo { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #777; background-color: #f4f4f4; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>HIGHBURY BARBER</h1>
                <p>❌ Cita Cancelada</p>
            </div>
            <div class="content">
                <h2>Hola ${cita.clienteNombre},</h2>
                <p>Lamentamos informarte que tu cita ha sido <strong>cancelada</strong>.</p>
                
                <div class="info-box">
                    <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                    <p><strong>Hora:</strong> ${horaFormateada}</p>
                    <p><strong>Servicio:</strong> ${cita.servicioNombre}</p>
                    <p><strong>Barbero:</strong> ${cita.empleadoNombre}</p>
                </div>
                
                <div class="motivo">
                    <p><strong>Motivo:</strong> ${motivo}</p>
                </div>
                
                <p>Podés agendar una nueva cita cuando lo desees.</p>
            </div>
            <div class="footer">
                <p><strong>Highbury Barber</strong> - Bogotá, Colombia</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: emailFrom,
        to: cita.clienteEmail,
        subject: '❌ Tu Cita ha sido Cancelada - Highbury Barber',
        html: htmlContent
    };

    return await transporter.sendMail(mailOptions);
}
