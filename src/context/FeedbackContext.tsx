import { createContext, useContext, useState, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, AlertTriangle, Info, X, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

// Toast structure
export interface FeedbackToast {
  id: string
  message: string
  description?: string
  type: "success" | "warning" | "info"
  duration?: number
}

// Confirmation state structure
export interface FeedbackConfirmation {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  isDestructive?: boolean
  onConfirm: () => void
  onCancel?: () => void
}

interface FeedbackContextType {
  showToast: (message: string, type?: FeedbackToast["type"], description?: string) => void
  confirm: (options: FeedbackConfirmation) => void
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined)

export function useFeedback() {
  const context = useContext(FeedbackContext)
  if (!context) {
    throw new Error("useFeedback must be used within a FeedbackProvider")
  }
  return context
}

interface FeedbackProviderProps {
  children: ReactNode
}

export function FeedbackProvider({ children }: FeedbackProviderProps) {
  const [toasts, setToasts] = useState<FeedbackToast[]>([])
  const [confirmation, setConfirmation] = useState<FeedbackConfirmation | null>(null)

  const showToast = (message: string, type: FeedbackToast["type"] = "success", description?: string) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: FeedbackToast = { id, message, type, description }
    setToasts((prev) => [...prev, newToast])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4500)
  }

  const confirm = (options: FeedbackConfirmation) => {
    setConfirmation(options)
  }

  const handleConfirm = () => {
    if (confirmation) {
      confirmation.onConfirm()
      setConfirmation(null)
    }
  }

  const handleCancel = () => {
    if (confirmation) {
      if (confirmation.onCancel) confirmation.onCancel()
      setConfirmation(null)
    }
  }

  return (
    <FeedbackContext.Provider value={{ showToast, confirm }}>
      {children}

      {/* 1. Sleek Toast Notifications Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === "success"
            const isWarning = toast.type === "warning"

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.75 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.1 } }}
                transition={{ type: "spring", damping: 20, stiffness: 500 }}
                className={cn(
                  "pointer-events-auto flex gap-4 p-5 rounded-3xl border border-zinc-200/80 bg-white text-zinc-900 shadow-2xl relative overflow-hidden transition-all w-[360px]",
                  isSuccess && "after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1.5 after:bg-green-600",
                  isWarning && "after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1.5 after:bg-black",
                  toast.type === "info" && "after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1.5 after:bg-zinc-950"
                )}
              >
                {/* Icon wrapper with subtle badge style */}
                <div className={cn(
                  "size-9 rounded-full flex items-center justify-center shrink-0 shadow-sm border",
                  isSuccess && "bg-green-50 border-green-200 text-green-700",
                  isWarning && "bg-zinc-100 border-zinc-200 text-zinc-900",
                  toast.type === "info" && "bg-zinc-100 border-zinc-200 text-zinc-900"
                )}>
                  {isSuccess && <CheckCircle2 className="size-4.5" />}
                  {isWarning && <AlertTriangle className="size-4.5" />}
                  {toast.type === "info" && <Info className="size-4.5" />}
                </div>

                <div className="flex-1 pr-4 min-w-0">
                  <h4 className="text-xs font-black text-zinc-900 tracking-tight leading-tight mb-1">
                    {toast.message}
                  </h4>
                  {toast.description && (
                    <p className="text-[11px] font-semibold text-zinc-500 leading-normal mt-1">
                      {toast.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                  className="absolute right-3.5 top-3.5 p-1 text-zinc-400 hover:text-zinc-900 rounded-lg transition-colors hover:bg-zinc-100"
                >
                  <X className="size-3.5" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* 2. Premium Design System Confirmation Modal */}
      <AnimatePresence>
        {confirmation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop Blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
              className="absolute inset-0 bg-black/35 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="w-full max-w-sm glass-nav bg-white/95 border border-white/80 rounded-3xl p-6 shadow-2xl relative z-10 overflow-hidden"
            >
              {/* Top Accent line or indicator */}
              <div className={cn(
                "absolute top-0 left-0 right-0 h-1",
                confirmation.isDestructive ? "bg-black" : "bg-green-600"
              )} />

              <div className="flex flex-col items-center text-center mt-2">
                {/* Visual Icon Badge */}
                <div className={cn(
                  "size-12 rounded-full flex items-center justify-center border shadow-inner mb-4",
                  confirmation.isDestructive 
                    ? "bg-zinc-100 border-zinc-200 text-zinc-900" 
                    : "bg-green-50 border-green-200 text-green-700"
                )}>
                  {confirmation.isDestructive ? (
                    <AlertTriangle className="size-5" />
                  ) : (
                    <HelpCircle className="size-5" />
                  )}
                </div>

                <h3 className="text-lg font-black text-black tracking-tight mb-2">
                  {confirmation.title}
                </h3>
                <p className="text-xs font-semibold text-gray-500 leading-relaxed px-1">
                  {confirmation.message}
                </p>
              </div>

              {/* Action row with minimalist sleek custom buttons */}
              <div className="flex items-center gap-2.5 mt-6 border-t border-black/5 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-2.5 rounded-full border border-black/10 text-xs font-extrabold text-gray-500 hover:text-black hover:bg-black/5 active:scale-[0.98] transition-all h-[38px] cursor-pointer"
                >
                  {confirmation.cancelLabel || "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={cn(
                    "flex-1 py-2.5 rounded-full text-xs font-extrabold text-white active:scale-[0.98] transition-all h-[38px] shadow-sm cursor-pointer",
                    confirmation.isDestructive 
                      ? "bg-black hover:bg-zinc-900" 
                      : "bg-green-600 hover:bg-green-700"
                  )}
                >
                  {confirmation.confirmLabel || "Confirm"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </FeedbackContext.Provider>
  )
}
