"use client";
import { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { apiFetch } from "@/lib/api";

type SyncStatus = "synced" | "syncing" | "error" | "stale";

interface PipelineNode {
  id: string;
  label: string;
  icon: string;
  color: string;
  count: string;
  syncStatus: SyncStatus;
  lastSync: string;
  recordsIn: number;
  recordsOut: number;
  latencyMs: number;
}

interface DataFlow {
  from: string;
  to: string;
  label: string;
  volume: number;
  status: SyncStatus;
}

const nodes: PipelineNode[] = [
  { id:"school", label:"School Level", icon:"🏫", color:"from-emerald-600 to-teal-700", count:"37,404", syncStatus:"synced", lastSync:"2 min ago", recordsIn:0, recordsOut:142_000, latencyMs:120 },
  { id:"hm", label:"Headmaster", icon:"👤", color:"from-blue-600 to-indigo-700", count:"37,404", syncStatus:"synced", lastSync:"3 min ago", recordsIn:142_000, recordsOut:98_000, latencyMs:89 },
  { id:"beo", label:"BEO Level", icon:"🏢", color:"from-violet-600 to-purple-700", count:"385", syncStatus:"synced", lastSync:"5 min ago", recordsIn:98_000, recordsOut:52_000, latencyMs:145 },
  { id:"deo", label:"DEO Level", icon:"🗺️", color:"from-pink-600 to-rose-700", count:"38", syncStatus:"stale", lastSync:"18 min ago", recordsIn:52_000, recordsOut:28_000, latencyMs:210 },
  { id:"commissioner", label:"Commissioner", icon:"⚖️", color:"from-cyan-600 to-sky-700", count:"12", syncStatus:"synced", lastSync:"7 min ago", recordsIn:28_000, recordsOut:12_000, latencyMs:98 },
  { id:"minister", label:"Minister", icon:"🏛️", color:"from-red-600 to-orange-700", count:"1", syncStatus:"synced", lastSync:"10 min ago", recordsIn:12_000, recordsOut:800, latencyMs:65 },
];

const flows: DataFlow[] = [
  { from:"school", to:"hm", label:"Attendance + Marks", volume:142_000, status:"synced" },
  { from:"hm", to:"beo", label:"Summary Reports", volume:98_000, status:"synced" },
  { from:"beo", to:"deo", label:"Block Analytics", volume:52_000, status:"stale" },
  { from:"deo", to:"commissioner", label:"District Reports", volume:28_000, status:"synced" },
  { from:"commissioner", to:"minister", label:"State KPIs", volume:12_000, status:"synced" },
];

const statusBadge: Record<SyncStatus, { color:string; text:string; dot:string }> = {
  synced:  { color:"text-emerald-400 bg-emerald-500/10 border-emerald-500/30", text:"SYNCED",  dot:"bg-emerald-500" },
  syncing: { color:"text-blue-400 bg-blue-500/10 border-blue-500/30",         text:"SYNCING", dot:"bg-blue-400 animate-pulse" },
  error:   { color:"text-red-400 bg-red-500/10 border-red-500/30",            text:"ERROR",   dot:"bg-red-500" },
  stale:   { color:"text-amber-400 bg-amber-500/10 border-amber-500/30",      text:"STALE",   dot:"bg-amber-400" },
};

const fmt = (n: number) => n >= 1000 ? `${(n/1000).toFixed(0)}K` : n.toString();

export default function DataFlowMonitor() {
  const [nodeData, setNodeData] = useState<PipelineNode[]>(nodes);
  const [tick, setTick] = useState(0);
  const [selectedNode, setSelectedNode] = useState<PipelineNode | null>(null);

  const [portalVisibility, setPortalVisibility] = useState({
    beo: true,
    deo: true,
    commissioner: true,
    minister: true,
    pet: true,
  });

  const isNodeVisible = (id: string) => {
    if (id === "beo" && !portalVisibility.beo) return false;
    if (id === "deo" && !portalVisibility.deo) return false;
    if (id === "commissioner" && !portalVisibility.commissioner) return false;
    if (id === "minister" && !portalVisibility.minister) return false;
    return true;
  };

  const fetchEffective = async () => {
    try {
      const res = await apiFetch("/api/features/effective");
      const data = await res.json();
      if (data.success && data.data?.portalVisibility) {
        setPortalVisibility(data.data.portalVisibility);
      }
    } catch {}
  };

  // Simulate live data ticking
  useEffect(() => {
    fetchEffective();
    window.addEventListener("portalVisibilityChanged", fetchEffective);
    window.addEventListener("focus", fetchEffective);

    const timer = setInterval(() => setTick((t) => t + 1), 3000);
    return () => {
      clearInterval(timer);
      window.removeEventListener("portalVisibilityChanged", fetchEffective);
      window.removeEventListener("focus", fetchEffective);
    };
  }, []);

  useEffect(() => {
    setNodeData((prev) => prev.map((n) => n.syncStatus === "synced" ? {
      ...n,
      recordsOut: n.recordsOut + Math.floor(Math.random() * 50),
      latencyMs: Math.max(50, n.latencyMs + Math.floor((Math.random() - 0.5) * 20)),
    } : n));
  }, [tick]);

  const triggerSync = (id: string) => {
    setNodeData((prev) => prev.map((n) => n.id === id ? { ...n, syncStatus: "syncing", lastSync: "Syncing..." } : n));
    setTimeout(() => {
      setNodeData((prev) => prev.map((n) => n.id === id ? { ...n, syncStatus:"synced", lastSync:"just now" } : n));
    }, 2000);
  };

  const visibleNodes = nodeData.filter((n) => isNodeVisible(n.id));
  const visibleFlows = flows.filter((f) => isNodeVisible(f.from) && isNodeVisible(f.to));

  const totalRecords = visibleNodes.reduce((a, n) => a + n.recordsOut, 0);
  const avgLatency = visibleNodes.length > 0 ? Math.round(visibleNodes.reduce((a, n) => a + n.latencyMs, 0) / visibleNodes.length) : 0;
  const staleCount = visibleNodes.filter((n) => n.syncStatus === "stale" || n.syncStatus === "error").length;

  return (
    <PortalLayout>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-white">🔄 Data Flow Monitor</h1>
          <p className="text-xs text-slate-400 mt-1">Live visualization of data pipelines across the entire TN Schools hierarchy</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full animate-pulse">
            ● LIVE
          </span>
          <button onClick={() => visibleNodes.forEach((n) => triggerSync(n.id))}
            className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg transition">
            ↺ Sync All
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label:"Total Records Flowing", value:fmt(totalRecords), icon:"📊", color:"text-blue-400" },
          { label:"Avg Latency", value:`${avgLatency}ms`, icon:"⚡", color:"text-cyan-400" },
          { label:"Healthy Pipelines", value:`${visibleNodes.length - staleCount}/${visibleNodes.length}`, icon:"✅", color:"text-emerald-400" },
          { label:"Issues", value:staleCount, icon:"⚠️", color:staleCount > 0 ? "text-amber-400" : "text-slate-500" },
        ].map((k) => (
          <div key={k.label} className="glass rounded-xl p-4 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xl">{k.icon}</span>
              <div>
                <div className={`text-lg font-extrabold ${k.color}`}>{k.value}</div>
                <div className="text-[10px] text-slate-500">{k.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Flow Diagram */}
      <div className="glass rounded-2xl p-6 mb-6 border border-slate-800">
        <h2 className="text-sm font-bold text-white mb-6">📡 Data Pipeline Hierarchy Flow</h2>
        <div className="flex items-start gap-0 overflow-x-auto pb-4">
          {visibleNodes.map((node, idx) => {
            const sb = statusBadge[node.syncStatus];
            const flow = visibleFlows[idx];
            return (
              <div key={node.id} className="flex items-center shrink-0">
                {/* Node */}
                <div
                  onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  {/* Card */}
                  <div className={`w-32 rounded-2xl p-3 border transition-all ${
                    selectedNode?.id === node.id ? "border-white/30 shadow-lg scale-105" : "border-slate-700 hover:border-slate-500"
                  } bg-slate-900/80`}>
                    <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${node.color} flex items-center justify-center text-xl mb-2`}>{node.icon}</div>
                    <div className="text-[10px] font-bold text-white text-center leading-tight">{node.label}</div>
                    <div className="text-[9px] text-slate-500 text-center">{node.count}</div>
                    <div className={`flex items-center justify-center gap-1 mt-2`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sb.dot}`} />
                      <span className={`text-[8px] font-bold ${sb.color.split(" ")[0]}`}>{sb.text}</span>
                    </div>
                    <div className="text-[8px] text-slate-600 text-center mt-1">{node.lastSync}</div>
                  </div>

                  {/* Metrics below */}
                  <div className="mt-2 text-center">
                    <div className="text-[8px] text-slate-500">{fmt(node.recordsOut)} records</div>
                    <div className="text-[8px] text-slate-600">{node.latencyMs}ms</div>
                    <button onClick={(e) => { e.stopPropagation(); triggerSync(node.id); }}
                      className="mt-1 text-[8px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-full transition">
                      ↺ Sync
                    </button>
                  </div>
                </div>

                {/* Arrow between nodes */}
                {idx < visibleNodes.length - 1 && (
                  <div className="flex flex-col items-center mx-2 shrink-0">
                    <div className={`h-0.5 w-12 ${visibleFlows[idx]?.status === "synced" ? "bg-emerald-500" : visibleFlows[idx]?.status === "stale" ? "bg-amber-500" : "bg-red-500"}`} />
                    <div className="text-[7px] text-slate-600 mt-0.5 max-w-[48px] text-center leading-tight">{visibleFlows[idx]?.label}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Detail */}
      {selectedNode && (
        <div className="glass rounded-2xl p-5 border border-white/10 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedNode.color} flex items-center justify-center text-xl`}>{selectedNode.icon}</div>
            <div>
              <h3 className="text-sm font-bold text-white">{selectedNode.label} — Detail View</h3>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusBadge[selectedNode.syncStatus].color}`}>{statusBadge[selectedNode.syncStatus].text}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {[
              { label:"Nodes", value:selectedNode.count },
              { label:"Records In", value:fmt(selectedNode.recordsIn) },
              { label:"Records Out", value:fmt(selectedNode.recordsOut) },
              { label:"Latency", value:`${selectedNode.latencyMs}ms` },
            ].map((k) => (
              <div key={k.label} className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
                <div className="text-base font-bold text-white">{k.value}</div>
                <div className="text-[9px] text-slate-500">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pipeline Table */}
      <div className="glass rounded-2xl overflow-hidden border border-slate-800">
        <div className="px-5 py-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">📋 Pipeline Status Table</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Data Type</th>
                <th>Volume</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleFlows.map((flow, i) => {
                const fromNode = visibleNodes.find((n) => n.id === flow.from);
                const toNode = visibleNodes.find((n) => n.id === flow.to);
                const sb = statusBadge[flow.status];
                return (
                  <tr key={i}>
                    <td>{fromNode?.icon} {fromNode?.label}</td>
                    <td>{toNode?.icon} {toNode?.label}</td>
                    <td>{flow.label}</td>
                    <td className="font-mono">{fmt(flow.volume)} records</td>
                    <td>
                      <span className={`flex items-center gap-1.5 text-[9px] font-bold`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sb.dot}`} />
                        <span className={sb.color.split(" ")[0]}>{sb.text}</span>
                      </span>
                    </td>
                    <td>
                      <button onClick={() => { triggerSync(flow.from); triggerSync(flow.to); }}
                        className="text-[10px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-lg transition">↺ Resync</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </PortalLayout>
  );
}
