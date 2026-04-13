import { createFileRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import {
  ClipboardCheck,
  Wallet,
  Plus,
  Check,
  X,
  Calendar,
  Users,
  DollarSign,
  PiggyBank,
  Heart,
  Gift,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link } from "@tanstack/react-router"

// Mock data
const serviciosPendientes = [
  { id: 1, tipo: "Culto Dominical", fecha: "Domingo 15", hora: "10:00 AM", estado: "pendiente" },
  { id: 2, tipo: "Culto Vespertino", fecha: "Domingo 15", hora: "6:00 PM", estado: "pendiente" },
]

const serviciosCompletados = [
  { id: 3, tipo: "Estudio Bíblico", fecha: "Miércoles 12", hora: "7:00 PM", asistencia: 58, ofrendas: "$450" },
  { id: 4, tipo: "Culto Dominical", fecha: "Domingo 8", hora: "10:00 AM", asistencia: 142, ofrendas: "$2,150" },
  { id: 5, tipo: "Culto Vespertino", fecha: "Domingo 8", hora: "6:00 PM", asistencia: 78, ofrendas: "$680" },
]

const quickStats = [
  { label: "Reportes esta semana", value: 3, icon: FileText, color: "blue" },
  { label: "Servicios pendientes", value: 2, icon: Clock, color: "amber" },
  { label: "Total asistencia reportada", value: 278, icon: Users, color: "emerald" },
  { label: "Total ofrendas reportadas", value: "$3,280", icon: Wallet, color: "pink" },
]

function AyudanteDashboard() {
  const [showAddAttendance, setShowAddAttendance] = useState(false)
  const [showAddTreasury, setShowAddTreasury] = useState(false)
  const [selectedService, setSelectedService] = useState<number | null>(null)
  const [activeReport, setActiveReport] = useState<"asistencia" | "tesoreria">("asistencia")

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#0a1628]">
      <Sidebar role="assistant" />

      <div className="lg:ml-64 transition-all duration-300">
        <Header
          title="Panel de Asistente"
          userName="Maria Lopez"
          userRole="Asistente - Iglesia Central"
        />

        <main className="p-6">
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-gradient-to-r from-blue-600/20 to-blue-500/10 border border-blue-500/20 rounded-2xl"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Bienvenido, Luis</h2>
                <p className="text-blue-300/70">Iglesia del Norte - Tienes 2 servicios pendientes de reportar</p>
              </div>
              <Link to="/assistant/reports">
                <Button variant="blue" className="gap-2">
                  <ClipboardCheck className="w-4 h-4" />
                  Ir a Reportes
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {quickStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className={`p-4 rounded-xl border ${
                  stat.color === "blue" ? "bg-blue-500/10 border-blue-500/20" :
                  stat.color === "amber" ? "bg-amber-500/10 border-amber-500/20" :
                  stat.color === "emerald" ? "bg-emerald-500/10 border-emerald-500/20" :
                  "bg-pink-500/10 border-pink-500/20"
                }`}
              >
                <stat.icon className={`w-5 h-5 mb-2 ${
                  stat.color === "blue" ? "text-blue-400" :
                  stat.color === "amber" ? "text-amber-400" :
                  stat.color === "emerald" ? "text-emerald-400" :
                  "text-pink-400"
                }`} />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-blue-300/60">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Services */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Servicios Pendientes</h3>
              </div>

              <div className="space-y-3">
                {serviciosPendientes.map((servicio, index) => (
                  <motion.div
                    key={servicio.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedService === servicio.id
                        ? "bg-blue-500/20 border-blue-500/30"
                        : "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10"
                    }`}
                    onClick={() => setSelectedService(selectedService === servicio.id ? null : servicio.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{servicio.tipo}</p>
                        <p className="text-sm text-blue-300/60">{servicio.fecha} - {servicio.hora}</p>
                      </div>
                      <span className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs font-medium rounded-lg">
                        Pendiente
                      </span>
                    </div>

                    <AnimatePresence>
                      {selectedService === servicio.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-2"
                        >
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowAddAttendance(true)
                            }}
                          >
                            <ClipboardCheck className="w-4 h-4" />
                            Asistencia
                          </Button>
                          <Button
                            size="sm"
                            variant="blue" className="gap-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowAddTreasury(true)
                            }}
                          >
                            <Wallet className="w-4 h-4" />
                            Tesorería
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}

                {serviciosPendientes.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                    <p className="text-white font-medium">Todo al día</p>
                    <p className="text-sm text-blue-300/60">No tienes servicios pendientes</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Completed Reports */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Reportes Completados</h3>
              </div>

              <div className="space-y-3">
                {serviciosCompletados.map((servicio, index) => (
                  <motion.div
                    key={servicio.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-white">{servicio.tipo}</p>
                        <p className="text-sm text-blue-300/60">{servicio.fecha} - {servicio.hora}</p>
                      </div>
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-lg">
                        Completado
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-blue-300/70">
                        <Users className="w-4 h-4" />
                        {servicio.asistencia} personas
                      </span>
                      <span className="flex items-center gap-1 text-emerald-300/70">
                        <Wallet className="w-4 h-4" />
                        {servicio.ofrendas}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quick Actions Guide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Guía Rápida</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <ClipboardCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h4 className="font-medium text-white">Reporte de Asistencia</h4>
                </div>
                <p className="text-sm text-blue-300/60">
                  Registra el número de adultos, niños y visitantes de cada servicio.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Wallet className="w-5 h-5 text-blue-400" />
                  </div>
                  <h4 className="font-medium text-white">Reporte de Tesorería</h4>
                </div>
                <p className="text-sm text-blue-300/60">
                  Ingresa los diezmos, ofrendas y donaciones recibidas en el servicio.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-pink-500/20">
                    <Send className="w-5 h-5 text-pink-400" />
                  </div>
                  <h4 className="font-medium text-white">Envío Automático</h4>
                </div>
                <p className="text-sm text-blue-300/60">
                  Los reportes se envían automáticamente al pastor al guardarlos.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </main>
      </div>

      {/* Add Attendance Modal */}
      <AnimatePresence>
        {showAddAttendance && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddAttendance(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-[#0f2035] to-[#0a1628] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <ClipboardCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Reporte de Asistencia</h2>
                </div>
                <button
                  onClick={() => setShowAddAttendance(false)}
                  className="p-2 rounded-lg hover:bg-white/5 text-blue-300/70 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-200/70 mb-2">
                    Servicio
                  </label>
                  <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:outline-none">
                    <option value="">Seleccionar servicio</option>
                    {serviciosPendientes.map(s => (
                      <option key={s.id} value={s.id}>{s.tipo} - {s.fecha} {s.hora}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-200/70 mb-2">
                      Adultos
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-200/70 mb-2">
                      Niños
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200/70 mb-2">
                    Visitantes
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200/70 mb-2">
                    Notas (opcional)
                  </label>
                  <textarea
                    placeholder="Observaciones del servicio..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-blue-300/40 focus:border-blue-500/50 focus:outline-none resize-none h-20"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="blueOutline"
                    onClick={() => setShowAddAttendance(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white">
                    <Check className="w-4 h-4 mr-2" />
                    Enviar Reporte
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Treasury Modal */}
      <AnimatePresence>
        {showAddTreasury && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddTreasury(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-[#0f2035] to-[#0a1628] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Wallet className="w-5 h-5 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Reporte de Tesorería</h2>
                </div>
                <button
                  onClick={() => setShowAddTreasury(false)}
                  className="p-2 rounded-lg hover:bg-white/5 text-blue-300/70 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-200/70 mb-2">
                    Servicio
                  </label>
                  <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:outline-none">
                    <option value="">Seleccionar servicio</option>
                    {serviciosPendientes.map(s => (
                      <option key={s.id} value={s.id}>{s.tipo} - {s.fecha} {s.hora}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-blue-200/70 mb-2">
                    <PiggyBank className="w-4 h-4 text-emerald-400" />
                    Diezmos
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50">$</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="bg-white/5 border-white/10 text-white pl-8"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-blue-200/70 mb-2">
                    <DollarSign className="w-4 h-4 text-blue-400" />
                    Ofrendas
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50">$</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="bg-white/5 border-white/10 text-white pl-8"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-blue-200/70 mb-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    Donaciones Especiales
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50">$</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="bg-white/5 border-white/10 text-white pl-8"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-blue-200/70 mb-2">
                    <Gift className="w-4 h-4 text-amber-400" />
                    Otros Ingresos
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50">$</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="bg-white/5 border-white/10 text-white pl-8"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="blueOutline"
                    onClick={() => setShowAddTreasury(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button variant="blue" className="flex-1">
                    <Check className="w-4 h-4 mr-2" />
                    Enviar Reporte
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const Route = createFileRoute('/assistant/')({
  component: AyudanteDashboard
})
