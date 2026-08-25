import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import mongoose from 'mongoose';
import { FeatureModule, IntegrationConfig, ManagedPage } from '../models/mongo';
import { requireRole } from '../middleware/auth.middleware';

const router = Router();

// Guard route to SUPERADMIN role
router.use(requireRole(['SUPERADMIN']));

// GET /api/superadmin/dashboard/stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // 1. Fetch PostgreSQL counts
    const [userCount, schoolCount, topicCount] = await Promise.all([
      prisma.user.count(),
      prisma.school.count(),
      prisma.centralTopic.count(),
    ]);

    // 2. Fetch MongoDB feature module counts
    const [enabledModulesCount, totalModulesCount, pagesCount] = await Promise.all([
      FeatureModule.countDocuments({ isEnabled: true }),
      FeatureModule.countDocuments(),
      ManagedPage.countDocuments(),
    ]);

    // 3. Fetch specific user roles counts for badges
    const [hmCount, deoCount, materialsCount, activeMinisters, aiApisCount] = await Promise.all([
      prisma.user.count({ where: { role: 'HEADMASTER' as any } }),
      prisma.user.count({ where: { role: 'DEO' as any } }),
      prisma.centralContent.count(),
      prisma.user.count({ where: { role: 'MINISTER' as any, isActive: true } }),
      IntegrationConfig.countDocuments({ type: 'AI', isEnabled: true }),
    ]);

    // 4. Check AI API configuration status
    let aiStatus = 'Offline';
    try {
      const hasGeminiKey = !!process.env.GEMINI_API_KEY;
      const hasMongoAiConfig = aiApisCount > 0;
      if (hasGeminiKey || hasMongoAiConfig) {
        aiStatus = 'Online';
      }
    } catch (e) {
      console.warn('[Dashboard Stats] Error checking AI config status:', e);
    }

    // 5. Calculate dynamic process uptime string for system status subtext
    const uptimeSeconds = process.uptime();
    const days = Math.floor(uptimeSeconds / (3600 * 24));
    const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    let uptimeStr = '';
    if (days > 0) uptimeStr += `${days}d `;
    if (hours > 0 || days > 0) uptimeStr += `${hours}h `;
    uptimeStr += `${minutes}m`;

    // 6. Calculate Active Portals based on roles represented in the User database
    let activePortals = '9 / 9';
    let activePortalsSub = 'All online';
    try {
      const rolesWithUsers = await prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
      });
      const activeRoles = rolesWithUsers.filter((g) => g._count.id > 0).length;
      activePortals = `${activeRoles} / 9`;
      if (activeRoles < 9) {
        activePortalsSub = `${9 - activeRoles} portal(s) inactive`;
      }
    } catch (e) {
      console.warn('[Dashboard Stats] Error counting active portal roles:', e);
    }

    // 7. Verify Database Connections (Data Sync health)
    let pgOk = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      pgOk = true;
    } catch {}
    const mongoOk = mongoose.connection.readyState === 1;
    const dataSync = pgOk && mongoOk ? 'Live' : 'Degraded';
    const dataSyncSub = pgOk && mongoOk ? 'All pipelines OK' : 'Database connection error';

    // 8. Format user count output (e.g. 1.26K if >= 1000, 49.3L+ if >= 100000)
    let formattedUserCount = String(userCount);
    if (userCount >= 100000) {
      formattedUserCount = `${(userCount / 100000).toFixed(2)}L`;
    } else if (userCount >= 1000) {
      formattedUserCount = `${(userCount / 1000).toFixed(2)}K`;
    } else {
      formattedUserCount = userCount.toLocaleString('en-IN');
    }

    res.json({
      success: true,
      data: {
        totalUsers: formattedUserCount,
        activeSchools: schoolCount.toLocaleString('en-IN'),
        aiStatus,
        systemUptime: '99.9%',
        uptimeSub: `Up ${uptimeStr}`,
        activePortals,
        activePortalsSub,
        modulesEnabled: String(enabledModulesCount),
        modulesEnabledSub: `of ${totalModulesCount} total`,
        syllabusItems: topicCount.toLocaleString('en-IN'),
        dataSync,
        dataSyncSub,
        // Badges:
        rawUserCount: userCount,
        rawSchoolCount: schoolCount,
        hmCount,
        deoCount,
        materialsCount,
        pagesCount,
        activeMinisters,
        aiApisCount,
        totalModules: totalModulesCount,
        enabledModules: enabledModulesCount,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
