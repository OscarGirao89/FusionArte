import type { MembershipPlan, DanceClass, Teacher } from './types';

export const membershipPlans: MembershipPlan[] = [
  {
    title: 'Trial Class',
    price: '15',
    pricePeriod: 'one-time',
    features: ['1 class of your choice', 'Valid for 7 days', 'Experience our community'],
    accessType: 'trial_class',
  },
  {
    title: '10-Class Pack',
    price: '120',
    pricePeriod: 'per pack',
    features: ['10 classes of any style', 'Valid for 3 months', 'Flexible schedule'],
    accessType: 'pack_classes',
    initialClasses: 10,
    isPopular: true,
  },
  {
    title: 'Monthly Unlimited',
    price: '99',
    pricePeriod: 'per month',
    features: ['Unlimited classes', 'Access to all styles & levels', 'Priority workshop booking'],
    accessType: 'unlimited',
    durationUnit: 'months',
    durationValue: 1,
  },
  {
    title: 'Beginner Pass',
    price: '75',
    pricePeriod: 'per month',
    features: ['Access to all beginner classes', 'Perfect for new dancers', 'Join a supportive group'],
    accessType: 'unlimited',
  },
];

export const danceClasses: DanceClass[] = [
    { id: 'salsa-b-1', name: 'Salsa', style: 'Salsa', level: 'Beginner', teacher: 'Elena Garcia', teacherAvatar: 'https://placehold.co/100x100/673AB7/FFFFFF.png', day: 'Monday', time: '19:00', room: 'Studio 1', duration: '60 min' },
    { id: 'bachata-i-1', name: 'Bachata', style: 'Bachata', level: 'Intermediate', teacher: 'Carlos Ruiz', teacherAvatar: 'https://placehold.co/100x100/673AB7/FFFFFF.png', day: 'Monday', time: '20:00', room: 'Studio 2', duration: '60 min' },
    { id: 'hiphop-a-1', name: 'Hip Hop', style: 'HipHop', level: 'Advanced', teacher: 'Aisha Jones', teacherAvatar: 'https://placehold.co/100x100/673AB7/FFFFFF.png', day: 'Tuesday', time: '18:30', room: 'Studio 1', duration: '90 min' },
    { id: 'contemporary-b-1', name: 'Contemporary', style: 'Contemporary', level: 'Beginner', teacher: 'Liam Smith', teacherAvatar: 'https://placehold.co/100x100/673AB7/FFFFFF.png', day: 'Tuesday', time: '19:30', room: 'Studio 3', duration: '75 min' },
    { id: 'salsa-i-1', name: 'Salsa', style: 'Salsa', level: 'Intermediate', teacher: 'Elena Garcia', teacherAvatar: 'https://placehold.co/100x100/673AB7/FFFFFF.png', day: 'Wednesday', time: '19:00', room: 'Studio 1', duration: '60 min' },
    { id: 'bachata-b-1', name: 'Bachata', style: 'Bachata', level: 'Beginner', teacher: 'Carlos Ruiz', teacherAvatar: 'https://placehold.co/100x100/673AB7/FFFFFF.png', day: 'Wednesday', time: '20:00', room: 'Studio 2', duration: '60 min' },
    { id: 'hiphop-b-1', name: 'Hip Hop', style: 'HipHop', level: 'Beginner', teacher: 'Aisha Jones', teacherAvatar: 'https://placehold.co/100x100/673AB7/FFFFFF.png', day: 'Thursday', time: '19:00', room: 'Studio 1', duration: '60 min' },
    { id: 'contemporary-i-1', name: 'Contemporary', style: 'Contemporary', level: 'Intermediate', teacher: 'Liam Smith', teacherAvatar: 'https://placehold.co/100x100/673AB7/FFFFFF.png', day: 'Thursday', time: '20:15', room: 'Studio 3', duration: '75 min' },
    { id: 'salsa-a-1', name: 'Salsa', style: 'Salsa', level: 'Advanced', teacher: 'Elena Garcia', teacherAvatar: 'https://placehold.co/100x100/673AB7/FFFFFF.png', day: 'Friday', time: '19:00', room: 'Studio 1', duration: '90 min' },
    { id: 'open-practice-1', name: 'Open Practice', style: 'Practice', level: 'All Levels', teacher: 'Studio', teacherAvatar: 'https://placehold.co/100x100/673AB7/FFFFFF.png', day: 'Friday', time: '20:30', room: 'All Studios', duration: '120 min' },
];

export const teachers: Teacher[] = [
  {
    name: 'Elena Garcia',
    avatar: 'https://placehold.co/400x400.png',
    bio: 'With over 15 years of experience, Elena is a master of Latin dance. Her passion for Salsa is contagious, and she creates a vibrant, supportive atmosphere in her classes.',
    specialties: ['Salsa On1', 'Salsa On2', 'Cuban Salsa', 'Styling'],
  },
  {
    name: 'Carlos Ruiz',
    avatar: 'https://placehold.co/400x400.png',
    bio: 'Carlos brings the heart of the Dominican Republic to his Bachata classes. He focuses on connection, musicality, and the smooth, sensual movements of modern and traditional Bachata.',
    specialties: ['Bachata Sensual', 'Dominican Bachata', 'Partnerwork'],
  },
  {
    name: 'Aisha Jones',
    avatar: 'https://placehold.co/400x400.png',
    bio: 'Aisha is a dynamic force in the world of Hip Hop. From old-school foundations to the latest commercial trends, her high-energy classes will challenge you and boost your confidence.',
    specialties: ['Popping', 'Locking', 'Choreography', 'Freestyle'],
  },
  {
    name: 'Liam Smith',
    avatar: 'https://placehold.co/400x400.png',
    bio: "Liam's approach to Contemporary dance is about storytelling through movement. He combines technical precision with emotional expression, encouraging students to find their unique voice.",
    specialties: ['Lyrical', 'Floorwork', 'Improvisation', 'Technique'],
  },
];
