
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

type ClassPackPlan = MembershipPlanBase & {
  accessType: 'class_pack';
  classCount: number;
  allowedClasses: string[];
};

type TrialClassPlan = MembershipPlanBase & {
  accessType: 'trial_class';
  classCount: number;
  allowedClasses: string[];
};

export type MembershipPlan = UnlimitedPlan | ClassPackPlan | TrialClassPlan;

export type DanceClass = {
  id: string;
  name: string;
  styleId: string;
  levelId: string;
  teacher: string;
  teacherAvatar: string;
  day: string;
  time: string; // "HH:MM"
  room: string;
  duration: string; // e.g. '60 min'
  capacity: number;
  recurrence: 'one-time' | 'recurring';
  recurrenceMonths?: number;
  date?: string; // "YYYY-MM-DD"
  status: 'completed' | 'scheduled' | 'cancelled-low-attendance' | 'cancelled-teacher';
  enrolledStudentIds: number[];
};

export type Teacher = {
  name: string;
  avatar: string;
  bio: string;
  specialties: string[];
  payRate: number; // Pay per hour
};

export type User = {
    id: number;
    name: string;
    email: string;
    role: 'Estudiante' | 'Profesor' | 'Administrador' | 'Administrativo';
    joined: string;
    avatar: string;
};

export type Transaction = {
  id: string;
  type: 'ingreso' | 'egreso';
  category: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  receiptUrl?: string;
}

export type StudentMembership = {
  userId: number;
  planId: string;
  startDate: string;
  endDate: string;
  classesRemaining?: number;
}
