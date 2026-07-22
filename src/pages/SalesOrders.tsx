import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Paperclip, ArrowRight, CheckCircle2, Building2 } from "lucide-react"
import { GlassCard } from "@/components/GlassCard"
import { FloatingNav } from "@/components/FloatingNav"
import { SubPageNav } from "@/components/SubPageNav"
import { navSections, getSectionChildren } from "@/lib/nav-config"
import { useErpStore, type SalesOrder } from "@/lib/erpStore"
import { useFeedback } from "@/context/FeedbackContext"

const fade = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function SalesOrders() {
  const { showToast } = useFeedback()
  const erp = useErpStore()
  const salesOrders = erp.getSalesOrders()
  const [searchQuery, setSearchQuery] = useState("")

  // New Sales Order Modal state
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState("Hamburg Coffee Importers GmbH")
  const [newWarehouse, setNewWarehouse] = useState("WH1")
  const [newDesc, setNewDesc] = useState("")
  const [newAmount, setNewAmount] = useState<number | "">("")

  const stages: Array<SalesOrder["stage"]> = ["Quote", "Confirmed", "Picking", "Shipped"]

  const filteredOrders = salesOrders.filter(so => 
    so.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    so.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    so.desc.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAdvanceStage = (id: string, currentStage: SalesOrder["stage"]) => {
    let nextStage: SalesOrder["stage"] = currentStage
    let progress: number | undefined = undefined

    if (currentStage === "Quote") nextStage = "Confirmed"
    else if (currentStage === "Confirmed") {
      nextStage = "Picking"
      progress = 40
    } else if (currentStage === "Picking") {
      nextStage = "Shipped"
      progress = 100
    }

    if (nextStage !== currentStage) {
      erp.updateSalesOrderStage(id, nextStage, progress)
      showToast("Pipeline Stage Updated", "success", `Order ${id} moved to ${nextStage}.`)
    }
  }

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCustomer || newAmount === "") {
      showToast("Validation Error", "warning", "Please specify customer and contract amount.")
      return
    }

    const newSo: SalesOrder = {
      id: `SO-${Date.now().toString().slice(-4)}`,
      customer: newCustomer,
      customerId: "CUST-001",
      warehouse: newWarehouse,
      warehouseName: newWarehouse === "WH1" ? "WH1 - Agricultural Export Hub" : newWarehouse === "WH2" ? "WH2 - Veterinary Import Hub (India)" : "WH3 - Veterinary Import Hub (China)",
      date: new Date().toISOString().split("T")[0],
      amount: Number(newAmount),
      currency: "ETB",
      stage: "Quote",
      desc: newDesc || "Export/Distribution Sales Contract",
      initials: newCustomer.slice(0, 2).toUpperCase(),
      label: newCustomer,
      avatarBg: "bg-emerald-200 text-emerald-900",
      urgent: false,
      attachment: true,
      items: [
        { productId: "P-101", name: "HKC Trading Goods Order", qty: 10, unit: "units", unitPrice: Number(newAmount) / 10, total: Number(newAmount) }
      ]
    }

    erp.addSalesOrder(newSo)
    showToast("Sales Order Created", "success", `Contract ${newSo.id} added under Quote stage.`)
    setIsNewOrderOpen(false)
    setNewDesc("")
    setNewAmount("")
  }

  return (
    <div className="min-h-screen page-gradient">
      <FloatingNav brand="HKC Trading ERP" sections={navSections} />

      <motion.div variants={fade} initial="hidden" animate="visible" className="max-w-[98%] mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight">Sales Orders Pipeline</h1>
            <p className="text-xs font-semibold text-zinc-500 max-w-xl leading-relaxed mt-1">
              Trace HKC Trading export orders (WH1) and domestic veterinary distribution orders (WH2 & WH3) through fulfillment stages.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SubPageNav items={getSectionChildren("/sales")} />
            <div className="flex items-center gap-2 glass-card rounded-full px-4 py-2">
              <Search className="size-4 text-zinc-400" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs font-semibold outline-none w-48 placeholder:text-zinc-400" 
                placeholder="Search orders or clients..." 
              />
            </div>
            <button 
              onClick={() => setIsNewOrderOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-900 shadow-md active:scale-95 transition-all"
            >
              <Plus className="size-4" /> New Contract
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map((stageName, colIdx) => {
            const cards = filteredOrders.filter(so => so.stage === stageName)
            return (
              <motion.div 
                key={stageName} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: colIdx * 0.08, duration: 0.35 }}
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-xs uppercase tracking-widest text-zinc-900">{stageName}</h3>
                    <span className="inline-flex items-center justify-center size-5 rounded-full bg-zinc-950 text-white text-[10px] font-bold">
                      {cards.length}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 min-h-[520px] p-2 bg-zinc-100/40 rounded-2xl border border-zinc-200/60">
                  {cards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400 text-xs font-semibold">
                      No orders in {stageName}
                    </div>
                  ) : (
                    cards.map((card, cardIdx) => (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 + colIdx * 0.05 + cardIdx * 0.04 }}
                        whileHover={{ y: -2 }}
                      >
                        <GlassCard className={`p-4 ${card.urgent ? "border-l-4 border-l-red-600" : ""}`}>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <span className="text-[10px] font-mono font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">
                                {card.id}
                              </span>
                              <span className="ml-2 text-[9px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-md">
                                {card.warehouse}
                              </span>
                            </div>
                            <span className="text-xs font-black text-zinc-950 font-mono">
                              ETB {card.amount.toLocaleString()}
                            </span>
                          </div>

                          <p className="font-extrabold text-xs text-zinc-900 mb-1 flex items-center gap-1.5">
                            <Building2 className="size-3.5 text-zinc-500 shrink-0" />
                            {card.customer}
                          </p>

                          <p className="text-[11px] font-medium text-zinc-600 leading-relaxed mb-3">
                            {card.desc}
                          </p>

                          {card.progress !== undefined && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 mb-1">
                                <span>Picking / Packing</span>
                                <span>{card.progress}%</span>
                              </div>
                              <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-700 rounded-full transition-all duration-500" 
                                  style={{ width: `${card.progress}%` }} 
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-[10px] font-semibold text-zinc-500">
                            <div className="flex items-center gap-1.5">
                              {card.attachment && <Paperclip className="size-3 text-zinc-400" />}
                              <span>{card.date}</span>
                            </div>

                            {stageName !== "Shipped" && (
                              <button 
                                onClick={() => handleAdvanceStage(card.id, card.stage)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-[10px] transition-all"
                              >
                                Advance <ArrowRight className="size-3" />
                              </button>
                            )}
                            {stageName === "Shipped" && (
                              <span className="flex items-center gap-1 text-green-700 font-bold">
                                <CheckCircle2 className="size-3" /> Complete
                              </span>
                            )}
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* New Order Modal */}
      <AnimatePresence>
        {isNewOrderOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-200"
            >
              <h2 className="text-xl font-black text-zinc-950 mb-1">Create HKC Sales Contract</h2>
              <p className="text-xs font-semibold text-zinc-500 mb-5">Draft a new sales contract into the Quote pipeline.</p>

              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Client / Customer</label>
                  <input 
                    type="text" 
                    value={newCustomer}
                    onChange={(e) => setNewCustomer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold outline-none" 
                    placeholder="Company name..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Fulfillment Warehouse</label>
                    <select 
                      value={newWarehouse}
                      onChange={(e) => setNewWarehouse(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold outline-none"
                    >
                      <option value="WH1">WH1 - Export (Ethiopia)</option>
                      <option value="WH2">WH2 - Vet Import (India)</option>
                      <option value="WH3">WH3 - Vet Import (China)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Amount (ETB)</label>
                    <input 
                      type="number" 
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value ? Number(e.target.value) : "")}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold outline-none" 
                      placeholder="e.g. 750000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Contract Description</label>
                  <textarea 
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold outline-none resize-none" 
                    placeholder="Describe contract items or terms..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button 
                    type="button" 
                    onClick={() => setIsNewOrderOpen(false)}
                    className="px-4 py-2 rounded-full border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-100"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 rounded-full bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-800 shadow-md"
                  >
                    Create Contract
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
