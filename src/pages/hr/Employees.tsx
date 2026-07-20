import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Plus, Filter, X, UserMinus, Users, Award, CalendarDays } from "lucide-react"
import { FloatingNav } from "@/components/FloatingNav"
import { GlassCard } from "@/components/GlassCard"
import { SubPageNav } from "@/components/SubPageNav"
import { navSections, getSectionChildren } from "@/lib/nav-config"
import { initialEmployees, hrStats } from "@/lib/hrData"
import type { Employee } from "@/lib/hrData"

const fade = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const stagger = { visible: { transition: { staggerChildren: 0.05 } } }

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDept, setSelectedDept] = useState("All")
  const [showAddModal, setShowAddModal] = useState(false)
  
  // New Employee Form State
  const [newEmp, setNewEmp] = useState({
    name: "",
    role: "",
    department: "Tech",
    email: "",
    salary: "",
    status: "Active" as const,
  })

  const departments = ["All", ...Array.from(new Set(employees.map(e => e.department)))]

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDept = selectedDept === "All" || emp.department === selectedDept
    return matchesSearch && matchesDept
  })

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmp.name || !newEmp.role || !newEmp.email || !newEmp.salary) return

    const created: Employee = {
      id: `EMP-00${employees.length + 1}`,
      name: newEmp.name,
      role: newEmp.role,
      department: newEmp.department,
      email: newEmp.email,
      status: newEmp.status,
      statusColor: newEmp.status === "Active" 
        ? "bg-green-100 text-green-700 border border-green-200" 
        : "bg-zinc-100 text-zinc-700 border border-zinc-200",
      joinDate: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      salary: parseFloat(newEmp.salary) || 50000,
      paymentStatus: "Pending",
      paymentStatusColor: "bg-zinc-100 text-zinc-700 border border-zinc-200",
      presentToday: newEmp.status === "Active",
      avatarBg: ["bg-green-100", "bg-sky-200", "bg-pink-200", "bg-teal-200", "bg-indigo-200", "bg-purple-200", "bg-rose-200", "bg-emerald-200"][employees.length % 8],
      initials: newEmp.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
    }

    setEmployees([created, ...employees])
    setShowAddModal(false)
    setNewEmp({
      name: "",
      role: "",
      department: "Tech",
      email: "",
      salary: "",
      status: "Active",
    })
  }

  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id))
  }


  return (
    <div className="min-h-screen page-gradient">
      <FloatingNav brand="HKC Trading ERP" sections={navSections} />

      <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-[98%] mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-12">
        {/* Header - Reverted to stats on the left side */}
        <motion.div variants={fade} className="flex flex-col md:flex-row items-start justify-between mb-8 gap-6">
          {/* Left: Greeting and main metrics on the left */}
          <div className="flex flex-col gap-4">
            <h1 className="text-5xl font-black text-black tracking-tight leading-tight">Employee Directory</h1>
            
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

        {/* Controls Row: Search, Filter, and Add Button */}
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

          {/* Action Button: Add Employee */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-black hover:bg-zinc-800 text-white rounded-full h-[38px] px-4 text-xs font-bold shadow-sm transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="size-3.5" />
            <span>Add Employee</span>
          </button>
        </motion.div>

        {/* Directory Grid/List */}
        <motion.div variants={fade}>
          <GlassCard>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/5 text-xs text-gray-400 font-bold uppercase tracking-wider">
                    <th className="py-4 px-4">Employee</th>
                    <th className="py-4 px-4">Department</th>
                    <th className="py-4 px-4">Contact</th>
                    <th className="py-4 px-4">Join Date</th>
                    <th className="py-4 px-4">Salary</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                        No employees match your search or filter.
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
                        <td className="py-4 px-4">
                          <p className="text-xs font-medium text-black">{emp.email}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{emp.id}</p>
                        </td>
                        <td className="py-4 px-4 text-xs font-semibold text-gray-500">
                          {emp.joinDate}
                        </td>
                        <td className="py-4 px-4 text-sm font-bold text-black">
                          ETB {emp.salary.toLocaleString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${emp.statusColor}`}>
                              {emp.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleDeleteEmployee(emp.id)}
                            className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg text-gray-400 transition-all active:scale-90"
                            title="Remove profile"
                          >
                            <UserMinus className="size-4" />
                          </button>
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

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white/95 backdrop-blur-lg border border-black/10 rounded-3xl p-6 shadow-2xl relative"
          >
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-5 top-5 p-1 text-gray-400 hover:text-black rounded-lg transition-colors"
            >
              <X className="size-5" />
            </button>
            
            <h3 className="text-xl font-black text-black tracking-tight mb-4">Add Employee Profile</h3>
            
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={newEmp.name}
                  onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full bg-black/[0.02] border border-black/10 rounded-2xl px-4 py-3 text-sm font-semibold text-black outline-none focus:border-green-700 focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Role / Position</label>
                  <input
                    type="text"
                    required
                    value={newEmp.role}
                    onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                    placeholder="e.g. UX Designer"
                    className="w-full bg-black/[0.02] border border-black/10 rounded-2xl px-4 py-3 text-sm font-semibold text-black outline-none focus:border-green-700 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Department</label>
                  <select
                    value={newEmp.department}
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                    className="w-full bg-black/[0.02] border border-black/10 rounded-2xl px-4 py-3.5 text-sm font-semibold text-black outline-none focus:border-green-700 focus:bg-white transition-colors"
                  >
                    <option value="Tech">Tech</option>
                    <option value="Product">Product</option>
                    <option value="HR">HR</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Work Email</label>
                <input
                  type="email"
                  required
                  value={newEmp.email}
                  onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                  placeholder="e.g. john@hkctrading.erp"
                  className="w-full bg-black/[0.02] border border-black/10 rounded-2xl px-4 py-3 text-sm font-semibold text-black outline-none focus:border-green-700 focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Monthly Salary (ETB)</label>
                  <input
                    type="number"
                    required
                    value={newEmp.salary}
                    onChange={(e) => setNewEmp({ ...newEmp, salary: e.target.value })}
                    placeholder="e.g. 75000"
                    className="w-full bg-black/[0.02] border border-black/10 rounded-2xl px-4 py-3 text-sm font-semibold text-black outline-none focus:border-green-700 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    value={newEmp.status}
                    onChange={(e) => setNewEmp({ ...newEmp, status: e.target.value as any })}
                    className="w-full bg-black/[0.02] border border-black/10 rounded-2xl px-4 py-3.5 text-sm font-semibold text-black outline-none focus:border-green-700 focus:bg-white transition-colors"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 border border-black/10 text-black hover:bg-black/5 rounded-2xl py-3 text-sm font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#242427] text-white hover:bg-[#323236] rounded-2xl py-3 text-sm font-bold transition-all shadow-md"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
