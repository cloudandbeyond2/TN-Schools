import {
  Facility,
  ImprovementPlan,
  MaintenanceLog,
  PET_API_BASE,
  FACILITIES_KEY,
  IMPROVEMENTS_KEY,
  MAINTENANCE_KEY,
  DEFAULT_FACILITIES,
  DEFAULT_IMPROVEMENTS,
  DEFAULT_MAINTENANCE,
  petLoad,
  petSave,
} from './petData';

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ---------------------------------------------------------------------------
// Facilities
// ---------------------------------------------------------------------------

export async function fetchFacilities(): Promise<Facility[]> {
  try {
    const res = await fetch(`${PET_API_BASE}/api/pet/grounds/facilities`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        petSave(FACILITIES_KEY, json.data);
        return json.data;
      }
    }
  } catch {
    // Fallback to local storage
  }
  return petLoad<Facility[]>(FACILITIES_KEY, DEFAULT_FACILITIES);
}

export async function createFacilityApi(data: Omit<Facility, 'id'>): Promise<Facility> {
  const fallback: Facility = { ...data, id: `fac-${Date.now()}` };
  try {
    const res = await fetch(`${PET_API_BASE}/api/pet/grounds/facilities`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(fallback),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch {
    // ignore
  }
  return fallback;
}

export async function updateFacilityApi(id: string, data: Partial<Facility>): Promise<void> {
  try {
    await fetch(`${PET_API_BASE}/api/pet/grounds/facilities/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  } catch {
    // ignore
  }
}

export async function deleteFacilityApi(id: string): Promise<void> {
  try {
    await fetch(`${PET_API_BASE}/api/pet/grounds/facilities/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Improvement Plans
// ---------------------------------------------------------------------------

export async function fetchImprovements(): Promise<ImprovementPlan[]> {
  try {
    const res = await fetch(`${PET_API_BASE}/api/pet/grounds/improvements`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        petSave(IMPROVEMENTS_KEY, json.data);
        return json.data;
      }
    }
  } catch {
    // Fallback to local storage
  }
  return petLoad<ImprovementPlan[]>(IMPROVEMENTS_KEY, DEFAULT_IMPROVEMENTS);
}

export async function createImprovementApi(data: Omit<ImprovementPlan, 'id'>): Promise<ImprovementPlan> {
  const fallback: ImprovementPlan = { ...data, id: `imp-${Date.now()}` };
  try {
    const res = await fetch(`${PET_API_BASE}/api/pet/grounds/improvements`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(fallback),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch {
    // ignore
  }
  return fallback;
}

export async function updateImprovementApi(id: string, data: Partial<ImprovementPlan>): Promise<void> {
  try {
    await fetch(`${PET_API_BASE}/api/pet/grounds/improvements/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  } catch {
    // ignore
  }
}

export async function deleteImprovementApi(id: string): Promise<void> {
  try {
    await fetch(`${PET_API_BASE}/api/pet/grounds/improvements/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Maintenance Logs
// ---------------------------------------------------------------------------

export async function fetchLogs(): Promise<MaintenanceLog[]> {
  try {
    const res = await fetch(`${PET_API_BASE}/api/pet/grounds/logs`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        petSave(MAINTENANCE_KEY, json.data);
        return json.data;
      }
    }
  } catch {
    // Fallback to local storage
  }
  return petLoad<MaintenanceLog[]>(MAINTENANCE_KEY, DEFAULT_MAINTENANCE);
}

export async function createLogApi(data: Omit<MaintenanceLog, 'id'>): Promise<MaintenanceLog> {
  try {
    const res = await fetch(`${PET_API_BASE}/api/pet/grounds/logs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch {
    // ignore
  }
  const fallback: MaintenanceLog = { ...data, id: `log-${Date.now()}` };
  return fallback;
}

export async function updateLogApi(id: string, data: Partial<MaintenanceLog>): Promise<void> {
  try {
    await fetch(`${PET_API_BASE}/api/pet/grounds/logs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  } catch {
    // ignore
  }
}

export async function deleteLogApi(id: string): Promise<void> {
  try {
    await fetch(`${PET_API_BASE}/api/pet/grounds/logs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  } catch {
    // ignore
  }
}
