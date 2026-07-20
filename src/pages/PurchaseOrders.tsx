import { motion } from "framer-motion"
import { Plus, SlidersHorizontal, Calendar, Printer, MoreHorizontal, Package, FileText, Truck, AlertCircle, Clock, Search } from "lucide-react"
import { FloatingNav } from "@/components/FloatingNav"
import { GlassCard } from "@/components/GlassCard"
import { SubPageNav } from "@/components/SubPageNav"
import { navSections, getSectionChildren } from "@/lib/nav-config"
import { useState } from "react"

const fade = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

const poList = [
  { id: "#PO-2023-089", supplier: "Acme Corp", status: "IN TRANSIT", statusColor: "bg-green-700 text-white", date: "Oct 24", amount: "ETB 45,200.00", icon: Truck, selected: true },
  { id: "#PO-2023-088", supplier: "Globex Inc", status: "DRAFT", statusColor: "bg-zinc-600 text-white", date: "—", amount: "ETB 12,450.00", icon: FileText },
  { id: "#PO-2023-087", supplier: "Stark Ind", status: "RECEIVED", statusColor: "bg-emerald-500 text-white", date: "Oct 12", amount: "ETB 8,900.50", icon: Package },
]

const items = [
  { icon: "⚙️", name: "Industrial Processor X9", sku: "SKU: PR-X9-001", qty: 150, unit: "ETB 250.00", total: "ETB 37,500.00" },
  { icon: "🔌", name: "Heavy Duty Cables (50m)", sku: "SKU: CB-HD-050", qty: 40, unit: "ETB 120.00", total: "ETB 4,800.00" },
  { icon: "❄️", name: "Cooling Units V2", sku: "SKU: CU-V2-002", qty: 10, unit: "ETB 290.00", total: "ETB 2,900.00" },
]

export default function PurchaseOrders() {
  const [activeTab] = useState("In Transit")

  return (
    <div className="min-h-screen page-gradient">
      <FloatingNav brand="HKC Trading ERP" sections={navSections} />

      <motion.div variants={fade} initial="hidden" animate="visible" className="max-w-[98%] mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-black tracking-tight">Purchase Orders</h1>
          <div className="flex items-center gap-3">
            <SubPageNav items={getSectionChildren("/sales")} />
            <button className="flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium hover:bg-white/70">
              <SlidersHorizontal className="size-4" />
              Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#242427] text-white text-sm font-medium hover:bg-[#323236] shadow-lg shadow-black/10">
              <Plus className="size-4" />
              Create PO
            </button>
          </div>
        </div>

        {/* 3 stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Draft POs", value: "12", sub: "Needs review", Icon: Clock, iconBg: "bg-black/5", iconColor: "text-gray-500" },
            { label: "In Transit", value: "8", sub: "Expected this week", Icon: Truck, iconBg: "bg-black/5", iconColor: "text-gray-500" },
            { label: "Delayed", value: "3", sub: "Action required", Icon: AlertCircle, iconBg: "bg-green-100", iconColor: "text-green-700" },
          ].map((s, idx) => {
            const Icon = s.Icon
            return (
              <GlassCard key={s.label} className="flex items-center justify-between" transition={{ delay: 0.05 * idx, duration: 0.4, ease: "easeOut" }}>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{s.label}</p>
                  <p className="text-4xl font-black text-black mt-1 mb-1">{s.value}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <AlertCircle className="size-3" />
                    {s.sub}
                  </div>
                </div>
                <div className={`size-14 rounded-2xl flex items-center justify-center ${s.iconBg}`}>
                  <Icon className={`size-7 ${s.iconColor}`} />
                </div>
              </GlassCard>
            )
          })}
        </div>

        {/* Split panel */}
        <div className="grid grid-cols-[380px_1fr] gap-4">
          {/* Left: PO list (dark glass) */}
          <GlassCard variant="dark" className="p-4" transition={{ delay: 0.16, duration: 0.4, ease: "easeOut" }}>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 mb-3">
              <Search className="size-4 text-zinc-400" />
              <input className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none" placeholder="Search POs..." />
            </div>
            <div className="flex items-center gap-2 mb-3">
              {["All POs", "Draft", "In Transit"].map((tab) => (
                <button
                  key={tab}
                  className={
                    tab === activeTab
                      ? tab === "In Transit"
                        ? "px-3 py-1 rounded-full text-xs font-medium bg-green-700 text-white"
                        : "px-3 py-1 rounded-full text-xs font-medium bg-white text-black"
                      : "px-3 py-1 rounded-full text-xs font-medium text-zinc-400 hover:text-white"
                  }
                >
                  {tab}{tab === "Draft" && <span className="ml-1 opacity-70">12</span>}{tab === "In Transit" && <span className="ml-1 opacity-70">8</span>}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              {poList.map((po) => {
                const Icon = po.icon
                return (
                  <div key={po.id} className={`rounded-2xl p-3 cursor-pointer transition-colors ${po.selected ? "bg-white/15" : "hover:bg-white/5"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center">
                          <Icon className="size-4 text-zinc-300" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">{po.id}</p>
                          <p className="text-zinc-400 text-xs">{po.supplier}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${po.statusColor}`}>{po.status}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-zinc-500 text-xs">
                        <Calendar className="size-3" />{po.date}
                      </div>
                      <p className="text-white text-sm font-semibold">{po.amount}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </GlassCard>

          {/* Right: PO detail */}
          <GlassCard transition={{ delay: 0.22, duration: 0.4, ease: "easeOut" }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">PURCHASE ORDER DETAILS</p>
                <h2 className="text-2xl font-black text-black">#PO-2023-089</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">
                    <span className="size-1.5 bg-green-600 rounded-full" />In Transit
                  </span>
                  <span className="flex items-center gap-1 bg-black/5 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                    <Package className="size-3" />Main Hub (WH-01)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="size-9 rounded-full border border-black/10 flex items-center justify-center hover:bg-black/5">
                  <Printer className="size-4 text-gray-400" />
                </button>
                <button className="size-9 rounded-full border border-black/10 flex items-center justify-center hover:bg-black/5">
                  <MoreHorizontal className="size-4 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 bg-black/[0.03] rounded-2xl p-4 mb-5 border border-black/5">
              <div><p className="text-xs text-gray-400 mb-1">Supplier</p><p className="font-semibold text-sm text-black">Acme Corp</p><p className="text-xs text-gray-400">contact@acme.com</p></div>
              <div><p className="text-xs text-gray-400 mb-1">Order Date</p><p className="font-semibold text-sm text-black">Oct 15, 2023</p></div>
              <div><p className="text-xs text-gray-400 mb-1">Expected Delivery</p><p className="font-semibold text-sm text-black">Oct 24, 2023</p></div>
              <div><p className="text-xs text-gray-400 mb-1">Total Amount</p><p className="font-semibold text-sm text-black">ETB 45,200.00</p></div>
            </div>

            <div className="mb-5">
              <div className="grid grid-cols-[1fr_80px_100px_100px] text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
                <span>ITEM</span><span className="text-right">QTY</span><span className="text-right">UNIT PRICE</span><span className="text-right">TOTAL</span>
              </div>
              <div className="divide-y divide-black/5">
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-[1fr_80px_100px_100px] items-center py-3 px-2">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-black/5 flex items-center justify-center text-base">{item.icon}</div>
                      <div><p className="text-sm font-medium text-black">{item.name}</p><p className="text-xs text-gray-400">{item.sku}</p></div>
                    </div>
                    <p className="text-sm text-black text-right">{item.qty}</p>
                    <p className="text-sm text-black text-right">{item.unit}</p>
                    <p className="text-sm font-semibold text-black text-right">{item.total}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-black/5">
              <p className="text-xs text-gray-400">Last updated: 2 hours ago by System</p>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 rounded-full border border-black/10 text-sm font-medium hover:bg-black/5">Mark Received</button>
                <button className="px-4 py-2 rounded-full bg-green-700 text-white text-sm font-semibold hover:bg-green-800 shadow-lg shadow-green-700/20">Process Payment</button>
              </div>
            </div>
          </GlassCard>
        </div>
      </motion.div>
    </div>
  )
}
