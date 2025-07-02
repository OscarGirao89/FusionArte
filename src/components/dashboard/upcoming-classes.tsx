import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { danceClasses, users } from '@/lib/data';

export function UpcomingClasses() {
  const upcoming = danceClasses.slice(0, 3);
  const getTeacherNames = (ids: number[]) => users.filter(u => ids.includes(u.id)).map(t => t.name).join(', ');
  const getFirstTeacher = (ids: number[]) => users.find(u => ids.includes(u.id));

  return (
    <div className="space-y-6">
      {upcoming.map((c) => {
        const firstTeacher = getFirstTeacher(c.teacherIds);
        return (
          <div key={c.id} className="flex items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage src={firstTeacher?.avatar} alt={firstTeacher?.name} />
              <AvatarFallback>{firstTeacher?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{c.name} - {c.levelId}</p>
              <p className="text-sm text-muted-foreground">{c.day} a las {c.time} con {getTeacherNames(c.teacherIds)}</p>
            </div>
            <div className="ml-auto font-medium text-sm">{c.room}</div>
          </div>
        )
      })}
    </div>
  );
}
