import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Overview } from '@/components/dashboard/overview';
import { UpcomingClasses } from '@/components/dashboard/upcoming-classes';
import { SmartSuggestion } from '@/components/dashboard/smart-suggestion';
import { HandHelping, CalendarClock, Bot } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membership</CardTitle>
            <HandHelping className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gold Plan</div>
            <p className="text-xs text-muted-foreground">Expires on Dec 24, 2024</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes Left</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">from your 10-class pack</p>
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Assistant</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Need Help?</div>
            <p className="text-xs text-muted-foreground">Get smart class suggestions</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Teacher Performance</CardTitle>
            <CardDescription>
              Monthly classes given by each teacher.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Upcoming Classes</CardTitle>
            <CardDescription>You have 3 classes this week.</CardDescription>
          </CardHeader>
          <CardContent>
            <UpcomingClasses />
          </CardContent>
        </Card>
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Bot size={24} className="text-primary"/>
                    Smart Class Suggestion
                </CardTitle>
                <CardDescription>
                    Can't make it to a class? Find the perfect alternative with our AI assistant.
                    Just tell us your preferences and the conflict, and we'll do the rest.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <SmartSuggestion />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
