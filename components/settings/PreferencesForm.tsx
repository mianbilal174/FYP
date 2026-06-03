'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';

export function PreferencesForm() {
  const [temperatureUnit, setTemperatureUnit] = useState('celsius');
  const [refreshInterval, setRefreshInterval] = useState('5');
  const [alertPreferences, setAlertPreferences] = useState({
    moisture: true,
    temperature: true,
    humidity: true,
    light: false,
  });

  const handleSave = () => {
    console.log('Preferences saved:', {
      temperatureUnit,
      refreshInterval,
      alertPreferences,
    });
    // In a real app, this would call an API
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Settings2 className="h-5 w-5" />
        System Preferences
      </h3>

      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium block mb-2">Temperature Unit</label>
          <div className="flex gap-3">
            {[
              { value: 'celsius', label: 'Celsius (°C)' },
              { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
            ].map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="temperature"
                  value={option.value}
                  checked={temperatureUnit === option.value}
                  onChange={(e) => setTemperatureUnit(e.target.value)}
                  className="h-4 w-4"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="interval" className="text-sm font-medium block mb-2">
            Data Refresh Interval (seconds)
          </label>
          <select
            id="interval"
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            {[1, 2, 5, 10, 30, 60].map((seconds) => (
              <option key={seconds} value={seconds}>
                {seconds} second{seconds !== 1 ? 's' : ''}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">How often to update sensor readings</p>
        </div>

        <div>
          <label className="text-sm font-medium block mb-3">Enable Alerts For</label>
          <div className="space-y-3">
            {[
              { key: 'moisture', label: 'Soil Moisture' },
              { key: 'temperature', label: 'Temperature' },
              { key: 'humidity', label: 'Humidity' },
              { key: 'light', label: 'Light Intensity' },
            ].map((sensor) => (
              <label key={sensor.key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertPreferences[sensor.key as keyof typeof alertPreferences]}
                  onChange={(e) =>
                    setAlertPreferences((prev) => ({
                      ...prev,
                      [sensor.key]: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded"
                />
                <span className="text-sm">{sensor.label}</span>
              </label>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Preferences
        </Button>
      </div>
    </Card>
  );
}
