import Cita from '../models/Cita.js';
import { enviarNotificacionCancelacion } from '../services/whatsappService.js';

const whatsappController = {
    async confirmarCita(req, res) {
        try {
            const { token } = req.params;
            
            const cita = await Cita.obtenerPorToken(token);
            
            if (!cita) {
                return res.status(404).send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Cita no encontrada</title>
                        <style>
                            body { font-family: Arial; text-align: center; padding: 50px; background: #1a1a1a; color: #fff; }
                            .container { max-width: 500px; margin: 0 auto; background: #2a2a2a; padding: 40px; border-radius: 10px; }
                            h1 { color: #ff6b6b; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>❌ Cita no encontrada</h1>
                            <p>El enlace no es válido o la cita ya fue procesada.</p>
                        </div>
                    </body>
                    </html>
                `);
            }

            if (cita.estado !== 'pendiente') {
                return res.send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Cita ya procesada</title>
                        <style>
                            body { font-family: Arial; text-align: center; padding: 50px; background: #1a1a1a; color: #fff; }
                            .container { max-width: 500px; margin: 0 auto; background: #2a2a2a; padding: 40px; border-radius: 10px; }
                            h1 { color: #ffd700; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>⚠️ Cita ya procesada</h1>
                            <p>Esta cita ya fue ${cita.estado}.</p>
                        </div>
                    </body>
                    </html>
                `);
            }

            await Cita.confirmar(cita.id);

            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Cita Confirmada</title>
                    <style>
                        body { font-family: Arial; text-align: center; padding: 50px; background: #1a1a1a; color: #fff; }
                        .container { max-width: 500px; margin: 0 auto; background: #2a2a2a; padding: 40px; border-radius: 10px; }
                        h1 { color: #4caf50; }
                        .info { background: #333; padding: 20px; border-radius: 5px; margin: 20px 0; }
                        .info p { margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>✅ Cita Confirmada</h1>
                        <div class="info">
                            <p><strong>Cliente:</strong> ${cita.clienteNombre}</p>
                            <p><strong>Servicio:</strong> ${cita.servicioNombre}</p>
                            <p><strong>Barbero:</strong> ${cita.empleadoNombre}</p>
                            <p><strong>Fecha:</strong> ${new Date(cita.fecha).toLocaleDateString('es-AR')}</p>
                            <p><strong>Hora:</strong> ${cita.hora.substring(0, 5)}</p>
                        </div>
                        <p>La cita ha sido confirmada exitosamente.</p>
                    </div>
                </body>
                </html>
            `);
        } catch (error) {
            console.error('Error al confirmar cita:', error);
            res.status(500).send('Error al confirmar la cita');
        }
    },

    async mostrarFormularioCancelacion(req, res) {
        try {
            const { token } = req.params;
            
            const cita = await Cita.obtenerPorToken(token);
            
            if (!cita) {
                return res.status(404).send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Cita no encontrada</title>
                        <style>
                            body { font-family: Arial; text-align: center; padding: 50px; background: #1a1a1a; color: #fff; }
                            .container { max-width: 500px; margin: 0 auto; background: #2a2a2a; padding: 40px; border-radius: 10px; }
                            h1 { color: #ff6b6b; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>❌ Cita no encontrada</h1>
                            <p>El enlace no es válido o la cita ya fue procesada.</p>
                        </div>
                    </body>
                    </html>
                `);
            }

            if (cita.estado === 'cancelada') {
                return res.send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Cita ya cancelada</title>
                        <style>
                            body { font-family: Arial; text-align: center; padding: 50px; background: #1a1a1a; color: #fff; }
                            .container { max-width: 500px; margin: 0 auto; background: #2a2a2a; padding: 40px; border-radius: 10px; }
                            h1 { color: #ffd700; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>⚠️ Cita ya cancelada</h1>
                            <p>Esta cita ya fue cancelada anteriormente.</p>
                        </div>
                    </body>
                    </html>
                `);
            }

            if (cita.estado === 'confirmada') {
                return res.send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Cita ya confirmada</title>
                        <style>
                            body { font-family: Arial; text-align: center; padding: 50px; background: #1a1a1a; color: #fff; }
                            .container { max-width: 500px; margin: 0 auto; background: #2a2a2a; padding: 40px; border-radius: 10px; }
                            h1 { color: #4caf50; }
                            p { line-height: 1.6; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>✅ Cita ya confirmada</h1>
                            <p>Esta cita ya fue confirmada. Para cancelarla, debés hacerlo desde el panel de administración.</p>
                        </div>
                    </body>
                    </html>
                `);
            }

            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Cancelar Cita</title>
                    <style>
                        body { font-family: Arial; padding: 20px; background: #1a1a1a; color: #fff; }
                        .container { max-width: 500px; margin: 0 auto; background: #2a2a2a; padding: 40px; border-radius: 10px; }
                        h1 { color: #ff6b6b; text-align: center; }
                        .info { background: #333; padding: 20px; border-radius: 5px; margin: 20px 0; }
                        .info p { margin: 10px 0; }
                        label { display: block; margin: 20px 0 10px; font-weight: bold; }
                        textarea { width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #555; background: #333; color: #fff; font-family: Arial; resize: vertical; min-height: 100px; }
                        button { width: 100%; padding: 15px; background: #ff6b6b; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; margin-top: 20px; }
                        button:hover { background: #ff5252; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>❌ Cancelar Cita</h1>
                        <div class="info">
                            <p><strong>Cliente:</strong> ${cita.clienteNombre}</p>
                            <p><strong>Servicio:</strong> ${cita.servicioNombre}</p>
                            <p><strong>Barbero:</strong> ${cita.empleadoNombre}</p>
                            <p><strong>Fecha:</strong> ${new Date(cita.fecha).toLocaleDateString('es-AR')}</p>
                            <p><strong>Hora:</strong> ${cita.hora.substring(0, 5)}</p>
                        </div>
                        <form method="POST" action="/api/whatsapp/cancelar/${token}">
                            <label for="motivo">Motivo de cancelación:</label>
                            <textarea id="motivo" name="motivo" required placeholder="Ingresá el motivo de la cancelación..."></textarea>
                            <button type="submit">Cancelar Cita</button>
                        </form>
                    </div>
                </body>
                </html>
            `);
        } catch (error) {
            console.error('Error al mostrar formulario:', error);
            res.status(500).send('Error al cargar el formulario');
        }
    },

    async cancelarCita(req, res) {
        try {
            const { token } = req.params;
            const { motivo } = req.body;
            
            const cita = await Cita.obtenerPorToken(token);
            
            if (!cita) {
                return res.status(404).send('Cita no encontrada');
            }

            if (cita.estado === 'cancelada') {
                return res.send('Esta cita ya fue cancelada');
            }

            if (cita.estado === 'confirmada') {
                return res.send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>No se puede cancelar</title>
                        <style>
                            body { font-family: Arial; text-align: center; padding: 50px; background: #1a1a1a; color: #fff; }
                            .container { max-width: 500px; margin: 0 auto; background: #2a2a2a; padding: 40px; border-radius: 10px; }
                            h1 { color: #ffd700; }
                            p { line-height: 1.6; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>⚠️ No se puede cancelar</h1>
                            <p>Esta cita ya fue confirmada. Para cancelarla, debés hacerlo desde el panel de administración.</p>
                        </div>
                    </body>
                    </html>
                `);
            }

            await Cita.cancelarConMotivo(cita.id, motivo);

            // Notificar al cliente por WhatsApp
            try {
                await enviarNotificacionCancelacion(cita, motivo);
            } catch (whatsappError) {
                console.error('Error al enviar WhatsApp:', whatsappError);
            }

            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Cita Cancelada</title>
                    <style>
                        body { font-family: Arial; text-align: center; padding: 50px; background: #1a1a1a; color: #fff; }
                        .container { max-width: 500px; margin: 0 auto; background: #2a2a2a; padding: 40px; border-radius: 10px; }
                        h1 { color: #ff6b6b; }
                        .info { background: #333; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: left; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>❌ Cita Cancelada</h1>
                        <div class="info">
                            <p><strong>Cliente:</strong> ${cita.clienteNombre}</p>
                            <p><strong>Motivo:</strong> ${motivo}</p>
                        </div>
                        <p>La cita ha sido cancelada y el cliente ha sido notificado por WhatsApp.</p>
                    </div>
                </body>
                </html>
            `);
        } catch (error) {
            console.error('Error al cancelar cita:', error);
            res.status(500).send('Error al cancelar la cita');
        }
    }
};

export default whatsappController;
