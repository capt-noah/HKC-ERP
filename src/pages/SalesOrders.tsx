import { motion } from "framer-motion"
import { Plus, Search, Paperclip, AlertTriangle } from "lucide-react"
import { GlassCard } from "@/components/GlassCard"
import { FloatingNav } from "@/components/FloatingNav"
import { SubPageNav } from "@/components/SubPageNav"
import { navSections, getSectionChildren } from "@/lib/nav-config"

const fade = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

const columns = [
  {
    title: "Quote", count: 2,
    cards: [
      { id: "#SO-1042", amount: "ETB 4,500.00", company: "Acme Corp", desc: "Standard server rack installation and configuration.", initials: "VR", label: "V. Rossi", avatarBg: "bg-zinc-200", attachment: true, urgent: false, border: "" },
      { id: "#SO-1045", amount: "ETB 1,250.00", company: "Globex Inc", desc: "Quarterly maintenance supplies.", initials: "JD", label: "J. Doe", avatarBg: "bg-zinc-200", attachment: false, urgent: false, border: "" },
    ],
  },
  {
    title: "Confirmed", count: 1,
    cards: [
      { id: "#SO-1038", amount: "ETB 12,800.00", company: "Stark Industries", desc: "Bulk order: Premium workstation components.", initials: "MC", label: "M. Chen", avatarBg: "bg-green-200", attachment: false, urgent: true, border: "border-l-4 border-l-green-600" },
    ],
  },
  {
    title: "Picking", count: 1,
    cards: [
      { id: "#SO-1035", amount: "ETB 890.50", company: "Initech", desc: "Office supplies refill.", initials: "AS", label: "A. Smith", avatarBg: "bg-gray-300", attachment: false, urgent: false, border: "", progress: 60 },
    ],
  },
  {
    title: "Shipped", count: 2,
    cards: [
      { id: "#SO-1032", amount: "ETB 7,420.00", company: "Wayne Enterprises", desc: "Batch delivery: Custom structural carbon fiber plates.", initials: "BW", label: "B. Wayne", avatarBg: "bg-green-200", attachment: true, urgent: false, border: "" },
      { id: "#SO-1030", amount: "ETB 3,100.00", company: "Umbrella Corp", desc: "Eco-hazard laboratory containment units.", initials: "AW", label: "A. Wesker", avatarBg: "bg-zinc-200", attachment: false, urgent: false, border: "" },
    ],
  },
]

export default function SalesOrders() {
  return (
    <div className="min-h-screen page-gradient">
      <FloatingNav brand="HKC Trading ERP" sections={navSections} />

      <motion.div variants={fade} initial="hidden" animate="visible" className="max-w-[98%] mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight">Sales Orders Pipeline</h1>
            <p className="text-sm text-gray-400 mt-1">Manage and track your customer orders.</p>
          </div>
          <div className="flex items-center gap-3">
            <SubPageNav items={getSectionChildren("/sales")} />
            <div className="flex items-center gap-2 glass-card rounded-full px-4 py-2">
              <Search className="size-4 text-gray-400" />
              <input className="bg-transparent text-sm placeholder:text-gray-400 outline-none w-48" placeholder="Search orders..." />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-zinc-800 shadow-lg shadow-black/10">
              <Plus className="size-4" />New Order
            </button>
          </div>
        </div>

        {/* Kanban */}
        <div className="grid grid-cols-4 gap-4">
            {columns.map((col, colIdx) => (
              <motion.div key={col.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: colIdx * 0.08, duration: 0.35 }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base text-black">{col.title}</h3>
                    {col.count > 0 && (
                      <span className="inline-flex items-center justify-center size-6 rounded-full bg-green-600 text-white text-xs font-bold">{col.count}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-h-[520px]">
                  {col.cards.map((card, cardIdx) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + colIdx * 0.06 + cardIdx * 0.05 }}
                      whileHover={{ y: -2 }}
                    >
                      <GlassCard className={`p-4 ${card.border}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-500 bg-black/5 px-2 py-0.5 rounded-full">{card.id}</span>
                          <span className="text-sm font-bold text-black">{card.amount}</span>
                        </div>
                        <p className="font-bold text-sm text-black mb-1">{card.company}</p>
                        <p className="text-xs text-gray-400 leading-relaxed mb-3">{card.desc}</p>
                        {"progress" in card && card.progress !== undefined && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-400">Picking Progress</span>
                              <span className="font-medium text-black">{card.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${card.progress}%` }} transition={{ duration: 0.8, delay: 0.5 }} className="h-full bg-[#242427] rounded-full" />
                            </div>
                          </div>
                        )}
                        <div className="border-t border-black/5 pt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`size-6 rounded-full ${card.avatarBg} flex items-center justify-center text-[10px] font-bold text-gray-600`}>{card.initials}</div>
                            <span className="text-xs text-gray-400">{card.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {card.attachment && <Paperclip className="size-3.5 text-gray-400" />}
                            {card.urgent && (
                              <div className="flex items-center gap-1 text-green-600">
                                <AlertTriangle className="size-3.5 fill-green-600/20" />
                                <span className="text-xs font-semibold">Urgent</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                  {col.cards.length === 0 && (
                    <div className="flex-1 flex items-center justify-center glass-card rounded-[1.75rem] min-h-[200px]">
                      <p className="text-xs text-gray-300">No orders</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
      </motion.div>
    </div>
  )
}
