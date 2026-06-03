import mqtt from 'mqtt';
import type { SensorReading } from './types';

const MQTT_BROKER = process.env.NEXT_PUBLIC_MQTT_BROKER || 'ws://broker.hivemq.com:8000/mqtt';
const MQTT_TOPIC = 'smart_irrigation/data';

interface MQTTCallbacks {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onDataReceived?: (reading: Partial<SensorReading>) => void;
  onError?: (error: Error) => void;
}

export class MQTTClient {
  private brokerUrl: string;
  private callbacks: MQTTCallbacks = {};
  private client: mqtt.MqttClient | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.brokerUrl = MQTT_BROKER;
  }

  async initialize(callbacks: MQTTCallbacks): Promise<void> {
    this.callbacks = callbacks;

    if (typeof window === 'undefined') {
      console.warn('MQTT not available in non-browser environment');
      return;
    }

    try {
      this.client = mqtt.connect(this.brokerUrl);

      this.client.on('connect', () => {
        this.isConnected = true;
        this.callbacks.onConnect?.();
      });

      this.client.on('message', (topic, message) => {
        if (topic === MQTT_TOPIC) {
          try {
            const data = JSON.parse(message.toString());
            // Map ESP32 output exactly into the dashboard format
            const reading: Partial<SensorReading> = {
              moisture: typeof data.soil === 'number' ? data.soil : data.soil_moisture,
              temperature: data.temperature,
              humidity: data.humidity,
              light: typeof data.lux === 'number' ? data.lux : data.light_intensity,
              timestamp: new Date(),
            };
            this.callbacks.onDataReceived?.(reading);
          } catch (e) {
            console.error('Failed to parse MQTT message:', e);
          }
        }
      });

      this.client.on('error', (err) => {
        this.callbacks.onError?.(err);
      });

      this.client.on('close', () => {
        this.isConnected = false;
        this.callbacks.onDisconnect?.();
      });

    } catch (error) {
      this.callbacks.onError?.(error instanceof Error ? error : new Error('Connection failed'));
    }
  }

  subscribe(): void {
    if (this.client) {
      this.client.subscribe(MQTT_TOPIC, (err) => {
        if (err) this.callbacks.onError?.(err);
        else console.log('✅ Subscribed to ' + MQTT_TOPIC);
      });
    }
  }

  disconnect(): void {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
    this.isConnected = false;
    this.callbacks.onDisconnect?.();
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const mqttClient = new MQTTClient();
