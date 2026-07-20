import { motion } from "framer-motion"
import { Plus, Search, Filter, Calendar, FileText, CheckCircle2, AlertCircle, Clock, Download, Printer, Mail, Trash2 } from "lucide-react"
import { FloatingNav } from "@/components/FloatingNav"
import { GlassCard } from "@/components/GlassCard"
import { SubPageNav } from "@/components/SubPageNav"
import { navSections, getSectionChildren } from "@/lib/nav-config"
import { useState } from "react"

const fade = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

const initialInvoices = [
  {
    id: "#INV-2026-102",
    client: "Stark Medical Supplies",
    email: "billing@starkmed.com",
    issued: "Jul 01, 2026",
    due: "Jul 31, 2026",
    amount: "ETB 32,500.00",
    status: "UNPAID",
    statusBg: "bg-zinc-100 text-zinc-700 border border-zinc-200",
    items: [
      { desc: "Surgical Amoxicillin Supplies (Batch B-99)", qty: 250, price: "ETB 100.00", total: "ETB 25,000.00" },
      { desc: "Reagent Solution Diagnostic Kits", qty: 50, price: "ETB 150.00", total: "ETB 7,500.00" },
    ],
  },
  {
    id: "#INV-2026-101",
    client: "Apex Healthcare Ltd",
    email: "finance@apexhealth.co",
    issued: "Jun 24, 2026",
    due: "Jul 24, 2026",
    amount: "ETB 45,200.00",
    status: "PAID",
    statusBg: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    items: [
      { desc: "Personal Protective Equipment Packs", qty: 1000, price: "ETB 35.00", total: "ETB 35,000.00" },
      { desc: "Sterile Medical Nitrile Gloves (Boxes)", qty: 340, price: "ETB 30.00", total: "ETB 10,200.00" },
    ],
  },
  {
    id: "#INV-2026-100",
    client: "Initech Diagnostics",
    email: "accounts@initechlabs.org",
    issued: "Jun 18, 2026",
    due: "Jun 30, 2026",
    amount: "ETB 28,450.00",
    status: "OVERDUE",
    statusBg: "bg-red-100 text-red-700 border border-red-200",
    items: [
      { desc: "Automated Reagent Fluid Injector V4", qty: 2, price: "ETB 12,000.00", total: "ETB 24,000.00" },
      { desc: "Maintenance Contract & Calibration Session", qty: 1, price: "ETB 4,450.00", total: "ETB 4,450.00" },
    ],
  },
  {
    id: "#INV-2026-099",
    client: "Globex Research Inc",
    email: "payments@globexhq.com",
    issued: "Jun 15, 2026",
    due: "Jul 15, 2026",
    amount: "ETB 12,300.00",
    status: "DRAFT",
    statusBg: "bg-zinc-100 text-zinc-600 border border-zinc-200",
    items: [
      { desc: "General Medical Consumables Trial Run", qty: 1, price: "ETB 12,300.00", total: "ETB 12,300.00" },
    ],
  },
]

export default function Invoices() {
  const [invoices] = useState(initialInvoices)
  const [selectedInvoice, setSelectedInvoice] = useState(initialInvoices[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("ALL")

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "ALL" || inv.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen page-gradient">
      <FloatingNav brand="HKC Trading ERP" sections={navSections} />

      <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-[98%] mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <motion.div variants={fade} className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight">Customer Invoices</h1>
            <p className="text-sm text-gray-400 mt-1">Generate, track, and dispatch professional invoices.</p>
          </div>
          <div className="flex items-center gap-3">
            <SubPageNav items={getSectionChildren("/finance")} />
            <button className="flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium hover:bg-white/70">
              <Filter className="size-4" /> Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-zinc-800 shadow-lg shadow-black/10">
              <Plus className="size-4" /> New Invoice
            </button>
          </div>
        </motion.div>

        {/* Financial KPI stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Outstanding", value: "ETB 60,950.00", sub: "Awaiting client wire", Icon: Clock, bg: "bg-green-100 text-green-700" },
            { label: "Paid Invoices", value: "ETB 145,200.00", sub: "Received this cycle", Icon: CheckCircle2, bg: "bg-emerald-100 text-emerald-600" },
            { label: "Overdue Receivables", value: "ETB 28,450.00", sub: "1 client alerted", Icon: AlertCircle, bg: "bg-red-100 text-red-600" },
            { label: "Total Invoiced", value: "ETB 234,600.00", sub: "Q3 Cumulative", Icon: FileText, bg: "bg-black/5 text-gray-600" },
          ].map((stat, idx) => {
            const Icon = stat.Icon
            return (
              <GlassCard key={stat.label} className="flex items-center justify-between" transition={{ delay: 0.04 * idx, duration: 0.4, ease: "easeOut" }}>
                <div>
                  <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-black text-black mt-1 mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.sub}</p>
                </div>
                <div className={`size-12 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                  <Icon className="size-6" />
                </div>
              </GlassCard>
            )
          })}
        </div>

        {/* Master Detail Grid Layout */}
        <div className="grid grid-cols-[380px_1fr] gap-4">
          {/* Left Master List */}
          <GlassCard transition={{ delay: 0.16, duration: 0.4, ease: "easeOut" }} className="p-4 flex flex-col h-[600px]">
            {/* Search */}
            <div className="flex items-center gap-2 bg-black/[0.04] rounded-2xl px-3 py-2.5 mb-3">
              <Search className="size-4 text-gray-400 shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-black placeholder:text-gray-400 outline-none"
                placeholder="Search invoices..."
              />
            </div>

            {/* Filter Pills */}
            <div className="flex gap-1 mb-4 overflow-x-auto pb-1.5 scrollbar-thin">
              {["ALL", "PAID", "UNPAID", "OVERDUE", "DRAFT"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-all shrink-0 ${
                    filterStatus === status
                      ? "bg-[#242427] text-white"
                      : "bg-black/[0.03] text-gray-400 hover:text-black"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Scrollable list of invoices */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">No invoices found.</div>
              ) : (
                filteredInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                      selectedInvoice.id === inv.id
                        ? "bg-[#242427] text-white border-transparent"
                        : "bg-black/[0.02] hover:bg-black/[0.04] text-black border-black/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-gray-400">{inv.id}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        selectedInvoice.id === inv.id ? "bg-white/10 text-white" : inv.statusBg
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <p className={`text-sm font-bold truncate ${selectedInvoice.id === inv.id ? "text-white" : "text-black"}`}>
                      {inv.client}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                      <span>Due: {inv.due}</span>
                      <span className={`font-extrabold text-sm ${selectedInvoice.id === inv.id ? "text-green-400" : "text-black"}`}>
                        {inv.amount}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          {/* Right Detail Panel */}
          <GlassCard transition={{ delay: 0.22, duration: 0.4, ease: "easeOut" }} className="flex flex-col h-[600px] justify-between p-6">
            <div className="overflow-y-auto pr-1 scrollbar-thin">
              {/* Top Details Header */}
              <div className="flex items-start justify-between border-b border-black/5 pb-5 mb-5">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">INVOICE PREVIEW</span>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-md ${selectedInvoice.statusBg}`}>
                      {selectedInvoice.status}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-black tracking-tight">{selectedInvoice.client}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{selectedInvoice.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-400">INVOICE ID</p>
                  <p className="font-mono text-lg font-black text-black mt-0.5">{selectedInvoice.id}</p>
                </div>
              </div>

              {/* Dates & Net Amount */}
              <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                <div>
                  <p className="text-xs text-gray-400 font-semibold mb-1">DATE OF ISSUE</p>
                  <p className="font-bold text-black flex items-center gap-1.5"><Calendar className="size-4 text-gray-400" /> {selectedInvoice.issued}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold mb-1">PAYMENT DUE DATE</p>
                  <p className="font-bold text-black flex items-center gap-1.5"><Calendar className="size-4 text-gray-400" /> {selectedInvoice.due}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold mb-1">TOTAL RECEIVABLE</p>
                  <p className="text-lg font-extrabold text-black">{selectedInvoice.amount}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <p className="text-xs text-gray-400 font-extrabold uppercase tracking-wider mb-3">Invoice Items & Charges</p>
                <div className="rounded-2xl border border-black/5 overflow-hidden">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-black/[0.02] border-b border-black/5 text-xs text-gray-400 uppercase tracking-widest font-extrabold">
                        <th className="py-2.5 px-4">Item Details</th>
                        <th className="py-2.5 px-2 text-center">Qty</th>
                        <th className="py-2.5 px-2 text-right">Unit Price</th>
                        <th className="py-2.5 px-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {selectedInvoice.items.map((item, i) => (
                        <tr key={i}>
                          <td className="py-3 px-4 font-semibold text-black">{item.desc}</td>
                          <td className="py-3 px-2 text-center font-bold text-gray-500">{item.qty}</td>
                          <td className="py-3 px-2 text-right text-gray-500">{item.price}</td>
                          <td className="py-3 px-4 text-right font-bold text-black">{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="border-t border-black/5 pt-5 mt-4 flex items-center justify-between">
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-black hover:bg-black/5 px-3 py-2 rounded-xl transition-all">
                  <Printer className="size-4" /> Print
                </button>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-black hover:bg-black/5 px-3 py-2 rounded-xl transition-all">
                  <Download className="size-4" /> PDF
                </button>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-black hover:bg-black/5 px-3 py-2 rounded-xl transition-all">
                  <Mail className="size-4" /> Dispatch Email
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button className="size-10 rounded-full border border-red-100 hover:bg-red-50 text-red-500 flex items-center justify-center transition-all">
                  <Trash2 className="size-4" />
                </button>
                <button className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-full shadow-lg shadow-black/10 transition-all">
                  Mark Paid
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      </motion.div>
    </div>
  )
}
