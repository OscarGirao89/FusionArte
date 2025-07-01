import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { danceClasses } from '@/lib/data';

export function UpcomingClasses() {
  const upcoming = danceClasses.slice(0, 3);

  return (
    <div className="space-y-6">
      {upcoming.map((c) => (
        <div key={c.id} className="flex items-center">
          <Avatar className="h-10 w-10">
            <AvatarImage src={c.teacherAvatar} alt={c.teacher} />
            <AvatarFallback>{c.teacher.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{c.name} - {c.level}</p>
            <p className="text-sm text-muted-foreground">{c.day} a las {c.time} con {c.teacher}</p>
          </div>
          <div className="ml-auto font-medium text-sm">{c.room}</div>
        </div>
      ))}
    </div>
  );
}
