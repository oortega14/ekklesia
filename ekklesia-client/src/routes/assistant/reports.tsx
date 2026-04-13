import { createFileRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from "framer-motion"
import { useState, useMemo } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { ConfirmModal } from "@/components/dashboard/confirm-modal"
import { FormModal } from "@/components/dashboard/form-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ClipboardList,
  Plus,
  Search,
  Calendar,
  Users,
  DollarSign,
  Heart,
  Gift,
  Wallet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CalendarX,
  CalendarCheck,
  Send,
  FileText,
  Info
} from "lucide-react"

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date()
  return today.toISOString().split("T")[0]
}

// Check if date is valid (not in the future)
const isValidDate = (dateString: string) => {
  const selectedDate = new Date(dateString)
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return selectedDate <= today
}

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString + "T12:00:00")
  return date.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  })
}

// Check if date is today
const isToday = (dateString: string) => {
  return dateString === getTodayDate()
}

// Mock services for assistant
const generateMockServices = () => {
  const today = new Date()
  const services = []

  for (let i = 7; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    const dayOfWeek = date.getDay()

    if (dayOfWeek === 0) {
      services.push({
        id: `dom-${dateStr}`,
        type: "Culto Dominical",
        date: dateStr,
        time: "10:00 AM",
        hasAttendanceReport: i > 3,
        hasTreasuryReport: i > 3,
        attendance: i > 3 ? { total: Math.floor(Math.random() * 100) + 150, adults: 120, youth: 50, children: 30 } : null,
        treasury: i > 3 ? { tithes: Math.floor(Math.random() * 5000) + 3000, offerings: Math.floor(Math.random() * 2000) + 1000, donations: 0 } : null
      })
    }

    if (dayOfWeek === 3) {
      services.push({
        id: `est-${dateStr}`,
        type: "Estudio Biblico",
        date: dateStr,
        time: "7:00 PM",
        hasAttendanceReport: i > 4,
        hasTreasuryReport: i > 4,
        attendance: i > 4 ? { total: Math.floor(Math.random() * 30) + 40, adults: 35, youth: 10, children: 5 } : null,
        treasury: i > 4 ? { tithes: Math.floor(Math.random() * 800) + 200, offerings: Math.floor(Math.random() * 400) + 100, donations: 0 } : null
      })
    }
  }

  return services.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

const mockServices = generateMockServices()

type ReportType = "attendance" | "treasury"

interface Service {
  id: string
  type: string
  date: string
  time: string
  hasAttendanceReport: boolean
  hasTreasuryReport: boolean
  attendance: { total: number; adults: number; youth: number; children: number } | null
  treasury: { tithes: number; offerings: number; donations: number } | null
}

function AssistantReports() {
  const [reportType, setReportType] = useState<ReportType>("attendance")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [dateError, setDateError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Form state for attendance
  const [attendanceForm, setAttendanceForm] = useState({
    adults: "",
    youth: "",
    children: "",
    notes: ""
  })

  // Form state for treasury
  const [treasuryForm, setTreasuryForm] = useState({
    tithes: "",
    offerings: "",
    donations: "",
    notes: ""
  })

  const today = getTodayDate()

  // Filter only pending services
  const pendingServices = useMemo(() => {
    return mockServices.filter(service => {
      return reportType === "attendance" ? !service.hasAttendanceReport : !service.hasTreasuryReport
    })
  }, [reportType])

  // Stats
  const stats = useMemo(() => {
    const pendingAttendance = mockServices.filter(s => !s.hasAttendanceReport).length
    const pendingTreasury = mockServices.filter(s => !s.hasTreasuryReport).length
    const completedThisWeek = mockServices.filter(s => s.hasAttendanceReport || s.hasTreasuryReport).length

    return {
      pendingAttendance,
      pendingTreasury,
      completedThisWeek,
      totalPending: pendingAttendance + pendingTreasury
    }
  }, [])

  const handleOpenReport = (service: Service, type: ReportType) => {
    if (!isValidDate(service.date)) {
      setDateError("No puedes crear reportes para fechas futuras")
      setTimeout(() => setDateError(""), 5000)
      return
    }

    setSelectedService(service)
    setReportType(type)
    setDateError("")
    setAttendanceForm({ adults: "", youth: "", children: "", notes: "" })
    setTreasuryForm({ tithes: "", offerings: "", donations: "", notes: "" })
    setIsCreateModalOpen(true)
  }

  const handleSubmitReport = () => {
    setIsCreateModalOpen(false)
    setSuccessMessage(`Reporte de ${reportType === "attendance" ? "asistencia" : "tesoreria"} enviado exitosamente`)
    setTimeout(() => setSuccessMessage(""), 5000)
    setSelectedService(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount)
  }

  const getStatusBadge = (service: Service) => {
    const hasReport = reportType === "attendance" ? service.hasAttendanceReport : service.hasTreasuryReport

    if (hasReport) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Enviado
        </span>
      )
    }

    if (isToday(service.date)) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 flex items-center gap-1 animate-pulse">
          <Clock className="w-3 h-3" />
          Hoy
        </span>
      )
    }

    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        Pendiente
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#0a1628]">
      <Sidebar role="assistant" />

      <div className="lg:ml-64 transition-all duration-300">
        <Header
          title="Enviar Reportes"
          userName="Maria Lopez"
          userRole="Asistente - Iglesia Central"
        />

        <main className="p-6">
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 bg-gradient-to-r from-blue-600/20 to-blue-500/10 border border-blue-500/20 rounded-2xl"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Bienvenido al Panel de Reportes</h2>
                <p className="text-blue-300/70 flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4" />
                  Fecha de hoy: {formatDate(today)}
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-xl">
                <Info className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-300">Solo puedes reportar fechas pasadas o de hoy</span>
              </div>
            </div>
          </motion.div>

          {/* Success Message */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-400"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Date Error Message */}
          <AnimatePresence>
            {dateError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400"
              >
                <CalendarX className="w-5 h-5" />
                <span>{dateError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
          >
            {[
              { label: "Asistencia Pendiente", value: stats.pendingAttendance, icon: Users, color: "amber" },
              { label: "Tesoreria Pendiente", value: stats.pendingTreasury, icon: Wallet, color: "rose" },
              { label: "Completados esta semana", value: stats.completedThisWeek, icon: CheckCircle2, color: "emerald" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl bg-gradient-to-br from-${stat.color}-500/10 to-${stat.color}-600/5 border border-${stat.color}-500/20`}
              >
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                </div>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-blue-300/60">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Report Type Selector */}
          <div className="mb-6">
            <div className="inline-flex bg-white/5 p-1 rounded-xl">
              {[
                { id: "attendance" as const, label: "Reporte de Asistencia", icon: Users },
                { id: "treasury" as const, label: "Reporte de Tesoreria", icon: Wallet },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setReportType(tab.id)}
                  className={`px-5 py-3 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                    reportType === tab.id
                      ? "bg-blue-500/30 text-white shadow-lg"
                      : "text-blue-300/60 hover:text-white hover:bg-white/5"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Pending Services */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Servicios Pendientes de Reporte
            </h3>

            {pendingServices.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 bg-white/5 rounded-2xl border border-white/10"
              >
                <CheckCircle2 className="w-16 h-16 text-emerald-400/50 mx-auto mb-4" />
                <p className="text-xl font-semibold text-white mb-2">Todo al dia</p>
                <p className="text-blue-300/60">
                  No tienes reportes de {reportType === "attendance" ? "asistencia" : "tesoreria"} pendientes
                </p>
              </motion.div>
            ) : (
              <div className="grid gap-4">
                {pendingServices.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative overflow-hidden bg-gradient-to-r from-white/5 to-white/[0.02] border rounded-2xl p-5 transition-all hover:border-blue-500/30 ${
                      isToday(service.date) ? "border-blue-500/40" : "border-white/10"
                    }`}
                  >
                    {isToday(service.date) && (
                      <div className="absolute top-0 right-0 px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-bl-xl">
                        HOY
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                          reportType === "attendance"
                            ? "bg-gradient-to-br from-blue-500/30 to-blue-600/20"
                            : "bg-gradient-to-br from-emerald-500/30 to-emerald-600/20"
                        }`}>
                          {reportType === "attendance" ? (
                            <Users className="w-7 h-7 text-blue-400" />
                          ) : (
                            <Wallet className="w-7 h-7 text-emerald-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">{service.type}</h4>
                          <div className="flex items-center gap-3 text-sm text-blue-300/60">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(service.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {service.time}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusBadge(service)}

                        <Button
                          onClick={() => handleOpenReport(service, reportType)}
                          className={`gap-2 ${
                            reportType === "attendance"
                              ? "bg-blue-600 hover:bg-blue-500"
                              : "bg-emerald-600 hover:bg-emerald-500"
                          }`}
                          disabled={!isValidDate(service.date)}
                        >
                          <Send className="w-4 h-4" />
                          Enviar Reporte
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-5 bg-white/5 border border-white/10 rounded-2xl"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Instrucciones para reportes</h4>
                <ul className="text-sm text-blue-300/70 space-y-1">
                  <li>• Los reportes deben enviarse el mismo dia del servicio o dias posteriores</li>
                  <li>• No es posible crear reportes para fechas futuras</li>
                  <li>• Asegurate de contar correctamente la asistencia por categoria</li>
                  <li>• Los montos de tesoreria deben coincidir con el conteo fisico</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </main>
      </div>

      {/* Create Report Modal */}
      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          setSelectedService(null)
        }}
        onSubmit={handleSubmitReport}
        title={`Reporte de ${reportType === "attendance" ? "Asistencia" : "Tesoreria"}`}
        subtitle={selectedService ? `${selectedService.type} - ${formatDate(selectedService.date)}` : ""}
        submitText="Enviar Reporte"
      >
        {reportType === "attendance" ? (
          <div className="space-y-4">
            <p className="text-sm text-blue-300/70 mb-4">
              Ingresa el conteo de asistencia por categoria:
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-blue-300/70 mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Adultos
                </label>
                <Input
                  type="number"
                  min="0"
                  value={attendanceForm.adults}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, adults: e.target.value })}
                  className="bg-white/5 border-white/10 text-white text-center text-lg"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm text-blue-300/70 mb-1">Jovenes</label>
                <Input
                  type="number"
                  min="0"
                  value={attendanceForm.youth}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, youth: e.target.value })}
                  className="bg-white/5 border-white/10 text-white text-center text-lg"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm text-blue-300/70 mb-1">Ninos</label>
                <Input
                  type="number"
                  min="0"
                  value={attendanceForm.children}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, children: e.target.value })}
                  className="bg-white/5 border-white/10 text-white text-center text-lg"
                  placeholder="0"
                />
              </div>
            </div>

            <motion.div
              className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 0.3 }}
              key={`${attendanceForm.adults}-${attendanceForm.youth}-${attendanceForm.children}`}
            >
              <p className="text-center">
                <span className="text-blue-300/70 text-sm">Total de asistencia:</span>
                <span className="block text-3xl font-bold text-white mt-1">
                  {(parseInt(attendanceForm.adults || "0") + parseInt(attendanceForm.youth || "0") + parseInt(attendanceForm.children || "0")).toLocaleString()}
                </span>
                <span className="text-blue-300/50 text-sm">personas</span>
              </p>
            </motion.div>

            <div>
              <label className="block text-sm text-blue-300/70 mb-1">Notas (opcional)</label>
              <textarea
                value={attendanceForm.notes}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, notes: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-blue-300/40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                rows={2}
                placeholder="Observaciones del servicio..."
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-blue-300/70 mb-4">
              Ingresa los montos recaudados:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-blue-300/70 mb-1 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Diezmos
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400">$</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={treasuryForm.tithes}
                    onChange={(e) => setTreasuryForm({ ...treasuryForm, tithes: e.target.value })}
                    className="bg-white/5 border-white/10 text-white pl-8"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-blue-300/70 mb-1 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-blue-400" />
                  Ofrendas
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">$</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={treasuryForm.offerings}
                    onChange={(e) => setTreasuryForm({ ...treasuryForm, offerings: e.target.value })}
                    className="bg-white/5 border-white/10 text-white pl-8"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-blue-300/70 mb-1 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-purple-400" />
                  Donaciones Especiales
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400">$</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={treasuryForm.donations}
                    onChange={(e) => setTreasuryForm({ ...treasuryForm, donations: e.target.value })}
                    className="bg-white/5 border-white/10 text-white pl-8"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <motion.div
              className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 0.3 }}
              key={`${treasuryForm.tithes}-${treasuryForm.offerings}-${treasuryForm.donations}`}
            >
              <p className="text-center">
                <span className="text-emerald-300/70 text-sm">Total recaudado:</span>
                <span className="block text-3xl font-bold text-emerald-400 mt-1">
                  {formatCurrency(
                    parseFloat(treasuryForm.tithes || "0") +
                    parseFloat(treasuryForm.offerings || "0") +
                    parseFloat(treasuryForm.donations || "0")
                  )}
                </span>
              </p>
            </motion.div>

            <div>
              <label className="block text-sm text-blue-300/70 mb-1">Notas (opcional)</label>
              <textarea
                value={treasuryForm.notes}
                onChange={(e) => setTreasuryForm({ ...treasuryForm, notes: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-blue-300/40 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                rows={2}
                placeholder="Observaciones adicionales..."
              />
            </div>
          </div>
        )}
      </FormModal>
    </div>
  )
}

export const Route = createFileRoute('/assistant/reports')({
  component: AssistantReports
})
