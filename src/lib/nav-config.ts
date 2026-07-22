import type { NavSection, NavChild } from "@/components/FloatingNav"

export const navSections: NavSection[] = [
  {
    label: "Sales",
    path: "/sales",
    children: [
      { label: "Dashboard", path: "/sales" },
      { label: "Purchase Orders", path: "/sales/purchase-orders" },
      { label: "Sales Orders", path: "/sales/sales-orders" },
    ],
  },
  {
    label: "Inventory",
    path: "/inventory",
    children: [
      { label: "Dashboard", path: "/inventory" },
      { label: "Stock", path: "/inventory/stock" },
      { label: "Reports", path: "/inventory/reports" },
    ],
  },
  {
    label: "Finance",
    path: "/finance",
    children: [
      { label: "Overview", path: "/finance" },
      { label: "Ledger", path: "/finance/ledger" },
      { label: "Invoices", path: "/finance/invoices" },
      { label: "Expenses", path: "/finance/expenses" },
      { label: "Banking", path: "/finance/banking" },
      { label: "Assets & Tax", path: "/finance/assets" },
      { label: "Reports", path: "/finance/reports" },
    ],
  },
  {
    label: "HR",
    path: "/hr",
    children: [
      { label: "Dashboard", path: "/hr" },
      { label: "Employees", path: "/hr/employees" },
      { label: "Payroll", path: "/hr/payroll" },
      { label: "Attendance & Leave", path: "/hr/attendance-leave" },
    ],
  },
  {
    label: "Admin",
    path: "/admin",
    children: [
      { label: "Control Center", path: "/admin" },
      { label: "User Management", path: "/admin/users" },
      { label: "Settings", path: "/admin/settings" },
    ],
  },
]

export function getSectionChildren(sectionPath: string): NavChild[] {
  const section = navSections.find((s) => s.path === sectionPath)
  return section?.children ?? []
}
