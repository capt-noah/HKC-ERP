import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Printer, Package, Truck, Clock, Search, CheckCircle2 } from "lucide-react"
import { FloatingNav } from "@/components/FloatingNav"
import { GlassCard } from "@/components/GlassCard"
import { SubPageNav } from "@/components/SubPageNav"
import { navSections, getSectionChildren } from "@/lib/nav-config"
import { useErpStore, type PurchaseOrder } from "@/lib/erpStore"
import { useFeedback } from "@/context/FeedbackContext"

const fade = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function PurchaseOrders() {
  const { showToast } = useFeedback()
  const erp = useErpStore()
  const purchaseOrders = erp.getPurchaseOrders()

  const [selectedPoId, setSelectedPoId] = useState<string>(purchaseOrders[0]?.id || "PO-2026-089")
  const [filterTab, setFilterTab] = useState<"All POs" | "Draft" | "In Transit">("All POs")
  const [searchQuery, setSearchQuery] = useState("")

  // New PO Modal state
  const [isNewPoOpen, setIsNewPoOpen] = useState(false)
  const [newSupplier, setNewSupplier] = useState("Oromia Coffee Farmers Cooperative Union")
  const [newWarehouse, setNewWarehouse] = useState("WH1")
  const [newItemName, setNewItemName] = useState("")
  const [newQty, setNewQty] = useState<number | "">("")
  const [newPrice, setNewPrice] = useState<number | "">("")

  const selectedPo = purchaseOrders.find(po => po.id === selectedPoId) || purchaseOrders[0]

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          po.supplier.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false

    if (filterTab === "Draft") return po.status === "DRAFT"
    if (filterTab === "In Transit") return po.status === "IN TRANSIT"
    return true
  })

  const draftCount = purchaseOrders.filter(po => po.status === "DRAFT").length
  const inTransitCount = purchaseOrders.filter(po => po.status === "IN TRANSIT").length

  const handleMarkReceived = (id: string) => {
    erp.updatePurchaseOrderStatus(id, "RECEIVED")
    showToast("PO Received", "success", `Purchase Order ${id} successfully marked as RECEIVED. Stock updated.`)
  }

  const handleCreatePo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSupplier || !newItemName || newQty === "" || newPrice === "") {
      showToast("Validation Error", "warning", "Please fill in supplier, item, quantity, and unit price.")
      return
    }

    const qtyNum = Number(newQty)
    const priceNum = Number(newPrice)
    const totalAmount = qtyNum * priceNum

    const newPo: PurchaseOrder = {
      id: `PO-${Date.now().toString().slice(-4)}`,
      poNumber: `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
      supplier: newSupplier,
      supplierId: "SUPP-NEW",
      warehouse: newWarehouse,
      warehouseName: newWarehouse === "WH1" ? "WH1 - Agricultural Export Hub" : newWarehouse === "WH2" ? "WH2 - Veterinary Import Hub (India)" : "WH3 - Veterinary Import Hub (China)",
      status: "DRAFT",
      statusColor: "bg-zinc-600 text-white",
      date: new Date().toISOString().split("T")[0],
      eta: "Pending Proforma Confirmation",
      amount: totalAmount,
      currency: "ETB",
      category: newWarehouse === "WH1" ? "Local Agricultural Sourcing" : "Veterinary Import",
      items: [
        { productId: "P-NEW", name: newItemName, sku: `SKU-${Date.now().toString().slice(-4)}`, qty: qtyNum, unit: "units", unitPrice: priceNum, total: totalAmount }
      ]
    }

    erp.addPurchaseOrder(newPo)
    setSelectedPoId(newPo.id)
    showToast("Purchase Order Created", "success", `Draft PO ${newPo.poNumber} created successfully.`)
    setIsNewPoOpen(false)
    setNewItemName("")
    setNewQty("")
    setNewPrice("")
  }

  return (
    <div className="min-h-screen page-gradient">
      <FloatingNav brand="HKC Trading ERP" sections={navSections} />

      <motion.div variants={fade} initial="hidden" animate="visible" className="max-w-[98%] mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight">Purchase & Procurement Orders</h1>
            <p className="text-xs font-semibold text-zinc-500 max-w-xl leading-relaxed mt-1">
              Manage local sourcing from Ethiopian unions (WH1) and international pharmaceutical import POs from India (WH2) and China (WH3).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 self-end md:self-start">
            <SubPageNav items={getSectionChildren("/sales")} />
            <button 
              onClick={() => setIsNewPoOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-900 shadow-md active:scale-95 transition-all"
            >
              <Plus className="size-4" /> Create PO
            </button>
          </div>
        </div>

        {/* 3 stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Draft POs", value: `${draftCount}`, sub: "Pending approval / proforma", Icon: Clock, iconBg: "bg-black/5", iconColor: "text-zinc-600" },
            { label: "In Transit POs", value: `${inTransitCount}`, sub: "Port / Customs clear", Icon: Truck, iconBg: "bg-blue-50", iconColor: "text-blue-700" },
            { label: "Received POs", value: `${purchaseOrders.filter(p => p.status === "RECEIVED").length}`, sub: "Cleared into warehouse", Icon: CheckCircle2, iconBg: "bg-emerald-50", iconColor: "text-emerald-700" },
          ].map((s, idx) => {
            const Icon = s.Icon
            return (
              <GlassCard key={s.label} className="flex items-center justify-between" transition={{ delay: 0.05 * idx, duration: 0.4 }}>
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{s.label}</p>
                  <p className="text-3xl font-black text-black mt-1 mb-1 font-mono">{s.value}</p>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500">
                    {s.sub}
                  </div>
                </div>
                <div className={`size-12 rounded-2xl flex items-center justify-center ${s.iconBg}`}>
                  <Icon className={`size-6 ${s.iconColor}`} />
                </div>
              </GlassCard>
            )
          })}
        </div>

        {/* Split panel */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
          {/* Left: PO list (dark glass) */}
          <GlassCard variant="dark" className="p-4" transition={{ delay: 0.16, duration: 0.4 }}>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 mb-3">
              <Search className="size-4 text-zinc-400" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-xs text-white placeholder:text-zinc-500 outline-none font-semibold" 
                placeholder="Search POs or suppliers..." 
              />
            </div>

            <div className="flex items-center gap-2 mb-3">
              {(["All POs", "Draft", "In Transit"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={
                    tab === filterTab
                      ? "px-3 py-1 rounded-full text-xs font-bold bg-white text-black shadow-sm"
                      : "px-3 py-1 rounded-full text-xs font-semibold text-zinc-400 hover:text-white"
                  }
                >
                  {tab}
                  {tab === "Draft" && <span className="ml-1 opacity-70">({draftCount})</span>}
                  {tab === "In Transit" && <span className="ml-1 opacity-70">({inTransitCount})</span>}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2 max-h-[550px] overflow-y-auto pr-1">
              {filteredPOs.map((po) => {
                const isSelected = po.id === selectedPo?.id
                return (
                  <div 
                    key={po.id} 
                    onClick={() => setSelectedPoId(po.id)}
                    className={`rounded-2xl p-3 cursor-pointer transition-all border ${
                      isSelected ? "bg-white/20 border-white/40 shadow-lg" : "hover:bg-white/10 border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center">
                          <Truck className="size-4 text-zinc-300" />
                        </div>
                        <div>
                          <p className="text-white text-xs font-mono font-black">{po.poNumber}</p>
                          <p className="text-zinc-400 text-[11px] font-semibold line-clamp-1">{po.supplier}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${po.statusColor}`}>
                        {po.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-400 border-t border-white/10">
                      <span className="font-mono text-emerald-400 font-bold">{po.warehouse}</span>
                      <p className="text-white text-xs font-black font-mono">ETB {po.amount.toLocaleString()}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </GlassCard>

          {/* Right: PO detail */}
          {selectedPo ? (
            <GlassCard transition={{ delay: 0.22, duration: 0.4 }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">PURCHASE ORDER DETAILS</p>
                  <h2 className="text-2xl font-black text-black font-mono">{selectedPo.poNumber}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      selectedPo.status === "RECEIVED" ? "bg-emerald-100 text-emerald-800" :
                      selectedPo.status === "IN TRANSIT" ? "bg-blue-100 text-blue-800" : "bg-zinc-200 text-zinc-800"
                    }`}>
                      <span className="size-2 rounded-full bg-current" />
                      {selectedPo.status}
                    </span>
                    <span className="flex items-center gap-1 bg-black/5 text-zinc-700 text-xs px-3 py-1 rounded-full font-bold">
                      <Package className="size-3.5 text-zinc-500" />
                      {selectedPo.warehouseName || selectedPo.warehouse}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="size-9 rounded-full border border-black/10 flex items-center justify-center hover:bg-black/5">
                    <Printer className="size-4 text-zinc-600" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-black/[0.03] rounded-2xl p-4 mb-5 border border-black/5">
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Supplier</p>
                  <p className="font-extrabold text-xs text-zinc-900 mt-0.5">{selectedPo.supplier}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Order Date</p>
                  <p className="font-extrabold text-xs text-zinc-900 mt-0.5 font-mono">{selectedPo.date}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">ETA Status</p>
                  <p className="font-extrabold text-xs text-zinc-900 mt-0.5">{selectedPo.eta}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Total Value</p>
                  <p className="font-black text-sm text-zinc-950 mt-0.5 font-mono">ETB {selectedPo.amount.toLocaleString()}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <div className="grid grid-cols-[1fr_80px_110px_110px] text-[10px] font-black text-zinc-400 uppercase tracking-wider px-2 mb-2">
                  <span>ITEM / SKU</span>
                  <span className="text-right">QTY</span>
                  <span className="text-right">UNIT PRICE</span>
                  <span className="text-right">TOTAL</span>
                </div>
                <div className="divide-y divide-zinc-100 bg-white/60 rounded-2xl border border-zinc-200/60 overflow-hidden">
                  {selectedPo.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-[1fr_80px_110px_110px] items-center p-3">
                      <div>
                        <p className="text-xs font-bold text-zinc-900">{item.name}</p>
                        <p className="text-[10px] font-mono text-zinc-400">{item.sku}</p>
                      </div>
                      <p className="text-xs font-extrabold text-zinc-900 text-right font-mono">{item.qty} {item.unit}</p>
                      <p className="text-xs font-medium text-zinc-600 text-right font-mono">ETB {item.unitPrice.toLocaleString()}</p>
                      <p className="text-xs font-black text-zinc-950 text-right font-mono">ETB {item.total.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
                <p className="text-[10px] font-medium text-zinc-400">Category: {selectedPo.category}</p>
                <div className="flex items-center gap-3">
                  {selectedPo.status !== "RECEIVED" && (
                    <button 
                      onClick={() => handleMarkReceived(selectedPo.id)}
                      className="px-5 py-2 rounded-full bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 shadow-md active:scale-95 transition-all"
                    >
                      Mark Stock Received
                    </button>
                  )}
                  {selectedPo.status === "RECEIVED" && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="size-4" /> Stock Deposited in {selectedPo.warehouse}
                    </span>
                  )}
                </div>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="flex items-center justify-center p-12">
              <p className="text-xs font-bold text-zinc-400">Select a Purchase Order to view details.</p>
            </GlassCard>
          )}
        </div>
      </motion.div>

      {/* New PO Modal */}
      <AnimatePresence>
        {isNewPoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-200"
            >
              <h2 className="text-xl font-black text-zinc-950 mb-1">Create HKC Purchase Order</h2>
              <p className="text-xs font-semibold text-zinc-500 mb-5">Draft a new procurement PO for agricultural sourcing or import.</p>

              <form onSubmit={handleCreatePo} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Supplier</label>
                  <input 
                    type="text" 
                    value={newSupplier}
                    onChange={(e) => setNewSupplier(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold outline-none" 
                    placeholder="Supplier name..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Destination Warehouse</label>
                    <select 
                      value={newWarehouse}
                      onChange={(e) => setNewWarehouse(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold outline-none"
                    >
                      <option value="WH1">WH1 - Export Hub (Local)</option>
                      <option value="WH2">WH2 - Vet Import (India)</option>
                      <option value="WH3">WH3 - Vet Import (China)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Item Description</label>
                    <input 
                      type="text" 
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold outline-none" 
                      placeholder="e.g. Yirgacheffe Coffee / Oxytetracycline"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Quantity</label>
                    <input 
                      type="number" 
                      value={newQty}
                      onChange={(e) => setNewQty(e.target.value ? Number(e.target.value) : "")}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold outline-none" 
                      placeholder="e.g. 500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Unit Price (ETB)</label>
                    <input 
                      type="number" 
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value ? Number(e.target.value) : "")}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold outline-none" 
                      placeholder="e.g. 450"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button 
                    type="button" 
                    onClick={() => setIsNewPoOpen(false)}
                    className="px-4 py-2 rounded-full border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-100"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 rounded-full bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-800 shadow-md"
                  >
                    Draft Purchase Order
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
