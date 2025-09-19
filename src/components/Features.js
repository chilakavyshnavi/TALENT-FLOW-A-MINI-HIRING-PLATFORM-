import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Settings2, Sparkles, Zap } from 'lucide-react';

const CardDecorator = ({ children }) => (
  <div className="mask-radial-from-40% mask-radial-to-60% relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
    <div
      aria-hidden
      className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-50"
    />
    <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">
      {children}
    </div>
  </div>
);

export default function Features() {
  return (
    <section id="features" className="py-16 md:py-32">
      <div className="@container mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl">Built to streamline your hiring</h2>
          <p className="mt-4">Powerful features designed to transform your recruitment process and find the best talent faster.</p>
        </div>
        <div className="mx-auto mt-8 grid max-w-6xl grid-cols-1 md:grid-cols-3 gap-6 [--color-background:var(--color-muted)] [--color-card:var(--color-muted)] *:text-center md:mt-16 dark:[--color-muted:var(--color-zinc-900)]">
          <Card className="group border-0 shadow-none">
            <CardHeader className="pb-3">
              <CardDecorator>
                <Zap
                  className="size-6"
                  aria-hidden
                />
              </CardDecorator>
              <h3 className="mt-6 pb-3 font-medium">Streamlined Hiring</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Transform your recruitment process with automated candidate screening, interview scheduling, and seamless pipeline management.</p>
            </CardContent>
          </Card>

          <Card className="group border-0 shadow-none">
            <CardHeader className="pb-3">
              <CardDecorator>
                <Settings2
                  className="size-6"
                  aria-hidden
                />
              </CardDecorator>
              <h3 className="mt-6 font-medium">Custom Workflows</h3>
            </CardHeader>
            <CardContent>
              <p className="mt-3 text-sm">Design your perfect hiring process with customizable job templates, assessment criteria, and approval workflows tailored to your company.</p>
            </CardContent>
          </Card>

          <Card className="group border-0 shadow-none">
            <CardHeader className="pb-3">
              <CardDecorator>
                <Sparkles
                  className="size-6"
                  aria-hidden
                />
              </CardDecorator>
              <h3 className="mt-6 font-medium">Smart Analytics</h3>
            </CardHeader>
            <CardContent>
              <p className="mt-3 text-sm">Make data-driven hiring decisions with comprehensive analytics, candidate insights, and performance metrics to optimize your recruitment strategy.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}