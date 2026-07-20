import { motion } from "framer-motion"
import { GlassCard } from "@/components/GlassCard"
import { FloatingNav } from "@/components/FloatingNav"
import { SubPageNav } from "@/components/SubPageNav"
import { navSections, getSectionChildren } from "@/lib/nav-config"
import { Plus } from "lucide-react"

const fade = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

interface PlaceholderPageProps {
  title: string
  subtitle: string
  sectionPath: string
  variant?: "light" | "dark"
}

export function PlaceholderPage({ title, subtitle, sectionPath, variant = "light" }: PlaceholderPageProps) {
  const subPages = getSectionChildren(sectionPath)

  return (
    <div className="min-h-screen page-gradient">
      <FloatingNav brand="HKC Trading ERP" sections={navSections} variant={variant} />

      <motion.div variants={fade} initial="hidden" animate="visible" className="max-w-[98%] mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight">{title}</h1>
            <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <SubPageNav items={subPages} variant={variant} />
            <button className="flex items-center gap-2 bg-[#242427] text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-[#323236] shadow-lg shadow-black/10">
              <Plus className="size-4" />
              New
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5 mb-5">
          {[1, 2, 3].map((i, idx) => (
            <GlassCard key={i} transition={{ delay: 0.05 * idx, duration: 0.4, ease: "easeOut" }}>
              <p className="text-sm text-gray-500 font-medium mb-3">Metric {i}</p>
              <p className="text-4xl font-black text-black mb-2">—</p>
              <p className="text-sm text-gray-400">Coming soon</p>
            </GlassCard>
          ))}
        </div>

        <GlassCard transition={{ delay: 0.18, duration: 0.4, ease: "easeOut" }}>
          <h3 className="text-lg font-bold text-black mb-4">Content Area</h3>
          <div className="rounded-2xl border-2 border-dashed border-black/10 h-64 flex items-center justify-center">
            <span className="text-sm text-gray-300">This page is under construction</span>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
