import { useState } from "react"
import { motion } from "framer-motion"
import { Search, CheckCircle2, CreditCard, Eye, Filter, Users, Award, CalendarDays, FileCheck } from "lucide-react"
import { FloatingNav } from "@/components/FloatingNav"
import { GlassCard } from "@/components/GlassCard"
import { SubPageNav } from "@/components/SubPageNav"
import { navSections, getSectionChildren } from "@/lib/nav-config"
import { initialEmployees, hrStats } from "@/lib/hrData"
import type { Employee } from "@/lib/hrData"
import { useFinanceStore } from "@/lib/financeStore"
import { useFeedback } from "@/context/FeedbackContext"

const fade = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const stagger = { visible: { transition: { staggerChildren: 0.05 } } }

export default function Payroll() {
  const { showToast } = useFeedback()
  const store = useFinanceStore()
  const payrollRuns = store.getPayrollRuns()

  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDept, setSelectedDept] = useState("All")

  const departments = ["All", ...Array.from(new Set(employees.map(e => e.department)))]

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.role.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDept = selectedDept === "All" || emp.department === selectedDept
    return matchesSearch && matchesDept
  })

  // Action: Post Payroll Accrual to Ledger
  const handlePostAccrual = (runId: string) => {
    const res = store.postPayrollAccrual(runId)
    if (res.success) {
      showToast(
        "Payroll Accrued in General Ledger",
        "success",
        `Created Journal Entry ${res.entryId}. Salary Expense debited and individual employee payable credits posted.`
      )
    } else {
      showToast("Accrual Blocked", "warning", res.error || "Failed to post payroll accrual.")
    }
  }

  // Action: Disburse Payroll Payment to Ledger
  const handleDisbursePayment = (runId: string) => {
    const res = store.postPayrollPayment(runId)
    if (res.success) {
      showToast(
        "Payroll Disbursed in General Ledger",
        "success",
        `Created Journal Entry ${res.entryId}. Accrued Payroll debited and Cash account credited.`
      )
      setEmployees(employees.map(e => ({
        ...e,
        paymentStatus: "Paid" as const,
        paymentStatusColor: "bg-black/5 text-gray-600",
      })))
    } else {
      showToast("Disbursement Blocked", "warning", res.error || "Failed to post payroll disbursement.")
    }
  }

  const handlePayEmployee = (id: string) => {
    setEmployees(employees.map(e => {
      if (e.id === id) {
        return {
          ...e,
          paymentStatus: "Paid" as const,
          paymentStatusColor: "bg-black/5 text-gray-600",
        }
      }
      return e
    }))
    showToast("Disbursement Recorded", "success", "Employee payout updated.")
  }

  // Action: Pay specific employee

  return (
    <div className="min-h-screen page-gradient">
      <FloatingNav brand="HKC Trading ERP" sections={navSections} />

      <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-[98%] mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-12">
        {/* Header - Reverted to stats on the left side */}
        <motion.div variants={fade} className="flex flex-col md:flex-row items-start justify-between mb-8 gap-6">
          {/* Left: Greeting and main metrics on the left */}
          <div className="flex flex-col gap-4">
            <h1 className="text-5xl font-black text-black tracking-tight leading-tight">Payroll Hub</h1>
            
            <div className="flex flex-wrap items-center gap-6">
              {/* Interviews & Hired badges */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-black text-white rounded-full pl-1 pr-4 py-1 shadow-sm">
                  <span className="bg-white text-black font-bold text-sm rounded-full w-9 h-7 flex items-center justify-center">{hrStats.interviewProgress}</span>
                  <span className="text-sm font-medium">Interviews</span>
                </div>
                <div className="flex items-center gap-2 bg-green-700 text-white rounded-full pl-1 pr-4 py-1 shadow-sm">
                  <span className="bg-white text-black font-bold text-sm rounded-full w-9 h-7 flex items-center justify-center">{hrStats.hiredProgress}</span>
                  <span className="text-sm font-medium">Hired</span>
                </div>
              </div>

              {/* Decorative vertical separator */}
              <div className="hidden sm:block w-px h-8 bg-black/10" />

              {/* Stats: Employee, Hirings, Leave numbers */}
              <div className="flex items-center gap-6">
                {[
                  { icon: <Users className="size-5 text-gray-500" />, label: "Employee", value: hrStats.employeeCount },
                  { icon: <Award className="size-5 text-gray-500" />, label: "Hirings", value: hrStats.hiringsCount },
                  { icon: <CalendarDays className="size-5 text-gray-500" />, label: "Leave", value: hrStats.leaveCount },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-black/[0.03] rounded-xl">
                      {s.icon}
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{s.label}</p>
                      <p className="text-xl font-black text-black leading-none mt-0.5">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Sub navigation options */}
          <div className="shrink-0">
            <SubPageNav items={getSectionChildren("/hr")} />
          </div>
        </motion.div>

        {/* Section: Finance Ledger Payroll Run Postings */}
        <motion.div variants={fade} className="mb-8">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-black uppercase text-zinc-900 tracking-tight">Active Payroll Cycles & Ledger Postings</h3>
                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                  Process two-phase accounting: Accrue payroll expenses, then disburse payments to employee accounts.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
                2-Phase Accounting Engine
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {payrollRuns.map((run) => (
                <div key={run.id} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-zinc-900">{run.period_label}</span>
                      <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        run.status === "Paid"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : run.status === "Accrued"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}>
                        {run.status === "Draft" ? "Draft (Unposted)" : run.status === "Accrued" ? "Accrued (Payable Created)" : "Paid & Disbursed"}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-mono mt-1">
                      Period: {run.period_start} to {run.period_end} • {run.employees.length} Employees
                    </p>

                    <div className="grid grid-cols-3 gap-2 mt-3 p-2.5 rounded-xl bg-white border border-zinc-100 font-mono text-[11px]">
                      <div>
                        <span className="text-[9px] text-zinc-400 block font-sans uppercase">Gross Pay</span>
                        <span className="font-bold text-zinc-900">ETB {run.total_gross.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-400 block font-sans uppercase">Deductions</span>
                        <span className="font-bold text-amber-800">ETB {run.total_deductions.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-400 block font-sans uppercase">Net Payout</span>
                        <span className="font-bold text-emerald-800">ETB {run.total_net.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-200/60 pt-3 text-xs">
                    <div className="text-[10px] font-mono text-zinc-400">
                      {run.accrual_journal_entry_id && (
                        <span className="block">Accrual JE: {run.accrual_journal_entry_id}</span>
                      )}
                      {run.payment_journal_entry_id && (
                        <span className="block">Payment JE: {run.payment_journal_entry_id}</span>
                      )}
                    </div>

                    <div>
                      {run.status === "Draft" && (
                        <button
                          onClick={() => handlePostAccrual(run.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-sm"
                        >
                          <FileCheck className="size-3.5" /> Post Accrual
                        </button>
                      )}
                      {run.status === "Accrued" && (
                        <button
                          onClick={() => handleDisbursePayment(run.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm"
                        >
                          <CreditCard className="size-3.5" /> Disburse Payment
                        </button>
                      )}
                      {run.status === "Paid" && (
                        <span className="text-xs text-emerald-700 font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="size-4" /> Fully Settled in GL
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Controls Row: Search, Filter */}
        <motion.div variants={fade} className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 mb-6">
          {/* Search */}
          <div className="relative flex items-center h-[38px] px-3.5 rounded-full glass-nav hover:bg-white/50 focus-within:bg-white/80 focus-within:border-black/20 focus-within:ring-1 focus-within:ring-black/5 transition-all w-full sm:w-48 shrink-0">
            <Search className="size-3.5 text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="bg-transparent border-none text-xs font-semibold text-black outline-none w-full"
            />
          </div>

          {/* Filter */}
          <div className="relative flex items-center h-[38px] px-3.5 rounded-full glass-nav hover:bg-white/50 transition-all shrink-0">
            <Filter className="size-3.5 text-gray-400 mr-2 shrink-0" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-black outline-none pr-4 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:8px_auto] bg-[right_center] bg-no-repeat"
            >
              {departments.map(dept => (
                <option key={dept} value={dept} className="bg-white text-black text-xs font-semibold">{dept}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Payroll Records List */}
        <motion.div variants={fade}>
          <GlassCard>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/5 text-xs text-gray-400 font-bold uppercase tracking-wider">
                    <th className="py-4 px-4">Employee</th>
                    <th className="py-4 px-4">Department</th>
                    <th className="py-4 px-4">Account ID</th>
                    <th className="py-4 px-4">Monthly Base</th>
                    <th className="py-4 px-4">Direct Deposit Status</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 text-sm">
                        No payroll sheets match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-black/[0.01] transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`size-10 rounded-full ${emp.avatarBg} flex items-center justify-center text-xs font-black text-gray-700`}>
                              {emp.initials}
                            </div>
                            <div>
                              <p className="text-sm font-extrabold text-black">{emp.name}</p>
                              <p className="text-xs text-gray-400">{emp.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm font-semibold text-black">
                          {emp.department}
                        </td>
                        <td className="py-4 px-4 font-mono text-xs text-gray-400">
                          {emp.id.replace("EMP", "ACC")}
                        </td>
                        <td className="py-4 px-4 text-sm font-bold text-black">
                          ETB {emp.salary.toLocaleString()}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${emp.paymentStatusColor}`}>
                            {emp.paymentStatus}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-1.5 hover:bg-black/5 rounded-lg text-gray-400 hover:text-black transition-all active:scale-90" title="View details">
                              <Eye className="size-4" />
                            </button>
                            {emp.paymentStatus !== "Paid" ? (
                              <button
                                onClick={() => handlePayEmployee(emp.id)}
                                className="flex items-center gap-1.5 bg-[#242427] hover:bg-[#323236] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95"
                              >
                                <CreditCard className="size-3.5" />
                                Disburse
                              </button>
                            ) : (
                              <span className="text-xs text-emerald-600 font-bold px-3 py-1.5 flex items-center gap-1">
                                <CheckCircle2 className="size-3.5" /> Fully Paid
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  )
}
