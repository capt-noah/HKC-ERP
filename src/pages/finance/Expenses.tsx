import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  Search, 
  Check, 
  X, 
  Truck, 
  RotateCw, 
  Wrench, 
  ChevronDown, 
  ChevronRight,
  Play
} from "lucide-react"
import { FloatingNav } from "@/components/FloatingNav"
import { GlassCard } from "@/components/GlassCard"
import { SubPageNav } from "@/components/SubPageNav"
import { navSections, getSectionChildren } from "@/lib/nav-config"
import { useFeedback } from "@/context/FeedbackContext"
import { useFinanceStore } from "@/lib/financeStore"
import type { Vehicle } from "@/lib/financeStore"

const fade = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

export default function Expenses() {
  const { showToast } = useFeedback()
  const store = useFinanceStore()

  const [activeTab, setActiveTab] = useState<"one-off" | "recurring" | "vehicles">("one-off")

  // One-off Expenses state
  const expenses = store.getOneOffExpenses()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("ALL")
  const [filterStatus, setFilterStatus] = useState("ALL")

  // Log One-off expense form state
  const [merchant, setMerchant] = useState("")
  const [category, setCategory] = useState("Software & SaaS")
  const [costCenter, setCostCenter] = useState("CC-100 Corporate HQ")
  const [glAccount, setGlAccount] = useState("5200")
  const [employee, setEmployee] = useState("")
  const [amount, setAmount] = useState("")
  const [taxAmount, setTaxAmount] = useState("0")
  const [voucherRef, setVoucherRef] = useState("")
  const [showForm, setShowForm] = useState(false)

  // Recurring Schedule Creation Modal
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false)
  const [schExpenseType, setSchExpenseType] = useState<any>("Software & SaaS")
  const [schAmount, setSchAmount] = useState("")
  const [schFrequency, setSchFrequency] = useState<"Monthly" | "Quarterly" | "Annually">("Monthly")
  const [schDueDate, setSchDueDate] = useState("2026-08-01")
  const [schResource, setSchResource] = useState("")
  const [schCostCenter, setSchCostCenter] = useState("CC-100 Corporate HQ")

  // Vehicles expanded history
  const [expandedVehicles, setExpandedVehicles] = useState<{ [id: string]: boolean }>({})

  // Log Maintenance modal state
  const [selectedVehicleForMaint, setSelectedVehicleForMaint] = useState<Vehicle | null>(null)
  const [maintDesc, setMaintDesc] = useState("")
  const [maintAmount, setMaintAmount] = useState("")

  // Calculate Executive Summary Metrics
  const totalApproved = expenses.filter((e) => e.status === "APPROVED").reduce((s, e) => s + e.amount, 0)
  const pendingCount = expenses.filter((e) => e.status === "PENDING").length
  const pendingValue = expenses.filter((e) => e.status === "PENDING").reduce((s, e) => s + e.amount, 0)
  const recurringMonthly = store.getRecurringSchedules().filter((s) => s.status === "Active").reduce((s, e) => s + e.amount, 0)
  const totalFleetCost = store.getVehicles().reduce((s, v) => s + v.maintenance_cost_history.reduce((ms, m) => ms + m.amount, 0), 0)

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault()
    if (!merchant || !amount || !employee) return

    const amtVal = parseFloat(amount)
    const taxVal = parseFloat(taxAmount) || 0

    store.addOneOffExpense({
      merchant,
      category,
      cost_center: costCenter,
      gl_account_id: glAccount,
      date: new Date().toISOString().split("T")[0],
      employee,
      amount: amtVal,
      tax_amount: taxVal,
      currency: "ETB",
      receipt_ref: voucherRef || `VOUCH-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "PENDING",
    })

    setMerchant("")
    setEmployee("")
    setAmount("")
    setTaxAmount("0")
    setVoucherRef("")
    setShowForm(false)
    showToast("Expense Submitted", "info", `Claim for ${merchant} (${costCenter}) submitted for treasury audit.`)
  }

  const handleAddScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(schAmount)
    if (isNaN(amt) || amt <= 0) return

    store.addRecurringSchedule({
      expense_type: schExpenseType,
      amount: amt,
      currency: "ETB",
      frequency: schFrequency,
      next_due_date: schDueDate,
      linked_resource_id: schResource || "General Overhead",
      cost_center: schCostCenter,
      auto_generate: true,
      status: "Active",
    })

    setShowAddScheduleModal(false)
    setSchAmount("")
    setSchResource("")
    showToast("Schedule Created", "success", `Recurring schedule for ${schExpenseType} created!`)
  }

  const handleApprove = (id: string) => {
    store.approveOneOffExpense(id)
    showToast("Claim Approved", "success", `Expense claim ${id} approved & posted to General Ledger.`)
  }

  const handleReject = (id: string) => {
    store.rejectOneOffExpense(id)
    showToast("Claim Rejected", "warning", `Expense claim ${id} marked rejected.`)
  }

  // Generate due recurring expenses simulation button
  const handleGenerateDueExpenses = () => {
    const generatedCount = store.generateDueExpenses()
    if (generatedCount > 0) {
      showToast(
        "Due Expenses Generated",
        "success",
        `Created ${generatedCount} pending expense claims from active recurring schedules requiring manager approval.`
      )
    } else {
      showToast("No Schedules Due", "info", "All active recurring expense schedules are current.")
    }
  }

  const toggleVehicleExpand = (id: string) => {
    setExpandedVehicles((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleAddMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVehicleForMaint || !maintDesc || !maintAmount) return

    store.addVehicleMaintenance(selectedVehicleForMaint.id, {
      date: new Date().toISOString().split("T")[0],
      description: maintDesc,
      amount: parseFloat(maintAmount),
    })

    setSelectedVehicleForMaint(null)
    setMaintDesc("")
    setMaintAmount("")
    showToast("Maintenance Logged", "success", `Logged service history for ${selectedVehicleForMaint.registration_number}.`)
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

  const recurringSchedules = store.getRecurringSchedules()
  const vehicles = store.getVehicles()

  return (
    <div className="min-h-screen page-gradient">
      <FloatingNav brand="HKC Trading ERP" sections={navSections} />

      <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-[98%] mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <motion.div variants={fade} className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight">Resources & Overhead Expenses</h1>
            <p className="text-sm text-gray-400 mt-1">Manage corporate claims, cost centers, recurring lease schedules, and fleet vehicle maintenance.</p>
          </div>
          <div className="flex items-center gap-3">
            <SubPageNav items={getSectionChildren("/finance")} />
            {activeTab === "one-off" && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-zinc-800 shadow-lg shadow-black/10 transition-all h-[38px]"
              >
                <Plus className="size-4" /> {showForm ? "Close Form" : "Log Expense Claim"}
              </button>
            )}
            {activeTab === "recurring" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddScheduleModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-all h-[38px]"
                >
                  <Plus className="size-3.5" /> Add Schedule
                </button>
                <button
                  onClick={handleGenerateDueExpenses}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 shadow-lg shadow-emerald-700/20 transition-all h-[38px]"
                >
                  <Play className="size-3.5" /> Generate Due Expenses
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Expenses Executive Summary KPI Banner */}
        <motion.div variants={fade} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <GlassCard className="p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Approved Expenses YTD</span>
            <p className="text-xl font-black text-black font-mono mt-1">
              ETB {totalApproved.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1">GL Journal Entries Posted</span>
          </GlassCard>

          <GlassCard className="p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Claims Audit</span>
            <p className="text-xl font-black text-amber-600 font-mono mt-1">
              {pendingCount} claims <span className="text-xs font-normal text-gray-500">(ETB {pendingValue.toLocaleString()})</span>
            </p>
            <span className="text-[10px] text-amber-600 font-semibold mt-1">Awaiting Treasury Manager Approval</span>
          </GlassCard>

          <GlassCard className="p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Recurring Monthly Commitment</span>
            <p className="text-xl font-black text-black font-mono mt-1">
              ETB {recurringMonthly.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <span className="text-[10px] text-gray-400 mt-1">Rent, Software & Retainers</span>
          </GlassCard>

          <GlassCard className="p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fleet Service History Total</span>
            <p className="text-xl font-black text-black font-mono mt-1">
              ETB {totalFleetCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <span className="text-[10px] text-gray-400 mt-1">Logistics & Repairs (ACC-5400)</span>
          </GlassCard>
        </motion.div>

        {/* Tab Switcher Bar */}
        <motion.div variants={fade} className="flex border-b border-black/10 mb-6 gap-2">
          {[
            { id: "one-off", label: "One-Off Expenses & Claims" },
            { id: "recurring", label: "Recurring Schedules" },
            { id: "vehicles", label: "Vehicle Registry & Maintenance" },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="px-4 py-2.5 text-xs font-black relative tracking-tight transition-colors uppercase"
              >
                <span className={isActive ? "text-black" : "text-gray-400 hover:text-gray-700"}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div layoutId="expense-tabs" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
                )}
              </button>
            )
          })}
        </motion.div>

        {/* Tab 1: One-off Expenses */}
        {activeTab === "one-off" && (
          <div className="grid grid-cols-1 gap-4">
            {/* Add Expense Form Collapse */}
            {showForm && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
                <GlassCard className="p-6 border border-emerald-300/40 bg-emerald-50/[0.15]">
                  <h3 className="text-base font-bold text-black mb-4">Add Corporate Card or Employee Claim</h3>
                  <form onSubmit={handleAddExpense} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Merchant / Vendor</label>
                        <input
                          type="text"
                          value={merchant}
                          onChange={(e) => setMerchant(e.target.value)}
                          placeholder="e.g. AWS, Delta Air"
                          className="w-full bg-white/70 border border-black/10 rounded-xl px-3 py-2 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black font-bold"
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
                          className="w-full bg-white/70 border border-black/10 rounded-xl px-3 py-2 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Cost Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-white/70 border border-black/10 rounded-xl px-3 py-2 text-sm text-black focus:outline-none focus:border-black cursor-pointer font-bold"
                        >
                          <option value="Software & SaaS">Software & SaaS</option>
                          <option value="Infrastructure">Infrastructure</option>
                          <option value="Travel & Lodging">Travel & Lodging</option>
                          <option value="Meals & Entertaining">Meals & Entertaining</option>
                          <option value="Office Rent">Office Rent</option>
                          <option value="Vehicle Cost">Vehicle Cost</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Cost Center Allocation</label>
                        <select
                          value={costCenter}
                          onChange={(e) => setCostCenter(e.target.value)}
                          className="w-full bg-white/70 border border-black/10 rounded-xl px-3 py-2 text-sm text-black focus:outline-none focus:border-black cursor-pointer font-bold"
                        >
                          <option value="CC-100 Corporate HQ">CC-100 Corporate HQ</option>
                          <option value="CC-200 Logistics & Warehouse">CC-200 Logistics & Warehouse</option>
                          <option value="CC-300 Sales & Field Ops">CC-300 Sales & Field Ops</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Expense GL Account</label>
                        <select
                          value={glAccount}
                          onChange={(e) => setGlAccount(e.target.value)}
                          className="w-full bg-white/70 border border-black/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-black focus:outline-none focus:border-black cursor-pointer"
                        >
                          <option value="5100">ACC-5100 (Rent & Occupancy)</option>
                          <option value="5200">ACC-5200 (Utilities & SaaS)</option>
                          <option value="5300">ACC-5300 (R&D & Services)</option>
                          <option value="5400">ACC-5400 (Vehicle Fleet Repairs)</option>
                          <option value="5010">ACC-5010 (Payroll & Operations)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Receipt / Voucher Ref</label>
                        <input
                          type="text"
                          value={voucherRef}
                          onChange={(e) => setVoucherRef(e.target.value)}
                          placeholder="e.g. REC-99201"
                          className="w-full bg-white/70 border border-black/10 rounded-xl px-3 py-2 text-sm font-mono text-black placeholder:text-gray-400 focus:outline-none focus:border-black"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Tax Reclaimable (15%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={taxAmount}
                          onChange={(e) => setTaxAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-white/70 border border-black/10 rounded-xl px-3 py-2 text-sm font-mono text-black focus:outline-none focus:border-black"
                        />
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Total Amount (ETB)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="e.g. 1500.00"
                            className="w-full bg-white/70 border border-black/10 rounded-xl px-3 py-2 text-sm font-mono font-black text-black placeholder:text-gray-400 focus:outline-none focus:border-black"
                            required
                          />
                        </div>
                        <button type="submit" className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all self-end h-[38px] uppercase tracking-wider">
                          Submit Claim
                        </button>
                      </div>
                    </div>
                  </form>
                </GlassCard>
              </motion.div>
            )}

            {/* Main Expense Table Card */}
            <GlassCard transition={{ delay: 0.12, duration: 0.4, ease: "easeOut" }} className="flex flex-col">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
                <div>
                  <h3 className="font-semibold text-base text-black">Audit Expenses & Claims</h3>
                  <p className="text-xs text-gray-400">Claims requiring corporate treasury approval.</p>
                </div>

                {/* Filtering Controls matching Guideline 7 */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-black/[0.04] rounded-2xl px-3 h-[38px]">
                    <Search className="size-4 text-gray-400 shrink-0" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-xs text-black placeholder:text-gray-400 outline-none w-44"
                      placeholder="Search merchant, employee..."
                    />
                  </div>

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-black/[0.03] text-xs font-bold px-3 py-2 rounded-xl text-gray-700 outline-none border border-transparent hover:border-black/5 cursor-pointer h-[38px]"
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
                    className="bg-black/[0.03] text-xs font-bold px-3 py-2 rounded-xl text-gray-700 outline-none border border-transparent hover:border-black/5 cursor-pointer h-[38px]"
                  >
                    <option value="ALL">All Status</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PENDING">Pending</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
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
                          <td className="py-3.5 text-right font-mono font-black text-black">
                            {exp.currency} {exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 text-center">
                            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                              exp.status === "APPROVED"
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                : exp.status === "REJECTED"
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                            }`}>
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
        )}

        {/* Tab 2: Recurring Expenses */}
        {activeTab === "recurring" && (
          <GlassCard className="flex flex-col">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
              <div>
                <h3 className="font-semibold text-base text-black">Recurring Expense Schedules</h3>
                <p className="text-xs text-gray-400">Automated leases, retainers, and scheduled overhead payments.</p>
              </div>

              <button
                onClick={handleGenerateDueExpenses}
                className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors flex items-center gap-1.5 h-[38px]"
              >
                <RotateCw className="size-3.5" /> Simulate Auto-Generator
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                    <th className="pb-3 pl-2">Schedule ID</th>
                    <th className="pb-3">Expense Type</th>
                    <th className="pb-3">Frequency</th>
                    <th className="pb-3">Cost Center</th>
                    <th className="pb-3">Linked Resource</th>
                    <th className="pb-3">Next Due Date</th>
                    <th className="pb-3 text-right">Recurring Amount</th>
                    <th className="pb-3 text-center">Auto-Generate</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {recurringSchedules.map((sch) => (
                    <tr key={sch.id} className="text-sm hover:bg-black/[0.01]">
                      <td className="py-3.5 pl-2 font-mono text-xs font-bold text-gray-500">{sch.id}</td>
                      <td className="py-3.5 font-bold text-black">{sch.expense_type}</td>
                      <td className="py-3.5 text-xs text-gray-600 font-medium">{sch.frequency}</td>
                      <td className="py-3.5 text-xs text-gray-700 font-medium">{sch.cost_center || "CC-100 Corporate HQ"}</td>
                      <td className="py-3.5 text-xs font-mono text-gray-500">{sch.linked_resource_id || "Overhead General"}</td>
                      <td className="py-3.5 text-xs font-bold text-black">{sch.next_due_date}</td>
                      <td className="py-3.5 text-right font-mono font-black text-black">
                        {sch.currency} {sch.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          sch.auto_generate ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                        }`}>
                          {sch.auto_generate ? "Enabled" : "Manual"}
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          sch.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600"
                        }`}>
                          {sch.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-4">
                        <button
                          onClick={() => {
                            store.toggleRecurringScheduleStatus(sch.id)
                            showToast("Status Updated", "info", `Schedule ${sch.id} is now ${sch.status === "Active" ? "Paused" : "Active"}`)
                          }}
                          className="text-xs font-bold px-2.5 py-1 rounded-lg border border-black/10 hover:bg-black/5 text-black"
                        >
                          {sch.status === "Active" ? "Pause" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {/* Tab 3: Vehicle Registry & Maintenance */}
        {activeTab === "vehicles" && (
          <div className="space-y-4">
            <GlassCard className="flex items-center justify-between p-4 mb-2">
              <div>
                <h3 className="font-semibold text-base text-black">Corporate Fleet Vehicle Registry</h3>
                <p className="text-xs text-gray-400">Track delivery trucks, refrigerated vans, and maintain repair logs.</p>
              </div>
              <div className="size-9 rounded-full bg-black/5 flex items-center justify-center">
                <Truck className="size-4 text-black" />
              </div>
            </GlassCard>

            <div className="grid grid-cols-1 gap-4">
              {vehicles.map((v) => {
                const isExpanded = expandedVehicles[v.id]
                const totalMaint = v.maintenance_cost_history.reduce((s, m) => s + m.amount, 0)

                return (
                  <GlassCard key={v.id} className="p-5">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleVehicleExpand(v.id)}
                          className="p-1 text-gray-400 hover:text-black hover:bg-black/5 rounded-lg transition-colors"
                        >
                          {isExpanded ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-black text-black">{v.registration_number}</span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                              v.status === "Active"
                                ? "bg-emerald-100 text-emerald-700"
                                : v.status === "In Repair"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-zinc-100 text-zinc-600"
                            }`}>
                              {v.status}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-gray-500 mt-0.5">{v.type} • Driver: {v.driver_name}</p>
                          <p className="text-[10px] text-gray-400 font-medium">Assigned: {v.assigned_warehouse}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-[10px] font-extrabold text-gray-400 uppercase block">Total Maintenance Cost</span>
                          <span className="text-sm font-mono font-black text-black">
                            ETB {totalMaint.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <button
                          onClick={() => setSelectedVehicleForMaint(v)}
                          className="px-3 py-1.5 rounded-xl bg-black/5 hover:bg-black/10 text-xs font-bold text-black flex items-center gap-1.5 transition-colors"
                        >
                          <Wrench className="size-3.5" /> Log Maintenance
                        </button>
                      </div>
                    </div>

                    {/* Expandable Maintenance History */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-black/5 bg-black/[0.01] rounded-xl p-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Service & Repair History</h4>
                        {v.maintenance_cost_history.length === 0 ? (
                          <p className="text-xs text-gray-400 italic py-2">No maintenance records logged for this vehicle.</p>
                        ) : (
                          <div className="space-y-2">
                            {v.maintenance_cost_history.map((m, i) => (
                              <div key={i} className="flex justify-between items-center text-xs bg-white p-2.5 rounded-lg border border-black/5">
                                <div>
                                  <span className="font-bold text-black">{m.description}</span>
                                  <span className="text-[10px] text-gray-400 block font-mono">{m.date}</span>
                                </div>
                                <span className="font-mono font-bold text-black">
                                  ETB {m.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </GlassCard>
                )
              })}
            </div>
          </div>
        )}
      </motion.div>

      {/* Add Recurring Schedule Modal */}
      <AnimatePresence>
        {showAddScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddScheduleModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-zinc-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black uppercase text-black">Create Recurring Expense Schedule</h3>
                <button onClick={() => setShowAddScheduleModal(false)} className="text-gray-400 hover:text-black">
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleAddScheduleSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Expense Type</label>
                  <select
                    value={schExpenseType}
                    onChange={(e) => setSchExpenseType(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none"
                  >
                    <option value="HQ Office Lease">HQ Office Lease</option>
                    <option value="Warehouse Space Lease">Warehouse Space Lease</option>
                    <option value="ERP SaaS Cloud License">ERP SaaS Cloud License</option>
                    <option value="Internet & Telecom Retainer">Internet & Telecom Retainer</option>
                    <option value="Security & Cleaning Retainer">Security & Cleaning Retainer</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Frequency</label>
                    <select
                      value={schFrequency}
                      onChange={(e) => setSchFrequency(e.target.value as any)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Annually">Annually</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Amount (ETB)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={schAmount}
                      onChange={(e) => setSchAmount(e.target.value)}
                      placeholder="e.g. 120000"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-black focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cost Center</label>
                    <select
                      value={schCostCenter}
                      onChange={(e) => setSchCostCenter(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none"
                    >
                      <option value="CC-100 Corporate HQ">CC-100 Corporate HQ</option>
                      <option value="CC-200 Logistics & Warehouse">CC-200 Logistics & Warehouse</option>
                      <option value="CC-300 Sales & Field Ops">CC-300 Sales & Field Ops</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Next Due Date</label>
                    <input
                      type="date"
                      value={schDueDate}
                      onChange={(e) => setSchDueDate(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Linked Contract / Vendor ID</label>
                  <input
                    type="text"
                    value={schResource}
                    onChange={(e) => setSchResource(e.target.value)}
                    placeholder="e.g. CON-88102 / Ethio Telecom"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddScheduleModal(false)}
                    className="flex-1 py-2.5 border border-zinc-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-zinc-50 uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase shadow-lg shadow-black/10"
                  >
                    Save Schedule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Log Maintenance Modal */}
      <AnimatePresence>
        {selectedVehicleForMaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVehicleForMaint(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-zinc-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black uppercase text-black">Log Maintenance ({selectedVehicleForMaint.registration_number})</h3>
                <button onClick={() => setSelectedVehicleForMaint(null)} className="text-gray-400 hover:text-black">
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleAddMaintenanceSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Service / Repair Description</label>
                  <input
                    type="text"
                    value={maintDesc}
                    onChange={(e) => setMaintDesc(e.target.value)}
                    placeholder="e.g. Engine tune up & filter replacement"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cost Amount (ETB)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={maintAmount}
                    onChange={(e) => setMaintAmount(e.target.value)}
                    placeholder="e.g. 4500.00"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-black focus:outline-none"
                    required
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedVehicleForMaint(null)}
                    className="flex-1 py-2.5 border border-zinc-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-zinc-50 uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase"
                  >
                    Save Maintenance Record
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
