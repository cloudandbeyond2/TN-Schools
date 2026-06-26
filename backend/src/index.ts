import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv'; // trigger nodemon reload
import { connectMongoDB } from './config/db';
import { prisma } from './config/prisma';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Startup copy task for premium educational infographic assets
try {
  const destDir = path.join(__dirname, '../../frontend/public/images');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // 1. Smart Farm Sync
  const srcFarm = "C:\\Users\\WIN\\.gemini\\antigravity-ide\\brain\\7e726b9b-a531-4fad-84b7-139b9c7a801c\\smart_farm_infographic_1782371804730.png";
  const destFarm = path.join(destDir, "smart_farm_infographic.png");
  if (fs.existsSync(srcFarm)) {
    fs.copyFileSync(srcFarm, destFarm);
    console.log("✅ [Startup Image Sync] Copied generated smart farm infographic to frontend!");
  }

  // 2. Laboratory Classroom Sync
  const srcLab = "C:\\Users\\WIN\\.gemini\\antigravity-ide\\brain\\7e726b9b-a531-4fad-84b7-139b9c7a801c\\laboratory_lesson_infographic_1782372221562.png";
  const destLab = path.join(destDir, "laboratory_lesson_infographic.png");
  if (fs.existsSync(srcLab)) {
    fs.copyFileSync(srcLab, destLab);
    console.log("✅ [Startup Image Sync] Copied generated laboratory lesson infographic to frontend!");
  }
} catch (e) {
  console.error("❌ [Startup Image Sync] Failed to copy images:", e);
}


// Route imports
import aiRoutes        from './routes/ai.routes';
import portfolioRoutes from './routes/portfolio.routes';
import sportsRoutes from './routes/sports.routes';
import wellnessRoutes  from './routes/wellness.routes';
import studentRoutes   from './routes/student.routes';
import activitiesRoutes from './routes/activities.routes';
import attendanceRoutes from './routes/attendance.routes';
import schoolRoutes    from './routes/school.routes';
import headmasterRoutes from './routes/headmaster.routes';
import pageRoutes       from './routes/page.routes';
import userRoutes       from './routes/user.routes';
import teacherRoutes    from './routes/teacher.routes';
import notificationRoutes from './routes/notification.routes';
import classRoutes       from './routes/class.routes';
import parentRoutes     from './routes/parent.routes';
import centralContentRoutes from './routes/centralContent.routes';

// Trigger nodemon restart after prisma client generation
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────────
if (!process.env.VERCEL) {
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = origin === 'http://localhost:3000' ||
                        origin === 'https://tn-schools.vercel.app' ||
                        /^(https?:\/\/tn-schools(-[a-z0-9-]+)?\.vercel\.app)$/.test(origin) ||
                        (process.env.NEXTAUTH_URL && origin === process.env.NEXTAUTH_URL);
      callback(null, isAllowed ? true : false);
    },
    credentials: true
  }));
}
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));

// ─── Connect Databases ───────────────────────────────────────
connectMongoDB();  // MongoDB Atlas

// ─── Health Check ────────────────────────────────────────────
app.get('/', async (req: Request, res: Response) => {
  let pgStatus = 'unknown';
  try {
    await prisma.$queryRaw`SELECT 1`;
    pgStatus = 'connected';
  } catch {
    pgStatus = 'disconnected (check POSTGRES_URI in .env)';
  }
  res.json({
    status: 'ok',
    message: 'TN Schools AI Ecosystem API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    databases: {
      mongodb: 'connected',
      postgresql: pgStatus,
    },
  });
});

// ─── API Routes ──────────────────────────────────────────────
app.use('/api/ai',         aiRoutes);
app.use('/api/portfolio',  portfolioRoutes);
app.use('/api/sports',     sportsRoutes);
app.use('/api/wellness',   wellnessRoutes);
app.use('/api/students',   studentRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/schools',    schoolRoutes);
app.use('/api/headmaster', headmasterRoutes);
app.use('/api/pages',      pageRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/teacher',    teacherRoutes);
app.use('/api/parent',     parentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/classes',    classRoutes);
app.use('/api/centralized-content', centralContentRoutes);


// ─── 404 Handler ─────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.url} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error]', err.message);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// ─── Start Server ─────────────────────────────────────────────
let server: any;
if (!process.env.VERCEL) {
  server = app.listen(port, () => {
    console.log(`\n🚀  TN Schools API → http://localhost:${port}`);
    console.log(`📦  MongoDB   : Atlas Cluster`);
    console.log(`🐘  PostgreSQL: Google Cloud SQL`);
    console.log(`🌍  Env       : ${process.env.NODE_ENV || 'development'}\n`);
  });

  // ─── Auto-recover from port conflict ─────────────────────────────
  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌  Port ${port} is still in use. Run: npm run kill\n`);
      process.exit(1);
    } else {
      throw err;
    }
  });

  // ─── Graceful shutdown ────────────────────────────────────────────
  process.on('SIGTERM', async () => {
    if (server) server.close();
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    if (server) server.close();
    await prisma.$disconnect();
    process.exit(0);
  });
}

export default app;


