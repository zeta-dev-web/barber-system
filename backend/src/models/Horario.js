import prisma from '../config/prisma.js';

const Horario = {
    async obtenerTodos() {
        return await prisma.horario.findMany({
            where: { activo: true },
            include: {
                empleado: {
                    select: { nombre: true }
                }
            },
            orderBy: [
                { empleado: { nombre: 'asc' } },
                { diaSemana: 'asc' }
            ]
        });
    },

    async obtenerPorId(id) {
        return await prisma.horario.findUnique({
            where: { id: parseInt(id) },
            include: {
                empleado: {
                    select: { nombre: true }
                }
            }
        });
    },

    async obtenerPorEmpleado(empleadoId) {
        return await prisma.horario.findMany({
            where: { 
                empleadoId: parseInt(empleadoId),
                activo: true 
            },
            orderBy: { diaSemana: 'asc' }
        });
    },

    async crear(horario) {
        const { empleado_id, dia_semana, hora_inicio, hora_fin } = horario;
        const result = await prisma.horario.upsert({
            where: {
                unique_empleado_dia: {
                    empleadoId: parseInt(empleado_id),
                    diaSemana: dia_semana
                }
            },
            update: {
                horaInicio: hora_inicio,
                horaFin: hora_fin,
                activo: true
            },
            create: {
                empleadoId: parseInt(empleado_id),
                diaSemana: dia_semana,
                horaInicio: hora_inicio,
                horaFin: hora_fin
            }
        });
        return result.id;
    },

    async actualizar(id, horario) {
        const { dia_semana, hora_inicio, hora_fin, activo } = horario;
        await prisma.horario.update({
            where: { id: parseInt(id) },
            data: {
                diaSemana: dia_semana,
                horaInicio: hora_inicio,
                horaFin: hora_fin,
                activo
            }
        });
        return true;
    },

    async eliminar(id) {
        await prisma.horario.update({
            where: { id: parseInt(id) },
            data: { activo: false }
        });
        return true;
    }
};

export default Horario;
