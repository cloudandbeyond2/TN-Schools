import { Router, Request, Response } from 'express';
import { Announcement } from '../models/mongo';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// GET /api/announcements
// Query params: ?role=[Headmaster|Teacher|Student|Parent|All]
router.get('/', async (req: Request, res: Response) => {
  try {
    const { role } = req.query;
    let query: any = {};

    if (role && typeof role === 'string' && role.toUpperCase() !== 'ALL') {
      const formattedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
      query = {
        $or: [
          { target: 'All' },
          { target: { $regex: new RegExp(`^${role}$`, 'i') } },
          { target: formattedRole }
        ],
        status: { $ne: 'expired' }
      };
    }

    const announcements = await Announcement.find(query).sort({ createdAt: -1 });

    const formatted = announcements.map((a: any) => ({
      id: a._id.toString(),
      title: a.title,
      body: a.body,
      priority: a.priority,
      target: a.target,
      createdBy: a.createdBy || 'Super Admin',
      createdAt: a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today',
      expiresAt: a.expiresAt ? new Date(a.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
      status: a.status,
      views: a.views || 0,
    }));

    return res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('[GET /api/announcements]', err);
    return res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/announcements
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, body, priority, target, expiresAt } = req.body;

    if (!title || !body) {
      return res.status(400).json({ success: false, error: 'Title and Body are required' });
    }

    const announcement = await Announcement.create({
      title,
      body,
      priority: priority || 'info',
      target: target || 'All',
      createdBy: 'Super Admin',
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      status: 'active',
      views: 0,
    });

    return res.status(201).json({
      success: true,
      data: {
        id: announcement._id.toString(),
        title: announcement.title,
        body: announcement.body,
        priority: announcement.priority,
        target: announcement.target,
        createdBy: announcement.createdBy,
        createdAt: new Date(announcement.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
        status: announcement.status,
        views: announcement.views,
      }
    });
  } catch (err) {
    console.error('[POST /api/announcements]', err);
    return res.status(500).json({ success: false, error: String(err) });
  }
});

// PUT /api/announcements/:id/expire
router.put('/:id/expire', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await Announcement.findByIdAndUpdate(id, { status: 'expired' }, { new: true });
    if (!item) return res.status(404).json({ success: false, error: 'Announcement not found' });
    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, error: String(err) });
  }
});

// DELETE /api/announcements/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Announcement.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
