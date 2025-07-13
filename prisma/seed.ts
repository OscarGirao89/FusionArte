
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  // Clean up database
  await prisma.studentPayment.deleteMany();
  await prisma.studentMembership.deleteMany();
  await prisma.danceClass.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.danceStyle.deleteMany();
  await prisma.danceLevel.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.taskNote.deleteMany();
  console.log('Database cleaned.');

  // Seed Roles
  const rolesData = [
      { id: 'admin', name: 'Admin', permissions: ['view_dashboard', 'manage_users', 'manage_students', 'manage_classes', 'manage_memberships', 'manage_finances', 'manage_settings', 'manage_roles', 'take_attendance'] },
      { id: 'socio', name: 'Socio', permissions: ['view_dashboard', 'manage_users', 'manage_students', 'manage_classes', 'manage_memberships', 'manage_finances', 'manage_settings', 'view_teacher_area', 'take_attendance'] },
      { id: 'profesor', name: 'Profesor', permissions: ['view_teacher_area', 'take_attendance'] },
      { id: 'administrativo', name: 'Administrativo', permissions: ['view_dashboard', 'manage_students', 'manage_classes'] },
      { id: 'estudiante', name: 'Estudiante', permissions: [] },
  ];
  for (const role of rolesData) {
      await prisma.role.upsert({
          where: { id: role.id },
          update: {},
          create: role,
      });
  }
  console.log('Roles seeded.');

  // Create one user for each role
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const usersToCreate = [
    { name: 'Admin User', email: 'admin@fusionarte.com', roleName: 'Admin' },
    { name: 'Socio User', email: 'socio@fusionarte.com', roleName: 'Socio' },
    { name: 'Profesor User', email: 'profesor@fusionarte.com', roleName: 'Profesor' },
    { name: 'Administrativo User', email: 'administrativo@fusionarte.com', roleName: 'Administrativo' },
    { name: 'Estudiante User', email: 'estudiante@fusionarte.com', roleName: 'Estudiante' },
  ];

  for (const userData of usersToCreate) {
      const initials = userData.name.split(' ').map(n => n[0]).join('');
      await prisma.user.create({
          data: {
              name: userData.name,
              email: userData.email,
              password: hashedPassword,
              role: userData.roleName,
              joined: new Date(),
              avatar: `https://placehold.co/100x100.png?text=${initials}`
          },
      });
      console.log(`Created user: ${userData.name}`);
  }

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
