"use client";
import PortalLayout from "@/components/PortalLayout";
import KpiStrip from "@/components/kpi/KpiStrip";


const districts = [
  { name: "Chennai", schools: 820, students: "6.2L", attendance: 93, passRate: 91, score: 94 },
  { name: "Coimbatore", schools: 710, students: "5.8L", attendance: 91, passRate: 88, score: 91 },
  { name: "Madurai", schools: 650, students: "5.1L", attendance: 89, passRate: 86, score: 88 },
  { name: "Tiruchirappalli", schools: 590, students: "4.7L", attendance: 87, passRate: 84, score: 86 },
  { name: "Salem", schools: 540, students: "4.2L", attendance: 85, passRate: 81, score: 83 },
  { name: "Tirunelveli", schools: 480, students: "3.9L", attendance: 83, passRate: 79, score: 80 },
];

export default function CommissionerDashboard() {
  return (
    <PortalLayout>
      {/* State-level KPIs — real academic-year analytics */}
      <KpiStrip path="/api/analytics/state" title="State KPIs" />

      {/* Budget Utilization */}
      <div className="glass rounded-2xl p-6 mb-6 fade-in-2">
        <h2 className="text-base font-semibold text-white mb-5">💰 Budget Utilization by Scheme</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { scheme: "Samagra Shiksha", allocated: 2400, used: 1820, color: "#06b6d4" },
            { scheme: "Infrastructure Dev.", allocated: 1200, used: 980, color: "#8b5cf6" },
            { scheme: "Mid-Day Meal", allocated: 900, used: 876, color: "#10b981" },
            { scheme: "Scholarship Disbursal", allocated: 650, used: 520, color: "#f59e0b" },
          ].map((b) => {
            const pct = Math.round((b.used / b.allocated) * 100);
            return (
              <div key={b.scheme} className="bg-slate-900/60 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">{b.scheme}</div>
                <div className="text-xl font-bold mb-2" style={{ color: b.color }}>₹{b.used}Cr</div>
                <div className="progress-bar mb-1">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${b.color}, ${b.color}aa)` }} />
                </div>
                <div className="text-xs text-slate-600">{pct}% of ₹{b.allocated}Cr</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* District Comparison Table */}
      <div className="glass rounded-2xl p-6 fade-in-3">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">🗺️ District Performance Index</h2>
          <button id="commissioner-export" className="text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-lg">⬇ Export Data</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>District</th>
              <th>Schools</th>
              <th>Students</th>
              <th>Attendance</th>
              <th>Pass Rate</th>
              <th>Performance Score</th>
            </tr>
          </thead>
          <tbody>
            {districts.map((d, i) => (
              <tr key={d.name}>
                <td className="font-medium text-white">{d.name}</td>
                <td>{d.schools.toLocaleString()}</td>
                <td>{d.students}</td>
                <td>
                  <span className={`badge ${d.attendance >= 91 ? "badge-green" : d.attendance >= 87 ? "badge-yellow" : "badge-red"}`}>{d.attendance}%</span>
                </td>
                <td>{d.passRate}%</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="progress-bar flex-1" style={{ minWidth: 60 }}>
                      <div className="progress-fill" style={{ width: `${d.score}%`, background: "linear-gradient(90deg, #06b6d4, #0ea5e9)" }} />
                    </div>
                    <span className="text-xs text-cyan-400 font-bold w-8">{d.score}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PortalLayout>
  );
}
