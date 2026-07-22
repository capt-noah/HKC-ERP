import { motion } from "framer-motion"
import { 
  Plus, 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Layers, 
  Activity, 
  ArrowRight
} from "lucide-react"
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts"
import { FloatingNav } from "@/components/FloatingNav"
import { GlassCard } from "@/components/GlassCard"
import { SubPageNav } from "@/components/SubPageNav"
import { navSections, getSectionChildren } from "@/lib/nav-config"
import { useFeedback } from "@/context/FeedbackContext"
import { useErpStore } from "@/lib/erpStore"

const fade = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }
const stagger = { visible: { transition: { staggerChildren: 0.05 } } }

const SALES_REVENUE_DATA = [
  { name: "Jan", "Sales Revenue": 1450000, "Purchase Capital": 820000 },
  { name: "Feb", "Sales Revenue": 1610000, "Purchase Capital": 950000 },
  { name: "Mar", "Sales Revenue": 1890000, "Purchase Capital": 1080000 },
  { name: "Apr", "Sales Revenue": 2120000, "Purchase Capital": 1210000 },
  { name: "May", "Sales Revenue": 2410000, "Purchase Capital": 1330000 },
  { name: "Jun", "Sales Revenue": 2850000, "Purchase Capital": 1540000 },
]

export default function SalesDashboard() {
  const { showToast } = useFeedback()
  const erp = useErpStore()
  const salesOrders = erp.getSalesOrders()
  const purchaseOrders = erp.getPurchaseOrders()

  const totalRevenue = salesOrders.reduce((sum, so) => sum + so.amount, 0)

  const handleAction = (title: string) => {
    showToast(
      "HKC Trading Sales Action",
      "success",
      `Launched contract pipeline for: ${title}`
    )
  }

  return (
    <div className="min-h-screen page-gradient">
      <FloatingNav brand="HKC Trading ERP" sections={navSections} />

      <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-[98%] mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-12">
        {/* Header Block */}
        <motion.div variants={fade} className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight mt-1">Sales & Trade Dashboard</h1>
            <p className="text-xs font-semibold text-zinc-500 max-w-xl leading-relaxed mt-1">
              Oversee export contracts from WH1 (Coffee, Sesame, Teff) and domestic veterinary distribution from WH2 & WH3.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-end md:self-start">
            <SubPageNav items={getSectionChildren("/sales")} />

            <button 
              onClick={() => handleAction("Sales Order")}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
            >
              <Plus className="size-4" /> New Sales Contract
            </button>
          </div>
        </motion.div>

        {/* 4 KPIs Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "PIPELINE REVENUE", value: `ETB ${totalRevenue.toLocaleString()}`, Icon: DollarSign, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", note: "WH1 Export + WH2/WH3 Local" },
            { label: "EXPORT GROWTH (H1)", value: "+42.8%", Icon: TrendingUp, iconBg: "bg-green-100", iconColor: "text-green-700", note: "EU, Asia & USA Markets" },
            { label: "OPEN SALES ORDERS", value: `${salesOrders.length} orders`, Icon: ShoppingBag, iconBg: "bg-black/5", iconColor: "text-zinc-600", note: "Active dispatch contracts" },
            { label: "ACTIVE PURCHASE POs", value: `${purchaseOrders.length} POs`, Icon: Layers, iconBg: "bg-black/5", iconColor: "text-zinc-600", note: "Sourcing & Import POs" },
          ].map((kpi, idx) => {
            const Icon = kpi.Icon
            return (
              <GlassCard key={kpi.label} transition={{ delay: 0.05 * idx, duration: 0.4 }}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`size-9 rounded-xl flex items-center justify-center ${kpi.iconBg}`}>
                    <Icon className={`size-4.5 ${kpi.iconColor}`} />
                  </div>
                  <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">{kpi.label}</span>
                </div>
                <p className="text-2xl font-black text-zinc-950 tracking-tight leading-none mb-1.5">{kpi.value}</p>
                <div className="pt-2 border-t border-zinc-100 mt-2.5">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase font-mono">{kpi.note}</span>
                </div>
              </GlassCard>
            )
          })}
        </div>

        {/* Sales Main Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Revenue Chart */}
          <GlassCard className="lg:col-span-8 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5 border-b border-zinc-100 pb-3">
                <div>
                  <h3 className="text-xs font-black text-zinc-900 uppercase tracking-tight">Revenue Stream & Procurement Capital</h3>
                  <p className="text-[11px] font-semibold text-zinc-400">Monthly progression comparing incoming client revenue vs supplier spend</p>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[9px] font-black uppercase tracking-wider text-zinc-400 bg-zinc-100/50 px-2.5 py-1 rounded-full">
                  <Activity className="size-3 text-emerald-500 animate-pulse" /> Live feeds
                </div>
              </div>

              {/* Area Chart */}
              <div className="h-64 mt-4 text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={SALES_REVENUE_DATA} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSalesRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#18181b" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPurchCap" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#15803d" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#15803d" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                    <XAxis dataKey="name" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `ETB ${v/1000}k`} />
                    <Tooltip formatter={(value) => [`ETB ${(value as number).toLocaleString()}`, ""]} labelStyle={{ fontWeight: "bold" }} />
                    <Area type="monotone" dataKey="Sales Revenue" stroke="#18181b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSalesRev)" />
                    <Area type="monotone" dataKey="Purchase Capital" stroke="#15803d" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPurchCap)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t border-zinc-100 pt-3.5 mt-4 text-[10px] text-zinc-500 font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="inline-block size-1.5 rounded-full bg-zinc-950" />
                <span>Sales Revenue (ETB)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block size-1.5 rounded-full bg-green-700" />
                <span>Procurement Capital (ETB)</span>
              </div>
            </div>
          </GlassCard>

          {/* Right Panel: Recent Sales pipeline states */}
          <GlassCard className="lg:col-span-4 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-zinc-100 pb-3">
                <div>
                  <h3 className="text-xs font-black text-zinc-900 uppercase tracking-tight">Active Funnel Queue</h3>
                  <p className="text-[11px] font-semibold text-zinc-400">Track high-value active agreements</p>
                </div>
              </div>

              <div className="space-y-3.5">
                {salesOrders.slice(0, 4).map((order) => (
                  <div key={order.id} className="p-3.5 bg-zinc-50/50 border border-zinc-150/40 rounded-2xl">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-black font-mono text-zinc-400 uppercase">{order.id} ({order.warehouse})</span>
                      <span className="text-[9px] font-black uppercase text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                        {order.stage}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-zinc-900 leading-tight mb-1">{order.customer}</h4>
                    <span className="font-mono text-xs font-black text-zinc-800 block mt-1.5">ETB {order.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => showToast("Navigation Shortcut", "info", "Navigating to Sales Orders ledger.")}
              className="mt-6 flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-wider text-zinc-500 hover:text-zinc-900 py-2 border border-dashed border-zinc-200/80 rounded-xl hover:border-zinc-300 transition-colors"
            >
              See Sales Ledger <ArrowRight className="size-3.5 ml-0.5" />
            </button>
          </GlassCard>
        </div>
      </motion.div>
    </div>
  )
}
