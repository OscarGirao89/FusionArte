
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  const hashedPassword = await bcrypt.hash('password123', 10);

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
  
  // Seed Users
  const usersData = [
    { id: 1, name: 'Ana López', email: 'ana.lopez@email.com', password: hashedPassword, role: 'Estudiante', joined: new Date('2023-01-15'), avatar: 'https://placehold.co/100x100.png?text=AL', dob: new Date('1995-05-20'), mobile: '600111222'},
    { id: 2, name: 'Oscar Girao', email: 'oscar.girao@email.com', password: hashedPassword, role: 'Socio', joined: new Date('2022-01-01'), avatar: 'https://placehold.co/100x100.png?text=OG', isPartner: true, isVisibleToStudents: true, bio: 'Cofundador de FusionArte y experto en Salsa y Bachata con más de 15 años de experiencia.', specialties: ['Salsa On1', 'Bachata Fusión']},
    { id: 3, name: 'Marta Rodriguez', email: 'marta.rodriguez@email.com', password: hashedPassword, role: 'Estudiante', joined: new Date('2023-03-10'), avatar: 'https://placehold.co/100x100.png?text=MR', dob: new Date('1998-11-02'), mobile: '600333444'},
    { id: 4, name: 'Admin FusionArte', email: 'admin@fusionarte.com', password: hashedPassword, role: 'Administrador', joined: new Date('2022-01-01'), avatar: 'https://placehold.co/100x100.png?text=AF'},
    { id: 5, name: 'Carlos Gomez', email: 'carlos.gomez@email.com', password: hashedPassword, role: 'Profesor', joined: new Date('2022-06-01'), avatar: 'https://placehold.co/100x100.png?text=CG', bio: 'Profesor de Hip Hop especializado en Popping y Locking.', specialties: ['Hip Hop', 'Popping'], paymentDetailsJson: { type: 'per_class', payRate: 25, cancelledClassPay: 10 }},
    { id: 6, name: 'Elena Peña', email: 'elena.pena@email.com', password: hashedPassword, role: 'Profesor', joined: new Date('2022-09-15'), avatar: 'https://placehold.co/100x100.png?text=EP', bio: 'Instructora certificada de Aeroyoga, apasionada por el bienestar y el movimiento consciente.', specialties: ['Aeroyoga', 'Elongación'], paymentDetailsJson: { type: 'monthly', monthlySalary: 1200, cancelledClassPay: 0 }},
    { id: 7, name: 'Laura Martinez', email: 'laura.martinez@email.com', password: hashedPassword, role: 'Administrativo', joined: new Date('2023-02-01'), avatar: 'https://placehold.co/100x100.png?text=LM' },
    { id: 10, name: 'Alexandra', email: 'alexandra@email.com', password: hashedPassword, role: 'Profesor', joined: new Date('2022-03-01'), avatar: 'https://placehold.co/100x100.png?text=A', isPartner: false, isVisibleToStudents: true, bio: 'Bailarina profesional y apasionada por la enseñanza de ritmos latinos.', specialties: ['M-Zouk', 'Bachata Sensual'], paymentDetailsJson: { type: 'percentage', payRate: 50, cancelledClassPay: 15 }}
  ];

  for (const u of usersData) {
      await prisma.user.upsert({
          where: { email: u.email },
          update: u,
          create: u,
      });
  }
  console.log('Users seeded.');

  // Seed Dance Classes
  const danceClassesData = [
    { id: 'salsa-iniciacion', name: 'Salsa Iniciación', type: 'recurring', styleId: 'salsa', levelId: 'iniciacion', teacherIds: [2], enrolledStudentIds: [1], day: 'Lunes', time: '19:00', room: 'Estudio 1', duration: '60 min', capacity: 20, status: 'scheduled' },
    { id: 'bachata-basico', name: 'Bachata Básico', type: 'recurring', styleId: 'bachata', levelId: 'basico', teacherIds: [2, 10], enrolledStudentIds: [3], day: 'Lunes', time: '20:00', room: 'Estudio 1', duration: '60 min', capacity: 20, status: 'scheduled' },
    { id: 'm-zouk-intermedio', name: 'M-Zouk Intermedio', type: 'recurring', styleId: 'm-zouk', levelId: 'intermedio', teacherIds: [10], enrolledStudentIds: [], day: 'Martes', time: '20:00', room: 'Estudio 2', duration: '90 min', capacity: 15, status: 'scheduled' },
    { id: 'hip-hop-avanzado', name: 'Hip Hop Avanzado', type: 'recurring', styleId: 'hip-hop', levelId: 'avanzado', teacherIds: [5], enrolledStudentIds: [], day: 'Miércoles', time: '18:30', room: 'Estudio 1', duration: '60 min', capacity: 25, status: 'scheduled' },
    { id: 'aeroyoga-todos', name: 'Aeroyoga', type: 'recurring', styleId: 'aeroyoga', levelId: 'todos', teacherIds: [6], enrolledStudentIds: [3], day: 'Jueves', time: '10:00', room: 'Estudio 2', duration: '75 min', capacity: 10, status: 'scheduled' },
    { id: 'workshop-salsa-on2', name: 'Taller de Salsa On2', type: 'workshop', styleId: 'salsa', levelId: 'intermedio', teacherIds: [2], enrolledStudentIds: [], day: 'Sábado', time: '12:00', room: 'Estudio 1', duration: '120 min', capacity: 30, status: 'scheduled', date: new Date('2024-08-10'), workshopPaymentType: 'percentage', workshopPaymentValue: 60 },
  ];

  for (const dc of danceClassesData) {
    const { teacherIds, enrolledStudentIds, ...classData } = dc;
    await prisma.danceClass.upsert({
        where: { id: classData.id },
        update: {},
        create: {
            ...classData,
            teachers: {
                connect: teacherIds.map(id => ({ id }))
            },
            enrolledStudents: {
                connect: enrolledStudentIds.map(id => ({ id }))
            }
        }
    });
  }
  console.log('Dance Classes seeded.');

  // Seed Membership Plans
  const membershipPlansData = [
      { id: 'unlimited-1', title: 'Pase Ilimitado', price: 80, description: 'Acceso a todas las clases regulares.', features: ['Clases ilimitadas', 'Acceso a prácticas libres', 'Descuentos en talleres'], isPopular: true, durationUnit: 'months', durationValue: 1, accessType: 'unlimited', visibility: 'public', allowedClasses: [] },
      { id: 'pack-10', title: 'Bono 10 Clases', price: 100, description: '10 clases a tu elección.', features: ['10 clases', 'Válido por 3 meses'], isPopular: false, durationUnit: 'months', durationValue: 3, accessType: 'class_pack', classCount: 10, allowedClasses: [], visibility: 'public' },
      { id: 'trial', title: 'Clase de Prueba', price: 10, description: 'Prueba una de nuestras clases.', features: ['1 clase', 'Válido por 1 semana'], isPopular: false, durationUnit: 'weeks', durationValue: 1, accessType: 'trial_class', classCount: 1, allowedClasses: [], visibility: 'public'},
      { id: 'course-salsa-1', title: 'Pase Mensual Salsa', price: 40, description: 'Acceso a todas las clases de Salsa durante un mes.', features: ['Todas las clases de Salsa', 'Flexibilidad mensual'], isPopular: false, durationUnit: 'months', durationValue: 1, accessType: 'course_pass', allowedClasses: ['salsa-iniciacion'], visibility: 'unlisted'},
      { id: 'custom-pack', title: 'Bono Personalizado', price: 0, description: 'Crea tu propio bono de clases.', features: ['Elige el número de clases', 'Descuentos por volumen'], isPopular: true, durationUnit: 'months', durationValue: 3, accessType: 'custom_pack', allowedClasses: [], visibility: 'public', priceTiersJson: [{classCount: 4, price: 40}, {classCount: 8, price: 75}, {classCount: 12, price: 100}]}
  ];
  for (const plan of membershipPlansData) {
      await prisma.membershipPlan.upsert({
          where: { id: plan.id },
          update: {},
          create: plan,
      });
  }
  console.log('Membership Plans seeded.');

  // Seed Student Memberships
  const studentMembershipsData = [
    { userId: 1, planId: 'unlimited-1', startDate: new Date('2024-07-01'), endDate: new Date('2024-07-31') },
    { userId: 3, planId: 'pack-10', startDate: new Date('2024-06-15'), endDate: new Date('2024-09-15'), classesRemaining: 8 },
  ];
  for (const sm of studentMembershipsData) {
      await prisma.studentMembership.upsert({
          where: { userId_planId: { userId: sm.userId, planId: sm.planId } },
          update: {
            startDate: sm.startDate,
            endDate: sm.endDate,
            classesRemaining: sm.classesRemaining,
          },
          create: {
            userId: sm.userId,
            planId: sm.planId,
            startDate: sm.startDate,
            endDate: sm.endDate,
            classesRemaining: sm.classesRemaining,
          },
      });
  }
  console.log('Student Memberships seeded.');
  
  // Seed Coupons
  const couponsData = [
    { id: 'verano20', code: 'VERANO20', discountType: 'percentage', discountValue: 20, status: 'active', applicableTo: 'all_memberships' },
    { id: 'salsapass', code: 'SALSAPASS', discountType: 'fixed', discountValue: 5, status: 'active', applicableTo: 'specific_memberships', specificPlanIds: ['course-salsa-1'] },
  ];
  for (const coupon of couponsData) {
      const { specificPlanIds, ...couponData } = coupon;
      await prisma.coupon.upsert({
          where: { code: coupon.code },
          update: {},
          create: {
              ...couponData,
              specificPlans: {
                connect: (specificPlanIds || []).map(planId => ({ id: planId }))
              },
          },
      });
  }
  console.log('Coupons seeded.');
  
  // Seed Transactions
  const transactionsData = [
    { id: 'tx-1', type: 'egreso', category: 'Suministros', description: 'Compra de botellas de agua', amount: 30.50, date: new Date('2024-07-05') },
    { id: 'tx-2', type: 'ingreso', category: 'Alquiler', description: 'Alquiler de sala para ensayo de compañía externa', amount: 50.00, date: new Date('2024-07-08') },
  ];
  for (const t of transactionsData) {
      await prisma.transaction.upsert({
          where: { id: t.id },
          update: {},
          create: t,
      });
  }
  console.log('Transactions seeded.');

  // Seed Student Payments
  const studentPaymentsData = [
    { id: 'inv-1', studentId: 1, planId: 'unlimited-1', invoiceDate: new Date('2024-07-01'), totalAmount: 80, status: 'paid', amountPaid: 80, amountDue: 0, notes: 'Pago completo por Bizum' },
    { id: 'inv-2', studentId: 3, planId: 'pack-10', invoiceDate: new Date('2024-06-15'), totalAmount: 100, status: 'deposit', amountPaid: 50, amountDue: 50, notes: 'Paga la mitad ahora, resto a fin de mes.' },
  ];
  for (const sp of studentPaymentsData) {
      await prisma.studentPayment.upsert({
          where: { id: sp.id },
          update: {},
          create: sp,
      });
  }
  console.log('Student Payments seeded.');

  // Seed Roles
  const rolesData = [
      { id: 'admin', name: 'Administrador', permissions: ['view_dashboard', 'manage_users', 'manage_students', 'manage_classes', 'manage_memberships', 'manage_finances', 'manage_settings', 'manage_roles', 'take_attendance'] },
      { id: 'socio', name: 'Socio', permissions: ['view_dashboard', 'manage_users', 'manage_students', 'manage_classes', 'manage_memberships', 'manage_finances', 'manage_settings', 'view_teacher_area', 'take_attendance'] },
      { id: 'profesor', name: 'Profesor', permissions: ['view_teacher_area', 'take_attendance'] },
      { id: 'administrativo', name: 'Administrativo', permissions: ['view_dashboard', 'manage_students', 'manage_classes'] },
      { id: 'student', name: 'Estudiante', permissions: [] },
  ];
  for (const role of rolesData) {
      await prisma.role.upsert({
          where: { name: role.name },
          update: {},
          create: role,
      });
  }
  console.log('Roles seeded.');

  // Seed TaskNotes
  const taskNotesData = [
    { id: 'task-1', title: 'Preparar evento de verano', description: 'Contactar proveedores y confirmar DJs.', status: 'in_progress', category: 'Eventos', priority: 'high', createdAt: new Date('2024-07-01'), dueDate: new Date('2024-07-20'), assigneeIds: [2] },
    { id: 'task-2', title: 'Comprar nuevos espejos para Estudio 2', description: 'Tomar medidas y pedir presupuesto.', status: 'todo', category: 'Mantenimiento', priority: 'medium', createdAt: new Date('2024-07-05'), assigneeIds: [4, 7] },
    { id: 'task-3', title: 'Llamar a Ana López por pago pendiente', description: 'Factura inv-2, pendiente de 50€', status: 'todo', category: 'Pagos', priority: 'low', createdAt: new Date('2024-07-10'), alertDateTime: new Date('2024-07-11T09:00:00') ,assigneeIds: [7] },
  ];
  for (const task of taskNotesData) {
      const { assigneeIds, ...taskData } = task;
      await prisma.taskNote.upsert({
          where: { id: task.id },
          update: {
              ...taskData,
              assignees: {
                  connect: assigneeIds.map(id => ({ id }))
              }
          },
          create: {
              ...taskData,
              assignees: {
                  connect: assigneeIds.map(id => ({ id }))
              }
          }
      });
  }
  console.log('TaskNotes seeded.');


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
