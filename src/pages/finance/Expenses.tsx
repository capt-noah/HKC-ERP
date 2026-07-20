import { motion } from "framer-motion"
import { Plus, Search, Landmark, CreditCard, Clock, Check, X, ShieldAlert } from "lucide-react"
import { FloatingNav } from "@/components/FloatingNav"
import { GlassCard } from "@/components/GlassCard"
import { SubPageNav } from "@/components/SubPageNav"
import { navSections, getSectionChildren } from "@/lib/nav-config"
import { useState } from "react"

const fade = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

const initialExpenses = [
  { id: "EXP-8012", merchant: "Amazon Web Services", category: "Infrastructure", date: "Jul 05, 2026", employee: "Alex Mercer", amount: "ETB 12,450.00", status: "APPROVED", statusBg: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
  { id: "EXP-8011", merchant: "Delta Air Lines", category: "Travel & Lodging", date: "Jul 04, 2026", employee: "Marcus Vance", amount: "ETB 1,850.50", status: "PENDING", statusBg: "bg-zinc-100 text-zinc-700 border border-zinc-200" },
  { id: "EXP-8010", merchant: "Salesforce CRM", category: "Software & SaaS", date: "Jun 30, 2026", employee: "Sophia Chen", amount: "ETB 4,200.00", status: "APPROVED", statusBg: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
  { id: "EXP-8009", merchant: "The Steakhouse Tavern", category: "Meals & Entertaining", date: "Jun 28, 2026", employee: "Sophia Chen", amount: "ETB 840.00", status: "REJECTED", statusBg: "bg-red-100 text-red-700 border border-red-200" },
]

export default function Expenses() {
  const [expenses, setExpenses] = useState(initialExpenses)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("ALL")
  const [filterStatus, setFilterStatus] = useState("ALL")

  // Form State for new expense
  const [merchant, setMerchant] = useState("")
  const [category, setCategory] = useState("Software & SaaS")
  const [employee, setEmployee] = useState("")
  const [amount, setAmount] = useState("")
  const [showForm, setShowForm] = useState(false)

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault()
    if (!merchant || !amount || !employee) return

    const newExp = {
      id: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
      merchant,
      category,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      employee,
      amount: amount.startsWith("ETB ") ? amount : `ETB ${parseFloat(amount).toFixed(2)}`,
      status: "PENDING",
      statusBg: "bg-zinc-100 text-zinc-700 border border-zinc-200",
    }

    setExpenses([newExp, ...expenses])
    setMerchant("")
    setEmployee("")
    setAmount("")
    setShowForm(false)
  }

  const handleApprove = (id: string) => {
    setExpenses(
      expenses.map((exp) =>
        exp.id === id
          ? { ...exp, status: "APPROVED", statusBg: "bg-emerald-100 text-emerald-700 border border-emerald-200" }
          : exp
      )
    )
  }

  const handleReject = (id: string) => {
    setExpenses(
      expenses.map((exp) =>
        exp.id === id
          ? { ...exp, status: "REJECTED", statusBg: "bg-red-100 text-red-700 border border-red-200" }
          : exp
      )
    )
  }

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === "ALL" || exp.category === filterCategory
    const matchesStatus = filterStatus === "ALL" || exp.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Calculate stats dynamically
  const totalApproved = expenses
    .filter((e) => e.status === "APPROVED")
    .reduce((sum, e) => sum + parseFloat(e.amount.replace(/[^0-9.]/g, "")), 0)

  const totalPending = expenses
    .filter((e) => e.status === "PENDING")
    .reduce((sum, e) => sum + parseFloat(e.amount.replace(/[^0-9.]/g, "")), 0)

  return (
    <div className="min-h-screen page-gradient">
      <FloatingNav brand="HKC Trading ERP" sections={navSections} />

      <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-[98%] mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <motion.div variants={fade} className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight">Business Expenses</h1>
            <p className="text-sm text-gray-400 mt-1">Audit employee expense claims and corporate card expenses.</p>
          </div>
          <div className="flex items-center gap-3">
            <SubPageNav items={getSectionChildren("/finance")} />
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-zinc-800 shadow-lg shadow-black/10 transition-all"
            >
              <Plus className="size-4" /> {showForm ? "Close Form" : "Log Expense"}
            </button>
          </div>
        </motion.div>

        {/* Expense KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Approved Spend (Mtd)", value: `ETB ${totalApproved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, desc: "Deducted from budget", Icon: CreditCard, bg: "bg-emerald-100 text-emerald-600" },
            { label: "Awaiting Approval", value: `ETB ${totalPending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, desc: `${expenses.filter((e) => e.status === "PENDING").length} claims pending`, Icon: Clock, bg: "bg-green-100 text-green-700" },
            { label: "Monthly Budget Limit", value: "ETB 150,000.00", desc: "74.8% Remaining", Icon: Landmark, bg: "bg-black/5 text-gray-600" },
            { label: "Out of Policy Claims", value: "1 Claim", desc: "Requires special review", Icon: ShieldAlert, bg: "bg-red-50 text-red-600" },
          ].map((stat, idx) => {
            const Icon = stat.Icon
            return (
              <GlassCard key={stat.label} className="flex items-center justify-between" transition={{ delay: 0.04 * idx, duration: 0.4, ease: "easeOut" }}>
                <div>
                  <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-black text-black mt-1 mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.desc}</p>
                </div>
                <div className={`size-12 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                  <Icon className="size-6" />
                </div>
              </GlassCard>
            )
          })}
        </div>

        {/* Split Section: Form and List */}
        <div className="grid grid-cols-1 gap-4">
          {/* Add Expense Form Collapse */}
          {showForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
              <GlassCard className="p-6 border border-green-300/40 bg-green-50/[0.15]">
                <h3 className="text-base font-bold text-black mb-4">Add Corporate Card or Employee Claim</h3>
                <form onSubmit={handleAddExpense} className="grid grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Merchant/Vendor</label>
                    <input
                      type="text"
                      value={merchant}
                      onChange={(e) => setMerchant(e.target.value)}
                      placeholder="e.g. AWS, Delta Air"
                      className="w-full bg-white/50 border border-black/10 rounded-xl px-3 py-2 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Claimant Employee</label>
                    <input
                      type="text"
                      value={employee}
                      onChange={(e) => setEmployee(e.target.value)}
                      placeholder="e.g. Sophia Chen"
                      className="w-full bg-white/50 border border-black/10 rounded-xl px-3 py-2 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Cost Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white/50 border border-black/10 rounded-xl px-3 py-2 text-sm text-black focus:outline-none focus:border-black cursor-pointer"
                    >
                      <option value="Software & SaaS">Software & SaaS</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Travel & Lodging">Travel & Lodging</option>
                      <option value="Meals & Entertaining">Meals & Entertaining</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Amount (ETB)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="e.g. 150.00"
                        className="w-full bg-white/50 border border-black/10 rounded-xl px-3 py-2 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black"
                        required
                      />
                    </div>
                    <button type="submit" className="px-5 py-2.5 bg-[#242427] hover:bg-black text-white text-xs font-bold rounded-xl transition-all self-end h-[38px]">
                      Submit
                    </button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          )}

          {/* Main Expense Table Card */}
          <GlassCard transition={{ delay: 0.12, duration: 0.4, ease: "easeOut" }} className="flex flex-col">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
              <div>
                <h3 className="font-semibold text-base text-black">Audit Expenses</h3>
                <p className="text-xs text-gray-400">All claims requiring active corporate treasury oversight.</p>
              </div>

              {/* Filtering Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-black/[0.04] rounded-2xl px-3 py-2">
                  <Search className="size-4 text-gray-400 shrink-0" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-xs text-black placeholder:text-gray-400 outline-none w-44"
                    placeholder="Search merchant, employee..."
                  />
                </div>

                <div className="flex items-center gap-1">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-black/[0.03] text-xs font-bold px-3 py-2 rounded-xl text-gray-700 outline-none border border-transparent hover:border-black/5 cursor-pointer"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Travel & Lodging">Travel & Lodging</option>
                    <option value="Software & SaaS">Software & SaaS</option>
                    <option value="Meals & Entertaining">Meals</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-black/[0.03] text-xs font-bold px-3 py-2 rounded-xl text-gray-700 outline-none border border-transparent hover:border-black/5 cursor-pointer"
                  >
                    <option value="ALL">All Status</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PENDING">Pending</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Expense Table List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                    <th className="pb-3 pl-2">ID</th>
                    <th className="pb-3">Merchant/Vendor</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Claimant</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 text-center">Audit Status</th>
                    <th className="pb-3 text-right pr-4">Treasury Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                        No expense entries match your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="text-sm hover:bg-black/[0.01]">
                        <td className="py-3.5 pl-2 font-mono text-xs font-bold text-gray-500">{exp.id}</td>
                        <td className="py-3.5 font-bold text-black">{exp.merchant}</td>
                        <td className="py-3.5 text-xs text-gray-500">
                          <span className="bg-black/[0.03] text-gray-700 px-2 py-0.5 rounded font-medium">{exp.category}</span>
                        </td>
                        <td className="py-3.5 text-gray-600 font-medium">{exp.employee}</td>
                        <td className="py-3.5 text-xs text-gray-400">{exp.date}</td>
                        <td className="py-3.5 text-right font-black text-black">{exp.amount}</td>
                        <td className="py-3.5 text-center">
                          <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${exp.statusBg}`}>
                            {exp.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right pr-4">
                          {exp.status === "PENDING" ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleApprove(exp.id)}
                                className="size-8 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                                title="Approve Claim"
                              >
                                <Check className="size-4" />
                              </button>
                              <button
                                onClick={() => handleReject(exp.id)}
                                className="size-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
                                title="Reject Claim"
                              >
                                <X className="size-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Audited</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </motion.div>
    </div>
  )
}
