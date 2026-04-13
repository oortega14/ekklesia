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
  Edit2,
  Trash2,
  MoreHorizontal,
  Filter,
  Download,
  CalendarX,
  CalendarCheck,
  TrendingUp,
  Eye
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
  today.setHours(23, 59, 59, 999) // End of today
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

// Mock data for services (based on date)
const generateMockServices = () => {
  const today = new Date()
  const services = []
  
  // Past services
  for (let i = 7; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    const dayOfWeek = date.getDay()
    
    if (dayOfWeek === 0) { // Sunday
      services.push({
        id: `dom-${dateStr}`,
        type: "Culto Dominical",
        date: dateStr,
        time: "10:00 AM",
        hasAttendanceReport: i > 2,
        hasTreasuryReport: i > 2,
        attendance: i > 2 ? { total: Math.floor(Math.random() * 100) + 150, adults: 120, youth: 50, children: 30 } : null,
        treasury: i > 2 ? { tithes: Math.floor(Math.random() * 5000) + 3000, offerings: Math.floor(Math.random() * 2000) + 1000, donations: 0 } : null
      })
      services.push({
        id: `vesp-${dateStr}`,
        type: "Culto Vespertino",
        date: dateStr,
        time: "6:00 PM",
        hasAttendanceReport: i > 3,
        hasTreasuryReport: i > 3,
        attendance: i > 3 ? { total: Math.floor(Math.random() * 50) + 60, adults: 50, youth: 20, children: 10 } : null,
        treasury: i > 3 ? { tithes: Math.floor(Math.random() * 1500) + 500, offerings: Math.floor(Math.random() * 800) + 200, donations: 0 } : null
      })
    }
    
    if (dayOfWeek === 3) { // Wednesday
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

const serviceTypeOptions = [
  { value: "dominical", label: "Culto Dominical" },
  { value: "vespertino", label: "Culto Vespertino" },
  { value: "estudio", label: "Estudio Biblico" },
  { value: "jovenes", label: "Reunion de Jovenes" },
  { value: "oracion", label: "Culto de Oracion" },
  { value: "especial", label: "Evento Especial" },
]

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

function PastorReports() {
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending")
  const [reportType, setReportType] = useState<ReportType>("attendance")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [dateError, setDateError] = useState("")
  
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

  // Filter services
  const filteredServices = useMemo(() => {
    return mockServices.filter(service => {
      const matchesSearch = service.type.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDate = !dateFilter || service.date === dateFilter
      
      if (activeTab === "pending") {
        return matchesSearch && matchesDate && 
          (reportType === "attendance" ? !service.hasAttendanceReport : !service.hasTreasuryReport)
      } else {
        return matchesSearch && matchesDate && 
          (reportType === "attendance" ? service.hasAttendanceReport : service.hasTreasuryReport)
      }
    })
  }, [searchQuery, dateFilter, activeTab, reportType])

  // Stats
  const stats = useMemo(() => {
    const pendingAttendance = mockServices.filter(s => !s.hasAttendanceReport).length
    const pendingTreasury = mockServices.filter(s => !s.hasTreasuryReport).length
    const completedAttendance = mockServices.filter(s => s.hasAttendanceReport).length
    const completedTreasury = mockServices.filter(s => s.hasTreasuryReport).length
    
    const totalAttendance = mockServices
      .filter(s => s.attendance)
      .reduce((sum, s) => sum + (s.attendance?.total || 0), 0)
    
    const totalTithes = mockServices
      .filter(s => s.treasury)
      .reduce((sum, s) => sum + (s.treasury?.tithes || 0), 0)
    
    const totalOfferings = mockServices
      .filter(s => s.treasury)
      .reduce((sum, s) => sum + (s.treasury?.offerings || 0), 0)
    
    return {
      pendingAttendance,
      pendingTreasury,
      completedAttendance,
      completedTreasury,
      totalAttendance,
      totalTithes,
      totalOfferings,
      totalIncome: totalTithes + totalOfferings
    }
  }, [])

  const handleOpenReport = (service: Service, type: ReportType) => {
    if (!isValidDate(service.date)) {
      setDateError("No puedes crear reportes para fechas futuras")
      return
    }
    
    setSelectedService(service)
    setReportType(type)
    setDateError("")
    
    if (type === "attendance" && service.attendance) {
      setAttendanceForm({
        adults: service.attendance.adults.toString(),
        youth: service.attendance.youth.toString(),
        children: service.attendance.children.toString(),
        notes: ""
      })
    } else {
      setAttendanceForm({ adults: "", youth: "", children: "", notes: "" })
    }
    
    if (type === "treasury" && service.treasury) {
      setTreasuryForm({
        tithes: service.treasury.tithes.toString(),
        offerings: service.treasury.offerings.toString(),
        donations: service.treasury.donations.toString(),
        notes: ""
      })
    } else {
      setTreasuryForm({ tithes: "", offerings: "", donations: "", notes: "" })
    }
    
    setIsCreateModalOpen(true)
  }

  const handleViewReport = (service: Service) => {
    setSelectedService(service)
    setIsViewModalOpen(true)
    setActiveMenu(null)
  }

  const handleDeleteReport = (service: Service) => {
    setSelectedService(service)
    setIsDeleteModalOpen(true)
    setActiveMenu(null)
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
          Completado
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
      <Sidebar role="pastor" />
      
      <div className="lg:ml-64 transition-all duration-300">
        <Header 
          title="Reportes de Servicios"
          userName="Pastor Carlos"
          userRole="Pastor - Iglesia Central"
        />
        
        <main className="p-6">
          {/* Date Warning Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3"
          >
            <CalendarCheck className="w-5 h-5 text-blue-400" />
            <div className="flex-1">
              <p className="text-sm text-blue-300">
                <span className="font-semibold">Fecha de hoy:</span> {formatDate(today)}
              </p>
              <p className="text-xs text-blue-400/70">Solo puedes crear reportes para hoy o fechas anteriores</p>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: "Asistencia Pendiente", value: stats.pendingAttendance, icon: Clock, color: "amber" },
              { label: "Tesoreria Pendiente", value: stats.pendingTreasury, icon: Wallet, color: "rose" },
              { label: "Total Asistencia", value: stats.totalAttendance.toLocaleString(), icon: Users, color: "blue" },
              { label: "Ingresos Totales", value: formatCurrency(stats.totalIncome), icon: TrendingUp, color: "emerald" },
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
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-blue-300/60">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Tabs and Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            {/* Tab Buttons */}
            <div className="flex gap-2">
              <div className="flex bg-white/5 p-1 rounded-xl">
                {[
                  { id: "pending" as const, label: "Pendientes", icon: Clock },
                  { id: "completed" as const, label: "Completados", icon: CheckCircle2 },
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                      activeTab === tab.id
                        ? "bg-blue-500/20 text-white"
                        : "text-blue-300/60 hover:text-white"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </motion.button>
                ))}
              </div>
              
              <div className="flex bg-white/5 p-1 rounded-xl">
                {[
                  { id: "attendance" as const, label: "Asistencia", icon: Users },
                  { id: "treasury" as const, label: "Tesoreria", icon: Wallet },
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setReportType(tab.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                      reportType === tab.id
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "text-blue-300/60 hover:text-white"
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

            {/* Filters */}
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50" />
                <Input
                  placeholder="Buscar servicio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-blue-300/40 w-48"
                />
              </div>
              <Input
                type="date"
                value={dateFilter}
                max={today}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-white/5 border-white/10 text-white w-44"
              />
              {dateFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDateFilter("")}
                  className="text-blue-300/60 hover:text-white"
                >
                  Limpiar
                </Button>
              )}
            </div>
          </div>

          {/* Date Error Message */}
          <AnimatePresence>
            {dateError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400"
              >
                <CalendarX className="w-5 h-5" />
                <span className="text-sm">{dateError}</span>
                <button
                  onClick={() => setDateError("")}
                  className="ml-auto hover:text-white"
                >
                  <span className="sr-only">Cerrar</span>
                  &times;
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Services List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {filteredServices.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 bg-white/5 rounded-2xl border border-white/10"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-400/50 mx-auto mb-3" />
                <p className="text-blue-300/70">
                  {activeTab === "pending" 
                    ? "No hay reportes pendientes" 
                    : "No hay reportes completados"
                  }
                </p>
              </motion.div>
            ) : (
              filteredServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Service Info */}
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        reportType === "attendance" 
                          ? "bg-blue-500/20" 
                          : "bg-emerald-500/20"
                      }`}>
                        {reportType === "attendance" ? (
                          <Users className="w-6 h-6 text-blue-400" />
                        ) : (
                          <Wallet className="w-6 h-6 text-emerald-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{service.type}</h3>
                        <div className="flex items-center gap-2 text-sm text-blue-300/60">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(service.date)}</span>
                          <span className="text-blue-500/40">|</span>
                          <Clock className="w-3 h-3" />
                          <span>{service.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Report Data Preview (if exists) */}
                    {activeTab === "completed" && (
                      <div className="flex gap-6">
                        {reportType === "attendance" && service.attendance && (
                          <div className="flex gap-4 text-sm">
                            <div className="text-center">
                              <p className="text-white font-bold">{service.attendance.total}</p>
                              <p className="text-blue-300/50 text-xs">Total</p>
                            </div>
                            <div className="text-center">
                              <p className="text-white">{service.attendance.adults}</p>
                              <p className="text-blue-300/50 text-xs">Adultos</p>
                            </div>
                            <div className="text-center">
                              <p className="text-white">{service.attendance.youth}</p>
                              <p className="text-blue-300/50 text-xs">Jovenes</p>
                            </div>
                            <div className="text-center">
                              <p className="text-white">{service.attendance.children}</p>
                              <p className="text-blue-300/50 text-xs">Ninos</p>
                            </div>
                          </div>
                        )}
                        {reportType === "treasury" && service.treasury && (
                          <div className="flex gap-4 text-sm">
                            <div className="text-center">
                              <p className="text-emerald-400 font-bold">{formatCurrency(service.treasury.tithes)}</p>
                              <p className="text-blue-300/50 text-xs">Diezmos</p>
                            </div>
                            <div className="text-center">
                              <p className="text-blue-400">{formatCurrency(service.treasury.offerings)}</p>
                              <p className="text-blue-300/50 text-xs">Ofrendas</p>
                            </div>
                            <div className="text-center">
                              <p className="text-purple-400">{formatCurrency(service.treasury.donations)}</p>
                              <p className="text-blue-300/50 text-xs">Donaciones</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3">
                      {getStatusBadge(service)}
                      
                      {activeTab === "pending" ? (
                        <Button
                          onClick={() => handleOpenReport(service, reportType)}
                          variant="blue" className="gap-2"
                          disabled={!isValidDate(service.date)}
                        >
                          <Plus className="w-4 h-4" />
                          Crear Reporte
                        </Button>
                      ) : (
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setActiveMenu(activeMenu === service.id ? null : service.id)}
                            className="text-blue-300/60 hover:text-white"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </Button>
                          
                          <AnimatePresence>
                            {activeMenu === service.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                className="absolute right-0 top-full mt-1 w-40 bg-[#1a2d4a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-10"
                              >
                                <button
                                  onClick={() => handleViewReport(service)}
                                  className="w-full px-4 py-2 text-sm text-left text-blue-200 hover:bg-white/10 flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  Ver Detalle
                                </button>
                                <button
                                  onClick={() => handleOpenReport(service, reportType)}
                                  className="w-full px-4 py-2 text-sm text-left text-blue-200 hover:bg-white/10 flex items-center gap-2"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteReport(service)}
                                  className="w-full px-4 py-2 text-sm text-left text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Eliminar
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </main>
      </div>

      {/* Create/Edit Report Modal */}
      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          setSelectedService(null)
        }}
        onSubmit={() => {
          setIsCreateModalOpen(false)
          setSelectedService(null)
        }}
        title={`Reporte de ${reportType === "attendance" ? "Asistencia" : "Tesoreria"}`}
        subtitle={selectedService ? `${selectedService.type} - ${formatDate(selectedService.date)}` : ""}
        submitText="Guardar Reporte"
      >
        {reportType === "attendance" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-blue-300/70 mb-1">Adultos</label>
                <Input
                  type="number"
                  min="0"
                  value={attendanceForm.adults}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, adults: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
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
                  className="bg-white/5 border-white/10 text-white"
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
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <p className="text-sm text-blue-300">
                <span className="font-semibold">Total:</span>{" "}
                {(parseInt(attendanceForm.adults || "0") + parseInt(attendanceForm.youth || "0") + parseInt(attendanceForm.children || "0")).toLocaleString()} personas
              </p>
            </div>
            <div>
              <label className="block text-sm text-blue-300/70 mb-1">Notas (opcional)</label>
              <textarea
                value={attendanceForm.notes}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, notes: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-blue-300/40 resize-none"
                rows={2}
                placeholder="Observaciones del servicio..."
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-blue-300/70 mb-1 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Diezmos
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={treasuryForm.tithes}
                  onChange={(e) => setTreasuryForm({ ...treasuryForm, tithes: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="$0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-blue-300/70 mb-1 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-blue-400" />
                  Ofrendas
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={treasuryForm.offerings}
                  onChange={(e) => setTreasuryForm({ ...treasuryForm, offerings: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="$0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-blue-300/70 mb-1 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-purple-400" />
                  Donaciones Especiales
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={treasuryForm.donations}
                  onChange={(e) => setTreasuryForm({ ...treasuryForm, donations: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="$0.00"
                />
              </div>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <p className="text-sm text-emerald-300">
                <span className="font-semibold">Total:</span>{" "}
                {formatCurrency(
                  parseFloat(treasuryForm.tithes || "0") + 
                  parseFloat(treasuryForm.offerings || "0") + 
                  parseFloat(treasuryForm.donations || "0")
                )}
              </p>
            </div>
            <div>
              <label className="block text-sm text-blue-300/70 mb-1">Notas (opcional)</label>
              <textarea
                value={treasuryForm.notes}
                onChange={(e) => setTreasuryForm({ ...treasuryForm, notes: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-blue-300/40 resize-none"
                rows={2}
                placeholder="Observaciones adicionales..."
              />
            </div>
          </div>
        )}
      </FormModal>

      {/* View Report Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsViewModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-[#0f2035] to-[#0a1628] border border-white/10 rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-white mb-2">Detalle del Reporte</h3>
              <p className="text-blue-300/60 mb-6">{selectedService.type} - {formatDate(selectedService.date)}</p>
              
              {selectedService.attendance && (
                <div className="space-y-4 mb-6">
                  <h4 className="text-sm font-semibold text-blue-300 uppercase tracking-wide">Asistencia</h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-white/5 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-white">{selectedService.attendance.total}</p>
                      <p className="text-xs text-blue-300/50">Total</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg text-center">
                      <p className="text-xl font-semibold text-white">{selectedService.attendance.adults}</p>
                      <p className="text-xs text-blue-300/50">Adultos</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg text-center">
                      <p className="text-xl font-semibold text-white">{selectedService.attendance.youth}</p>
                      <p className="text-xs text-blue-300/50">Jovenes</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg text-center">
                      <p className="text-xl font-semibold text-white">{selectedService.attendance.children}</p>
                      <p className="text-xs text-blue-300/50">Ninos</p>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedService.treasury && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-blue-300 uppercase tracking-wide">Tesoreria</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-emerald-500/10 rounded-lg">
                      <span className="text-blue-300/70 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        Diezmos
                      </span>
                      <span className="text-emerald-400 font-semibold">{formatCurrency(selectedService.treasury.tithes)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                      <span className="text-blue-300/70 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-blue-400" />
                        Ofrendas
                      </span>
                      <span className="text-blue-400 font-semibold">{formatCurrency(selectedService.treasury.offerings)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg">
                      <span className="text-blue-300/70 flex items-center gap-2">
                        <Gift className="w-4 h-4 text-purple-400" />
                        Donaciones
                      </span>
                      <span className="text-purple-400 font-semibold">{formatCurrency(selectedService.treasury.donations)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                      <span className="text-white font-semibold">Total</span>
                      <span className="text-white font-bold text-lg">
                        {formatCurrency(selectedService.treasury.tithes + selectedService.treasury.offerings + selectedService.treasury.donations)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <Button
                onClick={() => setIsViewModalOpen(false)}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-500"
              >
                Cerrar
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedService(null)
        }}
        onConfirm={() => {
          setIsDeleteModalOpen(false)
          setSelectedService(null)
        }}
        title="Eliminar Reporte"
        message={`Esta seguro que desea eliminar el reporte de ${reportType === "attendance" ? "asistencia" : "tesoreria"} del servicio "${selectedService?.type}" del ${selectedService ? formatDate(selectedService.date) : ""}? Esta accion no se puede deshacer.`}
        confirmText="Si, Eliminar"
        type="danger"
      />
    </div>
  )
}

export const Route = createFileRoute('/pastor/reports')({ component: PastorReports })
