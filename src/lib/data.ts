import type { MembershipPlan, DanceClass, Teacher } from './types';

export const membershipPlans: MembershipPlan[] = [
  {
    title: 'Clase de Prueba',
    price: '15',
    pricePeriod: 'única vez',
    features: ['1 clase a tu elección', 'Válido por 7 días', 'Experimenta nuestra comunidad'],
    accessType: 'trial_class',
  },
  {
    title: 'Paquete de 10 Clases',
    price: '120',
    pricePeriod: 'por paquete',
    features: ['10 clases de cualquier estilo', 'Válido por 3 meses', 'Horario flexible'],
    accessType: 'pack_classes',
    initialClasses: 10,
    isPopular: true,
  },
  {
    title: 'Ilimitado Mensual',
    price: '99',
    pricePeriod: 'por mes',
    features: ['Clases ilimitadas', 'Acceso a todos los estilos y niveles', 'Reserva prioritaria en talleres'],
    accessType: 'unlimited',
    durationUnit: 'months',
    durationValue: 1,
  },
  {
    title: 'Pase de Principiante',
    price: '75',
    pricePeriod: 'por mes',
    features: ['Acceso a todas las clases de principiantes', 'Perfecto para nuevos bailarines', 'Únete a un grupo de apoyo'],
    accessType: 'unlimited',
  },
];

export const danceClasses: DanceClass[] = [
    { id: 'salsa-b-1', name: 'Salsa', style: 'Salsa', level: 'Principiante', teacher: 'Elena Garcia', teacherAvatar: 'https://placehold.co/100x100.png', day: 'Lunes', time: '19:00', room: 'Estudio 1', duration: '60 min' },
    { id: 'bachata-i-1', name: 'Bachata', style: 'Bachata', level: 'Intermedio', teacher: 'Carlos Ruiz', teacherAvatar: 'https://placehold.co/100x100.png', day: 'Lunes', time: '20:00', room: 'Estudio 2', duration: '60 min' },
    { id: 'hiphop-a-1', name: 'Hip Hop', style: 'HipHop', level: 'Avanzado', teacher: 'Aisha Jones', teacherAvatar: 'https://placehold.co/100x100.png', day: 'Martes', time: '18:30', room: 'Estudio 1', duration: '90 min' },
    { id: 'contemporary-b-1', name: 'Contemporáneo', style: 'Contemporary', level: 'Principiante', teacher: 'Liam Smith', teacherAvatar: 'https://placehold.co/100x100.png', day: 'Martes', time: '19:30', room: 'Estudio 3', duration: '75 min' },
    { id: 'salsa-i-1', name: 'Salsa', style: 'Salsa', level: 'Intermedio', teacher: 'Elena Garcia', teacherAvatar: 'https://placehold.co/100x100.png', day: 'Miércoles', time: '19:00', room: 'Estudio 1', duration: '60 min' },
    { id: 'bachata-b-1', name: 'Bachata', style: 'Bachata', level: 'Principiante', teacher: 'Carlos Ruiz', teacherAvatar: 'https://placehold.co/100x100.png', day: 'Miércoles', time: '20:00', room: 'Estudio 2', duration: '60 min' },
    { id: 'hiphop-b-1', name: 'Hip Hop', style: 'HipHop', level: 'Principiante', teacher: 'Aisha Jones', teacherAvatar: 'https://placehold.co/100x100.png', day: 'Jueves', time: '19:00', room: 'Estudio 1', duration: '60 min' },
    { id: 'contemporary-i-1', name: 'Contemporáneo', style: 'Contemporary', level: 'Intermedio', teacher: 'Liam Smith', teacherAvatar: 'https://placehold.co/100x100.png', day: 'Jueves', time: '20:15', room: 'Estudio 3', duration: '75 min' },
    { id: 'salsa-a-1', name: 'Salsa', style: 'Salsa', level: 'Avanzado', teacher: 'Elena Garcia', teacherAvatar: 'https://placehold.co/100x100.png', day: 'Viernes', time: '19:00', room: 'Estudio 1', duration: '90 min' },
    { id: 'open-practice-1', name: 'Práctica Libre', style: 'Practice', level: 'Todos los Niveles', teacher: 'Estudio', teacherAvatar: 'https://placehold.co/100x100.png', day: 'Viernes', time: '20:30', room: 'Todos los Estudios', duration: '120 min' },
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
