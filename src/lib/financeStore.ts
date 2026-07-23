import { useState, useEffect } from "react"

// JSON imports for default initial state
import chartOfAccountsData from "../../data/chart_of_accounts.json"
import journalEntriesData from "../../data/journal_entries.json"
import journalEntryLinesData from "../../data/journal_entry_lines.json"
import invoicesData from "../../data/invoices.json"
import paymentsData from "../../data/payments.json"
import recurringExpenseSchedulesData from "../../data/recurring_expense_schedules.json"
import vehiclesData from "../../data/vehicles.json"
import accountingPeriodsData from "../../data/accounting_periods.json"
import companySettingsData from "../../data/company_settings.json"
import payrollRunsData from "../../data/payroll_runs.json"
import revaluationsData from "../../data/revaluations.json"

export interface AccountItem {
  id: string
  code: string
  name: string
  account_type: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense"
  parent_account_id: string | null
  is_active: boolean
  is_group?: boolean
}

export interface JournalEntry {
  id: string
  entry_date: string
  description: string
  source_type:
    | "Sales Invoice"
    | "Purchase Invoice"
    | "Payment"
    | "Payroll Run"
    | "Payroll Accrual"
    | "Payroll Payment"
    | "Exchange Revaluation"
    | "Warehouse Transfer"
    | "Manual Adjustment"
    | "Recurring Expense"
    | "Round Off"
    | "Reversal"
  source_id: string | null
  created_by: string
  currency: string
  exchange_rate: number
  is_reversal_of: string | null
}

export interface JournalEntryLine {
  id: string
  journal_entry_id: string
  account_id: string
  debit_amount: number
  credit_amount: number
  currency: string
  exchange_rate_at_time: number
  warehouse_id: string | null
  party_type?: "Customer" | "Supplier" | "Employee" | null
  party_id?: string | null
  party_name?: string | null
}

export interface InvoiceLineItem {
  description: string
  quantity: number
  unit_price: number
  line_total: number
}

export interface Invoice {
  id: string
  invoice_number: string
  customer_name: string
  issue_date: string
  due_date: string
  currency: string
  line_items: InvoiceLineItem[]
  subtotal: number
  tax_amount: number
  discount_amount?: number
  payment_terms?: string
  total: number
  amount_paid: number
  balance_due: number
  status: "Draft" | "Sent" | "Paid" | "Partially Paid" | "Overdue" | "Void" | "Cancelled"
}

export interface Payment {
  id: string
  direction: "Received" | "Made"
  linked_invoice_id: string | null
  amount: number
  currency: string
  date: string
  method: string
  reference: string
}

export interface RecurringExpenseSchedule {
  id: string
  expense_type: "Office Rent" | "Warehouse Rent" | "Petty Cash" | "Vehicle Cost" | "Software & SaaS" | "Other"
  amount: number
  currency: string
  frequency: "Monthly" | "Quarterly" | "Annually"
  next_due_date: string
  linked_resource_id: string | null
  cost_center?: string
  auto_generate: boolean
  status: "Active" | "Paused"
}

export interface OneOffExpense {
  id: string
  merchant: string
  category: string
  date: string
  employee: string
  amount: number
  currency: string
  status: "APPROVED" | "PENDING" | "REJECTED"
  cost_center?: string
  gl_account_id?: string
  receipt_ref?: string
  tax_amount?: number
}

export interface VehicleMaintenance {
  date: string
  description: string
  amount: number
}

export interface Vehicle {
  id: string
  registration_number: string
  type: string
  assigned_warehouse: string
  driver_name: string
  maintenance_cost_history: VehicleMaintenance[]
  status: "Active" | "In Repair" | "Retired"
}

export interface AccountingPeriod {
  id: string
  period_label: string
  start_date: string
  end_date: string
  is_closed: boolean
}

export interface CompanySettings {
  company_name: string
  base_currency: string
  exchange_rates: Record<string, number>
  unrealized_exchange_gain_loss_account_id: string
  payroll_expense_account_id: string
  payroll_payable_account_id: string
  tax_payable_account_id: string
}

export interface PayrollDeduction {
  type: string
  amount: number
}

export interface PayrollEmployee {
  employee_id: string
  employee_name: string
  gross_pay: number
  deductions: PayrollDeduction[]
  net_pay: number
}

export interface PayrollRun {
  id: string
  period_label: string
  period_start: string
  period_end: string
  status: "Draft" | "Accrued" | "Paid"
  employees: PayrollEmployee[]
  total_gross: number
  total_deductions: number
  total_net: number
  accrual_journal_entry_id: string | null
  payment_journal_entry_id: string | null
}

export interface Revaluation {
  id: string
  revaluation_date: string
  currency: string
  target_account_id: string
  original_balance: number
  current_rate: number
  new_balance_in_base: number
  unrealized_gain_loss: number
  journal_entry_id: string | null
  status: "Draft" | "Posted" | "Cancelled"
}

// Initial default one-off expenses
const initialOneOffExpenses: OneOffExpense[] = [
  { id: "EXP-8012", merchant: "Amazon Web Services", category: "Infrastructure", date: "2026-07-05", employee: "Alex Mercer", amount: 12450.00, currency: "ETB", status: "APPROVED" },
  { id: "EXP-8011", merchant: "Delta Air Lines", category: "Travel & Lodging", date: "2026-07-04", employee: "Marcus Vance", amount: 1850.50, currency: "ETB", status: "PENDING" },
  { id: "EXP-8010", merchant: "Salesforce CRM", category: "Software & SaaS", date: "2026-06-30", employee: "Sophia Chen", amount: 4200.00, currency: "ETB", status: "APPROVED" },
  { id: "EXP-8009", merchant: "The Steakhouse Tavern", category: "Meals & Entertaining", date: "2026-06-28", employee: "Sophia Chen", amount: 840.00, currency: "ETB", status: "REJECTED" },
]

// In-Memory Storage State
class FinanceStore {
  private accounts: AccountItem[] = (chartOfAccountsData as AccountItem[])
  private entries: JournalEntry[] = (journalEntriesData as JournalEntry[])
  private lines: JournalEntryLine[] = (journalEntryLinesData as JournalEntryLine[])
  private invoices: Invoice[] = (invoicesData as Invoice[])
  private payments: Payment[] = (paymentsData as Payment[])
  private recurringSchedules: RecurringExpenseSchedule[] = (recurringExpenseSchedulesData as RecurringExpenseSchedule[])
  private expenses: OneOffExpense[] = initialOneOffExpenses
  private vehicles: Vehicle[] = (vehiclesData as Vehicle[])
  private periods: AccountingPeriod[] = (accountingPeriodsData as AccountingPeriod[])
  private companySettings: CompanySettings = (companySettingsData as CompanySettings)
  private payrollRuns: PayrollRun[] = (payrollRunsData as PayrollRun[])
  private revaluations: Revaluation[] = (revaluationsData as Revaluation[])

  private listeners = new Set<() => void>()

  constructor() {
    this.loadFromLocalStorage()
  }

  private loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem("lumina_finance_store_v3")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.accounts) this.accounts = parsed.accounts
        if (parsed.entries) this.entries = parsed.entries
        if (parsed.lines) this.lines = parsed.lines
        if (parsed.invoices) this.invoices = parsed.invoices
        if (parsed.payments) this.payments = parsed.payments
        if (parsed.recurringSchedules) this.recurringSchedules = parsed.recurringSchedules
        if (parsed.expenses) this.expenses = parsed.expenses
        if (parsed.vehicles) this.vehicles = parsed.vehicles
        if (parsed.periods) this.periods = parsed.periods
        if (parsed.companySettings) this.companySettings = parsed.companySettings
        if (parsed.payrollRuns) this.payrollRuns = parsed.payrollRuns
        if (parsed.revaluations) this.revaluations = parsed.revaluations
      }
    } catch {
      // Ignore storage errors
    }
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem(
        "lumina_finance_store_v3",
        JSON.stringify({
          accounts: this.accounts,
          entries: this.entries,
          lines: this.lines,
          invoices: this.invoices,
          payments: this.payments,
          recurringSchedules: this.recurringSchedules,
          expenses: this.expenses,
          vehicles: this.vehicles,
          periods: this.periods,
          companySettings: this.companySettings,
          payrollRuns: this.payrollRuns,
          revaluations: this.revaluations,
        })
      )
    } catch {
      // Ignore storage errors
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    this.saveToLocalStorage()
    this.listeners.forEach((l) => l())
  }

  // --- Getters ---
  public getAccounts(): AccountItem[] {
    return [...this.accounts]
  }

  public getJournalEntries(): JournalEntry[] {
    return [...this.entries]
  }

  public getJournalEntryLines(): JournalEntryLine[] {
    return [...this.lines]
  }

  public getInvoices(): Invoice[] {
    return [...this.invoices]
  }

  public getPayments(): Payment[] {
    return [...this.payments]
  }

  public getRecurringSchedules(): RecurringExpenseSchedule[] {
    return [...this.recurringSchedules]
  }

  public getOneOffExpenses(): OneOffExpense[] {
    return [...this.expenses]
  }

  public getVehicles(): Vehicle[] {
    return [...this.vehicles]
  }

  public getAccountingPeriods(): AccountingPeriod[] {
    return [...this.periods]
  }

  public getCompanySettings(): CompanySettings {
    return { ...this.companySettings }
  }

  public getPayrollRuns(): PayrollRun[] {
    return [...this.payrollRuns]
  }

  public getRevaluations(): Revaluation[] {
    return [...this.revaluations]
  }

  // --- Company Settings Actions ---
  public updateExchangeRate(currency: string, rate: number) {
    this.companySettings = {
      ...this.companySettings,
      exchange_rates: {
        ...this.companySettings.exchange_rates,
        [currency]: rate,
      },
    }
    this.notify()
  }

  // --- Chart of Accounts Actions ---
  public addAccount(account: Omit<AccountItem, "id">): { success: boolean; error?: string; account?: AccountItem } {
    if (this.accounts.some((a) => a.code === account.code)) {
      return { success: false, error: `Account code "${account.code}" already exists in Chart of Accounts.` }
    }
    const newAcc: AccountItem = {
      ...account,
      id: `ACC-${account.code}`,
    }
    this.accounts = [...this.accounts, newAcc]
    this.notify()
    return { success: true, account: newAcc }
  }

  public toggleAccountActive(id: string) {
    this.accounts = this.accounts.map((acc) =>
      acc.id === id || acc.code === id ? { ...acc, is_active: !acc.is_active } : acc
    )
    this.notify()
  }

  public toggleLockPeriod(periodId: string) {
    this.periods = this.periods.map((p) => (p.id === periodId ? { ...p, is_closed: !p.is_closed } : p))
    this.notify()
  }

  // --- Posting Journal Entry Rules ---
  public postJournalEntry(
    entryData: Omit<JournalEntry, "id" | "is_reversal_of"> & { is_reversal_of?: string | null },
    rawLines: Array<{
      account_id: string
      debit_amount: number
      credit_amount: number
      warehouse_id?: string | null
      party_type?: "Customer" | "Supplier" | "Employee" | null
      party_id?: string | null
      party_name?: string | null
    }>
  ): { success: boolean; error?: string; entry?: JournalEntry; autoRounded?: boolean; roundOffAmount?: number } {
    // 1. Data-layer check: Reject if any selected account is inactive
    for (const line of rawLines) {
      const acc = this.accounts.find((a) => a.id === line.account_id || a.code === line.account_id)
      if (!acc) {
        return { success: false, error: `Account "${line.account_id}" does not exist in Chart of Accounts.` }
      }
      if (!acc.is_active) {
        return { success: false, error: `Posting rejected: Account "${acc.code} - ${acc.name}" is disabled.` }
      }

      // 2. HARD RULE ENFORCEMENT: Reject creating any line against Receivable, Payable, or Payroll Payable account without party reference
      const accCode = acc.code
      const accName = acc.name.toLowerCase()
      const isReceivable = accCode === "1200" || accName.includes("receivable")
      const isPayable = accCode === "2000" || accName.includes("payable")
      const isPayrollPayable = accCode === "2100" || accCode === "2210" || accName.includes("payroll")

      if ((isReceivable || isPayable || isPayrollPayable) && !line.party_id && !line.party_name) {
        return {
          success: false,
          error: `Posting rejected: Account "${acc.code} - ${acc.name}" requires a Party Reference (Customer, Supplier, or Employee).`,
        }
      }
    }

    // 3. Round amounts to 2 decimal places before comparing
    let totalDebit = rawLines.reduce((sum, l) => sum + Math.round(l.debit_amount * 100) / 100, 0)
    let totalCredit = rawLines.reduce((sum, l) => sum + Math.round(l.credit_amount * 100) / 100, 0)

    totalDebit = Math.round(totalDebit * 100) / 100
    totalCredit = Math.round(totalCredit * 100) / 100

    const diff = Math.round(Math.abs(totalDebit - totalCredit) * 100) / 100
    let autoRounded = false
    let roundOffAmount = 0

    const finalLines = [...rawLines]

    // 4. Round off vs Imbalance tolerance
    if (diff > 0.01) {
      return {
        success: false,
        error: `Imbalance detected: Total Debits (${totalDebit.toFixed(2)} ${entryData.currency}) do not equal Total Credits (${totalCredit.toFixed(2)} ${entryData.currency}). Imbalance of ${diff.toFixed(2)} ${entryData.currency}.`,
      }
    } else if (diff > 0 && diff <= 0.01) {
      // Auto-add balancing line to Round Off account (acc-5990 / code 5990)
      autoRounded = true
      roundOffAmount = diff
      const roundOffAcc = this.accounts.find((a) => a.code === "5990" || a.id === "acc-5990") || this.accounts[0]
      if (totalDebit < totalCredit) {
        finalLines.push({
          account_id: roundOffAcc.id,
          debit_amount: diff,
          credit_amount: 0,
          warehouse_id: null,
        })
      } else {
        finalLines.push({
          account_id: roundOffAcc.id,
          debit_amount: 0,
          credit_amount: diff,
          warehouse_id: null,
        })
      }
    }

    // Generate Entry ID safely by checking max numeric suffix and avoiding duplicates
    let maxJeNum = 0
    const currentYear = new Date().getFullYear()
    for (const ent of this.entries) {
      if (ent.id) {
        const match = ent.id.match(/\d+$/)
        if (match) {
          const val = parseInt(match[0], 10)
          if (!isNaN(val) && val > maxJeNum) {
            maxJeNum = val
          }
        }
      }
    }
    let nextJeNum = Math.max(maxJeNum + 1, this.entries.length + 1)
    let newEntryId = `JE-${currentYear}-${String(nextJeNum).padStart(3, "0")}`
    while (this.entries.some((e) => e.id === newEntryId)) {
      nextJeNum++
      newEntryId = `JE-${currentYear}-${String(nextJeNum).padStart(3, "0")}`
    }

    const newEntry: JournalEntry = {
      id: newEntryId,
      entry_date: entryData.entry_date,
      description: entryData.description,
      source_type: entryData.source_type,
      source_id: entryData.source_id ?? null,
      created_by: entryData.created_by,
      currency: entryData.currency,
      exchange_rate: entryData.exchange_rate,
      is_reversal_of: entryData.is_reversal_of ?? null,
    }

    const createdLines: JournalEntryLine[] = finalLines.map((fl, idx) => ({
      id: `JEL-${Date.now()}-${idx}`,
      journal_entry_id: newEntryId,
      account_id: fl.account_id,
      debit_amount: Math.round(fl.debit_amount * 100) / 100,
      credit_amount: Math.round(fl.credit_amount * 100) / 100,
      currency: entryData.currency,
      exchange_rate_at_time: entryData.exchange_rate,
      warehouse_id: fl.warehouse_id ?? null,
      party_type: fl.party_type ?? null,
      party_id: fl.party_id ?? null,
      party_name: fl.party_name ?? null,
    }))

    this.entries = [newEntry, ...this.entries]
    this.lines = [...createdLines, ...this.lines]

    this.notify()
    return { success: true, entry: newEntry, autoRounded, roundOffAmount }
  }

  // --- Reversal Action ---
  public reverseJournalEntry(
    targetEntryId: string,
    targetLineId?: string
  ): { success: boolean; reversalEntry?: JournalEntry; error?: string } {
    const originalEntry = this.entries.find((e) => e.id === targetEntryId)
    if (!originalEntry) {
      return { success: false, error: "Original journal entry not found." }
    }

    const originalLines = this.lines.filter((l) => l.journal_entry_id === targetEntryId)
    if (originalLines.length === 0) {
      return { success: false, error: "Original journal entry lines not found." }
    }

    let linesToReverse = originalLines
    if (targetLineId) {
      linesToReverse = originalLines.filter((l) => l.id === targetLineId)
      if (linesToReverse.length === 0) {
        return { success: false, error: "Target line not found for partial reversal." }
      }
    }

    // Build swapped lines preserving party references
    const reversedRawLines = linesToReverse.map((l) => ({
      account_id: l.account_id,
      debit_amount: l.credit_amount, // SWAPPED
      credit_amount: l.debit_amount, // SWAPPED
      warehouse_id: l.warehouse_id,
      party_type: l.party_type,
      party_id: l.party_id,
      party_name: l.party_name,
    }))

    const desc = targetLineId
      ? `Partial Reversal of ${originalEntry.id} line ${targetLineId}`
      : `Reversal of Entry ${originalEntry.id}: ${originalEntry.description}`

    const result = this.postJournalEntry(
      {
        entry_date: new Date().toISOString().split("T")[0],
        description: desc,
        source_type: "Reversal",
        source_id: originalEntry.id,
        created_by: "System Auditor",
        currency: originalEntry.currency,
        exchange_rate: originalEntry.exchange_rate,
        is_reversal_of: originalEntry.id,
      },
      reversedRawLines
    )

    if (result.success && result.entry) {
      return { success: true, reversalEntry: result.entry }
    }
    return { success: false, error: result.error || "Failed to post reversal entry." }
  }

  // --- Invoice & Payment Actions ---
  public createInvoice(invoiceData: Omit<Invoice, "id" | "amount_paid" | "balance_due">): Invoice {
    const newId = `inv-${Date.now().toString().slice(-4)}`
    const subtotal = invoiceData.line_items.reduce((s, item) => s + item.line_total, 0)
    const discount = invoiceData.discount_amount || 0
    const netSubtotal = Math.max(0, subtotal - discount)
    const tax = invoiceData.tax_amount || 0
    const total = netSubtotal + tax

    const newInv: Invoice = {
      id: newId,
      invoice_number: invoiceData.invoice_number,
      customer_name: invoiceData.customer_name,
      issue_date: invoiceData.issue_date,
      due_date: invoiceData.due_date,
      currency: invoiceData.currency,
      line_items: invoiceData.line_items,
      subtotal,
      tax_amount: tax,
      discount_amount: discount,
      payment_terms: invoiceData.payment_terms || "Net 30",
      total,
      amount_paid: 0,
      balance_due: total,
      status: invoiceData.status || "Sent",
    }

    this.invoices = [newInv, ...this.invoices]

    // Post corresponding journal entry if not Draft
    if (newInv.status !== "Draft") {
      const arAcc = this.accounts.find((a) => a.code === "1200") || this.accounts[0]
      const salesAcc = this.accounts.find((a) => a.code === "4000") || this.accounts[0]
      const taxAcc = this.accounts.find((a) => a.code === "2210") || this.accounts[0]

      const rawLines: Array<{ account_id: string; debit_amount: number; credit_amount: number; party_type?: any; party_id?: string; party_name?: string }> = [
        {
          account_id: arAcc.id,
          debit_amount: total,
          credit_amount: 0,
          party_type: "Customer",
          party_id: `CUST-${invoiceData.customer_name.replace(/\s+/g, "").toUpperCase()}`,
          party_name: invoiceData.customer_name,
        },
        {
          account_id: salesAcc.id,
          debit_amount: 0,
          credit_amount: netSubtotal,
        },
      ]

      if (tax > 0) {
        rawLines.push({
          account_id: taxAcc.id,
          debit_amount: 0,
          credit_amount: tax,
        })
      }

      this.postJournalEntry(
        {
          entry_date: invoiceData.issue_date,
          description: `Invoice ${invoiceData.invoice_number} generated for ${invoiceData.customer_name}`,
          source_type: "Sales Invoice",
          source_id: invoiceData.invoice_number,
          created_by: "Billing System",
          currency: invoiceData.currency,
          exchange_rate: 1.0,
        },
        rawLines
      )
    }

    this.notify()
    return newInv
  }

  public cancelInvoice(invoiceId: string) {
    const inv = this.invoices.find((i) => i.id === invoiceId || i.invoice_number === invoiceId)
    if (!inv) return

    this.invoices = this.invoices.map((i) => (i.id === inv.id ? { ...i, status: "Cancelled" as const, balance_due: 0 } : i))

    // Reverse any posted entry for this invoice
    const relatedEntry = this.entries.find((e) => e.source_id === inv.invoice_number || e.source_id === inv.id)
    if (relatedEntry) {
      this.reverseJournalEntry(relatedEntry.id, `Cancellation of Invoice ${inv.invoice_number}`)
    }

    this.notify()
  }

  public recordPayment(paymentData: {
    linked_invoice_id: string | null
    amount: number
    currency: string
    date: string
    method: string
    reference: string
    direction: "Received" | "Made"
  }): { payment: Payment; invoice?: Invoice } {
    const payId = `PAY-${Date.now().toString().slice(-4)}`
    const newPayment: Payment = {
      id: payId,
      direction: paymentData.direction,
      linked_invoice_id: paymentData.linked_invoice_id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      date: paymentData.date,
      method: paymentData.method,
      reference: paymentData.reference,
    }

    this.payments = [newPayment, ...this.payments]

    let updatedInv: Invoice | undefined

    if (paymentData.linked_invoice_id) {
      let custName = "Customer"
      this.invoices = this.invoices.map((inv) => {
        if (inv.id === paymentData.linked_invoice_id || inv.invoice_number === paymentData.linked_invoice_id) {
          custName = inv.customer_name
          const newPaid = inv.amount_paid + paymentData.amount
          const newBal = Math.max(0, inv.total - newPaid)
          let newStatus: Invoice["status"] = inv.status
          if (newBal === 0) {
            newStatus = "Paid"
          } else if (newPaid > 0) {
            newStatus = "Partially Paid"
          }
          updatedInv = {
            ...inv,
            amount_paid: newPaid,
            balance_due: newBal,
            status: newStatus,
          }
          return updatedInv
        }
        return inv
      })

      // Post corresponding Journal Entry
      const cashAcc = this.accounts.find((a) => a.code === "1000") || this.accounts[0]
      const arAcc = this.accounts.find((a) => a.code === "1200") || this.accounts[0]

      this.postJournalEntry(
        {
          entry_date: paymentData.date,
          description: `Payment receipt (${paymentData.reference}) for Invoice ${paymentData.linked_invoice_id}`,
          source_type: "Payment",
          source_id: payId,
          created_by: "Cashier",
          currency: paymentData.currency,
          exchange_rate: 1.0,
        },
        [
          { account_id: cashAcc.id, debit_amount: paymentData.amount, credit_amount: 0 },
          {
            account_id: arAcc.id,
            debit_amount: 0,
            credit_amount: paymentData.amount,
            party_type: "Customer",
            party_id: `CUST-${custName.replace(/\s+/g, "").toUpperCase()}`,
            party_name: custName,
          },
        ]
      )
    }

    this.notify()
    return { payment: newPayment, invoice: updatedInv }
  }

  // --- Expenses Actions ---
  public addOneOffExpense(exp: Omit<OneOffExpense, "id">): OneOffExpense {
    const newExp: OneOffExpense = {
      ...exp,
      id: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
    }
    this.expenses = [newExp, ...this.expenses]
    this.notify()
    return newExp
  }

  public approveOneOffExpense(id: string) {
    this.expenses = this.expenses.map((e) => {
      if (e.id === id) {
        const approved = { ...e, status: "APPROVED" as const }
        
        let targetAcc = e.gl_account_id ? this.accounts.find(a => a.id === e.gl_account_id || a.code === e.gl_account_id) : null
        if (!targetAcc) {
          if (e.category === "Office Rent" || e.category === "Rent") {
            targetAcc = this.accounts.find((a) => a.code === "5100") || this.accounts[0]
          } else if (e.category === "Vehicle Cost" || e.category === "Fleet") {
            targetAcc = this.accounts.find((a) => a.code === "5400") || this.accounts[0]
          } else if (e.category === "Software & SaaS" || e.category === "Infrastructure" || e.category === "Utilities") {
            targetAcc = this.accounts.find((a) => a.code === "5200") || this.accounts[0]
          } else {
            targetAcc = this.accounts.find((a) => a.code === "5300") || this.accounts.find((a) => a.code === "5200") || this.accounts[0]
          }
        }

        const cashAcc = this.accounts.find((a) => a.code === "1000") || this.accounts[0]
        const taxAcc = this.accounts.find((a) => a.code === "2210") || this.accounts[0]
        
        const taxVal = e.tax_amount || 0
        const netExp = Math.max(0, e.amount - taxVal)

        const rawLines: Array<{ account_id: string; debit_amount: number; credit_amount: number; party_type?: any; party_id?: string; party_name?: string }> = [
          { account_id: targetAcc.id, debit_amount: netExp, credit_amount: 0 },
        ]

        if (taxVal > 0) {
          rawLines.push({ account_id: taxAcc.id, debit_amount: taxVal, credit_amount: 0 })
        }

        rawLines.push({ account_id: cashAcc.id, debit_amount: 0, credit_amount: e.amount })

        this.postJournalEntry(
          {
            entry_date: e.date,
            description: `Expense claim approval: ${e.merchant} (${e.category}${e.cost_center ? " - " + e.cost_center : ""})`,
            source_type: "Purchase Invoice",
            source_id: e.id,
            created_by: "Finance Auditor",
            currency: e.currency,
            exchange_rate: 1.0,
          },
          rawLines
        )
        return approved
      }
      return e
    })
    this.notify()
  }

  public rejectOneOffExpense(id: string) {
    this.expenses = this.expenses.map((e) => (e.id === id ? { ...e, status: "REJECTED" as const } : e))
    this.notify()
  }

  public addRecurringSchedule(sch: Omit<RecurringExpenseSchedule, "id">): RecurringExpenseSchedule {
    const newSch: RecurringExpenseSchedule = {
      ...sch,
      id: `SCH-${new Date().getFullYear()}-${String(this.recurringSchedules.length + 1).padStart(3, "0")}`,
    }
    this.recurringSchedules = [newSch, ...this.recurringSchedules]
    this.notify()
    return newSch
  }

  public toggleRecurringScheduleStatus(id: string) {
    this.recurringSchedules = this.recurringSchedules.map((s) =>
      s.id === id ? { ...s, status: s.status === "Active" ? "Paused" : "Active" } : s
    )
    this.notify()
  }

  public generateDueExpenses(): number {
    let count = 0
    this.recurringSchedules.forEach((sch) => {
      if (sch.status === "Active" && sch.auto_generate) {
        this.addOneOffExpense({
          merchant: `${sch.expense_type} (${sch.linked_resource_id || "Overhead"})`,
          category: sch.expense_type,
          date: sch.next_due_date,
          employee: "System Scheduler",
          amount: sch.amount,
          currency: sch.currency,
          cost_center: sch.cost_center || "CC-100 Corporate HQ",
          status: "PENDING",
        })
        count++
      }
    })
    this.notify()
    return count
  }

  // --- Payroll Actions ---
  public postPayrollAccrual(runId: string): { success: boolean; error?: string; entryId?: string } {
    const run = this.payrollRuns.find((r) => r.id === runId)
    if (!run) return { success: false, error: "Payroll run not found." }
    if (run.status !== "Draft") return { success: false, error: `Payroll run is already ${run.status}.` }

    const expenseAcc =
      this.accounts.find((a) => a.id === this.companySettings.payroll_expense_account_id || a.code === "5010") ||
      this.accounts.find((a) => a.code === "5000") ||
      this.accounts[0]

    const taxAcc =
      this.accounts.find((a) => a.id === this.companySettings.tax_payable_account_id || a.code === "2210") ||
      this.accounts.find((a) => a.code === "2200") ||
      this.accounts[0]

    const payableAcc =
      this.accounts.find((a) => a.id === this.companySettings.payroll_payable_account_id || a.code === "2100") ||
      this.accounts[0]

    // Construct raw lines
    // 1. Debit Salaries & Wages Expense for total gross
    const rawLines: Array<{
      account_id: string
      debit_amount: number
      credit_amount: number
      party_type?: "Customer" | "Supplier" | "Employee" | null
      party_id?: string | null
      party_name?: string | null
    }> = [
      {
        account_id: expenseAcc.id,
        debit_amount: run.total_gross,
        credit_amount: 0,
      },
    ]

    // 2. Credit Tax Payable for total deductions
    if (run.total_deductions > 0) {
      rawLines.push({
        account_id: taxAcc.id,
        debit_amount: 0,
        credit_amount: run.total_deductions,
        party_type: "Supplier",
        party_id: "TAX-AUTHORITY",
        party_name: "Revenue Customs Authority",
      })
    }

    // 3. Credit Accrued Payroll for EACH employee individually (party tracking rule)
    run.employees.forEach((emp) => {
      rawLines.push({
        account_id: payableAcc.id,
        debit_amount: 0,
        credit_amount: emp.net_pay,
        party_type: "Employee",
        party_id: emp.employee_id,
        party_name: emp.employee_name,
      })
    })

    const postRes = this.postJournalEntry(
      {
        entry_date: run.period_end,
        description: `Payroll Accrual for ${run.period_label} (Gross: ETB ${run.total_gross.toLocaleString()})`,
        source_type: "Payroll Accrual",
        source_id: run.id,
        created_by: "HR Payroll Admin",
        currency: "ETB",
        exchange_rate: 1.0,
      },
      rawLines
    )

    if (!postRes.success || !postRes.entry) {
      return { success: false, error: postRes.error || "Failed to post payroll accrual journal entry." }
    }

    // Update payroll run status
    this.payrollRuns = this.payrollRuns.map((r) =>
      r.id === runId
        ? {
            ...r,
            status: "Accrued",
            accrual_journal_entry_id: postRes.entry!.id,
          }
        : r
    )

    this.notify()
    return { success: true, entryId: postRes.entry.id }
  }

  public postPayrollPayment(runId: string): { success: boolean; error?: string; entryId?: string } {
    const run = this.payrollRuns.find((r) => r.id === runId)
    if (!run) return { success: false, error: "Payroll run not found." }
    if (run.status !== "Accrued") return { success: false, error: "Payroll run must be in 'Accrued' status before payment disbursement." }

    const payableAcc =
      this.accounts.find((a) => a.id === this.companySettings.payroll_payable_account_id || a.code === "2100") ||
      this.accounts[0]

    const cashAcc = this.accounts.find((a) => a.code === "1000") || this.accounts[0]

    // Construct raw lines:
    // Debit lines per employee against Accrued Payroll (2100)
    const rawLines: Array<{
      account_id: string
      debit_amount: number
      credit_amount: number
      party_type?: "Customer" | "Supplier" | "Employee" | null
      party_id?: string | null
      party_name?: string | null
    }> = []

    run.employees.forEach((emp) => {
      rawLines.push({
        account_id: payableAcc.id,
        debit_amount: emp.net_pay,
        credit_amount: 0,
        party_type: "Employee",
        party_id: emp.employee_id,
        party_name: emp.employee_name,
      })
    })

    // Credit Cash & Bank for total net pay
    rawLines.push({
      account_id: cashAcc.id,
      debit_amount: 0,
      credit_amount: run.total_net,
    })

    const postRes = this.postJournalEntry(
      {
        entry_date: new Date().toISOString().split("T")[0],
        description: `Payroll Payment Disbursement for ${run.period_label} (Net: ETB ${run.total_net.toLocaleString()})`,
        source_type: "Payroll Payment",
        source_id: run.id,
        created_by: "Finance Disburser",
        currency: "ETB",
        exchange_rate: 1.0,
      },
      rawLines
    )

    if (!postRes.success || !postRes.entry) {
      return { success: false, error: postRes.error || "Failed to post payroll payment journal entry." }
    }

    // Update payroll run status
    this.payrollRuns = this.payrollRuns.map((r) =>
      r.id === runId
        ? {
            ...r,
            status: "Paid",
            payment_journal_entry_id: postRes.entry!.id,
          }
        : r
    )

    this.notify()
    return { success: true, entryId: postRes.entry.id }
  }

  // --- Multi-Currency Revaluation Actions ---
  public createRevaluation(data: {
    currency: string
    target_account_id: string
    original_balance: number
    current_rate: number
    revaluation_date: string
  }): { success: boolean; error?: string; revaluation?: Revaluation } {
    // Check if unrealized exchange gain/loss account exists and is active
    const gainLossAccId = this.companySettings.unrealized_exchange_gain_loss_account_id
    const gainLossAcc = this.accounts.find((a) => a.id === gainLossAccId || a.code === "5995")
    if (!gainLossAcc) {
      return {
        success: false,
        error: "Unrealized Exchange Gain/Loss account is not defined in Company Settings or Chart of Accounts.",
      }
    }
    if (!gainLossAcc.is_active) {
      return {
        success: false,
        error: `Account "${gainLossAcc.code} - ${gainLossAcc.name}" is disabled. Revaluation cannot be initiated.`,
      }
    }

    const newBalanceInBase = Math.round(data.original_balance * data.current_rate * 100) / 100
    // Get old rate or base balance
    const oldRate = this.companySettings.exchange_rates[data.currency] || 55.0
    const oldBalanceInBase = Math.round(data.original_balance * oldRate * 100) / 100
    const unrealizedGainLoss = Math.round((newBalanceInBase - oldBalanceInBase) * 100) / 100

    let maxRevNum = 0
    const currentYear = new Date().getFullYear()
    for (const r of this.revaluations) {
      if (r.id) {
        const match = r.id.match(/\d+$/)
        if (match) {
          const val = parseInt(match[0], 10)
          if (!isNaN(val) && val > maxRevNum) maxRevNum = val
        }
      }
    }
    let nextRevNum = Math.max(maxRevNum + 1, this.revaluations.length + 1)
    let revId = `REV-${currentYear}-${String(nextRevNum).padStart(3, "0")}`
    while (this.revaluations.some((r) => r.id === revId)) {
      nextRevNum++
      revId = `REV-${currentYear}-${String(nextRevNum).padStart(3, "0")}`
    }

    const newRev: Revaluation = {
      id: revId,
      revaluation_date: data.revaluation_date,
      currency: data.currency,
      target_account_id: data.target_account_id,
      original_balance: data.original_balance,
      current_rate: data.current_rate,
      new_balance_in_base: newBalanceInBase,
      unrealized_gain_loss: unrealizedGainLoss,
      journal_entry_id: null,
      status: "Draft", // Always starts as Draft!
    }

    this.revaluations = [newRev, ...this.revaluations]
    this.notify()

    return { success: true, revaluation: newRev }
  }

  public postRevaluation(revaluationId: string): { success: boolean; error?: string; entryId?: string } {
    const rev = this.revaluations.find((r) => r.id === revaluationId)
    if (!rev) return { success: false, error: "Revaluation record not found." }
    if (rev.status !== "Draft") return { success: false, error: `Revaluation is already ${rev.status}.` }

    // Check gain/loss account
    const gainLossAccId = this.companySettings.unrealized_exchange_gain_loss_account_id
    const gainLossAcc = this.accounts.find((a) => a.id === gainLossAccId || a.code === "5995")
    if (!gainLossAcc || !gainLossAcc.is_active) {
      return {
        success: false,
        error: "Unrealized Exchange Gain/Loss account is missing or disabled in Chart of Accounts.",
      }
    }

    const targetAcc = this.accounts.find((a) => a.id === rev.target_account_id || a.code === rev.target_account_id)
    if (!targetAcc || !targetAcc.is_active) {
      return { success: false, error: "Target asset/liability account is missing or disabled." }
    }

    const absAmount = Math.abs(rev.unrealized_gain_loss)
    if (absAmount === 0) {
      return { success: false, error: "Revaluation gain/loss amount is zero. Nothing to post." }
    }

    let rawLines: Array<{ account_id: string; debit_amount: number; credit_amount: number }> = []

    if (rev.unrealized_gain_loss > 0) {
      // Unrealized Gain: Debit Target Account, Credit Gain/Loss Account
      rawLines = [
        { account_id: targetAcc.id, debit_amount: absAmount, credit_amount: 0 },
        { account_id: gainLossAcc.id, debit_amount: 0, credit_amount: absAmount },
      ]
    } else {
      // Unrealized Loss: Credit Target Account, Debit Gain/Loss Account
      rawLines = [
        { account_id: gainLossAcc.id, debit_amount: absAmount, credit_amount: 0 },
        { account_id: targetAcc.id, debit_amount: 0, credit_amount: absAmount },
      ]
    }

    const postRes = this.postJournalEntry(
      {
        entry_date: rev.revaluation_date,
        description: `Multi-Currency Exchange Revaluation for ${rev.currency} (${rev.original_balance} @ ${rev.current_rate} ETB/${rev.currency})`,
        source_type: "Exchange Revaluation",
        source_id: rev.id,
        created_by: "Treasury Auditor",
        currency: "ETB",
        exchange_rate: 1.0,
      },
      rawLines
    )

    if (!postRes.success || !postRes.entry) {
      return { success: false, error: postRes.error || "Failed to post exchange revaluation entry." }
    }

    // Update revaluation status
    this.revaluations = this.revaluations.map((r) =>
      r.id === revaluationId
        ? {
            ...r,
            status: "Posted",
            journal_entry_id: postRes.entry!.id,
          }
        : r
    )

    // Also update exchange rate in company settings
    this.updateExchangeRate(rev.currency, rev.current_rate)

    this.notify()
    return { success: true, entryId: postRes.entry.id }
  }

  public cancelRevaluation(revaluationId: string) {
    this.revaluations = this.revaluations.map((r) => (r.id === revaluationId ? { ...r, status: "Cancelled" } : r))
    this.notify()
  }

  // --- Vehicle Actions ---
  public addVehicle(v: Omit<Vehicle, "id">): Vehicle {
    let maxVehNum = 0
    for (const veh of this.vehicles) {
      if (veh.id) {
        const match = veh.id.match(/\d+$/)
        if (match) {
          const val = parseInt(match[0], 10)
          if (!isNaN(val) && val > maxVehNum) maxVehNum = val
        }
      }
    }
    let nextVehNum = Math.max(maxVehNum + 1, this.vehicles.length + 1)
    let vehId = `VEH-${String(nextVehNum).padStart(3, "0")}`
    while (this.vehicles.some((veh) => veh.id === vehId)) {
      nextVehNum++
      vehId = `VEH-${String(nextVehNum).padStart(3, "0")}`
    }

    const newV: Vehicle = {
      ...v,
      id: vehId,
    }
    this.vehicles = [newV, ...this.vehicles]
    this.notify()
    return newV
  }

  public addVehicleMaintenance(vehicleId: string, maintenance: VehicleMaintenance) {
    const veh = this.vehicles.find((v) => v.id === vehicleId)
    this.vehicles = this.vehicles.map((v) => {
      if (v.id === vehicleId) {
        return {
          ...v,
          maintenance_cost_history: [maintenance, ...v.maintenance_cost_history],
        }
      }
      return v
    })

    // Post GL entry for vehicle repair & fleet expense
    const fleetAcc = this.accounts.find((a) => a.code === "5400") || this.accounts[0]
    const cashAcc = this.accounts.find((a) => a.code === "1000") || this.accounts[0]

    this.postJournalEntry(
      {
        entry_date: maintenance.date,
        description: `Fleet Vehicle Repair: ${veh?.registration_number || vehicleId} - ${maintenance.description}`,
        source_type: "Manual Adjustment",
        source_id: vehicleId,
        created_by: "Fleet Auditor",
        currency: "ETB",
        exchange_rate: 1.0,
      },
      [
        { account_id: fleetAcc.id, debit_amount: maintenance.amount, credit_amount: 0 },
        { account_id: cashAcc.id, debit_amount: 0, credit_amount: maintenance.amount },
      ]
    )

    this.notify()
  }

  // --- Trial Balance Calculation ---
  public getTrialBalance(): {
    rows: Array<{
      account_id: string
      code: string
      name: string
      account_type: string
      debit_sum: number
      credit_sum: number
      net_balance: number
    }>
    totalDebits: number
    totalCredits: number
    isBalanced: boolean
  } {
    const accountMap = new Map<
      string,
      { code: string; name: string; account_type: string; debit_sum: number; credit_sum: number }
    >()

    // Initialize map with active accounts
    this.accounts.forEach((acc) => {
      accountMap.set(acc.id, {
        code: acc.code,
        name: acc.name,
        account_type: acc.account_type,
        debit_sum: 0,
        credit_sum: 0,
      })
    })

    // Sum lines
    this.lines.forEach((line) => {
      let acc = accountMap.get(line.account_id)
      if (!acc) {
        const matched = this.accounts.find((a) => a.code === line.account_id || a.id === line.account_id)
        if (matched) {
          acc = accountMap.get(matched.id)
        }
      }
      if (acc) {
        acc.debit_sum += line.debit_amount
        acc.credit_sum += line.credit_amount
      }
    })

    const rows = Array.from(accountMap.entries()).map(([id, val]) => ({
      account_id: id,
      code: val.code,
      name: val.name,
      account_type: val.account_type,
      debit_sum: Math.round(val.debit_sum * 100) / 100,
      credit_sum: Math.round(val.credit_sum * 100) / 100,
      net_balance: Math.round((val.debit_sum - val.credit_sum) * 100) / 100,
    }))

    const totalDebits = Math.round(rows.reduce((sum, r) => sum + r.debit_sum, 0) * 100) / 100
    const totalCredits = Math.round(rows.reduce((sum, r) => sum + r.credit_sum, 0) * 100) / 100
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01

    return { rows, totalDebits, totalCredits, isBalanced }
  }
}

export const financeStore = new FinanceStore()

export function useFinanceStore() {
  const [, setTick] = useState(0)

  useEffect(() => {
    return financeStore.subscribe(() => {
      setTick((t) => t + 1)
    })
  }, [])

  return financeStore
}
