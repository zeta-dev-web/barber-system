import Empleado from '../models/Empleado.js';
import Horario from '../models/Horario.js';
import Bloqueo from '../models/Bloqueo.js';
import Cita from '../models/Cita.js';
import DiaFestivo from '../models/DiaFestivo.js';
import moment from 'moment-timezone';

const timezone = process.env.TIMEZONE || 'America/Bogota';

const disponibilidadController = {
    // Obtener disponibilidad para un servicio y fecha específica
    async obtenerDisponibilidad(req, res) {
        try {
            const { fecha, empleado_id } = req.query;

            if (!fecha) {
                return res.status(400).json({ error: 'Fecha es requerida' });
            }

            console.log('📅 Fecha recibida:', fecha);

            // Verificar si es día festivo
            const esFestivo = await DiaFestivo.esFestivo(fecha);
            if (esFestivo) {
                return res.json({ 
                    disponible: false,
                    mensaje: 'La barbería está cerrada en días festivos',
                    horarios: []
                });
            }

            // Obtener día de la semana - parsear fecha directamente
            const [year, month, day] = fecha.split('-').map(Number);
            const fechaLocal = new Date(year, month - 1, day);
            
            moment.locale('en');
            const diaIngles = moment(fechaLocal).format('dddd').toLowerCase();
            moment.locale('es');
            
            // Mapear días en español
            const diasMap = {
                'monday': 'lunes',
                'tuesday': 'martes',
                'wednesday': 'miercoles',
                'thursday': 'jueves',
                'friday': 'viernes',
                'saturday': 'sabado',
                'sunday': 'domingo'
            };
            const diaEspanol = diasMap[diaIngles];

            // Si se especifica un empleado
            if (empleado_id) {
                const disponibilidad = await obtenerDisponibilidadEmpleado(
                    empleado_id, 
                    fecha, 
                    diaEspanol
                );
                return res.json(disponibilidad);
            }

            // Obtener todos los empleados activos
            const empleados = await Empleado.obtenerTodos();
            
            // Obtener disponibilidad de cada empleado
            const disponibilidadPorEmpleado = await Promise.all(
                empleados.map(async (empleado) => {
                    const disp = await obtenerDisponibilidadEmpleado(
                        empleado.id, 
                        fecha, 
                        diaEspanol
                    );
                    return {
                        empleado_id: empleado.id,
                        empleado_nombre: empleado.nombre,
                        ...disp
                    };
                })
            );

            // Consolidar horarios disponibles (cualquier empleado disponible)
            const horariosDisponibles = new Set();
            disponibilidadPorEmpleado.forEach(disp => {
                if (disp.disponible) {
                    disp.horarios.forEach(h => horariosDisponibles.add(h.hora));
                }
            });

            res.json({
                disponible: horariosDisponibles.size > 0,
                horarios_disponibles: Array.from(horariosDisponibles).sort(),
                por_empleado: disponibilidadPorEmpleado
            });
        } catch (error) {
            console.error('Error al obtener disponibilidad:', error);
            res.status(500).json({ error: 'Error al obtener disponibilidad' });
        }
    }
};

// Función auxiliar para obtener disponibilidad de un empleado
async function obtenerDisponibilidadEmpleado(empleadoId, fecha, diaSemana) {
    // Verificar si el empleado está bloqueado
    const estaBloqueado = await Bloqueo.verificarBloqueo(empleadoId, fecha);
    if (estaBloqueado) {
        return {
            disponible: false,
            mensaje: 'Empleado no disponible en esta fecha',
            horarios: []
        };
    }

    // Obtener horarios del empleado para ese día
    const horarios = await Horario.obtenerPorEmpleado(empleadoId);
    console.log('🔍 Horarios del empleado:', empleadoId, horarios);
    console.log('🔍 Día buscado:', diaSemana);
    const horarioDia = horarios.find(h => h.diaSemana === diaSemana);
    console.log('🔍 Horario encontrado:', horarioDia);

    if (!horarioDia) {
        return {
            disponible: false,
            mensaje: 'Empleado no trabaja este día',
            horarios: []
        };
    }

    // Generar slots de 1 hora (10:00 a 18:00, excluyendo 13:00)
    const horasDisponibles = [];
    for (let hora = 10; hora < 18; hora++) {
        if (hora === 13) continue; // Hora de almuerzo
        horasDisponibles.push(`${hora.toString().padStart(2, '0')}:00:00`);
    }

    // Obtener citas ya reservadas para este empleado en esta fecha
    const citasReservadas = await Cita.obtenerPorEmpleadoYFecha(empleadoId, fecha);
    const horasOcupadas = citasReservadas.map(c => c.hora);

    // Filtrar horarios disponibles
    const horariosLibres = horasDisponibles
        .filter(hora => !horasOcupadas.includes(hora))
        .map(hora => ({
            hora,
            disponible: true
        }));

    return {
        disponible: horariosLibres.length > 0,
        horarios: horariosLibres
    };
}

export default disponibilidadController;
