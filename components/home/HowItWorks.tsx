'use client';

import { Card } from '@/components/ui/card';
import { SunSnow as Sensor, Database, Brain, Bell, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: Sensor,
    title: 'Sensors',
    description: 'IoT sensors measure soil moisture, temperature, humidity, and light intensity',
  },
  {
    icon: Database,
    title: 'Data Collection',
    description: 'Real-time data is collected and transmitted via MQTT protocol',
  },
  {
    icon: Brain,
    title: 'Analysis',
    description: 'Advanced algorithms analyze patterns and detect anomalies',
  },
  {
    icon: Bell,
    title: 'Alerts',
    description: 'Smart notifications alert you when action is needed',
  },
  {
    icon: CheckCircle,
    title: 'Action',
    description: 'Make informed decisions to optimize irrigation and crop health',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-20 bg-muted/30">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl text-balance">How It Works</h2>
          <p className="mt-4 text-lg text-muted-foreground text-balance">
            From sensor data to actionable insights in real-time
          </p>
        </div>

        <div className="grid gap-4 md:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-primary p-4">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="mt-4 h-12 w-1 bg-gradient-to-b from-primary to-primary/30" />
                  )}
                </div>
                <div className="pt-2">
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
