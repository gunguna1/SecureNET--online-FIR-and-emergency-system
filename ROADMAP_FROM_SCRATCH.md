# The Definitive SecureNET (NP-SERP) Development Master-Guide

This is the exhaustive, granular, step-by-step master roadmap for building the **SecureNET National Public Safety & Emergency Response Platform** completely from scratch. 

This guide simulates the exact thought process, folder creation, and code execution required to build a highly complex, real-time, AI-integrated Monorepo web application without relying on AI code generation.

---

# Part 1: Architecture & Monorepo Initialization

Before writing feature code, we must construct the "skeleton" of the project. A Monorepo allows us to keep the Frontend (`web`), Backend (`api`), and Shared Types (`shared`) in one repository while managing dependencies efficiently.

## 1.1 Project Root Setup
First, we create the overarching folder and initialize Git and NPM.

```bash
mkdir SecureNET--online-FIR-and-emergency-system
cd SecureNET--online-FIR-and-emergency-system
git init
npm init -y
```

We immediately create a `.gitignore` at the root:
```text
node_modules
.env
dist
build
.next
```

## 1.2 Defining the Workspaces
Open the root `package.json`. We must tell NPM that this project contains multiple sub-projects. We modify it to look like this:

```json
{
  "name": "securenet-root",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev:api": "npm run dev --workspace=api",
    "dev:web": "npm run dev --workspace=web",
    "dev": "npm run dev --workspaces"
  }
}
```

## 1.3 Creating the Folder Tree
Now, we create the physical directories required by our workspace configuration:

```bash
mkdir apps
mkdir packages
mkdir packages/shared
```

---

# Part 2: The `shared` Package (Single Source of Truth)

To ensure our Next.js frontend and Express backend agree on data structures, we create a shared package.

## 2.1 Initializing `packages/shared`
```bash
cd packages/shared
npm init -y
npm install typescript zod
npm install -D ts-node
npx tsc --init
```

We name this package `@securenet/shared` in its `package.json`:
```json
{
  "name": "@securenet/shared",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc"
  }
}
```

## 2.2 Writing the Shared Schemas
We create `packages/shared/src/index.ts`. Here, we define the Zod schemas that will be used for both Backend Validation and Frontend Form checking.

```typescript
// packages/shared/src/index.ts
import { z } from 'zod';

export const IncidentSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string(),
  location: z.object({
    longitude: z.number(),
    latitude: z.number()
  }),
  type: z.enum(['POLICE', 'FIRE', 'MEDICAL', 'GENERAL_SOS']),
  status: z.enum(['PENDING', 'DISPATCHED', 'RESOLVED']).default('PENDING')
});

export type Incident = z.infer<typeof IncidentSchema>;
```
We then run `npm run build` inside `packages/shared` so the types are available to the rest of the workspace.

---

# Part 3: The API Backend Skeleton (Node.js & Express)

We move back to the `apps` folder to create our backend.

## 3.1 Initializing the API
```bash
cd ../../apps
mkdir api
cd api
npm init -y
```

We name it `api` in its `package.json` and add our shared package as a dependency:
```json
{
  "name": "api",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node-dev src/server.ts"
  },
  "dependencies": {
    "@securenet/shared": "*",
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "socket.io": "^4.6.1"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "ts-node-dev": "^2.0.0",
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13"
  }
}
```

## 3.2 The Backend Directory Structure
We must organize the backend cleanly. We create the following folders inside `apps/api/src`:
```bash
mkdir src
cd src
mkdir config controllers models routes services socket middlewares
```

## 3.3 Database Connection (`config/db.ts`)
We create `apps/api/src/config/db.ts` to handle Mongoose.

```typescript
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI as string);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};
```

## 3.4 The Base Server (`server.ts`)
We create `apps/api/src/server.ts`. This is iterative. For now, it's just basic Express.

```typescript
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'SecureNET API Running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
```

---

# Part 4: Database Models & Geospatial Data

SecureNET relies heavily on mapping. MongoDB handles this via GeoJSON.

## 4.1 The Incident Model (`models/Incident.ts`)
We create the database schema. Notice the `2dsphere` index—this is critical for finding the "nearest officer".

```typescript
import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['POLICE', 'FIRE', 'MEDICAL', 'GENERAL_SOS'], required: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { 
            type: [Number], // [longitude, latitude]
            required: true 
        }
    },
    status: { type: String, default: 'PENDING' },
    assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// CRITICAL: Geospatial index for distance calculations
incidentSchema.index({ location: '2dsphere' });

export const Incident = mongoose.model('Incident', incidentSchema);
```

## 4.2 The User Model (`models/User.ts`)
We also need a User model to differentiate between Citizens, Officers, and Control Room admins.

```typescript
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: { type: String, select: false },
    role: { type: String, enum: ['CITIZEN', 'OFFICER', 'CONTROL_ROOM', 'ADMIN'] },
    currentLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: [Number]
    }
});
userSchema.index({ currentLocation: '2dsphere' });

export const User = mongoose.model('User', userSchema);
```

---

# Part 5: The API Routes & Controllers

We need HTTP endpoints so the frontend can create and read incidents.

## 5.1 The Controller (`controllers/incidentController.ts`)
Controllers hold the business logic.

```typescript
import { Request, Response } from 'express';
import { Incident } from '../models/Incident';
import { IncidentSchema } from '@securenet/shared'; // Importing from our Monorepo package!

export const createIncident = async (req: Request, res: Response) => {
    try {
        // Validate incoming data using Shared Zod Schema
        const validatedData = IncidentSchema.parse(req.body);
        
        // Transform standard lat/lng into GeoJSON format for MongoDB
        const newIncident = await Incident.create({
            title: validatedData.title,
            description: validatedData.description,
            type: validatedData.type,
            location: {
                type: 'Point',
                coordinates: [validatedData.location.longitude, validatedData.location.latitude]
            }
        });

        res.status(201).json(newIncident);
    } catch (error) {
        res.status(400).json({ error: "Validation or Server Error" });
    }
};

export const getNearestIncidents = async (req: Request, res: Response) => {
    const { lng, lat, maxDistance = 5000 } = req.query; // maxDistance in meters
    
    const incidents = await Incident.find({
        location: {
            $near: {
                $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
                $maxDistance: Number(maxDistance)
            }
        }
    });
    
    res.json(incidents);
};
```

## 5.2 The Router (`routes/incidentRoutes.ts`)
We map URLs to the controller functions.

```typescript
import express from 'express';
import { createIncident, getNearestIncidents } from '../controllers/incidentController';

const router = express.Router();

router.post('/', createIncident);
router.get('/nearest', getNearestIncidents);

export default router;
```
*We then return to `server.ts` and add `app.use('/api/incidents', incidentRoutes);`*

---

# Part 6: Iteration 1 - Injecting WebSockets (Socket.io)

An emergency system must be real-time. We have to refactor `server.ts` to attach Socket.io.

## 6.1 Refactoring `server.ts`
```diff
  import express from 'express';
  import cors from 'cors';
+ import http from 'http';
+ import { initSocket } from './socket/io';
  import { connectDB } from './config/db';

  connectDB();
  const app = express();
  app.use(cors());
  app.use(express.json());

+ const server = http.createServer(app);
+ initSocket(server);

  const PORT = process.env.PORT || 5000;
- app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
+ server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
```

## 6.2 Socket Implementation (`socket/io.ts`)
We create rooms. Control Room staff join the `control-room` room. Officers join their own specific room.

```typescript
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server;

export const initSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Allow users to join specific permission rooms
        socket.on('JOIN_ROOM', (roomName) => {
            socket.join(roomName);
            console.log(`Socket ${socket.id} joined room ${roomName}`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};

export const getIO = () => {
    if (!io) throw new Error("Socket.io not initialized!");
    return io;
};
```

## 6.3 Connecting HTTP to WebSockets
We must return to `controllers/incidentController.ts`. When a citizen makes a POST request to create an incident, we want to instantly alert the control room.

```diff
+ import { getIO } from '../socket/io';

  export const createIncident = async (req: Request, res: Response) => {
      try {
          const validatedData = IncidentSchema.parse(req.body);
          const newIncident = await Incident.create({...});
          
+         // REAL-TIME BROADCAST
+         // The moment the DB saves, we push an event to the control room
+         const io = getIO();
+         io.to('control-room').emit('NEW_EMERGENCY', newIncident);

          res.status(201).json(newIncident);
      } catch (error) { ... }
  };
```

---

# Part 7: The Frontend Architecture (Next.js 15)

Now we build the client side.

## 7.1 Initializing the Web App
```bash
cd apps
npx create-next-app@15 web
```
During setup, we choose: TypeScript (Yes), Tailwind CSS (Yes), App Router (Yes), `src/` directory (Yes).

We update `apps/web/package.json` to name it `web` and link the shared package:
```json
  "name": "web",
  "dependencies": {
    "@securenet/shared": "*"
  }
```

## 7.2 Styling & Theming (Dark Glassmorphism)
We want a tactical, dark, high-tech UI. We edit `tailwind.config.ts`.

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: 'rgba(20, 20, 20, 0.7)',
        primary: '#3b82f6',
        danger: '#ef4444',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
export default config
```

In `src/app/globals.css`, we set the dark background:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: theme('colors.background');
  color: white;
}

/* Glassmorphism Utility Class */
.glass-panel {
  @apply bg-surface backdrop-blur-md border border-white/10 rounded-xl shadow-lg;
}
```

## 7.3 Global State Management (Zustand)
We need to track the user's location continuously.
```bash
npm install zustand
```

Create `src/store/useAppStore.ts`:
```typescript
import { create } from 'zustand';

interface AppState {
    userLocation: { lat: number; lng: number } | null;
    setUserLocation: (lat: number, lng: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
    userLocation: null,
    setUserLocation: (lat, lng) => set({ userLocation: { lat, lng } }),
}));
```

---

# Part 8: The GIS & Map Layer (Leaflet & OSRM)

This is the hardest frontend feature: drawing maps and calculating routes.

## 8.1 Map Dependencies
```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

We must add Leaflet CSS to `globals.css`:
```css
@import "leaflet/dist/leaflet.css";
```

## 8.2 Building the `LiveMap.tsx` Component
Because Leaflet uses the `window` object, it crashes Next.js Server-Side Rendering (SSR). We must create the component, and then import it dynamically.

Create `src/components/LiveMap.tsx`:
```tsx
'use client';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// Fix missing marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LiveMapProps {
    center: [number, number];
    incidents: Array<{ lat: number; lng: number; id: string }>;
    officerLocation?: [number, number];
}

export default function LiveMap({ center, incidents, officerLocation }: LiveMapProps) {
    const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);

    // If we have an officer and an active incident, draw a route using OSRM
    useEffect(() => {
        if (officerLocation && incidents.length > 0) {
            const target = incidents[0]; // Drive to the first incident
            
            // OSRM API expects longitude,latitude format in the URL!
            const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${officerLocation[1]},${officerLocation[0]};${target.lng},${target.lat}?geometries=geojson`;
            
            fetch(osrmUrl)
                .then(res => res.json())
                .then(data => {
                    if (data.routes && data.routes[0]) {
                        // OSRM returns [lng, lat], Leaflet polyline needs [lat, lng]
                        const flippedCoords = data.routes[0].geometry.coordinates.map(
                            (coord: number[]) => [coord[1], coord[0]]
                        );
                        setRouteCoords(flippedCoords);
                    }
                });
        }
    }, [officerLocation, incidents]);

    return (
        <MapContainer center={center} zoom={13} className="w-full h-[500px] rounded-xl z-0">
            {/* CartoDB Dark Matter Theme */}
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            
            {/* Draw Incidents */}
            {incidents.map(inc => (
                <Marker key={inc.id} position={[inc.lat, inc.lng]} />
            ))}

            {/* Draw Route */}
            {routeCoords.length > 0 && <Polyline positions={routeCoords} color="blue" weight={5} />}
        </MapContainer>
    );
}
```

## 8.3 Using the Map dynamically
In `src/app/(control-room)/page.tsx`, we must import the map without SSR:

```tsx
'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// DYNAMIC IMPORT: Disable Server Side Rendering for Leaflet
const LiveMap = dynamic(() => import('../../components/LiveMap'), { ssr: false });

export default function ControlRoom() {
    const [incidents, setIncidents] = useState([]);

    useEffect(() => {
        // Connect to our Backend Socket
        const socket = io('http://localhost:5000');
        
        socket.emit('JOIN_ROOM', 'control-room');

        socket.on('NEW_EMERGENCY', (incident) => {
            // Reformat DB location object to Leaflet format
            const mapPin = {
                id: incident._id,
                lat: incident.location.coordinates[1],
                lng: incident.location.coordinates[0]
            };
            setIncidents(prev => [...prev, mapPin]);
        });

        return () => { socket.disconnect(); }
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6 text-danger">Active Emergencies</h1>
            <div className="glass-panel p-2">
                <LiveMap center={[20.5937, 78.9629]} incidents={incidents} />
            </div>
        </div>
    );
}
```

---

# Part 9: AI FIR Drafter Integration (Google Gemini)

We don't want officers typing complex legal documents on their phones. We use Gemini to format rough notes.

## 9.1 Backend AI Service
Back in `apps/api`:
```bash
npm install @google/generative-ai
```

Create `apps/api/src/services/aiService.ts`:
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const draftFIR = async (rawStatement: string) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = `
    You are a professional legal assistant for the Police Department.
    Convert the following rough statement from a citizen into a formal First Information Report (FIR).
    You must extract and clearly label:
    1. The Accused (if known)
    2. The Victims/Witnesses
    3. Suggested Indian Penal Code (IPC) Sections applicable.
    
    Format the output as a strict JSON object.
    
    Raw Statement: "${rawStatement}"
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // We strip markdown backticks if Gemini returns them
    const cleanJson = responseText.replace(/```json\n|\n```/g, '');
    return JSON.parse(cleanJson);
};
```

## 9.2 The AI Endpoint
In `apps/api/src/controllers/firController.ts`:
```typescript
import { Request, Response } from 'express';
import { draftFIR } from '../services/aiService';

export const generateFIR = async (req: Request, res: Response) => {
    try {
        const { statement } = req.body;
        const draftedFIR = await draftFIR(statement);
        res.json(draftedFIR);
    } catch (error) {
        res.status(500).json({ error: "AI Generation Failed" });
    }
};
```
*We add this to `routes/firRoutes.ts` and attach it to `server.ts`.*

---

# Part 10: The Citizen "SOS" Interface

We build the actual button the user presses.
In `apps/web/src/app/(citizen)/page.tsx`:

```tsx
'use client';
import { useAppStore } from '../../store/useAppStore';
import { useState, useEffect } from 'react';

export default function CitizenPortal() {
    const { userLocation, setUserLocation } = useAppStore();
    const [loading, setLoading] = useState(false);

    // Get GPS on load
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setUserLocation(position.coords.latitude, position.coords.longitude);
            });
        }
    }, []);

    const handleSOS = async () => {
        if (!userLocation) return alert("Waiting for GPS...");
        setLoading(true);
        
        // Send request to our Express Backend
        await fetch('http://localhost:5000/api/incidents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: "EMERGENCY SOS",
                description: "Immediate assistance required",
                type: "GENERAL_SOS",
                location: {
                    longitude: userLocation.lng,
                    latitude: userLocation.lat
                }
            })
        });
        
        setLoading(false);
        alert("SOS Broadcasted! Officers are on the way.");
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="glass-panel p-10 flex flex-col items-center">
                <div className="w-48 h-48 rounded-full bg-danger/20 flex items-center justify-center animate-pulse">
                    <button 
                        onClick={handleSOS}
                        disabled={loading}
                        className="w-40 h-40 rounded-full bg-danger text-white font-bold text-3xl shadow-[0_0_50px_rgba(239,68,68,0.5)] hover:scale-105 transition-transform"
                    >
                        {loading ? 'SENDING...' : 'SOS'}
                    </button>
                </div>
            </div>
        </div>
    );
}
```

---

# Part 11: Iteration 2 - Securing the Perimeter

The app works, but it's completely unprotected. We must go back to the backend and add authentication.

## 11.1 JWT Generation
```bash
npm install jsonwebtoken bcryptjs cookie-parser
npm install -D @types/jsonwebtoken @types/bcryptjs @types/cookie-parser
```

In `apps/api/src/controllers/authController.ts`, when a user logs in:
```typescript
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    // ... verify password ...
    
    const token = jwt.sign(
        { id: user._id, role: user.role }, 
        process.env.JWT_SECRET, 
        { expiresIn: '12h' }
    );

    // CRITICAL: We don't send the token in JSON. We send it in an HttpOnly cookie!
    // This prevents Cross-Site Scripting (XSS) attacks from stealing the token.
    res.cookie('securenet_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 12 * 60 * 60 * 1000 // 12 hours
    });

    res.json({ message: "Logged in successfully" });
};
```

## 11.2 Role-Based Access Control (RBAC) Middleware
We create `apps/api/src/middlewares/authMiddleware.ts`. We place this file in front of protected routes.

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to hold user data
export interface AuthRequest extends Request {
    user?: any;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.securenet_token;
    
    if (!token) return res.status(401).json({ error: "Not authorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = decoded; // Now req.user.role exists!
        next();
    } catch (error) {
        res.status(401).json({ error: "Token failed" });
    }
};

export const requireRole = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden: Insufficient Permissions" });
        }
        next();
    };
};
```

## 11.3 Applying Security
Back in `apps/api/src/routes/firRoutes.ts`:
```diff
  import express from 'express';
  import { generateFIR } from '../controllers/firController';
+ import { protect, requireRole } from '../middlewares/authMiddleware';

  const router = express.Router();

- router.post('/draft', generateFIR);
+ // Only Officers can use the AI FIR Drafter!
+ router.post('/draft', protect, requireRole('OFFICER', 'ADMIN'), generateFIR);

  export default router;
```

---

# Part 12: Conclusion & The CI/CD Pipeline 

To deploy this project:
1. We write a `Dockerfile` for the `api` and the `web` workspace.
2. We write a `docker-compose.yml` (as seen in the root of the project) to spin up Next.js, Node.js, and MongoDB locally.
3. We configure Nginx as a reverse proxy to route traffic from port 80 to `http://localhost:3000` (Next.js) and `http://localhost:5000` (API).

### The Iterative Nature of Development
As demonstrated in this 12-part master guide, building a complex application is never linear. 
- You build the `server.ts` shell (Part 3).
- You add DB Models (Part 4).
- You return to the shell to add Sockets (Part 6).
- You build the UI (Part 7, 8, 10).
- You return to the backend to add Security (Part 11).

This layered, architectural approach is how large-scale enterprise systems like SecureNET are built from the ground up without AI assistance.
