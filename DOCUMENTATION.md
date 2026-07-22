# Lumina ERP - System, Modules & Design Documentation

Welcome to the comprehensive system, modules, and design documentation for **Lumina ERP**. This document serves as the single source of truth for the styling, architecture, typography, layouts, and page-by-page component patterns used across the application.

---

## 🎨 Design Philosophy & Theme System

Lumina ERP is built around a distinct, high-end **Glassmorphism** visual language inspired by iOS 26 style ergonomics. It values generous negative space, sophisticated typography pairing, subtle background organic motion, and responsive layout dynamics over standard block-style dashboards.

### 1. Typography Selection
- **Primary / Display UI Font:** `Outfit` (sans-serif) paired with `Inter` to provide a premium, modern, tech-forward aesthetic.
- **Data / Code Font:** `JetBrains Mono` for technical data, code snippets, numbers, and system readouts.
- **Configuration (Tailwind CSS v4 inline config inside `src/index.css`):**
  ```css
  --font-sans: "Outfit", "Inter", ui-sans-serif, system-ui, sans-serif;
  ```

### 2. Color Space (OKLCH)
We utilize modern high-gamut `oklch()` color definitions to ensure smooth gradient rendering and outstanding contrast in both light and dark modes. The brand color is an organic forest green (hue 145).

| Variable Name | Light Mode (OKLCH) | Dark Mode (OKLCH) |
| :--- | :--- | :--- |
| `--background` | `oklch(0.99 0 0)` | `oklch(0.1 0 0)` |
| `--foreground` | `oklch(0.1 0 0)` | `oklch(0.99 0 0)` |
| `--card` | `oklch(1 0 0)` | `oklch(0.14 0 0)` |
| `--primary` | `oklch(0.48 0.16 145)` (Organic Forest Green) | `oklch(0.68 0.16 145)` (Vibrant Mint Green) |
| `--secondary` | `oklch(0.96 0 0)` | `oklch(0.2 0 0)` |
| `--accent` | `oklch(0.96 0.02 145)` (Soft Tint Green) | `oklch(0.22 0.06 145)` (Deep Muted Green) |
| `--destructive` | `oklch(0.15 0 0)` | `oklch(0.99 0 0)` |
| `--border` | `oklch(0.9 0 0)` | `oklch(1 0 0 / 10%)` |

---

## 💎 Custom Classes & Special Visual Styles

### 1. iOS 26 Glass Card (`.glass-card`)
A premium container styled with saturation filters, fine-border borders, and translucent background overlays.
- **Light Mode:**
  - Background: `rgba(255, 255, 255, 0.35)`
  - Backdrop Filter: `blur(40px) saturate(240%)`
  - Border: `1px solid rgba(255, 255, 255, 0.65)`
  - Shadow: Subtle bottom shadow + top-inset white highlight for bevel feeling.
- **Dark Mode (`.dark .glass-card`):**
  - Background: `rgba(20, 20, 22, 0.38)`
  - Backdrop Filter: `blur(40px) saturate(240%)`
  - Border: `1px solid rgba(255, 255, 255, 0.06)`
  - Shadow: Beveled inset highlight with safe dark occlusion shadow.

### 2. Premium Organic Page Gradients (`.page-gradient` & `.page-gradient-dark`)
A layered background that establishes a distinct brand atmosphere.
- **Light Theme Gradient:** Combines a clean white/grey canvas with subtle organic green accents:
  - Background radial gradients feature subtle green aura points (`rgba(34, 197, 94, 0.08)` and `rgba(34, 197, 94, 0.04)`) layered over a clean 135deg linear gradient sliding from `#ffffff` through `#f4f4f5` to `#e4e4e7`.
  - **Dotted Grid Overlay:** A high-end radial-pattern dot grid layout (`opacity: 0.15`, space `24px`) provides a clean structural blueprint aesthetic.
  - **Animated Line Circle:** A dashed rotating cosmic vector line circle (`animation: slow-spin 120s linear infinite`, size `500px x 500px`) sits off-screen at the top-right.
- **Dark Theme Gradient:** Swaps to a rich dark charcoal canvas (`#09090b` through `#18181b`) featuring delicate glowing organic green accents (`rgba(34, 197, 94, 0.06)` and `rgba(34, 197, 94, 0.02)`) with a white dot blueprint overlay (`opacity: 0.08`).

---

## 🗺️ Application Architecture & Routes

The system uses a full-screen layout split into four main operational domains:

```
/ (Root Redirect) ──► /sales
                      ├── /sales (Inventory & Storage Heatmap)
                      ├── /sales/stock (Stock & Products Registry)
                      │   ├── Active Products (Storage Breakdown, Ledger Adjustments)
                      │   └── Regulatory Docs (CoAs, Compliance Licensing)
                      ├── /sales/purchase-orders
                      └── /sales/sales-orders
                      
/finance ───────────► /finance (Overview Charts)
                      ├── /finance/ledger (General Ledger & Aging)
                      ├── /finance/invoices (Invoicing Engine)
                      └── /finance/expenses (Expense Ledger)
                      
/hr ────────────────► /hr (Overview & Team KPIs)
                      ├── /hr/employees (Staff Roster)
                      ├── /hr/payroll (Disbursement Dashboard)
                      └── /hr/attendance-leave (Attendance & Leave Matrix)
                      
/admin ─────────────► /admin (Module Control Center)
                      ├── /admin/users (Access Controls)
                      └── /admin/settings (System Configurations)
```

---

## 🧭 Page-by-Page Deep Dive & Visualizations

This section details the functional purpose, database/state contents, and specific frontend visualizers utilized on every page of the application.

---

### 🛍️ Sales & Inventory Section

#### 1. Inventory Dashboard (`/sales`)
- **Functional Purpose:** Offers real-time overview telemetry of warehouse performance, product allocations, and critical stock events.
- **Contents (Data & States):**
  - **KPIs:** Total SKUs (12,482), Low-Stock alerts (48), Near Expiry alerts (12), Open Orders (342).
  - **Stock Allocation:** Percentage breakdown of categories: *Medical Supplies* (85%), *Food & Nutrition* (62%), *General Goods* (38%).
  - **Storage Activity:** Total active capacity used versus idle space.
  - **Top Moving Items:** Surgical Masks, Sterile Gloves with active metrics.
  - **Expiry Alerts:** Proximity list containing batch tags and warning horizons (e.g. Amoxicillin 500mg, 12 Days remaining).
- **How it is Showed (Visualizations):**
  - **Translucent Progress Trackers:** Allocation percentages are shown with horizontal animated loading bars representing capacity.
  - **Storage Activity Matrix:** A spectacular, dark-themed **stair-step dot matrix grid** depicting capacity utilization. Highlights active slots in amber (`#ffe270`) and idle slots in muted dark gray.
  - **Interactive Sparklines:** Uses inline **SVG path curves** representing sale trend graphs for top moving items.
  - **Amber Proximity Badges:** Bold proximity alerts emphasizing critical warning thresholds.

#### 2. Stock Registry (`/sales/stock` or `/inventory/stock`)
- **Functional Purpose:** Displays the comprehensive catalog of active inventory products, manages regulatory compliance documentation, and handles Material Transfer Notes (MTNs) between warehouses.
- **Contents (Data & States):**
  - **Active Products:** Registry of product codes, SKU, category, warehouse allocations, physical units, active batch, and expiry dates.
  - **Regulatory Docs:** Official Certificates of Analysis (CoAs) and laboratory compliance licenses.
  - **Store-to-Store Transfers (New):** A high-compliance material transfer note tracking ledger between warehouses. It features five screens supporting active state machine flows:
    - *Issued → Received* (Happy path)
    - *Issued → Discrepancy* (Discrepancy path)
  - **Simulation Control Panel:** Toggles mock user context (Store Manager vs. Operator at different locations) to simulate and test role-based warehouse authorization constraints.
- **How it is Showed (Visualizations):**
  - **Registry Toggle Tabs:** Tab bar dividing Active Products, Store Transfers, and Regulatory Docs.
  - **Interactive Ledger Adjuster:** Includes a **real-time slider modal** allowing operators to preview and post immediate stock changes (debit/credit transactions) directly from the item card.
  - **New Product Form Drawer:** A clean form panel featuring dynamic checkbox bindings, structured input layouts, and a file drag-and-drop zone to attach PDF analysis reports.
  - **Store Transfers Workspace:**
    - **Session Simulator Bar:** A subtle, dark borderless console matching our emerald brand color scheme that houses current user switches and role keys.
    - **Transfer Creation Form Drawer:** A full-bleed sidebar panel that restricts selection based on the active warehouse, enables custom product name input with suggestions, and dynamically aggregates accumulative total line-item quantities in real-time.
    - **Material Transfer Note (MTN) Document View:** Laid out like an official corporate letterhead. Displays itemized lists, dual digital signature blocks with custom handwritten script-fonts, timestamps, and active status pills.
    - **Circular Company Stamp:** For completed transfers (Received state), an elegant green double-circle stamp rotated by `-6deg` is stamped on the document.
    - **Discrepancy Warning Badges:** Highlighted with bright amber alerts (`#f59e0b`) showing detailed discrepancy remarks and logs when incoming inventory matches are rejected.

#### 3. Purchase Orders (`/sales/purchase-orders`)
- **Functional Purpose:** Tracks incoming supply chain orders, draft agreements, and delayed supplier deliveries.
- **Contents (Data & States):**
  - **Procurement KPIs:** Draft POs (12), In Transit (8), Delayed POs (3).
  - **Purchase Order List:** Master detail listing representing supplier partners, transit state, document dates, and total capital allocations.
  - **Itemized Breakdown:** Detailed catalog lines specifying parts, SKUs, ordered quantities, unit pricing, and overall PO totals.
- **How it is Showed (Visualizations):**
  - **Split-Panel Screen:** The left third contains a dark-themed glass container holding a search bar and filter pills. The right two-thirds render a document view of the chosen PO with printer actions, itemized lists, and transit progress status bars.

#### 4. Sales Orders (`/sales/sales-orders`)
- **Functional Purpose:** Manages the customer conversion pipeline from initial quote down to active logistics shipping.
- **Contents (Data & States):**
  - **Quotes, Confirmed, Picking, Shipped states.**
  - Detailed client name, order reference codes, total amount, assignee avatar initials, picking progression percentages, and attachments.
- **How it is Showed (Visualizations):**
  - **Interactive Kanban Pipeline:** Built with four columns tracking each stage. Order cards support spring-based lift animations on hover, progress indicators, and visual alert borders indicating urgent priority states.

---

### 💵 Finance Section

#### 1. Finance Overview (`/finance`)
- **Functional Purpose:** Visualizes general company revenue, cost centers, cash flow trends, profitability metrics, and key financial ratios in real-time.
- **Contents (Data & States):**
  - **Financial KPIs:** Monthly Revenue, Operating Expenses, Net Income, Accounts Receivable (AR), Accounts Payable (AP), Cash Balance.
  - **Financial Ratios:** Current Ratio, Quick Ratio, Debt-to-Equity Ratio, Gross Margin %, Net Margin %.
  - **Income vs Expense Trends:** Historical monthly comparison of top-line revenue versus operating expenses.
  - **Cost Center Spend Allocation:** Breakdown of expenditure across cost centers (Operations, Sales, R&D, Administration).
- **How it is Showed (Visualizations):**
  - **Area & Bar Graphs:** Interactive charts built using **Recharts API** with responsive tooltips, emerald revenue curves, and dark zinc bars.
  - **KPI Metric Cards:** High-contrast glass cards featuring sparkline trend icons and delta change badges (+/- %).
  - **Financial Health Radar:** Visual gauge indicators for liquidity ratios and operating margin efficiency.

#### 2. General Ledger & ERPNext Financial Engine (`/finance/ledger`)
- **Functional Purpose:** An enterprise-grade, ERPNext-aligned double-entry accounting engine for multi-currency general ledger management, financial reporting, budgeting, asset depreciation, tax compliance, and period closing.
- **Contents (Data & States):**
  - **Chart of Accounts (COA):** Standard 5-root hierarchical tree (1000 Assets, 2000 Liabilities, 3000 Equity, 4000 Revenue, 5000/6000 Expenses) with parent-child account nodes, account types (Bank, Cash, Receivable, Payable, Fixed Asset, Cost of Goods Sold, Expense, Income), and currency specifications.
  - **Journal Entries (JE):** Real-time double-entry posting ledger with unique IDs (`JE-YYYY-XXXX`), document posting dates, accounting remarks, cost center tags, debit/credit entries, source reference tracking, and auto-balancing validation (`Total Debit == Total Credit`).
  - **Accounts Receivable & Payable Aging:** Detailed customer and supplier sub-ledgers with aging buckets (Current, 1-30 days, 31-60 days, 61-90 days, 90+ days) and payment history logs.
  - **Multi-Currency & Exchange Rate Revaluation:** Base currency (USD) vs. foreign currency (EUR, GBP, JPY) transaction logging with automated rate revaluation posting gains/losses to `4200 - Foreign Exchange Gain/Loss`.
  - **Payment Reconciliation & Matching:** Automated and manual invoice-to-payment matching, handling partial payments, advance payments, and posting unallocated balances.
  - **Budgeting & Cost Center Analytics:** Cost center allocation (Sales, Operations, R&D, Administration) with budget limit checking, threshold warning alerts (>80%), and variance reporting.
  - **Fixed Assets & Depreciation:** Fixed Asset registry tracking purchase cost, salvage value, useful life (years), straight-line depreciation schedules, and automated journal posting (`6500 Depreciation Expense` vs `1510 Accumulated Depreciation`).
  - **Accounting Periods & Fiscal Year Closing:** Period locking mechanisms (Prevent entries in closed periods), fiscal year end closing workflows, and automated transfer of net profit/loss to `3100 Retained Earnings`.
  - **Bank Reconciliation:** Matching bank statement lines against internal GL bank/cash entries, uncleared deposit tracking, and bank reconciliation statements.
  - **Tax Templates & Tax Engine:** Configurable tax rules (Standard GST 18%, Exempt, Reverse Charge), sales/purchase tax ledgers (`2200 Output Tax` / `1300 Input Tax Credit`), and tax liability reporting.
  - **Financial Statements:** Live generation of **Balance Sheet**, **Income Statement (Profit & Loss)**, **Trial Balance**, and **Cash Flow Statement** derived directly from real GL transactions.
- **How it is Showed (Visualizations):**
  - **Hierarchical COA Tree View:** Collapsible/expandable account categories with color-coded root node badges, real-time running balances, and account creation modals.
  - **Ledger Audit & Journal Entry Table:** Monospace `JetBrains Mono` formatting for perfect tabular alignment of debit, credit, and running balance values.
  - **Interactive Multi-Tab Workspace:** Top tab bar allowing seamless navigation between *General Ledger*, *Chart of Accounts*, *AR/AP Aging*, *Multi-Currency*, *Payment Reconciliation*, *Budgeting & Cost Centers*, *Fixed Assets*, *Accounting Periods*, *Bank Reconciliation*, *Tax Ledger*, and *Financial Statements*.
  - **Self-Balancing Entry Modal:** Modal dialog with live debit/credit tallying, red imbalance alerts, cost center selector dropdowns, and draft vs. posted controls.
  - **Financial Statement Print/Export Layout:** Clean formatted report views with expandable account subtotals and one-click PDF/CSV export capabilities.

#### 3. Invoices Engine (`/finance/invoices`)
- **Functional Purpose:** Full-lifecycle invoicing management for customer Accounts Receivable (AR) Invoices, integrated with ERPNext-style tax templates, payment terms, discount structures, draft status handling, and automatic GL journal entry posting.
- **Contents (Data & States):**
  - **AR Executive Summary KPIs:** Total AR Exposure (uncollected receivables balance), Total Collections Received (cash/bank), Overdue AR Amount (past due date), and Active Invoices Count.
  - **Invoice Directory:** Customer invoices with identifier codes (`INV-2026-XXX`), party details, issue dates, due dates, payment terms (`Net 30`, `Net 15`, `Immediate`, `50% Advance`), tax templates (`15% Standard VAT`, `0% Zero-Rated`, `3% Withholding`), discount amounts, and status (`Draft`, `Sent`, `Paid`, `Overdue`, `Cancelled`).
  - **Line Item Catalog:** Itemized product entries, quantities, unit prices, line item totals, and automatically calculated tax/discount breakdowns.
- **How it is Showed (Visualizations):**
  - **Invoice Document & Slide-In Audit Panel:** Formatted letterhead layout displaying customer details, payment terms, itemized line items, subtotal, discount, tax, balance due, and a dedicated **GL Posting Impact Audit** breakdown (Debit ACC-1200 AR, Credit ACC-4000 Sales Revenue, Credit ACC-2210 Tax Liability).
  - **Void / Cancel Invoice Action:** Allows cancelling active invoices, automatically posting an opposing GL reversal journal entry (`Debit ACC-4000`, `Debit ACC-2210`, `Credit ACC-1200`) and updating invoice status to `Cancelled`.
  - **Interactive Creation Drawer:** Full-height slide-over drawer with line-item management, tax template selector, payment terms, discount input, real-time calculation readout, and dual submission modes (**Save Draft** vs. **Issue & Post Invoice**).
  - **Status Badge Filters & Quick Payments:** Color-coded status pills with single-click payment recording modals that immediately update uncollected balances and post bank receipt GL entries.

#### 4. Expenses & Recurring Schedules (`/finance/expenses`)
- **Functional Purpose:** Handles employee expense claims with cost center allocation, operational vendor expenses, recurring expense schedules with status toggling, and corporate vehicle fleet maintenance with automated GL posting.
- **Contents (Data & States):**
  - **Expenses Executive Summary KPIs:** Approved Expenses YTD, Pending Claims Audit Count & Value, Monthly Recurring Commitment, and Total Fleet Maintenance Expense.
  - **Expense Claim Registry:** Expense ID (`EXP-2026-XXX`), merchant/vendor, claimant employee, cost center (`CC-100 Corporate HQ`, `CC-200 Logistics & Warehouse`, `CC-300 Sales & Field Ops`), expense GL account head (`ACC-5100 Rent`, `ACC-5200 SaaS/Utilities`, `ACC-5300 R&D`, `ACC-5400 Vehicle Fleet`, `ACC-5010 Payroll`), tax reclaim portion (15%), voucher/receipt reference, amount, and approval status (`PENDING`, `APPROVED`, `REJECTED`).
  - **Recurring Expense Schedules:** Automated recurring payment rules (Monthly, Quarterly, Annual) with cost center allocation, linked contract references, next due dates, auto-generation simulation, and Pause/Activate status toggling.
  - **Fleet Vehicle Registry & Maintenance Logs:** Corporate vehicles (trucks, vans) assigned to warehouses, driver details, repair logs, and automated GL entry posting to `ACC-5400` Vehicle Fleet Repairs upon logging maintenance.
- **How it is Showed (Visualizations):**
  - **Dynamic Expense KPI Cards:** Live summary metrics highlighting approved YTD expenditures, pending treasury audit queue, monthly recurring commitments, and total fleet service history.
  - **Approval Pipeline & GL Auto-Posting:** One-click approval/rejection action buttons. Approving a claim automatically posts a double-entry GL journal debiting the designated Expense GL Account & Tax Reclaim Account and crediting Cash/Bank (`ACC-1000`).
  - **Recurring Schedule Builder & Status Control:** Modal interface to define frequency, amount, cost center, next due date, and vendor references, alongside quick Pause/Activate toggle buttons on table rows.
  - **Fleet Maintenance Log Modal:** Allows logging repairs per vehicle registration number with immediate GL entry creation and service history logging.

---

### 👥 Human Resources Section

#### 1. HR Dashboard (`/hr`)
- **Functional Purpose:** Visualizes personnel metrics, interviews, weekly calendar schedules, and staff rosters.
- **Contents (Data & States):**
  - **HR KPIs:** Employee counts, active hirings, active leaves, interview pipelines, and placement progress numbers.
  - **Schedule Agenda:** Daily events, team coordinates, and interview calendar schedules.
- **How it is Showed (Visualizations):**
  - **Asymmetric Grid Layout:** Features a calendar grid on the left containing clickable day slots, a middle column visualizing overall attendance, and a staff search bar list on the right.

#### 2. Employees Staff Roster (`/hr/employees`)
- **Functional Purpose:** Houses the official personnel directory, staff department assignments, and salary records.
- **Contents (Data & States):**
  - Staff rosters showing role names, emails, active/on-leave statuses, and departments.
- **How it is Showed (Visualizations):**
  - **Department Filter Bar:** A series of modern pill buttons allowing instantaneous roster filtering.
  - **New Hire Modal:** Pop-up registration form supporting email validation.

#### 3. Payroll Disbursement (`/hr/payroll`)
- **Functional Purpose:** Manages monthly salary dispersals, tax withholdings, allowances, and payment states.
- **Contents (Data & States):**
  - Employee list showing base salary, allowance numbers, tax deductions, and payment state (Paid vs. Pending).
- **How it is Showed (Visualizations):**
  - **Bulk Disburse Controller:** Features a prominent **Process Bulk Payroll button** that triggers state updates with quick confirmation notifications.

#### 4. Attendance & Leave Matrix (`/hr/attendance-leave`)
- **Functional Purpose:** Logs employee day-to-day attendance and vacation/sick leave approvals.
- **Contents (Data & States):**
  - **Attendance Calendar:** 14-day timeline matrix indicating present/absent/leave status for every employee.
  - **Active Leave Requests:** Sick leave, medical, or holiday applications awaiting approval.
- **How it is Showed (Visualizations):**
  - **Attendance Dot Matrix:** Interactive matrix using green dots for present, red for absent, and amber for active leaves.
  - **Approval Pipeline:** Features request cards with instant action keys that trigger system state updates.

---

### ⚙️ Admin Section

#### 1. Admin Control Center (`/admin`)
- **Functional Purpose:** The primary administrative control deck tracking general revenue, system audit logs, and quick user accesses.
- **Contents (Data & States):**
  - KPI charts, active orders, and live system log updates.
- **How it is Showed (Visualizations):**
  - Includes user tables and a chronological event feed highlighted with color-coded dot severity indicators (e.g., Red for stock alerts, Amber for PO status updates, Green for sales orders).

#### 2. User Management (`/admin/users`)
- **Functional Purpose:** Administers internal accounts, edits security privileges, and invites new users.
- **Contents (Data & States):**
  - User names, roles (Admin, HR Manager, Finance Auditor, Staff), and status (Active, Suspended, Invited).
- **How it is Showed (Visualizations):**
  - High-end security matrix list with actions to suspend, delete, or promote profiles.

#### 3. System Settings (`/admin/settings`)
- **Functional Purpose:** Controls enterprise configurations, currency preferences, backup policies, and API keys.
- **Contents (Data & States):**
  - Timezones, currency settings, API key parameters, and backup archives.
- **How it is Showed (Visualizations):**
  - Tabbed glass console separating settings categories, with instant rollbacks and success toasts.

---

## 🧱 Core Shared Components

### 1. `FloatingNav` (`/src/components/FloatingNav.tsx`)
The primary fixed navigation bar floating gracefully at `top-4`. It consists of three standalone glass pill sections aligned horizontally:
- **Left Pill (Brand):** Renders the Lumina ERP brand mark, logo, or icon.
- **Middle Pill (Menu Navigation):** Centered router tabs containing active slide indications and interactive hover styling.
- **Right Pill (Actions):** Quick controls (Settings button, real-time Pulsing Notifications bell, User profile shortcut).

### 2. `SubPageNav` (`/src/components/SubPageNav.tsx`)
A local page submenu controller. It is automatically fed by children endpoints defined in `src/lib/nav-config.ts` and renders inline pill links with interactive backgrounds (Amber accent for active, glassmorphism card for inactive states).

### 3. `GlassCard` (`/src/components/GlassCard.tsx`)
A modular wrapper around `framer-motion`'s `motion.div`. By default:
- It includes smooth scale and fade-in entries (`opacity: 0 -> 1`, `scale: 0.95 -> 1`).
- Implements a subtle hover lifting effect (`y: -2`) using spring easing.
- Configurable via `variant="light"` or `"dark"`.

### 4. `Toast` (`/src/components/Toast.tsx`)
An elegant system toast alerting container rendering check circles, warning indicators, info banners, and close buttons on the top-right of the screen under `AnimatePresence` animations.

---

## 🛠️ Code Style & Design Guidelines for Developers

Adhere to these guidelines to preserve the design fidelity:

1. **Keep Imports Safe:** Always import motion properties from standard `"framer-motion"`.
2. **Never Overpopulate the Screen:** Respect negative space. Each dashboard card should have ample margins (`mb-6`, `gap-5`, `p-6`).
3. **Use the `GlassCard` Component:** Do not manually create cards with plain tailwind classes; wrap them in `<GlassCard>` to benefit from standard entry animations, interactive hovers, and custom backdrop filters.
4. **Icons:** Exclusively use the `lucide-react` library. Do not embed raw SVG nodes.
5. **No Clutter:** Avoid raw text status logs, simulated network coordinates, or artificial loading telemetry. Keep titles human, clean, and literal.
6. **Unified Subpage Navigation Layout:** Sub-navigation pills (Dashboard, Employees, Payroll) must always be placed on the far right of the top-level page header block using the shared `<SubPageNav />` component to ensure absolute size, style, and placement consistency across all views.
7. **Minimalist Controls Alignment:** Search and filter bars must be styled with compact rounded-full minimalist designs and placed directly on the right side (immediately to the left of the main action buttons like Add Employee or Process Payroll). Both must match the exact height (`h-[38px]`) of the action buttons.
8. **Maximizing Grid Visibility:** Intermediary statistics and metrics cards right above lists or tables must be avoided or kept extremely minimal to maximize data list focus and maintain clean white space.
9. **Update this Documentation:** If you add new pages, color variables, or new common components, update this file immediately.
