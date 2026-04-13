import { createFileRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { NetflixCard } from "@/components/dashboard/netflix-card"
import { ConfirmModal } from "@/components/dashboard/confirm-modal"
import { FormModal } from "@/components/dashboard/form-modal"
import { FormInput, FormSelect, FormTextarea, FormFieldGroup } from "@/components/dashboard/form-input"
import { Button } from "@/components/ui/button"
import apiClient from "@/lib/api/client"
import { useAuthStore, ROLE_LABELS } from "@/lib/auth/store"
import {
  Church,
  Plus,
  Search,
  Grid3X3,
  List,
  Filter,
  MapPin,
  Users,
  User,
  Mail,
  Phone,
  Building2
} from "lucide-react"

type ChurchStatus = "active" | "pending" | "inactive"

interface ChurchApi {
  id: number
  name: string
  city: string | null
  address: string | null
  status: ChurchStatus
}

interface ChurchRow {
  id: number
  name: string
  pastor: string
  city: string
  members: number
  services: number
  status: ChurchStatus
  email: string
  phone: string
  address: string
}

function mapChurch(apiChurch: ChurchApi): ChurchRow {
  return {
    id: apiChurch.id,
    name: apiChurch.name,
    city: apiChurch.city || "Sin ciudad",
    address: apiChurch.address || "",
    status: apiChurch.status,
    // TODO: poblar con datos reales cuando conectemos usuarios/servicios.
    pastor: "Sin asignar",
    members: 0,
    services: 0,
    email: "",
    phone: "",
  }
}

const pastorOptions = [
  { value: "carlos", label: "Carlos Mendez" },
  { value: "maria", label: "Maria Garcia" },
  { value: "juan", label: "Juan Lopez" },
  { value: "ana", label: "Ana Rodriguez" },
  { value: "pedro", label: "Pedro Sanchez" },
]

const cityOptions = [
  { value: "Ciudad de Mexico", label: "Ciudad de Mexico" },
  { value: "Monterrey", label: "Monterrey" },
  { value: "Guadalajara", label: "Guadalajara" },
  { value: "Puebla", label: "Puebla" },
  { value: "Queretaro", label: "Queretaro" },
  { value: "Tijuana", label: "Tijuana" },
]

function SuperAdminIglesias() {
  const { user } = useAuthStore()
  const [churches, setChurches] = useState<ChurchRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedChurch, setSelectedChurch] = useState<ChurchRow | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    pastor: "",
    city: "",
    email: "",
    phone: "",
    address: "",
    notes: ""
  })

  const fetchChurches = async () => {
    try {
      setError(null)
      setIsLoading(true)
      const response = await apiClient.get('/api/v1/churches')
      const apiChurches = (response.data?.churches || []) as ChurchApi[]
      setChurches(apiChurches.map(mapChurch))
    } catch {
      setError('No se pudo cargar la lista de iglesias.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchChurches()
  }, [])

  const filteredChurches = churches.filter(church =>
    church.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    church.pastor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    church.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = (church: ChurchRow) => {
    setSelectedChurch(church)
    setIsDeleteModalOpen(true)
  }

  const handleEdit = (church: ChurchRow) => {
    setSelectedChurch(church)
    setFormData({
      name: church.name,
      pastor: church.pastor,
      city: church.city,
      email: church.email,
      phone: church.phone,
      address: church.address,
      notes: ""
    })
    setIsEditModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      pastor: "",
      city: "",
      email: "",
      phone: "",
      address: "",
      notes: ""
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="superadmin" />

      <div className="lg:ml-64 transition-all duration-300">
        <Header
          title="Gestion de Iglesias"
          userName={user?.full_name ?? ''}
          userRole={ROLE_LABELS[user?.role ?? ''] ?? ''}
        />

        <main className="p-6 bg-white">
          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar iglesias por nombre, pastor o ciudad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-300">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-blue-100 text-blue-700"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-blue-100 text-blue-700"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <Button variant="blueOutline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </Button>

              <Button
                onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
                variant="blue" className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Nueva Iglesia
              </Button>
            </div>
          </motion.div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: "Total Iglesias", value: churches.length, color: "blue" },
              { label: "Activas", value: churches.filter(c => c.status === "active").length, color: "green" },
              { label: "Pendientes", value: churches.filter(c => c.status === "pending").length, color: "amber" },
              { label: "Total Miembros", value: churches.reduce((a, c) => a + c.members, 0), color: "purple" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="bg-white border border-slate-200 shadow-sm rounded-xl p-4"
              >
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Churches Grid/List */}
          {isLoading ? (
            <div className="py-16 text-center text-slate-500">Cargando iglesias...</div>
          ) : (
          <AnimatePresence mode="wait">
            {viewMode === "grid" ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredChurches.map((church, index) => (
                  <NetflixCard
                    key={church.id}
                    title={church.name}
                    subtitle={`Pastor: ${church.pastor}`}
                    badges={[
                      {
                        label: church.status === "active" ? "Activa" : "Pendiente",
                        color: church.status === "active" ? "green" : "amber"
                      }
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
                    delay={index * 0.05}
                    onView={() => console.log("View", church)}
                    onEdit={() => handleEdit(church)}
                    onDelete={() => handleDelete(church)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {filteredChurches.map((church, index) => (
                  <motion.div
                    key={church.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-300 shadow-sm transition-all cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Church className="w-7 h-7 text-blue-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-slate-900">{church.name}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          church.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {church.status === "active" ? "Activa" : "Pendiente"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {church.pastor}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {church.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {church.members} miembros
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(church)}
                        className="text-blue-700 hover:text-blue-800 hover:bg-blue-50"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(church)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          )}

          {/* Empty State */}
          {filteredChurches.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                <Church className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No se encontraron iglesias</h3>
              <p className="text-slate-500 text-sm mb-4">Intenta con otros terminos de busqueda</p>
              <Button onClick={() => setSearchQuery("")} variant="blueOutline">
                Limpiar busqueda
              </Button>
            </motion.div>
          )}
        </main>
      </div>

      {/* Create Modal */}
      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async () => {
          try {
            setIsSaving(true)
            setError(null)
            await apiClient.post('/api/v1/churches', {
              church: {
                name: formData.name,
                city: formData.city || null,
                address: formData.address || null,
                status: 'pending',
              },
            })
            setIsCreateModalOpen(false)
            resetForm()
            await fetchChurches()
          } catch {
            setError('No se pudo crear la iglesia.')
          } finally {
            setIsSaving(false)
          }
        }}
        title="Nueva Iglesia"
        subtitle="Registra una nueva iglesia en el sistema"
        icon={<Church className="w-6 h-6" />}
        submitText="Crear Iglesia"
        size="lg"
      >
        <div className="space-y-4">
          <FormFieldGroup>
            <FormInput
              label="Nombre de la Iglesia"
              name="name"
              placeholder="Ej: Iglesia Central"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              icon={Church}
              required
            />
            <FormSelect
              label="Pastor Principal"
              name="pastor"
              value={formData.pastor}
              onChange={(value) => setFormData({ ...formData, pastor: value })}
              options={pastorOptions}
              icon={User}
              required
            />
          </FormFieldGroup>

          <FormFieldGroup>
            <FormSelect
              label="Ciudad"
              name="city"
              value={formData.city}
              onChange={(value) => setFormData({ ...formData, city: value })}
              options={cityOptions}
              icon={MapPin}
              required
            />
            <FormInput
              label="Correo Electronico"
              name="email"
              type="email"
              placeholder="iglesia@ejemplo.com"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
              icon={Mail}
              required
            />
          </FormFieldGroup>

          <FormFieldGroup>
            <FormInput
              label="Telefono"
              name="phone"
              type="tel"
              placeholder="+52 55 1234 5678"
              value={formData.phone}
              onChange={(value) => setFormData({ ...formData, phone: value })}
              icon={Phone}
            />
            <FormInput
              label="Direccion"
              name="address"
              placeholder="Calle, numero, colonia"
              value={formData.address}
              onChange={(value) => setFormData({ ...formData, address: value })}
              icon={Building2}
            />
          </FormFieldGroup>

          <FormTextarea
            label="Notas adicionales"
            name="notes"
            placeholder="Informacion adicional sobre la iglesia..."
            value={formData.notes}
            onChange={(value) => setFormData({ ...formData, notes: value })}
            rows={3}
          />
        </div>
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={async () => {
          if (!selectedChurch) return
          try {
            setIsSaving(true)
            setError(null)
            await apiClient.put(`/api/v1/churches/${selectedChurch.id}`, {
              church: {
                name: formData.name,
                city: formData.city || null,
                address: formData.address || null,
                status: selectedChurch.status,
              },
            })
            setIsEditModalOpen(false)
            setSelectedChurch(null)
            await fetchChurches()
          } catch {
            setError('No se pudo actualizar la iglesia.')
          } finally {
            setIsSaving(false)
          }
        }}
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
              placeholder="Ej: Iglesia Central"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              icon={Church}
              required
            />
            <FormSelect
              label="Pastor Principal"
              name="pastor"
              value={formData.pastor}
              onChange={(value) => setFormData({ ...formData, pastor: value })}
              options={pastorOptions}
              icon={User}
              required
            />
          </FormFieldGroup>

          <FormFieldGroup>
            <FormSelect
              label="Ciudad"
              name="city"
              value={formData.city}
              onChange={(value) => setFormData({ ...formData, city: value })}
              options={cityOptions}
              icon={MapPin}
              required
            />
            <FormInput
              label="Correo Electronico"
              name="email"
              type="email"
              placeholder="iglesia@ejemplo.com"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
              icon={Mail}
              required
            />
          </FormFieldGroup>

          <FormFieldGroup>
            <FormInput
              label="Telefono"
              name="phone"
              type="tel"
              placeholder="+52 55 1234 5678"
              value={formData.phone}
              onChange={(value) => setFormData({ ...formData, phone: value })}
              icon={Phone}
            />
            <FormInput
              label="Direccion"
              name="address"
              placeholder="Calle, numero, colonia"
              value={formData.address}
              onChange={(value) => setFormData({ ...formData, address: value })}
              icon={Building2}
            />
          </FormFieldGroup>
        </div>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          if (!selectedChurch) return
          try {
            setIsSaving(true)
            setError(null)
            await apiClient.delete(`/api/v1/churches/${selectedChurch.id}`)
            setSelectedChurch(null)
            await fetchChurches()
          } catch {
            setError('No se pudo eliminar la iglesia.')
          } finally {
            setIsSaving(false)
          }
        }}
        title="Eliminar Iglesia"
        message={`Esta seguro de que desea eliminar "${selectedChurch?.name}"? Esta accion no se puede deshacer y se perderan todos los datos asociados.`}
        confirmText="Si, Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  )
}

export const Route = createFileRoute('/superadmin/churches')({
  component: SuperAdminIglesias
})
