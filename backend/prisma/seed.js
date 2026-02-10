import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Admin por defecto
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.administrador.upsert({
    where: { usuario: 'admin' },
    update: {},
    create: {
      usuario: 'admin',
      password: hashedPassword,
      nombre: 'Administrador Principal',
      email: 'admin@barberia.com',
    },
  });

  // Empleados
  const empleados = await Promise.all([
    prisma.empleado.upsert({
      where: { cedula: '1234567890' },
      update: {},
      create: {
        nombre: 'Carlos Rodríguez',
        cedula: '1234567890',
        foto: 'carlos.jpg',
      },
    }),
    prisma.empleado.upsert({
      where: { cedula: '0987654321' },
      update: {},
      create: {
        nombre: 'Miguel Ángel Torres',
        cedula: '0987654321',
        foto: 'miguel.jpg',
      },
    }),
    prisma.empleado.upsert({
      where: { cedula: '1122334455' },
      update: {},
      create: {
        nombre: 'Juan Pablo Gómez',
        cedula: '1122334455',
        foto: 'juan.jpg',
      },
    }),
  ]);

  // Servicios - Eliminar existentes y crear nuevos
  console.log('Limpiando servicios existentes...');
  await prisma.servicio.deleteMany({});
  
  console.log('Creando servicios...');
  await prisma.servicio.createMany({
    data: [
      {
        nombre: 'Corte de Cabello',
        descripcion: 'Corte de cabello clásico con máquina y tijera. Incluye shampoo y masaje capilar relajante',
        precio: 25000,
      },
      {
        nombre: 'Corte + Barba',
        descripcion: 'Corte de cabello más arreglo de barba completo. Incluye shampoo y masaje capilar relajante',
        precio: 40000,
      },
      {
        nombre: 'Afeitado Clásico',
        descripcion: 'Afeitado tradicional con navaja, vapor facial, toalla caliente y aceites esenciales para un acabado suave y refrescante',
        precio: 30000,
      },
      {
        nombre: 'Corte Infantil',
        descripcion: 'Corte de cabello para niños hasta 12 años. Incluye shampoo y masaje capilar relajante',
        precio: 20000,
      },
      {
        nombre: 'Diseño de Barba',
        descripcion: 'Diseño y perfilado de barba con técnicas profesionales',
        precio: 25000,
      },
    ],
  });

  // Horarios para todos los empleados (Lunes a Sábado)
  console.log('Limpiando horarios existentes...');
  await prisma.horario.deleteMany({});
  
  console.log('Creando horarios...');
  const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  for (const empleado of empleados) {
    for (const dia of dias) {
      await prisma.horario.create({
        data: {
          empleadoId: empleado.id,
          diaSemana: dia,
          horaInicio: '10:00:00',
          horaFin: '18:00:00',
        },
      });
    }
  }
  console.log(`✅ Creados ${dias.length * empleados.length} horarios`);

  // Días festivos Colombia 2025
  const festivos = [
    { fecha: '2025-01-01', descripcion: 'Año Nuevo' },
    { fecha: '2025-01-06', descripcion: 'Día de los Reyes Magos' },
    { fecha: '2025-03-24', descripcion: 'Día de San José' },
    { fecha: '2025-04-17', descripcion: 'Jueves Santo' },
    { fecha: '2025-04-18', descripcion: 'Viernes Santo' },
    { fecha: '2025-05-01', descripcion: 'Día del Trabajo' },
    { fecha: '2025-06-02', descripcion: 'Ascensión del Señor' },
    { fecha: '2025-06-23', descripcion: 'Corpus Christi' },
    { fecha: '2025-06-30', descripcion: 'Sagrado Corazón' },
    { fecha: '2025-07-07', descripcion: 'San Pedro y San Pablo' },
    { fecha: '2025-07-20', descripcion: 'Día de la Independencia' },
    { fecha: '2025-08-07', descripcion: 'Batalla de Boyacá' },
    { fecha: '2025-08-18', descripcion: 'Asunción de la Virgen' },
    { fecha: '2025-10-13', descripcion: 'Día de la Raza' },
    { fecha: '2025-11-03', descripcion: 'Todos los Santos' },
    { fecha: '2025-11-17', descripcion: 'Independencia de Cartagena' },
    { fecha: '2025-12-08', descripcion: 'Inmaculada Concepción' },
    { fecha: '2025-12-25', descripcion: 'Navidad' },
  ];

  for (const festivo of festivos) {
    await prisma.diaFestivo.upsert({
      where: { fecha: new Date(festivo.fecha) },
      update: {},
      create: {
        fecha: new Date(festivo.fecha),
        descripcion: festivo.descripcion,
      },
    });
  }

  console.log('✅ Seed completado');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
