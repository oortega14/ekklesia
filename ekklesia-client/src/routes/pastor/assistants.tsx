import { createFileRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { ConfirmModal } from "@/components/dashboard/confirm-modal"
import { FormModal } from "@/components/dashboard/form-modal"
import { FormInput, FormSelect, FormFieldGroup } from "@/components/dashboard/form-input"
import { Button } from "@/components/ui/button"
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  User,
  Shield,
  MoreHorizontal,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  CheckCircle2,
  Clock,
  FileText
} from "lucide-react"

const mockHelpers = [
  {
    id: 1,
    name: "Ana Rodriguez",
    email: "ana@iglesia.com",
    phone: "+52 55 1111 2222",
    area: "Tesoreria",
    status: "active",
    tasksCompleted: 24,
    lastActivity: "Hace 2 horas",
    since: "Ene 2024"
  },
  {
    id: 2,
    name: "Pedro Sanchez",
    email: "pedro@iglesia.com",
    phone: "+52 55 3333 4444",
    area: "Asistencia",
    status: "active",
    tasksCompleted: 18,
    lastActivity: "Hace 1 dia",
    since: "Feb 2024"
  },
  {
    id: 3,
    name: "Laura Martinez",
    email: "laura@iglesia.com",
    phone: "+52 55 5555 6666",
    area: "Tesoreria",
    status: "active",
    tasksCompleted: 32,
    lastActivity: "Hace 5 horas",
    since: "Dic 2023"
  },
  {
    id: 4,
    name: "Roberto Torres",
    email: "roberto@iglesia.com",
    phone: "+52 55 7777 8888",
    area: "Asistencia",
    status: "pending",
    tasksCompleted: 0,
    lastActivity: "Nunca",
    since: "Abr 2024"
  },
]

const areaOptions = [
  { value: "tesoreria", label: "Tesoreria" },
  { value: "asistencia", label: "Asistencia" },
  { value: "ambos", label: "Ambas areas" },
]

const areaColors: Record<string, { bg: string; text: string }> = {
  "Tesoreria": { bg: "bg-emerald-500/20", text: "text-emerald-300" },
  "Asistencia": { bg: "bg-blue-500/20", text: "text-blue-300" },
  "Ambas areas": { bg: "bg-purple-500/20", text: "text-purple-300" },
}

function PastorAyudantes() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedHelper, setSelectedHelper] = useState<typeof mockHelpers[0] | null>(null)
  const [activeMenu, setActiveMenu] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    area: "",
    password: ""
  })

  const filteredHelpers = mockHelpers.filter(helper =>
    helper.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    helper.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    helper.area.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = (helper: typeof mockHelpers[0]) => {
    setSelectedHelper(helper)
    setIsDeleteModalOpen(true)
    setActiveMenu(null)
  }

  const handleEdit = (helper: typeof mockHelpers[0]) => {
    setSelectedHelper(helper)
    setFormData({
      name: helper.name,
      email: helper.email,
      phone: helper.phone,
      area: helper.area.toLowerCase(),
      password: ""
    })
    setIsEditModalOpen(true)
    setActiveMenu(null)
  }

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", area: "", password: "" })
  }

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#0a1628]">
      <Sidebar role="pastor" />

      <div className="lg:ml-64 transition-all duration-300">
        <Header
          title="Mis Ayudantes"
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
              { label: "Total Ayudantes", value: mockHelpers.length, icon: Users },
              { label: "Activos", value: mockHelpers.filter(h => h.status === "active").length, icon: CheckCircle2 },
              { label: "Pendientes", value: mockHelpers.filter(h => h.status === "pending").length, icon: Clock },
              { label: "Tareas Completadas", value: mockHelpers.reduce((a, h) => a + h.tasksCompleted, 0), icon: FileText },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-xl p-4 flex items-center gap-4"
              >
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <stat.icon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-blue-300/60">{stat.label}</p>
                </div>
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
                placeholder="Buscar ayudantes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-blue-300/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
            <Button
              onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
              variant="blue" className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo Ayudante
            </Button>
          </motion.div>

          {/* Helpers List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {filteredHelpers.map((helper, index) => (
              <motion.div
                key={helper.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + index * 0.05 }}
                className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-xl p-5 hover:border-blue-500/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
                    {getInitials(helper.name)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-white">{helper.name}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            helper.status === "active"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}>
                            {helper.status === "active" ? "Activo" : "Pendiente"}
                          </span>
                        </div>
                        <p className="text-sm text-blue-300/60 mt-0.5">{helper.email}</p>
                      </div>

                      {/* Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenu(activeMenu === helper.id ? null : helper.id)}
                          className="p-2 rounded-lg text-blue-300/50 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        <AnimatePresence>
                          {activeMenu === helper.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 top-full mt-1 w-36 bg-[#0f2035] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20"
                            >
                              <button
                                onClick={() => { console.log("View", helper); setActiveMenu(null); }}
                                className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-white hover:bg-white/5 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                Ver perfil
                              </button>
                              <button
                                onClick={() => handleEdit(helper)}
                                className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-white hover:bg-white/5 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(helper)}
                                className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Eliminar
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Info Row */}
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <span className={`px-2.5 py-1 text-xs rounded-full ${areaColors[helper.area]?.bg || "bg-blue-500/20"} ${areaColors[helper.area]?.text || "text-blue-300"}`}>
                        {helper.area}
                      </span>
                      <span className="text-xs text-blue-300/50 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Desde {helper.since}
                      </span>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5">
                      <div>
                        <p className="text-lg font-bold text-white">{helper.tasksCompleted}</p>
                        <p className="text-xs text-blue-300/50">tareas</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-blue-300/50">Ultima actividad</p>
                        <p className="text-sm text-blue-300/70">{helper.lastActivity}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filteredHelpers.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Users className="w-16 h-16 text-blue-500/30 mb-4" />
              <p className="text-blue-300/60">No hay ayudantes registrados</p>
            </motion.div>
          )}
        </main>
      </div>

      {/* Create Modal */}
      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={() => console.log("Create:", formData)}
        title="Nuevo Ayudante"
        subtitle="Registra un nuevo ayudante"
        icon={<User className="w-6 h-6" />}
        submitText="Crear Ayudante"
        size="lg"
      >
        <div className="space-y-4">
          <FormFieldGroup>
            <FormInput
              label="Nombre Completo"
              name="name"
              placeholder="Ej: Juan Perez"
              value={formData.name}
              onChange={(v) => setFormData({ ...formData, name: v })}
              icon={User}
              required
            />
            <FormInput
              label="Correo Electronico"
              name="email"
              type="email"
              placeholder="ayudante@ejemplo.com"
              value={formData.email}
              onChange={(v) => setFormData({ ...formData, email: v })}
              icon={Mail}
              required
            />
          </FormFieldGroup>
          <FormFieldGroup>
            <FormInput
              label="Telefono"
              name="phone"
              placeholder="+52 55 1234 5678"
              value={formData.phone}
              onChange={(v) => setFormData({ ...formData, phone: v })}
              icon={Phone}
            />
            <FormSelect
              label="Area Asignada"
              name="area"
              value={formData.area}
              onChange={(v) => setFormData({ ...formData, area: v })}
              options={areaOptions}
              icon={Shield}
              required
            />
          </FormFieldGroup>
          <FormInput
            label="Contrasena"
            name="password"
            type="password"
            placeholder="Minimo 8 caracteres"
            value={formData.password}
            onChange={(v) => setFormData({ ...formData, password: v })}
            required
          />
        </div>
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={() => console.log("Update:", formData)}
        title="Editar Ayudante"
        subtitle={selectedHelper?.name}
        icon={<User className="w-6 h-6" />}
        submitText="Guardar Cambios"
        size="lg"
      >
        <div className="space-y-4">
          <FormFieldGroup>
            <FormInput
              label="Nombre Completo"
              name="name"
              value={formData.name}
              onChange={(v) => setFormData({ ...formData, name: v })}
              icon={User}
              required
            />
            <FormInput
              label="Correo Electronico"
              name="email"
              type="email"
              value={formData.email}
              onChange={(v) => setFormData({ ...formData, email: v })}
              icon={Mail}
              required
            />
          </FormFieldGroup>
          <FormFieldGroup>
            <FormInput
              label="Telefono"
              name="phone"
              value={formData.phone}
              onChange={(v) => setFormData({ ...formData, phone: v })}
              icon={Phone}
            />
            <FormSelect
              label="Area Asignada"
              name="area"
              value={formData.area}
              onChange={(v) => setFormData({ ...formData, area: v })}
              options={areaOptions}
              icon={Shield}
              required
            />
          </FormFieldGroup>
        </div>
      </FormModal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => console.log("Delete:", selectedHelper)}
        title="Eliminar Ayudante"
        message={`Esta seguro de eliminar al ayudante "${selectedHelper?.name}"? Se perdera el acceso a su cuenta.`}
        confirmText="Si, Eliminar"
        type="danger"
      />
    </div>
  )
}

export const Route = createFileRoute('/pastor/assistants')({ component: PastorAyudantes })
