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
  Church,
  User,
  Shield,
  MoreHorizontal,
  Edit2,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  Star
} from "lucide-react"

const mockPastors = [
  {
    id: 1,
    name: "Juan Lopez",
    email: "juan@iglesia.com",
    phone: "+52 55 1234 5678",
    church: "Iglesia Central",
    city: "Ciudad de Mexico",
    role: "Pastor",
    status: "active",
    members: 120,
    since: "2020",
    rating: 4.8
  },
  {
    id: 2,
    name: "Pedro Martinez",
    email: "pedro@iglesia.com",
    phone: "+52 81 9876 5432",
    church: "Iglesia del Norte",
    city: "Monterrey",
    role: "Pastor",
    status: "active",
    members: 85,
    since: "2021",
    rating: 4.5
  },
  {
    id: 3,
    name: "Maria Garcia",
    email: "maria@iglesia.com",
    phone: "+52 33 5555 1234",
    church: "Sin asignar",
    city: "Guadalajara",
    role: "Pastor",
    status: "pending",
    members: 0,
    since: "2024",
    rating: 0
  },
  {
    id: 4,
    name: "Roberto Sanchez",
    email: "roberto@iglesia.com",
    phone: "+52 22 4444 5555",
    church: "Iglesia Esperanza",
    city: "Puebla",
    role: "Pastor Asociado",
    status: "active",
    members: 45,
    since: "2022",
    rating: 4.2
  },
]

const churchOptions = [
  { value: "central", label: "Iglesia Central" },
  { value: "norte", label: "Iglesia del Norte" },
  { value: "esperanza", label: "Iglesia Esperanza" },
  { value: "none", label: "Sin asignar" },
]

const roleOptions = [
  { value: "pastor", label: "Pastor" },
  { value: "asociado", label: "Pastor Asociado" },
  { value: "auxiliar", label: "Pastor Auxiliar" },
]

function PastorPrincipalPastores() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedPastor, setSelectedPastor] = useState<typeof mockPastors[0] | null>(null)
  const [activeMenu, setActiveMenu] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    church: "",
    role: "",
    password: ""
  })

  const filteredPastors = mockPastors.filter(pastor =>
    pastor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pastor.church.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pastor.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = (pastor: typeof mockPastors[0]) => {
    setSelectedPastor(pastor)
    setIsDeleteModalOpen(true)
    setActiveMenu(null)
  }

  const handleEdit = (pastor: typeof mockPastors[0]) => {
    setSelectedPastor(pastor)
    setFormData({
      name: pastor.name,
      email: pastor.email,
      phone: pastor.phone,
      church: pastor.church === "Sin asignar" ? "none" : pastor.church.toLowerCase().replace("iglesia ", "").replace(" ", ""),
      role: pastor.role.toLowerCase().replace("pastor ", "").replace(" ", "") || "pastor",
      password: ""
    })
    setIsEditModalOpen(true)
    setActiveMenu(null)
  }

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", church: "", role: "", password: "" })
  }

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#0a1628]">
      <Sidebar role="lead_pastor" />

      <div className="lg:ml-64 transition-all duration-300">
        <Header
          title="Gestion de Pastores"
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
              { label: "Total Pastores", value: mockPastors.length, color: "blue" },
              { label: "Activos", value: mockPastors.filter(p => p.status === "active").length, color: "green" },
              { label: "Pendientes", value: mockPastors.filter(p => p.status === "pending").length, color: "amber" },
              { label: "Miembros Totales", value: mockPastors.reduce((a, p) => a + p.members, 0), color: "purple" },
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
                placeholder="Buscar pastores..."
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
              Nuevo Pastor
            </Button>
          </motion.div>

          {/* Pastor Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPastors.map((pastor, index) => (
              <motion.div
                key={pastor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-2xl overflow-hidden group hover:border-blue-500/30 transition-all"
              >
                {/* Header with gradient */}
                <div className="relative h-24 bg-gradient-to-br from-blue-600/30 to-blue-900/50">
                  <div className="absolute inset-0 opacity-20">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <path d="M50 10 L50 40 M30 30 L70 30" fill="none" stroke="white" strokeWidth="1" />
                    </svg>
                  </div>

                  {/* Status badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      pastor.status === "active"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}>
                      {pastor.status === "active" ? "Activo" : "Pendiente"}
                    </span>
                  </div>

                  {/* Menu */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => setActiveMenu(activeMenu === pastor.id ? null : pastor.id)}
                      className="p-2 rounded-lg bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    <AnimatePresence>
                      {activeMenu === pastor.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 top-full mt-2 w-36 bg-[#0f2035] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20"
                        >
                          <button
                            onClick={() => { console.log("View", pastor); setActiveMenu(null); }}
                            className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-white hover:bg-white/5 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Ver perfil
                          </button>
                          <button
                            onClick={() => handleEdit(pastor)}
                            className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-white hover:bg-white/5 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(pastor)}
                            className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Avatar */}
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xl font-bold text-white border-4 border-[#0a1628]">
                      {getInitials(pastor.name)}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="pt-12 pb-5 px-5">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-white">{pastor.name}</h3>
                    <p className="text-sm text-blue-300/60">{pastor.role}</p>

                    {pastor.rating > 0 && (
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm text-amber-300">{pastor.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Info Grid */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-blue-300/60">
                      <Church className="w-4 h-4" />
                      <span>{pastor.church}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-300/60">
                      <MapPin className="w-4 h-4" />
                      <span>{pastor.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-300/60">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{pastor.email}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">{pastor.members}</p>
                      <p className="text-xs text-blue-300/50">Miembros</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">{pastor.since}</p>
                      <p className="text-xs text-blue-300/50">Desde</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredPastors.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Users className="w-16 h-16 text-blue-500/30 mb-4" />
              <p className="text-blue-300/60">No se encontraron pastores</p>
            </motion.div>
          )}
        </main>
      </div>

      {/* Create Modal */}
      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={() => console.log("Create:", formData)}
        title="Nuevo Pastor"
        subtitle="Registra un nuevo pastor"
        icon={<User className="w-6 h-6" />}
        submitText="Crear Pastor"
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
              placeholder="pastor@ejemplo.com"
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
            <FormInput
              label="Contrasena"
              name="password"
              type="password"
              placeholder="Minimo 8 caracteres"
              value={formData.password}
              onChange={(v) => setFormData({ ...formData, password: v })}
              required
            />
          </FormFieldGroup>
          <FormFieldGroup>
            <FormSelect
              label="Rol"
              name="role"
              value={formData.role}
              onChange={(v) => setFormData({ ...formData, role: v })}
              options={roleOptions}
              icon={Shield}
              required
            />
            <FormSelect
              label="Iglesia Asignada"
              name="church"
              value={formData.church}
              onChange={(v) => setFormData({ ...formData, church: v })}
              options={churchOptions}
              icon={Church}
            />
          </FormFieldGroup>
        </div>
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={() => console.log("Update:", formData)}
        title="Editar Pastor"
        subtitle={selectedPastor?.name}
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
            <FormSelect
              label="Rol"
              name="role"
              value={formData.role}
              onChange={(v) => setFormData({ ...formData, role: v })}
              options={roleOptions}
              icon={Shield}
              required
            />
            <FormSelect
              label="Iglesia Asignada"
              name="church"
              value={formData.church}
              onChange={(v) => setFormData({ ...formData, church: v })}
              options={churchOptions}
              icon={Church}
            />
          </FormFieldGroup>
        </div>
      </FormModal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => console.log("Delete:", selectedPastor)}
        title="Eliminar Pastor"
        message={`Esta seguro de eliminar al pastor "${selectedPastor?.name}"? Se perdera el acceso a su cuenta y todos sus datos asociados.`}
        confirmText="Si, Eliminar"
        type="danger"
      />
    </div>
  )
}

export const Route = createFileRoute('/lead-pastor/pastors')({ component: PastorPrincipalPastores })
