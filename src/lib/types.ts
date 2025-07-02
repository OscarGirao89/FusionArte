

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

export type ClassType = 'recurring' | 'one-time' | 'workshop' | 'rental';

export type DanceClass = {
  id: string;
  name: string;
  type: ClassType;
  styleId: string;
  levelId: string;
  teacher: string;
  teacherAvatar: string;
  day: string;
  time: string; // "HH:MM"
  room: string;
  duration: string; // e.g. '60 min'
  capacity: number;
  status: 'completed' | 'scheduled' | 'cancelled-low-attendance' | 'cancelled-teacher';
  enrolledStudentIds: number[];
  
  // Type-specific fields
  recurrenceMonths?: number; // For 'recurring'
  date?: string; // "YYYY-MM-DD" for 'one-time', 'workshop', 'rental'
  isCancelledAndHidden?: boolean; // For cancelled classes, to hide from public schedule
  isVisibleToStudents?: boolean; // For 'rental'
  rentalPrice?: number; // For 'rental'
  workshopPaymentType?: 'fixed' | 'percentage'; // For 'workshop'
  workshopPaymentValue?: number; // For 'workshop'
};


export type AttendanceRecord = {
  classId: string;
  date: string; // YYYY-MM-DD
  status: 'presente' | 'ausente';
};

export type User = {
    id: number;
    name: string;
    email: string;
    role: 'Estudiante' | 'Profesor' | 'Administrador' | 'Administrativo';
    joined: string;
    avatar: string;
    dob?: string; // YYYY-MM-DD
    mobile?: string;
    isVisibleToStudents?: boolean;
    // Student-specific fields
    attendanceHistory?: AttendanceRecord[];
    // Teacher-specific fields
    bio?: string;
    specialties?: string[];
    paymentDetails?: {
        type: 'per_class' | 'monthly' | 'percentage';
        payRate?: number; // per hour for 'per_class' or percentage for 'percentage'
        monthlySalary?: number; // for 'monthly'
        cancelledClassPay: number; // Can be 0
    };
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

export type Permission = 
  | 'view_dashboard'
  | 'manage_users'
  | 'manage_students'
  | 'manage_classes'
  | 'manage_memberships'
  | 'manage_finances'
  | 'manage_settings'
  | 'manage_roles'
  | 'view_teacher_area'
  | 'take_attendance';

export type Role = {
  id: string;
  name: string;
  permissions: Permission[];
};
    
