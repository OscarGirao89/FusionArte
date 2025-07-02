
import type { MembershipPlan, DanceClass, Teacher, User, DanceStyle, DanceLevel } from './types';

export const danceStyles: DanceStyle[] = [
  { id: 'salsa', name: 'Salsa' },
  { id: 'bachata', name: 'Bachata' },
  { id: 'hip-hop', name: 'Hip Hop' },
  { id: 'contemporaneo', name: 'Contemporáneo' },
  { id: 'practica', name: 'Práctica' },
  { id: 'tango', name: 'Tango' },
  { id: 'flamenco', name: 'Flamenco' },
];

export const danceLevels: DanceLevel[] = [
    { id: 'principiante', name: 'Principiante', description: 'Para quienes están dando sus primeros pasos.' },
    { id: 'intermedio', name: 'Intermedio', description: 'Para bailarines con una base sólida que buscan perfeccionar.' },
    { id: 'avanzado', name: 'Avanzado', description: 'Para bailarines experimentados listos para un desafío.' },
    { id: 'todos', name: 'Todos los Niveles', description: 'Clases abiertas para cualquier nivel de experiencia.' },
];

export const users: User[] = [
  { id: 1, name: 'Ana López', email: 'ana.lopez@example.com', role: 'Estudiante', joined: '2023-09-01', avatar: 'https://placehold.co/100x100.png?text=AL' },
  { id: 2, name: 'Carlos Ruiz', email: 'carlos.ruiz@example.com', role: 'Profesor', joined: '2022-05-20', avatar: 'https://placehold.co/100x100.png?text=CR' },
  { id: 3, name: 'Beatriz Sanz', email: 'beatriz.sanz@example.com', role: 'Estudiante', joined: '2024-01-15', avatar: 'https://placehold.co/100x100.png?text=BS' },
  { id: 4, name: 'Admin FusionArte', email: 'admin@fusionarte.com', role: 'Administrador', joined: '2022-01-01', avatar: 'https://placehold.co/100x100.png?text=AF' },
  { id: 5, name: 'Elena Garcia', email: 'elena.garcia@example.com', role: 'Profesor', joined: '2022-03-10', avatar: 'https://placehold.co/100x100.png?text=EG' },
  { id: 6, name: 'Liam Smith', email: 'liam.smith@example.com', role: 'Profesor', joined: '2023-08-11', avatar: 'https://placehold.co/100x100.png?text=LS' },
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
    allowedStyles: [],
    durationUnit: 'days',
    durationValue: 7,
  },
  {
    id: 'pack-10',
    title: 'Paquete de 10 Clases',
    description: 'Un paquete flexible para que uses cuando quieras.',
    price: 120,
    features: ['10 clases de cualquier estilo', 'Horario flexible'],
    accessType: 'pack_classes',
    classCount: 10,
    allowedStyles: [],
    durationUnit: 'months',
    durationValue: 3,
    isPopular: true,
  },
  {
    id: 'unlimited-1',
    title: 'Ilimitado Mensual',
    description: 'Baila todo lo que quieras durante un mes.',
    price: 99,
    features: ['Clases ilimitadas', 'Acceso a todos los estilos y niveles', 'Reserva prioritaria en talleres'],
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

export const danceClasses: DanceClass[] = [
    { id: 'clase-1', name: 'Salsa On1', styleId: 'salsa', levelId: 'principiante', teacher: 'Elena Garcia', teacherAvatar: 'https://placehold.co/100x100.png', day: 'Lunes', time: '19:00', room: 'Estudio 1', duration: '60 min', recurrence: 'recurring', recurrenceMonths: 3 },
    { id: 'clase-2', name: 'Bachata Sensual', styleId: 'bachata', levelId: 'intermedio', teacher: 'Carlos Ruiz', teacherAvatar: 'https://placehold.co/100x100.png', day: 'Lunes', time: '20:00', room: 'Estudio 2', duration: '60 min', recurrence: 'recurring', recurrenceMonths: 3 },
    { id: 'clase-3', name: 'Hip Hop Old School', styleId: 'hip-hop', levelId: 'avanzado', teacher: 'Aisha Jones', teacherAvatar: 'https://placehold.co/100x100.png', day: 'Martes', time: '18:30', room: 'Estudio 1', duration: '90 min', recurrence: 'recurring', recurrenceMonths: 6 },
    { id: 'clase-4', name: 'Contemporáneo Lirical', styleId: 'contemporaneo', levelId: 'principiante', teacher: 'Liam Smith', teacherAvatar: 'https://placehold.co/100x100.png', day: 'Martes', time: '19:30', room: 'Estudio 3', duration: '75 min', recurrence: 'one-time' },
    { id: 'clase-5', name: 'Taller de Salsa Caleña', styleId: 'salsa', levelId: 'intermedio', teacher: 'Elena Garcia', teacherAvatar: 'https://placehold.co/100x100.png', day: 'Miércoles', time: '19:00', room: 'Estudio 1', duration: '60 min', recurrence: 'one-time' },
    { id: 'clase-6', name: 'Bachata Dominicana', styleId: 'bachata', levelId: 'principiante', teacher: 'Carlos Ruiz', teacherAvatar: 'https://placehold.co/100x100.png', day: 'Miércoles', time: '20:00', room: 'Estudio 2', duration: '60 min', recurrence: 'recurring', recurrenceMonths: 3 },
    { id: 'clase-7', name: 'Hip Hop Commercial', styleId: 'hip-hop', levelId: 'principiante', teacher: 'Aisha Jones', teacherAvatar: 'https://placehold.co/100x100.png', day: 'Jueves', time: '19:00', room: 'Estudio 1', duration: '60 min', recurrence: 'recurring', recurrenceMonths: 3 },
    { id: 'clase-8', name: 'Contemporáneo Floorwork', styleId: 'contemporaneo', levelId: 'intermedio', teacher: 'Liam Smith', teacherAvatar: 'https://placehold.co/100x100.png', day: 'Jueves', time: '20:15', room: 'Estudio 3', duration: '75 min', recurrence: 'recurring', recurrenceMonths: 2 },
    { id: 'clase-9', name: 'Salsa On2', styleId: 'salsa', levelId: 'avanzado', teacher: 'Elena Garcia', teacherAvatar: 'https://placehold.co/100x100.png', day: 'Viernes', time: '19:00', room: 'Estudio 1', duration: '90 min', recurrence: 'one-time' },
    { id: 'clase-10', name: 'Práctica Libre', styleId: 'practica', levelId: 'todos', teacher: 'Estudio', teacherAvatar: 'https://placehold.co/100x100.png', day: 'Viernes', time: '20:30', room: 'Todos los Estudios', duration: '120 min', recurrence: 'recurring', recurrenceMonths: 12 },
    { id: 'clase-11', name: 'Tango Salón', styleId: 'tango', levelId: 'principiante', teacher: 'Carlos Ruiz', teacherAvatar: 'https://placehold.co/100x100.png', day: 'Sábado', time: '12:00', room: 'Estudio 2', duration: '90 min', recurrence: 'one-time' },
    { id: 'clase-12', name: 'Flamenco', styleId: 'flamenco', levelId: 'intermedio', teacher: 'Elena Garcia', teacherAvatar: 'https://placehold.co/100x100.png', day: 'Sábado', time: '14:00', room: 'Estudio 1', duration: '75 min', recurrence: 'recurring', recurrenceMonths: 4 },
];

export const teachers: Teacher[] = [
  {
    name: 'Elena Garcia',
    avatar: 'https://placehold.co/400x400.png',
    bio: 'Con más de 15 años de experiencia, Elena es una maestra del baile latino. Su pasión por la Salsa es contagiosa y crea una atmósfera vibrante y de apoyo en sus clases.',
    specialties: ['Salsa On1', 'Salsa On2', 'Salsa Cubana', 'Estilo'],
  },
  {
    name: 'Carlos Ruiz',
    avatar: 'https://placehold.co/400x400.png',
    bio: 'Carlos trae el corazón de la República Dominicana a sus clases de Bachata. Se enfoca en la conexión, la musicalidad y los movimientos suaves y sensuales de la Bachata moderna y tradicional.',
    specialties: ['Bachata Sensual', 'Bachata Dominicana', 'Trabajo en Pareja'],
  },
  {
    name: 'Aisha Jones',
    avatar: 'https://placehold.co/400x400.png',
    bio: 'Aisha es una fuerza dinámica en el mundo del Hip Hop. Desde las bases de la vieja escuela hasta las últimas tendencias comerciales, sus clases de alta energía te desafiarán y aumentarán tu confianza.',
    specialties: ['Popping', 'Locking', 'Coreografía', 'Freestyle'],
  },
  {
    name: 'Liam Smith',
    avatar: 'https://placehold.co/400x400.png',
    bio: "El enfoque de Liam hacia la danza contemporánea es contar historias a través del movimiento. Combina la precisión técnica con la expresión emocional, animando a los estudiantes a encontrar su voz única.",
    specialties: ['Lírico', 'Trabajo de Suelo', 'Improvisación', 'Técnica'],
  },
];

    