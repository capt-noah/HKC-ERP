import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  Search, 
  X, 
  Warehouse as WarehouseIcon, 
  Calendar, 
  Eye, 
  Check, 
  Trash2, 
  Lock, 
  Shield, 
  AlertTriangle, 
  Download, 
  User, 
  Clock,
  ArrowRight,
  Edit
} from "lucide-react"
import { GlassCard } from "@/components/GlassCard"
import { useFeedback } from "@/context/FeedbackContext"

// --- TYPES ---
export type TransferStatus = "Issued" | "Received" | "Discrepancy"

export interface TransferLineItem {
  line_no: number
  item: string
  UOM: string
  quantity: number
  remark?: string
}

export interface Transfer {
  reference_number: string
  from_warehouse: string
  to_warehouse: string
  status: TransferStatus
  line_items: TransferLineItem[]
  total_quantity: number
  issued_by?: string
  issued_at?: string
  received_by?: string
  received_at?: string
  discrepancy_remark?: string
  issued_signature?: string // Simulated signature graphic text/style
  received_signature?: string
  date: string
}

interface MockUser {
  name: string
  role: "Store Manager" | "Warehouse Operator"
  warehouse: string
  signature: string
}

// --- MOCK CONSTANTS ---
const WAREHOUSES = [
  "WH1",
  "WH2",
  "WH3"
]

const PRODUCTS_POOL = [
  { name: "Lidocaine HCl Monohydrate", sku: "PRD-LID-01", defaultUOM: "Carton" },
  { name: "Adenosine Phosphate Buffer", sku: "PRD-ADP-04", defaultUOM: "L" },
  { name: "Sodium Chloride USP Grade", sku: "PRD-NAC-12", defaultUOM: "Carton" },
  { name: "Epinephrine Ephedrine Sol.", sku: "PRD-EPI-09", defaultUOM: "Carton" }
]

const MOCK_USERS: MockUser[] = [
  { name: "Noah", role: "Store Manager", warehouse: "WH1", signature: "Noah T." },
  { name: "Sophia", role: "Store Manager", warehouse: "WH2", signature: "Sophia R." },
  { name: "Liam", role: "Store Manager", warehouse: "WH3", signature: "Liam O." },
]

const INITIAL_TRANSFERS: Transfer[] = [
  {
    reference_number: "TR-0001",
    from_warehouse: "WH1",
    to_warehouse: "WH2",
    status: "Received",
    date: "2026-07-15",
    line_items: [
      { line_no: 1, item: "Lidocaine HCl Monohydrate", UOM: "Carton", quantity: 50, remark: "Urgent restocking for batch QA" },
      { line_no: 2, item: "Epinephrine Ephedrine Sol.", UOM: "Carton", quantity: 10, remark: "Secure delivery" }
    ],
    total_quantity: 60,
    issued_by: "Noah",
    issued_at: "2026-07-15 09:30",
    issued_signature: "Noah T.",
    received_by: "Sophia",
    received_at: "2026-07-15 14:45",
    received_signature: "Sophia R."
  },
  {
    reference_number: "TR-0002",
    from_warehouse: "WH2",
    to_warehouse: "WH3",
    status: "Issued",
    date: "2026-07-19",
    line_items: [
      { line_no: 1, item: "Adenosine Phosphate Buffer", UOM: "Carton", quantity: 20, remark: "Standard replenishment" }
    ],
    total_quantity: 20,
    issued_by: "Sophia",
    issued_at: "2026-07-19 11:15",
    issued_signature: "Sophia R."
  },
  {
    reference_number: "TR-0003",
    from_warehouse: "WH3",
    to_warehouse: "WH1",
    status: "Discrepancy",
    date: "2026-07-18",
    line_items: [
      { line_no: 1, item: "Sodium Chloride USP Grade", UOM: "Carton", quantity: 100, remark: "Bulk salt transfer" }
    ],
    total_quantity: 100,
    issued_by: "Liam",
    issued_at: "2026-07-18 08:00",
    issued_signature: "Liam O.",
    received_by: "Noah",
    received_at: "2026-07-18 16:30",
    received_signature: "Noah T.",
    discrepancy_remark: "Only received 95 cartons. 5 cartons were heavily damaged in transit due to high humidity exposure."
  },
  {
    reference_number: "TR-0004",
    from_warehouse: "WH1",
    to_warehouse: "WH3",
    status: "Issued",
    date: "2026-07-20",
    line_items: [
      { line_no: 1, item: "Lidocaine HCl Monohydrate", UOM: "Carton", quantity: 15, remark: "Pending regulatory safety checks" }
    ],
    total_quantity: 15,
    issued_by: "Noah",
    issued_at: "2026-07-20 10:00",
    issued_signature: "Noah T."
  }
]

export default function StoreTransfersTab() {
  const { showToast } = useFeedback()

  // --- MOCK CONTEXT STATE ---
  const [currentUser, setCurrentUser] = useState<MockUser>(MOCK_USERS[0]) // Starts as Noah at Cold-Chain A
  const [currentRole, setCurrentRole] = useState<"Store Manager" | "Warehouse Operator">("Store Manager")

  // --- TRANSFERS DATA STATE ---
  const [transfers, setTransfers] = useState<Transfer[]>(INITIAL_TRANSFERS)

  // --- LIST FILTER STATE ---
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | TransferStatus>("ALL")

  // --- WIZARD FORM / VIEW STATES ---
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null) // For detail view
  const [isFormOpen, setIsFormOpen] = useState(false) // Form panel trigger

  // Lock body scroll when drawer or document is open
  useEffect(() => {
    if (isFormOpen || selectedTransfer !== null) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isFormOpen, selectedTransfer])
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [wizardStep, setWizardStep] = useState<1 | 2>(1) // Step 1: Edit Form, Step 2: Confirm Issue

  // --- FORM DATA STATE ---
  const [formRefNum, setFormRefNum] = useState("")
  const [formFromW, setFormFromW] = useState("")
  const [formToW, setFormToW] = useState("")
  const [formLineItems, setFormLineItems] = useState<TransferLineItem[]>([])
  const [formSubmitted, setFormSubmitted] = useState(false)

  // --- RECEIPT MODAL STATE ---
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [receiptMode, setReceiptMode] = useState<"match" | "discrepancy">("match")
  const [discrepancyText, setDiscrepancyText] = useState("")

  // --- EXPORT LOADING STATE ---
  const [isExporting, setIsExporting] = useState(false)

  // --- LIVE AUTO-CALC TOTAL IN FORM ---
  const formTotalQuantity = useMemo(() => {
    return formLineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
  }, [formLineItems])

  // --- SWITCH MOCK USER SIMULATION ---
  const handleUserSwitch = (userIdx: number) => {
    const user = MOCK_USERS[userIdx]
    setCurrentUser(user)
    showToast(
      "Session Switched",
      "info",
      `Now simulating: ${user.name} (${currentRole} at ${user.warehouse})`
    )
  }

  const handleRoleSwitch = (role: "Store Manager" | "Warehouse Operator") => {
    setCurrentRole(role)
    showToast(
      "Role Switched",
      "info",
      `Simulated access tier changed to: ${role}`
    )
  }

    // --- START NEW TRANSFER ---
  const handleInitiateNew = () => {
    if (currentRole !== "Store Manager") {
      showToast("Access Denied", "warning", "Only Store Managers can initiate new transfers.")
      return
    }

    // Auto-increment reference number based on state
    const nextNum = transfers.length + 1
    const padNum = String(nextNum).padStart(4, "0")
    const refNum = `TR-${padNum}`

    setFormMode("create")
    setFormRefNum(refNum)
    setFormFromW(currentUser.warehouse) // Automatically lock From Warehouse to current user's location
    setFormSubmitted(false)

    // Find first warehouse that is different
    const diffW = WAREHOUSES.find(w => w !== currentUser.warehouse) || ""
    setFormToW(diffW)

    // Initialize with 1 empty line item for custom entry
    setFormLineItems([
      { line_no: 1, item: "", UOM: "Carton", quantity: 10, remark: "" }
    ])

    setWizardStep(1)
    setIsFormOpen(true)
  }

  // --- FORM LINE ITEM MANIPULATION ---
  const handleAddLineRow = () => {
    const nextLineNo = formLineItems.length + 1
    setFormLineItems(prev => [
      ...prev,
      { line_no: nextLineNo, item: "", UOM: "Carton", quantity: 1, remark: "" }
    ])
  }

  const handleRemoveLineRow = (index: number) => {
    if (formLineItems.length <= 1) {
      showToast("Validation Warning", "warning", "A transfer must contain at least 1 line item.")
      return
    }
    const filtered = formLineItems.filter((_, idx) => idx !== index)
    // Re-index line numbers
    const updated = filtered.map((item, idx) => ({ ...item, line_no: idx + 1 }))
    setFormLineItems(updated)
  }

  const handleUpdateLineItem = (index: number, field: keyof TransferLineItem, value: any) => {
    setFormLineItems(prev => prev.map((row, idx) => {
      if (idx === index) {
        return { ...row, [field]: value }
      }
      return row
    }))
  }

  // --- VALIDATE FORM STEP 1 AND ADVANCE ---
  const handleContinueToConfirm = () => {
    setFormSubmitted(true)
    if (!formFromW || !formToW) {
      showToast("Validation Error", "warning", "Please select both origin and destination warehouses.")
      return
    }
    if (formFromW === formToW) {
      showToast("Validation Error", "warning", "Origin and destination warehouses must be different.")
      return
    }
    // Check line product names are not empty
    const hasEmptyItem = formLineItems.some(item => !item.item || !item.item.trim())
    if (hasEmptyItem) {
      showToast("Validation Error", "warning", "All line items must have a product name filled in.")
      return
    }
    // Check line quantities
    const hasInvalidQty = formLineItems.some(item => Number(item.quantity) <= 0)
    if (hasInvalidQty) {
      showToast("Validation Error", "warning", "All line item quantities must be greater than zero.")
      return
    }

    setWizardStep(2) // Move to Confirm Issue screen
  }

  // --- CONFIRM AND ISSUE ---
  const handleConfirmAndIssue = () => {
    const todayStr = new Date().toISOString().replace("T", " ").substring(0, 16)
    
    const payload: Transfer = {
      reference_number: formRefNum,
      from_warehouse: formFromW,
      to_warehouse: formToW,
      status: "Issued",
      line_items: formLineItems,
      total_quantity: formTotalQuantity,
      date: new Date().toISOString().split("T")[0],
      issued_by: currentUser.name,
      issued_at: todayStr,
      issued_signature: currentUser.signature
    }

    if (formMode === "create") {
      setTransfers(prev => [payload, ...prev])
    } else {
      setTransfers(prev => prev.map(t => t.reference_number === formRefNum ? payload : t))
    }

    showToast(
      "Transfer Issued Successfully",
      "success",
      `Stock units successfully dispatched from ${formFromW}.`
    )

    setIsFormOpen(false)
    // If the active detail view is open for this, update it
    if (selectedTransfer && selectedTransfer.reference_number === formRefNum) {
      setSelectedTransfer(payload)
    }
  }

  // --- CONFIRM RECEIPT PROCESS ---
  const handleConfirmReceiptSubmit = () => {
    if (!selectedTransfer) return
    const todayStr = new Date().toISOString().replace("T", " ").substring(0, 16)

    let updatedTransfer: Transfer

    if (receiptMode === "match") {
      updatedTransfer = {
        ...selectedTransfer,
        status: "Received",
        received_by: currentUser.name,
        received_at: todayStr,
        received_signature: currentUser.signature
      }
      showToast(
        "Shipment Received",
        "success",
        `Transfer ${selectedTransfer.reference_number} was marked complete. Inventory levels adjusted.`
      )
    } else {
      if (!discrepancyText.trim()) {
        showToast("Validation Warning", "warning", "Please specify details of the reported discrepancy.")
        return
      }
      updatedTransfer = {
        ...selectedTransfer,
        status: "Discrepancy",
        received_by: currentUser.name,
        received_at: todayStr,
        received_signature: currentUser.signature,
        discrepancy_remark: discrepancyText
      }
      showToast(
        "Discrepancy Logged",
        "warning",
        `Transfer ${selectedTransfer.reference_number} locked with flag 'Discrepancy'. QA notified.`
      )
    }

    setTransfers(prev => prev.map(t => t.reference_number === selectedTransfer.reference_number ? updatedTransfer : t))
    setSelectedTransfer(updatedTransfer)
    setIsReceiptOpen(false)
    setDiscrepancyText("")
  }

  // --- MOCK DOCUMENT DOWNLOAD ---
  const handleDownloadPDF = (refNum: string) => {
    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
      showToast(
        "Document Export Complete",
        "success",
        `Downloaded compliance Material Transfer Note ${refNum}.pdf`
      )
    }, 1500)
  }

  // --- FILTERED TRANSFERS ---
  const filteredTransfers = useMemo(() => {
    return transfers.filter(t => {
      const matchesStatus = statusFilter === "ALL" || t.status === statusFilter
      
      const lowerQuery = searchQuery.toLowerCase()
      const matchesSearch = 
        t.reference_number.toLowerCase().includes(lowerQuery) ||
        t.from_warehouse.toLowerCase().includes(lowerQuery) ||
        t.to_warehouse.toLowerCase().includes(lowerQuery) ||
        t.line_items.some(item => item.item.toLowerCase().includes(lowerQuery))

      return matchesStatus && matchesSearch
    })
  }, [transfers, searchQuery, statusFilter])

  return (
    <div className="space-y-6">
      {/* =========================================================================
          1. SIMULATION CONTROL BOARD (STRICT REQUIREMENT TO SWITCH USERS/PERSPECTIVES)
          ========================================================================= */}
      <GlassCard className="p-5 border border-emerald-500/10 shadow-sm relative overflow-hidden bg-white/40">
        <div className="absolute right-0 top-0 size-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
              <h4 className="text-xs font-black text-zinc-950 uppercase tracking-widest flex items-center gap-1.5">
                <Shield className="size-3.5 text-emerald-600 shrink-0" /> Simulation Control Board
              </h4>
            </div>
            <p className="text-[11px] font-bold text-zinc-500 max-w-2xl leading-snug">
              Toggle the mock context to test role-based constraints. 
              Only <strong className="text-zinc-800">Store Managers</strong> can draft/issue from their warehouse or confirm receipt at destination.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* User Selector */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">Simulated User & Location</span>
              <div className="flex bg-zinc-100/80 p-1 rounded-full border border-zinc-200/50">
                {MOCK_USERS.map((user, idx) => {
                  const isActive = currentUser.name === user.name
                  return (
                    <button
                      key={user.name}
                      onClick={() => handleUserSwitch(idx)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-tight transition-all uppercase ${
                        isActive
                          ? "bg-zinc-950 text-white shadow-sm"
                          : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50"
                      }`}
                    >
                      {user.name} ({user.warehouse.split(" ")[0]})
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Role Toggle */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">Access Clearance</span>
              <div className="flex bg-zinc-100/80 p-1 rounded-full border border-zinc-200/50">
                {(["Store Manager", "Warehouse Operator"] as const).map(role => {
                  const isActive = currentRole === role
                  return (
                    <button
                      key={role}
                      onClick={() => handleRoleSwitch(role)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-tight transition-all uppercase ${
                        isActive
                          ? "bg-zinc-950 text-white shadow-sm"
                          : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50"
                      }`}
                    >
                      {role.split(" ")[1] || role}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Context Header Indicator */}
        <div className="mt-4 pt-3 border-t border-zinc-200/50 flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-zinc-600">
          <div className="flex items-center gap-1.5 bg-zinc-100/80 border border-zinc-200/40 px-3 py-1 rounded-full">
            <User className="size-3.5 text-zinc-500" />
            <span>Active Session:</span>
            <strong className="text-zinc-900 uppercase font-black">{currentUser.name}</strong>
            <span className="text-zinc-300">|</span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-1.5 py-0.2 rounded font-black uppercase text-[8px]">
              {currentRole}
            </span>
            <span className="text-zinc-300">|</span>
            <span>Assigned:</span>
            <strong className="text-zinc-900 uppercase font-black">{currentUser.warehouse}</strong>
          </div>

          <div className="text-[10px] text-zinc-400 italic">
            * Every permission, action card, and button changes dynamically based on this context.
          </div>
        </div>
      </GlassCard>

      {/* =========================================================================
          2. TRANSFERS LIST SCREEN (SCREEN 1)
          ========================================================================= */}
      <div className="grid grid-cols-1 gap-4">
        {/* Search & Tabs Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pb-2 border-b border-zinc-200/50">
          {/* Status filter tabs */}
          <div className="flex gap-1 bg-zinc-100/80 p-1 rounded-full border border-zinc-200/40 w-full md:w-auto overflow-x-auto no-scrollbar">
            {(["ALL", "Issued", "Received", "Discrepancy"] as const).map(status => {
              const isActive = statusFilter === status
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-tight transition-all uppercase whitespace-nowrap ${
                    isActive
                      ? "bg-zinc-950 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/30"
                  }`}
                >
                  {status}
                </button>
              )
            })}
          </div>

          {/* Search bar and Create Action */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2 bg-white/60 border border-zinc-200/60 rounded-full px-3.5 py-1.5 flex-1 md:w-64 max-w-xs">
              <Search className="size-3.5 text-zinc-400 shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search TIN, From/To, Item..."
                className="bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 outline-none w-full font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}>
                  <X className="size-3 text-zinc-400" />
                </button>
              )}
            </div>

            {/* Prominent Create Action (Visually toggled as per role-based instructions) */}
            {currentRole === "Store Manager" && (
              <button
                onClick={handleInitiateNew}
                className="flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-black transition-all shadow-md active:scale-95 shrink-0 uppercase"
              >
                <Plus className="size-4" /> New Transfer
              </button>
            )}
          </div>
        </div>

        {/* Table View */}
        <GlassCard className="p-0 overflow-hidden border border-white/65 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/[0.02] border-b border-zinc-200/40 text-[10px] font-black tracking-wider text-zinc-400 uppercase">
                  <th className="py-4.5 px-6">TIN No.</th>
                  <th className="py-4.5 px-4">From Warehouse (Sender)</th>
                  <th className="py-4.5 px-4">To Warehouse (Receiver)</th>
                  <th className="py-4.5 px-4 text-center">Total Quantity</th>
                  <th className="py-4.5 px-4">Initiation Date</th>
                  <th className="py-4.5 px-4 text-center">Status</th>
                  <th className="py-4.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150/40">
                {filteredTransfers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-zinc-400 text-xs font-medium">
                      No Material Transfers match the selected status or filters.
                    </td>
                  </tr>
                ) : (
                  filteredTransfers.map(transfer => {
                    const isIssued = transfer.status === "Issued"
                    const isReceived = transfer.status === "Received"
                    const isDiscrepancy = transfer.status === "Discrepancy"

                    const statusPillColors = 
                      isReceived ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      isIssued ? "bg-blue-50 text-blue-700 border-blue-200" :
                      isDiscrepancy ? "bg-amber-50 text-amber-800 border-amber-300/80 animate-pulse" :
                      "bg-zinc-100 text-zinc-700 border-zinc-200"

                    // Check if current user has permission to process the incoming transfer
                    const isIncomingForMe = transfer.to_warehouse === currentUser.warehouse
                    const canProcessReceipt = isIssued && isIncomingForMe && currentRole === "Store Manager"
                    const canEdit = (isIssued || isDiscrepancy) && transfer.from_warehouse === currentUser.warehouse && currentRole === "Store Manager"

                    return (
                      <tr
                        key={transfer.reference_number}
                        onClick={() => setSelectedTransfer(transfer)}
                        className="hover:bg-white/45 cursor-pointer transition-colors group"
                      >
                        {/* Reference Num */}
                        <td className="py-4 px-6">
                          <span className="font-mono font-black text-zinc-950 text-xs leading-none">
                            {transfer.reference_number}
                          </span>
                        </td>

                        {/* From Warehouse */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800">
                            <WarehouseIcon className="size-3.5 text-zinc-400 shrink-0" />
                            <span>{transfer.from_warehouse}</span>
                          </div>
                        </td>

                        {/* To Warehouse */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800">
                            <WarehouseIcon className="size-3.5 text-zinc-400 shrink-0" />
                            <span>{transfer.to_warehouse}</span>
                          </div>
                        </td>

                        {/* Total Quantity */}
                        <td className="py-4 px-4 text-center">
                          <span className="font-mono font-extrabold text-xs text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200/50">
                            {transfer.total_quantity.toLocaleString()} units
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-500 font-mono">
                            <Calendar className="size-3 text-zinc-400" />
                            <span>{transfer.date}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 text-center">
                          <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${statusPillColors}`}>
                            {transfer.status}
                          </span>
                        </td>

                        {/* Custom Context Actions Inline */}
                        <td className="py-4 px-6 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View TIN Document */}
                            <button
                              onClick={() => setSelectedTransfer(transfer)}
                              className="p-1.5 rounded-md border border-zinc-200 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800 transition-colors"
                              title="View TIN Document"
                            >
                              <Eye className="size-3.5" />
                            </button>

                            {/* Edit Action */}
                            {canEdit && (
                              <button
                                onClick={() => {
                                  setFormMode("edit")
                                  setFormRefNum(transfer.reference_number)
                                  setFormFromW(transfer.from_warehouse)
                                  setFormToW(transfer.to_warehouse)
                                  setFormLineItems(transfer.line_items)
                                  setFormSubmitted(false)
                                  setWizardStep(1)
                                  setIsFormOpen(true)
                                }}
                                className="p-1.5 rounded-md border border-zinc-200 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800 transition-colors"
                                title="Edit Transfer"
                              >
                                <Edit className="size-3.5" />
                              </button>
                            )}

                            {/* Process Receipt Action (Visually highlighted to direct attention) */}
                            {canProcessReceipt && (
                              <button
                                onClick={() => {
                                  setSelectedTransfer(transfer)
                                  setReceiptMode("match")
                                  setIsReceiptOpen(true)
                                }}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black transition-all shadow-sm uppercase tracking-tight flex items-center gap-1 animate-pulse"
                              >
                                Process Receipt
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* =========================================================================
          3. CREATE / EDIT DRAFT WIZARD PANEL (SCREEN 2 & SCREEN 3)
          ========================================================================= */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />

            {/* Slide-over Container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed top-0 right-0 h-screen w-full max-w-2xl bg-zinc-50/98 backdrop-blur-md shadow-2xl border-l border-zinc-200/80 z-[101] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-zinc-200/60 shrink-0 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                    Store Transfers
                  </span>
                  <h2 className="text-xl font-black text-zinc-950 tracking-tight leading-none">
                    New Store Transfer
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="size-8 rounded-full border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center transition-colors text-zinc-500"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* SCROLLABLE BODY CONTENT */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* STEP PROGRESS BAR */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`h-1 rounded-full ${wizardStep >= 1 ? "bg-zinc-950" : "bg-zinc-200"}`} />
                  <div className={`h-1 rounded-full ${wizardStep >= 2 ? "bg-zinc-950" : "bg-zinc-200"}`} />
                </div>

                {/* WIZARD STEP 1: FORM EDITING (SCREEN 2) */}
                {wizardStep === 1 && (
                  <div className="space-y-5">
                    {/* Warehouses configuration */}
                    <div className="grid grid-cols-2 gap-4 bg-zinc-100/50 p-4 rounded-2xl border border-zinc-200/40">
                      <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block mb-1">
                          From Warehouse (Origin)
                        </label>
                        <div className="w-full bg-white border border-zinc-200 px-3 py-2 rounded-xl text-xs font-black text-zinc-600 flex items-center gap-2 cursor-not-allowed">
                          <WarehouseIcon className="size-4 text-zinc-400" />
                          <span>{formFromW}</span>
                          <Lock className="size-3 text-zinc-400 ml-auto" />
                        </div>
                        <span className="text-[9px] text-zinc-400 mt-1 block font-bold leading-tight">
                          Automatically locked to your assigned warehouse.
                        </span>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block mb-1">
                          To Warehouse (Destination)
                        </label>
                        <select
                          value={formToW}
                          onChange={e => setFormToW(e.target.value)}
                          className="w-full bg-white border border-zinc-200 px-3 py-2 rounded-xl text-xs font-black outline-none cursor-pointer focus:border-zinc-950"
                        >
                          {WAREHOUSES.filter(w => w !== formFromW).map(w => (
                            <option key={w} value={w}>{w}</option>
                          ))}
                        </select>
                        <span className="text-[9px] text-zinc-400 mt-1 block font-bold leading-tight">
                          Select receiving storage vault.
                        </span>
                      </div>
                    </div>

                    {/* Line Items Container */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-1 border-b border-zinc-200/50">
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                          Material Line Items List
                        </h4>
                        <button
                          type="button"
                          onClick={handleAddLineRow}
                          className="flex items-center gap-1 text-[10px] font-black text-zinc-900 hover:text-zinc-600 transition-colors uppercase tracking-tight"
                        >
                          <Plus className="size-3.5" /> Add Row
                        </button>
                      </div>

                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                        {formLineItems.map((row, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-sm relative">
                            {/* Product Selection */}
                            <div className="col-span-4">
                              <label className="text-[8px] font-black text-zinc-400 uppercase tracking-wider block mb-0.5">Product</label>
                              <div className={`flex items-center rounded-lg px-2 py-1 transition-all ${
                                formSubmitted && (!row.item || !row.item.trim())
                                  ? "bg-red-50 border border-red-500 shadow-sm shadow-red-100"
                                  : "border border-zinc-200/60 focus-within:border-zinc-400 focus-within:bg-zinc-50/50"
                              }`}>
                                <input
                                  type="text"
                                  list="products-suggestions"
                                  placeholder="Enter product name..."
                                  value={row.item}
                                  onChange={e => handleUpdateLineItem(idx, "item", e.target.value)}
                                  className="w-full bg-transparent border-0 text-[11px] font-extrabold text-zinc-800 outline-none p-0"
                                />
                              </div>
                              <datalist id="products-suggestions">
                                {PRODUCTS_POOL.map(p => (
                                  <option key={p.name} value={p.name} />
                                ))}
                              </datalist>
                            </div>

                            {/* UOM */}
                            <div className="col-span-2">
                              <label className="text-[8px] font-black text-zinc-400 uppercase tracking-wider block mb-0.5">UOM</label>
                              <select
                                value={row.UOM}
                                onChange={e => handleUpdateLineItem(idx, "UOM", e.target.value)}
                                className="w-full bg-transparent border-0 text-[11px] font-bold text-zinc-600 outline-none p-0 cursor-pointer"
                              >
                                {["Carton", "kg", "L", "Pack"].map(u => (
                                  <option key={u} value={u}>{u}</option>
                                ))}
                              </select>
                            </div>

                            {/* Quantity */}
                            <div className="col-span-2">
                              <label className="text-[8px] font-black text-zinc-400 uppercase tracking-wider block mb-0.5">Qty</label>
                              <input
                                type="number"
                                required
                                value={row.quantity}
                                min="1"
                                onChange={e => handleUpdateLineItem(idx, "quantity", e.target.value === "" ? "" : Number(e.target.value))}
                                className="w-full bg-transparent border-0 text-[11px] font-mono font-black text-zinc-900 outline-none p-0"
                              />
                            </div>

                            {/* Remark */}
                            <div className="col-span-3">
                              <label className="text-[8px] font-black text-zinc-400 uppercase tracking-wider block mb-0.5">Remark</label>
                              <input
                                type="text"
                                placeholder="Notes..."
                                value={row.remark || ""}
                                onChange={e => handleUpdateLineItem(idx, "remark", e.target.value)}
                                className="w-full bg-transparent border-0 text-[11px] text-zinc-500 outline-none p-0 font-medium"
                              />
                            </div>

                            {/* Trash action */}
                            <div className="col-span-1 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveLineRow(idx)}
                                className="p-1 rounded text-zinc-300 hover:text-zinc-600 transition-colors"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* LIVE AUTO-CALC TOTAL DISPLAY */}
                      <div className="flex items-center justify-between p-3.5 bg-zinc-900 rounded-xl text-white shadow-md">
                        <span className="text-[10px] font-black uppercase tracking-wider">Total:</span>
                        <strong className="font-mono text-xs font-black uppercase">
                          {formTotalQuantity.toLocaleString()} Units
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* WIZARD STEP 2: SUMMARY & DIGITAL DISPATCH SIGNATURE (SCREEN 3) */}
                {wizardStep === 2 && (
                  <div className="space-y-6">
                    <div className="border border-zinc-200 bg-white p-5 rounded-2xl shadow-inner space-y-4 relative">
                      <div className="border-b border-zinc-150 pb-3 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Document Registry #</span>
                          <strong className="font-mono text-sm font-black text-zinc-950">{formRefNum}</strong>
                        </div>
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                          Ready for Dispatch
                        </span>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider block mb-0.5">Dispatched Origin (Sender)</span>
                          <span className="font-extrabold text-zinc-800">{formFromW}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider block mb-0.5">Designated Destination (Receiver)</span>
                          <span className="font-extrabold text-zinc-800">{formToW}</span>
                        </div>
                      </div>

                      {/* Summary Table */}
                      <div className="border-t border-zinc-150 pt-3">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider block mb-2">Validated Material Ledger</span>
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="text-[8px] font-black text-zinc-400 uppercase border-b border-zinc-100 pb-1">
                              <th className="py-1">No.</th>
                              <th className="py-1">Product Description</th>
                              <th className="py-1 text-center">UOM</th>
                              <th className="py-1 text-right">Dispatch Qty</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 font-bold text-zinc-700">
                            {formLineItems.map((line, index) => (
                              <tr key={index}>
                                <td className="py-1.5 font-mono text-zinc-400">{line.line_no}</td>
                                <td className="py-1.5 text-zinc-950">{line.item}</td>
                                <td className="py-1.5 text-center text-zinc-500">{line.UOM}</td>
                                <td className="py-1.5 text-right font-mono text-zinc-950">{line.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Grand total */}
                      <div className="border-t border-zinc-150 pt-3 flex justify-between text-xs font-black">
                        <span className="uppercase text-zinc-400">Total:</span>
                        <span className="font-mono text-zinc-950">{formTotalQuantity} units</span>
                      </div>
                    </div>

                    {/* DIGITAL CERTIFICATION & REGISTERED SIGNATURE BOX */}
                    <div className="bg-zinc-150/40 p-4.5 rounded-2xl border border-zinc-200/80 space-y-3.5">
                      <div className="flex items-center gap-1.5">
                        <Shield className="size-4.5 text-zinc-800 shrink-0" />
                        <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider">
                          Digital Dispatch Certification
                        </h4>
                      </div>
                      <p className="text-[10px] font-bold text-zinc-500 leading-normal">
                        By authorizing this Material Transfer, you authenticate the shipment under compliance standards. 
                        Your registered digital signature will be embedded dynamically into the locked document below:
                      </p>

                      <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-black text-zinc-400 uppercase">Authorized Dispatcher</span>
                          <h5 className="text-xs font-black text-zinc-800">{currentUser.name}</h5>
                          <span className="text-[8px] font-bold text-zinc-400 uppercase block">{currentRole}</span>
                        </div>

                        {/* Script signature style */}
                        <div className="border-l border-zinc-150 pl-6 pr-4 py-1 text-center">
                          <span className="text-[8px] font-black text-zinc-400 uppercase block mb-1">Pre-registered Digital Sig</span>
                          <span className="font-serif italic text-2xl tracking-widest text-zinc-800 font-extrabold select-none">
                            {currentUser.signature}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* FOOTER ACTIONS (SCREEN 2 & SCREEN 3 TRIGGERS) */}
              <div className="p-6 border-t border-zinc-200/80 bg-zinc-100/50 shrink-0 flex items-center justify-between gap-3">
                {wizardStep === 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-4.5 py-2.5 rounded-full border border-zinc-300 hover:bg-zinc-200 text-zinc-700 text-xs font-black transition-colors uppercase tracking-tight"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleContinueToConfirm}
                      className="px-5 py-2.5 rounded-full bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-black transition-all shadow-md active:scale-95 uppercase tracking-tight flex items-center gap-1"
                    >
                      Continue <ArrowRight className="size-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="px-4.5 py-2.5 rounded-full border border-zinc-300 hover:bg-zinc-200 text-zinc-700 text-xs font-black transition-colors uppercase tracking-tight"
                    >
                      Back to Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmAndIssue}
                      className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-md active:scale-95 uppercase tracking-tight flex items-center gap-1"
                    >
                      <Check className="size-4" /> Sign & Dispatch Stock
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* =========================================================================
          4. MTN DETAIL & COMPLIANCE DOCUMENT VIEWER (SCREEN 5)
          ========================================================================= */}
      <AnimatePresence>
        {selectedTransfer && !isFormOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTransfer(null)}
              className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[100]"
            />

            {/* Slide-over compliance document container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-full max-w-2xl bg-zinc-50 shadow-2xl border-l border-zinc-200 z-[101] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-zinc-200/60 shrink-0 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Transfer Form</span>
                  <h2 className="text-base font-black text-zinc-950 tracking-tight leading-none uppercase">
                    {selectedTransfer.reference_number}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedTransfer(null)}
                  className="size-8 rounded-full border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center transition-colors text-zinc-500"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* SCROLLABLE BODY CONTENT */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* THE FORMAL DOCUMENT (SCREEN 5 GRAPHICAL LAYOUT) */}
                <div className="bg-white border border-zinc-250 p-6 sm:p-8 rounded-2xl shadow-md relative flex flex-col justify-between max-w-full min-h-full">
                  {/* 1. DOCUMENT WATERMARK & COMPANY STAMP (STRICT REQUIREMENT FOR 'RECEIVED' STATE) */}
                  <AnimatePresence>
                    {selectedTransfer.status === "Received" && (
                      <motion.div
                        initial={{ scale: 0.6, opacity: 0, rotate: 10 }}
                        animate={{ scale: 1, opacity: 0.85, rotate: -6 }}
                        transition={{ type: "spring", duration: 0.8 }}
                        className="absolute left-12 bottom-28 size-36 rounded-full border-4 border-dashed border-emerald-600/80 flex items-center justify-center p-2 text-center pointer-events-none select-none z-10"
                      >
                        <div className="size-full border-2 border-dashed border-emerald-600/80 rounded-full flex flex-col items-center justify-center p-1 uppercase">
                          <span className="text-[7px] font-black text-emerald-600 tracking-wider">STORES DEPT</span>
                          <div className="h-px w-full bg-emerald-600/50 my-0.5" />
                          <span className="text-[9px] font-black text-emerald-600 tracking-widest">VERIFIED</span>
                          <span className="text-[6px] font-extrabold text-emerald-600/70 mt-0.5">STORES DEPT</span>
                          <div className="h-px w-full bg-emerald-600/50 my-0.5" />
                          <span className="text-[6px] font-black text-emerald-600/60 font-mono">{selectedTransfer.received_at?.split(" ")[0]}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 2. LETTERHEAD HEADER */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-zinc-150">
                      <div className="space-y-1">
                        <h3 className="text-sm font-black tracking-widest text-zinc-950 uppercase leading-none">
                          STORE TO STORE TRANSFER
                        </h3>
                        <div className="flex flex-col gap-0.5 text-[10px] font-bold text-zinc-500 font-mono pt-1">
                          <span>Date: {selectedTransfer.date}</span>
                          <span>TIN: 0006935118</span>
                          <span>Tel: +251-911122102</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-1.5">
                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Status</span>
                        <span className={`text-[10px] font-black px-3 py-0.5 rounded-full border uppercase tracking-wider text-center ${
                          selectedTransfer.status === "Received" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          selectedTransfer.status === "Issued" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          selectedTransfer.status === "Discrepancy" ? "bg-amber-50 text-amber-800 border-amber-300" :
                          "bg-zinc-100 text-zinc-700 border-zinc-200"
                        }`}>
                          {selectedTransfer.status}
                        </span>
                      </div>
                    </div>

                    {/* 3. DISCREPANCY DETAILED ALERT PANEL */}
                    {selectedTransfer.status === "Discrepancy" && (
                      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex gap-3 text-amber-900 animate-pulse">
                        <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-amber-900">
                            Discrepancy Report Logged
                          </h4>
                          <p className="text-[10px] font-semibold leading-relaxed text-amber-800">
                            "{selectedTransfer.discrepancy_remark}"
                          </p>
                          <span className="text-[8px] font-bold text-amber-700 block uppercase mt-1">
                            Filed By: {selectedTransfer.received_by} on {selectedTransfer.received_at}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 4. SENDER VS RECEIVER DETAILS */}
                    <div className="grid grid-cols-2 gap-4 text-xs py-1">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-wider block">Origin (Sending Facility)</span>
                        <div className="flex items-center gap-1.5 text-zinc-800 font-extrabold bg-zinc-50 p-2 rounded-xl border border-zinc-200/40">
                          <WarehouseIcon className="size-4 text-zinc-400" />
                          <span>{selectedTransfer.from_warehouse}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-wider block">Destination (Receiving Vault)</span>
                        <div className="flex items-center gap-1.5 text-zinc-800 font-extrabold bg-zinc-50 p-2 rounded-xl border border-zinc-200/40">
                          <WarehouseIcon className="size-4 text-zinc-400" />
                          <span>{selectedTransfer.to_warehouse}</span>
                        </div>
                      </div>
                    </div>

                    {/* 5. MATERIAL RECORD TABLE */}
                    <div className="border-t border-zinc-150 pt-4">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="text-[8px] font-black text-zinc-400 uppercase tracking-wider border-b border-zinc-150 pb-1.5">
                            <th className="py-2">NO.</th>
                            <th className="py-2">Product Name</th>
                            <th className="py-2 text-center">UOM</th>
                            <th className="py-2 text-right">Qty</th>
                            <th className="py-2 pl-4">Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 font-bold text-zinc-700">
                          {selectedTransfer.line_items.map((line) => (
                            <tr key={line.line_no}>
                              <td className="py-2.5 font-mono text-zinc-400">{line.line_no}</td>
                              <td className="py-2.5 text-zinc-950">{line.item}</td>
                              <td className="py-2.5 text-center text-zinc-500">{line.UOM}</td>
                              <td className="py-2.5 text-right font-mono text-zinc-950">{line.quantity}</td>
                              <td className="py-2.5 pl-4 text-zinc-400 font-semibold text-[11px] max-w-[150px] truncate" title={line.remark}>
                                {line.remark || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 6. IMMUTABLE TOTALS & COMPLIANCE SIGNATURE BLOCKS (STRICT COMPLIANCE SPECIFICATION) */}
                  <div className="space-y-6 mt-8">
                    <div className="border-t border-zinc-200 pt-3 flex justify-between text-xs font-black">
                      <span className="uppercase text-zinc-400">Total:</span>
                      <span className="font-mono text-zinc-950 text-sm bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">
                        {selectedTransfer.total_quantity.toLocaleString()} UNITS
                      </span>
                    </div>

                    {/* DOUBLE SIGNATURES SECTION */}
                    <div className="grid grid-cols-2 gap-4 border-t border-zinc-150 pt-4 text-xs font-bold">
                      {/* Issued Section */}
                      <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 relative">
                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-wider block mb-2">
                          Issued By:
                        </span>
                        {selectedTransfer.issued_by ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <User className="size-3 text-zinc-400" />
                              <span className="text-zinc-950 font-extrabold">{selectedTransfer.issued_by}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[9px] text-zinc-400 font-mono">
                              <Clock className="size-3" />
                              <span>{selectedTransfer.issued_at}</span>
                            </div>
                            {/* Simulated Handwritten Sig */}
                            <div className="mt-3.5 border-t border-dashed border-zinc-200 pt-2 flex items-center justify-between">
                              <span className="text-[8px] text-zinc-400 uppercase">Seal-Signature</span>
                              <span className="font-serif italic text-base font-extrabold tracking-widest text-blue-800 pr-2 select-none">
                                {selectedTransfer.issued_signature}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="py-6 text-center text-zinc-400 text-[10px] border border-dashed border-zinc-200 rounded-lg">
                            Pending Dispatch Release
                          </div>
                        )}
                      </div>

                      {/* Received Section */}
                      <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 relative">
                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-wider block mb-2">
                          Received By:
                        </span>
                        {selectedTransfer.received_by ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <User className="size-3 text-zinc-400" />
                              <span className="text-zinc-950 font-extrabold">{selectedTransfer.received_by}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[9px] text-zinc-400 font-mono">
                              <Clock className="size-3" />
                              <span>{selectedTransfer.received_at}</span>
                            </div>
                            {/* Simulated Handwritten Sig */}
                            <div className="mt-3.5 border-t border-dashed border-zinc-200 pt-2 flex items-center justify-between">
                              <span className="text-[8px] text-zinc-400 uppercase">Seal-Signature</span>
                              <span className="font-serif italic text-base font-extrabold tracking-widest text-blue-800 pr-2 select-none">
                                {selectedTransfer.received_signature}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="py-6 text-center text-zinc-400 text-[10px] border border-dashed border-zinc-200 rounded-lg">
                            Pending Shipment Arrival
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION TOOLBAR AT FOOTER */}
              <div className="p-6 border-t border-zinc-200/80 bg-zinc-100/50 shrink-0 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedTransfer(null)}
                  className="px-4.5 py-2.5 rounded-full border border-zinc-300 hover:bg-zinc-200 text-zinc-700 text-xs font-black transition-colors uppercase tracking-tight"
                >
                  Close Document
                </button>

                <div className="flex items-center gap-2">
                  {/* Export PDF mock button */}
                  <button
                    onClick={() => handleDownloadPDF(selectedTransfer.reference_number)}
                    disabled={isExporting}
                    className="px-4.5 py-2.5 rounded-full border border-zinc-300 hover:bg-zinc-200 text-zinc-800 text-xs font-black transition-colors uppercase tracking-tight flex items-center gap-1.5"
                  >
                    <Download className={`size-4 ${isExporting ? "animate-spin" : ""}`} />
                    {isExporting ? "Exporting..." : "Export TIN"}
                  </button>

                  {/* Edit Transfer action from document view */}
                  {((selectedTransfer.status === "Issued" || selectedTransfer.status === "Discrepancy") &&
                    selectedTransfer.from_warehouse === currentUser.warehouse &&
                    currentRole === "Store Manager") && (
                    <button
                      onClick={() => {
                        const tr = selectedTransfer
                        setSelectedTransfer(null)
                        setFormMode("edit")
                        setFormRefNum(tr.reference_number)
                        setFormFromW(tr.from_warehouse)
                        setFormToW(tr.to_warehouse)
                        setFormLineItems(tr.line_items)
                        setFormSubmitted(false)
                        setWizardStep(1)
                        setIsFormOpen(true)
                      }}
                      className="px-4.5 py-2.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-black transition-colors uppercase tracking-tight flex items-center gap-1.5"
                    >
                      <Edit className="size-4" />
                      Edit Transfer
                    </button>
                  )}

                  {/* Confirm Receipt Action inside document (SCREEN 4) */}
                  {selectedTransfer.status === "Issued" && selectedTransfer.to_warehouse === currentUser.warehouse && currentRole === "Store Manager" && (
                    <button
                      onClick={() => {
                        setReceiptMode("match")
                        setIsReceiptOpen(true)}
                      }
                      className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-md active:scale-95 uppercase tracking-tight"
                    >
                      Process Receipt
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* =========================================================================
          5. CONFIRM RECEIPT MODAL / SUB-PANEL (SCREEN 4 CHOICE DIALOGUE)
          ========================================================================= */}
      <AnimatePresence>
        {isReceiptOpen && selectedTransfer && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReceiptOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-0 m-auto h-fit w-full max-w-lg bg-zinc-50 border border-zinc-200 shadow-2xl p-6 rounded-3xl z-[111] overflow-hidden flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-zinc-200 mb-4">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Verification & Audit</span>
                  <h3 className="text-sm font-black text-zinc-950 uppercase">
                    Confirm Receipt: {selectedTransfer.reference_number}
                  </h3>
                </div>
                <button
                  onClick={() => setIsReceiptOpen(false)}
                  className="size-7 rounded-full border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center transition-colors text-zinc-500"
                >
                  <X className="size-3.5" />
                </button>
              </div>

              {/* Sub-header Context Banner */}
              <div className="bg-zinc-100 border border-zinc-200 rounded-xl p-3 mb-4 text-[10px] font-bold text-zinc-600 leading-snug flex items-center gap-2">
                <User className="size-4 text-zinc-500" />
                <div>
                  Receiving Manager: <strong className="text-zinc-800">{currentUser.name}</strong> 
                  <span className="text-zinc-400 px-1">|</span> Facility: <strong className="text-zinc-800">{currentUser.warehouse}</strong>
                </div>
              </div>

              {/* TWO CHOICE INTERACTION PATHWAYS */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* Option 1: Quantities match */}
                  <button
                    type="button"
                    onClick={() => setReceiptMode("match")}
                    className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between h-28 ${
                      receiptMode === "match"
                        ? "border-emerald-600 bg-emerald-50/50 shadow-inner"
                        : "border-zinc-200 bg-white hover:border-zinc-400"
                    }`}
                  >
                    <div className="size-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <Check className="size-4" />
                    </div>
                    <div className="space-y-0.5">
                      <strong className="text-xs font-black text-zinc-950 uppercase tracking-tight block">Quantities Match</strong>
                      <span className="text-[9px] font-semibold text-zinc-400 leading-none">Perfect compliance delivery</span>
                    </div>
                  </button>

                  {/* Option 2: Report a discrepancy */}
                  <button
                    type="button"
                    onClick={() => setReceiptMode("discrepancy")}
                    className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between h-28 ${
                      receiptMode === "discrepancy"
                        ? "border-amber-500 bg-amber-50/50 shadow-inner"
                        : "border-zinc-200 bg-white hover:border-zinc-400"
                    }`}
                  >
                    <div className="size-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                      <AlertTriangle className="size-3.5" />
                    </div>
                    <div className="space-y-0.5">
                      <strong className="text-xs font-black text-zinc-950 uppercase tracking-tight block">Report Discrepancy</strong>
                      <span className="text-[9px] font-semibold text-zinc-400 leading-none">Damaged items or mismatches</span>
                    </div>
                  </button>
                </div>

                {/* Conditional Textarea for discrepancy remark (STRICT REQUIREMENT) */}
                <AnimatePresence>
                  {receiptMode === "discrepancy" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-1.5"
                    >
                      <label className="text-[9px] font-black text-zinc-400 uppercase tracking-wider block">
                        Discrepancy Report Detail <span className="text-amber-600">*</span>
                      </label>
                      <textarea
                        required
                        value={discrepancyText}
                        onChange={e => setDiscrepancyText(e.target.value)}
                        placeholder="Detail the exact count discrepancy, damages, temperature breaches, or packaging damage..."
                        className="w-full bg-white border border-zinc-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold outline-none focus:border-amber-500 h-20 transition-all font-sans resize-none"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Terms Disclaimer */}
                <div className="text-[9px] text-zinc-400 leading-normal font-bold pt-1">
                  * Submission of this audit will automatically register your digital signature 
                  <strong className="text-zinc-600"> "{currentUser.signature}"</strong> and timestamp on the Transfer Document.
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="border-t border-zinc-200/80 pt-4 mt-5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsReceiptOpen(false)}
                  className="px-4.5 py-2 rounded-full border border-zinc-300 hover:bg-zinc-200 text-zinc-700 text-xs font-black transition-colors uppercase tracking-tight"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReceiptSubmit}
                  disabled={receiptMode === "discrepancy" && !discrepancyText.trim()}
                  className={`px-5 py-2 rounded-full text-white text-xs font-black transition-all shadow-md active:scale-95 uppercase tracking-tight ${
                    receiptMode === "discrepancy" && !discrepancyText.trim()
                      ? "bg-zinc-300 text-zinc-500 cursor-not-allowed"
                      : receiptMode === "discrepancy"
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  Confirm receipt
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
