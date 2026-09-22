import { Router, Request, Response } from 'express';
import { requireMinRole } from '../middleware/auth.middleware';

const router = Router();

router.use(requireMinRole('PET'));

// ---------------------------------------------------------------------------
// Server-side store for ground facilities, improvements, and maintenance logs
// ---------------------------------------------------------------------------

let serverFacilities: any[] = [
  {
    id: 'fac-1',
    name: 'Kabaddi Mud Court',
    type: 'Outdoor Court',
    status: 'Ready for Use',
    surface: 'Compact Red Mud & Clay',
    lastMaintained: '2026-08-22',
    notes: 'Standard 13m x 10m court for senior boys & girls. Soft red clay ground with lime powder markings and safety corner zones.',
  },
  {
    id: 'fac-2',
    name: '200m Athletics Track & Football Field',
    type: 'Track',
    status: 'Ready for Use',
    surface: 'Natural Grass & Cinder',
    lastMaintained: '2026-09-10',
    notes: '6-lane standard running track surrounding sub-divisional soccer field. Regular mowing & line markings completed.',
  },
  {
    id: 'fac-3',
    name: 'Volleyball Court',
    type: 'Outdoor Court',
    status: 'Ready for Use',
    surface: 'Hard Clay',
    lastMaintained: '2026-09-05',
    notes: '18m x 9m court with adjustable net posts and referee chair.',
  },
];

let serverImprovements: any[] = [
  {
    id: 'imp-1',
    title: 'EVA Interlocking Mats & Solar Floodlight Upgrade for Kabaddi Court',
    scheme: "CM's Anaivarukkum Viliyattu (Sports for All)",
    estimate: 'Est. ₹2,50,000',
    status: 'Proposed',
    notes: 'Procurement of 30mm Pro-Kabaddi competition mats and 2 solar LED lights for evening zonal tournament practice.',
  },
  {
    id: 'imp-2',
    title: 'Synthetic Volleyball Court & Boundary Fencing',
    scheme: 'SDAT Infrastructure Grant',
    estimate: 'Est. ₹4,00,000',
    status: 'Submitted',
    notes: 'All-weather acrylic synthetic flooring and protective chain-link mesh around the court.',
  },
];

let serverLogs: any[] = [
  {
    id: 'log-1',
    facilityId: 'fac-1',
    date: '2026-08-22',
    work: 'Surface weeding, clay compacting, lime powder markings renew for zonal trials',
    by: 'P. E. Teacher & Ground Staff',
  },
  {
    id: 'log-2',
    facilityId: 'fac-2',
    date: '2026-09-10',
    work: 'Grass trimming, track rolling, corner flag installation',
    by: 'School Maintenance Team',
  },
];

// ---------------------------------------------------------------------------
// Facilities Routes
// ---------------------------------------------------------------------------

router.get('/facilities', (req: Request, res: Response) => {
  res.json({ success: true, data: serverFacilities });
});

router.post('/facilities', (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.name) {
      return res.status(400).json({ success: false, error: 'Facility name is required' });
    }
    const createdItem = {
      id: body.id || `fac-${Date.now()}`,
      name: body.name,
      type: body.type || 'Outdoor Field',
      status: body.status || 'Ready for Use',
      surface: body.surface || '',
      lastMaintained: body.lastMaintained || new Date().toISOString().slice(0, 10),
      notes: body.notes || '',
    };
    serverFacilities = [createdItem, ...serverFacilities.filter((f) => f.id !== createdItem.id)];
    res.json({ success: true, data: createdItem });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.put('/facilities/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;
    serverFacilities = serverFacilities.map((f) => (f.id === id ? { ...f, ...body } : f));
    const updated = serverFacilities.find((f) => f.id === id) || body;
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.delete('/facilities/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    serverFacilities = serverFacilities.filter((f) => f.id !== id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ---------------------------------------------------------------------------
// Infrastructure Improvement Plans Routes
// ---------------------------------------------------------------------------

router.get('/improvements', (req: Request, res: Response) => {
  res.json({ success: true, data: serverImprovements });
});

router.post('/improvements', (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.title) {
      return res.status(400).json({ success: false, error: 'Proposal title is required' });
    }
    const createdItem = {
      id: body.id || `imp-${Date.now()}`,
      title: body.title,
      scheme: body.scheme || 'General Fund',
      estimate: body.estimate || 'TBD',
      status: body.status || 'Proposed',
      notes: body.notes || '',
    };
    serverImprovements = [createdItem, ...serverImprovements.filter((i) => i.id !== createdItem.id)];
    res.json({ success: true, data: createdItem });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.put('/improvements/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;
    serverImprovements = serverImprovements.map((i) => (i.id === id ? { ...i, ...body } : i));
    const updated = serverImprovements.find((i) => i.id === id) || body;
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.delete('/improvements/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    serverImprovements = serverImprovements.filter((i) => i.id !== id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ---------------------------------------------------------------------------
// Maintenance Logs Routes
// ---------------------------------------------------------------------------

router.get('/logs', (req: Request, res: Response) => {
  res.json({ success: true, data: serverLogs });
});

router.post('/logs', (req: Request, res: Response) => {
  try {
    const body = req.body;
    const createdItem = {
      id: body.id || `log-${Date.now()}`,
      facilityId: body.facilityId,
      date: body.date || new Date().toISOString().slice(0, 10),
      work: body.work,
      by: body.by || 'Ground Staff',
    };
    serverLogs = [createdItem, ...serverLogs.filter((l) => l.id !== createdItem.id)];
    res.json({ success: true, data: createdItem });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.put('/logs/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;
    serverLogs = serverLogs.map((l) => (l.id === id ? { ...l, ...body } : l));
    const updated = serverLogs.find((l) => l.id === id) || body;
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.delete('/logs/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    serverLogs = serverLogs.filter((l) => l.id !== id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
