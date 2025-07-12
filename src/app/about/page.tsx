
'use client';
import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { users } from '@/lib/data';
import { Heart, Lightbulb, Users } from 'lucide-react';
import { useSettings } from '@/context/settings-context';

export default function AboutPage() {
    const { settings } = useSettings();
    const founders = React.useMemo(() => users.filter(u => u.isPartner && u.isVisibleToStudents), []);

    return (
        <div className="bg-background">
            <section className="relative py-20 md:py-32 bg-primary/5">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">{settings.aboutUsTitle}</h1>
                    <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                        {settings.aboutUsStory}
                    </p>
                </div>
            </section>

            <section className="py-16">
                <div className="container mx-auto px-4">
                     <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Card className="text-center border-0 shadow-none">
                            <CardHeader>
                                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                                    <Lightbulb className="h-10 w-10 text-primary" />
                                </div>
                                <CardTitle className="mt-4 font-headline">Nuestra Misión</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{settings.aboutUsMission}</p>
                            </CardContent>
                        </Card>
                        <Card className="text-center border-0 shadow-none">
                            <CardHeader>
                                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                                    <Heart className="h-10 w-10 text-primary" />
                                </div>
                                <CardTitle className="mt-4 font-headline">Nuestra Visión</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{settings.aboutUsVision}</p>
                            </CardContent>
                        </Card>
                        <Card className="text-center border-0 shadow-none lg:col-span-1 md:col-span-2">
                             <CardHeader>
                                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                                    <Users className="h-10 w-10 text-primary" />
                                </div>
                                <CardTitle className="mt-4 font-headline">Nuestros Valores</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{settings.aboutUsValues}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold font-headline">{settings.aboutUsTeamTitle}</h2>
                        <p className="text-lg text-muted-foreground mt-2">{settings.aboutUsTeamDescription}</p>
                    </div>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 justify-center">
                        {founders.map(teacher => (
                        <Card key={teacher.id} className="overflow-hidden text-center group">
                            <div className="relative h-72 w-full">
                                <Image
                                    src={teacher.avatar}
                                    alt={`Foto de ${teacher.name}`}
                                    layout="fill"
                                    objectFit="cover"
                                    className="transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint="portrait professional"
                                />
                            </div>
                            <CardContent className="p-6">
                                <h3 className="font-headline text-xl font-bold">{teacher.name}</h3>
                                <p className="text-sm text-primary font-semibold">{teacher.specialties?.join(', ')}</p>
                                <p className="text-sm text-muted-foreground mt-2">{teacher.bio}</p>
                            </CardContent>
                        </Card>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
