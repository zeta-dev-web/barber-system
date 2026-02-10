import prisma from '../config/prisma.js';

const DiaFestivo = {
    async obtenerTodos() {
        return await prisma.diaFestivo.findMany({
            orderBy: { fecha: 'asc' }
        });
    },

    async obtenerFuturos() {
        return await prisma.diaFestivo.findMany({
            where: {
                fecha: {
                    gte: new Date()
                }
            },
            orderBy: { fecha: 'asc' }
        });
    },

    async esFestivo(fecha) {
        const count = await prisma.diaFestivo.count({
            where: { fecha: new Date(fecha) }
        });
        return count > 0;
    },

    async crear(diaFestivo) {
        const { fecha, descripcion } = diaFestivo;
        const result = await prisma.diaFestivo.create({
            data: {
                fecha: new Date(fecha),
                descripcion
            }
        });
        return result.id;
    },

    async eliminar(id) {
        await prisma.diaFestivo.delete({
            where: { id: parseInt(id) }
        });
        return true;
    }
};

export default DiaFestivo;
