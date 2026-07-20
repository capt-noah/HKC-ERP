import { Link } from "react-router-dom"
import { Search, Bell, Settings, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  path: string
  active?: boolean
}

interface SharedNavProps {
  logo: string
  logoIcon?: string
  navItems: NavItem[]
  activeLabel: string
  variant?: "light" | "dark"
}

export function SharedNav({ logo, navItems, activeLabel, variant = "light" }: SharedNavProps) {
  const isDark = variant === "dark"

  return (
    <nav className={cn(
      "flex items-center justify-between px-6 py-3 rounded-2xl mx-4 mt-4 mb-0",
      isDark ? "bg-zinc-900 text-white" : "bg-white border border-border"
    )}>
      <div className="flex items-center gap-8">
        <span className={cn("font-bold text-lg", isDark ? "text-white" : "text-foreground")}>
          {logo}
        </span>
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = item.label === activeLabel
            return (
              <Link
                key={item.label}
                to={item.path}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  isActive
                    ? "bg-green-700 text-white"
                    : isDark
                      ? "text-zinc-400 hover:text-white"
                      : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className={cn("p-2 rounded-full hover:bg-accent", isDark && "hover:bg-zinc-800")}>
          <Search className="size-4" />
        </button>
        <button className={cn("p-2 rounded-full hover:bg-accent relative", isDark && "hover:bg-zinc-800")}>
          <Bell className="size-4" />
        </button>
        <button className={cn("p-2 rounded-full hover:bg-accent", isDark && "hover:bg-zinc-800")}>
          <Settings className="size-4" />
        </button>
        <div className="size-8 rounded-full bg-green-100 overflow-hidden flex items-center justify-center text-green-700">
          <User className="size-4" />
        </div>
      </div>
    </nav>
  )
}

export const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
}
