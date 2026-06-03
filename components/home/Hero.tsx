'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Sprout } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-12 md:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-primary/10 to-transparent" />
        </div>

        <div className="space-y-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
            <Sprout className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Smart Agriculture Starts Here</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight md:text-6xl text-balance">
            Smart Agriculture for a{' '}
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Sustainable Future
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl text-balance">
            Monitor soil moisture, temperature, humidity, and light intensity in real-time. Receive intelligent
            alerts and optimize irrigation for maximum crop yield while conserving water resources.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row justify-center">
            <Button asChild size="lg" className="rounded-lg">
              <Link href="/dashboard" className="gap-2">
                <span>View Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-lg bg-transparent">
              <Link href="#how-it-works">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
