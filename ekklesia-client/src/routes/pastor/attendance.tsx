import { createFileRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { FormModal } from "@/components/dashboard/form-modal"
import { FormInput, FormSelect, FormTextarea, FormFieldGroup } from "@/components/dashboard/form-input"
import { Button } from "@/components/ui/button"
import {
  ClipboardList,
  Plus,
  Search,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  Check,
  Clock,
  Filter,
  Download,
  ChevronDown,
  UserCheck,
  UserX
} from "lucide-react"

const mockAttendance = [
  { id: 1, service: "Culto Dominical", date: "2024-04-07", total: 285, adults: 180, youth: 65, children: 40, notes: "Domingo de Ramos" },
  { id: 2, service: "Estudio Biblico", date: "2024-04-03", total: 82, adults: 65, youth: 12, children: 5, notes: "" },
  { id: 3, service: "Culto Dominical", date: "2024-03-31", total: 320, adults: 200, youth: 75, children: 45, notes: "Semana Santa" },
  { id: 4, service: "Reunion de Jovenes", date: "2024-03-29", total: 45, adults: 5, youth: 40, children: 0, notes: "" },
  { id: 5, service: "Culto Dominical", date: "2024-03-24", total: 268, adults: 175, youth: 58, children: 35, notes: "" },
  { id: 6, service: "Estudio Biblico", date: "2024-03-20", total: 78, adults: 62, youth: 10, children: 6, notes: "" },
]

const serviceOptions = [
  { value: "dominical", label: "Culto Dominical" },
  { value: "estudio", label: "Estudio Biblico" },
  { value: "jovenes", label: "Reunion de Jovenes" },
  { value: "oracion", label: "Culto de Oracion" },
]

function PastorAsistencia() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState("2024-04")

  const [formData, setFormData] = useState({
    service: "",
    date: "",
    adults: "",
    youth: "",
    children: "",
    notes: ""
  })

  const filteredAttendance = mockAttendance.filter(record =>
    record.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.date.includes(searchQuery)
  )

  const totalThisMonth = filteredAttendance.reduce((a, r) => a + r.total, 0)
  const avgAttendance = Math.round(totalThisMonth / filteredAttendance.length)
  const trend = ((filteredAttendance[0]?.total - filteredAttendance[filteredAttendance.length - 1]?.total) / filteredAttendance[filteredAttendance.length - 1]?.total * 100).toFixed(1)

  const resetForm = () => {
    setFormData({ service: "", date: "", adults: "", youth: "", children: "", notes: "" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#0a1628]">
      <Sidebar role="pastor" />

      <div className="lg:ml-64 transition-all duration-300">
        <Header
          title="Control de Asistencia"
          userName="Juan Lopez"
          userRole="Pastor - Iglesia Central"
        />

        <main className="p-6">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: "Total del Mes", value: totalThisMonth.toLocaleString(), icon: Users, color: "blue" },
              { label: "Promedio", value: avgAttendance, icon: ClipboardList, color: "purple" },
              { label: "Registros", value: filteredAttendance.length, icon: Calendar, color: "cyan" },
              {
                label: "Tendencia",
                value: `${Number(trend) > 0 ? "+" : ""}${trend}%`,
                icon: Number(trend) >= 0 ? TrendingUp : TrendingDown,
                color: Number(trend) >= 0 ? "green" : "red"
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-${stat.color}-500/20`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-blue-300/60">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Entry Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            {["Adultos", "Jovenes", "Ninos"].map((category, index) => {
              const lastRecord = filteredAttendance[0]
              const value = category === "Adultos" ? lastRecord?.adults : category === "Jovenes" ? lastRecord?.youth : lastRecord?.children
              const total = lastRecord?.total || 1
              const percentage = Math.round((value || 0) / total * 100)

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + index * 0.05 }}
                  className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-blue-300/70">{category}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      index === 0 ? "bg-blue-500/20 text-blue-300" :
                      index === 1 ? "bg-purple-500/20 text-purple-300" :
                      "bg-amber-500/20 text-amber-300"
                    }`}>
                      {percentage}%
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white mb-2">{value || 0}</p>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                      className={`h-full rounded-full ${
                        index === 0 ? "bg-blue-500" :
                        index === 1 ? "bg-purple-500" :
                        "bg-amber-500"
                      }`}
                    />
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 mb-6"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/40" />
              <input
                type="text"
                placeholder="Buscar por servicio o fecha..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-blue-300/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>

              <Button variant="blueOutline" className="gap-2">
                <Download className="w-4 h-4" />
                Exportar
              </Button>

              <Button
                onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
                variant="blue" className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Registrar Asistencia
              </Button>
            </div>
          </motion.div>

          {/* Attendance Records */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            {filteredAttendance.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + index * 0.03 }}
                className="bg-gradient-to-r from-white/[0.08] to-white/[0.03] border border-white/10 rounded-xl p-5 hover:border-blue-500/30 transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Date Badge */}
                  <div className="flex-shrink-0 w-20 text-center">
                    <div className="bg-blue-500/20 rounded-xl p-3">
                      <p className="text-lg font-bold text-white">
                        {new Date(record.date).getDate()}
                      </p>
                      <p className="text-xs text-blue-300/60">
                        {new Date(record.date).toLocaleDateString("es", { month: "short" })}
                      </p>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-white">{record.service}</h3>
                      {record.notes && (
                        <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-300 rounded-full">
                          {record.notes}
                        </span>
                      )}
                    </div>

                    {/* Attendance Breakdown */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-300">{record.adults} adultos</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10">
                        <Users className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-300">{record.youth} jovenes</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10">
                        <Users className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-300">{record.children} ninos</span>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-3xl font-bold text-white">{record.total}</p>
                    <p className="text-xs text-blue-300/50">total</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filteredAttendance.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <ClipboardList className="w-16 h-16 text-blue-500/30 mb-4" />
              <p className="text-blue-300/60">No hay registros de asistencia</p>
            </motion.div>
          )}
        </main>
      </div>

      {/* Create Modal */}
      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={() => console.log("Create:", formData)}
        title="Registrar Asistencia"
        subtitle="Nuevo registro de asistencia"
        icon={<ClipboardList className="w-6 h-6" />}
        submitText="Guardar Registro"
        size="lg"
      >
        <div className="space-y-4">
          <FormFieldGroup>
            <FormSelect
              label="Tipo de Servicio"
              name="service"
              value={formData.service}
              onChange={(v) => setFormData({ ...formData, service: v })}
              options={serviceOptions}
              icon={Calendar}
              required
            />
            <FormInput
              label="Fecha"
              name="date"
              type="date"
              value={formData.date}
              onChange={(v) => setFormData({ ...formData, date: v })}
              required
            />
          </FormFieldGroup>

          <div className="grid grid-cols-3 gap-4">
            <FormInput
              label="Adultos"
              name="adults"
              type="number"
              placeholder="0"
              value={formData.adults}
              onChange={(v) => setFormData({ ...formData, adults: v })}
              required
            />
            <FormInput
              label="Jovenes"
              name="youth"
              type="number"
              placeholder="0"
              value={formData.youth}
              onChange={(v) => setFormData({ ...formData, youth: v })}
              required
            />
            <FormInput
              label="Ninos"
              name="children"
              type="number"
              placeholder="0"
              value={formData.children}
              onChange={(v) => setFormData({ ...formData, children: v })}
              required
            />
          </div>

          {/* Preview Total */}
          {(formData.adults || formData.youth || formData.children) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-300/70">Total Asistencia</span>
                <span className="text-2xl font-bold text-white">
                  {(parseInt(formData.adults) || 0) + (parseInt(formData.youth) || 0) + (parseInt(formData.children) || 0)}
                </span>
              </div>
            </motion.div>
          )}

          <FormTextarea
            label="Notas (opcional)"
            name="notes"
            placeholder="Ej: Evento especial, visitantes, etc."
            value={formData.notes}
            onChange={(v) => setFormData({ ...formData, notes: v })}
          />
        </div>
      </FormModal>
    </div>
  )
}

export const Route = createFileRoute('/pastor/attendance')({ component: PastorAsistencia })
