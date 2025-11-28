# Malaysia Flood-Watch 🇲🇾

A real-time flood monitoring web application for Malaysia. Displays rainfall data for 144 districts on an interactive map with push notifications for heavy rain.

## Features

- 🗺️ **Interactive Map**: Full-screen Leaflet map of Peninsular & East Malaysia.
- 🌧️ **Real-time Rainfall**: Color-coded districts based on GPM IMERG daily rainfall.
  - 🔵 **Normal**: ≤ 50 mm
  - 🟠 **Warning**: 50–100 mm
  - 🔴 **Danger**: ≥ 100 mm
- 🔔 **Push Notifications**: Alerts when rainfall in your area exceeds 100mm.
- 📱 **PWA Support**: Installable on mobile/desktop with offline capability.
- ⚡ **Fast & Free**: Uses serverless API routes and free public data sources.

## Tech Stack

- **Framework**: Next.js 14 (Pages Router)
- **Styling**: Tailwind CSS
- **Map**: React Leaflet / Leaflet
- **Data**: GPM IMERG (Rainfall), GeoJSON (Districts)

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

3. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fmalaysia-flood-watch)

*Note: You may need to push this code to a GitHub repository first to use the button above, or simply run `vercel` in your terminal if you have the Vercel CLI installed.*
