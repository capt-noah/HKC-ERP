import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  Plus, 
  ChevronRight, 
  FileText, 
  ChevronDown, 
  Info, 
  TrendingUp, 
  Sliders, 
  X,
  Layers
} from "lucide-react"
import { FloatingNav } from "@/components/FloatingNav"
import { GlassCard } from "@/components/GlassCard"
import { SubPageNav } from "@/components/SubPageNav"
import { navSections, getSectionChildren } from "@/lib/nav-config"
import { useFeedback } from "@/context/FeedbackContext"

const fade = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }
const stagger = { visible: { transition: { staggerChildren: 0.05 } } }

interface JournalEntry {
  id: string
  date: string
  desc: string
  account: string
  debit: number
  credit: number
  source: string
  balance: number
}

const initialJournalEntries: JournalEntry[] = [
  { id: "JE-001", date: "2026-07-06", desc: "Acquisition of pharmaceutical active reagents", account: "1010 - Raw Material Inventory", debit: 45000, credit: 0, source: "PO-4091", balance: 545000 },
  { id: "JE-002", date: "2026-07-05", desc: "Invoice dispatch for Batch A-22 Amoxicillin", account: "1200 - Accounts Receivable", debit: 32500, credit: 0, source: "INV-102", balance: 577500 },
  { id: "JE-003", date: "2026-07-04", desc: "Settlement of monthly warehouse leasing", account: "5100 - Rent Expense", debit: 12000, credit: 0, source: "EXP-502", balance: 565500 },
  { id: "JE-004", date: "2026-07-03", desc: "Bi-weekly production team payroll dispatch", account: "2100 - Accrued Payroll", debit: 0, credit: 88400, source: "PAY-301", balance: 477100 },
  { id: "JE-005", date: "2026-07-02", desc: "Advance client retainer receipt", account: "1000 - Cash & Cash Equivalents", debit: 15000, credit: 0, source: "REC-982", balance: 492100 },
  { id: "JE-006", date: "2026-06-28", desc: "Disposal of deprecated lab autoclave", account: "1500 - Equipment Depreciation", debit: 0, credit: 4500, source: "JV-088", balance: 487600 },
]

interface AccountItem {
  code: string
  name: string
  active: boolean
}

interface AccountsGroup {
  [category: string]: AccountItem[]
}

const initialAccounts: AccountsGroup = {
  Assets: [
    { code: "1000", name: "Cash & Cash Equivalents", active: true },
    { code: "1010", name: "Raw Material Inventory", active: true },
    { code: "1200", name: "Accounts Receivable", active: true },
    { code: "1500", name: "Equipment Depreciation", active: true },
  ],
  Liabilities: [
    { code: "2000", name: "Accounts Payable", active: true },
    { code: "2100", name: "Accrued Payroll", active: true },
    { code: "2200", name: "Deferred Revenue", active: false },
  ],
  Equity: [
    { code: "3000", name: "Retained Earnings", active: true },
    { code: "3100", name: "Shareholder Capital", active: true },
  ],
  Revenue: [
    { code: "4000", name: "Pharmaceutical Product Sales", active: true },
    { code: "4100", name: "Diagnostic Consulting Fees", active: true },
  ],
  Expense: [
    { code: "5100", name: "Rent Expense", active: true },
    { code: "5200", name: "Utility & Energy Expense", active: true },
    { code: "5300", name: "Research & Development", active: true },
  ],
}

// Aging types
interface AgingRecord {
  partner: string
  category: "current" | "31-60" | "61-90" | "90+"
  daysOverdue: number
  amount: number
}

const initialAgingReceivables: AgingRecord[] = [
  { partner: "Stark Medical Supplies", category: "current", daysOverdue: 0, amount: 32500 },
  { partner: "Apex Healthcare Ltd", category: "31-60", daysOverdue: 35, amount: 45200 },
  { partner: "Initech Diagnostics", category: "90+", daysOverdue: 94, amount: 28450 },
  { partner: "Lifeline Clinics", category: "61-90", daysOverdue: 65, amount: 18350 },
  { partner: "St. Paul Hospital", category: "90+", daysOverdue: 110, amount: 9550 },
]

const initialAgingPayables: AgingRecord[] = [
  { partner: "Ethio Chemicals Corp", category: "current", daysOverdue: 0, amount: 45000 },
  { partner: "Red Cross Pharma Supplies", category: "current", daysOverdue: 0, amount: 28000 },
  { partner: "Global Logistics Inc", category: "31-60", daysOverdue: 42, amount: 14000 },
  { partner: "East-Africa Power Co", category: "90+", daysOverdue: 91, amount: 14000 },
  { partner: "Prime Glassware Ltd", category: "61-90", daysOverdue: 62, amount: 22000 },
]

export default function Ledger() {
  const { showToast } = useFeedback()
  const [activeTab, setActiveTab] = useState<"Entries" | "Chart" | "Aging">("Entries")
  
  // Tab 1: Journal Entries State
  const [entries, setEntries] = useState<JournalEntry[]>(initialJournalEntries)
  const [searchEntries, setSearchEntries] = useState("")
  const [selectedSource, setSelectedSource] = useState<{ id: string; date: string; desc: string; account: string } | null>(null)
  
  // Tab 2: Chart of Accounts State
  const [accounts, setAccounts] = useState<AccountsGroup>(initialAccounts)
  const [collapsedCategories, setCollapsedCategories] = useState<{ [key: string]: boolean }>({
    Assets: false,
    Liabilities: false,
    Equity: true,
    Revenue: false,
    Expense: false,
  })

  // Tab 3: Aging State
  const [agingType, setAgingType] = useState<"receivables" | "payables">("receivables")
  const [receivables] = useState<AgingRecord[]>(initialAgingReceivables)
  const [payables] = useState<AgingRecord[]>(initialAgingPayables)

  // Posting new entry Modal state
  const [showPostModal, setShowPostModal] = useState(false)
  const [newDate, setNewDate] = useState("2026-07-07")
  const [newDesc, setNewDesc] = useState("")
  const [newAccount, setNewAccount] = useState("1000 - Cash & Cash Equivalents")
  const [newType, setNewType] = useState<"Debit" | "Credit">("Debit")
  const [newAmt, setNewAmt] = useState("")
  const [newSource, setNewSource] = useState("JV-090")

  const handlePostEntry = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDesc || !newAmt || isNaN(Number(newAmt))) {
      showToast("Please provide valid description and amount", "warning")
      return
    }

    const value = Number(newAmt)
    const lastBal = entries[0]?.balance ?? 500000
    const nextBal = newType === "Debit" ? lastBal + value : lastBal - value

    const added: JournalEntry = {
      id: `JE-${String(entries.length + 1).padStart(3, "0")}`,
      date: newDate,
      desc: newDesc,
      account: newAccount,
      debit: newType === "Debit" ? value : 0,
      credit: newType === "Credit" ? value : 0,
      source: newSource,
      balance: nextBal,
    }

    setEntries([added, ...entries])
    setShowPostModal(false)
    setNewDesc("")
    setNewAmt("")
    showToast("Journal Entry Posted", "success", `Reference ${added.id} committed to Ledger database.`)
  }

  const handleToggleAccount = (category: string, code: string) => {
    setAccounts((prev) => {
      const updatedList = prev[category].map((acc) => {
        if (acc.code === code) {
          const nextActive = !acc.active
          showToast(
            `Account ${nextActive ? "Activated" : "Suspended"}`,
            nextActive ? "success" : "info",
            `Account ${code} - ${acc.name} has been updated.`
          )
          return { ...acc, active: nextActive }
        }
        return acc
      })
      return { ...prev, [category]: updatedList }
    })
  }

  const toggleCategoryCollapse = (category: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  // Filter journal entries
  const filteredEntries = entries.filter((ent) => {
    return (
      ent.desc.toLowerCase().includes(searchEntries.toLowerCase()) ||
      ent.account.toLowerCase().includes(searchEntries.toLowerCase()) ||
      ent.source.toLowerCase().includes(searchEntries.toLowerCase())
    )
  })

  // Aging Bucket Math
  const agingData = agingType === "receivables" ? receivables : payables
  const totalAgingAmount = agingData.reduce((acc, curr) => acc + curr.amount, 0)
  
  const currentSum = agingData.filter((r) => r.category === "current").reduce((acc, c) => acc + c.amount, 0)
  const d30Sum = agingData.filter((r) => r.category === "31-60").reduce((acc, c) => acc + c.amount, 0)
  const d60Sum = agingData.filter((r) => r.category === "61-90").reduce((acc, c) => acc + c.amount, 0)
  const d90Sum = agingData.filter((r) => r.category === "90+").reduce((acc, c) => acc + c.amount, 0)

  const currentPct = totalAgingAmount ? (currentSum / totalAgingAmount) * 100 : 0
  const d30Pct = totalAgingAmount ? (d30Sum / totalAgingAmount) * 100 : 0
  const d60Pct = totalAgingAmount ? (d60Sum / totalAgingAmount) * 100 : 0
  const d90Pct = totalAgingAmount ? (d90Sum / totalAgingAmount) * 100 : 0

  return (
    <div className="min-h-screen page-gradient">
      <FloatingNav brand="HKC Trading ERP" sections={navSections} />

      <motion.div 
        variants={stagger} 
        initial="hidden" 
        animate="visible" 
        className="max-w-[98%] mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-12"
      >
        {/* Title Header Block */}
        <motion.div variants={fade} className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight">General Ledger</h1>
            <p className="text-xs font-semibold text-zinc-500 max-w-xl leading-relaxed mt-1">
              Verify double-entry transactions, configure organizational chart of accounts parameters, and audit accounts aging distributions.
            </p>
          </div>
          <div className="flex items-center gap-3 self-end md:self-start">
            <SubPageNav items={getSectionChildren("/finance")} />
            <button 
              onClick={() => setShowPostModal(true)}
              className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-full bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
            >
              <Plus className="size-4" /> Post Entry
            </button>
          </div>
        </motion.div>

        {/* Tab Selection Switcher Bar */}
        <motion.div variants={fade} className="flex border-b border-zinc-200/60 mb-6 pb-px items-center justify-between">
          <div className="flex gap-2">
            {[
              { id: "Entries", label: "Journal Entries" },
              { id: "Chart", label: "Chart of Accounts" },
              { id: "Aging", label: "Aging Report" },
            ].map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="px-4 py-2.5 text-xs font-black relative tracking-tight transition-colors uppercase"
                >
                  <span className={isActive ? "text-zinc-950" : "text-zinc-400 hover:text-zinc-700"}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="ledger-tabs"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-700"
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="text-[10px] font-mono font-black text-zinc-400 uppercase hidden sm:block">
            System State: Balanced
          </div>
        </motion.div>

        {/* Tab 1: Journal Entries Layout */}
        <AnimatePresence mode="wait">
          {activeTab === "Entries" && (
            <motion.div
              key="entries-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
              {/* Filter controls panel */}
              <div className="lg:col-span-1 flex flex-col gap-4">
                <GlassCard className="p-5 flex flex-col gap-4">
                  <div>
                    <h3 className="text-xs font-black tracking-tight text-zinc-900 uppercase mb-1">Search Audit Trail</h3>
                    <p className="text-[10px] font-semibold text-zinc-400 leading-normal">
                      Quick filter by accounts, descriptions, voucher sources or audit references.
                    </p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 size-3.5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Account, ref, PO, INV..."
                      value={searchEntries}
                      onChange={(e) => setSearchEntries(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-green-700 text-zinc-900"
                    />
                  </div>
                  
                  <hr className="border-zinc-100" />

                  <div className="flex flex-col gap-2">
                    <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Historical Context</h4>
                    <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-zinc-800 leading-normal">Operational Balance</p>
                        <p className="text-xs font-black text-zinc-900 mt-0.5">ETB 487,600.00</p>
                      </div>
                      <div className="size-7 rounded-full bg-green-700/10 flex items-center justify-center border border-green-700/20 text-green-800">
                        <TrendingUp className="size-3.5" />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Entries Dense Table */}
              <div className="lg:col-span-3">
                <GlassCard className="overflow-hidden">
                  <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
                    <h3 className="text-xs font-black tracking-tight text-zinc-900 uppercase">Double-Entry Journals</h3>
                    <span className="text-[10px] font-mono font-bold text-zinc-400">
                      Showing {filteredEntries.length} items
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-100 bg-zinc-50/70">
                          <th className="px-4 py-2.5 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-2.5 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Description</th>
                          <th className="px-4 py-2.5 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Account ID & Name</th>
                          <th className="px-4 py-2.5 text-[10px] font-black text-zinc-400 uppercase tracking-wider text-right">Debit</th>
                          <th className="px-4 py-2.5 text-[10px] font-black text-zinc-400 uppercase tracking-wider text-right">Credit</th>
                          <th className="px-4 py-2.5 text-[10px] font-black text-zinc-400 uppercase tracking-wider text-center">Source</th>
                          <th className="px-4 py-2.5 text-[10px] font-black text-zinc-400 uppercase tracking-wider text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {filteredEntries.map((ent) => (
                          <tr key={ent.id} className="hover:bg-zinc-50/60 transition-colors">
                            <td className="px-4 py-3 text-[11px] font-bold text-zinc-800 whitespace-nowrap">{ent.date}</td>
                            <td className="px-4 py-3 text-[11px] font-semibold text-zinc-500 max-w-[200px] truncate" title={ent.desc}>
                              {ent.desc}
                            </td>
                            <td className="px-4 py-3 text-[11px] font-black text-zinc-900">{ent.account}</td>
                            <td className="px-4 py-3 text-[11px] font-mono font-bold text-zinc-800 text-right">
                              {ent.debit > 0 ? `ETB ${ent.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
                            </td>
                            <td className="px-4 py-3 text-[11px] font-mono font-bold text-zinc-800 text-right">
                              {ent.credit > 0 ? `ETB ${ent.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => setSelectedSource({ id: ent.id, date: ent.date, desc: ent.desc, account: ent.source })}
                                className="px-2 py-0.5 rounded-full text-[9px] font-bold border border-green-200 bg-green-50 text-green-900 hover:bg-green-100 transition-colors"
                              >
                                {ent.source}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-[11px] font-mono font-extrabold text-zinc-900 text-right whitespace-nowrap">
                              ETB {ent.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}

          {/* Tab 2: Chart of Accounts */}
          {activeTab === "Chart" && (
            <motion.div
              key="chart-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl mx-auto flex flex-col gap-4"
            >
              <GlassCard className="flex items-center justify-between p-5 mb-2" whileHover={{ y: 0 }}>
                <div>
                  <h3 className="text-xs font-black tracking-tight text-zinc-900 uppercase">Organizational Chart of Accounts</h3>
                  <p className="text-[10px] font-semibold text-zinc-400 mt-0.5">
                    Toggle active accounts to govern Ledger posting accessibility rules dynamically.
                  </p>
                </div>
                <div className="size-9 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                  <Layers className="size-4 text-zinc-500" />
                </div>
              </GlassCard>

              {Object.keys(accounts).map((category) => {
                const groupItems = accounts[category]
                const isCollapsed = collapsedCategories[category]
                return (
                  <GlassCard key={category} className="p-0 overflow-hidden transition-all" whileHover={{ y: 0 }}>
                    {/* Collapsible Header */}
                    <button
                      onClick={() => toggleCategoryCollapse(category)}
                      className="w-full px-5 py-4 flex items-center justify-between hover:bg-zinc-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-green-700 shrink-0" />
                        <h4 className="text-xs font-black uppercase text-zinc-900 tracking-wider">
                          {category} Accounts
                        </h4>
                        <span className="text-[9px] font-mono bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded-full">
                          {groupItems.length} listed
                        </span>
                      </div>
                      <div>
                        {isCollapsed ? (
                          <ChevronRight className="size-4 text-zinc-400" />
                        ) : (
                          <ChevronDown className="size-4 text-zinc-400" />
                        )}
                      </div>
                    </button>

                    {/* Collapsible Body */}
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="border-t border-zinc-100"
                      >
                        <div className="divide-y divide-zinc-50">
                          {groupItems.map((acc) => (
                            <div key={acc.code} className="px-5 py-3.5 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                              <div className="flex items-center gap-4">
                                <span className="text-xs font-mono font-bold text-zinc-400 w-12">{acc.code}</span>
                                <span className="text-xs font-extrabold text-zinc-900">{acc.name}</span>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  acc.active 
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                    : "bg-zinc-100 text-zinc-500 border border-zinc-150"
                                }}`}>
                                  {acc.active ? "Active" : "Disabled"}
                                </span>

                                <button
                                  onClick={() => handleToggleAccount(category, acc.code)}
                                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    acc.active ? "bg-green-700" : "bg-zinc-200"
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                      acc.active ? "translate-x-4" : "translate-x-0"
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </GlassCard>
                )
              })}
            </motion.div>
          )}

          {/* Tab 3: Aging Report */}
          {activeTab === "Aging" && (
            <motion.div
              key="aging-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              {/* Controls bar with pill switch */}
              <GlassCard className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 gap-4" whileHover={{ y: 0 }}>
                <div>
                  <h3 className="text-xs font-black tracking-tight text-zinc-900 uppercase">Aging Distribution Index</h3>
                  <p className="text-[10px] font-semibold text-zinc-400 mt-0.5">
                    Observe account outstanding balances grouped by chronological aging buckets.
                  </p>
                </div>

                <div className="bg-zinc-100 p-1 rounded-full flex self-start sm:self-center">
                  {[
                    { id: "receivables", label: "Receivables (Debtors)" },
                    { id: "payables", label: "Payables (Creditors)" },
                  ].map((p) => {
                    const isActive = agingType === p.id
                    return (
                      <button
                        key={p.id}
                        onClick={() => setAgingType(p.id as any)}
                        className={`px-4 py-1.5 rounded-full text-xs font-black tracking-tight uppercase transition-all ${
                          isActive 
                            ? "bg-white text-zinc-950 shadow-sm" 
                            : "text-zinc-400 hover:text-zinc-600"
                        }`}
                      >
                        {p.label}
                      </button>
                    )
                  })}
                </div>
              </GlassCard>

              {/* Stacked Horizontal Aging Bucket Bar */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-black text-zinc-900 uppercase tracking-tight">Aging Buckets Visualization</h4>
                  <span className="text-xs font-black text-zinc-950">
                    Total: ETB {totalAgingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <div className="bg-zinc-50 border border-zinc-100/60 p-3 rounded-2xl">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Current (0-30 days)</span>
                    <span className="text-xs font-black text-zinc-900 block mt-0.5">
                      ETB {currentSum.toLocaleString()} ({currentPct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-100/60 p-3 rounded-2xl">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">31-60 days Overdue</span>
                    <span className="text-xs font-black text-zinc-900 block mt-0.5">
                      ETB {d30Sum.toLocaleString()} ({d30Pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-100/60 p-3 rounded-2xl">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">61-90 days Overdue</span>
                    <span className="text-xs font-black text-zinc-900 block mt-0.5">
                      ETB {d60Sum.toLocaleString()} ({d60Pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="bg-green-700/5 border border-green-700/10 p-3 rounded-2xl">
                    <span className="text-[9px] font-bold text-green-800 uppercase tracking-wider block">90+ days (Critical)</span>
                    <span className="text-xs font-black text-green-900 block mt-0.5">
                      ETB {d90Sum.toLocaleString()} ({d90Pct.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                {/* Stacked Percentage Bar */}
                <div className="h-6 w-full rounded-full bg-zinc-100 overflow-hidden flex shadow-inner border border-zinc-200/50">
                  {currentPct > 0 && (
                    <div 
                      style={{ width: `${currentPct}%` }}
                      className="bg-emerald-500/80 transition-all border-r border-white/40 h-full"
                      title={`Current: ${currentPct.toFixed(1)}%`}
                    />
                  )}
                  {d30Pct > 0 && (
                    <div 
                      style={{ width: `${d30Pct}%` }}
                      className="bg-blue-400/80 transition-all border-r border-white/40 h-full"
                      title={`31-60d: ${d30Pct.toFixed(1)}%`}
                    />
                  )}
                  {d60Pct > 0 && (
                    <div 
                      style={{ width: `${d60Pct}%` }}
                      className="bg-zinc-400 transition-all border-r border-white/40 h-full"
                      title={`61-90d: ${d60Pct.toFixed(1)}%`}
                    />
                  )}
                  {d90Pct > 0 && (
                    <div 
                      style={{ width: `${d90Pct}%` }}
                      className="bg-green-700 transition-all h-full"
                      title={`90d+: ${d90Pct.toFixed(1)}%`}
                    />
                  )}
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono font-bold text-zinc-400 mt-2">
                  <span>Current Receipts</span>
                  <span className="text-green-700 uppercase tracking-widest font-black">90+ days critical orange bar</span>
                </div>
              </GlassCard>

              {/* Aging Details Table */}
              <GlassCard className="overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
                  <h4 className="text-xs font-black text-zinc-900 uppercase tracking-tight">Chronological Audit Ledger Detail</h4>
                  <span className="text-[10px] font-mono font-bold text-zinc-400">
                    Group: {agingType.toUpperCase()}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-100 bg-zinc-50/70">
                        <th className="px-4 py-2.5 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Account Partner</th>
                        <th className="px-4 py-2.5 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Status Category</th>
                        <th className="px-4 py-2.5 text-[10px] font-black text-zinc-400 uppercase tracking-wider text-center">Days Overdue</th>
                        <th className="px-4 py-2.5 text-[10px] font-black text-zinc-400 uppercase tracking-wider text-right">Outstanding Balance</th>
                        <th className="px-4 py-2.5 text-[10px] font-black text-zinc-400 uppercase tracking-wider text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {agingData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                          <td className="px-4 py-3 text-[11px] font-black text-zinc-900">{row.partner}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              row.category === "current" && "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            } ${
                              row.category === "31-60" && "bg-blue-50 text-blue-700 border border-blue-100"
                            } ${
                              row.category === "61-90" && "bg-zinc-100 text-zinc-600 border border-zinc-150"
                            } ${
                              row.category === "90+" && "bg-green-700/10 text-green-900 border border-green-200"
                            }`}>
                              {row.category === "current" ? "Current (0-30d)" : `${row.category} days`}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-[11px] font-mono font-bold text-zinc-800">
                            {row.daysOverdue === 0 ? "—" : `${row.daysOverdue} days`}
                          </td>
                          <td className={`px-4 py-3 text-right text-[11px] font-mono font-extrabold ${
                            row.category === "90+" ? "text-green-800" : "text-zinc-900"
                          }`}>
                            ETB {row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => showToast(`Audit Statement Triggered`, `info`, `Generated dispatch record for ${row.partner}.`)}
                              className="px-2 py-1 rounded-lg text-[10px] font-black border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 transition-colors uppercase tracking-tight"
                            >
                              Dispatch Statement
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Source Document Quickview Modal */}
      <AnimatePresence>
        {selectedSource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedSource(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }} 
              className="bg-white border border-zinc-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative z-10 text-left overflow-hidden"
            >
              <button 
                onClick={() => setSelectedSource(null)}
                className="absolute right-4 top-4 p-1 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"
              >
                <X className="size-4" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <div className="size-8 rounded-full bg-green-700/10 border border-green-700/20 text-green-800 flex items-center justify-center shrink-0">
                  <FileText className="size-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase text-zinc-900 tracking-tight">Source Document Audit</h3>
                  <p className="text-[10px] font-mono font-bold text-zinc-400 mt-0.5">{selectedSource.account}</p>
                </div>
              </div>

              <div className="space-y-3.5 border-t border-zinc-100 pt-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-zinc-400">Voucher Reference</span>
                  <span className="font-bold text-zinc-900">{selectedSource.id}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-zinc-400">Dispatched Date</span>
                  <span className="font-bold text-zinc-900">{selectedSource.date}</span>
                </div>
                <div className="flex justify-between items-start text-xs gap-4">
                  <span className="font-semibold text-zinc-400 shrink-0">Description</span>
                  <span className="font-bold text-zinc-900 text-right leading-relaxed">{selectedSource.desc}</span>
                </div>
                
                <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-3 mt-2">
                  <div className="flex items-center gap-2">
                    <Info className="size-3.5 text-zinc-400 shrink-0" />
                    <p className="text-[10px] font-semibold text-zinc-500 leading-normal">
                      Voucher fully balanced in ledger logs. Ready for compliance export audits.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  showToast("Compliance Export Triggered", "success", "PDF report download initiated.")
                  setSelectedSource(null)
                }}
                className="w-full mt-5 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-colors uppercase tracking-tight flex items-center justify-center gap-2"
              >
                Export PDF Voucher
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Post Entry Modal */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowPostModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }} 
              className="bg-white border border-zinc-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative z-10 text-left overflow-hidden"
            >
              <button 
                onClick={() => setShowPostModal(false)}
                className="absolute right-4 top-4 p-1 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"
              >
                <X className="size-4" />
              </button>

              <div className="flex items-center gap-2 mb-5">
                <div className="size-8 rounded-full bg-green-700/10 border border-green-700/20 text-green-800 flex items-center justify-center shrink-0">
                  <Sliders className="size-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase text-zinc-900 tracking-tight">Post New Journal Entry</h3>
                  <p className="text-[10px] font-semibold text-zinc-400 mt-0.5">Commit ledger double-entry voucher adjustment</p>
                </div>
              </div>

              <form onSubmit={handlePostEntry} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Entry Date</label>
                    <input 
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-green-700 text-zinc-950"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Source Code</label>
                    <input 
                      type="text"
                      value={newSource}
                      onChange={(e) => setNewSource(e.target.value)}
                      placeholder="JV-090"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-green-700 text-zinc-950"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Ledger Account</label>
                  <select 
                    value={newAccount}
                    onChange={(e) => setNewAccount(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-green-700 text-zinc-950"
                  >
                    <option value="1000 - Cash & Cash Equivalents">1000 - Cash & Cash Equivalents</option>
                    <option value="1010 - Raw Material Inventory">1010 - Raw Material Inventory</option>
                    <option value="1200 - Accounts Receivable">1200 - Accounts Receivable</option>
                    <option value="2000 - Accounts Payable">2000 - Accounts Payable</option>
                    <option value="2100 - Accrued Payroll">2100 - Accrued Payroll</option>
                    <option value="5100 - Rent Expense">5100 - Rent Expense</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3 items-end">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Voucher Type</label>
                    <select 
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-green-700 text-zinc-950"
                    >
                      <option value="Debit">Debit</option>
                      <option value="Credit">Credit</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Voucher Amount (ETB)</label>
                    <input 
                      type="text"
                      value={newAmt}
                      onChange={(e) => setNewAmt(e.target.value)}
                      placeholder="e.g. 15000"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-green-700 text-zinc-950"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Detailed Description</label>
                  <textarea 
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Provide audit-trail statement remarks..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-green-700 text-zinc-950 h-16 resize-none"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-3 border-t border-zinc-150">
                  <button
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    className="flex-1 py-2.5 border border-zinc-200 rounded-xl text-zinc-700 hover:bg-zinc-50 text-xs font-bold transition-all uppercase tracking-tight"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all uppercase tracking-tight"
                  >
                    Post Journal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
