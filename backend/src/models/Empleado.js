import prisma from '../config/prisma.js';

const Empleado = {
    async obtenerTodos() {
        return await prisma.empleado.findMany({
            where: { activo: true },
            select: { id: true, nombre: true, foto: true },
            orderBy: { nombre: 'asc' }
        });
    },

    async obtenerTodosAdmin() {
        return await prisma.empleado.findMany({
            orderBy: { nombre: 'asc' }
        });
    },

    async obtenerPorId(id) {
        return await prisma.empleado.findUnique({
            where: { id: parseInt(id) }
        });
    },

    async obtenerPorCedula(cedula) {
        return await prisma.empleado.findUnique({
            where: { cedula }
        });
    },

    async crear(empleado) {
        const { nombre, cedula, foto } = empleado;
        const result = await prisma.empleado.create({
            data: { nombre, cedula, foto: foto || null }
        });
        return result.id;
    },

    async actualizar(id, empleado) {
        const { nombre, cedula, foto, activo } = empleado;
        await prisma.empleado.update({
            where: { id: parseInt(id) },
            data: { nombre, cedula, foto, activo }
        });
        return true;
    },

    async eliminar(id) {
        await prisma.empleado.update({
            where: { id: parseInt(id) },
            data: { activo: false }
        });
        return true;
    },

    async obtenerHorarios(empleadoId) {
        return await prisma.horario.findMany({
            where: { 
                empleadoId: parseInt(empleadoId),
                activo: true 
            },
            orderBy: [
                { diaSemana: 'asc' }
            ]
        });
    },

    async obtenerBloqueos(empleadoId) {
        return await prisma.bloqueo.findMany({
            where: { empleadoId: parseInt(empleadoId) },
            orderBy: { fechaInicio: 'desc' }
        });
    }
};

export default Empleado;
