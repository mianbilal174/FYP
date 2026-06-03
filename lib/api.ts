declare const process: { env: { NEXT_PUBLIC_API_URL?: string } };
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Dummy data generators for testing
const generateDummySensorData = () => ({
  soil_moisture: 45 + Math.random() * 20,
  temperature: 25 + Math.random() * 10,
  humidity: 55 + Math.random() * 20,
  light_intensity: 15000 + Math.random() * 10000,
  timestamp: new Date().toISOString(),
  device_id: 'ESP32_001'
});

const generateDummyHistory = (hours: number) => {
  const data = [];
  const now = new Date();
  for (let i = hours * 6; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 10 * 60 * 1000);
    data.push({
      ...generateDummySensorData(),
      timestamp: timestamp.toISOString()
    });
  }
  return data;
};

const generateDummyAlerts = (limit: number) => {
  const alertTypes = [
    'soil_moisture_low',
    'soil_moisture_high',
    'temperature_high',
    'temperature_low',
    'humidity_high',
    'light_intensity_low'
  ];
  
  const alerts = [];
  for (let i = 0; i < limit; i++) {
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    alerts.push({
      id: `alert_${i}`,
      alert_type: alertType,
      severity: Math.random() > 0.7 ? 'critical' : Math.random() > 0.4 ? 'warning' : 'info',
      message: `${alertType.replace(/_/g, ' ')} detected`,
      sensor_value: 35 + Math.random() * 10,
      threshold_value: 35,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      is_resolved: Math.random() > 0.5,
      email_sent: true
    });
  }
  return alerts;
};

export const apiClient = {
  async getCurrentSensorData() {
    try {
      const response = await fetch(`${API_URL}/dashboard/sensor-data/latest`);
      if (!response.ok) {
        console.warn('Using dummy data - backend not available');
        return generateDummySensorData();
      }
      return await response.json();
    } catch (error) {
      console.warn('Using dummy data - backend not available:', error);
      return generateDummySensorData();
    }
  },

  async getSensorHistory(hours: number = 24) {
    try {
      const response = await fetch(`${API_URL}/dashboard/sensor-data/history?hours=${hours}&limit=100`);
      if (!response.ok) {
        console.warn('Using dummy history data - backend not available');
        return generateDummyHistory(hours);
      }
      return await response.json();
    } catch (error) {
      console.warn('Using dummy history data - backend not available:', error);
      return generateDummyHistory(hours);
    }
  },

  async getStats(hours: number = 24) {
    try {
      const response = await fetch(`${API_URL}/dashboard/stats?hours=${hours}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return await response.json();
    } catch (error) {
      console.error('Stats fetch error:', error);
      return {
        avg_soil_moisture: 52.3,
        avg_temperature: 26.8,
        avg_humidity: 62.5,
        avg_light_intensity: 18500.0,
        total_readings: 288
      };
    }
  },

  async getAlerts(limit: number = 10, unresolvedOnly: boolean = false) {
    try {
      const url = `${API_URL}/alerts/?limit=${limit}${unresolvedOnly ? '&unresolved_only=true' : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        console.warn('Using dummy alerts - backend not available');
        return generateDummyAlerts(limit);
      }
      return await response.json();
    } catch (error) {
      console.warn('Using dummy alerts - backend not available:', error);
      return generateDummyAlerts(limit);
    }
  },

  async getAlertStats(hours: number = 24) {
    try {
      const response = await fetch(`${API_URL}/alerts/stats?hours=${hours}`);
      if (!response.ok) throw new Error('Failed to fetch alert stats');
      return await response.json();
    } catch (error) {
      console.error('Alert stats fetch error:', error);
      return {
        total_alerts: 15,
        unresolved_alerts: 3,
        alerts_by_type: {
          temperature_high: 5,
          soil_moisture_low: 4,
          humidity_high: 3,
          light_intensity_low: 3
        },
        alerts_by_severity: {
          info: 6,
          warning: 7,
          critical: 2
        }
      };
    }
  },

  async resolveAlert(alertId: string) {
    try {
      const response = await fetch(`${API_URL}/alerts/${alertId}/resolve`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to resolve alert');
      return await response.json();
    } catch (error) {
      console.error('Alert resolve error:', error);
      throw error;
    }
  },

  async deleteAlert(alertId: string) {
    try {
      const response = await fetch(`${API_URL}/alerts/${alertId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete alert');
      return await response.json();
    } catch (error) {
      console.error('Alert delete error:', error);
      throw error;
    }
  },

  async getSettings() {
    try {
      const response = await fetch(`${API_URL}/settings/`);
      if (!response.ok) {
        return {
          thresholds: {
            soil_moisture_min: 30.0,
            soil_moisture_max: 70.0,
            temperature_min: 15.0,
            temperature_max: 35.0,
            humidity_min: 40.0,
            humidity_max: 80.0,
            light_intensity_min: 5000.0,
            light_intensity_max: 50000.0
          },
          email_settings: {
            email: '',
            enabled: false
          }
        };
      }
      return await response.json();
    } catch (error) {
      console.error('Settings fetch error:', error);
      return {
        thresholds: {
          soil_moisture_min: 30.0,
          soil_moisture_max: 70.0,
          temperature_min: 15.0,
          temperature_max: 35.0,
          humidity_min: 40.0,
          humidity_max: 80.0,
          light_intensity_min: 5000.0,
          light_intensity_max: 50000.0
        },
        email_settings: {
          email: '',
          enabled: false
        }
      };
    }
  },

  async updateEmailSettings(email: string, enabled: boolean = true) {
    try {
      const response = await fetch(`${API_URL}/settings/email`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, enabled }),
      });
      if (!response.ok) throw new Error('Failed to save email settings');
      return await response.json();
    } catch (error) {
      console.error('Email settings save error:', error);
      throw error;
    }
  },

  async updateThresholds(thresholds: Record<string, any>) {
    try {
      const response = await fetch(`${API_URL}/settings/thresholds`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(thresholds),
      });
      if (!response.ok) throw new Error('Failed to update thresholds');
      return await response.json();
    } catch (error) {
      console.error('Thresholds update error:', error);
      throw error;
    }
  },
};
