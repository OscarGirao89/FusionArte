

import type { MembershipPlan, DanceClass, User, DanceStyle, DanceLevel, StudentMembership, Role } from './types';

export const danceStyles: DanceStyle[] = [
  { id: 'salsa', name: 'Salsa', description: 'Ritmos latinos vibrantes y enérgicos. Origen cubano y puertorriqueño.' },
  { id: 'bachata', name: 'Bachata', description: 'Baile sensual y romántico de la República Dominicana.' },
  { id: 'm-zouk', name: 'M-Zouk', description: 'Un estilo de Zouk brasileño moderno y fluido.' },
  { id: 'elongacion', name: 'Elongación', description: 'Técnicas para mejorar la flexibilidad y el rango de movimiento.' },
  { id: 'gimnasia-ritmica', name: 'Gimnasia Rítmica', description: 'Disciplina que combina ballet, gimnasia y danza.' },
  { id: 'aeroyoga', name: 'Aeroyoga', description: 'Yoga en suspensión que combina posturas con acrobacias.' },
  { id: 'practica', name: 'Práctica', description: 'Espacio libre para practicar y perfeccionar tus movimientos.' },
  { id: 'hip-hop', name: 'Hip Hop', description: 'Cultura y baile urbano con diversos estilos como popping, locking y breakdance.' },
  { id: 'contemporaneo', name: 'Contemporáneo', description: 'Expresión libre que combina elementos de ballet, jazz y danza moderna.' },
  { id: 'tango', name: 'Tango', description: 'Baile apasionado y elegante originario de Argentina.' },
  { id: 'flamenco', name: 'Flamenco', description: 'Arte español que combina cante, toque y baile con una fuerte expresión emocional.' },
];

export const danceLevels: DanceLevel[] = [
    { id: 'principiante', name: 'Principiante', description: 'Para quienes están dando sus primeros pasos.' },
    { id: 'intermedio', name: 'Intermedio', description: 'Para bailarines con una base sólida que buscan perfeccionar.' },
    { id: 'avanzado', name: 'Avanzado', description: 'Para bailarines experimentados listos para un desafío.' },
    { id: 'todos', name: 'Todos los Niveles', description: 'Clases abiertas para cualquier nivel de experiencia.' },
];

export const users: User[] = [
  { 
    id: 1, name: 'Ana López', email: 'ana.lopez@example.com', role: 'Estudiante', joined: '2023-09-01', avatar: 'https://placehold.co/100x100.png?text=AL',
    dob: '1998-07-12', mobile: '600111222',
    attendanceHistory: [
      { classId: 'clase-1', date: '2024-07-01', status: 'presente' },
      { classId: 'clase-2', date: '2024-07-01', status: 'presente' },
      { classId: 'clase-5', date: '2024-07-03', status: 'ausente' },
      { classId: 'clase-8', date: '2024-07-04', status: 'presente' },
    ]
  },
  { 
    id: 2, name: 'Oscar Girao', email: 'oscar.girao@example.com', role: 'Socio', joined: '2022-05-20', avatar: 'https://placehold.co/100x100.png?text=OG',
    bio: 'Profesor experto en ritmos latinos con una pasión por la enseñanza.',
    specialties: ['Bachata', 'Salsa', 'M-Zouk'],
    paymentDetails: { type: 'per_class', payRate: 25, cancelledClassPay: 10 },
    isVisibleToStudents: true,
    isPartner: true,
  },
  { 
    id: 3, name: 'Beatriz Sanz', email: 'beatriz.sanz@example.com', role: 'Estudiante', joined: '2024-01-15', avatar: 'https://placehold.co/100x100.png?text=BS',
    dob: '2001-08-25', mobile: '600333444',
    attendanceHistory: [
      { classId: 'clase-1', date: '2024-07-01', status: 'presente' },
      { classId: 'clase-3', date: '2024-07-02', status: 'presente' },
      { classId: 'clase-5', date: '2024-07-03', status: 'presente' },
      { classId: 'clase-7', date: '2024-07-04', status: 'ausente' },
    ]
  },
  { id: 4, name: 'Admin FusionArte', email: 'admin@fusionarte.com', role: 'Administrador', joined: '2022-01-01', avatar: 'https://placehold.co/100x100.png?text=AF' },
  { 
    id: 5, name: 'Flor Diaz', email: 'flor.diaz@example.com', role: 'Socio', joined: '2022-03-10', avatar: 'https://placehold.co/100x100.png?text=FD',
    bio: 'Bailarina profesional con años de experiencia en escenarios internacionales.',
    specialties: ['Bachata', 'Salsa', 'M-Zouk'],
    paymentDetails: { type: 'monthly', monthlySalary: 2500, cancelledClassPay: 0 },
    isVisibleToStudents: true,
    isPartner: true,
  },
  { 
    id: 6, name: 'Joana Garcia', email: 'joana.garcia@example.com', role: 'Socio', joined: '2023-08-11', avatar: 'https://placehold.co/100x100.png?text=JG',
    bio: 'Especialista en técnicas de elongación y flexibilidad para bailarines.',
    specialties: ['Elongación', 'Stretching', 'Gimnasia Rítmica'],
    paymentDetails: { type: 'per_class', payRate: 20, cancelledClassPay: 5 },
    isVisibleToStudents: true,
    isPartner: true,
  },
  { id: 7, name: 'Laura Martinez', email: 'laura.martinez@example.com', role: 'Administrativo', joined: '2023-11-10', avatar: 'https://placehold.co/100x100.png?text=LM' },
  { id: 8, name: 'David Chen', email: 'david.chen@example.com', role: 'Estudiante', joined: '2023-10-05', avatar: 'https://placehold.co/100x100.png?text=DC', dob: '1995-07-30', attendanceHistory: [] },
  { id: 9, name: 'Sophia Rodriguez', email: 'sophia.r@example.com', role: 'Estudiante', joined: '2022-11-12', avatar: 'https://placehold.co/100x100.png?text=SR', dob: '1999-02-14', attendanceHistory: [] },
  { 
    id: 10, name: 'Alexandra', email: 'alexandra@example.com', role: 'Profesor', joined: '2023-02-18', avatar: 'https://placehold.co/100x100.png?text=A',
    bio: 'Instructora certificada de Aeroyoga, combinando danza y acrobacia aérea.',
    specialties: ['Aeroyoga'],
    paymentDetails: { type: 'per_class', payRate: 30, cancelledClassPay: 10 },
    isVisibleToStudents: true,
    isPartner: false,
  },
  { id: 11, name: 'Carlos Ruiz', email: 'carlos.r@example.com', role: 'Estudiante', joined: '2024-05-10', avatar: 'https://placehold.co/100x100.png?text=CR', dob: '1994-11-05', attendanceHistory: [] },
  { id: 12, name: 'Elena Vega', email: 'elena.v@example.com', role: 'Estudiante', joined: '2024-06-01', avatar: 'https://placehold.co/100x100.png?text=EV', dob: '2000-03-22', attendanceHistory: [] },
  { id: 13, name: 'Martin Gomez', email: 'martin.g@example.com', role: 'Estudiante', joined: '2024-07-02', avatar: 'https://placehold.co/100x100.png?text=MG', dob: '1997-09-18', attendanceHistory: [] },
  { id: 14, name: 'Lucia Fernandez', email: 'lucia.f@example.com', role: 'Estudiante', joined: '2024-07-05', avatar: 'https://placehold.co/100x100.png?text=LF', dob: '2002-01-30', attendanceHistory: [] },
  { id: 15, name: 'Javier Moreno', email: 'javier.m@example.com', role: 'Estudiante', joined: '2024-07-10', avatar: 'https://placehold.co/100x100.png?text=JM', dob: '1996-06-15', attendanceHistory: [] },
];

export const membershipPlans: MembershipPlan[] = [
  {
    id: 'trial-1',
    title: 'Clase de Prueba',
    description: 'Una clase para que pruebes la que más te guste.',
    price: 15,
    features: ['1 clase a tu elección', 'Experimenta nuestra comunidad'],
    accessType: 'trial_class',
    classCount: 1,
    allowedClasses: [],
    durationUnit: 'days',
    durationValue: 7,
    visibility: 'public',
  },
  {
    id: 'pack-10',
    title: 'Bono de 10 Clases',
    description: 'Un bono flexible para que uses cuando quieras.',
    price: 120,
    features: ['10 clases de cualquier estilo', 'Horario flexible', 'Vence a los 3 meses', 'Puedes cambiar tu selección hasta 24h antes de la clase.'],
    accessType: 'class_pack',
    classCount: 10,
    allowedClasses: [],
    durationUnit: 'months',
    durationValue: 3,
    isPopular: true,
    visibility: 'public',
  },
  {
    id: 'custom-pack-1',
    title: 'Bono Personalizado',
    description: 'Crea tu propio bono eligiendo el número de clases.',
    price: 0,
    features: ['Elige de 2 a 12 clases', 'Aplica a estilos seleccionados', 'Cuantas más clases, mejor el precio'],
    accessType: 'custom_pack',
    pricePerClass: 11,
    minClasses: 2,
    maxClasses: 12,
    allowedStyles: ['salsa', 'bachata', 'm-zouk'],
    durationUnit: 'months',
    durationValue: 3,
    visibility: 'public',
  },
  {
    id: 'unlimited-1',
    title: 'Ilimitado Mensual',
    description: 'Baila todo lo que quieras durante un mes.',
    price: 99,
    features: ['Clases ilimitadas', 'Acceso a todos los estilos y niveles', 'Reserva prioritaria en talleres', 'Válido para el mes en curso o el próximo.'],
    accessType: 'unlimited',
    durationUnit: 'months',
    durationValue: 1,
    isPopular: true,
    visibility: 'public',
  },
  {
    id: 'pass-salsa-monthly',
    title: 'Pase Mensual de Salsa',
    description: 'Acceso ilimitado a todas nuestras clases de Salsa por un mes.',
    price: 65,
    features: ['Todas las clases de Salsa, todos los niveles', 'Acceso a prácticas de Salsa', 'Válido por 30 días'],
    accessType: 'course_pass',
    allowedClasses: ['clase-1', 'clase-6', 'clase-9', 'clase-12', 'clase-15'],
    durationUnit: 'months',
    durationValue: 1,
    visibility: 'public',
  },
  {
    id: 'beginner-pass',
    title: 'Pase de Principiante',
    description: 'Acceso a todas las clases para principiantes.',
    price: 75,
    features: ['Acceso a todas las clases de principiantes', 'Perfecto para nuevos bailarines', 'Únete a un grupo de apoyo'],
    accessType: 'unlimited',
    durationUnit: 'months',
    durationValue: 1,
    visibility: 'unlisted',
  },
];

export const studentMemberships: StudentMembership[] = [
    { userId: 1, planId: 'unlimited-1', startDate: '2024-07-01', endDate: '2024-07-31' },
    { userId: 3, planId: 'pack-10', startDate: '2024-07-03', endDate: '2024-10-03', classesRemaining: 8 },
    { userId: 8, planId: 'beginner-pass', startDate: '2024-06-15', endDate: '2024-07-15' },
    { userId: 9, planId: 'pack-10', startDate: '2024-03-01', endDate: '2024-06-01' }, // Expired
    { userId: 11, planId: 'unlimited-1', startDate: '2024-07-01', endDate: '2024-07-31' },
    { userId: 12, planId: 'pack-10', startDate: '2024-07-01', endDate: '2024-10-01', classesRemaining: 10 },
    { userId: 13, planId: 'unlimited-1', startDate: '2024-07-02', endDate: '2024-08-02' },
    { userId: 14, planId: 'pack-10', startDate: '2024-07-05', endDate: '2024-10-05', classesRemaining: 10 },
    { userId: 15, planId: 'trial-1', startDate: '2024-07-10', endDate: '2024-07-17', classesRemaining: 1 },
];

export const danceClasses: DanceClass[] = [
    // Lunes
    { id: 'clase-1', name: 'Salsa', type: 'recurring', styleId: 'salsa', levelId: 'intermedio', teacherIds: [5], day: 'Lunes', time: '19:00', room: 'Estudio 1', duration: '60 min', capacity: 20, recurrenceMonths: 3, status: 'completed', enrolledStudentIds: [1, 3, 8], cancellationPolicyHours: 24 },
    { id: 'clase-2', name: 'Bachata (Compartida O+F)', type: 'recurring', styleId: 'bachata', levelId: 'intermedio', teacherIds: [2, 5], day: 'Lunes', time: '20:00', room: 'Estudio 1', duration: '60 min', capacity: 18, recurrenceMonths: 3, status: 'completed', enrolledStudentIds: [1, 9, 13], cancellationPolicyHours: 24 },
    { id: 'clase-3', name: 'M-Zouk', type: 'recurring', styleId: 'm-zouk', levelId: 'principiante', teacherIds: [2], day: 'Lunes', time: '21:00', room: 'Estudio 1', duration: '60 min', capacity: 25, recurrenceMonths: 6, status: 'completed', enrolledStudentIds: [3], cancellationPolicyHours: 24 },
    
    // Martes
    { id: 'clase-4', name: 'Elongación', type: 'recurring', styleId: 'elongacion', levelId: 'todos', teacherIds: [6], day: 'Martes', time: '19:00', room: 'Estudio 2', duration: '60 min', capacity: 15, recurrenceMonths: 3, status: 'scheduled', enrolledStudentIds: [8, 9, 14], cancellationPolicyHours: 24 },
    { id: 'clase-5', name: 'Bachata', type: 'recurring', styleId: 'bachata', levelId: 'principiante', teacherIds: [5], day: 'Martes', time: '20:00', room: 'Estudio 1', duration: '60 min', capacity: 20, recurrenceMonths: 3, status: 'scheduled', enrolledStudentIds: [1, 3], cancellationPolicyHours: 24 },
    { id: 'clase-6', name: 'Salsa', type: 'recurring', styleId: 'salsa', levelId: 'principiante', teacherIds: [2], day: 'Martes', time: '21:00', room: 'Estudio 1', duration: '60 min', capacity: 18, recurrenceMonths: 3, status: 'cancelled-low-attendance', enrolledStudentIds: [9], cancellationPolicyHours: 24 },
    
    // Miercoles
    { id: 'clase-7', name: 'Aeroyoga', type: 'recurring', styleId: 'aeroyoga', levelId: 'todos', teacherIds: [10], day: 'Miércoles', time: '18:00', room: 'Estudio 3', duration: '60 min', capacity: 10, recurrenceMonths: 3, status: 'completed', enrolledStudentIds: [3, 8], cancellationPolicyHours: 24 },
    { id: 'clase-8', name: 'Bachata', type: 'recurring', styleId: 'bachata', levelId: 'intermedio', teacherIds: [5], day: 'Miércoles', time: '20:00', room: 'Estudio 1', duration: '60 min', capacity: 15, recurrenceMonths: 2, status: 'completed', enrolledStudentIds: [1, 15], cancellationPolicyHours: 24 },
    { id: 'clase-9', name: 'Taller de Salsa On2', type: 'workshop', styleId: 'salsa', levelId: 'avanzado', teacherIds: [2], time: '21:00', room: 'Estudio 1', duration: '90 min', capacity: 20, date: '2024-08-30', status: 'scheduled', enrolledStudentIds: [1, 9], workshopPaymentType: 'percentage', workshopPaymentValue: 50, day: 'Miércoles' },

    // Jueves
    { id: 'clase-10', name: 'Gimnasia Rítmica', type: 'recurring', styleId: 'gimnasia-ritmica', levelId: 'principiante', teacherIds: [6], day: 'Jueves', time: '19:00', room: 'Estudio 2', duration: '60 min', capacity: 20, recurrenceMonths: 4, status: 'completed', enrolledStudentIds: [1, 3, 8], cancellationPolicyHours: 24 },
    { id: 'clase-11', name: 'M-Zouk (Compartida O+J)', type: 'recurring', styleId: 'm-zouk', levelId: 'intermedio', teacherIds: [2, 6], day: 'Jueves', time: '20:00', room: 'Estudio 1', duration: '60 min', capacity: 16, recurrenceMonths: 3, status: 'scheduled', enrolledStudentIds: [13, 14], cancellationPolicyHours: 24 },
    { id: 'clase-12', name: 'Salsa', type: 'recurring', styleId: 'salsa', levelId: 'intermedio', teacherIds: [5], day: 'Jueves', time: '21:00', room: 'Estudio 1', duration: '60 min', capacity: 15, recurrenceMonths: 4, status: 'cancelled-teacher', enrolledStudentIds: [1, 3], cancellationPolicyHours: 24 },
    
    // Viernes
    { id: 'rental-1', name: 'Alquiler: Ensayo Teatro', type: 'rental', styleId: 'practica', levelId: 'todos', teacherIds: [], time: '10:00', room: 'Estudio 3', duration: '180 min', capacity: 30, date: '2024-09-01', status: 'scheduled', enrolledStudentIds: [], isVisibleToStudents: false, rentalContact: 'Compañía de Teatro Local', rentalPrice: 150, day: 'Viernes' },
    { id: 'clase-13', name: 'Práctica Libre', type: 'recurring', styleId: 'practica', levelId: 'todos', teacherIds: [], day: 'Viernes', time: '20:30', room: 'Todos los Estudios', duration: '120 min', capacity: 50, recurrenceMonths: 12, status: 'completed', enrolledStudentIds: [1, 3, 8, 9] },
    { id: 'clase-14', name: 'Bachata Sensual', type: 'recurring', styleId: 'bachata', levelId: 'avanzado', teacherIds: [2], day: 'Viernes', time: '19:00', room: 'Estudio 2', duration: '60 min', capacity: 15, recurrenceMonths: 3, status: 'scheduled', enrolledStudentIds: [1, 11, 13], cancellationPolicyHours: 24 },
    { id: 'clase-15', name: 'Rueda de Casino (Compartida O+F)', type: 'workshop', styleId: 'salsa', levelId: 'intermedio', teacherIds: [2, 5], time: '20:00', room: 'Estudio 1', duration: '90 min', capacity: 20, date: '2024-09-06', status: 'scheduled', enrolledStudentIds: [3, 11, 12], workshopPaymentType: 'fixed', workshopPaymentValue: 100, day: 'Viernes' },

    // Sabado
    { id: 'clase-16', name: 'Taller de Conexión (Compartida O+J)', type: 'workshop', styleId: 'm-zouk', levelId: 'todos', teacherIds: [2, 6], time: '12:00', room: 'Estudio 3', duration: '120 min', capacity: 20, date: '2024-09-07', status: 'scheduled', enrolledStudentIds: [1, 9, 12], workshopPaymentType: 'percentage', workshopPaymentValue: 60, day: 'Sábado' },
    { id: 'clase-17', name: 'Tango (Compartida F+J)', type: 'recurring', styleId: 'tango', levelId: 'principiante', teacherIds: [5, 6], day: 'Sábado', time: '18:00', room: 'Estudio 2', duration: '75 min', capacity: 14, recurrenceMonths: 3, status: 'scheduled', enrolledStudentIds: [14, 15], cancellationPolicyHours: 24 },
    { id: 'clase-18', name: 'Hip Hop (Individual O)', type: 'recurring', styleId: 'hip-hop', levelId: 'todos', teacherIds: [2], day: 'Sábado', time: '19:30', room: 'Estudio 1', duration: '60 min', capacity: 20, recurrenceMonths: 3, status: 'scheduled', enrolledStudentIds: [13, 15], cancellationPolicyHours: 24 },
];

export const roles: Role[] = [
    {
      id: 'admin',
      name: 'Administrador',
      permissions: [
        'view_dashboard',
        'manage_users',
        'manage_students',
        'manage_classes',
        'manage_memberships',
        'manage_finances',
        'manage_settings',
        'manage_roles',
        'take_attendance'
      ]
    },
    {
      id: 'socio',
      name: 'Socio',
      permissions: [
        'view_dashboard',
        'manage_users',
        'manage_students',
        'manage_classes',
        'manage_memberships',
        'manage_finances',
        'view_teacher_area',
        'take_attendance'
      ]
    },
    {
      id: 'teacher',
      name: 'Profesor',
      permissions: [
        'view_dashboard',
        'view_teacher_area',
        'take_attendance'
      ]
    },
    {
      id: 'student',
      name: 'Estudiante',
      permissions: [
        'view_dashboard',
      ]
    },
    {
      id: 'administrative',
      name: 'Administrativo',
      permissions: [
        'view_dashboard',
        'manage_students',
        'take_attendance'
      ]
    }
  ];
