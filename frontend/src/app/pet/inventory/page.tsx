"use client";
import PortalLayout from "@/components/PortalLayout";
import { Package, Plus, AlertCircle, CheckCircle2, Search, Trash2, Minus, RotateCcw } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { ModalShell, Field, inputCls } from "@/components/pet/PetUi";
import {
  InventoryItem,
  StockCategory,
  DEFAULT_INVENTORY,
  INVENTORY_KEY,
  petLoad,
  petSave,
  petId,
  stockStatus,
} from "@/lib/petData";

const CATEGORIES: ("All" | StockCategory)[] = ["All", "Ball Games", "Athletics", "Indoor Games", "Fitness & Training", "First Aid"];
const CONDITIONS: InventoryItem["condition"][] = ["New", "Good", "Fair", "Needs Repair", "Damaged"];

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [category, setCategory] = useState<"All" | StockCategory>("All");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    setItems(petLoad(INVENTORY_KEY, DEFAULT_INVENTORY));
    setLoaded(true);
  }, []);

  const save = (next: InventoryItem[]) => {
    setItems(next);
    petSave(INVENTORY_KEY, next);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items
      .filter((i) => category === "All" || i.category === category)
      .filter((i) => !q || i.item.toLowerCase().includes(q) || i.location.toLowerCase().includes(q));
  }, [items, category, search]);

  const stats = useMemo(() => {
    const totalUnits = items.reduce((a, i) => a + i.qty, 0);
    const low = items.filter((i) => stockStatus(i) === "warning").length;
    const critical = items.filter((i) => stockStatus(i) === "critical").length;
    return { kinds: items.length, totalUnits, low, critical };
  }, [items]);

  const changeQty = (id: string, delta: number) =>
    save(items.map((i) => (i.id === id ? { ...i, qty: Math.max(0, i.qty + delta), lastChecked: today() } : i)));

  const changeCondition = (id: string, condition: InventoryItem["condition"]) =>
    save(items.map((i) => (i.id === id ? { ...i, condition, lastChecked: today() } : i)));

  const removeItem = (id: string) => save(items.filter((i) => i.id !== id));

  const resetDefaults = () => {
    if (confirm("Reset the stock list to the default school sports material list? Your changes will be lost.")) {
      save(DEFAULT_INVENTORY);
    }
  };

  return (
    <PortalLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-heading)]">Inventory & Equipments</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Default school sports material stock, first aid and equipment condition</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={resetDefaults}
              title="Reset to default stock list"
              className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-[var(--text-muted)]"
            >
              <RotateCcw size={15} /> Reset
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <Plus size={16} /> Add Item
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Item Types" value={stats.kinds} tone="blue" />
          <StatCard label="Total Units" value={stats.totalUnits} tone="green" />
          <StatCard label="Low Stock / Repair" value={stats.low} tone="amber" />
          <StatCard label="Critical / Damaged" value={stats.critical} tone="red" />
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  category === c
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border)] hover:border-blue-400"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={15} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search item or location..."
              className="pl-9 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-blue-500 w-64"
            />
          </div>
        </div>

        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4 font-bold">Item Name</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Location</th>
                  <th className="p-4 font-bold">Quantity</th>
                  <th className="p-4 font-bold">Condition</th>
                  <th className="p-4 font-bold">Last Checked</th>
                  <th className="p-4 font-bold text-center">Status</th>
                  <th className="p-4 font-bold text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {filtered.map((item) => {
                  const status = stockStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="p-4 font-bold text-[var(--text-heading)]">
                        <div className="flex items-center gap-3">
                          <Package size={16} className="text-[var(--text-muted)] shrink-0" /> {item.item}
                        </div>
                        {item.remarks && <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400 mt-0.5 ml-7">{item.remarks}</div>}
                      </td>
                      <td className="p-4 text-[var(--text-muted)] font-semibold whitespace-nowrap">{item.category}</td>
                      <td className="p-4 text-[var(--text-muted)] font-semibold whitespace-nowrap">{item.location}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => changeQty(item.id, -1)} className="p-1 rounded-md border border-[var(--border)] hover:bg-slate-100 dark:hover:bg-slate-800" title="Decrease">
                            <Minus size={12} />
                          </button>
                          <span className={`font-bold w-8 text-center ${item.qty < item.minQty ? "text-red-500" : ""}`}>{item.qty}</span>
                          <button onClick={() => changeQty(item.id, 1)} className="p-1 rounded-md border border-[var(--border)] hover:bg-slate-100 dark:hover:bg-slate-800" title="Increase">
                            <Plus size={12} />
                          </button>
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] mt-1">min {item.minQty}</div>
                      </td>
                      <td className="p-4">
                        <select
                          value={item.condition}
                          onChange={(e) => changeCondition(item.id, e.target.value as InventoryItem["condition"])}
                          className="px-2 py-1 rounded-lg border border-[var(--border)] bg-transparent text-xs font-semibold focus:outline-none focus:border-blue-500"
                        >
                          {CONDITIONS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 text-[var(--text-muted)] font-semibold whitespace-nowrap">{item.lastChecked}</td>
                      <td className="p-4 text-center">
                        {status === "ok" && <CheckCircle2 size={18} className="text-green-500 inline-block" />}
                        {status === "warning" && <AlertCircle size={18} className="text-amber-500 inline-block" />}
                        {status === "critical" && <AlertCircle size={18} className="text-red-500 inline-block" />}
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => removeItem(item.id)} className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="Remove item">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {loaded && filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-[var(--text-muted)]">No items match the current filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAdd && (
        <AddItemModal
          onClose={() => setShowAdd(false)}
          onAdd={(item) => {
            save([{ ...item, id: petId(), lastChecked: today() }, ...items]);
            setShowAdd(false);
          }}
        />
      )}
    </PortalLayout>
  );
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: "blue" | "green" | "amber" | "red" }) {
  const tones = {
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    amber: "text-amber-600 dark:text-amber-400",
    red: "text-red-600 dark:text-red-400",
  };
  return (
    <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border)]">
      <div className={`text-3xl font-black ${tones[tone]}`}>{value}</div>
      <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

function AddItemModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (item: Omit<InventoryItem, "id" | "lastChecked">) => void;
}) {
  const [item, setItem] = useState("");
  const [category, setCategory] = useState<StockCategory>("Ball Games");
  const [qty, setQty] = useState(1);
  const [minQty, setMinQty] = useState(1);
  const [condition, setCondition] = useState<InventoryItem["condition"]>("New");
  const [location, setLocation] = useState("Sports Room A");
  const [remarks, setRemarks] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ item, category, qty, minQty, condition, location, remarks: remarks || undefined });
  };

  return (
    <ModalShell title="Add Inventory Item" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Item Name">
          <input required value={item} onChange={(e) => setItem(e.target.value)} placeholder="e.g. Hockey Stick" className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <select value={category} onChange={(e) => setCategory(e.target.value as StockCategory)} className={inputCls}>
              {CATEGORIES.filter((c) => c !== "All").map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Condition">
            <select value={condition} onChange={(e) => setCondition(e.target.value as InventoryItem["condition"])} className={inputCls}>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Quantity">
            <input required type="number" min={0} value={qty} onChange={(e) => setQty(Number(e.target.value))} className={inputCls} />
          </Field>
          <Field label="Low-stock Threshold">
            <input required type="number" min={0} value={minQty} onChange={(e) => setMinQty(Number(e.target.value))} className={inputCls} />
          </Field>
        </div>
        <Field label="Storage Location">
          <input required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Sports Room A" className={inputCls} />
        </Field>
        <Field label="Remarks (optional)">
          <input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="e.g. Reorder before Sports Day" className={inputCls} />
        </Field>
        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
          Add to Stock
        </button>
      </form>
    </ModalShell>
  );
}
