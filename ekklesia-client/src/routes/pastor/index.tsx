import { createFileRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import {
  Users,
  Calendar,
  Wallet,
  UserPlus,
  ClipboardCheck,
  TrendingUp,
  Plus,
  Check,
  X,
  Clock,
  DollarSign,
  PiggyBank,
  Heart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Mock data
const statsData = [
  { title: "Miembros Activos", value: 185, icon: Users, trend: { value: 8, isPositive: true } },
  { title: "Asistencia Promedio", value: "78%", icon: ClipboardCheck, trend: { value: 5, isPositive: true } },
  { title: "Ayudantes", value: 6, icon: UserPlus, trend: { value: 20, isPositive: true } },
  { title: "Ofrendas del Mes", value: "$8,450", icon: Wallet, trend: { value: 12, isPositive: true } },
]

const asistenciaSemanal = [
  { name: "Dom AM", presentes: 145, ausentes: 40 },
  { name: "Dom PM", presentes: 98, ausentes: 87 },
  { name: "Mie", presentes: 65, ausentes: 120 },
  { name: "Vie", presentes: 78, ausentes: 107 },
]

const finanzasMes = [
  { name: "Sem 1", diezmos: 2200, ofrendas: 850 },
  { name: "Sem 2", diezmos: 2450, ofrendas: 920 },
  { name: "Sem 3", diezmos: 2100, ofrendas: 780 },
  { name: "Sem 4", diezmos: 2680, ofrendas: 1050 },
]

const ayudantes = [
  { id: 1, nombre: "Luis Hernández", rol: "Tesorero", activo: true },
  { id: 2, nombre: "Carmen Ruiz", rol: "Asistencia", activo: true },
  { id: 3, nombre: "Roberto Torres", rol: "Multimedia", activo: true },
  { id: 4, nombre: "Elena Martínez", rol: "Alabanza", activo: true },
  { id: 5, nombre: "Miguel Ángel", rol: "Ujieres", activo: false },
  { id: 6, nombre: "Patricia López", rol: "Niños", activo: true },
]

const proximosServicios = [
  { id: 1, tipo: "Culto Dominical", fecha: "Domingo", hora: "10:00 AM", asistenciaEsperada: 150 },
  { id: 2, tipo: "Culto Vespertino", fecha: "Domingo", hora: "6:00 PM", asistenciaEsperada: 80 },
  { id: 3, tipo: "Estudio Bíblico", fecha: "Miércoles", hora: "7:00 PM", asistenciaEsperada: 60 },
  { id: 4, tipo: "Reunión de Jóvenes", fecha: "Viernes", hora: "8:00 PM", asistenciaEsperada: 45 },
]

function PastorDashboard() {
  const [showAddAttendance, setShowAddAttendance] = useState(false)
  const [showAddHelper, setShowAddHelper] = useState(false)
  const [selectedService, setSelectedService] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#0a1628]">
      <Sidebar role="pastor" />

      <div className="lg:ml-64 transition-all duration-300">
        <Header
          title="Mi Iglesia"
          userName="Pastor Carlos"
          userRole="Pastor"
        />

        <main className="p-6">
          {/* Church Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-gradient-to-r from-blue-600/20 to-blue-500/10 border border-blue-500/20 rounded-2xl"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Iglesia del Norte</h2>
                <p className="text-blue-300/70">Calle Norte 456, Col. Norte, Monterrey</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowAddAttendance(true)}
                  variant="blue" className="gap-2"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  Registrar Asistencia
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <StatsCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                trend={stat.trend}
                delay={index * 0.1}
              />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Attendance Chart */}
            <div className="lg:col-span-2">
              <ChartCard
                title="Asistencia Semanal"
                subtitle="Presentes por servicio"
                type="bar"
                data={asistenciaSemanal}
                dataKey="presentes"
                delay={0.4}
              />
            </div>

            {/* Próximos Servicios */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Próximos Servicios
              </h3>

              <div className="space-y-3">
                {proximosServicios.map((servicio, index) => (
                  <motion.div
                    key={servicio.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    onClick={() => setSelectedService(selectedService === servicio.id ? null : servicio.id)}
                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                      selectedService === servicio.id
                        ? "bg-blue-500/20 border border-blue-500/30"
                        : "bg-white/5 hover:bg-white/10 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{servicio.tipo}</p>
                        <p className="text-xs text-blue-300/60">{servicio.fecha}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-400">{servicio.hora}</p>
                        <p className="text-xs text-blue-300/50">{servicio.asistenciaEsperada} esp.</p>
                      </div>
                    </div>

                    <AnimatePresence>
                      {selectedService === servicio.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-3 pt-3 border-t border-white/10"
                        >
                          <Button
                            size="sm"
                            variant="blue" className="w-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowAddAttendance(true)
                            }}
                          >
                            <ClipboardCheck className="w-4 h-4 mr-2" />
                            Registrar Asistencia
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Finance Summary & Helpers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Finance Quick View */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-400" />
                Resumen Financiero del Mes
              </h3>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center"
                >
                  <PiggyBank className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs text-emerald-300/70">Diezmos</p>
                  <p className="text-lg font-bold text-emerald-400">$9,430</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center"
                >
                  <DollarSign className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-xs text-blue-300/70">Ofrendas</p>
                  <p className="text-lg font-bold text-blue-400">$3,600</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-pink-500/10 border border-pink-500/20 rounded-xl text-center"
                >
                  <Heart className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                  <p className="text-xs text-pink-300/70">Donaciones</p>
                  <p className="text-lg font-bold text-pink-400">$1,250</p>
                </motion.div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="text-sm text-blue-300/70">Total del Mes</p>
                  <p className="text-2xl font-bold text-white">$14,280</p>
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-medium">+12%</span>
                </div>
              </div>
            </motion.div>

            {/* Helpers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Mis Ayudantes
                </h3>
                <Button
                  size="sm"
                  onClick={() => setShowAddHelper(true)}
                  variant="blue" className="gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </Button>
              </div>

              <div className="space-y-2">
                {ayudantes.map((ayudante, index) => (
                  <motion.div
                    key={ayudante.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        ayudante.activo
                          ? "bg-blue-500/30 text-blue-300"
                          : "bg-white/10 text-white/50"
                      }`}>
                        {ayudante.nombre.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${ayudante.activo ? "text-white" : "text-white/50"}`}>
                          {ayudante.nombre}
                        </p>
                        <p className="text-xs text-blue-300/50">{ayudante.rol}</p>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      ayudante.activo ? "bg-emerald-400" : "bg-white/30"
                    }`} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
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
                <h2 className="text-xl font-semibold text-white">Registrar Asistencia</h2>
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
                    {proximosServicios.map(s => (
                      <option key={s.id} value={s.id}>{s.tipo} - {s.fecha} {s.hora}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-200/70 mb-2">
                    Adultos Presentes
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-200/70 mb-2">
                    Niños Presentes
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    className="bg-white/5 border-white/10 text-white"
                  />
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

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="blueOutline"
                    onClick={() => setShowAddAttendance(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button variant="blue" className="flex-1">
                    <Check className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Helper Modal */}
      <AnimatePresence>
        {showAddHelper && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddHelper(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-[#0f2035] to-[#0a1628] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Nuevo Ayudante</h2>
                <button
                  onClick={() => setShowAddHelper(false)}
                  className="p-2 rounded-lg hover:bg-white/5 text-blue-300/70 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-200/70 mb-2">
                    Nombre Completo
                  </label>
                  <Input
                    placeholder="Nombre del ayudante"
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-300/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-200/70 mb-2">
                    Correo Electrónico
                  </label>
                  <Input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-300/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-200/70 mb-2">
                    Rol / Ministerio
                  </label>
                  <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:outline-none">
                    <option value="">Seleccionar rol</option>
                    <option value="tesorero">Tesorero</option>
                    <option value="asistencia">Control de Asistencia</option>
                    <option value="multimedia">Multimedia</option>
                    <option value="alabanza">Alabanza</option>
                    <option value="ujieres">Ujieres</option>
                    <option value="ninos">Ministerio de Niños</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="blueOutline"
                    onClick={() => setShowAddHelper(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button variant="blue" className="flex-1">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Crear Ayudante
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

export const Route = createFileRoute('/pastor/')({ component: PastorDashboard })
