import { whatsappClient, isReady } from '../config/whatsappConfig.js';
import moment from 'moment-timezone';

moment.locale('es');
const timezone = process.env.TIMEZONE || 'America/Bogota';

export async function enviarRecordatorioWhatsApp(cita) {
    if (!whatsappClient || !isReady) {
        console.warn('⚠️ WhatsApp no está conectado');
        return null;
    }

    const fechaFormateada = moment(cita.fecha).format('dddd, D [de] MMMM');
    const horaFormateada = moment(cita.hora, 'HH:mm:ss').format('h:mm A');

    const mensaje = `🔔 *Recordatorio de Cita - Barbería Elite*

Hola *${cita.clienteNombre}*! 👋

Te recordamos que tienes una cita programada:

📅 *Fecha:* ${fechaFormateada}
🕐 *Hora:* ${horaFormateada}
✂️ *Servicio:* ${cita.servicioNombre}
👤 *Barbero:* ${cita.empleadoNombre}

¿Confirmas tu asistencia? 
Por favor responde a este mensaje para confirmar o si necesitas cancelar.

📍 Barbería Elite`;

    try {
        const numeroCliente = cita.clienteTelefono.replace(/\D/g, '');
        const jid = numeroCliente + '@s.whatsapp.net';

        await whatsappClient.sendMessage(jid, { text: mensaje });
        console.log(`✅ Recordatorio WhatsApp enviado a ${cita.clienteNombre} (${cita.clienteTelefono})`);
        return true;
    } catch (error) {
        console.error('❌ Error al enviar WhatsApp:', error.message);
        throw error;
    }
}

export async function notificarAdminNuevaCita(cita) {
    if (!whatsappClient || !isReady) {
        console.warn('⚠️ WhatsApp no está conectado');
        return null;
    }

    // Obtener número del admin desde la base de datos
    const prisma = (await import('../config/prisma.js')).default;
    const admin = await prisma.administrador.findFirst();
    const barberiaNumber = admin?.whatsappNumero || process.env.BARBERIA_WHATSAPP_NUMBER;
    
    if (!barberiaNumber) {
        console.warn('⚠️ Número de WhatsApp del admin no configurado');
        return null;
    }

    const fechaFormateada = moment(cita.fecha).format('dddd, D [de] MMMM');
    const horaFormateada = moment(cita.hora, 'HH:mm:ss').format('h:mm A');
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

    const mensaje = `📝 *Nueva Cita Agendada*

Cliente: *${cita.clienteNombre}*
Teléfono: ${cita.clienteTelefono}
Fecha: ${fechaFormateada}
Hora: ${horaFormateada}
Servicio: ${cita.servicioNombre}
Barbero: ${cita.empleadoNombre}

✅ Confirmar: ${backendUrl}/api/whatsapp/confirmar/${cita.tokenConfirmacion}
❌ Cancelar: ${backendUrl}/api/whatsapp/cancelar/${cita.tokenConfirmacion}`;

    try {
        const numeroAdmin = barberiaNumber.replace(/\D/g, '');
        const jid = numeroAdmin + '@s.whatsapp.net';

        await whatsappClient.sendMessage(jid, { text: mensaje });
        return true;
    } catch (error) {
        console.error('❌ Error al notificar admin:', error.message);
        throw error;
    }
}

export async function enviarConfirmacionCliente(cita) {
    if (!whatsappClient || !isReady) {
        console.warn('⚠️ WhatsApp no está conectado');
        return null;
    }

    const fechaFormateada = moment(cita.fecha).format('dddd, D [de] MMMM');
    const horaFormateada = moment(cita.hora, 'HH:mm:ss').format('h:mm A');

    const mensaje = `✅ *Cita Confirmada - Barbería Elite*

Hola *${cita.clienteNombre}*! 👋

Tu cita ha sido agendada exitosamente:

📅 *Fecha:* ${fechaFormateada}
🕐 *Hora:* ${horaFormateada}
✂️ *Servicio:* ${cita.servicioNombre}
👤 *Barbero:* ${cita.empleadoNombre}
💰 *Precio:* $${cita.servicioPrecio}

Te enviaremos un recordatorio 3 horas antes de tu cita.

📍 Barbería Elite
¡Te esperamos!`;

    try {
        const numeroCliente = cita.clienteTelefono.replace(/\D/g, '');
        const jid = numeroCliente + '@s.whatsapp.net';

        await whatsappClient.sendMessage(jid, { text: mensaje });
        console.log(`✅ Confirmación WhatsApp enviada a ${cita.clienteNombre} (${cita.clienteTelefono})`);
        return true;
    } catch (error) {
        console.error('❌ Error al enviar confirmación:', error.message);
        throw error;
    }
}

export async function enviarNotificacionCancelacion(cita, motivo) {
    if (!whatsappClient || !isReady) {
        console.warn('⚠️ WhatsApp no está conectado');
        return null;
    }

    const fechaFormateada = moment(cita.fecha).format('dddd, D [de] MMMM');
    const horaFormateada = moment(cita.hora, 'HH:mm:ss').format('h:mm A');

    const mensaje = `❌ *Cita Cancelada - Barbería Elite*

Hola *${cita.clienteNombre}*,

Lamentamos informarte que tu cita ha sido cancelada:

📅 *Fecha:* ${fechaFormateada}
🕐 *Hora:* ${horaFormateada}
✂️ *Servicio:* ${cita.servicioNombre}

📝 *Motivo:* ${motivo}

Podés agendar una nueva cita cuando lo desees.

📍 Barbería Elite`;

    try {
        const numeroCliente = cita.clienteTelefono.replace(/\D/g, '');
        const jid = numeroCliente + '@s.whatsapp.net';

        await whatsappClient.sendMessage(jid, { text: mensaje });
        console.log(`✅ Notificación de cancelación enviada a ${cita.clienteNombre}`);
        return true;
    } catch (error) {
        console.error('❌ Error al enviar notificación de cancelación:', error.message);
        throw error;
    }
}

export async function enviarNotificacionConfirmacion(cita) {
    if (!whatsappClient || !isReady) {
        console.warn('⚠️ WhatsApp no está conectado');
        return null;
    }

    const fechaFormateada = moment(cita.fecha).format('dddd, D [de] MMMM');
    const horaFormateada = moment(cita.hora, 'HH:mm:ss').format('h:mm A');

    const mensaje = `✅ *Cita Confirmada - Barbería Elite*

Hola *${cita.clienteNombre}*!

Tu cita ha sido confirmada por nuestro equipo:

📅 *Fecha:* ${fechaFormateada}
🕐 *Hora:* ${horaFormateada}
✂️ *Servicio:* ${cita.servicioNombre}
👤 *Barbero:* ${cita.empleadoNombre}

¡Te esperamos!

📍 Barbería Elite`;

    try {
        const numeroCliente = cita.clienteTelefono.replace(/\D/g, '');
        const jid = numeroCliente + '@s.whatsapp.net';

        await whatsappClient.sendMessage(jid, { text: mensaje });
        console.log(`✅ Notificación de confirmación enviada a ${cita.clienteNombre}`);
        return true;
    } catch (error) {
        console.error('❌ Error al enviar notificación de confirmación:', error.message);
        throw error;
    }
}
