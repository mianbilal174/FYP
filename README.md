# Smart Crop Irrigation System - Frontend

Modern Next.js dashboard for monitoring and managing your smart crop irrigation system.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd "d:\Plant monitoring system project\frontend"
npm install
# or
pnpm install
```

### 2. Configure Environment

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Run Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Features

### Dashboard Page (`/dashboard`)
- **Real-time Sensor Monitoring**: Live data from soil moisture, temperature, humidity, and light sensors
- **Beautiful Metric Cards**: Visual status indicators with sparklines
- **Interactive Charts**: Historical data visualization
- **Alert Panel**: Recent alerts and notifications
- **Auto-refresh**: Data updates automatically

### Alerts Page (`/alerts`)
- **Alert History**: Complete list of all system alerts
- **Statistics Dashboard**: Total alerts, unresolved count, severity breakdown
- **Advanced Filtering**: Search and filter by severity level
- **Alert Type Breakdown**: Visual breakdown by sensor type
- **Real-time Updates**: Auto-refresh every 30 seconds

### Settings Page (`/settings`)
- **Email Notifications**: Configure email alerts
  - Enable/disable email notifications
  - Set email address for alerts
- **Sensor Thresholds**: Customize threshold values
  - Soil moisture (min/max)
  - Temperature (min/max)
  - Humidity (min/max)
  - Light intensity (min/max)
- **Visual Sliders**: Easy-to-use threshold configuration
- **Reset to Defaults**: Quick reset functionality

## 🎨 Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React Hooks

## 📡 API Integration

The frontend connects to the FastAPI backend at `http://localhost:8000/api`.

### Endpoints Used

- `GET /dashboard/sensor-data/latest` - Latest sensor readings
- `GET /dashboard/sensor-data/history` - Historical data
- `GET /dashboard/stats` - Dashboard statistics
- `GET /alerts/` - List all alerts
- `GET /alerts/stats` - Alert statistics
- `GET /settings/` - Get current settings
- `PUT /settings/email` - Update email settings
- `PUT /settings/thresholds` - Update sensor thresholds

### Dummy Data Fallback

The frontend includes dummy data generators that activate when the backend is unavailable. This allows you to:
- Test the UI without running the backend
- Develop frontend features independently
- Demo the application without hardware

## 🎯 Pages Overview

### Dashboard (`/dashboard`)
```
┌─────────────────────────────────────────────────────┐
│  Dashboard                    [●] Connected         │
├─────────────────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐           │
│  │ 💧   │  │ 🌡️   │  │ 💨   │  │ ☀️   │           │
│  │ 45%  │  │ 28°C │  │ 65%  │  │15000 │           │
│  └──────┘  └──────┘  └──────┘  └──────┘           │
├─────────────────────────────────────────────────────┤
│  ┌────────────────────┐  ┌──────────────┐          │
│  │                    │  │ Recent       │          │
│  │  Sensor Charts     │  │ Alerts       │          │
│  │                    │  │              │          │
│  └────────────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────┘
```

### Alerts (`/alerts`)
```
┌─────────────────────────────────────────────────────┐
│  Alerts & Notifications                             │
├─────────────────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐           │
│  │Total │  │Unres.│  │Crit. │  │Warn. │           │
│  │  15  │  │  3   │  │  2   │  │  7   │           │
│  └──────┘  └──────┘  └──────┘  └──────┘           │
├─────────────────────────────────────────────────────┤
│  [Search...] [All][Info][Warning][Critical]        │
│                                                     │
│  ⚠️ Temperature High - 38.5°C > 35°C               │
│  💧 Soil Moisture Low - 25% < 30%                  │
│  ☀️ Light Intensity High - 55000 lux > 50000       │
└─────────────────────────────────────────────────────┘
```

### Settings (`/settings`)
```
┌─────────────────────────────────────────────────────┐
│  Settings                                           │
├─────────────────────────────────────────────────────┤
│  [Email Notifications] [Sensor Thresholds]         │
│                                                     │
│  📧 Email Configuration                            │
│  ┌─────────────────────────────────────────────┐  │
│  │ Enable Email Alerts        [●]              │  │
│  │ Email: farmer@example.com                   │  │
│  │ [Save Email Settings]                       │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  🎚️ Sensor Thresholds                             │
│  ┌─────────────────────────────────────────────┐  │
│  │ 💧 Soil Moisture                            │  │
│  │ Min: 30% ━━━━━●━━━━━                       │  │
│  │ Max: 70% ━━━━━━━●━━━                       │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## 🔧 Development

### Project Structure

```
frontend/
├── app/
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard page
│   ├── alerts/
│   │   └── page.tsx          # Alerts page
│   ├── settings/
│   │   └── page.tsx          # Settings page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── dashboard/            # Dashboard components
│   └── ...
├── lib/
│   ├── api.ts                # API client with dummy data
│   ├── types.ts              # TypeScript types
│   └── utils.ts              # Utility functions
└── public/                   # Static assets
```

### Running with Backend

1. Start the backend:
```bash
cd "d:\Plant monitoring system project\backend"
.\run.ps1
```

2. Start the frontend:
```bash
cd "d:\Plant monitoring system project\frontend"
npm run dev
```

3. Open http://localhost:3000

### Running Standalone (Dummy Data)

The frontend will automatically use dummy data if the backend is not available. Just run:

```bash
npm run dev
```

## 🎨 Customization

### Changing Theme Colors

Edit `app/globals.css` to customize the color scheme:

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  /* ... more colors */
}
```

### Adjusting Refresh Intervals

In `app/dashboard/page.tsx`:

```typescript
// Change from 5000ms (5s) to your preferred interval
const interval = setInterval(fetchAlerts, 5000);
```

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Large screens (1920px+)

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
vercel
```

### Deploy to Netlify

```bash
netlify deploy --prod
```

## 🐛 Troubleshooting

### Backend Connection Issues

If you see "Using dummy data - backend not available":
1. Ensure backend is running on http://localhost:8000
2. Check CORS settings in backend
3. Verify API_URL in environment variables

### CORS Errors

Add your frontend URL to backend's CORS_ORIGINS in `.env`:
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Build Errors

Clear Next.js cache:
```bash
rm -rf .next
npm run dev
```

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)

## ✨ Features Checklist

- [x] Real-time sensor monitoring
- [x] Historical data charts
- [x] Alert management
- [x] Email configuration
- [x] Threshold customization
- [x] Responsive design
- [x] Dummy data fallback
- [x] Auto-refresh
- [x] Search and filtering
- [x] Statistics dashboard
- [ ] User authentication
- [ ] Multi-device support
- [ ] Export data (CSV/PDF)
- [ ] Dark mode toggle

## 🎉 Ready to Use!

Your frontend is now connected to the backend and ready for use. The dummy data ensures you can test and develop even without the backend running.

**Happy monitoring! 🌱**
