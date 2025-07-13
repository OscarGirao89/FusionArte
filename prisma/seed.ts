
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  // Seed Roles (necessary for the admin user)
  const rolesData = [
      { id: 'admin', name: 'Administrador', permissions: ['view_dashboard', 'manage_users', 'manage_students', 'manage_classes', 'manage_memberships', 'manage_finances', 'manage_settings', 'manage_roles', 'take_attendance'] },
      { id: 'socio', name: 'Socio', permissions: ['view_dashboard', 'manage_users', 'manage_students', 'manage_classes', 'manage_memberships', 'manage_finances', 'manage_settings', 'view_teacher_area', 'take_attendance'] },
      { id: 'profesor', name: 'Profesor', permissions: ['view_teacher_area', 'take_attendance'] },
      { id: 'administrativo', name: 'Administrativo', permissions: ['view_dashboard', 'manage_students', 'manage_classes'] },
      { id: 'student', name: 'Estudiante', permissions: [] },
  ];
  for (const role of rolesData) {
      await prisma.role.upsert({
          where: { id: role.id },
          update: {},
          create: role,
      });
  }
  console.log('Roles seeded.');
  
  // Seed Dance Styles
  const danceStylesData = [
    { id: 'salsa', name: 'Salsa', description: 'Ritmos latinos llenos de energía y pasión.' },
    { id: 'bachata', name: 'Bachata', description: 'Baile sensual y romántico de la República Dominicana.' },
    { id: 'm-zouk', name: 'M-Zouk', description: 'Moderno zouk brasileño con movimientos fluidos y complejos.' },
    { id: 'aeroyoga', name: 'Aeroyoga', description: 'Yoga en suspensión que combina posturas, acrobacias y relajación.' },
    { id: 'elongacion', name: 'Elongación', description: 'Clases para mejorar la flexibilidad y el rango de movimiento.' },
    { id: 'hip-hop', name: 'Hip Hop', description: 'Cultura y movimiento urbano con diversos estilos.' },
    { id: 'practica', name: 'Práctica Libre', description: 'Espacio para practicar lo aprendido.' },
  ];
  for (const style of danceStylesData) {
    await prisma.danceStyle.upsert({
      where: { name: style.name },
      update: {},
      create: style,
    });
  }
  console.log('Dance Styles seeded.');
  
  // Seed Dance Levels
  const danceLevelsData = [
    { id: 'iniciacion', name: 'Iniciación', description: 'Para quienes nunca han bailado antes.' },
    { id: 'basico', name: 'Básico', description: 'Conocimientos fundamentales del baile.' },
    { id: 'intermedio', name: 'Intermedio', description: 'Dominio de pasos y figuras más complejas.' },
    { id: 'avanzado', name: 'Avanzado', description: 'Para bailarines con amplia experiencia y técnica.' },
    { id: 'todos', name: 'Todos los niveles', description: 'Clases abiertas a cualquier nivel de experiencia.' },
  ];
  for (const level of danceLevelsData) {
    await prisma.danceLevel.upsert({
      where: { name: level.name },
      update: {},
      create: level,
    });
  }
  console.log('Dance Levels seeded.');


  // Create a single Admin user
  const hashedPassword = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
      where: { email: 'admin@fusionarte.com' },
      update: {},
      create: {
          id: 4,
          name: 'Admin FusionArte',
          email: 'admin@fusionarte.com',
          password: hashedPassword,
          role: 'Administrador',
          joined: new Date(),
          avatar: 'https://placehold.co/100x100.png?text=AF'
      },
  });
  console.log('Admin user created.');

  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

