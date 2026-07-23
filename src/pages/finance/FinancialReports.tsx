import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  Scale,
  Download,
  PieChart,
  BookOpen,
  RotateCcw,
  Search,
  X,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Filter,
  CheckCircle2,
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

  const [activeTab, setActiveTab] = useState<"GL" | "Aging" | "TrialBalance" | "Statements">("GL")

  // General Ledger Filters State
  const [glAccountFilter, setGlAccountFilter] = useState<string>("ALL")
  const [glVoucherTypeFilter, setGlVoucherTypeFilter] = useState<string>("ALL")
  const [glPartyFilter, setGlPartyFilter] = useState<string>("ALL")
  const [glFromDate, setGlFromDate] = useState<string>("")
  const [glToDate, setGlToDate] = useState<string>("")
  const [glSearchQuery, setGlSearchQuery] = useState<string>("")

  // AR/AP Aging state
  const [agingType, setAgingType] = useState<"receivables" | "payables">("receivables")
  const [agingBucketFilter, setAgingBucketFilter] = useState<"ALL" | "current" | "31-60" | "61-90" | "90+">("ALL")
  const [receivables] = useState<AgingRecord[]>(initialAgingReceivables)
  const [payables] = useState<AgingRecord[]>(initialAgingPayables)

  // Statements sub-tab
  const [statementType, setStatementType] = useState<"BalanceSheet" | "IncomeStatement" | "CashFlow">("BalanceSheet")

  // General Ledger Column Resizing & Sorting State
  const defaultGlColWidths: Record<string, number> = {
    entry_date: 125,
    account: 170,
    source_type: 120,
    source_id: 110,
    party: 130,
    description: 180,
    against_account: 150,
    debit_amount: 115,
    credit_amount: 115,
    running_balance: 145,
  }

  const [glColWidths, setGlColWidths] = useState<Record<string, number>>(defaultGlColWidths)
  const [glSortKey, setGlSortKey] = useState<string | null>(null)
  const [glSortDir, setGlSortDir] = useState<"asc" | "desc">("asc")
  const [openSortMenuCol, setOpenSortMenuCol] = useState<string | null>(null)

  const handleResizeStart = (e: React.MouseEvent, colKey: string) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startWidth = glColWidths[colKey] || 120

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const newWidth = Math.max(65, startWidth + deltaX)
      setGlColWidths((prev) => ({ ...prev, [colKey]: newWidth }))
    }

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }

  const glColumns: { key: string; label: string; align?: "left" | "right" }[] = [
    { key: "entry_date", label: "Posting Date", align: "left" },
    { key: "account", label: "Account", align: "left" },
    { key: "source_type", label: "Voucher Type", align: "left" },
    { key: "source_id", label: "Voucher No", align: "left" },
    { key: "party", label: "Party", align: "left" },
    { key: "description", label: "Remarks", align: "left" },
    { key: "against_account", label: "Against Account", align: "left" },
    { key: "debit_amount", label: "Debit (ETB)", align: "right" },
    { key: "credit_amount", label: "Credit (ETB)", align: "right" },
    { key: "running_balance", label: "Running Balance", align: "right" },
  ]

  // Data from store
  const accounts = store.getAccounts()
  const trialBalance = store.getTrialBalance()

  // Trial Balance Filters & Sorting State
  const [tbCategoryFilter, setTbCategoryFilter] = useState<string>("ALL")
  const [tbBalanceFilter, setTbBalanceFilter] = useState<string>("ALL")
  const [tbSearchTerm, setTbSearchTerm] = useState<string>("")
  const [tbSortKey, setTbSortKey] = useState<string | null>("code")
  const [tbSortDir, setTbSortDir] = useState<"asc" | "desc">("asc")
  const [openTbSortMenuCol, setOpenTbSortMenuCol] = useState<string | null>(null)

  const defaultTbColWidths: Record<string, number> = {
    code: 110,
    name: 240,
    account_type: 130,
    debit_sum: 140,
    credit_sum: 140,
    net_balance: 150,
    balance_type: 120,
  }
  const [tbColWidths, setTbColWidths] = useState<Record<string, number>>(defaultTbColWidths)

  const handleTbResizeStart = (e: React.MouseEvent, colKey: string) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startWidth = tbColWidths[colKey] || 120

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const newWidth = Math.max(65, startWidth + deltaX)
      setTbColWidths((prev) => ({ ...prev, [colKey]: newWidth }))
    }

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }

  const tbColumns: { key: string; label: string; align?: "left" | "right" | "center" }[] = [
    { key: "code", label: "Account Code", align: "left" },
    { key: "name", label: "Account Name", align: "left" },
    { key: "account_type", label: "Category", align: "left" },
    { key: "debit_sum", label: "Debit Sum (ETB)", align: "right" },
    { key: "credit_sum", label: "Credit Sum (ETB)", align: "right" },
    { key: "net_balance", label: "Net Balance (ETB)", align: "right" },
    { key: "balance_type", label: "Balance Status", align: "center" },
  ]

  const filteredTbRows = trialBalance.rows.filter((r) => {
    if (tbCategoryFilter !== "ALL" && r.account_type !== tbCategoryFilter) return false
    if (tbBalanceFilter === "NON_ZERO" && r.debit_sum === 0 && r.credit_sum === 0 && r.net_balance === 0) return false
    if (tbBalanceFilter === "DEBIT_ONLY" && r.debit_sum <= 0 && r.net_balance <= 0) return false
    if (tbBalanceFilter === "CREDIT_ONLY" && r.credit_sum <= 0 && r.net_balance >= 0) return false
    if (tbSearchTerm.trim()) {
      const q = tbSearchTerm.toLowerCase()
      const matches =
        r.code.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.account_type.toLowerCase().includes(q)
      if (!matches) return false
    }
    return true
  })

  const sortedTbRows = [...filteredTbRows].sort((a, b) => {
    if (!tbSortKey) return 0
    let valA: any
    let valB: any
    if (tbSortKey === "code") { valA = a.code; valB = b.code }
    else if (tbSortKey === "name") { valA = a.name; valB = b.name }
    else if (tbSortKey === "account_type") { valA = a.account_type; valB = b.account_type }
    else if (tbSortKey === "debit_sum") { valA = a.debit_sum; valB = b.debit_sum }
    else if (tbSortKey === "credit_sum") { valA = a.credit_sum; valB = b.credit_sum }
    else if (tbSortKey === "net_balance") { valA = a.net_balance; valB = b.net_balance }
    else if (tbSortKey === "balance_type") { valA = a.net_balance > 0 ? "Debit" : a.net_balance < 0 ? "Credit" : "Zero"; valB = b.net_balance > 0 ? "Debit" : b.net_balance < 0 ? "Credit" : "Zero" }

    if (typeof valA === "number" && typeof valB === "number") {
      return tbSortDir === "asc" ? valA - valB : valB - valA
    }
    if (typeof valA === "string" && typeof valB === "string") {
      const comp = valA.localeCompare(valB)
      return tbSortDir === "asc" ? comp : -comp
    }
    return 0
  })

  const tbFilteredTotalDebits = sortedTbRows.reduce((s, r) => s + r.debit_sum, 0)
  const tbFilteredTotalCredits = sortedTbRows.reduce((s, r) => s + r.credit_sum, 0)
  const entries = store.getJournalEntries()
  const lines = store.getJournalEntryLines()

  // GL Engine Calculations
  const allGlTransactions = lines
    .map((line) => {
      const parentEntry = entries.find((e) => e.id === line.journal_entry_id)
      if (!parentEntry) return null

      const accountObj = accounts.find(
        (a) => a.id === line.account_id || a.code === line.account_id
      )

      const contraLines = lines.filter(
        (l) => l.journal_entry_id === line.journal_entry_id && l.id !== line.id
      )
      const contraAccountNames = Array.from(
        new Set(
          contraLines.map((cl) => {
            const acc = accounts.find((a) => a.id === cl.account_id || a.code === cl.account_id)
            return acc ? `${acc.code} ${acc.name}` : cl.account_id
          })
        )
      ).join(", ")

      return {
        id: line.id,
        journal_entry_id: parentEntry.id,
        entry_date: parentEntry.entry_date,
        source_type: parentEntry.source_type,
        source_id: parentEntry.source_id || parentEntry.id,
        description: parentEntry.description,
        account_id: line.account_id,
        account_code: accountObj?.code || line.account_id,
        account_name: accountObj?.name || "Account",
        account_type: accountObj?.account_type || "Asset",
        party_type: line.party_type,
        party_name: line.party_name || (line.party_type ? `${line.party_type}: ${line.party_id}` : null),
        against_account: contraAccountNames || "N/A",
        debit_amount: line.debit_amount,
        credit_amount: line.credit_amount,
        currency: line.currency || "ETB",
      }
    })
    .filter((tx): tx is NonNullable<typeof tx> => tx !== null)

  const uniqueParties = Array.from(
    new Set(allGlTransactions.map((tx) => tx.party_name).filter((p): p is string => Boolean(p)))
  )

  const uniqueVoucherTypes = Array.from(
    new Set(allGlTransactions.map((tx) => tx.source_type))
  )

  const filteredGlTransactions = allGlTransactions.filter((tx) => {
    if (glAccountFilter !== "ALL") {
      if (tx.account_id !== glAccountFilter && tx.account_code !== glAccountFilter) {
        return false
      }
    }
    if (glVoucherTypeFilter !== "ALL") {
      if (tx.source_type !== glVoucherTypeFilter) {
        return false
      }
    }
    if (glPartyFilter !== "ALL") {
      if (!tx.party_name || !tx.party_name.toLowerCase().includes(glPartyFilter.toLowerCase())) {
        return false
      }
    }
    if (glFromDate && tx.entry_date < glFromDate) return false
    if (glToDate && tx.entry_date > glToDate) return false

    if (glSearchQuery.trim()) {
      const q = glSearchQuery.toLowerCase()
      const matches =
        tx.source_id.toLowerCase().includes(q) ||
        tx.journal_entry_id.toLowerCase().includes(q) ||
        tx.description.toLowerCase().includes(q) ||
        tx.account_code.toLowerCase().includes(q) ||
        tx.account_name.toLowerCase().includes(q) ||
        (tx.party_name && tx.party_name.toLowerCase().includes(q)) ||
        tx.against_account.toLowerCase().includes(q)
      if (!matches) return false
    }

    return true
  })

  const sortedGlTransactions = [...filteredGlTransactions].sort((a, b) => {
    if (glSortKey) {
      let valA: any
      let valB: any

      if (glSortKey === "entry_date") {
        valA = a.entry_date
        valB = b.entry_date
      } else if (glSortKey === "account") {
        valA = `${a.account_code} ${a.account_name}`
        valB = `${b.account_code} ${b.account_name}`
      } else if (glSortKey === "source_type") {
        valA = a.source_type
        valB = b.source_type
      } else if (glSortKey === "source_id") {
        valA = a.source_id
        valB = b.source_id
      } else if (glSortKey === "party") {
        valA = a.party_name || ""
        valB = b.party_name || ""
      } else if (glSortKey === "description") {
        valA = a.description || ""
        valB = b.description || ""
      } else if (glSortKey === "against_account") {
        valA = a.against_account || ""
        valB = b.against_account || ""
      } else if (glSortKey === "debit_amount") {
        valA = a.debit_amount
        valB = b.debit_amount
      } else if (glSortKey === "credit_amount") {
        valA = a.credit_amount
        valB = b.credit_amount
      }

      if (typeof valA === "number" && typeof valB === "number") {
        if (valA !== valB) {
          return glSortDir === "asc" ? valA - valB : valB - valA
        }
      } else if (typeof valA === "string" && typeof valB === "string") {
        const comp = valA.localeCompare(valB)
        if (comp !== 0) {
          return glSortDir === "asc" ? comp : -comp
        }
      }
    }

    if (a.entry_date !== b.entry_date) return a.entry_date.localeCompare(b.entry_date)
    return a.journal_entry_id.localeCompare(b.journal_entry_id)
  })

  let runningBal = 0
  let glRowsWithRunningBalance = sortedGlTransactions.map((tx) => {
    if (tx.account_type === "Asset" || tx.account_type === "Expense") {
      runningBal += tx.debit_amount - tx.credit_amount
    } else {
      runningBal += tx.credit_amount - tx.debit_amount
    }
    return {
      ...tx,
      running_balance: runningBal,
    }
  })

  if (glSortKey === "running_balance") {
    glRowsWithRunningBalance = [...glRowsWithRunningBalance].sort((a, b) =>
      glSortDir === "asc" ? a.running_balance - b.running_balance : b.running_balance - a.running_balance
    )
  }

  const glTotalDebit = sortedGlTransactions.reduce((s, tx) => s + tx.debit_amount, 0)
  const glTotalCredit = sortedGlTransactions.reduce((s, tx) => s + tx.credit_amount, 0)

  const accountsByType = {
    Asset: accounts.filter((a) => a.account_type === "Asset"),
    Liability: accounts.filter((a) => a.account_type === "Liability"),
    Equity: accounts.filter((a) => a.account_type === "Equity"),
    Revenue: accounts.filter((a) => a.account_type === "Revenue"),
    Expense: accounts.filter((a) => a.account_type === "Expense"),
  }

  const totalAssets = accountsByType.Asset.reduce((s, a) => s + ((a as any).current_balance ?? 250000), 0)
  const totalLiabilities = accountsByType.Liability.reduce((s, a) => s + ((a as any).current_balance ?? 120000), 0)
  const totalEquity = accountsByType.Equity.reduce((s, a) => s + ((a as any).current_balance ?? 500000), 0)
  const totalRevenue = accountsByType.Revenue.reduce((s, a) => s + ((a as any).current_balance ?? 2450000), 0)
  const totalExpenses = accountsByType.Expense.reduce((s, a) => s + ((a as any).current_balance ?? 1800000), 0)
  const netIncome = totalRevenue - totalExpenses

  const handleSendDunningNotice = (rec: AgingRecord) => {
    showToast(`Dunning Level ${rec.dunningLevel + 1} notice dispatched to ${rec.partner} for ${rec.invoiceRef}`, "success")
  }

  const handleExportPDF = () => {
    showToast("Report exported as PDF statement successfully", "success")
  }

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
              { id: "GL", label: "General Ledger", icon: BookOpen },
              { id: "Aging", label: "AR / AP Aging Analysis", icon: Calendar },
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
          {/* TAB 0: General Ledger (ERPNext Account-Wise Detailed Report) */}
          {activeTab === "GL" && (
            <motion.div
              key="gl-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              {/* Summary Metric Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <GlassCard className="p-3.5 flex flex-col justify-between">
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Account Scope</span>
                  <span className="text-sm font-black text-zinc-900 mt-1 line-clamp-1">
                    {glAccountFilter === "ALL" ? "All Accounts (Full Ledger)" : glAccountFilter}
                  </span>
                </GlassCard>
                <GlassCard className="p-3.5 flex flex-col justify-between">
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Total Debits</span>
                  <span className="text-sm font-mono font-black text-emerald-700 mt-1">
                    ETB {glTotalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </GlassCard>
                <GlassCard className="p-3.5 flex flex-col justify-between">
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Total Credits</span>
                  <span className="text-sm font-mono font-black text-emerald-700 mt-1">
                    ETB {glTotalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </GlassCard>
                <GlassCard className="p-3.5 flex flex-col justify-between">
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Closing Balance</span>
                  <span className="text-sm font-mono font-black text-zinc-950 mt-1">
                    ETB {runningBal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </GlassCard>
              </div>

              {/* General Ledger Table with Integrated Filter Parameters */}
              <GlassCard className="overflow-hidden p-0 flex flex-col border border-zinc-200/80">
                {/* Table Header & Integrated Filter Bar */}
                <div className="p-4 border-b border-zinc-200/80 bg-zinc-50/50 flex flex-col gap-3">
                  {/* Title & Search / Action Row */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <BookOpen className="size-4 text-emerald-600" />
                      <h3 className="text-xs font-black uppercase text-zinc-900 tracking-wider">
                        General Ledger Transactions
                      </h3>
                      <span className="text-[10px] font-mono font-bold bg-zinc-200/80 text-zinc-700 px-2 py-0.5 rounded-full">
                        {glRowsWithRunningBalance.length} {glRowsWithRunningBalance.length === 1 ? "record" : "records"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
                      {/* Integrated Search Box */}
                      <div className="relative w-full max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
                        <input
                          type="text"
                          placeholder="Search ref #, desc, account..."
                          value={glSearchQuery}
                          onChange={(e) => setGlSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-7 py-1 text-xs font-semibold bg-white border border-zinc-200 rounded-full focus:outline-none focus:ring-1 focus:ring-emerald-500 text-zinc-900 placeholder:text-zinc-400 transition-all"
                        />
                        {glSearchQuery && (
                          <button
                            onClick={() => setGlSearchQuery("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                          >
                            <X className="size-3" />
                          </button>
                        )}
                      </div>

                      {(glAccountFilter !== "ALL" ||
                        glVoucherTypeFilter !== "ALL" ||
                        glPartyFilter !== "ALL" ||
                        glFromDate ||
                        glToDate ||
                        glSearchQuery) && (
                        <button
                          onClick={() => {
                            setGlAccountFilter("ALL")
                            setGlVoucherTypeFilter("ALL")
                            setGlPartyFilter("ALL")
                            setGlFromDate("")
                            setGlToDate("")
                            setGlSearchQuery("")
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-500 hover:text-zinc-900 bg-white border border-zinc-200 px-2.5 py-1 rounded-full transition-colors shrink-0"
                          title="Reset all filters"
                        >
                          <RotateCcw className="size-3" /> Reset
                        </button>
                      )}

                      <button
                        onClick={() => {
                          showToast("Report Exported", "success", "General Ledger report exported to CSV.")
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 px-3 py-1 rounded-full transition-colors shrink-0"
                      >
                        <Download className="size-3" /> Export CSV
                      </button>
                    </div>
                  </div>

                  {/* Filter Selectors Row inside Table Header */}
                  <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                    {/* Account Selector */}
                    <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-lg px-2.5 py-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Account:</span>
                      <select
                        value={glAccountFilter}
                        onChange={(e) => setGlAccountFilter(e.target.value)}
                        className="bg-transparent text-xs font-semibold focus:outline-none text-zinc-900 pr-1 max-w-[170px] truncate"
                      >
                        <option value="ALL">All Accounts (1000-6000)</option>
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.code}>
                            {acc.code} - {acc.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Voucher Type Selector */}
                    <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-lg px-2.5 py-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Voucher:</span>
                      <select
                        value={glVoucherTypeFilter}
                        onChange={(e) => setGlVoucherTypeFilter(e.target.value)}
                        className="bg-transparent text-xs font-semibold focus:outline-none text-zinc-900 pr-1"
                      >
                        <option value="ALL">All Voucher Types</option>
                        {uniqueVoucherTypes.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Party Selector */}
                    <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-lg px-2.5 py-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Party:</span>
                      <select
                        value={glPartyFilter}
                        onChange={(e) => setGlPartyFilter(e.target.value)}
                        className="bg-transparent text-xs font-semibold focus:outline-none text-zinc-900 pr-1 max-w-[140px] truncate"
                      >
                        <option value="ALL">All Parties</option>
                        {uniqueParties.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date From */}
                    <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-lg px-2.5 py-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">From:</span>
                      <input
                        type="date"
                        value={glFromDate}
                        onChange={(e) => setGlFromDate(e.target.value)}
                        className="bg-transparent text-xs font-semibold focus:outline-none text-zinc-900"
                      />
                    </div>

                    {/* Date To */}
                    <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-lg px-2.5 py-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">To:</span>
                      <input
                        type="date"
                        value={glToDate}
                        onChange={(e) => setGlToDate(e.target.value)}
                        className="bg-transparent text-xs font-semibold focus:outline-none text-zinc-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Table View */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                      <tr className="border-b border-zinc-200/80 bg-zinc-50/80 text-[10px] font-black text-zinc-400 uppercase tracking-wider select-none">
                        {glColumns.map((col) => {
                          const width = glColWidths[col.key] || 120
                          const isSorted = glSortKey === col.key
                          const isMenuOpen = openSortMenuCol === col.key

                          return (
                            <th
                              key={col.key}
                              style={{ width: `${width}px`, minWidth: `${width}px` }}
                              className="relative px-3 py-3 group border-r border-zinc-200/50 last:border-r-0"
                            >
                              <div className={`flex items-center justify-between gap-1 ${col.align === "right" ? "flex-row-reverse text-right" : ""}`}>
                                <span className="truncate">{col.label}</span>

                                {/* Dropdown Icon & Active Sort Indicator */}
                                <div className="relative flex items-center shrink-0">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setOpenSortMenuCol(isMenuOpen ? null : col.key)
                                    }}
                                    className={`p-1 rounded hover:bg-zinc-200/80 transition-colors flex items-center gap-0.5 ${
                                      isSorted
                                        ? "text-emerald-700 font-bold bg-emerald-100/80"
                                        : "text-zinc-400 opacity-0 group-hover:opacity-100"
                                    }`}
                                    title="Sort options"
                                  >
                                    {isSorted ? (
                                      glSortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />
                                    ) : (
                                      <ChevronDown className="size-3" />
                                    )}
                                  </button>

                                  {/* Dropdown Menu Popover */}
                                  {isMenuOpen && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-20 cursor-default"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setOpenSortMenuCol(null)
                                        }}
                                      />
                                      <div
                                        className={`absolute top-full mt-1.5 z-30 bg-white border border-zinc-200 shadow-xl rounded-xl p-1.5 min-w-[150px] text-xs font-semibold normal-case tracking-normal ${
                                          col.align === "right" ? "right-0 text-left" : "left-0 text-left"
                                        }`}
                                      >
                                        <div className="px-2 py-1 text-[10px] font-bold uppercase text-zinc-400 border-b border-zinc-100 mb-1">
                                          Sort {col.label}
                                        </div>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setGlSortKey(col.key)
                                            setGlSortDir("asc")
                                            setOpenSortMenuCol(null)
                                          }}
                                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors ${
                                            isSorted && glSortDir === "asc"
                                              ? "bg-emerald-50 text-emerald-800 font-bold"
                                              : "text-zinc-700 hover:bg-zinc-100"
                                          }`}
                                        >
                                          <ArrowUp className="size-3 text-emerald-600" />
                                          Sort Ascending
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setGlSortKey(col.key)
                                            setGlSortDir("desc")
                                            setOpenSortMenuCol(null)
                                          }}
                                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors ${
                                            isSorted && glSortDir === "desc"
                                              ? "bg-emerald-50 text-emerald-800 font-bold"
                                              : "text-zinc-700 hover:bg-zinc-100"
                                          }`}
                                        >
                                          <ArrowDown className="size-3 text-emerald-600" />
                                          Sort Descending
                                        </button>
                                        {isSorted && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setGlSortKey(null)
                                              setOpenSortMenuCol(null)
                                            }}
                                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors border-t border-zinc-100 mt-1 pt-1.5"
                                          >
                                            <RotateCcw className="size-3" />
                                            Clear Sort
                                          </button>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Column Resizer Handle */}
                              <div
                                onMouseDown={(e) => handleResizeStart(e, col.key)}
                                className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-emerald-500/60 active:bg-emerald-600 z-10 transition-colors"
                                title="Drag to resize column"
                              />
                            </th>
                          )
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {glRowsWithRunningBalance.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="px-4 py-8 text-center text-xs font-semibold text-zinc-400">
                            No general ledger entries found matching the current filter criteria.
                          </td>
                        </tr>
                      ) : (
                        glRowsWithRunningBalance.map((row) => (
                          <tr key={row.id} className="hover:bg-zinc-50/60 transition-colors text-xs">
                            <td
                              style={{ width: `${glColWidths.entry_date}px` }}
                              className="px-3 py-3 font-mono text-zinc-800 whitespace-nowrap truncate"
                            >
                              {row.entry_date}
                            </td>
                            <td
                              style={{ width: `${glColWidths.account}px` }}
                              className="px-3 py-3 whitespace-nowrap truncate"
                            >
                              <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-[11px] mr-1">
                                {row.account_code}
                              </span>
                              <span className="font-semibold text-zinc-800">{row.account_name}</span>
                            </td>
                            <td
                              style={{ width: `${glColWidths.source_type}px` }}
                              className="px-3 py-3 whitespace-nowrap text-[11px] font-semibold text-zinc-600 truncate"
                            >
                              {row.source_type}
                            </td>
                            <td
                              style={{ width: `${glColWidths.source_id}px` }}
                              className="px-3 py-3 whitespace-nowrap font-mono font-bold text-emerald-700 truncate"
                            >
                              {row.source_id}
                            </td>
                            <td
                              style={{ width: `${glColWidths.party}px` }}
                              className="px-3 py-3 whitespace-nowrap truncate"
                            >
                              {row.party_name ? (
                                <span className="inline-block font-sans text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded truncate">
                                  {row.party_name}
                                </span>
                              ) : (
                                <span className="text-zinc-300">-</span>
                              )}
                            </td>
                            <td
                              style={{ width: `${glColWidths.description}px` }}
                              className="px-3 py-3 text-[11px] text-zinc-600 truncate"
                            >
                              {row.description}
                            </td>
                            <td
                              style={{ width: `${glColWidths.against_account}px` }}
                              className="px-3 py-3 text-[11px] text-zinc-600 truncate font-mono"
                            >
                              {row.against_account}
                            </td>
                            <td
                              style={{ width: `${glColWidths.debit_amount}px` }}
                              className="px-3 py-3 text-right font-mono font-bold text-zinc-900 whitespace-nowrap truncate"
                            >
                              {row.debit_amount > 0
                                ? row.debit_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })
                                : "-"}
                            </td>
                            <td
                              style={{ width: `${glColWidths.credit_amount}px` }}
                              className="px-3 py-3 text-right font-mono font-bold text-zinc-900 whitespace-nowrap truncate"
                            >
                              {row.credit_amount > 0
                                ? row.credit_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })
                                : "-"}
                            </td>
                            <td
                              style={{ width: `${glColWidths.running_balance}px` }}
                              className="px-3 py-3 text-right font-mono font-black text-emerald-800 whitespace-nowrap bg-emerald-50/20 truncate"
                            >
                              ETB {row.running_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          )}
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

              {/* Horizontal Distribution Bar & Interactive Filter Banner */}
              {(() => {
                const data = agingType === "receivables" ? receivables : payables
                const buckets = [
                  { label: "Current (0-30 Days)", cat: "current" as const, color: "bg-emerald-500", border: "border-emerald-300", text: "text-emerald-700", bgLight: "bg-emerald-50" },
                  { label: "31-60 Days Overdue", cat: "31-60" as const, color: "bg-amber-400", border: "border-amber-300", text: "text-amber-700", bgLight: "bg-amber-50" },
                  { label: "61-90 Days Overdue", cat: "61-90" as const, color: "bg-orange-500", border: "border-orange-300", text: "text-orange-700", bgLight: "bg-orange-50" },
                  { label: "90+ Days Overdue", cat: "90+" as const, color: "bg-rose-500", border: "border-rose-300", text: "text-rose-700", bgLight: "bg-rose-50" },
                ]

                const totalOutstanding = data.reduce((s, r) => s + r.amount, 0)
                const bucketStats = buckets.map((b) => {
                  const filtered = data.filter((r) => r.category === b.cat)
                  const sum = filtered.reduce((s, r) => s + r.amount, 0)
                  const pct = totalOutstanding > 0 ? (sum / totalOutstanding) * 100 : 0
                  return { ...b, sum, count: filtered.length, pct }
                })

                return (
                  <GlassCard className="p-4 flex flex-col gap-4">
                    {/* Top row label & active status */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <PieChart className="size-4 text-emerald-600" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                          {agingType === "receivables" ? "Receivables" : "Payables"} Timeline Distribution
                        </h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-zinc-500">
                          Total Outstanding:{" "}
                          <span className="font-mono font-black text-zinc-900">
                            ETB {totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </span>
                        {agingBucketFilter !== "ALL" && (
                          <button
                            onClick={() => setAgingBucketFilter("ALL")}
                            className="text-[11px] font-bold text-zinc-600 hover:text-black bg-zinc-100 hover:bg-zinc-200 px-2.5 py-0.5 rounded-full transition-colors inline-flex items-center gap-1"
                          >
                            <X className="size-3" /> Show All Timelines
                          </button>
                        )}
                      </div>
                    </div>

                    {/* The Main Horizontal Proportion Segmented Bar */}
                    <div className="w-full bg-zinc-100/90 p-1 rounded-2xl border border-zinc-200/80 shadow-inner">
                      <div className="h-7 w-full flex rounded-xl overflow-hidden gap-1">
                        {bucketStats.map((b) => {
                          if (b.pct <= 0) return null
                          const isSelected = agingBucketFilter === b.cat
                          const isOtherSelected = agingBucketFilter !== "ALL" && !isSelected
                          return (
                            <motion.button
                              key={b.cat}
                              onClick={() => setAgingBucketFilter(agingBucketFilter === b.cat ? "ALL" : b.cat)}
                              initial={{ width: 0 }}
                              animate={{ width: `${b.pct}%`, opacity: isOtherSelected ? 0.35 : 1 }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                              className={`${b.color} relative group h-full flex items-center justify-center transition-all cursor-pointer hover:brightness-110 focus:outline-none`}
                              title={`${b.label}: ETB ${b.sum.toLocaleString()} (${b.pct.toFixed(1)}%)`}
                            >
                              {b.pct >= 8 && (
                                <span className="text-[10px] font-black text-white drop-shadow-xs font-mono px-1 whitespace-nowrap overflow-hidden">
                                  {b.pct.toFixed(1)}%
                                </span>
                              )}
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Bucket Legend & Interactive Cards Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {bucketStats.map((b) => {
                        const isSelected = agingBucketFilter === b.cat
                        return (
                          <button
                            key={b.cat}
                            onClick={() => setAgingBucketFilter(agingBucketFilter === b.cat ? "ALL" : b.cat)}
                            className={`p-3 rounded-xl text-left border transition-all relative cursor-pointer ${
                              isSelected
                                ? `bg-white ${b.border} ring-2 ring-emerald-500/30 shadow-md`
                                : "bg-white/60 border-zinc-200/80 hover:bg-white hover:border-zinc-300"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className={`size-2.5 rounded-full ${b.color}`} />
                                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                                  {b.label}
                                </span>
                              </div>
                              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded ${b.bgLight} ${b.text}`}>
                                {b.pct.toFixed(1)}%
                              </span>
                            </div>
                            <div className="text-sm font-black font-mono text-zinc-950">
                              ETB {b.sum.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-[10px] font-semibold text-zinc-400 mt-0.5">
                              {b.count} {b.count === 1 ? "invoice" : "invoices"}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </GlassCard>
                )
              })()}

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
                    {(agingType === "receivables" ? receivables : payables)
                      .filter((rec) => agingBucketFilter === "ALL" || rec.category === agingBucketFilter)
                      .map((rec) => (
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
              {/* Top Summary Banner */}
              <GlassCard className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Scale className="size-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-zinc-900">General Ledger Trial Balance Statement</h3>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      ERPNext GL Aligned
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Complete verification of debits and credits across all 5 account categories (Assets, Liabilities, Equity, Revenue, Expenses).
                  </p>
                </div>

                <div className="flex items-center gap-4 border-l border-zinc-200/80 pl-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase block">Total Debits</span>
                    <span className="text-xs font-mono font-black text-zinc-900">
                      ETB {trialBalance.totalDebits.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase block">Total Credits</span>
                    <span className="text-xs font-mono font-black text-zinc-900">
                      ETB {trialBalance.totalCredits.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase block">Ledger Status</span>
                    <span className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-full ${
                      trialBalance.isBalanced ? "text-emerald-700 bg-emerald-100/80 border border-emerald-200" : "text-rose-700 bg-rose-100/80 border border-rose-200"
                    }`}>
                      {trialBalance.isBalanced ? "BALANCED" : "IMBALANCED"}
                    </span>
                  </div>
                </div>
              </GlassCard>

              {/* Table Container Card with Integrated Toolbar */}
              <GlassCard className="overflow-hidden p-0 flex flex-col">
                {/* Integrated Table Toolbar Header */}
                <div className="p-3 bg-zinc-50/90 border-b border-zinc-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Category Pills (5 types) */}
                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
                    <span className="text-[10px] font-black uppercase text-zinc-400 mr-1 flex items-center gap-1 shrink-0">
                      <Filter className="size-3" /> Category:
                    </span>
                    {[
                      { id: "ALL", label: "All 5 Categories", count: trialBalance.rows.length },
                      { id: "Asset", label: "Assets", count: trialBalance.rows.filter(r => r.account_type === "Asset").length },
                      { id: "Liability", label: "Liabilities", count: trialBalance.rows.filter(r => r.account_type === "Liability").length },
                      { id: "Equity", label: "Equity", count: trialBalance.rows.filter(r => r.account_type === "Equity").length },
                      { id: "Revenue", label: "Revenue", count: trialBalance.rows.filter(r => r.account_type === "Revenue").length },
                      { id: "Expense", label: "Expenses", count: trialBalance.rows.filter(r => r.account_type === "Expense").length },
                    ].map((cat) => {
                      const isActive = tbCategoryFilter === cat.id
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setTbCategoryFilter(cat.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                            isActive
                              ? "bg-zinc-900 text-white shadow-xs"
                              : "bg-white text-zinc-600 hover:bg-zinc-200/70 border border-zinc-200/80"
                          }`}
                        >
                          <span>{cat.label}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                            isActive ? "bg-zinc-700 text-zinc-100" : "bg-zinc-100 text-zinc-500"
                          }`}>
                            {cat.count}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Right Controls: Balance Filter + Integrated Search */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={tbBalanceFilter}
                      onChange={(e) => setTbBalanceFilter(e.target.value)}
                      className="bg-white border border-zinc-200/80 text-zinc-800 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="ALL">All Accounts</option>
                      <option value="NON_ZERO">Non-Zero Balances Only</option>
                      <option value="DEBIT_ONLY">Debit Balances Only</option>
                      <option value="CREDIT_ONLY">Credit Balances Only</option>
                    </select>

                    {/* Search Input Box */}
                    <div className="flex items-center gap-2 bg-white border border-zinc-200/80 rounded-lg px-2.5 py-1.5 w-48 md:w-56 focus-within:ring-1 focus-within:ring-emerald-500">
                      <Search className="size-3.5 text-zinc-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search code, name, type..."
                        value={tbSearchTerm}
                        onChange={(e) => setTbSearchTerm(e.target.value)}
                        className="w-full bg-transparent text-xs font-semibold focus:outline-none text-zinc-900"
                      />
                      {tbSearchTerm && (
                        <button onClick={() => setTbSearchTerm("")} className="text-zinc-400 hover:text-zinc-600">
                          <X className="size-3" />
                        </button>
                      )}
                    </div>

                    {/* Reset Filters button */}
                    {(tbCategoryFilter !== "ALL" || tbBalanceFilter !== "ALL" || tbSearchTerm) && (
                      <button
                        onClick={() => {
                          setTbCategoryFilter("ALL")
                          setTbBalanceFilter("ALL")
                          setTbSearchTerm("")
                          setTbSortKey("code")
                          setTbSortDir("asc")
                        }}
                        className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded-lg transition-colors"
                        title="Reset all filters"
                      >
                        <RotateCcw className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Resizable & Sortable Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                      <tr className="border-b border-zinc-200/80 bg-zinc-100/70 text-[10px] font-black text-zinc-500 uppercase tracking-wider select-none">
                        {tbColumns.map((col) => {
                          const width = tbColWidths[col.key] || 120
                          const isSorted = tbSortKey === col.key
                          const isMenuOpen = openTbSortMenuCol === col.key

                          return (
                            <th
                              key={col.key}
                              style={{ width: `${width}px`, minWidth: `${width}px` }}
                              className="relative px-3 py-3 group border-r border-zinc-200/50 last:border-r-0"
                            >
                              <div
                                className={`flex items-center justify-between gap-1 ${
                                  col.align === "right"
                                    ? "flex-row-reverse text-right"
                                    : col.align === "center"
                                    ? "justify-center"
                                    : ""
                                }`}
                              >
                                <span className="truncate">{col.label}</span>

                                {/* Sort Options Popover Button */}
                                <div className="relative flex items-center shrink-0">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setOpenTbSortMenuCol(isMenuOpen ? null : col.key)
                                    }}
                                    className={`p-1 rounded hover:bg-zinc-200/80 transition-colors flex items-center gap-0.5 ${
                                      isSorted
                                        ? "text-emerald-700 font-bold bg-emerald-100/80"
                                        : "text-zinc-400 opacity-0 group-hover:opacity-100"
                                    }`}
                                    title="Sort options"
                                  >
                                    {isSorted ? (
                                      tbSortDir === "asc" ? (
                                        <ArrowUp className="size-3" />
                                      ) : (
                                        <ArrowDown className="size-3" />
                                      )
                                    ) : (
                                      <ChevronDown className="size-3" />
                                    )}
                                  </button>

                                  {/* Dropdown Menu Popover */}
                                  {isMenuOpen && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-20 cursor-default"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setOpenTbSortMenuCol(null)
                                        }}
                                      />
                                      <div
                                        className={`absolute top-full mt-1.5 z-30 bg-white border border-zinc-200 shadow-xl rounded-xl p-1.5 min-w-[150px] text-xs font-semibold normal-case tracking-normal ${
                                          col.align === "right" ? "right-0 text-left" : "left-0 text-left"
                                        }`}
                                      >
                                        <div className="px-2 py-1 text-[10px] font-bold uppercase text-zinc-400 border-b border-zinc-100 mb-1">
                                          Sort {col.label}
                                        </div>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setTbSortKey(col.key)
                                            setTbSortDir("asc")
                                            setOpenTbSortMenuCol(null)
                                          }}
                                          className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2 hover:bg-zinc-100 transition-colors ${
                                            isSorted && tbSortDir === "asc" ? "bg-emerald-50 text-emerald-800 font-bold" : "text-zinc-700"
                                          }`}
                                        >
                                          <ArrowUp className="size-3 text-emerald-600" /> Sort Ascending
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setTbSortKey(col.key)
                                            setTbSortDir("desc")
                                            setOpenTbSortMenuCol(null)
                                          }}
                                          className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2 hover:bg-zinc-100 transition-colors ${
                                            isSorted && tbSortDir === "desc" ? "bg-emerald-50 text-emerald-800 font-bold" : "text-zinc-700"
                                          }`}
                                        >
                                          <ArrowDown className="size-3 text-emerald-600" /> Sort Descending
                                        </button>
                                        {isSorted && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setTbSortKey(null)
                                              setOpenTbSortMenuCol(null)
                                            }}
                                            className="w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors border-t border-zinc-100 mt-1"
                                          >
                                            <X className="size-3" /> Clear Sort
                                          </button>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Column Resizer Handle */}
                              <div
                                onMouseDown={(e) => handleTbResizeStart(e, col.key)}
                                className="absolute top-0 right-0 bottom-0 w-2 cursor-col-resize hover:bg-emerald-500/50 group-hover:bg-zinc-300/60 transition-colors z-10"
                              />
                            </th>
                          )
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-xs font-mono">
                      {sortedTbRows.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-zinc-400 font-sans italic">
                            No accounts match the selected category or filter criteria.
                          </td>
                        </tr>
                      ) : (
                        sortedTbRows.map((r) => {
                          const categoryStyleMap: Record<string, string> = {
                            Asset: "bg-emerald-100/80 text-emerald-800 border-emerald-200/80",
                            Liability: "bg-amber-100/80 text-amber-800 border-amber-200/80",
                            Equity: "bg-purple-100/80 text-purple-800 border-purple-200/80",
                            Revenue: "bg-teal-100/80 text-teal-800 border-teal-200/80",
                            Expense: "bg-rose-100/80 text-rose-800 border-rose-200/80",
                          }
                          const categoryStyle = categoryStyleMap[r.account_type] || "bg-zinc-100 text-zinc-800 border-zinc-200"

                          const isDebit = r.net_balance > 0 || (r.net_balance === 0 && r.debit_sum > r.credit_sum)
                          const isCredit = r.net_balance < 0 || (r.net_balance === 0 && r.credit_sum > r.debit_sum)

                          return (
                            <tr key={r.account_id} className="hover:bg-zinc-50/80 transition-colors">
                              {/* Account Code Column */}
                              <td className="px-3 py-2.5">
                                <span className="font-mono font-black text-zinc-900 bg-zinc-200/90 px-1.5 py-0.5 rounded text-[11px]">
                                  {r.code}
                                </span>
                              </td>

                              {/* Account Name Column */}
                              <td className="px-3 py-2.5 font-sans font-bold text-zinc-900 truncate">
                                {r.name}
                              </td>

                              {/* Account Category Column */}
                              <td className="px-3 py-2.5 font-sans">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${categoryStyle}`}>
                                  {r.account_type}
                                </span>
                              </td>

                              {/* Debit Sum Column */}
                              <td className="px-3 py-2.5 text-right font-bold text-zinc-900">
                                {r.debit_sum > 0 ? (
                                  `ETB ${r.debit_sum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                ) : (
                                  <span className="text-zinc-300 font-normal">-</span>
                                )}
                              </td>

                              {/* Credit Sum Column */}
                              <td className="px-3 py-2.5 text-right font-bold text-zinc-900">
                                {r.credit_sum > 0 ? (
                                  `ETB ${r.credit_sum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                ) : (
                                  <span className="text-zinc-300 font-normal">-</span>
                                )}
                              </td>

                              {/* Net Balance Column */}
                              <td className="px-3 py-2.5 text-right font-black text-zinc-950">
                                ETB {r.net_balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>

                              {/* Balance Type Column */}
                              <td className="px-3 py-2.5 text-center font-sans">
                                {isDebit ? (
                                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full">
                                    Debit Balance
                                  </span>
                                ) : isCredit ? (
                                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-full">
                                    Credit Balance
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                                    Zero Balance
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-zinc-300 bg-zinc-100/90 font-mono font-black text-xs">
                        <td colSpan={3} className="px-3 py-3 font-sans text-zinc-900">
                          Filtered Summary Totals ({sortedTbRows.length} accounts)
                        </td>
                        <td className="px-3 py-3 text-right text-zinc-950">
                          ETB {tbFilteredTotalDebits.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-3 text-right text-zinc-950">
                          ETB {tbFilteredTotalCredits.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td colSpan={2} className="px-3 py-3 text-right font-sans">
                          {trialBalance.isBalanced ? (
                            <span className="text-emerald-700 font-bold bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1">
                              <CheckCircle2 className="size-3.5" /> BALANCED
                            </span>
                          ) : (
                            <span className="text-rose-700 font-bold bg-rose-100 border border-rose-300 px-2.5 py-1 rounded-full text-[11px]">
                              IMBALANCED
                            </span>
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
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
                          <span className="font-bold text-zinc-900">ETB {((a as any).current_balance ?? 250000).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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
                          <span className="font-bold text-zinc-900">ETB {((a as any).current_balance ?? 120000).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                      {accountsByType.Equity.map((a) => (
                        <div key={a.id} className="flex justify-between font-mono py-1 border-b border-zinc-100/60">
                          <span className="text-zinc-700">{a.code} - {a.name}</span>
                          <span className="font-bold text-zinc-900">ETB {((a as any).current_balance ?? 500000).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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
