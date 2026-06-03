'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { Save, RotateCcw, Mail, Sliders, Bell } from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Email settings
  const [email, setEmail] = useState('');
  const [emailEnabled, setEmailEnabled] = useState(false);

  // Thresholds
  const [thresholds, setThresholds] = useState({
    soil_moisture_min: 30,
    soil_moisture_max: 70,
    temperature_min: 15,
    temperature_max: 35,
    humidity_min: 40,
    humidity_max: 80,
    light_intensity_min: 5000,
    light_intensity_max: 50000,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getSettings();

      if (data.email_settings) {
        setEmail(data.email_settings.email || '');
        setEmailEnabled(data.email_settings.enabled || false);
      }

      if (data.thresholds) {
        setThresholds(data.thresholds);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings. Using defaults.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEmail = async () => {
    try {
      setIsSaving(true);
      console.log('Saving email settings:', { email, emailEnabled });

      const result = await apiClient.updateEmailSettings(email, emailEnabled);
      console.log('Email settings saved successfully:', result);

      toast({
        title: '✅ Success',
        description: 'Email settings saved successfully',
      });

      // Refresh settings to confirm
      await fetchSettings();
    } catch (error: any) {
      console.error('Failed to save email settings:', error);
      toast({
        title: '❌ Error',
        description: error.message || 'Failed to save email settings. Check console for details.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveThresholds = async () => {
    try {
      setIsSaving(true);

      // Validate thresholds
      const errors = [];
      if (thresholds.soil_moisture_min >= thresholds.soil_moisture_max) {
        errors.push('Soil moisture minimum must be less than maximum');
      }
      if (thresholds.temperature_min >= thresholds.temperature_max) {
        errors.push('Temperature minimum must be less than maximum');
      }
      if (thresholds.humidity_min >= thresholds.humidity_max) {
        errors.push('Humidity minimum must be less than maximum');
      }
      if (thresholds.light_intensity_min >= thresholds.light_intensity_max) {
        errors.push('Light intensity minimum must be less than maximum');
      }

      if (errors.length > 0) {
        toast({
          title: '⚠️ Validation Error',
          description: errors.join('. '),
          variant: 'destructive',
        });
        return;
      }

      console.log('Saving thresholds:', thresholds);

      const result = await apiClient.updateThresholds(thresholds);
      console.log('Thresholds updated successfully:', result);

      toast({
        title: '✅ Success',
        description: 'Thresholds updated successfully',
      });

      // Refresh settings to confirm
      await fetchSettings();
    } catch (error: any) {
      console.error('Failed to update thresholds:', error);
      toast({
        title: '❌ Error',
        description: error.message || 'Failed to update thresholds. Check console for details.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetThresholds = () => {
    setThresholds({
      soil_moisture_min: 30,
      soil_moisture_max: 70,
      temperature_min: 15,
      temperature_max: 35,
      humidity_min: 40,
      humidity_max: 80,
      light_intensity_min: 5000,
      light_intensity_max: 50000,
    });
    toast({
      title: 'Reset',
      description: 'Thresholds reset to defaults',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="mt-1 text-muted-foreground">Configure notifications, thresholds, and preferences</p>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">Configure notifications, thresholds, and preferences</p>
      </div>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email Notifications
          </TabsTrigger>
          <TabsTrigger value="thresholds">
            <Sliders className="h-4 w-4 mr-2" />
            Sensor Thresholds
          </TabsTrigger>
        </TabsList>

        {/* Email Settings Tab */}
        <TabsContent value="email" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Email Alert Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications when sensor values exceed thresholds
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-enabled">Enable Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Turn on/off email notifications
                    </p>
                  </div>
                  <Switch
                    id="email-enabled"
                    checked={emailEnabled}
                    onCheckedChange={setEmailEnabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your-email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="cursor-text"
                  />
                  <p className="text-sm text-muted-foreground">
                    {emailEnabled
                      ? 'Alerts will be sent to this email address'
                      : 'Enable email alerts above to receive notifications'}
                  </p>
                </div>

                <Button
                  onClick={handleSaveEmail}
                  disabled={isSaving || (emailEnabled && !email)}
                  className="w-full"
                  size="lg"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Email Settings'}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Thresholds Tab */}
        <TabsContent value="thresholds" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Sensor Thresholds</h3>
                  <p className="text-sm text-muted-foreground">
                    Set minimum and maximum values for each sensor
                  </p>
                </div>
                <Button variant="outline" onClick={handleResetThresholds} size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                {/* Soil Moisture */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">💧 Soil Moisture</Label>
                    <p className="text-sm text-muted-foreground">Percentage (%)</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Minimum</Label>
                        <span className="text-sm font-medium">{thresholds.soil_moisture_min}%</span>
                      </div>
                      <Slider
                        value={[thresholds.soil_moisture_min]}
                        onValueChange={([value]) =>
                          setThresholds({ ...thresholds, soil_moisture_min: value })
                        }
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Maximum</Label>
                        <span className="text-sm font-medium">{thresholds.soil_moisture_max}%</span>
                      </div>
                      <Slider
                        value={[thresholds.soil_moisture_max]}
                        onValueChange={([value]) =>
                          setThresholds({ ...thresholds, soil_moisture_max: value })
                        }
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Temperature */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">🌡️ Temperature</Label>
                    <p className="text-sm text-muted-foreground">Degrees Celsius (°C)</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Minimum</Label>
                        <span className="text-sm font-medium">{thresholds.temperature_min}°C</span>
                      </div>
                      <Slider
                        value={[thresholds.temperature_min]}
                        onValueChange={([value]) =>
                          setThresholds({ ...thresholds, temperature_min: value })
                        }
                        min={-10}
                        max={50}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Maximum</Label>
                        <span className="text-sm font-medium">{thresholds.temperature_max}°C</span>
                      </div>
                      <Slider
                        value={[thresholds.temperature_max]}
                        onValueChange={([value]) =>
                          setThresholds({ ...thresholds, temperature_max: value })
                        }
                        min={-10}
                        max={50}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Humidity */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">💨 Humidity</Label>
                    <p className="text-sm text-muted-foreground">Percentage (%)</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Minimum</Label>
                        <span className="text-sm font-medium">{thresholds.humidity_min}%</span>
                      </div>
                      <Slider
                        value={[thresholds.humidity_min]}
                        onValueChange={([value]) =>
                          setThresholds({ ...thresholds, humidity_min: value })
                        }
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Maximum</Label>
                        <span className="text-sm font-medium">{thresholds.humidity_max}%</span>
                      </div>
                      <Slider
                        value={[thresholds.humidity_max]}
                        onValueChange={([value]) =>
                          setThresholds({ ...thresholds, humidity_max: value })
                        }
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Light Intensity */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">☀️ Light Intensity</Label>
                    <p className="text-sm text-muted-foreground">Lux</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Minimum</Label>
                        <span className="text-sm font-medium">{thresholds.light_intensity_min} lux</span>
                      </div>
                      <Slider
                        value={[thresholds.light_intensity_min]}
                        onValueChange={([value]) =>
                          setThresholds({ ...thresholds, light_intensity_min: value })
                        }
                        min={0}
                        max={100000}
                        step={1000}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Maximum</Label>
                        <span className="text-sm font-medium">{thresholds.light_intensity_max} lux</span>
                      </div>
                      <Slider
                        value={[thresholds.light_intensity_max]}
                        onValueChange={([value]) =>
                          setThresholds({ ...thresholds, light_intensity_max: value })
                        }
                        min={0}
                        max={100000}
                        step={1000}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSaveThresholds}
                disabled={isSaving}
                className="w-full"
                size="lg"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save All Thresholds'}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
