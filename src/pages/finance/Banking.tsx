import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Landmark,
  ArrowRightLeft,
  CheckCircle2,
  Download
} from "lucide-react"
import { FloatingNav } from "@/components/FloatingNav"
import { GlassCard } from "@/components/GlassCard"
import { SubPageNav } from "@/components/SubPageNav"
import { navSections, getSectionChildren } from "@/lib/nav-config"
import { useFeedback } from "@/context/FeedbackContext"
import { useFinanceStore } from "@/lib/financeStore"

const fade = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }
const stagger = { visible: { transition: { staggerChildren: 0.05 } } }

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

const initialBankLines: BankStatementLine[] = [
  { id: "ST-001", date: "2026-07-18", reference: "DEP-9082", payee: "Stark Medical Supplies", type: "Deposit", amount: 32500, isCleared: true, clearedDate: "2026-07-19" },
  { id: "ST-002", date: "2026-07-19", reference: "CHK-4412", payee: "Ethio Chemicals Corp", type: "Withdrawal", amount: 45000, isCleared: true, clearedDate: "2026-07-19" },
  { id: "ST-003", date: "2026-07-20", reference: "TRF-8821", payee: "Apex Healthcare Ltd", type: "Deposit", amount: 12000, isCleared: false },
  { id: "ST-004", date: "2026-07-21", reference: "WTH-1029", payee: "Office Rent - Commercial Tower", type: "Withdrawal", amount: 25000, isCleared: false },
  { id: "ST-005", date: "2026-07-22", reference: "DEP-3310", payee: "Lifeline Clinics", type: "Deposit", amount: 18350, isCleared: false },
]

export default function Banking() {
  const { showToast } = useFeedback()
  const store = useFinanceStore()

  const [activeTab, setActiveTab] = useState<"BankRecon" | "Reconciliation">("BankRecon")
  const [bankLines, setBankLines] = useState<BankStatementLine[]>(initialBankLines)

  const invoices = store.getInvoices()

  const handleClearBankLine = (id: string) => {
    setBankLines((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, isCleared: true, clearedDate: new Date().toISOString().slice(0, 10) } : b
      )
    )
    showToast("Transaction Cleared", "success", "Bank statement line successfully matched and cleared against general ledger.")
  }

  const handleUploadBankStatement = () => {
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
        {/* Header */}
        <motion.div variants={fade} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight">Banking & Treasury Management</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Reconcile bank statement lines, match incoming customer payments, and track cleared treasury funds.
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
              { id: "BankRecon", label: "Bank Reconciliation", icon: Landmark },
              { id: "Reconciliation", label: "Payment & Account Allocation", icon: ArrowRightLeft },
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
                      layoutId="banking-tabs"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-4">
            <button
              onClick={handleUploadBankStatement}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-black text-white hover:bg-zinc-800 px-3.5 py-1.5 rounded-full shadow-xs transition-all"
            >
              <Download className="size-3.5" /> Upload Bank Statement
            </button>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "BankRecon" && (
            <motion.div
              key="bank-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <GlassCard className="p-4 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Bank Statement Reconciliation & Clearance</h3>
                  <p className="text-xs text-zinc-500">Match electronic bank statement entries with internal general ledger cash records.</p>
                </div>
              </GlassCard>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassCard className="p-4">
                  <div className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">GL Cash Ledger Balance</div>
                  <div className="text-xl font-black text-zinc-900 font-mono mt-1">ETB 1,452,800.00</div>
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Statement Cleared Balance</div>
                  <div className="text-xl font-black text-emerald-600 font-mono mt-1">ETB 1,440,350.00</div>
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Uncleared Difference</div>
                  <div className="text-xl font-black text-amber-600 font-mono mt-1">ETB 12,450.00</div>
                </GlassCard>
              </div>

              {/* Table */}
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
                      <tr key={line.id} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="px-4 py-3 font-mono text-zinc-600">{line.date}</td>
                        <td className="px-4 py-3 font-mono font-bold text-zinc-900">{line.reference}</td>
                        <td className="px-4 py-3 font-semibold text-zinc-800">{line.payee}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            line.type === "Deposit" ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-700"
                          }`}>
                            {line.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-zinc-900">
                          ETB {line.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {line.isCleared ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 className="size-3" /> Cleared ({line.clearedDate})
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                              Uncleared
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right pr-4">
                          {!line.isCleared && (
                            <button
                              onClick={() => handleClearBankLine(line.id)}
                              className="text-[11px] font-bold text-white bg-black hover:bg-zinc-800 px-3 py-1 rounded-full transition-all"
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
                  <p className="text-xs text-zinc-500">Match unallocated customer deposits and vendor prepayments against open invoices.</p>
                </div>
              </GlassCard>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassCard className="p-4 flex flex-col gap-3">
                  <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider">Unallocated Receipts</h4>
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="p-3 bg-zinc-50/80 rounded-xl border border-zinc-200/60 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-zinc-900">PAY-2026-092 | Stark Medical</div>
                        <div className="text-[10px] text-zinc-400">Received 2026-07-20 via Wire Transfer</div>
                      </div>
                      <span className="font-mono font-bold text-emerald-700">ETB 32,500.00</span>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-4 flex flex-col gap-3">
                  <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider">Open Outstanding Invoices</h4>
                  <div className="flex flex-col gap-2 text-xs max-h-[350px] overflow-y-auto">
                    {invoices.filter((i) => i.balance_due > 0).map((inv) => (
                      <div key={inv.id} className="p-3 bg-zinc-50/80 rounded-xl border border-zinc-200/60 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-zinc-900">{inv.invoice_number} | {inv.customer_name}</div>
                          <div className="text-[10px] text-zinc-400">Due {inv.due_date} • Balance: ETB {inv.balance_due.toLocaleString()}</div>
                        </div>
                        <button
                          onClick={() => showToast("Payment Allocated", "success", `Allocated receipt against invoice ${inv.invoice_number}.`)}
                          className="px-3 py-1 rounded-full bg-black text-white text-[10px] font-bold hover:bg-zinc-800 transition-all"
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
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
