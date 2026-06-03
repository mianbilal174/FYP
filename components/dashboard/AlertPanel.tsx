'use client';

import { Card } from '@/components/ui/card';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { Alert } from '@/lib/types';

interface AlertPanelProps {
  alerts: Alert[];
}

const severityIcons = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertCircle,
};

const severityColors = {
  info: 'text-blue-600 bg-blue-50',
  warning: 'text-amber-600 bg-amber-50',
  critical: 'text-red-600 bg-red-50',
};

export function AlertPanel({ alerts }: AlertPanelProps) {
  if (alerts.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Recent Alerts</h3>
        <p className="text-sm text-muted-foreground text-center py-8">No alerts at this time</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Recent Alerts</h3>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {alerts.slice(0, 10).map((alert, index) => {
          const Icon = severityIcons[alert.severity];
          const key = alert.id ?? `alert-${index}`;
          return (
            <div key={key} className={`flex gap-3 p-3 rounded-lg ${severityColors[alert.severity]}`}>
              <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium capitalize">{alert.sensor}</p>
                <p className="text-xs mt-1 line-clamp-2">{alert.message}</p>
                <p className="text-xs mt-1 opacity-70">{alert.timestamp.toLocaleTimeString()}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
