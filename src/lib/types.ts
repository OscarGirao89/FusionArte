
export type DanceStyle = {
  id: string;
  name: string;
};

export type DanceLevel = {
  id: string;
  name: string;
  description: string;
};

export type MembershipPlan = {
  id: string;
  title: string;
  price: number;
  pricePeriod: string; // 'única vez', 'por mes', 'por paquete'
  description: string;
  features: string[];
  accessType: 'pack_classes' | 'unlimited' | 'trial_class';
  
  // For pack_classes
  classCount?: number;
  allowedStyles?: string[]; // array of style ids, empty for all styles

  // For unlimited
  durationUnit?: 'days' | 'months';
  durationValue?: number;

  isPopular?: boolean;
};

export type DanceClass = {
  id: string;
  name: string;
  styleId: string;
  levelId: string;
  teacher: string;
  teacherAvatar: string;
  day: string;
  time: string;
  room: string;
  duration: string; // e.g. '60 min'
  recurrence: 'one-time' | 'recurring';
  recurrenceMonths?: number;
};

export type Teacher = {
  name: string;
  avatar: string;
  bio: string;
  specialties: string[];
};

export type User = {
    id: number;
    name: string;
    email: string;
    role: 'Estudiante' | 'Profesor' | 'Administrador';
    joined: string;
    avatar: string;
}
