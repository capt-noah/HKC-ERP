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
- **Functional Purpose:** Visualizes general company revenue, cost centers, cash flow trends, and net income statistics.
- **Contents (Data & States):**
  - **Financial KPIs:** Monthly Revenue, Operating Expenses, accounts receivable, and accounts payable metrics.
- **How it is Showed (Visualizations):**
  - **Area & Bar Graphs:** Plotted using **Recharts API** utilizing clean primary blacks, ambers, and emeralds matching the overall design style.

#### 2. General Ledger (`/finance/ledger`)
- **Functional Purpose:** The primary double-entry bookkeeping engine of the enterprise, allowing administrators to audit the Chart of Accounts and partner aging matrices.
- **Contents (Data & States):**
  - **Journal Entries:** Transaction ledger containing unique codes (JE-001), dates, accounting descriptions, source PO/invoice references, debit values, credit values, and cumulative balances.
  - **Chart of Accounts:** Classified under Assets, Liabilities, Equity, Revenue, and Expense classes.
  - **Accounts Aging:** Partner tables specifying receivables (AR) and payables (AP) categorized by overdue age classes (Current, 31-60, 61-90, 90+ days).
- **How it is Showed (Visualizations):**
  - **Ledger Audit Tables:** Structured lists featuring monospace JetBrains fonts for perfect alignment of debits, credits, and balance totals.
  - **Account Sliders:** Category groups collapse and expand smoothly.
  - **Self-Balancing Entry Form:** Features an interactive modal to post manual JEs with automatic formula checks, showing a red alert if debits and credits do not balance.

#### 3. Invoices (`/finance/invoices`)
- **Functional Purpose:** Tracks outgoing client billing, dispatch schedules, and accounts receivable collections.
- **Contents (Data & States):**
  - Client invoices with identifier codes, customer name, bill dates, totals, and payment state (Paid, Overdue, Pending).
- **How it is Showed (Visualizations):**
  - Listed inside structured glass rows styled with custom-colored badges representing transaction statuses.

#### 4. Expenses Ledger (`/finance/expenses`)
- **Functional Purpose:** Handles employee expense reports, travel lodging receipts, and software SaaS infrastructure costs.
- **Contents (Data & States):**
  - Merchant name, expense categories, reporting employee, total amount, and authorization status (Approved, Pending, Rejected).
- **How it is Showed (Visualizations):**
  - **Dynamic KPI Summaries:** Live math cards depicting approved vs. pending expenditures.
  - **Authorization Quick Triggers:** Expense rows feature rapid approve/reject check buttons that trigger prompt notification feedback.
  - **File Expense Form:** Pop-up modal containing categorized inputs and file upload drag-and-drop slots.

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
