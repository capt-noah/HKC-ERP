import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Building,
  Receipt,
  PieChart,
  Plus,
  X
} from "lucide-react"
import { FloatingNav } from "@/components/FloatingNav"
import { GlassCard } from "@/components/GlassCard"
import { SubPageNav } from "@/components/SubPageNav"
import { navSections, getSectionChildren } from "@/lib/nav-config"
import { useFeedback } from "@/context/FeedbackContext"

const fade = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }
const stagger = { visible: { transition: { staggerChildren: 0.05 } } }

interface FixedAsset {
  id: string
  name: string
  category: "Vehicles" | "Machinery" | "IT Hardware" | "Buildings" | "Office Equipment"
  purchaseDate: string
  cost: number
  salvageValue: number
  usefulLifeYears: number
  accumulatedDepreciation: number
  status: "Active" | "Disposed" | "Fully Depreciated"
}

interface CostCenterBudget {
  id: string
  code: string
  name: string
  manager: string
  annualBudget: number
  ytdActual: number
  controlPolicy: "Warn" | "Stop"
}

interface TaxRule {
  id: string
  name: string
  ratePercent: number
  type: "VAT/GST" | "Withholding Tax (TDS)" | "Import Duty"
  accountCode: string
  isInclusive: boolean
}

const initialFixedAssets: FixedAsset[] = [
  { id: "AST-001", name: "Delivery Truck Isuzu 5-Ton", category: "Vehicles", purchaseDate: "2024-01-15", cost: 1200000, salvageValue: 200000, usefulLifeYears: 5, accumulatedDepreciation: 400000, status: "Active" },
  { id: "AST-002", name: "Warehouse Automatic Forklift", category: "Machinery", purchaseDate: "2024-06-10", cost: 450000, salvageValue: 50000, usefulLifeYears: 8, accumulatedDepreciation: 100000, status: "Active" },
  { id: "AST-003", name: "HQ Dell PowerEdge Server Rack", category: "IT Hardware", purchaseDate: "2025-02-01", cost: 180000, salvageValue: 20000, usefulLifeYears: 4, accumulatedDepreciation: 60000, status: "Active" },
  { id: "AST-004", name: "Bole Logistics Office Premises", category: "Buildings", purchaseDate: "2022-03-01", cost: 8500000, salvageValue: 2000000, usefulLifeYears: 25, accumulatedDepreciation: 1040000, status: "Active" },
]

const initialCostCenters: CostCenterBudget[] = [
  { id: "CC-100", code: "100", name: "Operations & Logistics", manager: "Abebe Bikila", annualBudget: 2500000, ytdActual: 1820000, controlPolicy: "Stop" },
  { id: "CC-200", code: "200", name: "Sales & Distribution", manager: "Tigist Lemma", annualBudget: 1800000, ytdActual: 1450000, controlPolicy: "Warn" },
  { id: "CC-300", code: "300", name: "R&D / Technical Services", manager: "Dawit Yilma", annualBudget: 900000, ytdActual: 510000, controlPolicy: "Warn" },
  { id: "CC-400", code: "400", name: "Executive & Admin", manager: "Helen Kebede", annualBudget: 1200000, ytdActual: 980000, controlPolicy: "Stop" },
]

const initialTaxRules: TaxRule[] = [
  { id: "TAX-01", name: "Standard VAT 15%", ratePercent: 15, type: "VAT/GST", accountCode: "2200", isInclusive: false },
  { id: "TAX-02", name: "Zero-Rated Export 0%", ratePercent: 0, type: "VAT/GST", accountCode: "2200", isInclusive: false },
  { id: "TAX-03", name: "Withholding Tax Services 2%", ratePercent: 2, type: "Withholding Tax (TDS)", accountCode: "2210", isInclusive: true },
  { id: "TAX-04", name: "Withholding Tax Goods 5%", ratePercent: 5, type: "Withholding Tax (TDS)", accountCode: "2210", isInclusive: true },
]

export default function AssetsAndTax() {
  const { showToast } = useFeedback()

  const [activeTab, setActiveTab] = useState<"FixedAssets" | "Taxation" | "Budgeting">("FixedAssets")

  // Fixed Asset State
  const [assets, setAssets] = useState<FixedAsset[]>(initialFixedAssets)
  const [showAddAssetModal, setShowAddAssetModal] = useState(false)
  const [newAssetName, setNewAssetName] = useState("")
  const [newAssetCategory, setNewAssetCategory] = useState<FixedAsset["category"]>("Vehicles")
  const [newAssetCost, setNewAssetCost] = useState("")
  const [newAssetSalvage, setNewAssetSalvage] = useState("")
  const [newAssetLife, setNewAssetLife] = useState("5")

  // Budget & Tax state
  const [costCenters] = useState<CostCenterBudget[]>(initialCostCenters)
  const [taxRules] = useState<TaxRule[]>(initialTaxRules)

  const handleRunDepreciation = (ast: FixedAsset) => {
    const annualDepr = (ast.cost - ast.salvageValue) / ast.usefulLifeYears
    const monthlyDepr = annualDepr / 12

    setAssets((prev) =>
      prev.map((a) =>
        a.id === ast.id
          ? { ...a, accumulatedDepreciation: Math.min(a.cost - a.salvageValue, a.accumulatedDepreciation + monthlyDepr) }
          : a
      )
    )

    showToast(
      "Depreciation Posted",
      "success",
      `Posted ETB ${monthlyDepr.toLocaleString("en-US", { maximumFractionDigits: 2 })} monthly straight-line depreciation for ${ast.name}.`
    )
  }

  const handleRegisterAsset = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAssetName || !newAssetCost) {
      showToast("Validation Error", "warning", "Asset name and acquisition cost are required.")
      return
    }

    const costVal = parseFloat(newAssetCost) || 0
    const salvageVal = parseFloat(newAssetSalvage) || 0
    const lifeVal = parseInt(newAssetLife, 10) || 5

    const newAst: FixedAsset = {
      id: `AST-${String(assets.length + 1).padStart(3, "0")}`,
      name: newAssetName,
      category: newAssetCategory,
      purchaseDate: new Date().toISOString().slice(0, 10),
      cost: costVal,
      salvageValue: salvageVal,
      usefulLifeYears: lifeVal,
      accumulatedDepreciation: 0,
      status: "Active",
    }

    setAssets([newAst, ...assets])
    setShowAddAssetModal(false)
    setNewAssetName("")
    setNewAssetCost("")
    setNewAssetSalvage("")
    showToast("Asset Registered", "success", `Asset ${newAst.name} (${newAst.id}) added to registry.`)
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
            <h1 className="text-3xl font-black text-black tracking-tight">Fixed Assets, Tax & Budgeting</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Capital equipment asset registry, depreciation calculation, tax templates, and departmental budget controls.
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
              { id: "FixedAssets", label: "Fixed Assets Registry", icon: Building },
              { id: "Taxation", label: "Tax Templates & Rates", icon: Receipt },
              { id: "Budgeting", label: "Cost Centers & Budget Policy", icon: PieChart },
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
                      layoutId="assets-tabs"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-4">
            {activeTab === "FixedAssets" && (
              <button
                onClick={() => setShowAddAssetModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-black text-white hover:bg-zinc-800 px-3.5 py-1.5 rounded-full shadow-xs transition-all"
              >
                <Plus className="size-3.5" /> Register Capital Asset
              </button>
            )}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* TAB 1: Fixed Assets */}
          {activeTab === "FixedAssets" && (
            <motion.div
              key="assets-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <GlassCard className="p-4 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Fixed Asset Registry & Straight-Line Depreciation</h3>
                  <p className="text-xs text-zinc-500">Calculate useful life depreciation schedules and post directly to general ledger accounts.</p>
                </div>
              </GlassCard>

              {/* Asset KPI Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassCard className="p-4">
                  <div className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Total Original Acquisition Cost</div>
                  <div className="text-xl font-black text-zinc-900 font-mono mt-1">
                    ETB {assets.reduce((s, a) => s + a.cost, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Accumulated Depreciation</div>
                  <div className="text-xl font-black text-rose-600 font-mono mt-1">
                    ETB {assets.reduce((s, a) => s + a.accumulatedDepreciation, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Net Carrying Book Value</div>
                  <div className="text-xl font-black text-emerald-600 font-mono mt-1">
                    ETB {assets.reduce((s, a) => s + (a.cost - a.accumulatedDepreciation), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </GlassCard>
              </div>

              {/* Assets Table */}
              <GlassCard className="overflow-hidden p-0">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200/80 bg-zinc-50/80 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                      <th className="px-4 py-3">Asset Description / Code</th>
                      <th className="px-4 py-3">Asset Category</th>
                      <th className="px-4 py-3 text-right">Original Cost</th>
                      <th className="px-4 py-3 text-right">Accumulated Depr.</th>
                      <th className="px-4 py-3 text-right">Net Book Value</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right pr-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-xs">
                    {assets.map((ast) => {
                      const netVal = ast.cost - ast.accumulatedDepreciation
                      return (
                        <tr key={ast.id} className="hover:bg-zinc-50/60 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-bold text-zinc-900">{ast.name}</div>
                            <div className="text-[10px] font-mono text-zinc-400">{ast.id} | Acquired {ast.purchaseDate}</div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-zinc-700">{ast.category}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-zinc-900">
                            ETB {ast.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-rose-600">
                            ETB {ast.accumulatedDepreciation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                            ETB {netVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                              {ast.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right pr-4">
                            <button
                              onClick={() => handleRunDepreciation(ast)}
                              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-full transition-all"
                            >
                              Post Depreciation
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </GlassCard>
            </motion.div>
          )}

          {/* TAB 2: Taxation */}
          {activeTab === "Taxation" && (
            <motion.div
              key="tax-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <GlassCard className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Tax Templates & Compliance Registers</h3>
                  <p className="text-xs text-zinc-500">Configure sales VAT, withholding TDS rules, and input/output tax accounts.</p>
                </div>
              </GlassCard>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassCard className="p-4">
                  <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider mb-3">Configured Tax Templates</h4>
                  <div className="flex flex-col gap-2">
                    {taxRules.map((tax) => (
                      <div key={tax.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200/60 text-xs">
                        <div>
                          <div className="font-bold text-zinc-900">{tax.name}</div>
                          <div className="text-[10px] text-zinc-400">Account Code: {tax.accountCode} | {tax.type}</div>
                        </div>
                        <div className="text-right font-mono font-bold text-emerald-700 text-sm">
                          {tax.ratePercent}%
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="p-4">
                  <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider mb-3">YTD Tax Summary Register</h4>
                  <div className="flex flex-col gap-3 text-xs">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-50">
                      <span className="text-zinc-600 font-semibold">Sales Output VAT Collected (2200)</span>
                      <span className="font-mono font-bold text-zinc-900">ETB 342,800.00</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-50">
                      <span className="text-zinc-600 font-semibold">Purchase Input VAT Paid (1300)</span>
                      <span className="font-mono font-bold text-zinc-900">ETB 185,400.00</span>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-xl bg-emerald-50 border border-emerald-200/60">
                      <span className="font-bold text-emerald-900">Net Tax Payable to Revenue Authority</span>
                      <span className="font-mono font-black text-emerald-700 text-sm">ETB 157,400.00</span>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}

          {/* TAB 3: Cost Centers & Budgeting */}
          {activeTab === "Budgeting" && (
            <motion.div
              key="budget-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <GlassCard className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Departmental Cost Centers & Budget Controls</h3>
                  <p className="text-xs text-zinc-500">Monitor budget variance and enforce stop/warning policy locks on general ledger transactions.</p>
                </div>
              </GlassCard>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {costCenters.map((cc) => {
                  const pct = Math.round((cc.ytdActual / cc.annualBudget) * 100)
                  const isHigh = pct >= 80

                  return (
                    <GlassCard key={cc.id} className="p-4 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-zinc-400">CC-{cc.code}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cc.controlPolicy === "Stop" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
                          }`}>
                            Policy: {cc.controlPolicy}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-zinc-900 mt-1">{cc.name}</h4>
                        <div className="text-[10px] text-zinc-400">Manager: {cc.manager}</div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs font-mono font-bold">
                          <span className="text-zinc-500">YTD Spend</span>
                          <span className={isHigh ? "text-rose-600" : "text-zinc-900"}>
                            ETB {cc.ytdActual.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all ${isHigh ? "bg-rose-500" : "bg-emerald-500"}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                          <span>Budget: ETB {cc.annualBudget.toLocaleString()}</span>
                          <span>{pct}% Used</span>
                        </div>
                      </div>
                    </GlassCard>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Register Asset Modal */}
        {showAddAssetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <GlassCard className="w-full max-w-md p-6 bg-white border border-black/10 shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
                <h3 className="text-sm font-bold text-zinc-900">Register New Capital Asset</h3>
                <button
                  onClick={() => setShowAddAssetModal(false)}
                  className="p-1 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleRegisterAsset} className="flex flex-col gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Asset Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Caterpillar Excavator 320"
                    value={newAssetName}
                    onChange={(e) => setNewAssetName(e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Category</label>
                    <select
                      value={newAssetCategory}
                      onChange={(e) => setNewAssetCategory(e.target.value as any)}
                      className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="Vehicles">Vehicles</option>
                      <option value="Machinery">Machinery</option>
                      <option value="IT Hardware">IT Hardware</option>
                      <option value="Buildings">Buildings</option>
                      <option value="Office Equipment">Office Equipment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Useful Life (Years)</label>
                    <input
                      type="number"
                      value={newAssetLife}
                      onChange={(e) => setNewAssetLife(e.target.value)}
                      className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Acquisition Cost (ETB)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newAssetCost}
                      onChange={(e) => setNewAssetCost(e.target.value)}
                      className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Salvage Value (ETB)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newAssetSalvage}
                      onChange={(e) => setNewAssetSalvage(e.target.value)}
                      className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setShowAddAssetModal(false)}
                    className="px-4 py-2 rounded-full text-zinc-500 font-bold hover:bg-zinc-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-black text-white font-bold hover:bg-zinc-800"
                  >
                    Save Asset
                  </button>
                </div>
              </form>
            </GlassCard>
          </div>
        )}
      </motion.div>
    </div>
  )
}
