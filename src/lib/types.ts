
export type DanceStyle = {
  id: string;
  name: string;
  description: string;
};

export type DanceLevel = {
  id: string;
  name: string;
  description: string;
};

type MembershipPlanBase = {
  id: string;
  title: string;
  price: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  durationUnit: 'days' | 'weeks' | 'months';
  durationValue: number;
};

type UnlimitedPlan = MembershipPlanBase & {
  accessType: 'unlimited';
};

type PackClassesPlan = MembershipPlanBase & {
  accessType: 'pack_classes';
  classCount: number;
  allowedStyles: string[];
};

type TrialClassPlan = MembershipPlanBase & {
  accessType: 'trial_class';
  classCount: number;
  allowedStyles: string[];
};

export type MembershipPlan = UnlimitedPlan | PackClassesPlan | TrialClassPlan;

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
  date?: string;
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
    role: 'Estudiante' | 'Profesor' | 'Administrador' | 'Administrativo';
    joined: string;
    avatar: string;
}
