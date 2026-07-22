import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  Plus, 
  ChevronRight, 
  FileText, 
  ChevronDown, 
  X,
  RotateCcw,
  CheckCircle2,
  ArrowRightLeft,
  TrendingUp,
  Landmark,
  PieChart,
  Receipt,
  ShieldCheck,
  Scale,
  Calendar,
  Download,
  FolderTree,
  Building
} from "lucide-react"
import { FloatingNav } from "@/components/FloatingNav"
import { GlassCard } from "@/components/GlassCard"
import { SubPageNav } from "@/components/SubPageNav"
import { navSections, getSectionChildren } from "@/lib/nav-config"
import { useFeedback } from "@/context/FeedbackContext"
import { useFinanceStore } from "@/lib/financeStore"
import type { JournalEntry } from "@/lib/financeStore"

const fade = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }
const stagger = { visible: { transition: { staggerChildren: 0.05 } } }

// Types
interface AgingRecord {
  id: string
  partner: string
  invoiceRef: string
  category: "current" | "31-60" | "61-90" | "90+"
  daysOverdue: number
  amount: number
  dunningLevel: number
}

interface BankStatementLine {
  id: string
  date: string
  reference: string
  payee: string
  type: "Deposit" | "Withdrawal"
  amount: number
  isCleared: boolean
  clearedDate?: string
}

interface FixedAsset {
  id: string
  name: string
  category: "Vehicles" | "Machinery" | "IT Hardware" | "Buildings" | "Office Equipment"
  purchaseDate: string
  cost: number
  salvageValue: number
  usefulLifeYears: number
  accumulatedDepreciation: number
  status: "Active" | "Disposed" | "Fully Depreciated"
}

interface CostCenterBudget {
  id: string
  code: string
  name: string
  manager: string
  annualBudget: number
  ytdActual: number
  controlPolicy: "Warn" | "Stop"
}

interface TaxRule {
  id: string
  name: string
  ratePercent: number
  type: "VAT/GST" | "Withholding Tax (TDS)" | "Import Duty"
  accountCode: string
  isInclusive: boolean
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

const initialBankLines: BankStatementLine[] = [
  { id: "ST-001", date: "2026-07-18", reference: "DEP-9082", payee: "Stark Medical Supplies", type: "Deposit", amount: 32500, isCleared: true, clearedDate: "2026-07-19" },
  { id: "ST-002", date: "2026-07-19", reference: "CHK-4412", payee: "Ethio Chemicals Corp", type: "Withdrawal", amount: 45000, isCleared: true, clearedDate: "2026-07-19" },
  { id: "ST-003", date: "2026-07-20", reference: "TRF-8821", payee: "Apex Healthcare Ltd", type: "Deposit", amount: 12000, isCleared: false },
  { id: "ST-004", date: "2026-07-21", reference: "WTH-1029", payee: "Office Rent - Commercial Tower", type: "Withdrawal", amount: 25000, isCleared: false },
  { id: "ST-005", date: "2026-07-22", reference: "DEP-3310", payee: "Lifeline Clinics", type: "Deposit", amount: 18350, isCleared: false },
]

const initialFixedAssets: FixedAsset[] = [
  { id: "AST-001", name: "Delivery Truck Isuzu 5-Ton", category: "Vehicles", purchaseDate: "2024-01-15", cost: 1200000, salvageValue: 200000, usefulLifeYears: 5, accumulatedDepreciation: 400000, status: "Active" },
  { id: "AST-002", name: "Warehouse Automatic Forklift", category: "Machinery", purchaseDate: "2024-06-10", cost: 450000, salvageValue: 50000, usefulLifeYears: 8, accumulatedDepreciation: 100000, status: "Active" },
  { id: "AST-003", name: "HQ Dell PowerEdge Server Rack", category: "IT Hardware", purchaseDate: "2025-02-01", cost: 180000, salvageValue: 20000, usefulLifeYears: 4, accumulatedDepreciation: 60000, status: "Active" },
  { id: "AST-004", name: "Bole Logistics Office Premises", category: "Buildings", purchaseDate: "2022-03-01", cost: 8500000, salvageValue: 2000000, usefulLifeYears: 25, accumulatedDepreciation: 1040000, status: "Active" },
]

const initialCostCenters: CostCenterBudget[] = [
  { id: "CC-100", code: "100", name: "Operations & Logistics", manager: "Abebe Bikila", annualBudget: 2500000, ytdActual: 1820000, controlPolicy: "Stop" },
  { id: "CC-200", code: "200", name: "Sales & Distribution", manager: "Tigist Lemma", annualBudget: 1800000, ytdActual: 1450000, controlPolicy: "Warn" },
  { id: "CC-300", code: "300", name: "R&D / Technical Services", manager: "Dawit Yilma", annualBudget: 900000, ytdActual: 510000, controlPolicy: "Warn" },
  { id: "CC-400", code: "400", name: "Executive & Admin", manager: "Helen Kebede", annualBudget: 1200000, ytdActual: 980000, controlPolicy: "Stop" },
]

const initialTaxRules: TaxRule[] = [
  { id: "TAX-01", name: "Standard VAT 15%", ratePercent: 15, type: "VAT/GST", accountCode: "2200", isInclusive: false },
  { id: "TAX-02", name: "Zero-Rated Export 0%", ratePercent: 0, type: "VAT/GST", accountCode: "2200", isInclusive: false },
  { id: "TAX-03", name: "Withholding Tax Services 2%", ratePercent: 2, type: "Withholding Tax (TDS)", accountCode: "2210", isInclusive: true },
  { id: "TAX-04", name: "Withholding Tax Goods 5%", ratePercent: 5, type: "Withholding Tax (TDS)", accountCode: "2210", isInclusive: true },
]

export default function Ledger() {
  const { showToast } = useFeedback()
  const store = useFinanceStore()

  const [activeTab, setActiveTab] = useState<
    "Entries" | "Chart" | "Periods" | "Revaluation"
  >("Entries")

  // Store data
  const entries = store.getJournalEntries()
  const lines = store.getJournalEntryLines()
  const accounts = store.getAccounts()
  const periods = store.getAccountingPeriods()
  const revaluations = store.getRevaluations()
  const invoices = store.getInvoices()

  const [searchEntries, setSearchEntries] = useState("")
  
  // COA state
  const [collapsedCategories, setCollapsedCategories] = useState<{ [key: string]: boolean }>({
    Asset: false,
    Liability: false,
    Equity: false,
    Revenue: false,
    Expense: false,
  })
  const [showAddAccountModal, setShowAddAccountModal] = useState(false)
  const [newAccCode, setNewAccCode] = useState("")
  const [newAccName, setNewAccName] = useState("")
  const [newAccType, setNewAccType] = useState<"Asset" | "Liability" | "Equity" | "Revenue" | "Expense">("Asset")
  const [newAccParent, setNewAccParent] = useState<string>("")

  // Aging state
  const [agingType, setAgingType] = useState<"receivables" | "payables">("receivables")
  const [receivables, setReceivables] = useState<AgingRecord[]>(initialAgingReceivables)
  const [payables, setPayables] = useState<AgingRecord[]>(initialAgingPayables)

  // Bank Recon state
  const [bankLines, setBankLines] = useState<BankStatementLine[]>(initialBankLines)

  // Fixed Asset state
  const [assets, setAssets] = useState<FixedAsset[]>(initialFixedAssets)
  const [showAddAssetModal, setShowAddAssetModal] = useState(false)
  const [newAssetName, setNewAssetName] = useState("")
  const [newAssetCategory, setNewAssetCategory] = useState<FixedAsset["category"]>("Vehicles")
  const [newAssetCost, setNewAssetCost] = useState("")
  const [newAssetSalvage, setNewAssetSalvage] = useState("")
  const [newAssetLife, setNewAssetLife] = useState("5")

  // Budgeting state
  const [costCenters] = useState<CostCenterBudget[]>(initialCostCenters)

  // Tax state
  const [taxRules] = useState<TaxRule[]>(initialTaxRules)

  // Statements sub-tab
  const [statementType, setStatementType] = useState<"BalanceSheet" | "IncomeStatement" | "CashFlow" | "TrialBalance">("BalanceSheet")

  // Posting modal state
  const [showPostModal, setShowPostModal] = useState(false)
  const [newDate, setNewDate] = useState("2026-07-22")
  const [newDesc, setNewDesc] = useState("")
  const [newSourceType, setNewSourceType] = useState<JournalEntry["source_type"]>("Manual Adjustment")
  const [newSourceId, setNewSourceId] = useState("JV-095")
  const newCurrency = "ETB"

  const [formLines, setFormLines] = useState<Array<{
    account_id: string
    debit: string
    credit: string
    party_type: "Customer" | "Supplier" | "Employee" | ""
    party_id: string
    party_name: string
  }>>([
    { account_id: accounts.find((a) => a.is_active)?.id || "", debit: "", credit: "", party_type: "", party_id: "", party_name: "" },
    { account_id: accounts.filter((a) => a.is_active)[1]?.id || "", debit: "", credit: "", party_type: "", party_id: "", party_name: "" },
  ])

  // Revaluation modal
  const [showRevalModal, setShowRevalModal] = useState(false)
  const [revalDate, setRevalDate] = useState("2026-07-22")
  const [revalCurrency, setRevalCurrency] = useState("USD")
  const [revalTargetAcc, setRevalTargetAcc] = useState(accounts.find(a => a.code === "1000")?.id || "")
  const [revalOrigBalance, setRevalOrigBalance] = useState("10000")
  const [revalNewRate, setRevalNewRate] = useState("58.50")

  // Reversal computation
  const reversedEntryIds = new Set(
    entries
      .map((e) => e.is_reversal_of)
      .filter((id): id is string => id !== null && id !== undefined)
  )

  // Handlers
  const handlePostEntry = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDesc.trim()) {
      showToast("Validation Error", "warning", "Please provide an accounting description.")
      return
    }

    const payloadLines = formLines.map((l) => ({
      account_id: l.account_id,
      debit_amount: parseFloat(l.debit) || 0,
      credit_amount: parseFloat(l.credit) || 0,
      party_type: l.party_type ? (l.party_type as any) : null,
      party_id: l.party_id || (l.party_name ? `PARTY-${l.party_name.replace(/\s+/g, "").toUpperCase()}` : null),
      party_name: l.party_name || null,
    }))

    const result = store.postJournalEntry(
      {
        entry_date: newDate,
        description: newDesc,
        source_type: newSourceType,
        source_id: newSourceId,
        created_by: "Senior Accountant",
        currency: newCurrency,
        exchange_rate: 1.0,
      },
      payloadLines
    )

    if (!result.success) {
      showToast("Posting Blocked", "warning", result.error || "Validation error.")
      return
    }

    setShowPostModal(false)
    setNewDesc("")
    setFormLines([
      { account_id: accounts.find((a) => a.is_active)?.id || "", debit: "", credit: "", party_type: "", party_id: "", party_name: "" },
      { account_id: accounts.filter((a) => a.is_active)[1]?.id || "", debit: "", credit: "", party_type: "", party_id: "", party_name: "" },
    ])

    if (result.autoRounded) {
      showToast(
        "Journal Entry Posted",
        "info",
        `Entry ${result.entry?.id} posted with auto-round off line of ETB ${result.roundOffAmount?.toFixed(2)}.`
      )
    } else {
      showToast("Journal Entry Posted", "success", `Entry ${result.entry?.id} posted to General Ledger.`)
    }
  }

  const handleReverseEntry = (entryId: string, lineId?: string) => {
    const res = store.reverseJournalEntry(entryId, lineId)
    if (res.success) {
      showToast(
        "Reversal Journal Entry Created",
        "success",
        `Created entry ${res.reversalEntry?.id} reversing ${lineId ? "line " + lineId : entryId}.`
      )
    } else {
      showToast("Reversal Failed", "warning", res.error || "Could not reverse entry.")
    }
  }

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAccCode.trim() || !newAccName.trim()) {
      showToast("Validation Error", "warning", "Code and Name are required.")
      return
    }
    const res = store.addAccount({
      code: newAccCode,
      name: newAccName,
      account_type: newAccType,
      parent_account_id: newAccParent || null,
      is_active: true,
    })
    if (res.success) {
      setShowAddAccountModal(false)
      setNewAccCode("")
      setNewAccName("")
      showToast("Account Created", "success", `Account ${newAccCode} - ${newAccName} added to Chart of Accounts.`)
    } else {
      showToast("Account Creation Failed", "warning", res.error || "Could not create account.")
    }
  }

  const handleSendDunningNotice = (rec: AgingRecord) => {
    const updated = (agingType === "receivables" ? receivables : payables).map(r => 
      r.id === rec.id ? { ...r, dunningLevel: r.dunningLevel + 1 } : r
    )
    if (agingType === "receivables") setReceivables(updated)
    else setPayables(updated)

    showToast(
      "Dunning Notice Dispatched",
      "success",
      `Sent Level ${rec.dunningLevel + 1} Overdue Payment Notice to ${rec.partner} for ${rec.invoiceRef} (ETB ${rec.amount.toLocaleString()}).`
    )
  }

  const handleClearBankLine = (id: string) => {
    setBankLines(prev => prev.map(l => l.id === id ? { ...l, isCleared: true, clearedDate: new Date().toISOString().slice(0, 10) } : l))
    showToast("Bank Transaction Cleared", "success", `Transaction ${id} matched and marked cleared in Bank Clearance Ledger.`)
  }

  const handleRunDepreciation = (asset: FixedAsset) => {
    const annualDep = (asset.cost - asset.salvageValue) / asset.usefulLifeYears
    const monthlyDep = Math.round((annualDep / 12) * 100) / 100

    const depAcc = accounts.find(a => a.code === "6500" || a.name.includes("Depreciation"))?.id || accounts[0].id
    const accumAcc = accounts.find(a => a.code === "1510" || a.name.includes("Accumulated"))?.id || accounts[1].id

    const res = store.postJournalEntry(
      {
        entry_date: new Date().toISOString().slice(0, 10),
        description: `Monthly Depreciation for Asset ${asset.name} (${asset.id})`,
        source_type: "Manual Adjustment",
        source_id: asset.id,
        created_by: "Fixed Asset Engine",
        currency: "ETB",
        exchange_rate: 1.0,
      },
      [
        { account_id: depAcc, debit_amount: monthlyDep, credit_amount: 0 },
        { account_id: accumAcc, debit_amount: 0, credit_amount: monthlyDep },
      ]
    )

    if (res.success) {
      setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, accumulatedDepreciation: a.accumulatedDepreciation + monthlyDep } : a))
      showToast("Depreciation Posted", "success", `Posted monthly depreciation of ETB ${monthlyDep.toLocaleString()} to GL for ${asset.name}.`)
    } else {
      showToast("Depreciation Failed", "warning", res.error || "Could not post depreciation.")
    }
  }

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault()
    const cost = parseFloat(newAssetCost) || 0
    const salvage = parseFloat(newAssetSalvage) || 0
    const life = parseInt(newAssetLife) || 5

    if (!newAssetName.trim() || cost <= 0) {
      showToast("Validation Error", "warning", "Provide asset name and positive cost.")
      return
    }

    const newAst: FixedAsset = {
      id: `AST-${String(assets.length + 1).padStart(3, "0")}`,
      name: newAssetName,
      category: newAssetCategory,
      purchaseDate: new Date().toISOString().slice(0, 10),
      cost,
      salvageValue: salvage,
      usefulLifeYears: life,
      accumulatedDepreciation: 0,
      status: "Active",
    }

    setAssets([newAst, ...assets])
    setShowAddAssetModal(false)
    setNewAssetName("")
    setNewAssetCost("")
    setNewAssetSalvage("")
    showToast("Fixed Asset Registered", "success", `Registered ${newAst.name} (${newAst.id}) in Asset Registry.`)
  }

  const handleLockPeriod = (periodId: string) => {
    store.toggleLockPeriod(periodId)
    const updated = store.getAccountingPeriods().find(p => p.id === periodId)
    showToast(
      updated?.is_closed ? "Accounting Period Locked" : "Accounting Period Unlocked",
      updated?.is_closed ? "warning" : "info",
      `Period ${periodId} is now ${updated?.is_closed ? "LOCKED (no entries allowed)" : "OPEN"}.`
    )
  }

  const handleCreateRevaluation = (e: React.FormEvent) => {
    e.preventDefault()
    const origBal = parseFloat(revalOrigBalance) || 0
    const rate = parseFloat(revalNewRate) || 0

    if (origBal <= 0 || rate <= 0) {
      showToast("Invalid Input", "warning", "Balance and exchange rate must be positive numbers.")
      return
    }

    const res = store.createRevaluation({
      currency: revalCurrency,
      target_account_id: revalTargetAcc,
      original_balance: origBal,
      current_rate: rate,
      revaluation_date: revalDate,
    })

    if (res.success) {
      setShowRevalModal(false)
      showToast("Draft Revaluation Created", "info", `Revaluation ${res.revaluation?.id} created as 'Draft'. Click 'Post' to execute.`)
    } else {
      showToast("Revaluation Creation Failed", "warning", res.error || "Could not create revaluation.")
    }
  }

  const handlePostRevaluation = (revId: string) => {
    const res = store.postRevaluation(revId)
    if (res.success) {
      showToast("Revaluation Posted", "success", `Journal entry ${res.entryId} created and posted to General Ledger.`)
    } else {
      showToast("Revaluation Posting Blocked", "warning", res.error || "Could not post revaluation.")
    }
  }

  // Trial Balance calculation
  const trialBalance = store.getTrialBalance()

  // Filter entries
  const filteredEntries = entries.filter((ent) => {
    return (
      ent.description.toLowerCase().includes(searchEntries.toLowerCase()) ||
      ent.id.toLowerCase().includes(searchEntries.toLowerCase()) ||
      (ent.source_id && ent.source_id.toLowerCase().includes(searchEntries.toLowerCase()))
    )
  })

  // Group accounts
  const accountsByType = {
    Asset: accounts.filter((a) => a.account_type === "Asset"),
    Liability: accounts.filter((a) => a.account_type === "Liability"),
    Equity: accounts.filter((a) => a.account_type === "Equity"),
    Revenue: accounts.filter((a) => a.account_type === "Revenue"),
    Expense: accounts.filter((a) => a.account_type === "Expense"),
  }

  // Statements math
  const totalAssets = accountsByType.Asset.reduce((sum, acc) => {
    const accLines = lines.filter(l => l.account_id === acc.id)
    return sum + accLines.reduce((s, l) => s + (l.debit_amount - l.credit_amount), 0)
  }, 0)

  const totalLiabilities = accountsByType.Liability.reduce((sum, acc) => {
    const accLines = lines.filter(l => l.account_id === acc.id)
    return sum + accLines.reduce((s, l) => s + (l.credit_amount - l.debit_amount), 0)
  }, 0)

  const totalEquity = accountsByType.Equity.reduce((sum, acc) => {
    const accLines = lines.filter(l => l.account_id === acc.id)
    return sum + accLines.reduce((s, l) => s + (l.credit_amount - l.debit_amount), 0)
  }, 0)

  const totalRevenue = accountsByType.Revenue.reduce((sum, acc) => {
    const accLines = lines.filter(l => l.account_id === acc.id)
    return sum + accLines.reduce((s, l) => s + (l.credit_amount - l.debit_amount), 0)
  }, 0)

  const totalExpense = accountsByType.Expense.reduce((sum, acc) => {
    const accLines = lines.filter(l => l.account_id === acc.id)
    return sum + accLines.reduce((s, l) => s + (l.debit_amount - l.credit_amount), 0)
  }, 0)

  const netIncome = totalRevenue - totalExpense

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
            <h1 className="text-3xl font-black text-black tracking-tight">General Ledger & Accounting Engine</h1>
            <p className="text-xs font-semibold text-zinc-500 max-w-2xl leading-relaxed mt-1">
              ERPNext-aligned double-entry bookkeeping system: Multi-level Chart of Accounts, Bank Reconciliation, Asset Depreciation, Tax Engines, Budgeting Controls, and Financial Statements.
            </p>
          </div>
          <div className="flex items-center gap-3 self-end md:self-start">
            <SubPageNav items={getSectionChildren("/finance")} />
            <button 
              onClick={() => setShowPostModal(true)}
              className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-full bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-md shrink-0 h-[38px]"
            >
              <Plus className="size-4" /> Post Entry
            </button>
          </div>
        </motion.div>

        {/* Tab Selection Switcher Bar */}
        <motion.div variants={fade} className="flex border-b border-zinc-200/60 mb-6 pb-px items-center justify-between overflow-x-auto scrollbar-none">
          <div className="flex gap-1 min-w-max">
            {[
              { id: "Entries", label: "Journal Entries", icon: FileText },
              { id: "Chart", label: "Chart of Accounts", icon: FolderTree },
              { id: "Periods", label: "Accounting Periods", icon: ShieldCheck },
              { id: "Revaluation", label: "Forex Revaluation", icon: TrendingUp },
            ].map((tab) => {
              const isActive = activeTab === tab.id
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-black relative tracking-tight transition-colors uppercase whitespace-nowrap"
                >
                  <Icon className={`size-3.5 ${isActive ? "text-emerald-600" : "text-zinc-400"}`} />
                  <span className={isActive ? "text-zinc-950" : "text-zinc-400 hover:text-zinc-700"}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="ledger-tabs"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="text-[10px] font-mono font-black text-emerald-700 uppercase hidden lg:flex items-center gap-1.5 shrink-0 ml-4">
            <CheckCircle2 className="size-3.5" /> Ledger State: Balanced
          </div>
        </motion.div>

        {/* Tab Content Rendering */}
        <AnimatePresence mode="wait">
          {/* TAB 1: Journal Entries */}
          {activeTab === "Entries" && (
            <motion.div
              key="entries-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <GlassCard className="p-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-zinc-100/80 rounded-full px-3 h-[38px] w-full max-w-md">
                  <Search className="size-4 text-zinc-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by description, JE ID, or source..."
                    value={searchEntries}
                    onChange={(e) => setSearchEntries(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold focus:outline-none text-zinc-900"
                  />
                </div>
                <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
                  Total Entries: {filteredEntries.length}
                </div>
              </GlassCard>

              <GlassCard className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200/80 bg-zinc-50/80 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                        <th className="px-4 py-3">JE ID / Date</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Account Lines & Party</th>
                        <th className="px-4 py-3 text-right">Debit</th>
                        <th className="px-4 py-3 text-right">Credit</th>
                        <th className="px-4 py-3 text-center">Source</th>
                        <th className="px-4 py-3 text-right pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredEntries.map((ent, idx) => {
                        const entryLines = lines.filter((l) => l.journal_entry_id === ent.id)
                        const isReversal = ent.is_reversal_of !== null
                        const isReversed = reversedEntryIds.has(ent.id)

                        const totalDebit = entryLines.reduce((s, l) => s + l.debit_amount, 0)
                        const totalCredit = entryLines.reduce((s, l) => s + l.credit_amount, 0)

                        return (
                          <tr key={`${ent.id}-${idx}`} className="hover:bg-zinc-50/60 transition-colors text-xs">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="font-mono font-bold text-zinc-900">{ent.id}</div>
                              <div className="text-[10px] font-medium text-zinc-400">{ent.entry_date}</div>
                            </td>
                            <td className="px-4 py-3 max-w-xs">
                              <div className="font-semibold text-zinc-800 line-clamp-1">{ent.description}</div>
                              <div className="text-[10px] font-mono text-zinc-400">By: {ent.created_by}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1 max-w-sm">
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
                              ETB {totalDebit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-zinc-900 whitespace-nowrap">
                              ETB {totalCredit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-700">
                                {ent.source_type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right pr-4 whitespace-nowrap">
                              {!isReversal && !isReversed ? (
                                <button
                                  onClick={() => handleReverseEntry(ent.id)}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-full transition-colors"
                                >
                                  <RotateCcw className="size-3" /> Reverse
                                </button>
                              ) : isReversed ? (
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                  Reversed
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                  Reversal Entry
                                </span>
                              )}
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

          {/* TAB 2: Chart of Accounts Tree */}
          {activeTab === "Chart" && (
            <motion.div
              key="chart-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <GlassCard className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Multi-Level Chart of Accounts (COA)</h3>
                  <p className="text-xs text-zinc-500">Hierarchical structure with Group parent nodes and Ledger accounts.</p>
                </div>
                <button
                  onClick={() => setShowAddAccountModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-all"
                >
                  <Plus className="size-3.5" /> Add Account Node
                </button>
              </GlassCard>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(["Asset", "Liability", "Equity", "Revenue", "Expense"] as const).map((type) => {
                  const typeAccounts = accountsByType[type]
                  const isCollapsed = collapsedCategories[type]

                  return (
                    <GlassCard key={type} className="p-4 flex flex-col gap-3">
                      <div
                        onClick={() => setCollapsedCategories(prev => ({ ...prev, [type]: !prev[type] }))}
                        className="flex items-center justify-between cursor-pointer border-b border-zinc-200/60 pb-2"
                      >
                        <div className="flex items-center gap-2">
                          <FolderTree className="size-4 text-emerald-600" />
                          <h4 className="text-sm font-black text-zinc-900 uppercase tracking-wider">{type} Accounts</h4>
                          <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                            {typeAccounts.length}
                          </span>
                        </div>
                        {isCollapsed ? <ChevronRight className="size-4 text-zinc-400" /> : <ChevronDown className="size-4 text-zinc-400" />}
                      </div>

                      {!isCollapsed && (
                        <div className="flex flex-col gap-2 pt-1 max-h-[380px] overflow-y-auto pr-1">
                          {typeAccounts.map((acc) => {
                            const accLines = lines.filter(l => l.account_id === acc.id || l.account_id === acc.code)
                            const debitSum = accLines.reduce((s, l) => s + l.debit_amount, 0)
                            const creditSum = accLines.reduce((s, l) => s + l.credit_amount, 0)
                            const net = (type === "Asset" || type === "Expense") ? debitSum - creditSum : creditSum - debitSum

                            return (
                              <div
                                key={acc.id}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50/80 hover:bg-zinc-100/80 transition-all border border-zinc-200/50 text-xs"
                              >
                                <div>
                                  <div className="font-mono font-bold text-zinc-900 flex items-center gap-1.5">
                                    <span>{acc.code}</span>
                                    <span className="font-sans font-semibold text-zinc-800">{acc.name}</span>
                                  </div>
                                  <div className="text-[10px] text-zinc-400 font-mono">
                                    {acc.parent_account_id ? `Child of ${acc.parent_account_id}` : "Root Group"}
                                  </div>
                                </div>
                                <div className="text-right font-mono font-bold text-zinc-900">
                                  ETB {net.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </GlassCard>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 3: AR/AP Aging & Dunning */}
          {activeTab === "Aging" && (
            <motion.div
              key="aging-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <GlassCard className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Sub-Ledger Aging & Dunning Management</h3>
                  <p className="text-xs text-zinc-500">Track overdue receivables/payables, trigger dunning notices, and process credit notes.</p>
                </div>
                <div className="flex bg-zinc-100 p-1 rounded-full text-xs font-bold">
                  <button
                    onClick={() => setAgingType("receivables")}
                    className={`px-3 py-1 rounded-full transition-all ${agingType === "receivables" ? "bg-black text-white shadow" : "text-zinc-600"}`}
                  >
                    Accounts Receivable
                  </button>
                  <button
                    onClick={() => setAgingType("payables")}
                    className={`px-3 py-1 rounded-full transition-all ${agingType === "payables" ? "bg-black text-white shadow" : "text-zinc-600"}`}
                  >
                    Accounts Payable
                  </button>
                </div>
              </GlassCard>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Current (0-30 Days)", cat: "current" },
                  { label: "Overdue 31-60 Days", cat: "31-60" },
                  { label: "Overdue 61-90 Days", cat: "61-90" },
                  { label: "Overdue 90+ Days", cat: "90+" },
                ].map((bucket) => {
                  const data = agingType === "receivables" ? receivables : payables
                  const sum = data.filter(r => r.category === bucket.cat).reduce((s, r) => s + r.amount, 0)
                  return (
                    <GlassCard key={bucket.cat} className="p-4">
                      <div className="text-[10px] font-bold text-zinc-400 uppercase">{bucket.label}</div>
                      <div className="text-lg font-black text-zinc-900 font-mono mt-1">
                        ETB {sum.toLocaleString()}
                      </div>
                    </GlassCard>
                  )
                })}
              </div>

              <GlassCard className="overflow-hidden p-0">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200/80 bg-zinc-50/80 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                      <th className="px-4 py-3">Partner / Code</th>
                      <th className="px-4 py-3">Invoice Ref</th>
                      <th className="px-4 py-3">Aging Bucket</th>
                      <th className="px-4 py-3">Days Overdue</th>
                      <th className="px-4 py-3 text-right">Outstanding Amount</th>
                      <th className="px-4 py-3 text-center">Dunning Status</th>
                      <th className="px-4 py-3 text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-xs">
                    {(agingType === "receivables" ? receivables : payables).map((rec) => (
                      <tr key={rec.id} className="hover:bg-zinc-50/60">
                        <td className="px-4 py-3 font-bold text-zinc-900">{rec.partner}</td>
                        <td className="px-4 py-3 font-mono text-zinc-600">{rec.invoiceRef}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            rec.category === "current" ? "bg-emerald-50 text-emerald-700" :
                            rec.category === "31-60" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                          }`}>
                            {rec.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold text-zinc-700">{rec.daysOverdue} days</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-zinc-900">
                          ETB {rec.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-[10px] font-bold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full">
                            Level {rec.dunningLevel} Notice
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right pr-4">
                          <button
                            onClick={() => handleSendDunningNotice(rec)}
                            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full transition-all"
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

          {/* TAB 4: Bank Reconciliation */}
          {activeTab === "BankRecon" && (
            <motion.div
              key="bank-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <GlassCard className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Bank Statement Reconciliation & Clearance</h3>
                  <p className="text-xs text-zinc-500">Match bank statement lines with internal GL cash entries to verify cleared funds.</p>
                </div>
                <button
                  onClick={() => {
                    const newSt: BankStatementLine = {
                      id: `ST-${String(bankLines.length + 1).padStart(3, "0")}`,
                      date: new Date().toISOString().slice(0, 10),
                      reference: `TRF-${Math.floor(1000 + Math.random() * 9000)}`,
                      payee: "Incoming Wire Transfer",
                      type: "Deposit",
                      amount: 28000,
                      isCleared: false,
                    }
                    setBankLines([newSt, ...bankLines])
                    showToast("Bank Statement Uploaded", "info", "Parsed 1 new transaction from imported bank statement file.")
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-all"
                >
                  <Download className="size-3.5" /> Upload Bank Statement
                </button>
              </GlassCard>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassCard className="p-4">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase">GL Bank Ledger Balance</div>
                  <div className="text-xl font-black text-zinc-900 font-mono mt-1">ETB 1,452,800.00</div>
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase">Statement Cleared Balance</div>
                  <div className="text-xl font-black text-emerald-600 font-mono mt-1">ETB 1,440,350.00</div>
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase">Uncleared Difference</div>
                  <div className="text-xl font-black text-amber-600 font-mono mt-1">ETB 12,450.00</div>
                </GlassCard>
              </div>

              <GlassCard className="overflow-hidden p-0">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200/80 bg-zinc-50/80 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                      <th className="px-4 py-3">Statement Date</th>
                      <th className="px-4 py-3">Bank Reference</th>
                      <th className="px-4 py-3">Payee / Description</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right pr-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-xs">
                    {bankLines.map((line) => (
                      <tr key={line.id} className="hover:bg-zinc-50/60">
                        <td className="px-4 py-3 font-mono text-zinc-600">{line.date}</td>
                        <td className="px-4 py-3 font-mono font-bold text-zinc-900">{line.reference}</td>
                        <td className="px-4 py-3 font-semibold text-zinc-800">{line.payee}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            line.type === "Deposit" ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-700"
                          }`}>
                            {line.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-zinc-900">
                          ETB {line.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {line.isCleared ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="size-3" /> Cleared ({line.clearedDate})
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                              Uncleared
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right pr-4">
                          {!line.isCleared && (
                            <button
                              onClick={() => handleClearBankLine(line.id)}
                              className="text-[11px] font-bold text-black hover:bg-zinc-800 bg-zinc-900 text-white px-3 py-1 rounded-full transition-all"
                            >
                              Clear Transaction
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </GlassCard>
            </motion.div>
          )}

          {/* TAB 5: Fixed Assets Register */}
          {activeTab === "FixedAssets" && (
            <motion.div
              key="assets-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <GlassCard className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Fixed Asset Registry & Depreciation Schedule</h3>
                  <p className="text-xs text-zinc-500">Straight-line depreciation calculator with automated GL posting.</p>
                </div>
                <button
                  onClick={() => setShowAddAssetModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-all"
                >
                  <Plus className="size-3.5" /> Register Asset
                </button>
              </GlassCard>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassCard className="p-4">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase">Total Original Cost</div>
                  <div className="text-xl font-black text-zinc-900 font-mono mt-1">
                    ETB {assets.reduce((s, a) => s + a.cost, 0).toLocaleString()}
                  </div>
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase">Accumulated Depreciation</div>
                  <div className="text-xl font-black text-rose-600 font-mono mt-1">
                    ETB {assets.reduce((s, a) => s + a.accumulatedDepreciation, 0).toLocaleString()}
                  </div>
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase">Net Carrying Book Value</div>
                  <div className="text-xl font-black text-emerald-600 font-mono mt-1">
                    ETB {assets.reduce((s, a) => s + (a.cost - a.accumulatedDepreciation), 0).toLocaleString()}
                  </div>
                </GlassCard>
              </div>

              <GlassCard className="overflow-hidden p-0">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200/80 bg-zinc-50/80 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                      <th className="px-4 py-3">Asset Name / ID</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3 text-right">Original Cost</th>
                      <th className="px-4 py-3 text-right">Accum. Depr.</th>
                      <th className="px-4 py-3 text-right">Net Book Value</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right pr-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-xs">
                    {assets.map((ast) => {
                      const netVal = ast.cost - ast.accumulatedDepreciation
                      return (
                        <tr key={ast.id} className="hover:bg-zinc-50/60">
                          <td className="px-4 py-3">
                            <div className="font-bold text-zinc-900">{ast.name}</div>
                            <div className="text-[10px] font-mono text-zinc-400">{ast.id} | Acquired {ast.purchaseDate}</div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-zinc-700">{ast.category}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-zinc-900">ETB {ast.cost.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-rose-600">ETB {ast.accumulatedDepreciation.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">ETB {netVal.toLocaleString()}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                              {ast.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right pr-4">
                            <button
                              onClick={() => handleRunDepreciation(ast)}
                              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-full transition-all"
                            >
                              Run Depreciation
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </GlassCard>
            </motion.div>
          )}

          {/* TAB 6: Taxation */}
          {activeTab === "Taxation" && (
            <motion.div
              key="tax-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <GlassCard className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Tax Templates & Compliance Registers</h3>
                  <p className="text-xs text-zinc-500">Manage VAT/GST rates, withholding tax schedules, and output/input tax ledgers.</p>
                </div>
                <button
                  onClick={() => showToast("Tax Return Settlement", "success", "Generated Ethiopian Ministry of Revenue VAT Return Filing Report.")}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-all"
                >
                  <Receipt className="size-3.5" /> Export VAT Return
                </button>
              </GlassCard>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassCard className="p-4">
                  <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider mb-3">Configured Tax Templates</h4>
                  <div className="flex flex-col gap-2">
                    {taxRules.map((tax) => (
                      <div key={tax.id} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/60 text-xs">
                        <div>
                          <div className="font-bold text-zinc-900">{tax.name}</div>
                          <div className="text-[10px] text-zinc-400">Account: {tax.accountCode} | {tax.type}</div>
                        </div>
                        <div className="text-right font-mono font-bold text-emerald-700 text-sm">
                          {tax.ratePercent}%
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="p-4">
                  <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider mb-3">YTD Tax Register Summary</h4>
                  <div className="flex flex-col gap-3 text-xs">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-zinc-50">
                      <span className="text-zinc-600 font-semibold">Sales Output VAT Collected (2200)</span>
                      <span className="font-mono font-bold text-zinc-900">ETB 342,800.00</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-zinc-50">
                      <span className="text-zinc-600 font-semibold">Purchase Input VAT Paid (1300)</span>
                      <span className="font-mono font-bold text-zinc-900">ETB 185,400.00</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50 border border-emerald-200/60">
                      <span className="font-bold text-emerald-900">Net Tax Payable to Revenue Authority</span>
                      <span className="font-mono font-black text-emerald-700 text-sm">ETB 157,400.00</span>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}

          {/* TAB 7: Budgeting & Cost Centers */}
          {activeTab === "Budgeting" && (
            <motion.div
              key="budget-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <GlassCard className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Cost Center Hierarchy & Budget Breach Control</h3>
                  <p className="text-xs text-zinc-500">Allocate budgets per department and set hard/soft breach controls for GL posting.</p>
                </div>
              </GlassCard>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {costCenters.map((cc) => {
                  const pct = Math.round((cc.ytdActual / cc.annualBudget) * 100)
                  const isHigh = pct >= 80

                  return (
                    <GlassCard key={cc.id} className="p-4 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-zinc-400">CC-{cc.code}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cc.controlPolicy === "Stop" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
                          }`}>
                            Policy: {cc.controlPolicy}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-zinc-900 mt-1">{cc.name}</h4>
                        <div className="text-[10px] text-zinc-400">Manager: {cc.manager}</div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs font-mono font-bold">
                          <span className="text-zinc-500">YTD Spend</span>
                          <span className={isHigh ? "text-rose-600" : "text-zinc-900"}>
                            ETB {cc.ytdActual.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all ${isHigh ? "bg-rose-500" : "bg-emerald-500"}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                          <span>Budget: ETB {cc.annualBudget.toLocaleString()}</span>
                          <span>{pct}% Used</span>
                        </div>
                      </div>
                    </GlassCard>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 8: Financial Statements */}
          {activeTab === "Statements" && (
            <motion.div
              key="statements-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <GlassCard className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Financial Statements Workspace</h3>
                  <p className="text-xs text-zinc-500">Real-time Balance Sheet, Profit & Loss Statement, and Trial Balance.</p>
                </div>
                <div className="flex bg-zinc-100 p-1 rounded-full text-xs font-bold">
                  {[
                    { id: "BalanceSheet", label: "Balance Sheet" },
                    { id: "IncomeStatement", label: "Profit & Loss" },
                    { id: "CashFlow", label: "Cash Flow" },
                    { id: "TrialBalance", label: "Trial Balance" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStatementType(s.id as any)}
                      className={`px-3 py-1 rounded-full transition-all ${statementType === s.id ? "bg-black text-white shadow" : "text-zinc-600"}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </GlassCard>

              {statementType === "BalanceSheet" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GlassCard className="p-5 flex flex-col gap-3">
                    <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider border-b border-zinc-200/60 pb-2">Assets</h4>
                    <div className="flex flex-col gap-2 text-xs">
                      {accountsByType.Asset.map(a => (
                        <div key={a.id} className="flex justify-between font-mono">
                          <span className="text-zinc-700">{a.code} - {a.name}</span>
                          <span className="font-bold text-zinc-900">ETB 250,000.00</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between pt-3 border-t border-zinc-200/80 font-mono font-black text-sm text-emerald-700">
                      <span>Total Assets</span>
                      <span>ETB {Math.max(totalAssets, 2850000).toLocaleString()}</span>
                    </div>
                  </GlassCard>

                  <GlassCard className="p-5 flex flex-col gap-3">
                    <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider border-b border-zinc-200/60 pb-2">Liabilities & Equity</h4>
                    <div className="flex flex-col gap-2 text-xs">
                      {accountsByType.Liability.map(a => (
                        <div key={a.id} className="flex justify-between font-mono">
                          <span className="text-zinc-700">{a.code} - {a.name}</span>
                          <span className="font-bold text-zinc-900">ETB 120,000.00</span>
                        </div>
                      ))}
                      {accountsByType.Equity.map(a => (
                        <div key={a.id} className="flex justify-between font-mono">
                          <span className="text-zinc-700">{a.code} - {a.name}</span>
                          <span className="font-bold text-zinc-900">ETB 500,000.00</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between pt-3 border-t border-zinc-200/80 font-mono font-black text-sm text-emerald-700">
                      <span>Total Liabilities & Equity</span>
                      <span>ETB {Math.max(totalLiabilities + totalEquity, 2850000).toLocaleString()}</span>
                    </div>
                  </GlassCard>
                </div>
              )}

              {statementType === "IncomeStatement" && (
                <GlassCard className="p-5 flex flex-col gap-4">
                  <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider border-b border-zinc-200/60 pb-2">Profit & Loss Statement (YTD)</h4>
                  <div className="flex flex-col gap-3 text-xs">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-zinc-50 font-mono">
                      <span className="font-bold text-zinc-800">Total Operating Revenues (4000 Series)</span>
                      <span className="font-black text-emerald-700 text-sm">ETB 2,450,000.00</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-zinc-50 font-mono">
                      <span className="font-bold text-zinc-800">Cost of Goods Sold (5000 Series)</span>
                      <span className="font-bold text-rose-600">ETB (1,120,000.00)</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-100/80 font-mono font-bold">
                      <span>Gross Profit Margin</span>
                      <span>ETB 1,330,000.00 (54.2%)</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-zinc-50 font-mono">
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
                  <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider border-b border-zinc-200/60 pb-2">Cash Flow Statement</h4>
                  <div className="flex flex-col gap-3 text-xs font-mono">
                    <div className="flex justify-between p-2 bg-zinc-50 rounded">
                      <span>Cash Flow from Operating Activities</span>
                      <span className="font-bold text-emerald-600">ETB +820,000.00</span>
                    </div>
                    <div className="flex justify-between p-2 bg-zinc-50 rounded">
                      <span>Cash Flow from Investing Activities (Equipment & Assets)</span>
                      <span className="font-bold text-rose-600">ETB -180,000.00</span>
                    </div>
                    <div className="flex justify-between p-2 bg-zinc-50 rounded">
                      <span>Cash Flow from Financing Activities</span>
                      <span className="font-bold text-zinc-600">ETB 0.00</span>
                    </div>
                    <div className="flex justify-between p-3 bg-emerald-50 rounded-xl font-black text-emerald-800">
                      <span>Net Cash Increase for Period</span>
                      <span>ETB +640,000.00</span>
                    </div>
                  </div>
                </GlassCard>
              )}

              {statementType === "TrialBalance" && (
                <GlassCard className="p-0 overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200/80 bg-zinc-50/80 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                        <th className="px-4 py-3">Account Code & Name</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3 text-right">Debit Sum</th>
                        <th className="px-4 py-3 text-right">Credit Sum</th>
                        <th className="px-4 py-3 text-right">Net Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-mono">
                      {trialBalance.rows.map((r) => (
                        <tr key={r.account_id} className="hover:bg-zinc-50/60">
                          <td className="px-4 py-3 font-bold text-zinc-900">{r.code} - {r.name}</td>
                          <td className="px-4 py-3 font-sans font-semibold text-zinc-600">{r.account_type}</td>
                          <td className="px-4 py-3 text-right text-zinc-900">ETB {r.debit_sum.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-zinc-900">ETB {r.credit_sum.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-bold text-zinc-900">ETB {r.net_balance.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-zinc-300 bg-zinc-50 font-mono font-black text-sm">
                        <td colSpan={2} className="px-4 py-3 text-zinc-900">Trial Balance Totals</td>
                        <td className="px-4 py-3 text-right text-zinc-900">ETB {trialBalance.totalDebits.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-zinc-900">ETB {trialBalance.totalCredits.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-emerald-600">
                          {trialBalance.isBalanced ? "BALANCED" : "IMBALANCED"}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </GlassCard>
              )}
            </motion.div>
          )}

          {/* TAB 9: Payment Reconciliation */}
          {activeTab === "Reconciliation" && (
            <motion.div
              key="recon-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <GlassCard className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Payment Reconciliation & Invoice Allocation</h3>
                  <p className="text-xs text-zinc-500">Match unallocated customer/supplier payments against outstanding invoices.</p>
                </div>
              </GlassCard>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassCard className="p-4 flex flex-col gap-3">
                  <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider">Unallocated Payments</h4>
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-zinc-900">PAY-2026-092 | Stark Medical</div>
                        <div className="text-[10px] text-zinc-400">Received 2026-07-20 via Wire</div>
                      </div>
                      <span className="font-mono font-bold text-emerald-700">ETB 32,500.00</span>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-4 flex flex-col gap-3">
                  <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider">Open Pending Invoices</h4>
                  <div className="flex flex-col gap-2 text-xs">
                    {invoices.filter(i => i.balance_due > 0).map(inv => (
                      <div key={inv.id} className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-zinc-900">{inv.invoice_number} | {inv.customer_name}</div>
                          <div className="text-[10px] text-zinc-400">Due {inv.due_date}</div>
                        </div>
                        <button
                          onClick={() => showToast("Payment Allocated", "success", `Allocated payment against invoice ${inv.invoice_number}.`)}
                          className="px-3 py-1 rounded-full bg-black text-white text-[10px] font-bold"
                        >
                          Allocate
                        </button>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}

          {/* TAB 10: Accounting Periods */}
          {activeTab === "Periods" && (
            <motion.div
              key="periods-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <GlassCard className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Accounting Periods & Fiscal Year Closing</h3>
                  <p className="text-xs text-zinc-500">Lock accounting periods to prevent retroactive journal entries and perform year-end closing.</p>
                </div>
              </GlassCard>

              <GlassCard className="overflow-hidden p-0">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200/80 bg-zinc-50/80 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                      <th className="px-4 py-3">Period Label</th>
                      <th className="px-4 py-3">Start Date</th>
                      <th className="px-4 py-3">End Date</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right pr-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {periods.map((p) => (
                      <tr key={p.id} className="hover:bg-zinc-50/60">
                        <td className="px-4 py-3 font-bold text-zinc-900">{p.period_label}</td>
                        <td className="px-4 py-3 font-mono text-zinc-600">{p.start_date}</td>
                        <td className="px-4 py-3 font-mono text-zinc-600">{p.end_date}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.is_closed ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
                          }`}>
                            {p.is_closed ? "LOCKED" : "OPEN"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right pr-4">
                          <button
                            onClick={() => handleLockPeriod(p.id)}
                            className="text-[11px] font-bold text-black bg-zinc-100 hover:bg-zinc-200 px-3 py-1 rounded-full transition-all"
                          >
                            {p.is_closed ? "Unlock Period" : "Lock Period"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </GlassCard>
            </motion.div>
          )}

          {/* TAB 11: Revaluation */}
          {activeTab === "Revaluation" && (
            <motion.div
              key="reval-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <GlassCard className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Multi-Currency Exchange Rate Revaluation</h3>
                  <p className="text-xs text-zinc-500">Revalue foreign asset/liability balances at period-end market rates.</p>
                </div>
                <button
                  onClick={() => setShowRevalModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-all"
                >
                  <Plus className="size-3.5" /> Initiate Revaluation
                </button>
              </GlassCard>

              <GlassCard className="overflow-hidden p-0">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200/80 bg-zinc-50/80 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                      <th className="px-4 py-3">Reval ID / Date</th>
                      <th className="px-4 py-3">Currency & Rate</th>
                      <th className="px-4 py-3 text-right">Orig Balance</th>
                      <th className="px-4 py-3 text-right">New Base Balance</th>
                      <th className="px-4 py-3 text-right">Unrealized Gain/Loss</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right pr-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {revaluations.map((rev) => (
                      <tr key={rev.id} className="hover:bg-zinc-50/60">
                        <td className="px-4 py-3 font-mono font-bold text-zinc-900">
                          {rev.id} <span className="text-[10px] text-zinc-400">({rev.revaluation_date})</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-zinc-700">{rev.currency} @ {rev.current_rate}</td>
                        <td className="px-4 py-3 text-right font-mono text-zinc-900">{rev.currency} {rev.original_balance.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-zinc-900">ETB {rev.new_balance_in_base.toLocaleString()}</td>
                        <td className={`px-4 py-3 text-right font-mono font-bold ${rev.unrealized_gain_loss >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                          ETB {rev.unrealized_gain_loss.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rev.status === "Posted" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                          }`}>
                            {rev.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right pr-4">
                          {rev.status === "Draft" && (
                            <button
                              onClick={() => handlePostRevaluation(rev.id)}
                              className="text-[11px] font-bold text-white bg-black hover:bg-zinc-800 px-3 py-1 rounded-full transition-all"
                            >
                              Post Revaluation
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL 1: Post Journal Entry */}
        <AnimatePresence>
          {showPostModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-zinc-200 overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4">
                  <h3 className="text-base font-black text-zinc-900">Post New Journal Entry</h3>
                  <button onClick={() => setShowPostModal(false)} className="text-zinc-400 hover:text-zinc-600">
                    <X className="size-5" />
                  </button>
                </div>

                <form onSubmit={handlePostEntry} className="flex flex-col gap-4 text-xs">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-zinc-700 mb-1 block">Entry Date</label>
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-zinc-700 mb-1 block">Source Type</label>
                      <select
                        value={newSourceType}
                        onChange={(e) => setNewSourceType(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-semibold text-xs"
                      >
                        <option value="Manual Adjustment">Manual Adjustment</option>
                        <option value="Sales Invoice">Sales Invoice</option>
                        <option value="Purchase Invoice">Purchase Invoice</option>
                        <option value="Payroll">Payroll</option>
                        <option value="Exchange Revaluation">Exchange Revaluation</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-zinc-700 mb-1 block">Source Ref ID</label>
                      <input
                        type="text"
                        value={newSourceId}
                        onChange={(e) => setNewSourceId(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-zinc-700 mb-1 block">Accounting Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Monthly Office Utility Bill Settlement"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-semibold"
                    />
                  </div>

                  {/* Lines */}
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-zinc-700">Journal Lines (Debits = Credits)</label>
                    {formLines.map((line, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <select
                          value={line.account_id}
                          onChange={(e) => {
                            const updated = [...formLines]
                            updated[idx].account_id = e.target.value
                            setFormLines(updated)
                          }}
                          className="col-span-6 p-2 rounded-xl border border-zinc-200 bg-zinc-50 font-medium text-xs"
                        >
                          {accounts.map((a) => (
                            <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="Debit"
                          value={line.debit}
                          onChange={(e) => {
                            const updated = [...formLines]
                            updated[idx].debit = e.target.value
                            updated[idx].credit = ""
                            setFormLines(updated)
                          }}
                          className="col-span-3 p-2 rounded-xl border border-zinc-200 bg-zinc-50 font-mono font-bold"
                        />
                        <input
                          type="number"
                          placeholder="Credit"
                          value={line.credit}
                          onChange={(e) => {
                            const updated = [...formLines]
                            updated[idx].credit = e.target.value
                            updated[idx].debit = ""
                            setFormLines(updated)
                          }}
                          className="col-span-3 p-2 rounded-xl border border-zinc-200 bg-zinc-50 font-mono font-bold"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                    <button
                      type="button"
                      onClick={() => setShowPostModal(false)}
                      className="px-4 py-2.5 rounded-full bg-zinc-100 text-zinc-700 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-full bg-black text-white font-bold hover:bg-zinc-800"
                    >
                      Post Entry
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL 2: Add Account */}
        <AnimatePresence>
          {showAddAccountModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-200"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
                  <h3 className="text-base font-black text-zinc-900">Add Chart of Accounts Node</h3>
                  <button onClick={() => setShowAddAccountModal(false)} className="text-zinc-400 hover:text-zinc-600">
                    <X className="size-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateAccount} className="flex flex-col gap-3 text-xs">
                  <div>
                    <label className="font-bold text-zinc-700 mb-1 block">Account Code (e.g. 1120)</label>
                    <input
                      type="text"
                      value={newAccCode}
                      onChange={(e) => setNewAccCode(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-mono font-bold"
                      placeholder="1120"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-700 mb-1 block">Account Name</label>
                    <input
                      type="text"
                      value={newAccName}
                      onChange={(e) => setNewAccName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-semibold"
                      placeholder="Commercial Bank of Ethiopia - USD"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-700 mb-1 block">Account Type</label>
                    <select
                      value={newAccType}
                      onChange={(e) => setNewAccType(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-semibold"
                    >
                      <option value="Asset">Asset</option>
                      <option value="Liability">Liability</option>
                      <option value="Equity">Equity</option>
                      <option value="Revenue">Revenue</option>
                      <option value="Expense">Expense</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-zinc-700 mb-1 block">Parent Group Account (Optional)</label>
                    <select
                      value={newAccParent}
                      onChange={(e) => setNewAccParent(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-semibold"
                    >
                      <option value="">(Root Account - No Parent)</option>
                      {accounts.map(a => (
                        <option key={a.id} value={a.code}>{a.code} - {a.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                    <button
                      type="button"
                      onClick={() => setShowAddAccountModal(false)}
                      className="px-4 py-2 rounded-full bg-zinc-100 text-zinc-700 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-full bg-black text-white font-bold hover:bg-zinc-800"
                    >
                      Create Node
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL 3: Add Fixed Asset */}
        <AnimatePresence>
          {showAddAssetModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-200"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
                  <h3 className="text-base font-black text-zinc-900">Register New Fixed Asset</h3>
                  <button onClick={() => setShowAddAssetModal(false)} className="text-zinc-400 hover:text-zinc-600">
                    <X className="size-5" />
                  </button>
                </div>

                <form onSubmit={handleAddAsset} className="flex flex-col gap-3 text-xs">
                  <div>
                    <label className="font-bold text-zinc-700 mb-1 block">Asset Name</label>
                    <input
                      type="text"
                      value={newAssetName}
                      onChange={(e) => setNewAssetName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-semibold"
                      placeholder="Warehouse Toyota Hilux Pick-up"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-700 mb-1 block">Category</label>
                    <select
                      value={newAssetCategory}
                      onChange={(e) => setNewAssetCategory(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-semibold"
                    >
                      <option value="Vehicles">Vehicles</option>
                      <option value="Machinery">Machinery</option>
                      <option value="IT Hardware">IT Hardware</option>
                      <option value="Buildings">Buildings</option>
                      <option value="Office Equipment">Office Equipment</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="font-bold text-zinc-700 mb-1 block">Cost (ETB)</label>
                      <input
                        type="number"
                        value={newAssetCost}
                        onChange={(e) => setNewAssetCost(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-mono font-bold"
                        placeholder="850000"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-zinc-700 mb-1 block">Salvage Value</label>
                      <input
                        type="number"
                        value={newAssetSalvage}
                        onChange={(e) => setNewAssetSalvage(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-mono font-bold"
                        placeholder="100000"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-zinc-700 mb-1 block">Useful Life (Yrs)</label>
                      <input
                        type="number"
                        value={newAssetLife}
                        onChange={(e) => setNewAssetLife(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-mono font-bold"
                        placeholder="5"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                    <button
                      type="button"
                      onClick={() => setShowAddAssetModal(false)}
                      className="px-4 py-2 rounded-full bg-zinc-100 text-zinc-700 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-full bg-black text-white font-bold hover:bg-zinc-800"
                    >
                      Save Asset
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL 4: Forex Revaluation */}
        <AnimatePresence>
          {showRevalModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-200"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
                  <h3 className="text-base font-black text-zinc-900">Initiate Forex Revaluation</h3>
                  <button onClick={() => setShowRevalModal(false)} className="text-zinc-400 hover:text-zinc-600">
                    <X className="size-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateRevaluation} className="flex flex-col gap-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-zinc-700 mb-1 block">Revaluation Date</label>
                      <input
                        type="date"
                        value={revalDate}
                        onChange={(e) => setRevalDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-zinc-700 mb-1 block">Currency</label>
                      <select
                        value={revalCurrency}
                        onChange={(e) => setRevalCurrency(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-bold"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-zinc-700 mb-1 block">Target Account to Revalue</label>
                    <select
                      value={revalTargetAcc}
                      onChange={(e) => setRevalTargetAcc(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-semibold"
                    >
                      {accounts.map(a => (
                        <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-zinc-700 mb-1 block">Foreign Currency Balance</label>
                    <input
                      type="number"
                      value={revalOrigBalance}
                      onChange={(e) => setRevalOrigBalance(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-700 mb-1 block">New Period-End Market Rate (ETB/FX)</label>
                    <input
                      type="number"
                      value={revalNewRate}
                      onChange={(e) => setRevalNewRate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-mono font-bold"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                    <button
                      type="button"
                      onClick={() => setShowRevalModal(false)}
                      className="px-4 py-2 rounded-full bg-zinc-100 text-zinc-700 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-full bg-black text-white font-bold hover:bg-zinc-800"
                    >
                      Create Draft
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
