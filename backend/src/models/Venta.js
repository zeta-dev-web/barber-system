import prisma from '../config/prisma.js';

const Venta = {
  async crear(citaId, empleadoId, servicioId, fecha, monto) {
    const result = await prisma.venta.create({
      data: {
        citaId: parseInt(citaId),
        empleadoId: parseInt(empleadoId),
        servicioId: parseInt(servicioId),
        fecha: new Date(fecha),
        monto
      }
    });
    return result;
  },

  async obtenerPorFecha(fecha) {
    return await prisma.venta.findMany({
      where: { fecha: new Date(fecha) },
      include: {
        empleado: { select: { nombre: true } },
        servicio: { select: { nombre: true } },
        cita: { select: { clienteNombre: true } }
      },
      orderBy: { creadoEn: 'desc' }
    });
  },

  async obtenerPorRango(fechaInicio, fechaFin) {
    return await prisma.venta.findMany({
      where: {
        fecha: {
          gte: new Date(fechaInicio),
          lte: new Date(fechaFin)
        }
      },
      include: {
        empleado: { select: { nombre: true } },
        servicio: { select: { nombre: true } },
        cita: { select: { clienteNombre: true } }
      },
      orderBy: [
        { fecha: 'asc' },
        { creadoEn: 'desc' }
      ]
    });
  },

  async reporteDiario(fecha) {
    const fechaDate = new Date(fecha);
    
    const ventas = await prisma.venta.findMany({
      where: { fecha: fechaDate },
      include: {
        empleado: { select: { nombre: true } },
        servicio: { select: { nombre: true } }
      }
    });

    const total = {
      total_ventas: ventas.length,
      total_dinero: ventas.reduce((sum, v) => sum + Number(v.monto), 0)
    };

    const porEmpleado = Object.values(
      ventas.reduce((acc, v) => {
        const key = v.empleadoId;
        if (!acc[key]) {
          acc[key] = {
            empleado: v.empleado.nombre,
            cantidad_servicios: 0,
            total_ganado: 0
          };
        }
        acc[key].cantidad_servicios++;
        acc[key].total_ganado += Number(v.monto);
        return acc;
      }, {})
    ).sort((a, b) => b.total_ganado - a.total_ganado);

    const porServicio = Object.values(
      ventas.reduce((acc, v) => {
        const key = v.servicioId;
        if (!acc[key]) {
          acc[key] = {
            servicio: v.servicio.nombre,
            cantidad: 0,
            total: 0
          };
        }
        acc[key].cantidad++;
        acc[key].total += Number(v.monto);
        return acc;
      }, {})
    ).sort((a, b) => b.total - a.total);

    return {
      fecha,
      total,
      porEmpleado,
      porServicio
    };
  },

  async reporteSemanal(fechaInicio, fechaFin) {
    const ventas = await prisma.venta.findMany({
      where: {
        fecha: {
          gte: new Date(fechaInicio),
          lte: new Date(fechaFin)
        }
      },
      include: {
        empleado: { select: { nombre: true } }
      }
    });

    const total = {
      total_ventas: ventas.length,
      total_dinero: ventas.reduce((sum, v) => sum + Number(v.monto), 0)
    };

    const porDia = Object.values(
      ventas.reduce((acc, v) => {
        const fecha = v.fecha.toISOString().split('T')[0];
        if (!acc[fecha]) {
          acc[fecha] = { fecha, total_ventas: 0, total_dinero: 0 };
        }
        acc[fecha].total_ventas++;
        acc[fecha].total_dinero += Number(v.monto);
        return acc;
      }, {})
    ).sort((a, b) => a.fecha.localeCompare(b.fecha));

    const porEmpleado = Object.values(
      ventas.reduce((acc, v) => {
        const key = v.empleadoId;
        if (!acc[key]) {
          acc[key] = {
            empleado: v.empleado.nombre,
            cantidad_servicios: 0,
            total_ganado: 0
          };
        }
        acc[key].cantidad_servicios++;
        acc[key].total_ganado += Number(v.monto);
        return acc;
      }, {})
    ).sort((a, b) => b.total_ganado - a.total_ganado);

    return {
      fechaInicio,
      fechaFin,
      total,
      porDia,
      porEmpleado
    };
  },

  async reporteMensual(fechaInicio, fechaFin) {
    const ventas = await prisma.venta.findMany({
      where: {
        fecha: {
          gte: new Date(fechaInicio),
          lte: new Date(fechaFin)
        }
      },
      include: {
        empleado: { select: { nombre: true } },
        servicio: { select: { nombre: true } }
      }
    });

    const total = {
      total_ventas: ventas.length,
      total_dinero: ventas.reduce((sum, v) => sum + Number(v.monto), 0)
    };

    const porDia = Object.values(
      ventas.reduce((acc, v) => {
        const fecha = v.fecha.toISOString().split('T')[0];
        if (!acc[fecha]) {
          acc[fecha] = { fecha, total_ventas: 0, total_dinero: 0 };
        }
        acc[fecha].total_ventas++;
        acc[fecha].total_dinero += Number(v.monto);
        return acc;
      }, {})
    ).sort((a, b) => a.fecha.localeCompare(b.fecha));

    const porEmpleado = Object.values(
      ventas.reduce((acc, v) => {
        const key = v.empleadoId;
        if (!acc[key]) {
          acc[key] = {
            empleado: v.empleado.nombre,
            cantidad_servicios: 0,
            total_ganado: 0
          };
        }
        acc[key].cantidad_servicios++;
        acc[key].total_ganado += Number(v.monto);
        return acc;
      }, {})
    ).sort((a, b) => b.total_ganado - a.total_ganado);

    const porServicio = Object.values(
      ventas.reduce((acc, v) => {
        const key = v.servicioId;
        if (!acc[key]) {
          acc[key] = {
            servicio: v.servicio.nombre,
            cantidad: 0,
            total: 0
          };
        }
        acc[key].cantidad++;
        acc[key].total += Number(v.monto);
        return acc;
      }, {})
    ).sort((a, b) => b.total - a.total);

    return {
      fechaInicio,
      fechaFin,
      total,
      porDia,
      porEmpleado,
      porServicio
    };
  },

  async existePorCita(citaId) {
    const venta = await prisma.venta.findUnique({
      where: { citaId: parseInt(citaId) }
    });
    return !!venta;
  },

  async eliminarPorCita(citaId) {
    await prisma.venta.delete({
      where: { citaId: parseInt(citaId) }
    });
    return true;
  }
};

export default Venta;
