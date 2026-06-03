'use client';

import { Card } from '@/components/ui/card';
import { Activity, Bell, BarChart3, Zap } from 'lucide-react';

const features = [
  {
    icon: Activity,
    title: 'Real-time Monitoring',
    description: 'Live sensor data streams with instant updates for all environmental parameters',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Intelligent notifications when conditions exceed optimal thresholds',
  },
  {
    icon: BarChart3,
    title: 'Data Analytics',
    description: 'Comprehensive historical data visualization and trend analysis',
  },
  {
    icon: Zap,
    title: 'Resource Optimization',
    description: 'Automated irrigation recommendations to save water and maximize yield',
  },
];

export function Features() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl text-balance">Powerful Features for Modern Farming</h2>
          <p className="mt-4 text-lg text-muted-foreground text-balance">
            Everything you need to manage your crops with precision
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
