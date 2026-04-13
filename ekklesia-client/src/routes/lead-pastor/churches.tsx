import { createFileRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { NetflixCard } from "@/components/dashboard/netflix-card"
import { ConfirmModal } from "@/components/dashboard/confirm-modal"
import { FormModal } from "@/components/dashboard/form-modal"
import { FormInput, FormSelect, FormTextarea, FormFieldGroup } from "@/components/dashboard/form-input"
import { Button } from "@/components/ui/button"
import {
  Church,
  Plus,
  Search,
  MapPin,
  Users,
  Calendar,
  TrendingUp,
  Mail,
  Phone,
  User,
  Building2
} from "lucide-react"

const mockChurches = [
  {
    id: 1,
    name: "Iglesia Central",
    city: "Ciudad de Mexico",
    members: 320,
    services: 4,
    pastor: "Juan Lopez",
    growth: "+12%",
    nextService: "Domingo 10:00 AM",
    status: "active"
  },
  {
    id: 2,
    name: "Iglesia del Norte",
    city: "Monterrey",
    members: 185,
    services: 3,
    pastor: "Pedro Martinez",
    growth: "+8%",
    nextService: "Domingo 9:00 AM",
    status: "active"
  },
  {
    id: 3,
    name: "Iglesia Esperanza",
    city: "Guadalajara",
    members: 145,
    services: 2,
    pastor: "Sin asignar",
    growth: "+5%",
    nextService: "Domingo 11:00 AM",
    status: "pending"
  },
]

const pastorOptions = [
  { value: "juan", label: "Juan Lopez" },
  { value: "pedro", label: "Pedro Martinez" },
  { value: "maria", label: "Maria Garcia" },
  { value: "nuevo", label: "Asignar nuevo pastor" },
]

const cityOptions = [
  { value: "cdmx", label: "Ciudad de Mexico" },
  { value: "monterrey", label: "Monterrey" },
  { value: "guadalajara", label: "Guadalajara" },
  { value: "puebla", label: "Puebla" },
]

function PastorPrincipalIglesias() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedChurch, setSelectedChurch] = useState<typeof mockChurches[0] | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    pastor: "",
    email: "",
    phone: "",
    address: "",
    description: ""
  })

  const filteredChurches = mockChurches.filter(church =>
    church.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    church.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = (church: typeof mockChurches[0]) => {
    setSelectedChurch(church)
    setIsDeleteModalOpen(true)
  }

  const handleEdit = (church: typeof mockChurches[0]) => {
    setSelectedChurch(church)
    setFormData({
      name: church.name,
      city: church.city.toLowerCase().replace(" de ", "").replace(" ", ""),
      pastor: church.pastor.toLowerCase().split(" ")[0],
      email: "",
      phone: "",
      address: "",
      description: ""
    })
    setIsEditModalOpen(true)
  }

  const resetForm = () => {
    setFormData({ name: "", city: "", pastor: "", email: "", phone: "", address: "", description: "" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#0a1628]">
      <Sidebar role="lead_pastor" />

      <div className="lg:ml-64 transition-all duration-300">
        <Header
          title="Mis Iglesias"
          userName="Carlos Mendez"
          userRole="Pastor Principal"
        />

        <main className="p-6">
          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: "Mis Iglesias", value: mockChurches.length, icon: Church },
              { label: "Total Miembros", value: mockChurches.reduce((a, c) => a + c.members, 0), icon: Users },
              { label: "Servicios Semanales", value: mockChurches.reduce((a, c) => a + c.services, 0), icon: Calendar },
              { label: "Crecimiento Promedio", value: "+8%", icon: TrendingUp },
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
                  <p className="text-sm text-blue-300/60">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/40" />
              <input
                type="text"
                placeholder="Buscar iglesias..."
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
              Nueva Iglesia
            </Button>
          </motion.div>

          {/* Churches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChurches.map((church, index) => (
              <motion.div
                key={church.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <NetflixCard
                  title={church.name}
                  subtitle={`Pastor: ${church.pastor}`}
                  badges={[
                    { label: church.status === "active" ? "Activa" : "Pendiente", color: church.status === "active" ? "green" : "amber" },
                    { label: church.growth, color: "blue" }
                  ]}
                  stats={[
                    { label: "", value: church.city, icon: <MapPin className="w-3 h-3" /> },
                    { label: "miembros", value: church.members, icon: <Users className="w-3 h-3" /> },
                  ]}
                  gradient={
                    index % 3 === 0
                      ? "from-blue-600/40 to-blue-900/60"
                      : index % 3 === 1
                        ? "from-indigo-600/40 to-indigo-900/60"
                        : "from-cyan-600/40 to-cyan-900/60"
                  }
                  delay={0}
                  onView={() => console.log("View", church)}
                  onEdit={() => handleEdit(church)}
                  onDelete={() => handleDelete(church)}
                />

                {/* Additional Info Card */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/5"
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-blue-300/60">
                      <Calendar className="w-4 h-4" />
                      <span>{church.nextService}</span>
                    </div>
                    <span className="text-xs text-blue-300/40">{church.services} servicios/semana</span>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {filteredChurches.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Church className="w-16 h-16 text-blue-500/30 mb-4" />
              <p className="text-blue-300/60">No se encontraron iglesias</p>
            </motion.div>
          )}
        </main>
      </div>

      {/* Create Modal */}
      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={() => console.log("Create:", formData)}
        title="Nueva Iglesia"
        subtitle="Registra una nueva sede"
        icon={<Church className="w-6 h-6" />}
        submitText="Crear Iglesia"
        size="lg"
      >
        <div className="space-y-4">
          <FormFieldGroup>
            <FormInput
              label="Nombre de la Iglesia"
              name="name"
              placeholder="Ej: Iglesia Nueva Esperanza"
              value={formData.name}
              onChange={(v) => setFormData({ ...formData, name: v })}
              icon={Church}
              required
            />
            <FormSelect
              label="Ciudad"
              name="city"
              value={formData.city}
              onChange={(v) => setFormData({ ...formData, city: v })}
              options={cityOptions}
              icon={MapPin}
              required
            />
          </FormFieldGroup>
          <FormFieldGroup>
            <FormSelect
              label="Pastor Asignado"
              name="pastor"
              value={formData.pastor}
              onChange={(v) => setFormData({ ...formData, pastor: v })}
              options={pastorOptions}
              icon={User}
            />
            <FormInput
              label="Correo Electronico"
              name="email"
              type="email"
              placeholder="iglesia@ejemplo.com"
              value={formData.email}
              onChange={(v) => setFormData({ ...formData, email: v })}
              icon={Mail}
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
              label="Direccion"
              name="address"
              placeholder="Calle, numero, colonia"
              value={formData.address}
              onChange={(v) => setFormData({ ...formData, address: v })}
              icon={Building2}
            />
          </FormFieldGroup>
          <FormTextarea
            label="Descripcion"
            name="description"
            placeholder="Informacion adicional sobre la iglesia..."
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
        title="Editar Iglesia"
        subtitle={selectedChurch?.name}
        icon={<Church className="w-6 h-6" />}
        submitText="Guardar Cambios"
        size="lg"
      >
        <div className="space-y-4">
          <FormFieldGroup>
            <FormInput
              label="Nombre de la Iglesia"
              name="name"
              value={formData.name}
              onChange={(v) => setFormData({ ...formData, name: v })}
              icon={Church}
              required
            />
            <FormSelect
              label="Ciudad"
              name="city"
              value={formData.city}
              onChange={(v) => setFormData({ ...formData, city: v })}
              options={cityOptions}
              icon={MapPin}
              required
            />
          </FormFieldGroup>
          <FormSelect
            label="Pastor Asignado"
            name="pastor"
            value={formData.pastor}
            onChange={(v) => setFormData({ ...formData, pastor: v })}
            options={pastorOptions}
            icon={User}
          />
        </div>
      </FormModal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => console.log("Delete:", selectedChurch)}
        title="Eliminar Iglesia"
        message={`Esta seguro de eliminar "${selectedChurch?.name}"? Se perderan todos los datos asociados incluyendo miembros, servicios y reportes.`}
        confirmText="Si, Eliminar"
        type="danger"
      />
    </div>
  )
}

export const Route = createFileRoute('/lead-pastor/churches')({ component: PastorPrincipalIglesias })
