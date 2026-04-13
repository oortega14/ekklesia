import { createFileRoute } from '@tanstack/react-router'
import { motion } from "framer-motion"
import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { ChartCard } from "@/components/dashboard/chart-card"
import { Button } from "@/components/ui/button"
import { useAuthStore, ROLE_LABELS } from "@/lib/auth/store"
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Wallet,
  Church,
  BarChart3,
  PieChart,
  FileText,
  Filter
} from "lucide-react"

const attendanceData = [
  { name: "Ene", asistencia: 2400, meta: 2600 },
  { name: "Feb", asistencia: 2210, meta: 2600 },
  { name: "Mar", asistencia: 2890, meta: 2600 },
  { name: "Abr", asistencia: 2000, meta: 2600 },
  { name: "May", asistencia: 2781, meta: 2600 },
  { name: "Jun", asistencia: 3100, meta: 2600 },
  { name: "Jul", asistencia: 2900, meta: 2600 },
  { name: "Ago", asistencia: 3200, meta: 2800 },
  { name: "Sep", asistencia: 3400, meta: 2800 },
  { name: "Oct", asistencia: 3100, meta: 2800 },
  { name: "Nov", asistencia: 3500, meta: 2800 },
  { name: "Dic", asistencia: 3800, meta: 3000 },
]

const incomeData = [
  { name: "Diezmos", value: 85000 },
  { name: "Ofrendas", value: 42000 },
  { name: "Donaciones", value: 28000 },
  { name: "Eventos", value: 15000 },
]

const churchPerformance = [
  { name: "Central", asistencia: 320, ingresos: 45000 },
  { name: "Norte", asistencia: 185, ingresos: 28000 },
  { name: "Sur", asistencia: 210, ingresos: 32000 },
  { name: "Esperanza", asistencia: 145, ingresos: 18000 },
  { name: "Nueva Vida", asistencia: 95, ingresos: 12000 },
  { name: "Gracia", asistencia: 280, ingresos: 38000 },
]

const monthlyTrends = [
  { name: "Sem 1", nuevos: 12, activos: 280 },
  { name: "Sem 2", nuevos: 8, activos: 288 },
  { name: "Sem 3", nuevos: 15, activos: 303 },
  { name: "Sem 4", nuevos: 10, activos: 313 },
]

function SuperAdminReportes() {
  const { user } = useAuthStore()
  const [dateRange, setDateRange] = useState("month")

  const kpis = [
    { label: "Crecimiento Asistencia", value: "+18%", trend: "up", icon: Users, description: "vs mes anterior" },
    { label: "Ingresos Totales", value: "$170,000", trend: "up", icon: Wallet, description: "+12% este mes" },
    { label: "Nuevos Miembros", value: "45", trend: "up", icon: TrendingUp, description: "Este mes" },
    { label: "Iglesias Activas", value: "6", trend: "neutral", icon: Church, description: "De 6 registradas" },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="superadmin" />

      <div className="lg:ml-64 transition-all duration-300">
        <Header
          title="Reportes y Estadisticas"
          userName={user?.full_name ?? ''}
          userRole={ROLE_LABELS[user?.role ?? ''] ?? ''}
        />

        <main className="p-6 bg-white">
          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between gap-4 mb-8"
          >
            {/* Date Range Selector */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-300">
              {[
                { value: "week", label: "Semana" },
                { value: "month", label: "Mes" },
                { value: "quarter", label: "Trimestre" },
                { value: "year", label: "Ano" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDateRange(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateRange === option.value
                      ? "bg-blue-100 text-blue-700"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Button variant="blueOutline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
              <Button variant="blueOutline" className="gap-2">
                <Calendar className="w-4 h-4" />
                Personalizar
              </Button>
              <Button variant="blue" className="gap-2">
                <Download className="w-4 h-4" />
                Exportar PDF
              </Button>
            </div>
          </motion.div>

          {/* KPIs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {kpis.map((kpi, index) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="bg-white border border-slate-200 shadow-sm rounded-xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${
                    kpi.trend === "up" ? "bg-emerald-100" : kpi.trend === "down" ? "bg-red-100" : "bg-blue-100"
                  }`}>
                    <kpi.icon className={`w-5 h-5 ${
                      kpi.trend === "up" ? "text-emerald-700" : kpi.trend === "down" ? "text-red-700" : "text-blue-700"
                    }`} />
                  </div>
                  {kpi.trend !== "neutral" && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                      kpi.trend === "up" ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {kpi.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-1">{kpi.value}</p>
                <p className="text-sm text-slate-600">{kpi.label}</p>
                <p className="text-xs text-slate-500 mt-1">{kpi.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartCard
              title="Asistencia vs Meta"
              subtitle="Tendencia anual de asistencia"
              type="area"
              data={attendanceData}
              dataKey="asistencia"
              delay={0.2}
            />
            <ChartCard
              title="Distribucion de Ingresos"
              subtitle="Por tipo de contribucion"
              type="pie"
              data={incomeData}
              dataKey="value"
              delay={0.3}
            />
          </div>

          {/* Secondary Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Rendimiento por Iglesia</h3>
                  <p className="text-sm text-slate-500">Comparativa de asistencia e ingresos</p>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-100">
                  <BarChart3 className="w-4 h-4 text-blue-700" />
                </div>
              </div>
              <div className="space-y-4">
                {churchPerformance.map((church, index) => (
                  <motion.div
                    key={church.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-24 text-sm font-medium text-slate-900">{church.name}</div>
                    <div className="flex-1">
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(church.asistencia / 350) * 100}%` }}
                          transition={{ delay: 0.6 + index * 0.05, duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                        />
                      </div>
                    </div>
                    <div className="w-20 text-right text-sm text-slate-500">{church.asistencia}</div>
                    <div className="w-24 text-right text-sm text-emerald-400">${(church.ingresos / 1000).toFixed(0)}k</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Crecimiento Semanal</h3>
                  <p className="text-sm text-slate-500">Nuevos miembros vs activos</p>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-100">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {monthlyTrends.map((week, index) => (
                  <motion.div
                    key={week.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="relative h-32 bg-slate-100 rounded-xl mb-3 flex items-end justify-center p-2">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(week.activos / 320) * 100}%` }}
                        transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                        className="w-full bg-gradient-to-t from-blue-600/50 to-blue-400/30 rounded-lg relative"
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-slate-800">
                          {week.activos}
                        </div>
                      </motion.div>
                    </div>
                    <p className="text-xs text-slate-500">{week.name}</p>
                    <p className="text-xs text-emerald-400">+{week.nuevos}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quick Reports */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Reportes Rapidos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Reporte de Asistencia", description: "Detalle por iglesia y servicio", icon: Users },
                { title: "Reporte Financiero", description: "Ingresos y gastos detallados", icon: Wallet },
                { title: "Reporte de Crecimiento", description: "Nuevos miembros y retenciones", icon: TrendingUp },
                { title: "Reporte General", description: "Resumen ejecutivo mensual", icon: FileText },
              ].map((report, index) => (
                <motion.button
                  key={report.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                      <report.icon className="w-5 h-5 text-blue-700" />
                    </div>
                    <Download className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                  </div>
                  <h4 className="text-sm font-medium text-slate-900">{report.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{report.description}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/superadmin/reports')({
  component: SuperAdminReportes
})
