import { useState, useEffect } from "react"
import warehousesData from "../../data/warehouses.json"
import inventoryProductsData from "../../data/inventory_products.json"
import salesOrdersData from "../../data/sales_orders.json"
import purchaseOrdersData from "../../data/purchase_orders.json"
import customersData from "../../data/customers.json"
import suppliersData from "../../data/suppliers.json"

export interface Warehouse {
  id: string
  name: string
  code: string
  location: string
  type: string
  specialization: string
  targetMarkets: string
  manager: string
  status: string
}

export interface StockBreakdown {
  warehouse: string
  qty: number
}

export interface BatchInfo {
  batchNo: string
  qty: number
  expiry: string
  status: "Released" | "Pending QA" | "Quarantined"
}

export interface Product {
  id: string
  name: string
  sku: string
  category: string
  warehouse: string
  warehouseName?: string
  quantity: number
  unit: string
  unitCost: number
  sellingPrice: number
  batch: string
  expiry: string
  status: "In Stock" | "Low Stock" | "Quarantined" | "Out of Stock" | "Pending QA"
  stockBreakdown: StockBreakdown[]
  batches: BatchInfo[]
  origin: string
  supplierName: string
}

export interface SalesOrderItem {
  productId: string
  name: string
  qty: number
  unit: string
  unitPrice: number
  total: number
}

export interface SalesOrder {
  id: string
  customer: string
  customerId: string
  warehouse: string
  warehouseName?: string
  date: string
  amount: number
  currency: string
  stage: "Quote" | "Confirmed" | "Picking" | "Shipped" | "Delivered"
  progress?: number
  desc: string
  initials: string
  label: string
  avatarBg: string
  urgent: boolean
  attachment: boolean
  items: SalesOrderItem[]
}

export interface PurchaseOrderItem {
  productId: string
  name: string
  sku: string
  qty: number
  unit: string
  unitPrice: number
  total: number
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  supplier: string
  supplierId: string
  warehouse: string
  warehouseName?: string
  status: "DRAFT" | "IN TRANSIT" | "RECEIVED"
  statusColor: string
  date: string
  eta: string
  amount: number
  currency: string
  category: string
  items: PurchaseOrderItem[]
}

export interface Customer {
  id: string
  name: string
  country: string
  region: string
  contactPerson: string
  email: string
  category: string
  warehouseTarget: string
  creditLimit: number
  status: string
}

export interface Supplier {
  id: string
  name: string
  country: string
  city: string
  category: string
  warehouseTarget: string
  contactPerson: string
  email: string
  rating: string
  status: string
}

class ErpStore {
  private warehouses: Warehouse[] = warehousesData as Warehouse[]
  private products: Product[] = inventoryProductsData as Product[]
  private salesOrders: SalesOrder[] = salesOrdersData as SalesOrder[]
  private purchaseOrders: PurchaseOrder[] = purchaseOrdersData as PurchaseOrder[]
  private customers: Customer[] = customersData as Customer[]
  private suppliers: Supplier[] = suppliersData as Supplier[]

  private listeners = new Set<() => void>()

  constructor() {
    this.loadFromLocalStorage()
  }

  private loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem("hkc_trading_erp_store_v1")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.products) this.products = parsed.products
        if (parsed.salesOrders) this.salesOrders = parsed.salesOrders
        if (parsed.purchaseOrders) this.purchaseOrders = parsed.purchaseOrders
        if (parsed.warehouses) this.warehouses = parsed.warehouses
        if (parsed.customers) this.customers = parsed.customers
        if (parsed.suppliers) this.suppliers = parsed.suppliers
      }
    } catch {
      // Ignore
    }
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem(
        "hkc_trading_erp_store_v1",
        JSON.stringify({
          products: this.products,
          salesOrders: this.salesOrders,
          purchaseOrders: this.purchaseOrders,
          warehouses: this.warehouses,
          customers: this.customers,
          suppliers: this.suppliers,
        })
      )
    } catch {
      // Ignore
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    this.saveToLocalStorage()
    this.listeners.forEach((l) => l())
  }

  // Getters
  public getWarehouses(): Warehouse[] {
    return [...this.warehouses]
  }

  public getProducts(): Product[] {
    return [...this.products]
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id)
  }

  public getSalesOrders(): SalesOrder[] {
    return [...this.salesOrders]
  }

  public getPurchaseOrders(): PurchaseOrder[] {
    return [...this.purchaseOrders]
  }

  public getCustomers(): Customer[] {
    return [...this.customers]
  }

  public getSuppliers(): Supplier[] {
    return [...this.suppliers]
  }

  // Actions
  public addProduct(product: Product) {
    this.products.unshift(product)
    this.notify()
  }

  public updateProduct(id: string, partial: Partial<Product>) {
    this.products = this.products.map((p) => (p.id === id ? { ...p, ...partial } : p))
    this.notify()
  }

  public addSalesOrder(so: SalesOrder) {
    this.salesOrders.unshift(so)
    this.notify()
  }

  public updateSalesOrderStage(id: string, stage: SalesOrder["stage"], progress?: number) {
    this.salesOrders = this.salesOrders.map((so) =>
      so.id === id ? { ...so, stage, progress: progress !== undefined ? progress : so.progress } : so
    )
    this.notify()
  }

  public addPurchaseOrder(po: PurchaseOrder) {
    this.purchaseOrders.unshift(po)
    this.notify()
  }

  public updatePurchaseOrderStatus(id: string, status: PurchaseOrder["status"]) {
    const statusColorMap = {
      DRAFT: "bg-zinc-600 text-white",
      "IN TRANSIT": "bg-blue-700 text-white",
      RECEIVED: "bg-emerald-600 text-white",
    }
    this.purchaseOrders = this.purchaseOrders.map((po) =>
      po.id === id ? { ...po, status, statusColor: statusColorMap[status] || "bg-zinc-600 text-white" } : po
    )
    this.notify()
  }
}

export const erpStore = new ErpStore()

export function useErpStore() {
  const [, setTick] = useState(0)

  useEffect(() => {
    const unsub = erpStore.subscribe(() => setTick((t) => t + 1))
    return () => { unsub() }
  }, [])

  return erpStore
}
