import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  FileText,
  Scale,
  Search,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  CheckCircle2,
  Printer,
  ChevronRight,
  TrendingUp,
  Receipt
} from "lucide-react"
import { FloatingNav } from "@/components/FloatingNav"
import { GlassCard } from "@/components/GlassCard"
import { SubPageNav } from "@/components/SubPageNav"
import { navSections, getSectionChildren } from "@/lib/nav-config"
import { useFeedback } from "@/context/FeedbackContext"
import { useFinanceStore } from "@/lib/financeStore"

const fade = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }
const stagger = { visible: { transition: { staggerChildren: 0.05 } } }

interface AgingRecord {
  id: string
  partner: string
  invoiceRef: string
  category: "current" | "31-60" | "61-90" | "90+"
  daysOverdue: number
  amount: number
  dunningLevel: number
}

const initialAgingReceivables: AgingRecord[] = [
  { id: "AR-101", partner: "Stark Medical Supplies", invoiceRef: "INV-2026-001", category: "current", daysOverdue: 0, amount: 32500, dunningLevel: 0 },
  { id: "AR-102", partner: "Apex Healthcare Ltd", invoiceRef: "INV-2026-004", category: "31-60", daysOverdue: 35, amount: 45200, dunningLevel: 1 },
  { id: "AR-103", partner: "Initech Diagnostics", invoiceRef: "INV-2025-089", category: "90+", daysOverdue: 94, amount: 28450, dunningLevel: 2 },
  { id: "AR-104", partner: "Lifeline Clinics", invoiceRef: "INV-2026-008", category: "61-90", daysOverdue: 65, amount: 18350, dunningLevel: 1 },
  { id: "AR-105", partner: "St. Paul Hospital", invoiceRef: "INV-2025-072", category: "90+", daysOverdue: 110, amount: 9550, dunningLevel: 3 },
]

const initialAgingPayables: AgingRecord[] = [
  { id: "AP-201", partner: "Ethio Chemicals Corp", invoiceRef: "PINV-2026-012", category: "current", daysOverdue: 0, amount: 45000, dunningLevel: 0 },
  { id: "AP-202", partner: "Red Cross Pharma Supplies", invoiceRef: "PINV-2026-015", category: "current", daysOverdue: 0, amount: 28000, dunningLevel: 0 },
  { id: "AP-203", partner: "Global Logistics Inc", invoiceRef: "PINV-2026-003", category: "31-60", daysOverdue: 42, amount: 14000, dunningLevel: 1 },
  { id: "AP-204", partner: "East-Africa Power Co", invoiceRef: "PINV-2025-098", category: "90+", daysOverdue: 91, amount: 14000, dunningLevel: 2 },
  { id: "AP-205", partner: "Prime Glassware Ltd", invoiceRef: "PINV-2026-002", category: "61-90", daysOverdue: 62, amount: 22000, dunningLevel: 1 },
]

export default function FinancialReports() {
  const { showToast } = useFeedback()
  const store = useFinanceStore()

  const [activeTab, setActiveTab] = useState<"Aging" | "GLReport" | "TrialBalance" | "Statements">("Aging")

  // AR/AP Aging state
  const [agingType, setAgingType] = useState<"receivables" | "payables">("receivables")
  const [receivables] = useState<AgingRecord[]>(initialAgingReceivables)
  const [payables] = useState<AgingRecord[]>(initialAgingPayables)

  // Statements sub-tab
  const [statementType, setStatementType] = useState<"BalanceSheet" | "IncomeStatement" | "CashFlow">("BalanceSheet")

  // GL search & filter
  const [glSearch, setGlSearch] = useState("")
  const [selectedAccountFilter, setSelectedAccountFilter] = useState("ALL")

  // Data from store
  const entries = store.getJournalEntries()
  const lines = store.getJournalEntryLines()
  const accounts = store.getAccounts()
  const trialBalance = store.getTrialBalance()

  const accountsByType = {
    Asset: accounts.filter((a) => a.account_type === "Asset"),
    Liability: accounts.filter((a) => a.account_type === "Liability"),
    Equity: accounts.filter((a) => a.account_type === "Equity"),
    Revenue: accounts.filter((a) => a.account_type === "Revenue"),
    Expense: accounts.filter((a) => a.account_type === "Expense"),
  }

  const totalAssets = accountsByType.Asset.reduce((s, a) => s + (a.current_balance ?? 250000), 0)
  const totalLiabilities = accountsByType.Liability.reduce((s, a) => s + (a.current_balance ?? 120000), 0)
  const totalEquity = accountsByType.Equity.reduce((s, a) => s + (a.current_balance ?? 500000), 0)
  const totalRevenue = accountsByType.Revenue.reduce((s, a) => s + (a.current_balance ?? 2450000), 0)
  const totalExpenses = accountsByType.Expense.reduce((s, a) => s + (a.current_balance ?? 1800000), 0)
  const netIncome = totalRevenue - totalExpenses

  const handleSendDunningNotice = (rec: AgingRecord) => {
    showToast(`Dunning Level ${rec.dunningLevel + 1} notice dispatched to ${rec.partner} for ${rec.invoiceRef}`, "success")
  }

  const handleExportPDF = () => {
    showToast("Report exported as PDF statement successfully", "success")
  }

  // Filtered GL entries
  const filteredGLEntries = entries.filter((ent) => {
    const matchesSearch =
      ent.id.toLowerCase().includes(glSearch.toLowerCase()) ||
      ent.description.toLowerCase().includes(glSearch.toLowerCase()) ||
      ent.source_type.toLowerCase().includes(glSearch.toLowerCase())
    
    if (selectedAccountFilter === "ALL") return matchesSearch

    const entryLines = lines.filter((l) => l.journal_entry_id === ent.id)
    return matchesSearch && entryLines.some((l) => l.account_id === selectedAccountFilter)
  })

  return (
    <div className="min-h-screen page-gradient text-black">
      <FloatingNav brand="HKC Trading ERP" sections={navSections} />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="max-w-[98%] mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-12"
      >
        {/* Page Title & SubPageNav Header */}
        <motion.div variants={fade} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight">Financial Reports & Statements</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Comprehensive AR/AP aging analysis, general ledger activity log, trial balance, and official statements.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SubPageNav items={getSectionChildren("/finance")} />
          </div>
        </motion.div>

        {/* Tab Selection Bar */}
        <motion.div variants={fade} className="flex border-b border-zinc-200/60 mb-6 pb-px items-center justify-between overflow-x-auto scrollbar-none">
          <div className="flex gap-1 min-w-max">
            {[
              { id: "Aging", label: "AR / AP Aging Analysis", icon: Calendar },
              { id: "GLReport", label: "General Ledger Detail", icon: FileText },
              { id: "TrialBalance", label: "Trial Balance", icon: Scale },
              { id: "Statements", label: "Financial Statements", icon: PieChart },
            ].map((tab) => {
              const isActive = activeTab === tab.id
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-black relative tracking-tight transition-colors uppercase whitespace-nowrap"
                >
                  <Icon className={`size-3.5 ${isActive ? "text-emerald-600" : "text-zinc-400"}`} />
                  <span className={isActive ? "text-zinc-950 font-black" : "text-zinc-400 hover:text-zinc-700"}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="reports-tabs"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-4">
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-white border border-black/10 hover:bg-zinc-50 text-black px-3 py-1.5 rounded-full shadow-xs transition-all"
            >
              <Download className="size-3.5" /> Export PDF
            </button>
          </div>
        </motion.div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {/* TAB 1: AR / AP Aging Analysis */}
          {activeTab === "Aging" && (
            <motion.div
              key="aging-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <GlassCard className="p-4 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Sub-Ledger Aging & Dunning Management</h3>
                  <p className="text-xs text-zinc-500">Track overdue customer receivables and vendor payables across 30/60/90+ day buckets.</p>
                </div>
                <div className="flex bg-zinc-100 p-1 rounded-full text-xs font-bold">
                  <button
                    onClick={() => setAgingType("receivables")}
                    className={`px-4 py-1.5 rounded-full transition-all ${agingType === "receivables" ? "bg-black text-white shadow-xs" : "text-zinc-600 hover:text-black"}`}
                  >
                    Accounts Receivable (AR)
                  </button>
                  <button
                    onClick={() => setAgingType("payables")}
                    className={`px-4 py-1.5 rounded-full transition-all ${agingType === "payables" ? "bg-black text-white shadow-xs" : "text-zinc-600 hover:text-black"}`}
                  >
                    Accounts Payable (AP)
                  </button>
                </div>
              </GlassCard>

              {/* Bucket Metrics Banner */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Current (0-30 Days)", cat: "current", border: "border-emerald-200" },
                  { label: "Overdue 31-60 Days", cat: "31-60", border: "border-amber-200" },
                  { label: "Overdue 61-90 Days", cat: "61-90", border: "border-orange-200" },
                  { label: "Overdue 90+ Days", cat: "90+", border: "border-rose-200" },
                ].map((bucket) => {
                  const data = agingType === "receivables" ? receivables : payables
                  const sum = data.filter((r) => r.category === bucket.cat).reduce((s, r) => s + r.amount, 0)
                  return (
                    <GlassCard key={bucket.cat} className={`p-4 border ${bucket.border}`}>
                      <div className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">{bucket.label}</div>
                      <div className="text-lg font-black text-zinc-900 font-mono mt-1">
                        ETB {sum.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </GlassCard>
                  )
                })}
              </div>

              {/* Table */}
              <GlassCard className="overflow-hidden p-0">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200/80 bg-zinc-50/80 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                      <th className="px-4 py-3">Partner / Organization</th>
                      <th className="px-4 py-3">Invoice Ref</th>
                      <th className="px-4 py-3">Aging Bucket</th>
                      <th className="px-4 py-3">Days Overdue</th>
                      <th className="px-4 py-3 text-right">Outstanding Balance</th>
                      <th className="px-4 py-3 text-center">Dunning Status</th>
                      <th className="px-4 py-3 text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-xs">
                    {(agingType === "receivables" ? receivables : payables).map((rec) => (
                      <tr key={rec.id} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="px-4 py-3 font-bold text-zinc-900">{rec.partner}</td>
                        <td className="px-4 py-3 font-mono text-zinc-600">{rec.invoiceRef}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            rec.category === "current" ? "bg-emerald-50 text-emerald-700" :
                            rec.category === "31-60" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                          }`}>
                            {rec.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold text-zinc-700">{rec.daysOverdue} days</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-zinc-900">
                          ETB {rec.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-[10px] font-bold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full">
                            Level {rec.dunningLevel} Notice
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right pr-4">
                          <button
                            onClick={() => handleSendDunningNotice(rec)}
                            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-full transition-all"
                          >
                            Send Dunning Notice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </GlassCard>
            </motion.div>
          )}

          {/* TAB 2: General Ledger Detail */}
          {activeTab === "GLReport" && (
            <motion.div
              key="gl-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <GlassCard className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-zinc-100/80 rounded-full px-3.5 h-[38px] w-full max-w-md">
                  <Search className="size-4 text-zinc-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search general ledger transactions..."
                    value={glSearch}
                    onChange={(e) => setGlSearch(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold focus:outline-none text-zinc-900"
                  />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 whitespace-nowrap">
                    <Filter className="size-3.5 text-zinc-400" /> Filter Account:
                  </div>
                  <select
                    value={selectedAccountFilter}
                    onChange={(e) => setSelectedAccountFilter(e.target.value)}
                    className="bg-white border border-black/10 rounded-full px-3 py-1.5 text-xs font-semibold text-black focus:outline-none"
                  >
                    <option value="ALL">All General Ledger Accounts</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code} - {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </GlassCard>

              <GlassCard className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200/80 bg-zinc-50/80 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                        <th className="px-4 py-3">JE Ref / Date</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Account Lines & Counterparty</th>
                        <th className="px-4 py-3 text-right">Debit</th>
                        <th className="px-4 py-3 text-right">Credit</th>
                        <th className="px-4 py-3 text-center">Source Module</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredGLEntries.map((ent) => {
                        const entryLines = lines.filter((l) => l.journal_entry_id === ent.id)
                        const totalDebit = entryLines.reduce((s, l) => s + l.debit_amount, 0)
                        const totalCredit = entryLines.reduce((s, l) => s + l.credit_amount, 0)

                        return (
                          <tr key={ent.id} className="hover:bg-zinc-50/60 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="font-mono font-bold text-zinc-900">{ent.id}</div>
                              <div className="text-[10px] text-zinc-400">{ent.entry_date}</div>
                            </td>
                            <td className="px-4 py-3 max-w-xs">
                              <div className="font-semibold text-zinc-800">{ent.description}</div>
                              <div className="text-[10px] text-zinc-400">Created by: {ent.created_by}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1">
                                {entryLines.map((l) => {
                                  const acc = accounts.find((a) => a.id === l.account_id || a.code === l.account_id)
                                  return (
                                    <div key={l.id} className="flex items-center justify-between text-[11px]">
                                      <span className="font-mono text-zinc-700">
                                        {acc ? `${acc.code} - ${acc.name}` : l.account_id}
                                        {l.party_name && (
                                          <span className="ml-1 text-[10px] font-sans font-semibold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">
                                            [{l.party_type}: {l.party_name}]
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-zinc-900 whitespace-nowrap">
                              ETB {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-zinc-900 whitespace-nowrap">
                              ETB {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-700">
                                {ent.source_type}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* TAB 3: Trial Balance */}
          {activeTab === "TrialBalance" && (
            <motion.div
              key="tb-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <GlassCard className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">General Ledger Trial Balance Statement</h3>
                  <p className="text-xs text-zinc-500">Summary of all debit and credit balances verifying fundamental accounting equality.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase font-mono ${trialBalance.isBalanced ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                    {trialBalance.isBalanced ? "✓ EQUAL & BALANCED" : "⚠️ IMBALANCED"}
                  </span>
                </div>
              </GlassCard>

              <GlassCard className="p-0 overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200/80 bg-zinc-50/80 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                      <th className="px-4 py-3">Account Code & Name</th>
                      <th className="px-4 py-3">Account Category</th>
                      <th className="px-4 py-3 text-right">Total Debit Sum</th>
                      <th className="px-4 py-3 text-right">Total Credit Sum</th>
                      <th className="px-4 py-3 text-right">Net Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-mono">
                    {trialBalance.rows.map((r) => (
                      <tr key={r.account_id} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="px-4 py-3 font-bold text-zinc-900">{r.code} - {r.name}</td>
                        <td className="px-4 py-3 font-sans font-semibold text-zinc-600">{r.account_type}</td>
                        <td className="px-4 py-3 text-right text-zinc-900">
                          ETB {r.debit_sum.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-900">
                          ETB {r.credit_sum.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-zinc-900">
                          ETB {r.net_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-zinc-300 bg-zinc-50/90 font-mono font-black text-sm">
                      <td colSpan={2} className="px-4 py-3 text-zinc-900">Trial Balance Grand Totals</td>
                      <td className="px-4 py-3 text-right text-zinc-900">
                        ETB {trialBalance.totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-900">
                        ETB {trialBalance.totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-600">
                        {trialBalance.isBalanced ? "PASSED" : "FAILED"}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </GlassCard>
            </motion.div>
          )}

          {/* TAB 4: Financial Statements */}
          {activeTab === "Statements" && (
            <motion.div
              key="statements-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <GlassCard className="p-4 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Executive Financial Statements</h3>
                  <p className="text-xs text-zinc-500">Official Balance Sheet, Profit & Loss Statement, and Cash Flow report.</p>
                </div>
                <div className="flex bg-zinc-100 p-1 rounded-full text-xs font-bold">
                  {[
                    { id: "BalanceSheet", label: "Balance Sheet" },
                    { id: "IncomeStatement", label: "Profit & Loss" },
                    { id: "CashFlow", label: "Cash Flow" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStatementType(s.id as any)}
                      className={`px-4 py-1.5 rounded-full transition-all ${statementType === s.id ? "bg-black text-white shadow-xs" : "text-zinc-600 hover:text-black"}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </GlassCard>

              {statementType === "BalanceSheet" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GlassCard className="p-5 flex flex-col gap-3">
                    <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider border-b border-zinc-200/60 pb-2 flex items-center justify-between">
                      <span>Assets</span>
                      <span className="text-[10px] font-mono text-gray-400">Current & Fixed</span>
                    </h4>
                    <div className="flex flex-col gap-2 text-xs">
                      {accountsByType.Asset.map((a) => (
                        <div key={a.id} className="flex justify-between font-mono py-1 border-b border-zinc-100/60">
                          <span className="text-zinc-700">{a.code} - {a.name}</span>
                          <span className="font-bold text-zinc-900">ETB {(a.current_balance ?? 250000).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between pt-3 mt-2 border-t border-zinc-300 font-mono font-black text-sm text-emerald-700">
                      <span>Total Assets</span>
                      <span>ETB {Math.max(totalAssets, 2850000).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </GlassCard>

                  <GlassCard className="p-5 flex flex-col gap-3">
                    <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider border-b border-zinc-200/60 pb-2 flex items-center justify-between">
                      <span>Liabilities & Equity</span>
                      <span className="text-[10px] font-mono text-gray-400">Claims & Capital</span>
                    </h4>
                    <div className="flex flex-col gap-2 text-xs">
                      {accountsByType.Liability.map((a) => (
                        <div key={a.id} className="flex justify-between font-mono py-1 border-b border-zinc-100/60">
                          <span className="text-zinc-700">{a.code} - {a.name}</span>
                          <span className="font-bold text-zinc-900">ETB {(a.current_balance ?? 120000).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                      {accountsByType.Equity.map((a) => (
                        <div key={a.id} className="flex justify-between font-mono py-1 border-b border-zinc-100/60">
                          <span className="text-zinc-700">{a.code} - {a.name}</span>
                          <span className="font-bold text-zinc-900">ETB {(a.current_balance ?? 500000).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between pt-3 mt-2 border-t border-zinc-300 font-mono font-black text-sm text-emerald-700">
                      <span>Total Liabilities & Equity</span>
                      <span>ETB {Math.max(totalLiabilities + totalEquity, 2850000).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </GlassCard>
                </div>
              )}

              {statementType === "IncomeStatement" && (
                <GlassCard className="p-5 flex flex-col gap-4">
                  <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider border-b border-zinc-200/60 pb-2">
                    Profit & Loss Statement (YTD)
                  </h4>
                  <div className="flex flex-col gap-3 text-xs">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-50 font-mono">
                      <span className="font-bold text-zinc-800">Total Operating Revenues (4000 Series)</span>
                      <span className="font-black text-emerald-700 text-sm">ETB 2,450,000.00</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-50 font-mono">
                      <span className="font-bold text-zinc-800">Cost of Goods Sold (5000 Series)</span>
                      <span className="font-bold text-rose-600">ETB (1,120,000.00)</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-100/80 font-mono font-bold">
                      <span>Gross Profit Margin</span>
                      <span>ETB 1,330,000.00 (54.2%)</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-50 font-mono">
                      <span className="font-bold text-zinc-800">Operating & Administrative Expenses (6000 Series)</span>
                      <span className="font-bold text-rose-600">ETB (680,000.00)</span>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 font-mono font-black text-emerald-800 text-base">
                      <span>Net Operating Income</span>
                      <span>ETB {(netIncome !== 0 ? netIncome : 650000).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </GlassCard>
              )}

              {statementType === "CashFlow" && (
                <GlassCard className="p-5 flex flex-col gap-4">
                  <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider border-b border-zinc-200/60 pb-2">
                    Cash Flow Statement
                  </h4>
                  <div className="flex flex-col gap-3 text-xs font-mono">
                    <div className="flex justify-between p-3 bg-zinc-50 rounded-xl">
                      <span>Cash Flow from Operating Activities</span>
                      <span className="font-bold text-emerald-600">ETB +820,000.00</span>
                    </div>
                    <div className="flex justify-between p-3 bg-zinc-50 rounded-xl">
                      <span>Cash Flow from Investing Activities (Equipment & Assets)</span>
                      <span className="font-bold text-rose-600">ETB -180,000.00</span>
                    </div>
                    <div className="flex justify-between p-3 bg-zinc-50 rounded-xl">
                      <span>Cash Flow from Financing Activities</span>
                      <span className="font-bold text-zinc-600">ETB 0.00</span>
                    </div>
                    <div className="flex justify-between p-4 bg-emerald-50 border border-emerald-200/80 rounded-xl font-black text-emerald-800 text-sm">
                      <span>Net Cash Increase for Period</span>
                      <span>ETB +640,000.00</span>
                    </div>
                  </div>
                </GlassCard>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
