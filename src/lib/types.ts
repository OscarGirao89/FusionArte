export type MembershipPlan = {
  title: string;
  price: string;
  pricePeriod: string;
  features: string[];
  accessType: 'pack_classes' | 'unlimited' | 'trial_class';
  initialClasses?: number;
  durationUnit?: 'months' | 'days';
  durationValue?: number;
  isPopular?: boolean;
};

export type DanceClass = {
  id: string;
  name: string;
  style: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  teacher: string;
  teacherAvatar: string;
  day: string;
  time: string;
  room: string;
  duration: string;
};

export type Teacher = {
  name: string;
  avatar: string;
  bio: string;
  specialties: string[];
};
