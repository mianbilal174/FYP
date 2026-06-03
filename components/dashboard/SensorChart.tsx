'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ChartDataPoint } from '@/lib/types';

interface SensorChartProps {
  data: ChartDataPoint[];
  isLoading?: boolean;
}

const timeRanges = [
  { label: '1H', hours: 1 },
  { label: '6H', hours: 6 },
  { label: '24H', hours: 24 },
  { label: '7D', hours: 168 },
];

export function SensorChart({ data, isLoading = false }: SensorChartProps) {
  const [selectedRange, setSelectedRange] = useState(24);
  const [visibleLines, setVisibleLines] = useState({
    moisture: true,
    temperature: true,
    humidity: true,
    light: true,
  });

  const filteredData = useMemo(() => {
    if (!data.length) return [];
    const cutoff = Date.now() - selectedRange * 60 * 60 * 1000;
    return data.filter((point) => new Date(point.timestamp).getTime() >= cutoff);
  }, [data, selectedRange]);

  return (
    <Card className="p-6">
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Sensor Trends</h3>
          <div className="flex gap-2">
            {timeRanges.map((range) => (
              <Button
                key={range.hours}
                variant={selectedRange === range.hours ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRange(range.hours)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {[
            { key: 'moisture', label: 'Soil Moisture', color: '#0ea5e9' },
            { key: 'temperature', label: 'Temperature', color: '#f59e0b' },
            { key: 'humidity', label: 'Humidity', color: '#14b8a6' },
            { key: 'light', label: 'Light Intensity', color: '#eab308' },
          ].map((line) => (
            <button
              key={line.key}
              onClick={() =>
                setVisibleLines((prev) => ({
                  ...prev,
                  [line.key]: !prev[line.key as keyof typeof prev],
                }))
              }
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                visibleLines[line.key as keyof typeof visibleLines]
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: line.color }} />
              {line.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80 w-full">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Loading chart data...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="timestamp"
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return isNaN(d.getTime()) ? val : d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                }}
                tick={{ fill: 'var(--color-muted-foreground)' }}
              />
              <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
              <Tooltip
                labelFormatter={(label) => {
                  const d = new Date(label);
                  return isNaN(d.getTime()) ? label : d.toLocaleString();
                }}
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  color: 'var(--color-foreground)',
                }}
              />
              <Legend />
              {visibleLines.moisture && (
                <Line type="monotone" dataKey="moisture" stroke="#0ea5e9" isAnimationActive={false} dot={false} />
              )}
              {visibleLines.temperature && (
                <Line type="monotone" dataKey="temperature" stroke="#f59e0b" isAnimationActive={false} dot={false} />
              )}
              {visibleLines.humidity && (
                <Line type="monotone" dataKey="humidity" stroke="#14b8a6" isAnimationActive={false} dot={false} />
              )}
              {visibleLines.light && (
                <Line type="monotone" dataKey="light" stroke="#eab308" isAnimationActive={false} dot={false} />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
