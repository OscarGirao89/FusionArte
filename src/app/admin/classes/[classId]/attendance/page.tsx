'use client';

import { AttendanceSheet } from '@/components/shared/attendance-sheet';
import { useParams } from 'next/navigation';

export default function AdminClassAttendancePage() {
  const params = useParams();
  const classId = params.classId as string;

  if (!classId) {
    return <div>Cargando...</div>;
  }

  return <AttendanceSheet classId={classId} userRole="admin" />;
}
