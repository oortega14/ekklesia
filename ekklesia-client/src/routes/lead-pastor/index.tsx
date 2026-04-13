import { createFileRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import {
  Church,
  Users,
  Calendar,
  Wallet,
  Plus,
  X,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  UserPlus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Mock data
const statsData = [
  { title: "Mis Iglesias", value: 3, icon: Church, trend: { value: 50, isPositive: true } },
  { title: "Pastores a Cargo", value: 8, icon: Users, trend: { value: 25, isPositive: true } },
  { title: "Servicios Semanales", value: 12, icon: Calendar, trend: { value: 10, isPositive: true } },
  { title: "Recaudación Mensual", value: "$45,200", icon: Wallet, trend: { value: 18, isPositive: true } },
]

const churches = [
  {
    id: 1,
    nombre: "Iglesia Central",
    direccion: "Av. Principal 123, Centro",
    pastor: "Carlos Mendez",
    miembros: 320,
    servicios: 4,
    ultimoServicio: "Hoy, 10:00 AM",
    estado: "activo"
  },
  {
    id: 2,
    nombre: "Iglesia del Norte",
    direccion: "Calle Norte 456, Col. Norte",
    pastor: "María García",
    miembros: 185,
    servicios: 3,
    ultimoServicio: "Ayer, 7:00 PM",
    estado: "activo"
  },
  {
    id: 3,
    nombre: "Iglesia Nueva Esperanza",
    direccion: "Av. Esperanza 789",
    pastor: "Sin asignar",
    miembros: 95,
    servicios: 2,
    ultimoServicio: "Hace 2 días",
    estado: "pendiente"
  },
]

const pastores = [
  { id: 1, nombre: "Carlos Mendez", iglesia: "Iglesia Central", telefono: "+52 55 1234 5678", estado: "activo" },
  { id: 2, nombre: "María García", iglesia: "Iglesia del Norte", telefono: "+52 81 2345 6789", estado: "activo" },
  { id: 3, nombre: "Juan López", iglesia: "Sin asignar", telefono: "+52 33 3456 7890", estado: "disponible" },
  { id: 4, nombre: "Ana Rodríguez", iglesia: "Sin asignar", telefono: "+52 22 4567 8901", estado: "disponible" },
]

const serviciosData = [
  { name: "Dom", servicios: 8 },
  { name: "Lun", servicios: 2 },
  { name: "Mar", servicios: 3 },
  { name: "Mie", servicios: 4 },
  { name: "Jue", servicios: 2 },
  { name: "Vie", servicios: 3 },
  { name: "Sab", servicios: 5 },
]

const asistenciaData = [
  { name: "Semana 1", asistencia: 580 },
  { name: "Semana 2", asistencia: 620 },
  { name: "Semana 3", asistencia: 550 },
  { name: "Semana 4", asistencia: 690 },
]

function PastorPrincipalDashboard() {
  const [showNewChurchModal, setShowNewChurchModal] = useState(false)
  const [showNewPastorModal, setShowNewPastorModal] = useState(false)
  const [activeTab, setActiveTab] = useState<"iglesias" | "pastores" | "servicios">("iglesias")

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#0a1628]">
      <Sidebar role="lead_pastor" />

      <div className="lg:ml-64 transition-all duration-300">
        <Header
          title="Dashboard Pastor Principal"
          userName="Pastor Roberto"
          userRole="Pastor Principal"
        />

        <main className="p-6">
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

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartCard
              title="Servicios por Día"
              subtitle="Esta semana"
              type="bar"
              data={serviciosData}
              dataKey="servicios"
              delay={0.4}
            />
            <ChartCard
              title="Tendencia de Asistencia"
              subtitle="Últimas 4 semanas"
              type="area"
              data={asistenciaData}
              dataKey="asistencia"
              delay={0.5}
            />
          </div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl w-fit"
          >
            {[
              { id: "iglesias", label: "Iglesias" },
              { id: "pastores", label: "Pastores" },
              { id: "servicios", label: "Servicios" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-blue-300/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "iglesias" && (
              <motion.div
                key="iglesias"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Actions */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-white">Mis Iglesias</h2>
                  <Button
                    onClick={() => setShowNewChurchModal(true)}
                    variant="blue" className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nueva Iglesia
                  </Button>
                </div>

                {/* Churches Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {churches.map((church, index) => (
                    <motion.div
                      key={church.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-2xl p-6 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                          <Church className="w-6 h-6" />
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          church.estado === "activo"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}>
                          {church.estado === "activo" ? "Activo" : "Pendiente"}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                        {church.nombre}
                      </h3>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-blue-300/60">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{church.direccion}</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-300/60">
                          <Users className="w-4 h-4" />
                          <span>{church.miembros} miembros</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-300/60">
                          <Clock className="w-4 h-4" />
                          <span>{church.ultimoServicio}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-blue-300/50">Pastor:</span>
                          <span className={`text-sm font-medium ${
                            church.pastor === "Sin asignar" ? "text-amber-400" : "text-white"
                          }`}>
                            {church.pastor}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "pastores" && (
              <motion.div
                key="pastores"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Actions */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-white">Pastores</h2>
                  <Button
                    onClick={() => setShowNewPastorModal(true)}
                    variant="blue" className="gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Nuevo Pastor
                  </Button>
                </div>

                {/* Pastors List */}
                <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
                  {pastores.map((pastor, index) => (
                    <motion.div
                      key={pastor.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                          {pastor.nombre.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{pastor.nombre}</h3>
                          <p className="text-sm text-blue-300/60">{pastor.telefono}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-blue-300/70">{pastor.iglesia}</p>
                          <span className={`text-xs font-medium ${
                            pastor.estado === "activo"
                              ? "text-emerald-400"
                              : "text-amber-400"
                          }`}>
                            {pastor.estado === "activo" ? "Asignado" : "Disponible"}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="blueOutline"
                        >
                          Gestionar
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "servicios" && (
              <motion.div
                key="servicios"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-white">Próximos Servicios</h2>
                  <Button variant="blue" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Programar Servicio
                  </Button>
                </div>

                <div className="space-y-4">
                  {[
                    { iglesia: "Iglesia Central", tipo: "Culto Dominical", fecha: "Domingo 10:00 AM", asistenciaEsperada: 280 },
                    { iglesia: "Iglesia del Norte", tipo: "Estudio Bíblico", fecha: "Miércoles 7:00 PM", asistenciaEsperada: 85 },
                    { iglesia: "Iglesia Central", tipo: "Reunión de Jóvenes", fecha: "Viernes 8:00 PM", asistenciaEsperada: 120 },
                    { iglesia: "Iglesia Nueva Esperanza", tipo: "Culto de Oración", fecha: "Martes 6:00 PM", asistenciaEsperada: 45 },
                  ].map((servicio, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-xl p-5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/20">
                          <Calendar className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{servicio.tipo}</h3>
                          <p className="text-sm text-blue-300/60">{servicio.iglesia}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{servicio.fecha}</p>
                        <p className="text-sm text-blue-300/60">{servicio.asistenciaEsperada} esperados</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* New Church Modal */}
      <AnimatePresence>
        {showNewChurchModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewChurchModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-[#0f2035] to-[#0a1628] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Nueva Iglesia</h2>
                <button
                  onClick={() => setShowNewChurchModal(false)}
                  className="p-2 rounded-lg hover:bg-white/5 text-blue-300/70 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-200/70 mb-2">
                    Nombre de la Iglesia
                  </label>
                  <Input
                    placeholder="Ej: Iglesia Nueva Vida"
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-300/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-200/70 mb-2">
                    Dirección
                  </label>
                  <Input
                    placeholder="Dirección completa"
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-300/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-200/70 mb-2">
                    Ciudad
                  </label>
                  <Input
                    placeholder="Ciudad"
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-300/40"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="blueOutline"
                    onClick={() => setShowNewChurchModal(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button variant="blue" className="flex-1">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Crear Iglesia
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Pastor Modal */}
      <AnimatePresence>
        {showNewPastorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewPastorModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-[#0f2035] to-[#0a1628] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Nuevo Pastor</h2>
                <button
                  onClick={() => setShowNewPastorModal(false)}
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
                    placeholder="Nombre del pastor"
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
                    Teléfono
                  </label>
                  <Input
                    placeholder="+52 55 1234 5678"
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-300/40"
                  />
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-200/80">
                      El pastor recibirá un correo con las instrucciones para acceder a la plataforma.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="blueOutline"
                    onClick={() => setShowNewPastorModal(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button variant="blue" className="flex-1">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Crear Pastor
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

export const Route = createFileRoute('/lead-pastor/')({ component: PastorPrincipalDashboard })
