import React from 'react';
import { Users, Target } from 'lucide-react';

export default function About() {
    return (
        <section id="about" className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <h2 className="relative z-10 max-w-xl text-4xl font-medium lg:text-5xl text-left">The TalentFlow platform transforms your hiring process.</h2>
                <div className="grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24">
                    <div className="relative space-y-4">
                        <p className="text-muted-foreground text-left">
                            TalentFlow is evolving to be more than just recruitment software. <span className="text-accent-foreground font-bold">It supports an entire hiring ecosystem</span> — from candidate sourcing to onboarding.
                        </p>
                        <p className="text-muted-foreground text-left">It supports an entire ecosystem — from job posting platforms to assessment tools and analytics helping HR teams and businesses find the perfect talent faster.</p>

                        <div className="grid grid-cols-2 gap-3 pt-6 sm:gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Target className="size-4" />
                                    <h3 className="text-sm font-medium">Precise Matching</h3>
                                </div>
                                <p className="text-muted-foreground text-sm text-left">Match candidates with perfect roles using advanced algorithms.</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Users className="size-4" />
                                    <h3 className="text-sm font-medium">Team Collaboration</h3>
                                </div>
                                <p className="text-muted-foreground text-sm text-left">Enable seamless teamwork across HR and hiring managers.</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative mt-6 sm:mt-0">
                        <div className="bg-gradient-to-b aspect-[67/34] relative rounded-2xl from-zinc-300 to-transparent p-px dark:from-zinc-700">
                            <img 
                                src="/exercice.png" 
                                className="rounded-[15px] shadow w-full h-full object-cover" 
                                alt="TalentFlow platform illustration" 
                                width={1206} 
                                height={612} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}