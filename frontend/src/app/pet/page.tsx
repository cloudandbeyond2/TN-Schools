"use client";
import PortalLayout from "@/components/PortalLayout";
import PETPortalBanner from "@/components/PETPortalBanner";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import {
  Activity,
  Users,
  Map,
  Package,
  Trophy,
  AlertTriangle,
  TrendingUp,
  HeartPulse,
  Medal,
  Tent,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  petLoad,
  stockStatus,
  DEFAULT_INVENTORY,
  INVENTORY_KEY,
  DEFAULT_EVENTS,
  EVENTS_KEY,
  DEFAULT_AWARDS,
  AWARDS_KEY,
  DEFAULT_FACILITIES,
  FACILITIES_KEY,
  DEFAULT_RECORDS,
  RECORDS_KEY,
  InventoryItem,
  SportsEvent,
  AwardRecord,
  Facility,
  FitnessRecord,
  PET_API_BASE,
} from "@/lib/petData";

export default function PETDashboard() {
  const { data: session } = useSession();
  const { lang } = usePortalLanguage();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [awards, setAwards] = useState<AwardRecord[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [records, setRecords] = useState<FitnessRecord[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(true);

  const fetchAppointments = async () => {
    if (!session?.user) return;
    const userId = (session.user as any).id;
    try {
      const res = await fetch(`${PET_API_BASE}/api/parent/pta-appointments?teacherUserId=${userId}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAppointments(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch PTA appointments:", err);
    } finally {
      setLoadingAppts(false);
    }
  };

  const handleUpdateStatus = async (apptId: string, status: 'Approved' | 'Rejected') => {
    try {
      const res = await fetch(`${PET_API_BASE}/api/parent/pta-appointments/${apptId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const json = await res.json();
      if (json.success) {
        fetchAppointments();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  useEffect(() => {
    setInventory(petLoad(INVENTORY_KEY, DEFAULT_INVENTORY));
    setEvents(petLoad(EVENTS_KEY, DEFAULT_EVENTS));
    setAwards(petLoad(AWARDS_KEY, DEFAULT_AWARDS));
    setFacilities(petLoad(FACILITIES_KEY, DEFAULT_FACILITIES));
    setRecords(petLoad(RECORDS_KEY, DEFAULT_RECORDS));
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchAppointments();
    }
  }, [session]);

  const equipAlerts = inventory.filter((i) => stockStatus(i) !== "ok").length;
  const upcomingEvents = events
    .filter((e) => e.status === "Upcoming" || e.status === "Ongoing")
    .sort((a, b) => a.date.localeCompare(b.date));
  const groundsReady = facilities.filter((f) => f.status === "Ready for Use").length;
  const groundStatus = facilities.length === 0 ? "—" : groundsReady === facilities.length ? "All Ready" : `${groundsReady}/${facilities.length} Ready`;
  const goldCount = awards.filter((a) => a.medal === "Gold").length;
  const avgFitness = records.length ? Math.round(records.reduce((a, r) => a + r.fitnessScore, 0) / records.length) : 0;

  return (
    <PortalLayout>
      <div className="p-6 w-full space-y-6">
        <PETPortalBanner pageKey="dashboard" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Tracked Athletes" value={String(records.length)} sub={`Avg fitness ${avgFitness}%`} icon={Users} color="blue" href="/pet/records" />
          <StatCard title="Upcoming Events" value={String(upcomingEvents.length)} sub="Events & competitions" icon={Trophy} color="amber" href="/pet/sports-conducted" />
          <StatCard title="Ground Condition" value={groundStatus} sub="Facilities ready for use" icon={Map} color="green" href="/pet/ground-condition" />
          <StatCard title="Equipment Alerts" value={String(equipAlerts)} sub="Low stock or repair needed" icon={AlertTriangle} color="red" href="/pet/inventory" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[var(--text-heading)] flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-500" /> Student Fitness Trends
                </h3>
                <span className="text-xs font-bold text-[var(--text-muted)]">This week</span>
              </div>
              <div className="h-48 flex items-end justify-between px-4 pb-4 border-b border-[var(--border-light)] gap-2">
                {[65, 72, 68, 85, 78, 82, 90].map((h, i) => (
                  <div key={i} className="w-full bg-blue-100 dark:bg-blue-900/20 rounded-t-lg relative group">
                    <div className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg transition-all" style={{ height: `${h}%` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between px-4 mt-2 text-xs font-semibold text-[var(--text-muted)]">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <QuickLinkCard href="/pet/records" title="Health Records" desc="Monitor student physical & mental health, BMI and fitness scores" icon={HeartPulse} />
              <QuickLinkCard href="/pet/inventory" title="Equipment & First Aid" desc="Default sports material stock list and medical kits" icon={Package} />
              <QuickLinkCard href="/pet/clubs" title="Clubs & Activities" desc="Create clubs and add student members" icon={Tent} />
              <QuickLinkCard href="/pet/awards" title="Awards & Certifications" desc={`Wall of fame — ${goldCount} gold medals this year`} icon={Medal} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)] shadow-sm">
              <h3 className="text-lg font-bold text-[var(--text-heading)] mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-amber-500" /> Upcoming Events
              </h3>
              <div className="space-y-4">
                {upcomingEvents.slice(0, 5).map((ev) => (
                  <EventItem key={ev.id} title={ev.name} date={ev.date} level={ev.level} />
                ))}
                {upcomingEvents.length === 0 && (
                  <div className="text-sm text-[var(--text-muted)] text-center py-4">No upcoming events logged.</div>
                )}
              </div>
              <Link href="/pet/sports-conducted" className="block mt-6 text-center text-sm font-semibold text-blue-500 hover:underline">
                View All Events & Competitions
              </Link>
            </div>

            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)] shadow-sm">
              <h3 className="text-lg font-bold text-[var(--text-heading)] mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-500" /> Stock Alerts
              </h3>
              <div className="space-y-3">
                {inventory
                  .filter((i) => stockStatus(i) !== "ok")
                  .slice(0, 4)
                  .map((i) => (
                    <div key={i.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-[var(--border-light)]">
                      <div>
                        <div className="text-sm font-bold text-[var(--text-heading)]">{i.item}</div>
                        <div className="text-xs font-semibold text-amber-500">{i.qty < i.minQty ? `Only ${i.qty} left (min ${i.minQty})` : i.condition}</div>
                      </div>
                      <Package size={16} className="text-[var(--text-muted)]" />
                    </div>
                  ))}
                {equipAlerts === 0 && <div className="text-sm text-[var(--text-muted)] text-center py-4">All stock levels are healthy.</div>}
              </div>
              <Link href="/pet/inventory" className="block mt-4 text-center text-sm font-semibold text-blue-500 hover:underline">
                Open Inventory
              </Link>
            </div>

          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

function StatCard({ title, value, sub, icon: Icon, color, href }: { title: string; value: string; sub?: string; icon: any; color: string; href: string }) {
  const colorMap: any = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  };
  return (
    <Link href={href} className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border)] shadow-sm flex items-center gap-4 hover:border-blue-500/40 transition-colors">
      <div className={`p-3 rounded-xl ${colorMap[color]}`}>
        <Icon size={24} />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-[var(--text-muted)]">{title}</div>
        <div className="text-2xl font-black text-[var(--text-heading)] truncate">{value}</div>
        {sub && <div className="text-[11px] font-semibold text-[var(--text-muted)]">{sub}</div>}
      </div>
    </Link>
  );
}

function QuickLinkCard({ href, title, desc, icon: Icon }: { href: string; title: string; desc: string; icon: any }) {
  return (
    <Link href={href} className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border)] shadow-sm hover:border-blue-500/50 transition-colors group block">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 group-hover:bg-blue-500 group-hover:text-white transition-colors">
          <Icon size={20} />
        </div>
        <h4 className="font-bold text-[var(--text-heading)]">{title}</h4>
      </div>
      <p className="text-xs text-[var(--text-muted)] leading-relaxed">{desc}</p>
    </Link>
  );
}

function EventItem({ title, date, level }: { title: string; date: string; level: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-[var(--border-light)]">
      <div className="min-w-0 pr-2">
        <h5 className="text-sm font-bold text-[var(--text-heading)] truncate">{title}</h5>
        <div className="text-xs font-semibold text-amber-500 mt-1">{level} Level</div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Date</div>
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">{date}</div>
      </div>
    </div>
  );
}
