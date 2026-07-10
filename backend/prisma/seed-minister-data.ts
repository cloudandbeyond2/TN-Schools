/**
 * seed-minister-data.ts
 * Seeds dynamic tables for Minister KPIs, predictions, policy briefs, and budgets.
 *
 * Run: npx ts-node -P prisma/tsconfig.json prisma/seed-minister-data.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("\n🌱 Seeding Minister Portal data...\n");

  // 1. Clear existing records
  await prisma.ministerKPI.deleteMany({});
  await prisma.ministerPrediction.deleteMany({});
  await prisma.ministerPolicyBrief.deleteMany({});
  await prisma.ministerBudget.deleteMany({});

  // 2. Seed Minister KPIs
  const kpis = [
    { id: "kpi-1", label: "10th Pass %", value: 87.4, target: 90.0, unit: "%", icon: "📘", trend: "+2.1%", color: "text-green-600", bg: "bg-green-50/50", lowerBetter: false },
    { id: "kpi-2", label: "12th Pass %", value: 81.2, target: 85.0, unit: "%", icon: "📗", trend: "+1.8%", color: "text-green-600", bg: "bg-green-50/50", lowerBetter: false },
    { id: "kpi-3", label: "Teacher Efficiency", value: 82.0, target: 88.0, unit: "%", icon: "👩‍🏫", trend: "+0.5%", color: "text-orange-600", bg: "bg-orange-50/50", lowerBetter: false },
    { id: "kpi-4", label: "Scholarship Delivery", value: 94.2, target: 98.0, unit: "%", icon: "🎓", trend: "+3.2%", color: "text-green-600", bg: "bg-green-50/50", lowerBetter: false },
    { id: "kpi-5", label: "Dropout Rate", value: 1.8, target: 1.5, unit: "%", icon: "⚠️", trend: "-0.2%", color: "text-orange-600", bg: "bg-orange-50/50", lowerBetter: true },
    { id: "kpi-6", label: "Infrastructure Score", value: 78.0, target: 85.0, unit: "/100", icon: "🏗️", trend: "+3pts", color: "text-green-600", bg: "bg-green-50/50", lowerBetter: false },
    { id: "kpi-7", label: "National Sports Ranks", value: 5.0, target: 3.0, unit: "Rank", icon: "🏆", trend: "+2", color: "text-green-600", bg: "bg-green-50/50", lowerBetter: true }
  ];
  for (const kpi of kpis) {
    await prisma.ministerKPI.create({ data: kpi });
  }
  console.log(`  ✅ Seeded ${kpis.length} Minister KPIs`);

  // 3. Seed Minister Predictions
  const predictions = [
    {
      id: "pred-1",
      category: "Dropout",
      title: "Dropout Prediction (Next Year)",
      prediction: "~14,200 students",
      confidence: 88,
      trend: "Increasing",
      detail: "AI models suggest high risk of dropouts in Krishnagiri & Tirunelveli blocks due to agrarian shifts.",
      recommendations: ["Targeted scholarship drives", "Block-level counseling camps"],
      color: "red",
      updatedAt: new Date()
    },
    {
      id: "pred-2",
      category: "Academics",
      title: "10th Board Pass % Prediction",
      prediction: "88.9%",
      confidence: 94,
      trend: "Improving",
      detail: "Based on mid-term model exams, class performance is expected to exceed last year's rate.",
      recommendations: ["Special tutoring for at-risk students", "Mock exam question banks distribution"],
      color: "green",
      updatedAt: new Date()
    },
    {
      id: "pred-3",
      category: "Academics",
      title: "12th Board Pass % Prediction",
      prediction: "83.1%",
      confidence: 91,
      trend: "Improving",
      detail: "Steady growth across Government Higher Secondary Schools in Science stream.",
      recommendations: ["Extend lab hours in rural centers"],
      color: "green",
      updatedAt: new Date()
    },
    {
      id: "pred-4",
      category: "Staffing",
      title: "Teacher Shortage by 2026",
      prediction: "4,200 positions",
      confidence: 85,
      trend: "Increasing",
      detail: "Retirement and new school upgradations will create vacancies primarily in Mathematics & Science subjects.",
      recommendations: ["Accelerate TET recruitment drives", "Consolidate blocks with low enrollment"],
      color: "orange",
      updatedAt: new Date()
    },
    {
      id: "pred-5",
      category: "Infrastructure",
      title: "Infrastructure Investment Needed",
      prediction: "₹820 Crore",
      confidence: 89,
      trend: "Stable",
      detail: "Required budget for digital lab rollouts and restroom renovation across 1,200 rural schools.",
      recommendations: ["Leverage CSR funds", "Utilize Samagra Shiksha grants"],
      color: "orange",
      updatedAt: new Date()
    }
  ];
  for (const pred of predictions) {
    await prisma.ministerPrediction.create({ data: pred });
  }
  console.log(`  ✅ Seeded ${predictions.length} Minister Predictions`);

  // 4. Seed Minister Policy Briefs
  const policyBriefs = [
    {
      id: "policy-1",
      title: "Dropout Hotspots",
      status: "Active Alert",
      priority: "HIGH",
      impact: "5 blocks in Tirunelveli & Krishnagiri districts show dropout risk >3%. Recommend targeted scholarship drives.",
      districts: 2,
      since: "3 months",
      aiScore: 92,
      updatedAt: new Date()
    },
    {
      id: "policy-2",
      title: "Teacher Deployment Gap",
      status: "Active Alert",
      priority: "HIGH",
      impact: "Mathematics and Science teacher shortage is critical in 12 districts. Consider redeployment plan.",
      districts: 12,
      since: "1 month",
      aiScore: 88,
      updatedAt: new Date()
    },
    {
      id: "policy-3",
      title: "Digital Lab Expansion",
      status: "Needs Action",
      priority: "MEDIUM",
      impact: "38% of rural schools lack high-speed internet access. PM-SHRI and EMIS integration recommended.",
      districts: 38,
      since: "6 months",
      aiScore: 74,
      updatedAt: new Date()
    }
  ];
  for (const pb of policyBriefs) {
    await prisma.ministerPolicyBrief.create({ data: pb });
  }
  console.log(`  ✅ Seeded ${policyBriefs.length} Minister Policy Briefs`);

  // 5. Seed Minister Budget items
  const budgets = [
    { id: "bud-1", head: "Samagra Shiksha", category: "Centrally Sponsored Scheme", approved: 2400.0, released: 2100.0, utilized: 1820.0, fy: "2024-25", updatedAt: new Date() },
    { id: "bud-2", head: "Infrastructure Dev.", category: "State Scheme", approved: 1200.0, released: 1050.0, utilized: 980.0, fy: "2024-25", updatedAt: new Date() },
    { id: "bud-3", head: "Mid-Day Meal", category: "Welfare Scheme", approved: 900.0, released: 890.0, utilized: 876.0, fy: "2024-25", updatedAt: new Date() },
    { id: "bud-4", head: "Scholarship Disbursal", category: "Welfare Scheme", approved: 650.0, released: 580.0, utilized: 520.0, fy: "2024-25", updatedAt: new Date() }
  ];
  for (const bud of budgets) {
    await prisma.ministerBudget.create({ data: bud });
  }
  console.log(`  ✅ Seeded ${budgets.length} Minister Budget items`);

  console.log("\n✨ Minister Portal seeding complete!\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
