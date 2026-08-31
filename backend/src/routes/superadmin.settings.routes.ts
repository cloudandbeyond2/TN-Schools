import { Router, Request, Response } from 'express';
import { PlatformSetting } from '../models/mongo';
import { requireRole } from '../middleware/auth.middleware';

// Global platform settings, single document with key 'global'.
// maintenanceMode is surfaced to non-admin clients only through
// GET /api/features/effective.
const router = Router();

router.use(requireRole(['SUPERADMIN']));

// GET /api/superadmin/settings — create with defaults on first read
router.get('/', async (_req: Request, res: Response) => {
  try {
    const settings = await PlatformSetting.findOneAndUpdate(
      { key: 'global' },
      { $setOnInsert: { key: 'global' } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// PUT /api/superadmin/settings — partial update
router.put('/', async (req: Request, res: Response) => {
  try {
    const allowed = [
      // Portal switches are edited from the Portal Control page
      // (PUT /api/features/portals), not here.
      'institutionType',
      'maintenanceMode',
      'allowDemoLogin',
      'enableAiFeatures',
      'enableNotifications',
      'sessionTimeout',
      'maxUploadSize',
      'defaultLanguage',
    ] as const;

    const $set: Record<string, unknown> = { updatedBy: req.user?.name || req.user?.id };
    for (const field of allowed) {
      if (req.body[field] !== undefined) $set[field] = req.body[field];
    }

    const settings = await PlatformSetting.findOneAndUpdate(
      { key: 'global' },
      { $set, $setOnInsert: { key: 'global' } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
