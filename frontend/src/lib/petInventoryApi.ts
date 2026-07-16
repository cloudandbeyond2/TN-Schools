"use client";

// API layer for the PET portal's sports inventory & equipment requests.
// Rows come back in the same shape the UI uses (flat), so no mapping beyond
// nullable/blank normalization is needed.

import { apiFetch } from "@/lib/api";
import { EquipmentRequest, InventoryItem, normalizeInventoryItem } from "@/lib/petData";

const TIMEOUT_MS = 12000;

async function request(path: string, init: RequestInit = {}): Promise<any> {
  const res = await apiFetch(`/api/pet/inventory${path}`, {
    ...init,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || `Request failed (${res.status})`);
  }
  return json.data;
}

function rowToItem(row: any): InventoryItem {
  return normalizeInventoryItem({
    ...row,
    expiryDate: row.expiryDate || undefined,
    remarks: row.remarks || undefined,
  });
}

function itemToBody(item: Omit<InventoryItem, "id"> & { id?: string }) {
  return {
    item: item.item,
    category: item.category,
    qty: item.qty,
    qtyIssued: item.qtyIssued,
    qtyDamaged: item.qtyDamaged,
    minQty: item.minQty,
    condition: item.condition,
    location: item.location,
    lastChecked: item.lastChecked,
    expiryDate: item.expiryDate || "",
    remarks: item.remarks || "",
  };
}

function rowToRequest(row: any): EquipmentRequest {
  return {
    id: row.id,
    type: row.type,
    item: row.item,
    itemId: row.itemId || undefined,
    qty: row.qty,
    requestedBy: row.requestedBy,
    purpose: row.purpose,
    date: row.date,
    neededBy: row.neededBy || undefined,
    status: row.status,
    notes: row.notes || undefined,
  };
}

function requestToBody(req: Partial<EquipmentRequest>) {
  const body: Record<string, string | number> = {};
  if (req.type !== undefined) body.type = req.type;
  if (req.item !== undefined) body.item = req.item;
  if (req.itemId !== undefined) body.itemId = req.itemId;
  if (req.qty !== undefined) body.qty = req.qty;
  if (req.requestedBy !== undefined) body.requestedBy = req.requestedBy;
  if (req.purpose !== undefined) body.purpose = req.purpose;
  if (req.date !== undefined) body.date = req.date;
  if (req.neededBy !== undefined) body.neededBy = req.neededBy;
  if (req.status !== undefined) body.status = req.status;
  if (req.notes !== undefined) body.notes = req.notes;
  return body;
}

// ── Items ───────────────────────────────────────────────────────────────────

export async function fetchInventoryItems(): Promise<InventoryItem[]> {
  const rows: any[] = await request("/items");
  return rows.map(rowToItem);
}

export async function createInventoryItem(item: Omit<InventoryItem, "id">): Promise<InventoryItem> {
  const row = await request("/items", { method: "POST", body: JSON.stringify(itemToBody(item)) });
  return rowToItem(row);
}

export async function createInventoryItemsBulk(items: Omit<InventoryItem, "id">[]): Promise<InventoryItem[]> {
  const rows: any[] = await request("/items/bulk", {
    method: "POST",
    body: JSON.stringify({ items: items.map(itemToBody) }),
  });
  return rows.map(rowToItem);
}

export async function updateInventoryItem(item: InventoryItem): Promise<InventoryItem> {
  const row = await request(`/items/${item.id}`, { method: "PUT", body: JSON.stringify(itemToBody(item)) });
  return rowToItem(row);
}

export async function deleteInventoryItem(id: string): Promise<void> {
  await request(`/items/${id}`, { method: "DELETE" });
}

// ── Requests ────────────────────────────────────────────────────────────────

export async function fetchEquipmentRequests(): Promise<EquipmentRequest[]> {
  const rows: any[] = await request("/requests");
  return rows.map(rowToRequest);
}

export async function createEquipmentRequest(req: Omit<EquipmentRequest, "id" | "status">): Promise<EquipmentRequest> {
  const row = await request("/requests", { method: "POST", body: JSON.stringify(requestToBody(req)) });
  return rowToRequest(row);
}

/**
 * Update a request. When `status` changes, the backend also moves stock on
 * the linked item (issue/return/receive) — refetch items afterwards.
 */
export async function updateEquipmentRequest(id: string, patch: Partial<EquipmentRequest>): Promise<EquipmentRequest> {
  const row = await request(`/requests/${id}`, { method: "PUT", body: JSON.stringify(requestToBody(patch)) });
  return rowToRequest(row);
}

export async function deleteEquipmentRequest(id: string): Promise<void> {
  await request(`/requests/${id}`, { method: "DELETE" });
}
