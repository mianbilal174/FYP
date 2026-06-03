'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Search,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import type { Alert } from '@/lib/types';

const severityConfig = {
  info: {
    icon: Info,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
  },
  critical: {
    icon: AlertCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
  },
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [alertsData, statsData] = await Promise.all([
        apiClient.getAlerts(100, false),
        apiClient.getAlertStats(24),
      ]);

      if (Array.isArray(alertsData)) {
        setAlerts(
          alertsData.map((alert: any) => ({
            id: alert.id || alert._id,
            sensor: alert.alert_type?.replace(/_/g, ' ') || 'Unknown',
            severity: alert.severity || 'info',
            message: alert.message,
            timestamp: new Date(alert.timestamp),
            isResolved: alert.is_resolved || false,
          }))
        );
      }

      if (statsData) {
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.sensor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const StatCard = ({ title, value, icon: Icon, trend }: any) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && (
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              {trend > 0 ? (
                <TrendingUp className="h-3 w-3 text-red-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500" />
              )}
              {Math.abs(trend)}% from last period
            </p>
          )}
        </div>
        <Icon className="h-10 w-10 text-muted-foreground opacity-50" />
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold">Alerts & Notifications</h1>
        <p className="mt-1 text-muted-foreground">Monitor and manage system alerts</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Total Alerts (24h)"
            value={stats.total_alerts || 0}
            icon={AlertCircle}
          />
          <StatCard
            title="Unresolved"
            value={stats.unresolved_alerts || 0}
            icon={XCircle}
          />
          <StatCard
            title="Critical"
            value={stats.alerts_by_severity?.critical || 0}
            icon={AlertCircle}
          />
          <StatCard
            title="Warnings"
            value={stats.alerts_by_severity?.warning || 0}
            icon={AlertTriangle}
          />
        </div>
      )}

      {/* Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'info', 'warning', 'critical'] as const).map((severity) => (
                <Button
                  key={severity}
                  variant={severityFilter === severity ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSeverityFilter(severity)}
                >
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Alerts List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-12 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-3" />
              <p className="text-lg font-semibold">No alerts found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm || severityFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'All systems are operating normally'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {filteredAlerts.map((alert) => {
                const config = severityConfig[alert.severity];
                const Icon = config.icon;

                return (
                  <div
                    key={alert.id}
                    className={`flex gap-4 p-4 rounded-lg border ${config.bg} ${config.border} transition-all hover:shadow-md`}
                  >
                    <div className={`flex-shrink-0 ${config.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold capitalize">{alert.sensor}</p>
                          <Badge className={config.badge}>{alert.severity}</Badge>
                          {alert.isResolved && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <time className="text-xs text-muted-foreground whitespace-nowrap">
                          {alert.timestamp.toLocaleString()}
                        </time>
                      </div>
                      <p className="text-sm">{alert.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Summary */}
          {!isLoading && filteredAlerts.length > 0 && (
            <div className="flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
              <p>
                Showing {filteredAlerts.length} of {alerts.length} alerts
              </p>
              <p>
                {filteredAlerts.filter((a) => !a.isResolved).length} unresolved
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Alert Type Breakdown */}
      {stats && stats.alerts_by_type && Object.keys(stats.alerts_by_type).length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Alert Breakdown by Type</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(stats.alerts_by_type).map(([type, count]: [string, any]) => (
              <div key={type} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-sm font-medium capitalize">{type.replace(/_/g, ' ')}</span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
