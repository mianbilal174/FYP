export interface SensorReading {
  moisture: number;
  temperature: number;
  humidity: number;
  light: number;
  timestamp: Date;
}

export interface SensorStatus {
  moisture: 'good' | 'warning' | 'critical';
  temperature: 'good' | 'warning' | 'critical';
  humidity: 'good' | 'warning' | 'critical';
  light: 'good' | 'warning' | 'critical';
}

export interface Alert {
  id: string;
  sensor: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  isResolved?: boolean;
}

export interface Threshold {
  moisture: { warning: number; critical: number };
  temperature: { warning: number; critical: number };
  humidity: { warning: number; critical: number };
  light: { warning: number; critical: number };
}

export interface Settings {
  email: string;
  temperatureUnit: 'celsius' | 'fahrenheit';
  refreshInterval: number;
  thresholds: Threshold;
  enableAlerts: {
    moisture: boolean;
    temperature: boolean;
    humidity: boolean;
    light: boolean;
  };
}

export interface ChartDataPoint {
  timestamp: string;
  moisture?: number;
  temperature?: number;
  humidity?: number;
  light?: number;
}
