import prisma from '../config/prisma.js';

const Servicio = {
    async obtenerTodos() {
        return await prisma.servicio.findMany({
            where: { activo: true },
            select: { id: true, nombre: true, descripcion: true, duracion: true, precio: true },
            orderBy: { nombre: 'asc' }
        });
    },

    async obtenerTodosAdmin() {
        return await prisma.servicio.findMany({
            orderBy: { nombre: 'asc' }
        });
    },

    async obtenerPorId(id) {
        return await prisma.servicio.findUnique({
            where: { id: parseInt(id) }
        });
    },

    async crear(servicio) {
        const { nombre, descripcion, precio } = servicio;
        const result = await prisma.servicio.create({
            data: { nombre, descripcion, duracion: 60, precio }
        });
        return result.id;
    },

    async actualizar(id, servicio) {
        const { nombre, descripcion, precio, activo } = servicio;
        await prisma.servicio.update({
            where: { id: parseInt(id) },
            data: { nombre, descripcion, precio, activo }
        });
        return true;
    },

    async eliminar(id) {
        await prisma.servicio.update({
            where: { id: parseInt(id) },
            data: { activo: false }
        });
        return true;
    },

    async activar(id) {
        await prisma.servicio.update({
            where: { id: parseInt(id) },
            data: { activo: true }
        });
        return true;
    }
};

export default Servicio;
