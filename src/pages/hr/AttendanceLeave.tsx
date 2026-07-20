import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Users, 
  FileSpreadsheet, 
  Info, 
  Clock
} from "lucide-react"
import { FloatingNav } from "@/components/FloatingNav"
import { GlassCard } from "@/components/GlassCard"
import { SubPageNav } from "@/components/SubPageNav"
import { navSections, getSectionChildren } from "@/lib/nav-config"
import { useFeedback } from "@/context/FeedbackContext"

const fade = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }
const stagger = { visible: { transition: { staggerChildren: 0.05 } } }

interface Employee {
  id: string
  name: string
  role: string
  avatar: string
  // Array of attendance states for days 1 to 14 of July 2026
  attendance: ("present" | "absent" | "leave")[]
}

const initialEmployees: Employee[] = [
  {
    id: "EMP-001",
    name: "Sophia Chen",
    role: "HR Systems Coordinator",
    avatar: "SC",
    attendance: ["present", "present", "present", "absent", "present", "present", "present", "present", "present", "leave", "leave", "present", "present", "present"],
  },
  {
    id: "EMP-002",
    name: "Dr. Elias Bekele",
    role: "Lead Research Chemist",
    avatar: "EB",
    attendance: ["present", "present", "present", "present", "present", "present", "present", "present", "absent", "present", "present", "present", "present", "present"],
  },
  {
    id: "EMP-003",
    name: "Abraham Lemma",
    role: "Lab Inventory Officer",
    avatar: "AL",
    attendance: ["present", "absent", "present", "present", "present", "present", "absent", "present", "present", "present", "present", "present", "absent", "present"],
  },
  {
    id: "EMP-004",
    name: "Tigist Hailu",
    role: "Cold-Chain Logistics Mgr",
    avatar: "TH",
    attendance: ["present", "present", "present", "present", "leave", "leave", "leave", "present", "present", "present", "present", "present", "present", "present"],
  },
  {
    id: "EMP-005",
    name: "Kidist Kebede",
    role: "Pharma Compliance Auditor",
    avatar: "KK",
    attendance: ["present", "present", "present", "present", "present", "present", "present", "present", "present", "present", "present", "present", "present", "present"],
  },
]

interface LeaveRequest {
  id: string
  employeeName: string
  role: string
  avatar: string
  type: "Annual Leave" | "Medical Leave" | "Maternity Leave" | "Compassionate"
  range: string
  reason: string
  status: "Pending" | "Approved" | "Rejected"
}

const initialLeaveRequests: LeaveRequest[] = [
  {
    id: "LR-101",
    employeeName: "Sophia Chen",
    role: "HR Systems Coordinator",
    avatar: "SC",
    type: "Annual Leave",
    range: "Jul 10 - Jul 12, 2026",
    reason: "Family engagement travel & personal restructuring.",
    status: "Pending",
  },
  {
    id: "LR-102",
    employeeName: "Tigist Hailu",
    role: "Cold-Chain Logistics Mgr",
    avatar: "TH",
    type: "Medical Leave",
    range: "Jul 14 - Jul 15, 2026",
    reason: "Routine outpatient health assessment & calibration.",
    status: "Pending",
  },
  {
    id: "LR-103",
    employeeName: "Abraham Lemma",
    role: "Lab Inventory Officer",
    avatar: "AL",
    type: "Annual Leave",
    range: "Jul 22 - Jul 26, 2026",
    reason: "Annual vacation renewal with family.",
    status: "Pending",
  },
  {
    id: "LR-104",
    employeeName: "Dr. Elias Bekele",
    role: "Lead Research Chemist",
    avatar: "EB",
    type: "Compassionate",
    range: "Jun 20 - Jun 22, 2026",
    reason: "Urgent family domestic matter resolution.",
    status: "Approved",
  },
]

export default function AttendanceLeave() {
  const { showToast } = useFeedback()
  const [activeTab, setActiveTab] = useState<"Attendance" | "Leave">("Attendance")
  const [team, setTeam] = useState<Employee[]>(initialEmployees)
  const [requests, setRequests] = useState<LeaveRequest[]>(initialLeaveRequests)

  // Calendar stats
  const totalDays = 14
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1)

  // Cycle day attendance state: present -> absent -> leave -> present
  const handleToggleDay = (empId: string, dayIndex: number) => {
    setTeam((prev) =>
      prev.map((emp) => {
        if (emp.id === empId) {
          const nextAttendance = [...emp.attendance]
          const current = nextAttendance[dayIndex]
          let nextState: "present" | "absent" | "leave" = "present"
          
          if (current === "present") nextState = "absent"
          else if (current === "absent") nextState = "leave"
          else nextState = "present"

          nextAttendance[dayIndex] = nextState

          showToast(
            "Attendance Cycle Update",
            "info",
            `Changed ${emp.name}'s Jul ${dayIndex + 1} status to ${nextState.toUpperCase()}.`
          )
          return { ...emp, attendance: nextAttendance }
        }
        return emp
      })
    )
  }

  // Handle requests
  const handleRequestStatus = (id: string, nextStatus: "Approved" | "Rejected") => {
    const target = requests.find((r) => r.id === id)
    if (!target) return

    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r))
    )

    showToast(
      `Request ${nextStatus}`,
      nextStatus === "Approved" ? "success" : "warning",
      `${target.employeeName}'s ${target.type} request has been ${nextStatus.toLowerCase()}.`
    )
  }

  // Statistics calculation
  const totalSubmissions = team.length * totalDays
  const presentCount = team.reduce(
    (acc, emp) => acc + emp.attendance.filter((status) => status === "present").length,
    0
  )
  const leaveCount = team.reduce(
    (acc, emp) => acc + emp.attendance.filter((status) => status === "leave").length,
    0
  )
  const absentCount = team.reduce(
    (acc, emp) => acc + emp.attendance.filter((status) => status === "absent").length,
    0
  )

  const presentPercentage = totalSubmissions ? (presentCount / totalSubmissions) * 100 : 0

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
            <h1 className="text-3xl font-black text-black tracking-tight">Attendance & Leave</h1>
            <p className="text-xs font-semibold text-zinc-500 max-w-xl leading-relaxed mt-1">
              Observe team chronological presence schedules, audit absenteeism ratios, and dispatch approvals for outstanding leave requests.
            </p>
          </div>
          <div className="flex items-center gap-3 self-end md:self-start">
            <SubPageNav items={getSectionChildren("/hr")} />
            <button 
              onClick={() => showToast("Exporting Timecards", "info", "Compiling Excel spreadsheet...")}
              className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
            >
              <FileSpreadsheet className="size-4" /> Export Sheet
            </button>
          </div>
        </motion.div>

        {/* Tab Switcher */}
        <motion.div variants={fade} className="flex border-b border-zinc-200/60 mb-6 pb-px items-center justify-between">
          <div className="flex gap-2">
            {[
              { id: "Attendance", label: "Team Attendance" },
              { id: "Leave", label: `Leave Requests (${requests.filter((r) => r.status === "Pending").length})` },
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
                      layoutId="attendance-tabs"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-700"
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="text-[10px] font-mono font-black text-zinc-400 uppercase hidden sm:block">
            Cycle: July 1 - July 14, 2026
          </div>
        </motion.div>

        {/* Tab 1: Attendance Grid */}
        <AnimatePresence mode="wait">
          {activeTab === "Attendance" && (
            <motion.div
              key="attendance-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              {/* Analytics summary rows */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassCard className="p-5" whileHover={{ y: -2 }}>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Average Presence Ratio</span>
                  <span className="text-xl font-black text-zinc-900 block mt-1">
                    {presentPercentage.toFixed(1)}%
                  </span>
                  <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-emerald-500" style={{ width: `${presentPercentage}%` }} />
                  </div>
                </GlassCard>

                <GlassCard className="p-5" whileHover={{ y: -2 }}>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Total Active Members</span>
                  <span className="text-xl font-black text-zinc-900 block mt-1">
                    {team.length} Employees
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-500 mt-2.5">
                    <Users className="size-3.5" /> Core Staffing Registered
                  </div>
                </GlassCard>

                <GlassCard className="p-5" whileHover={{ y: -2 }}>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Present Mandays</span>
                  <span className="text-xl font-black text-zinc-950 block mt-1">
                    {presentCount} Present
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-black text-green-700 uppercase tracking-wider mt-2.5">
                    <span className="size-1.5 rounded-full bg-green-600 shrink-0" /> Green Filled Indicators
                  </div>
                </GlassCard>

                <GlassCard className="p-5" whileHover={{ y: -2 }}>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Leave & Absence Counts</span>
                  <span className="text-xl font-black text-zinc-900 block mt-1">
                    {leaveCount} Leave / {absentCount} Absent
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-black text-zinc-500 uppercase tracking-wider mt-2.5">
                    <span className="size-1.5 rounded-full bg-zinc-200 border border-zinc-400 shrink-0" /> Outlined Day Cells
                  </div>
                </GlassCard>
              </div>

              {/* Dynamic Calendar Grid Team View */}
              <GlassCard className="p-6 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-zinc-100 mb-6 gap-3">
                  <div>
                    <h3 className="text-xs font-black tracking-tight text-zinc-900 uppercase">Interactive Team Attendance Grid</h3>
                    <p className="text-[10px] font-semibold text-zinc-400 mt-0.5">
                      Cycle click cells to toggle status: Present (Green), Absent (Border), Leave (Dot Outline).
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-semibold text-zinc-500 shrink-0">
                    <div className="flex items-center gap-1">
                      <div className="size-3.5 rounded bg-green-700" />
                      <span>Present</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="size-3.5 rounded border border-red-300" />
                      <span>Absent</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="size-3.5 rounded border border-blue-300 bg-blue-50/50" />
                      <span>Leave</span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[800px] space-y-4">
                    {/* Header Month Row */}
                    <div className="grid grid-cols-12 items-center text-center">
                      <div className="col-span-3 text-left">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Employee Row</span>
                      </div>
                      <div className="col-span-9 grid grid-cols-14 gap-1.5 font-mono text-[10px] font-bold text-zinc-400 uppercase">
                        {daysArray.map((day) => (
                          <div key={day} className="py-1">
                            Jul {day}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Employee Attendance Data Rows */}
                    <div className="divide-y divide-zinc-100">
                      {team.map((emp) => (
                        <div key={emp.id} className="grid grid-cols-12 items-center py-3.5 hover:bg-zinc-50/50 transition-colors rounded-xl px-1">
                          {/* Employee Name & Profile Column */}
                          <div className="col-span-3 flex items-center gap-3 text-left">
                            <div className="size-8.5 rounded-full bg-zinc-950 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                              {emp.avatar}
                            </div>
                            <div className="min-w-0 pr-2">
                              <h4 className="text-xs font-black text-zinc-900 truncate leading-tight">{emp.name}</h4>
                              <p className="text-[10px] font-semibold text-zinc-400 truncate mt-0.5">{emp.role}</p>
                            </div>
                          </div>

                          {/* Attendance Grid Cell Row */}
                          <div className="col-span-9 grid grid-cols-14 gap-1.5">
                            {emp.attendance.map((status, idx) => {
                              return (
                                <button
                                  key={idx}
                                  onClick={() => handleToggleDay(emp.id, idx)}
                                  className={`size-7.5 rounded-xl flex items-center justify-center transition-all duration-200 relative group active:scale-95 ${
                                    status === "present"
                                      ? "bg-green-700 border border-green-700 text-white shadow-sm shadow-green-700/10"
                                      : status === "absent"
                                        ? "border border-red-200 hover:border-red-400 text-red-500 bg-transparent"
                                        : "border border-blue-200 hover:border-blue-400 bg-blue-50/20 text-blue-500"
                                  }`}
                                  title={`${emp.name}: July ${idx + 1} (${status})`}
                                >
                                  {/* Minimal indicator dots or symbols */}
                                  {status === "present" && <span className="text-[9px] font-black leading-none">P</span>}
                                  {status === "absent" && <span className="text-[9px] font-bold leading-none">A</span>}
                                  {status === "leave" && <span className="text-[9px] font-bold leading-none">L</span>}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 mt-6 flex items-start gap-2.5">
                  <Info className="size-4 text-zinc-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-semibold text-zinc-500 leading-normal">
                    This staff attendance matrix interfaces directly with monthly Payroll disbursements. Make sure to audit and submit pending leave requests regularly.
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Tab 2: Leave Requests */}
          {activeTab === "Leave" && (
            <motion.div
              key="leave-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Context list sidebar */}
              <div className="lg:col-span-1">
                <GlassCard className="p-5 flex flex-col gap-4">
                  <div>
                    <h3 className="text-xs font-black tracking-tight text-zinc-900 uppercase">Leave Requests Overview</h3>
                    <p className="text-[10px] font-semibold text-zinc-400 leading-relaxed mt-1">
                      Assess outstanding applications, audit eligibility parameters, and dispatch double-entry adjustment logs to team rosters.
                    </p>
                  </div>

                  <hr className="border-zinc-100" />

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Leave Policies Rules</h4>
                    
                    <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-800">Annual Paid Allowance</span>
                        <span className="text-[10px] font-mono font-black text-zinc-900">24 Days</span>
                      </div>
                      <div className="h-1 bg-zinc-200 rounded-full mt-2" />
                    </div>

                    <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-800">Paid Medical Extension</span>
                        <span className="text-[10px] font-mono font-black text-zinc-900">12 Days</span>
                      </div>
                      <div className="h-1 bg-zinc-200 rounded-full mt-2" />
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Request cards grid lists */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 mb-2">
                  <h4 className="text-xs font-black tracking-wider text-zinc-800 uppercase">Application Dispatch Log</h4>
                  <span className="text-[10px] font-mono font-bold text-zinc-400">
                    {requests.filter((r) => r.status === "Pending").length} pending reviews
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requests.map((req) => (
                    <GlassCard
                      layout
                      key={req.id}
                      className="p-5 flex flex-col justify-between"
                      whileHover={{ y: -2 }}
                    >
                      {/* Card Header Info */}
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="size-8.5 rounded-full bg-zinc-950 text-white flex items-center justify-center font-black text-xs shrink-0">
                              {req.avatar}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-black text-zinc-900 truncate leading-tight">{req.employeeName}</h4>
                              <p className="text-[10px] font-semibold text-zinc-400 truncate mt-0.5">{req.role}</p>
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            req.type === "Annual Leave" && "bg-zinc-100 text-zinc-700 border border-zinc-200"
                          } ${
                            req.type === "Medical Leave" && "bg-zinc-50 text-zinc-500 border border-zinc-150"
                          } ${
                            req.type === "Compassionate" && "bg-green-50 text-green-700 border border-green-100"
                          }`}>
                            {req.type}
                          </span>
                        </div>

                        {/* Leave Date Range block */}
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-800 mb-2.5">
                          <Clock className="size-3.5 text-zinc-400 shrink-0" />
                          <span>{req.range}</span>
                        </div>

                        <p className="text-[10px] font-semibold text-zinc-500 leading-normal mb-4">
                          "{req.reason}"
                        </p>
                      </div>

                      {/* Card Bottom status / action trigger */}
                      <div className="border-t border-zinc-50 pt-3.5 mt-auto flex items-center justify-between">
                        {req.status === "Pending" ? (
                          <div className="flex gap-2 w-full">
                            <button
                              onClick={() => handleRequestStatus(req.id, "Rejected")}
                              className="flex-1 py-1.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-[10px] font-black rounded-lg transition-colors uppercase tracking-tight"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleRequestStatus(req.id, "Approved")}
                              className="flex-1 py-1.5 bg-green-700 hover:bg-green-800 text-white text-[10px] font-black rounded-lg transition-colors uppercase tracking-tight shadow-sm shadow-green-700/10"
                            >
                              Approve
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase">Status Checked</span>
                            <span className={`text-[10px] font-black uppercase ${
                              req.status === "Approved" ? "text-emerald-600" : "text-red-500"
                            }`}>
                              {req.status}
                            </span>
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
