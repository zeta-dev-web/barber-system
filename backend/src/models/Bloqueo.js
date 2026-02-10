import prisma from '../config/prisma.js';

const Bloqueo = {
    async obtenerTodos() {
        return await prisma.bloqueo.findMany({
            include: {
                empleado: {
                    select: { nombre: true }
                }
            },
            orderBy: { fechaInicio: 'desc' }
        });
    },

    async obtenerPorId(id) {
        return await prisma.bloqueo.findUnique({
            where: { id: parseInt(id) },
            include: {
                empleado: {
                    select: { nombre: true }
                }
            }
        });
    },

    async obtenerActivos() {
        return await prisma.bloqueo.findMany({
            where: {
                fechaFin: {
                    gte: new Date()
                }
            },
            include: {
                empleado: {
                    select: { nombre: true }
                }
            },
            orderBy: { fechaInicio: 'asc' }
        });
    },

    async obtenerPorEmpleado(empleadoId) {
        return await prisma.bloqueo.findMany({
            where: { empleadoId: parseInt(empleadoId) },
            orderBy: { fechaInicio: 'desc' }
        });
    },

    async verificarBloqueo(empleadoId, fecha) {
        const count = await prisma.bloqueo.count({
            where: {
                empleadoId: parseInt(empleadoId),
                fechaInicio: { lte: new Date(fecha) },
                fechaFin: { gte: new Date(fecha) }
            }
        });
        return count > 0;
    },

    async crear(bloqueo) {
        const { empleado_id, fecha_inicio, fecha_fin, motivo, descripcion } = bloqueo;
        const result = await prisma.bloqueo.create({
            data: {
                empleadoId: parseInt(empleado_id),
                fechaInicio: new Date(fecha_inicio),
                fechaFin: new Date(fecha_fin),
                motivo,
                descripcion
            }
        });
        return result.id;
    },

    async actualizar(id, bloqueo) {
        const { fecha_inicio, fecha_fin, motivo, descripcion } = bloqueo;
        await prisma.bloqueo.update({
            where: { id: parseInt(id) },
            data: {
                fechaInicio: new Date(fecha_inicio),
                fechaFin: new Date(fecha_fin),
                motivo,
                descripcion
            }
        });
        return true;
    },

    async eliminar(id) {
        await prisma.bloqueo.delete({
            where: { id: parseInt(id) }
        });
        return true;
    },

    async eliminarVencidos() {
        const result = await prisma.bloqueo.deleteMany({
            where: {
                fechaFin: {
                    lt: new Date()
                }
            }
        });
        return result.count;
    }
};

export default Bloqueo;
