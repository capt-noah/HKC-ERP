import { motion } from "framer-motion"
import { Wallet, Receipt, CreditCard, Landmark, Download } from "lucide-react"
import { FloatingNav } from "@/components/FloatingNav"
import { GlassCard } from "@/components/GlassCard"
import { SubPageNav } from "@/components/SubPageNav"
import { navSections, getSectionChildren } from "@/lib/nav-config"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

const fade = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

const cashFlowData = [
  { name: "Jan", Revenue: 180000, Expenses: 95000 },
  { name: "Feb", Revenue: 220000, Expenses: 110000 },
  { name: "Mar", Revenue: 250000, Expenses: 105000 },
  { name: "Apr", Revenue: 210000, Expenses: 125000 },
  { name: "May", Revenue: 310000, Expenses: 130000 },
  { name: "Jun", Revenue: 342000, Expenses: 142000 },
]

const recentTransactions = [
  { id: "TXN-9022", date: "Jul 06, 2026", vendor: "Google Cloud Platform", category: "Infrastructure", amount: "-ETB 14,250.00", status: "Completed", type: "expense" },
  { id: "TXN-9021", date: "Jul 05, 2026", vendor: "Apex Healthcare Ltd", category: "Invoicing", amount: "+ETB 45,200.00", status: "Completed", type: "income" },
  { id: "TXN-9020", date: "Jul 04, 2026", vendor: "WeWork Labs Office", category: "Rent & Space", amount: "-ETB 6,800.00", status: "Completed", type: "expense" },
  { id: "TXN-9019", date: "Jul 03, 2026", vendor: "Initech Diagnostics", category: "Invoicing", amount: "+ETB 28,450.00", status: "Completed", type: "income" },
  { id: "TXN-9018", date: "Jul 02, 2026", vendor: "Figma Design Inc", category: "Software & SaaS", amount: "-ETB 1,240.00", status: "Completed", type: "expense" },
]

export default function FinanceOverview() {
  return (
    <div className="min-h-screen page-gradient">
      <FloatingNav brand="HKC Trading ERP" sections={navSections} />

      <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-[98%] mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <motion.div variants={fade} className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight">Finance Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">Real-time treasury status and cash flow insights.</p>
          </div>
          <div className="flex items-center gap-3">
            <SubPageNav items={getSectionChildren("/finance")} />
            <button className="flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium hover:bg-white/70">
              <Download className="size-4" /> Export Report
            </button>
          </div>
        </motion.div>

        {/* 4 Financial KPI cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "TOTAL REVENUE", value: "ETB 1,429,580", change: "+14.2%", up: true, icon: Wallet, bg: "bg-black/5" },
            { label: "TOTAL EXPENSES", value: "ETB 512,420", change: "-3.8%", up: false, icon: CreditCard, bg: "bg-black/5" },
            { label: "NET PROFIT", value: "ETB 917,160", change: "+24.5%", up: true, icon: Landmark, bg: "bg-green-100/70" },
            { label: "UNPAID INVOICES", value: "ETB 64,300", change: "5 Overdue", up: null, icon: Receipt, bg: "bg-red-50" },
          ].map((kpi, idx) => {
            const Icon = kpi.icon
            return (
              <GlassCard key={kpi.label} transition={{ delay: 0.05 * idx, duration: 0.4, ease: "easeOut" }}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`size-10 rounded-xl flex items-center justify-center ${kpi.bg}`}>
                    <Icon className="size-5 text-gray-700" />
                  </div>
                  {kpi.change !== null && (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      kpi.up === null
                        ? "bg-red-100 text-red-600"
                        : kpi.up
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-zinc-100 text-zinc-600"
                    }`}>
                      {kpi.change}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">{kpi.label}</p>
                <p className="text-3xl font-black text-black mt-1">{kpi.value}</p>
              </GlassCard>
            )
          })}
        </div>

        {/* Mid grid */}
        <div className="grid grid-cols-[1fr_380px] gap-4 mb-6">
          {/* Revenue vs Expenses Chart */}
          <GlassCard transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-base text-black">Cash Flow Trends</h3>
                <p className="text-xs text-gray-400">Comparison of incoming revenue against outgoing costs</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-[#242427]" /> Revenue</div>
                <div className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-green-700" /> Expenses</div>
              </div>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#242427" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#242427" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#15803d" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#15803d" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                  <XAxis dataKey="name" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `ETB ${val/1000}k`} />
                  <Tooltip formatter={(value) => [`ETB ${(value as number).toLocaleString()}`, ""]} labelStyle={{ fontWeight: "bold" }} />
                  <Area type="monotone" dataKey="Revenue" stroke="#242427" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="Expenses" stroke="#15803d" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Expense Breakdown */}
          <GlassCard transition={{ delay: 0.22, duration: 0.4, ease: "easeOut" }} className="flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-base text-black mb-1">Expense Allocation</h3>
              <p className="text-xs text-gray-400 mb-6">Distribution by cost centers this month</p>
              <div className="space-y-4">
                {[
                  { label: "Payroll & Compensation", pct: 45, val: "ETB 230,580", color: "bg-[#242427]" },
                  { label: "Infrastructure & Servers", pct: 22, val: "ETB 112,720", color: "bg-green-700" },
                  { label: "Rent & Real Estate", pct: 15, val: "ETB 76,860", color: "bg-gray-400" },
                  { label: "SaaS Tools & software", pct: 18, val: "ETB 92,260", color: "bg-zinc-300" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-semibold text-black mb-1.5">
                      <span>{item.label}</span>
                      <span>{item.val} ({item.pct}%)</span>
                    </div>
                    <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Estimated Budget Remaining</p>
                <p className="text-lg font-black text-black mt-0.5">ETB 187,580</p>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-full">
                On Target
              </span>
            </div>
          </GlassCard>
        </div>

        {/* Recent Transactions list */}
        <GlassCard transition={{ delay: 0.28, duration: 0.4, ease: "easeOut" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-base text-black">Recent Corporate Transactions</h3>
              <p className="text-xs text-gray-400">A unified log of company disbursements and client receipts.</p>
            </div>
            <button className="text-xs text-green-700 font-bold hover:underline">View Ledger Ledger &rarr;</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">TXN ID</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Description/Recipient</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {recentTransactions.map((txn) => (
                  <tr key={txn.id} className="text-sm hover:bg-black/[0.01]">
                    <td className="py-3.5 pl-2 font-mono text-xs font-bold text-gray-500">{txn.id}</td>
                    <td className="py-3.5 text-gray-500 text-xs">{txn.date}</td>
                    <td className="py-3.5 font-semibold text-black">{txn.vendor}</td>
                    <td className="py-3.5 text-xs">
                      <span className="bg-black/5 text-gray-700 px-2.5 py-1 rounded-lg font-medium">{txn.category}</span>
                    </td>
                    <td className={`py-3.5 text-right font-bold ${txn.type === "income" ? "text-emerald-600" : "text-black"}`}>
                      {txn.amount}
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
