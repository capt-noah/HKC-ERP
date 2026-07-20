import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  Search, 
  Filter, 
  X, 
  FileText, 
  Warehouse as WarehouseIcon, 
  Upload, 
  Calendar, 
  Eye
} from "lucide-react"
import { FloatingNav } from "@/components/FloatingNav"
import { GlassCard } from "@/components/GlassCard"
import { SubPageNav } from "@/components/SubPageNav"
import { navSections, getSectionChildren } from "@/lib/nav-config"
import { useFeedback } from "@/context/FeedbackContext"
import StoreTransfersTab from "@/components/StoreTransfersTab"

const fade = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }
const stagger = { visible: { transition: { staggerChildren: 0.05 } } }

interface StockBreakdown {
  warehouse: string
  qty: number
}

interface BatchInfo {
  batchNo: string
  qty: number
  expiry: string
  status: "Released" | "Pending QA" | "Quarantined"
}

interface Product {
  id: string
  name: string
  sku: string
  category: string
  warehouse: string
  quantity: number
  unit: string
  batch: string
  expiry: string
  status: "In Stock" | "Low Stock" | "Quarantined" | "Out of Stock"
  stockBreakdown: StockBreakdown[]
  batches: BatchInfo[]
}



interface RegulatoryDoc {
  id: string
  name: string
  type: string
  linkedBatch: string
  expiryDate: string
  status: "Valid" | "Expiring Soon" | "Expired"
}

const initialProducts: Product[] = [
  {
    id: "P-101",
    name: "Lidocaine HCl Monohydrate",
    sku: "PRD-LID-01",
    category: "API (Active Pharma Ingredient)",
    warehouse: "WH1",
    quantity: 1250,
    unit: "kg",
    batch: "B-LD26-09",
    expiry: "2028-09-12",
    status: "In Stock",
    stockBreakdown: [
      { warehouse: "WH1", qty: 1000 },
      { warehouse: "WH3", qty: 250 }
    ],
    batches: [
      { batchNo: "B-LD26-09", qty: 1000, expiry: "2028-09-12", status: "Released" },
      { batchNo: "B-LD26-08", qty: 250, expiry: "2027-05-18", status: "Released" }
    ]
  },
  {
    id: "P-102",
    name: "Adenosine Phosphate Buffer",
    sku: "PRD-ADP-04",
    category: "Reagents",
    warehouse: "WH2",
    quantity: 450,
    unit: "L",
    batch: "B-AP26-02",
    expiry: "2027-11-30",
    status: "Low Stock",
    stockBreakdown: [
      { warehouse: "WH2", qty: 450 }
    ],
    batches: [
      { batchNo: "B-AP26-02", qty: 450, expiry: "2027-11-30", status: "Released" }
    ]
  },
  {
    id: "P-103",
    name: "Sodium Chloride USP Grade",
    sku: "PRD-NAC-12",
    category: "Excipients",
    warehouse: "WH3",
    quantity: 5000,
    unit: "kg",
    batch: "B-NC26-44",
    expiry: "2029-01-15",
    status: "In Stock",
    stockBreakdown: [
      { warehouse: "WH3", qty: 5000 }
    ],
    batches: [
      { batchNo: "B-NC26-44", qty: 5000, expiry: "2029-01-15", status: "Released" }
    ]
  },
  {
    id: "P-104",
    name: "Epinephrine Ephedrine Sol.",
    sku: "PRD-EPI-09",
    category: "Controlled substances",
    warehouse: "WH2",
    quantity: 85,
    unit: "L",
    batch: "B-EP26-01",
    expiry: "2026-12-05",
    status: "Quarantined",
    stockBreakdown: [
      { warehouse: "WH2", qty: 85 }
    ],
    batches: [
      { batchNo: "B-EP26-01", qty: 85, expiry: "2026-12-05", status: "Quarantined" }
    ]
  }
]



const initialRegulatoryDocs: RegulatoryDoc[] = [
  {
    id: "DOC-301",
    name: "Certificate of Analysis (CoA) - B-LD26-09",
    type: "CoA",
    linkedBatch: "B-LD26-09",
    expiryDate: "2028-09-12",
    status: "Valid"
  },
  {
    id: "DOC-302",
    name: "Drug Master File (DMF) Registration",
    type: "DMF Registration",
    linkedBatch: "All Batches",
    expiryDate: "2030-01-01",
    status: "Valid"
  },
  {
    id: "DOC-303",
    name: "Import Customs Clearance License",
    type: "Customs License",
    linkedBatch: "B-NC26-44",
    expiryDate: "2026-10-31",
    status: "Valid"
  },
  {
    id: "DOC-304",
    name: "Stability Testing Report - Q3",
    type: "Stability Study",
    linkedBatch: "B-EP26-01",
    expiryDate: "2026-12-05",
    status: "Expiring Soon"
  }
]

export default function StockProducts() {
  const { showToast } = useFeedback()
  const [activeTab, setActiveTab] = useState<"Products" | "Transfers" | "Regulatory Docs">("Products")
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [docs, setDocs] = useState<RegulatoryDoc[]>(initialRegulatoryDocs)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedWarehouse, setSelectedWarehouse] = useState("ALL")
  const [selectedCategory, setSelectedCategory] = useState("ALL")

  // Slide-in Quick-Peek Panel
  const [peekProduct, setPeekProduct] = useState<Product | null>(null)
  const [adjustAmount, setAdjustAmount] = useState<number | "">("")
  const [adjustWarehouse, setAdjustWarehouse] = useState("")
  const [adjustBatch, setAdjustBatch] = useState("")

  // Add Item slide-in state & form
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newSKU, setNewSKU] = useState("")
  const [newCategory, setNewCategory] = useState("API (Active Pharma Ingredient)")
  const [newUnit, setNewUnit] = useState("kg")
  const [newWarehouse, setNewWarehouse] = useState("WH1")
  const [newQty, setNewQty] = useState<number | "">("")
  const [newBatchNo, setNewBatchNo] = useState("")
  const [newExpiry, setNewExpiry] = useState("")
  const [newHasDoc, setNewHasDoc] = useState(false)
  const [newDocName, setNewDocName] = useState("")

  // Unique Warehouses & Categories list for filters
  const warehouses = ["ALL", "WH1", "WH2", "WH3"]
  const categories = ["ALL", "API (Active Pharma Ingredient)", "Reagents", "Excipients", "Controlled substances"]

  // Handle Add Product Submission
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newSKU || newQty === "") {
      showToast("Validation Error", "warning", "Please provide a name, SKU, and starting quantity.")
      return
    }

    const qtyNum = Number(newQty)
    const productStatus = qtyNum > 500 ? "In Stock" : qtyNum > 0 ? "Low Stock" : "Out of Stock"
    const newId = `P-${Date.now().toString().slice(-3)}`

    const freshProduct: Product = {
      id: newId,
      name: newName,
      sku: newSKU,
      category: newCategory,
      warehouse: newWarehouse,
      quantity: qtyNum,
      unit: newUnit,
      batch: newBatchNo || "N/A",
      expiry: newExpiry || "N/A",
      status: productStatus,
      stockBreakdown: [{ warehouse: newWarehouse, qty: qtyNum }],
      batches: newBatchNo ? [{ batchNo: newBatchNo, qty: qtyNum, expiry: newExpiry, status: "Released" }] : []
    }

    setProducts((prev) => [freshProduct, ...prev])

    // Create a regulatory document if attached
    if (newHasDoc && newDocName) {
      const freshDoc: RegulatoryDoc = {
        id: `DOC-${Date.now().toString().slice(-3)}`,
        name: newDocName,
        type: "CoA",
        linkedBatch: newBatchNo || "General",
        expiryDate: newExpiry || "2029-12-31",
        status: "Valid"
      }
      setDocs((prev) => [freshDoc, ...prev])
    }

    showToast("Stock Item Added", "success", `${newName} (${newSKU}) successfully entered in ledger.`)
    
    // Reset Form
    setNewName("")
    setNewSKU("")
    setNewQty("")
    setNewBatchNo("")
    setNewExpiry("")
    setNewHasDoc(false)
    setNewDocName("")
    setIsAddOpen(false)
  }

  // Handle Stock Adjust from Quick Peek
  const handleAdjustStock = () => {
    if (!peekProduct || adjustAmount === "") return
    const change = Number(adjustAmount)
    const targetW = adjustWarehouse || peekProduct.warehouse
    const targetB = adjustBatch || peekProduct.batch

    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id === peekProduct.id) {
          const updatedQty = Math.max(0, prod.quantity + change)
          
          // Update Stock Breakdown
          let breakdownFound = false
          const updatedBreakdown = prod.stockBreakdown.map((item) => {
            if (item.warehouse === targetW) {
              breakdownFound = true
              return { ...item, qty: Math.max(0, item.qty + change) }
            }
            return item
          })
          if (!breakdownFound) {
            updatedBreakdown.push({ warehouse: targetW, qty: Math.max(0, change) })
          }

          // Update Batches
          let batchFound = false
          const updatedBatches = prod.batches.map((b) => {
            if (b.batchNo === targetB) {
              batchFound = true
              return { ...b, qty: Math.max(0, b.qty + change) }
            }
            return b
          })
          if (!batchFound && targetB !== "N/A") {
            updatedBatches.push({ batchNo: targetB, qty: Math.max(0, change), expiry: prod.expiry, status: "Released" })
          }

          const updatedStatus: "In Stock" | "Low Stock" | "Out of Stock" | "Quarantined" = 
            updatedQty > 500 ? "In Stock" : updatedQty > 0 ? "Low Stock" : "Out of Stock"

          const result: Product = {
            ...prod,
            quantity: updatedQty,
            stockBreakdown: updatedBreakdown.filter((x) => x.qty > 0),
            batches: updatedBatches.filter((x) => x.qty > 0),
            status: updatedStatus
          }

          // Refresh the Quick Peek display
          setPeekProduct(result)
          return result
        }
        return prod
      })
    )

    showToast("Stock Adjusted", "success", `Stock quantity adjusted by ${change > 0 ? "+" : ""}${change} ${peekProduct.unit}.`)
    setAdjustAmount("")
  }



  // Filtering Products
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.batch.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesWarehouse = selectedWarehouse === "ALL" || prod.stockBreakdown.some((b) => b.warehouse === selectedWarehouse)
    const matchesCategory = selectedCategory === "ALL" || prod.category === selectedCategory
    return matchesSearch && matchesWarehouse && matchesCategory
  })

  return (
    <div className="min-h-screen page-gradient">
      {/* Global Navigation Header */}
      <FloatingNav brand="HKC Trading ERP" sections={navSections} />

      <motion.div 
        variants={stagger} 
        initial="hidden" 
        animate="visible" 
        className="max-w-[98%] mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-12"
      >
        {/* Header Section */}
        <motion.div variants={fade} className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight">Stock & Products</h1>
            <p className="text-xs font-semibold text-zinc-500 max-w-xl leading-relaxed mt-1">
              Oversee high-compliance pharmaceutical ingredients, trace certified batches, and clear critical QA regulatory documents.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 self-end md:self-start">
            <SubPageNav items={getSectionChildren("/inventory")} />
            
            <button 
              onClick={() => {
                setNewCategory("API (Active Pharma Ingredient)")
                setNewWarehouse("Cold-Chain A")
                setIsAddOpen(true)
              }}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
            >
              <Plus className="size-4" /> Add Item
            </button>
          </div>
        </motion.div>

        {/* Tab Selection, Filters, and Search Block */}
        <motion.div variants={fade} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center mb-6 pb-2 border-b border-zinc-200/50">
          {/* Tab Switcher */}
          <div className="lg:col-span-5 flex gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: "Products", label: "Active Products" },
              { id: "Transfers", label: "Store Transfers" },
              { id: "Regulatory Docs", label: "Regulatory Docs" }
            ].map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any)
                    setSearchQuery("")
                  }}
                  className="px-4 py-2.5 text-xs font-black relative tracking-tight transition-colors uppercase shrink-0"
                >
                  <span className={isActive ? "text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-700"}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="stock-tabs"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-950"
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Quick Filters - Visible only in Products Tab */}
          {activeTab === "Products" && (
            <div className="lg:col-span-7 flex flex-col sm:flex-row items-center gap-2.5 w-full">
              {/* Search Bar */}
              <div className="flex items-center gap-2 bg-white/60 border border-zinc-200/60 rounded-full px-3.5 py-1.5 flex-1 w-full">
                <Search className="size-3.5 text-zinc-400 shrink-0" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, SKU, or batch..."
                  className="bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 outline-none w-full font-medium"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")}>
                    <X className="size-3 text-zinc-400" />
                  </button>
                )}
              </div>

              {/* Warehouse Filter */}
              <div className="flex items-center gap-1.5 bg-white/60 border border-zinc-200/60 rounded-full px-3 py-1.5 w-full sm:w-auto">
                <WarehouseIcon className="size-3.5 text-zinc-400 shrink-0 ml-1" />
                <select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="bg-transparent text-[11px] font-bold text-zinc-700 outline-none pr-1.5 cursor-pointer max-w-[130px]"
                >
                  {warehouses.map((w) => (
                    <option key={w} value={w} className="font-bold text-zinc-800">
                      {w === "ALL" ? "All Warehouses" : w}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5 bg-white/60 border border-zinc-200/60 rounded-full px-3 py-1.5 w-full sm:w-auto">
                <Filter className="size-3.5 text-zinc-400 shrink-0 ml-1" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-[11px] font-bold text-zinc-700 outline-none pr-1.5 cursor-pointer max-w-[140px]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="font-bold text-zinc-800">
                      {c === "ALL" ? "All Categories" : c.split(" ")[0]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </motion.div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {/* TAB 1: ACTIVE PRODUCTS TABLE */}
          {activeTab === "Products" && (
            <motion.div
              key="products-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <GlassCard className="p-0 overflow-hidden border border-white/65 shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/[0.02] border-b border-zinc-200/40 text-[10px] font-black tracking-wider text-zinc-400 uppercase">
                        <th className="py-4.5 px-6">Product & SKU</th>
                        <th className="py-4.5 px-4">Category</th>
                        <th className="py-4.5 px-4">Primary Warehouse</th>
                        <th className="py-4.5 px-4 text-right">Available Qty</th>
                        <th className="py-4.5 px-4">Latest Batch</th>
                        <th className="py-4.5 px-6 text-center">Compliance status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-150/40">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-16 text-zinc-400 text-xs font-medium">
                            No products match your active search filters.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((prod) => {
                          const statusColors = 
                            prod.status === "In Stock" ? "bg-green-50 text-green-700 border-green-200" :
                            prod.status === "Low Stock" ? "bg-zinc-100 text-zinc-700 border-zinc-200" :
                            prod.status === "Quarantined" ? "bg-black text-white border-black" :
                            "bg-zinc-100 text-zinc-500 border-zinc-200"

                          return (
                            <motion.tr
                              key={prod.id}
                              onClick={() => {
                                setPeekProduct(prod)
                                setAdjustWarehouse(prod.warehouse)
                                setAdjustBatch(prod.batch)
                              }}
                              className="hover:bg-white/45 cursor-pointer transition-colors"
                              whileHover={{ scale: 1.002 }}
                            >
                              {/* Product Info */}
                              <td className="py-4 px-6">
                                <div className="flex flex-col">
                                  <span className="font-extrabold text-zinc-950 text-xs tracking-tight leading-tight mb-0.5">
                                    {prod.name}
                                  </span>
                                  <span className="font-mono text-[10px] text-zinc-400 font-bold uppercase">
                                    {prod.sku}
                                  </span>
                                </div>
                              </td>

                              {/* Category */}
                              <td className="py-4 px-4">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight bg-zinc-100 border border-zinc-200/50 px-2 py-0.5 rounded-full">
                                  {prod.category}
                                </span>
                              </td>

                              {/* Warehouse */}
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600">
                                  <WarehouseIcon className="size-3 text-zinc-400 shrink-0" />
                                  <span>{prod.warehouse}</span>
                                </div>
                              </td>

                              {/* Qty */}
                              <td className="py-4 px-4 text-right">
                                <span className="font-mono font-black text-zinc-900 text-xs">
                                  {prod.quantity.toLocaleString()}
                                </span>
                                <span className="text-[10px] font-bold text-zinc-400 ml-1 uppercase">
                                  {prod.unit}
                                </span>
                              </td>

                              {/* Batch / Expiry */}
                              <td className="py-4 px-4">
                                <div className="flex flex-col">
                                  <span className="font-mono text-[11px] font-black text-zinc-700 leading-none mb-1">
                                    {prod.batch}
                                  </span>
                                  <span className="text-[9px] font-bold text-zinc-400 flex items-center gap-1">
                                    <Calendar className="size-2.5 shrink-0" />
                                    Exp: {prod.expiry}
                                  </span>
                                </div>
                              </td>

                              {/* Compliance Status */}
                              <td className="py-4 px-6 text-center">
                                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${statusColors}`}>
                                  {prod.status}
                                </span>
                              </td>
                            </motion.tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* TAB 2: STORE TRANSFERS */}
          {activeTab === "Transfers" && (
            <motion.div
              key="transfers-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <StoreTransfersTab />
            </motion.div>
          )}

          {/* TAB 3: REGULATORY DOCUMENTS */}
          {activeTab === "Regulatory Docs" && (
            <motion.div
              key="docs-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {docs.map((doc) => {
                const isExpiring = doc.status === "Expiring Soon"
                const isExpired = doc.status === "Expired"

                return (
                  <GlassCard 
                    key={doc.id} 
                    className="p-5 flex flex-col justify-between"
                    whileHover={{ y: -3 }}
                  >
                    <div>
                      {/* Document Type Header */}
                      <div className="flex items-center justify-between mb-3 border-b border-zinc-100 pb-2.5">
                        <div className="flex items-center gap-1.5">
                          <FileText className="size-4 text-zinc-600 shrink-0" />
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tight">
                            {doc.type}
                          </span>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          isExpired ? "bg-black text-white border-black" :
                          isExpiring ? "bg-zinc-100 text-zinc-700 border-zinc-200 animate-pulse" :
                          "bg-green-50 text-green-700 border-green-200"
                        }`}>
                          {doc.status}
                        </span>
                      </div>

                      <h4 className="text-xs font-black text-zinc-950 tracking-tight leading-snug mb-2.5">
                        {doc.name}
                      </h4>

                      {/* Details */}
                      <div className="space-y-1.5 mb-4 text-[10px] font-bold text-zinc-500">
                        <div className="flex justify-between">
                          <span>Target Batch:</span>
                          <span className="font-mono text-zinc-800">{doc.linkedBatch}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Verification ID:</span>
                          <span className="font-mono text-zinc-800">{doc.id}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expiry / Download Row */}
                    <div className="border-t border-zinc-150/40 pt-3 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-zinc-400 uppercase">Validity date</span>
                        <span className="font-mono text-[10px] font-extrabold text-zinc-700 mt-0.5">
                          {doc.expiryDate}
                        </span>
                      </div>
                      <button 
                        onClick={() => showToast("Downloading Document", "info", `Fetching PDF for ${doc.id}`)}
                        className="p-1.5 rounded-lg border border-zinc-200/60 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800 transition-colors"
                        title="Download Document"
                      >
                        <Eye className="size-3.5" />
                      </button>
                    </div>
                  </GlassCard>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ==================== SLIDE-IN QUICK PEEK PANEL ==================== */}
      <AnimatePresence>
        {peekProduct && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setPeekProduct(null)
                setAdjustAmount("")
              }}
              className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[100]"
            />

            {/* Slide-over Content Card */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full max-w-lg bg-zinc-50/98 backdrop-blur-md shadow-2xl border-l border-zinc-200/80 p-6 z-[101] overflow-y-auto flex flex-col justify-between"
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-zinc-200/60 mb-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Product Details Peek</span>
                    <h2 className="text-xl font-black text-zinc-950 tracking-tight leading-none">
                      {peekProduct.name}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setPeekProduct(null)
                      setAdjustAmount("")
                    }}
                    className="size-8 rounded-full border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center transition-colors text-zinc-500"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">Global SKU Code</span>
                    <span className="font-mono text-xs font-black text-zinc-900 bg-white border border-zinc-200 px-3 py-1 rounded-xl block">
                      {peekProduct.sku}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">Standard Unit</span>
                    <span className="text-xs font-bold text-zinc-700 bg-white border border-zinc-200 px-3 py-1 rounded-xl block uppercase">
                      {peekProduct.unit}
                    </span>
                  </div>
                </div>

                {/* Stock Breakdown */}
                <div className="mb-6">
                  <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-2.5">
                    Storage Breakdown
                  </h3>
                  <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 space-y-3 shadow-sm">
                    {peekProduct.stockBreakdown.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs font-bold text-zinc-700">
                        <div className="flex items-center gap-1.5">
                          <WarehouseIcon className="size-3.5 text-zinc-400 shrink-0" />
                          <span>{item.warehouse}</span>
                        </div>
                        <span className="font-mono font-black text-zinc-950">
                          {item.qty} {peekProduct.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Batches Info */}
                <div className="mb-6">
                  <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-2.5">
                    Traced Compliance Batches
                  </h3>
                  <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-200 text-[9px] font-black text-zinc-400 uppercase">
                          <th className="py-2.5 px-4">Batch #</th>
                          <th className="py-2.5 px-2 text-right">Qty</th>
                          <th className="py-2.5 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-150">
                        {peekProduct.batches.map((b, idx) => (
                          <tr key={idx} className="font-bold text-zinc-700">
                            <td className="py-3 px-4 font-mono">{b.batchNo}</td>
                            <td className="py-3 px-2 text-right font-mono text-zinc-950">
                              {b.qty} {peekProduct.unit}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase ${
                                b.status === "Released" ? "bg-green-50 text-green-700 border-green-200" :
                                "bg-zinc-100 text-zinc-700 border-zinc-200"
                              }`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Adjust Stock Form (Footer block) */}
              <div className="border-t border-zinc-200/80 pt-5 mt-6 bg-zinc-100/50 -mx-6 -mb-6 p-6">
                <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider mb-3">
                  Direct Ledger Adjustment
                </h3>
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">Target Warehouse</label>
                      <select
                        value={adjustWarehouse}
                        onChange={(e) => setAdjustWarehouse(e.target.value)}
                        className="w-full bg-white border border-zinc-200/80 px-3 py-2 rounded-xl text-xs font-bold outline-none"
                      >
                        {warehouses.filter(w => w !== "ALL").map((w) => (
                          <option key={w} value={w}>{w}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">Target Batch</label>
                      <select
                        value={adjustBatch}
                        onChange={(e) => setAdjustBatch(e.target.value)}
                        className="w-full bg-white border border-zinc-200/80 px-3 py-2 rounded-xl text-xs font-bold outline-none font-mono"
                      >
                        {peekProduct.batches.map((b) => (
                          <option key={b.batchNo} value={b.batchNo}>{b.batchNo}</option>
                        ))}
                        <option value="NEW">Create New Batch</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        placeholder="Quantity change (e.g. -50, 100)"
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full bg-white border border-zinc-200/80 px-4 py-2.5 rounded-xl text-xs font-bold outline-none"
                      />
                      <span className="absolute right-4 top-2.5 text-xs font-bold text-zinc-400 uppercase">
                        {peekProduct.unit}
                      </span>
                    </div>
                    <button
                      onClick={handleAdjustStock}
                      disabled={adjustAmount === ""}
                      className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-wider ${
                        adjustAmount === "" 
                          ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                          : "bg-zinc-950 hover:bg-zinc-900 text-white shadow-md active:scale-95"
                      }`}
                    >
                      Post Change
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ==================== SLIDE-IN ADD ITEM FORM PANEL ==================== */}
      <AnimatePresence>
        {isAddOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)}
              className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[100]"
            />

            {/* Slide-over Form Container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full max-w-lg bg-zinc-50/98 backdrop-blur-md shadow-2xl border-l border-zinc-200/80 p-6 z-[101] overflow-y-auto flex flex-col justify-between"
            >
              <form onSubmit={handleAddProduct} className="flex flex-col h-full justify-between">
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-200/60 mb-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Compliance Module</span>
                      <h2 className="text-xl font-black text-zinc-950 tracking-tight leading-none">
                        Add New Stock Item
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddOpen(false)}
                      className="size-8 rounded-full border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center transition-colors text-zinc-500"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  {/* SECTION 1: Basic Info */}
                  <div className="space-y-4 mb-6">
                    <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                      Basic Info
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Product Name</label>
                        <input
                          type="text"
                          required
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="e.g. Lidocaine Hydrochloride"
                          className="w-full bg-white border border-zinc-200 px-3.5 py-2 rounded-xl text-xs font-semibold outline-none focus:border-zinc-950 transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">SKU / Catalog Code</label>
                          <input
                            type="text"
                            required
                            value={newSKU}
                            onChange={(e) => setNewSKU(e.target.value)}
                            placeholder="e.g. PRD-LID-15"
                            className="w-full bg-white border border-zinc-200 px-3.5 py-2 rounded-xl text-xs font-semibold outline-none focus:border-zinc-950 transition-colors font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Stock Unit</label>
                          <input
                            type="text"
                            required
                            value={newUnit}
                            onChange={(e) => setNewUnit(e.target.value)}
                            placeholder="e.g. kg, L, vials"
                            className="w-full bg-white border border-zinc-200 px-3.5 py-2 rounded-xl text-xs font-semibold outline-none focus:border-zinc-950 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Product Category</label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full bg-white border border-zinc-200 px-3 py-2 rounded-xl text-xs font-semibold outline-none"
                        >
                          {categories.filter(c => c !== "ALL").map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: Warehouse & Stock */}
                  <div className="space-y-4 mb-6">
                    <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                      Warehouse & Stock
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Primary Warehouse</label>
                          <select
                            value={newWarehouse}
                            onChange={(e) => setNewWarehouse(e.target.value)}
                            className="w-full bg-white border border-zinc-200 px-3 py-2 rounded-xl text-xs font-semibold outline-none"
                          >
                            {warehouses.filter(w => w !== "ALL").map((w) => (
                              <option key={w} value={w}>{w}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Starting Qty</label>
                          <input
                            type="number"
                            required
                            value={newQty}
                            onChange={(e) => setNewQty(e.target.value === "" ? "" : Number(e.target.value))}
                            placeholder="0"
                            className="w-full bg-white border border-zinc-200 px-3.5 py-2 rounded-xl text-xs font-semibold outline-none focus:border-zinc-950 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 bg-zinc-100/50 p-3.5 rounded-2xl border border-zinc-200/40">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Batch Number</label>
                          <input
                            type="text"
                            value={newBatchNo}
                            onChange={(e) => setNewBatchNo(e.target.value)}
                            placeholder="e.g. B-LD26-12"
                            className="w-full bg-white border border-zinc-200 px-3.5 py-2 rounded-xl text-xs font-semibold outline-none focus:border-zinc-950 transition-colors font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Expiry Date</label>
                          <input
                            type="date"
                            value={newExpiry}
                            onChange={(e) => setNewExpiry(e.target.value)}
                            className="w-full bg-white border border-zinc-200 px-3.5 py-2 rounded-xl text-xs font-semibold outline-none focus:border-zinc-950 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: Regulatory Docs (upload zone style) */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                        Compliance Documentation
                      </h3>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newHasDoc}
                          onChange={(e) => setNewHasDoc(e.target.checked)}
                          className="rounded text-zinc-950 focus:ring-zinc-900 size-3"
                        />
                        <span className="text-[10px] font-bold text-zinc-600">Attach verification file</span>
                      </label>
                    </div>

                    {newHasDoc && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-zinc-200 p-4 rounded-2xl space-y-3 shadow-sm"
                      >
                        <div>
                          <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Document File Name</label>
                          <input
                            type="text"
                            required
                            value={newDocName}
                            onChange={(e) => setNewDocName(e.target.value)}
                            placeholder="e.g. Certificate of Analysis - B-LD26-12"
                            className="w-full bg-zinc-50 border border-zinc-200 px-3.5 py-2 rounded-xl text-xs font-semibold outline-none focus:border-zinc-950 transition-colors"
                          />
                        </div>

                        <div className="border border-dashed border-zinc-200 hover:border-zinc-950 hover:bg-zinc-50 rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5">
                          <Upload className="size-5 text-zinc-400" />
                          <span className="text-[10px] font-bold text-zinc-600">Drag & drop or browse PDF file</span>
                          <span className="text-[8px] font-semibold text-zinc-400 uppercase">Limit 10MB</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 border-t border-zinc-200/80 pt-5 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="flex-1 py-2.5 rounded-full border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-bold transition-all uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-full bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-bold transition-all uppercase tracking-wider shadow-md shadow-black/10"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
