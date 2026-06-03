'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface ThresholdSliderProps {
  title: string;
  min: number;
  max: number;
  step: number;
  warningValue: number;
  criticalValue: number;
  unit: string;
  onWarningChange: (value: number) => void;
  onCriticalChange: (value: number) => void;
  onReset: () => void;
}

export function ThresholdSlider({
  title,
  min,
  max,
  step,
  warningValue,
  criticalValue,
  unit,
  onWarningChange,
  onCriticalChange,
  onReset,
}: ThresholdSliderProps) {
  const [localWarning, setLocalWarning] = useState(warningValue);
  const [localCritical, setLocalCritical] = useState(criticalValue);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{title}</h3>
        <Button variant="outline" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium">Warning Threshold</label>
          <div className="mt-3 space-y-2">
            <Slider
              value={[localWarning]}
              onValueChange={(value) => {
                setLocalWarning(value[0]);
                onWarningChange(value[0]);
              }}
              min={min}
              max={max}
              step={step}
              className="w-full"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current: {localWarning} {unit}</span>
              <div className="inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                Warning
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Critical Threshold</label>
          <div className="mt-3 space-y-2">
            <Slider
              value={[localCritical]}
              onValueChange={(value) => {
                setLocalCritical(value[0]);
                onCriticalChange(value[0]);
              }}
              min={min}
              max={max}
              step={step}
              className="w-full"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current: {localCritical} {unit}</span>
              <div className="inline-block rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                Critical
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-lg bg-muted/30 p-3">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Preview</p>
            <div className="mt-2 h-2 w-full rounded-full bg-gradient-to-r from-green-500 via-amber-500 to-red-500" />
          </div>
        </div>
      </div>
    </Card>
  );
}
