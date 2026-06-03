'use client';

import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: ReactNode;
  status: 'good' | 'warning' | 'critical';
  trend?: number;
  lastUpdated?: Date;
  sparklineData?: number[];
}

const statusColors = {
  good: 'bg-green-500',
  warning: 'bg-amber-500',
  critical: 'bg-red-500',
};

const statusTextColors = {
  good: 'text-green-700 bg-green-50',
  warning: 'text-amber-700 bg-amber-50',
  critical: 'text-red-700 bg-red-50',
};

export function MetricCard({
  title,
  value,
  unit,
  icon,
  status,
  trend,
  lastUpdated,
  sparklineData,
}: MetricCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold">{value}</span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusTextColors[status]}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>

            {trend !== undefined && (
              <div className={`flex items-center gap-1 text-sm ${trend >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {trend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{Math.abs(trend).toFixed(1)}%</span>
              </div>
            )}
          </div>

          {lastUpdated && (
            <p className="mt-3 text-xs text-muted-foreground">
              Updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="rounded-lg bg-primary/10 p-3">{icon}</div>
      </div>

      {sparklineData && (
        <div className="mt-6 h-12 rounded-lg bg-muted/30 p-2">
          <svg viewBox="0 0 100 20" className="w-full h-full" preserveAspectRatio="none">
            <polyline
              points={sparklineData
                .map((val, idx) => `${(idx / (sparklineData.length - 1)) * 100},${20 - (val / 100) * 20}`)
                .join(' ')}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              className="text-primary"
            />
          </svg>
        </div>
      )}
    </Card>
  );
}
