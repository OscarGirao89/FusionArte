
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
    id: 2, name: 'Oscar Girao', email: 'oscar.girao@example.com', role: 'Profesor', joined: '2022-05-20', avatar: 'https://placehold.co/100x100.png?text=OG',
    bio: 'Profesor experto en ritmos latinos con una pasión por la enseñanza.',
    specialties: ['Bachata', 'Salsa', 'M-Zouk'],
    paymentDetails: { type: 'per_class', payRate: 25, cancelledClassPay: 10 },
    isVisibleToStudents: true,
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
    id: 5, name: 'Flor Diaz', email: 'flor.diaz@example.com', role: 'Profesor', joined: '2022-03-10', avatar: 'https://placehold.co/100x100.png?text=FD',
    bio: 'Bailarina profesional con años de experiencia en escenarios internacionales.',
    specialties: ['Bachata', 'Salsa', 'M-Zouk'],
    paymentDetails: { type: 'monthly', monthlySalary: 2500, cancelledClassPay: 0 },
    isVisibleToStudents: true,
  },
  { 
    id: 6, name: 'Joana Garcia', email: 'joana.garcia@example.com', role: 'Profesor', joined: '2023-08-11', avatar: 'https://placehold.co/100x100.png?text=JG',
    bio: 'Especialista en técnicas de elongación y flexibilidad para bailarines.',
    specialties: ['Elongación', 'Stretching', 'Gimnasia Rítmica'],
    paymentDetails: { type: 'per_class', payRate: 20, cancelledClassPay: 5 },
    isVisibleToStudents: true,
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
  },
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
  },
];

export const studentMemberships: StudentMembership[] = [
    { userId: 1, planId: 'unlimited-1', startDate: '2024-07-01', endDate: '2024-07-31' },
    { userId: 3, planId: 'pack-10', startDate: '2024-07-03', endDate: '2024-10-03', classesRemaining: 8 },
    { userId: 8, planId: 'beginner-pass', startDate: '2024-06-15', endDate: '2024-07-15' },
    { userId: 9, planId: 'pack-10', startDate: '2024-03-01', endDate: '2024-06-01' }, // Expired
];

export const danceClasses: DanceClass[] = [
    // Lunes
    { id: 'clase-1', name: 'Salsa', type: 'recurring', styleId: 'salsa', levelId: 'intermedio', teacherIds: [5], day: 'Lunes', time: '19:00', room: 'Estudio 1', duration: '60 min', capacity: 20, recurrenceMonths: 3, status: 'completed', enrolledStudentIds: [1, 3, 8] },
    { id: 'clase-2', name: 'Bachata', type: 'recurring', styleId: 'bachata', levelId: 'intermedio', teacherIds: [2], day: 'Lunes', time: '20:00', room: 'Estudio 1', duration: '60 min', capacity: 18, recurrenceMonths: 3, status: 'completed', enrolledStudentIds: [1, 9] },
    { id: 'clase-3', name: 'M-Zouk', type: 'recurring', styleId: 'm-zouk', levelId: 'principiante', teacherIds: [2], day: 'Lunes', time: '21:00', room: 'Estudio 1', duration: '60 min', capacity: 25, recurrenceMonths: 6, status: 'completed', enrolledStudentIds: [3] },
    
    // Martes
    { id: 'clase-4', name: 'Elongación', type: 'recurring', styleId: 'elongacion', levelId: 'todos', teacherIds: [6], day: 'Martes', time: '19:00', room: 'Estudio 2', duration: '60 min', capacity: 15, recurrenceMonths: 3, status: 'scheduled', enrolledStudentIds: [8, 9] },
    { id: 'clase-5', name: 'Bachata', type: 'recurring', styleId: 'bachata', levelId: 'principiante', teacherIds: [5], day: 'Martes', time: '20:00', room: 'Estudio 1', duration: '60 min', capacity: 20, recurrenceMonths: 3, status: 'scheduled', enrolledStudentIds: [1, 3] },
    { id: 'clase-6', name: 'Salsa', type: 'recurring', styleId: 'salsa', levelId: 'principiante', teacherIds: [2], day: 'Martes', time: '21:00', room: 'Estudio 1', duration: '60 min', capacity: 18, recurrenceMonths: 3, status: 'cancelled-low-attendance', enrolledStudentIds: [9] },
    
    // Miercoles
    { id: 'clase-7', name: 'Aeroyoga', type: 'recurring', styleId: 'aeroyoga', levelId: 'todos', teacherIds: [10], day: 'Miércoles', time: '18:00', room: 'Estudio 3', duration: '60 min', capacity: 10, recurrenceMonths: 3, status: 'completed', enrolledStudentIds: [3, 8] },
    { id: 'clase-8', name: 'Bachata', type: 'recurring', styleId: 'bachata', levelId: 'intermedio', teacherIds: [5], day: 'Miércoles', time: '20:00', room: 'Estudio 1', duration: '60 min', capacity: 15, recurrenceMonths: 2, status: 'completed', enrolledStudentIds: [1] },
    { id: 'clase-9', name: 'Taller de Salsa On2', type: 'workshop', styleId: 'salsa', levelId: 'avanzado', teacherIds: [2], day: 'Miércoles', time: '21:00', room: 'Estudio 1', duration: '90 min', capacity: 20, date: '2024-08-30', status: 'scheduled', enrolledStudentIds: [1, 9], workshopPaymentType: 'percentage', workshopPaymentValue: 50 },

    // Jueves
    { id: 'clase-10', name: 'Gimnasia Rítmica', type: 'recurring', styleId: 'gimnasia-ritmica', levelId: 'principiante', teacherIds: [6], day: 'Jueves', time: '19:00', room: 'Estudio 2', duration: '60 min', capacity: 20, recurrenceMonths: 4, status: 'completed', enrolledStudentIds: [1, 3, 8] },
    { id: 'clase-11', name: 'M-Zouk', type: 'recurring', styleId: 'm-zouk', levelId: 'intermedio', teacherIds: [2], day: 'Jueves', time: '20:00', room: 'Estudio 1', duration: '60 min', capacity: 16, recurrenceMonths: 3, status: 'scheduled', enrolledStudentIds: [] },
    { id: 'clase-12', name: 'Salsa', type: 'recurring', styleId: 'salsa', levelId: 'intermedio', teacherIds: [5], day: 'Jueves', time: '21:00', room: 'Estudio 1', duration: '60 min', capacity: 15, recurrenceMonths: 4, status: 'cancelled-teacher', enrolledStudentIds: [1, 3] },
    
    // Viernes
    { id: 'rental-1', name: 'Alquiler: Ensayo Teatro', type: 'rental', styleId: 'practica', levelId: 'todos', teacherIds: [], day: 'Viernes', time: '10:00', room: 'Estudio 3', duration: '180 min', capacity: 30, date: '2024-09-01', status: 'scheduled', enrolledStudentIds: [], isVisibleToStudents: false, rentalPrice: 150 },
    { id: 'clase-13', name: 'Práctica Libre', type: 'recurring', styleId: 'practica', levelId: 'todos', teacherIds: [], day: 'Viernes', time: '20:30', room: 'Todos los Estudios', duration: '120 min', capacity: 50, recurrenceMonths: 12, status: 'completed', enrolledStudentIds: [1, 3, 8, 9] },

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
    
