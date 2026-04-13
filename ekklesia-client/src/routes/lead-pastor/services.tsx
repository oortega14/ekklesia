import { createFileRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { ConfirmModal } from "@/components/dashboard/confirm-modal"
import { FormModal } from "@/components/dashboard/form-modal"
import { FormInput, FormSelect, FormTextarea, FormFieldGroup } from "@/components/dashboard/form-input"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Plus,
  Search,
  Clock,
  Users,
  Church,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Eye,
  Filter,
  CalendarDays
} from "lucide-react"

const daysOfWeek = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]

const mockServices = [
  { id: 1, name: "Culto Dominical", church: "Iglesia Central", day: "Domingo", time: "10:00 AM", type: "culto", attendance: 280, recurring: true },
  { id: 2, name: "Estudio Biblico", church: "Iglesia Central", day: "Miercoles", time: "7:00 PM", type: "estudio", attendance: 85, recurring: true },
  { id: 3, name: "Reunion de Jovenes", church: "Iglesia del Norte", day: "Viernes", time: "6:00 PM", type: "jovenes", attendance: 45, recurring: true },
  { id: 4, name: "Culto de Oracion", church: "Iglesia Esperanza", day: "Martes", time: "8:00 PM", type: "oracion", attendance: 32, recurring: true },
  { id: 5, name: "Culto Dominical", church: "Iglesia del Norte", day: "Domingo", time: "9:00 AM", type: "culto", attendance: 165, recurring: true },
  { id: 6, name: "Escuela Dominical", church: "Iglesia Central", day: "Domingo", time: "9:00 AM", type: "escuela", attendance: 120, recurring: true },
]

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  culto: { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/30" },
  estudio: { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/30" },
  jovenes: { bg: "bg-cyan-500/20", text: "text-cyan-300", border: "border-cyan-500/30" },
  oracion: { bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/30" },
  escuela: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/30" },
}

const churchOptions = [
  { value: "central", label: "Iglesia Central" },
  { value: "norte", label: "Iglesia del Norte" },
  { value: "esperanza", label: "Iglesia Esperanza" },
]

const typeOptions = [
  { value: "culto", label: "Culto General" },
  { value: "estudio", label: "Estudio Biblico" },
  { value: "jovenes", label: "Reunion de Jovenes" },
  { value: "oracion", label: "Culto de Oracion" },
  { value: "escuela", label: "Escuela Dominical" },
]

const dayOptions = [
  { value: "domingo", label: "Domingo" },
  { value: "lunes", label: "Lunes" },
  { value: "martes", label: "Martes" },
  { value: "miercoles", label: "Miercoles" },
  { value: "jueves", label: "Jueves" },
  { value: "viernes", label: "Viernes" },
  { value: "sabado", label: "Sabado" },
]

function PastorPrincipalServicios() {
  const [view, setView] = useState<"calendar" | "list">("calendar")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<typeof mockServices[0] | null>(null)
  const [currentWeek, setCurrentWeek] = useState(0)

  const [formData, setFormData] = useState({
    name: "",
    church: "",
    type: "",
    day: "",
    time: "",
    description: ""
  })

  const filteredServices = mockServices.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.church.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getServicesForDay = (day: string) => {
    const dayMap: Record<string, string> = {
      "Dom": "Domingo", "Lun": "Lunes", "Mar": "Martes", "Mie": "Miercoles",
      "Jue": "Jueves", "Vie": "Viernes", "Sab": "Sabado"
    }
    return filteredServices.filter(s => s.day === dayMap[day])
  }

  const handleDelete = (service: typeof mockServices[0]) => {
    setSelectedService(service)
    setIsDeleteModalOpen(true)
  }

  const handleEdit = (service: typeof mockServices[0]) => {
    setSelectedService(service)
    setFormData({
      name: service.name,
      church: service.church.toLowerCase().replace("iglesia ", "").replace(" ", ""),
      type: service.type,
      day: service.day.toLowerCase(),
      time: service.time,
      description: ""
    })
    setIsEditModalOpen(true)
  }

  const resetForm = () => {
    setFormData({ name: "", church: "", type: "", day: "", time: "", description: "" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#0a1628]">
      <Sidebar role="lead_pastor" />

      <div className="lg:ml-64 transition-all duration-300">
        <Header
          title="Gestion de Servicios"
          userName="Carlos Mendez"
          userRole="Pastor Principal"
        />

        <main className="p-6">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: "Total Servicios", value: mockServices.length },
              { label: "Esta Semana", value: mockServices.length },
              { label: "Asistencia Promedio", value: Math.round(mockServices.reduce((a, s) => a + s.attendance, 0) / mockServices.length) },
              { label: "Iglesias", value: new Set(mockServices.map(s => s.church)).size },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-xl p-4"
              >
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-blue-300/60">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-6"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/40" />
              <input
                type="text"
                placeholder="Buscar servicios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-blue-300/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
                <button
                  onClick={() => setView("calendar")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    view === "calendar" ? "bg-blue-500/20 text-blue-400" : "text-blue-300/50 hover:text-white"
                  }`}
                >
                  <CalendarDays className="w-4 h-4" />
                  Calendario
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    view === "list" ? "bg-blue-500/20 text-blue-400" : "text-blue-300/50 hover:text-white"
                  }`}
                >
                  Lista
                </button>
              </div>

              <Button
                onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
                variant="blue" className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Nuevo Servicio
              </Button>
            </div>
          </motion.div>

          {/* Calendar View */}
          <AnimatePresence mode="wait">
            {view === "calendar" ? (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-2xl overflow-hidden"
              >
                {/* Week Navigation */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <button
                    onClick={() => setCurrentWeek(w => w - 1)}
                    className="p-2 rounded-lg hover:bg-white/10 text-blue-300/60 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-semibold text-white">
                    Semana {currentWeek === 0 ? "Actual" : currentWeek > 0 ? `+${currentWeek}` : currentWeek}
                  </h3>
                  <button
                    onClick={() => setCurrentWeek(w => w + 1)}
                    className="p-2 rounded-lg hover:bg-white/10 text-blue-300/60 hover:text-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 border-b border-white/10">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="p-3 text-center border-r border-white/5 last:border-r-0">
                      <span className="text-sm font-medium text-blue-300/70">{day}</span>
                    </div>
                  ))}
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-7 min-h-[400px]">
                  {daysOfWeek.map((day, dayIndex) => (
                    <div key={day} className="border-r border-white/5 last:border-r-0 p-2 space-y-2">
                      {getServicesForDay(day).map((service, index) => (
                        <motion.div
                          key={service.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: dayIndex * 0.05 + index * 0.02 }}
                          whileHover={{ scale: 1.02 }}
                          className={`p-2 rounded-lg ${typeColors[service.type].bg} border ${typeColors[service.type].border} cursor-pointer group relative`}
                        >
                          <p className={`text-xs font-medium ${typeColors[service.type].text} line-clamp-1`}>
                            {service.name}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-blue-300/40" />
                            <span className="text-[10px] text-blue-300/50">{service.time}</span>
                          </div>
                          <p className="text-[10px] text-blue-300/40 line-clamp-1 mt-0.5">{service.church}</p>

                          {/* Hover Actions */}
                          <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(service)}
                              className="p-1 rounded bg-white/10 hover:bg-white/20"
                            >
                              <Edit2 className="w-3 h-3 text-white" />
                            </button>
                            <button
                              onClick={() => handleDelete(service)}
                              className="p-1 rounded bg-red-500/20 hover:bg-red-500/30"
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                {filteredServices.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-white/[0.05] to-transparent border border-white/5 hover:border-blue-500/30 transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-xl ${typeColors[service.type].bg} flex items-center justify-center`}>
                      <Calendar className={`w-6 h-6 ${typeColors[service.type].text}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-white">{service.name}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${typeColors[service.type].bg} ${typeColors[service.type].text} border ${typeColors[service.type].border}`}>
                          {service.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-blue-300/60">
                        <span className="flex items-center gap-1">
                          <Church className="w-3 h-3" />
                          {service.church}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {service.day}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {service.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {service.attendance} asistentes
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(service)} className="text-blue-300 hover:text-white hover:bg-white/10">
                        Editar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(service)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        Eliminar
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Create Modal */}
      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={() => console.log("Create:", formData)}
        title="Nuevo Servicio"
        subtitle="Programa un nuevo servicio"
        icon={<Calendar className="w-6 h-6" />}
        submitText="Crear Servicio"
        size="lg"
      >
        <div className="space-y-4">
          <FormFieldGroup>
            <FormInput
              label="Nombre del Servicio"
              name="name"
              placeholder="Ej: Culto Dominical"
              value={formData.name}
              onChange={(v) => setFormData({ ...formData, name: v })}
              icon={Calendar}
              required
            />
            <FormSelect
              label="Iglesia"
              name="church"
              value={formData.church}
              onChange={(v) => setFormData({ ...formData, church: v })}
              options={churchOptions}
              icon={Church}
              required
            />
          </FormFieldGroup>
          <FormFieldGroup>
            <FormSelect
              label="Tipo de Servicio"
              name="type"
              value={formData.type}
              onChange={(v) => setFormData({ ...formData, type: v })}
              options={typeOptions}
              required
            />
            <FormSelect
              label="Dia"
              name="day"
              value={formData.day}
              onChange={(v) => setFormData({ ...formData, day: v })}
              options={dayOptions}
              required
            />
          </FormFieldGroup>
          <FormInput
            label="Hora"
            name="time"
            type="time"
            value={formData.time}
            onChange={(v) => setFormData({ ...formData, time: v })}
            icon={Clock}
            required
          />
          <FormTextarea
            label="Descripcion"
            name="description"
            placeholder="Detalles adicionales del servicio..."
            value={formData.description}
            onChange={(v) => setFormData({ ...formData, description: v })}
          />
        </div>
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={() => console.log("Update:", formData)}
        title="Editar Servicio"
        subtitle={selectedService?.name}
        icon={<Calendar className="w-6 h-6" />}
        submitText="Guardar Cambios"
        size="lg"
      >
        <div className="space-y-4">
          <FormFieldGroup>
            <FormInput
              label="Nombre del Servicio"
              name="name"
              value={formData.name}
              onChange={(v) => setFormData({ ...formData, name: v })}
              icon={Calendar}
              required
            />
            <FormSelect
              label="Iglesia"
              name="church"
              value={formData.church}
              onChange={(v) => setFormData({ ...formData, church: v })}
              options={churchOptions}
              icon={Church}
              required
            />
          </FormFieldGroup>
          <FormFieldGroup>
            <FormSelect
              label="Tipo de Servicio"
              name="type"
              value={formData.type}
              onChange={(v) => setFormData({ ...formData, type: v })}
              options={typeOptions}
              required
            />
            <FormSelect
              label="Dia"
              name="day"
              value={formData.day}
              onChange={(v) => setFormData({ ...formData, day: v })}
              options={dayOptions}
              required
            />
          </FormFieldGroup>
        </div>
      </FormModal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => console.log("Delete:", selectedService)}
        title="Eliminar Servicio"
        message={`Esta seguro de eliminar el servicio "${selectedService?.name}"? Esta accion cancelara todos los registros asociados.`}
        confirmText="Si, Eliminar"
        type="danger"
      />
    </div>
  )
}

export const Route = createFileRoute('/lead-pastor/services')({ component: PastorPrincipalServicios })
