import prisma from '../config/prisma.js';

const Cita = {
    async obtenerTodas() {
        const citas = await prisma.cita.findMany({
            include: {
                servicio: { select: { nombre: true, precio: true } },
                empleado: { select: { nombre: true } }
            },
            orderBy: [{ fecha: 'asc' }, { hora: 'asc' }]
        });
        return citas.map(c => ({
            ...c,
            servicioNombre: c.servicio.nombre,
            servicioPrecio: c.servicio.precio,
            empleadoNombre: c.empleado.nombre
        }));
    },

    async obtenerPorEstado(estado) {
        const citas = await prisma.cita.findMany({
            where: { estado },
            include: {
                servicio: { select: { nombre: true, precio: true } },
                empleado: { select: { nombre: true } }
            },
            orderBy: [{ fecha: 'asc' }, { hora: 'asc' }]
        });
        return citas.map(c => ({
            ...c,
            servicioNombre: c.servicio.nombre,
            servicioPrecio: c.servicio.precio,
            empleadoNombre: c.empleado.nombre
        }));
    },

    async obtenerPorId(id) {
        const cita = await prisma.cita.findUnique({
            where: { id: parseInt(id) },
            include: {
                servicio: { select: { nombre: true, descripcion: true, precio: true } },
                empleado: { select: { nombre: true, foto: true } }
            }
        });
        if (!cita) return null;
        return {
            ...cita,
            servicioNombre: cita.servicio.nombre,
            servicioDescripcion: cita.servicio.descripcion,
            servicioPrecio: cita.servicio.precio,
            empleadoNombre: cita.empleado.nombre,
            empleadoFoto: cita.empleado.foto
        };
    },

    async obtenerPorFecha(fecha) {
        const citas = await prisma.cita.findMany({
            where: { fecha: new Date(fecha) },
            include: {
                servicio: { select: { nombre: true } },
                empleado: { select: { nombre: true } }
            },
            orderBy: { hora: 'asc' }
        });
        return citas.map(c => ({
            ...c,
            servicioNombre: c.servicio.nombre,
            empleadoNombre: c.empleado.nombre
        }));
    },

    async obtenerPorEmpleadoYFecha(empleadoId, fecha) {
        return await prisma.cita.findMany({
            where: {
                empleadoId: parseInt(empleadoId),
                fecha: new Date(fecha),
                estado: { not: 'cancelada' }
            },
            orderBy: { hora: 'asc' }
        });
    },

    async verificarDisponibilidad(empleadoId, fecha, hora) {
        const count = await prisma.cita.count({
            where: {
                empleadoId: parseInt(empleadoId),
                fecha: new Date(fecha),
                hora,
                estado: { not: 'cancelada' }
            }
        });
        return count === 0;
    },

    async crear(cita) {
        const { 
            cliente_nombre, 
            cliente_email, 
            cliente_telefono, 
            servicio_id, 
            empleado_id, 
            fecha, 
            hora 
        } = cita;
        
        // Generar token único para confirmación
        const crypto = await import('crypto');
        const tokenConfirmacion = crypto.randomBytes(32).toString('hex');
        
        const result = await prisma.cita.create({
            data: {
                clienteNombre: cliente_nombre,
                clienteEmail: cliente_email,
                clienteTelefono: cliente_telefono,
                servicio: { connect: { id: parseInt(servicio_id) } },
                empleado: { connect: { id: parseInt(empleado_id) } },
                fecha: new Date(fecha),
                hora,
                estado: 'pendiente',
                tokenConfirmacion
            }
        });
        return result.id;
    },

    async actualizarEstado(id, estado) {
        await prisma.cita.update({
            where: { id: parseInt(id) },
            data: { estado }
        });
        return true;
    },

    async marcarEmailConfirmacionEnviado(id) {
        await prisma.cita.update({
            where: { id: parseInt(id) },
            data: { emailConfirmacionEnviado: true }
        });
        return true;
    },

    async marcarRecordatorioEnviado(id) {
        await prisma.cita.update({
            where: { id: parseInt(id) },
            data: { recordatorioEnviado: true }
        });
        return true;
    },

    async marcarEmailReciboEnviado(id) {
        await prisma.cita.update({
            where: { id: parseInt(id) },
            data: { emailReciboEnviado: true }
        });
        return true;
    },

    async obtenerCitasParaRecordatorio() {
        const now = new Date();
        const threeHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000);
        const fourHoursLater = new Date(now.getTime() + 4 * 60 * 60 * 1000);

        const citas = await prisma.cita.findMany({
            where: {
                estado: 'pendiente',
                recordatorioEnviado: false,
                fecha: { gte: now, lte: fourHoursLater }
            },
            include: {
                servicio: { select: { nombre: true } },
                empleado: { select: { nombre: true } }
            }
        });

        return citas.map(c => ({
            ...c,
            servicioNombre: c.servicio.nombre,
            empleadoNombre: c.empleado.nombre
        }));
    },

    async cancelar(id) {
        return await this.actualizarEstado(id, 'cancelada');
    },

    async completar(id) {
        return await this.actualizarEstado(id, 'completada');
    },

    async confirmar(id) {
        return await this.actualizarEstado(id, 'confirmada');
    },

    async cancelarCitasVencidas() {
        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

        const result = await prisma.cita.updateMany({
            where: {
                estado: { in: ['pendiente', 'confirmada'] },
                fecha: { lt: threeHoursAgo }
            },
            data: { estado: 'cancelada' }
        });
        return result.count;
    },

    async obtenerPorToken(token) {
        const cita = await prisma.cita.findUnique({
            where: { tokenConfirmacion: token },
            include: {
                servicio: { select: { nombre: true, precio: true } },
                empleado: { select: { nombre: true } }
            }
        });
        if (!cita) return null;
        return {
            ...cita,
            servicioNombre: cita.servicio.nombre,
            servicioPrecio: cita.servicio.precio,
            empleadoNombre: cita.empleado.nombre
        };
    },

    async cancelarConMotivo(id, motivo) {
        await prisma.cita.update({
            where: { id: parseInt(id) },
            data: { 
                estado: 'cancelada',
                motivoCancelacion: motivo
            }
        });
        return true;
    }
};

export default Cita;
