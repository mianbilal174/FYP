'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { SensorReading, Alert, Threshold, Settings } from './types';

interface SensorContextType {
  currentReading: SensorReading | null;
  recentAlerts: Alert[];
  settings: Settings | null;
  updateSensorReading: (reading: SensorReading) => void;
  addAlert: (alert: Alert) => void;
  clearAlerts: () => void;
  updateSettings: (settings: Partial<Settings>) => void;
}

const SensorContext = createContext<SensorContextType | undefined>(undefined);

export function SensorProvider({ children }: { children: ReactNode }) {
  const [currentReading, setCurrentReading] = useState<SensorReading | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  const updateSensorReading = useCallback((reading: SensorReading) => {
    setCurrentReading(reading);
  }, []);

  const addAlert = useCallback((alert: Alert) => {
    setRecentAlerts((prev) => {
      if (prev.some((a) => a.id === alert.id)) return prev;
      return [alert, ...prev].slice(0, 10);
    });
  }, []);

  const clearAlerts = useCallback(() => {
    setRecentAlerts([]);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings((prev) => (prev ? { ...prev, ...newSettings } : (newSettings as Settings)));
  }, []);

  return (
    <SensorContext.Provider
      value={{
        currentReading,
        recentAlerts,
        settings,
        updateSensorReading,
        addAlert,
        clearAlerts,
        updateSettings,
      }}
    >
      {children}
    </SensorContext.Provider>
  );
}

export function useSensorContext() {
  const context = useContext(SensorContext);
  if (!context) {
    throw new Error('useSensorContext must be used within SensorProvider');
  }
  return context;
}
