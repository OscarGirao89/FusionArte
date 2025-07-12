
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { danceClasses } from '@/lib/data';
import type { ClassInstance } from '@/lib/types';
import { format, eachDayOfInterval, getDay, isSameDay } from 'date-fns';

type StudentAttendanceStatus = {
  studentId: number;
  present: boolean;
};

type ClassAttendanceRecord = {
  classId: string;
  date: string; // YYYY-MM-DD
  status: 'completed' | 'scheduled';
  studentStatus: StudentAttendanceStatus[];
};

export interface AttendanceContextType {
  classInstances: ClassInstance[];
  generateInstancesForTeacher: (teacherId: number, start: Date, end: Date) => void;
  confirmClass: (classId: string, date: string) => void;
  recordAttendance: (classId: string, date: string, studentStatus: StudentAttendanceStatus[]) => void;
  getAttendanceForClass: (classId: string, date: string) => ClassAttendanceRecord | undefined;
  resetAttendance: () => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

const daysOfWeekMap = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export const AttendanceProvider = ({ children }: { children: ReactNode }) => {
  const [classInstances, setClassInstances] = useState<ClassInstance[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, ClassAttendanceRecord>>({});

  const generateInstancesForTeacher = useCallback((teacherId: number, start: Date, end: Date) => {
    const teacherClasses = danceClasses.filter(c => c.teacherIds.includes(teacherId));
    
    const newInstances: ClassInstance[] = [];
    const interval = eachDayOfInterval({ start, end });

    interval.forEach(day => {
      const dayOfWeekName = daysOfWeekMap[getDay(day)];
      const dateStr = format(day, 'yyyy-MM-dd');

      teacherClasses.forEach(c => {
        let shouldAdd = false;
        if (c.type === 'recurring' && c.day === dayOfWeekName) {
          shouldAdd = true;
        } else if (c.date && isSameDay(parseISO(c.date), day)) {
          shouldAdd = true;
        }

        if (shouldAdd) {
          const instanceId = `${c.id}-${dateStr}`;
          if (!classInstances.some(inst => inst.instanceId === instanceId)) {
            const record = attendanceRecords[instanceId];
            newInstances.push({
              ...c,
              instanceId,
              date: dateStr,
              status: record ? record.status : 'scheduled', // Use recorded status or default to scheduled
            });
          }
        }
      });
    });

    // We only update if there are new instances to avoid infinite loops
    if (newInstances.length > 0) {
        setClassInstances(prev => {
            const existingIds = new Set(prev.map(i => i.instanceId));
            const filteredNew = newInstances.filter(i => !existingIds.has(i.instanceId));
            return [...prev, ...filteredNew].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        });
    }
  }, [attendanceRecords, classInstances]);

  const confirmClass = useCallback((classId: string, date: string) => {
    const instanceId = `${classId}-${date}`;
    setClassInstances(prev => prev.map(inst => inst.instanceId === instanceId ? { ...inst, status: 'completed' } : inst));
    setAttendanceRecords(prev => ({
        ...prev,
        [instanceId]: {
            ...prev[instanceId],
            classId,
            date,
            status: 'completed',
        }
    }));
  }, []);

  const recordAttendance = useCallback((classId: string, date: string, studentStatus: StudentAttendanceStatus[]) => {
     const instanceId = `${classId}-${date}`;
     setAttendanceRecords(prev => ({
         ...prev,
         [instanceId]: {
             classId,
             date,
             status: prev[instanceId]?.status || 'scheduled',
             studentStatus,
         }
     }));
  }, []);
  
  const getAttendanceForClass = useCallback((classId: string, date: string) => {
    const instanceId = `${classId}-${date}`;
    return attendanceRecords[instanceId];
  }, [attendanceRecords]);

  const resetAttendance = useCallback(() => {
    setClassInstances([]);
    setAttendanceRecords({});
  }, []);

  const value = {
    classInstances,
    generateInstancesForTeacher,
    confirmClass,
    recordAttendance,
    getAttendanceForClass,
    resetAttendance,
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = (): AttendanceContextType => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
