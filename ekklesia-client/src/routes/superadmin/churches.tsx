import { createFileRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { NetflixCard } from '@/components/dashboard/netflix-card'
import { ConfirmModal } from '@/components/dashboard/confirm-modal'
import { FormModal } from '@/components/dashboard/form-modal'
import { FormInput, FormSelect, FormFieldGroup } from '@/components/dashboard/form-input'
import { Button } from '@/components/ui/button'
import { useAuthStore, ROLE_LABELS } from '@/lib/auth/store'
import {
  listChurches,
  createChurch,
  updateChurch,
  deleteChurch,
  type ChurchRow,
  type ChurchStatus
} from '@/lib/api/churches'
import { listMinistries } from '@/lib/api/ministries'
import {
  Church,
  Plus,
  Search,
  Grid3X3,
  List,
  MapPin,
  Users,
  User,
  Mail,
  Phone,
  Building2
} from 'lucide-react'

interface FormState {
  name: string
  ministry_id: number | ''
  city: string
  address: string
  email: string
  phone: string
  status: ChurchStatus
}

const emptyForm: FormState = {
  name: '',
  ministry_id: '',
  city: '',
  address: '',
  email: '',
  phone: '',
  status: 'active'
}

const statusOptions: Array<{ value: ChurchStatus; label: string }> = [
  { value: 'active',   label: 'Activa' },
  { value: 'pending',  label: 'Pendiente' },
  { value: 'inactive', label: 'Inactiva' }
]

function statusLabel(status: ChurchStatus) {
  return statusOptions.find((o) => o.value === status)?.label ?? status
}

function SuperAdminIglesias() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedChurch, setSelectedChurch] = useState<ChurchRow | null>(null)
  const [formData, setFormData] = useState<FormState>(emptyForm)

  const churchesQ   = useQuery({ queryKey: ['churches'],   queryFn: () => listChurches({ perPage: 100 }) })
  const ministriesQ = useQuery({ queryKey: ['ministries'], queryFn: listMinistries })

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['churches'] })
    qc.invalidateQueries({ queryKey: ['stats'] })
    qc.invalidateQueries({ queryKey: ['users'] })
  }

  const createM = useMutation({
    mutationFn: createChurch,
    onSuccess: () => { invalidateAll(); setIsCreateModalOpen(false); setFormData(emptyForm) }
  })
  const updateM = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof updateChurch>[1] }) => updateChurch(id, payload),
    onSuccess: () => { invalidateAll(); setIsEditModalOpen(false); setFormData(emptyForm); setSelectedChurch(null) }
  })
  const deleteM = useMutation({
    mutationFn: deleteChurch,
    onSuccess: () => { invalidateAll(); setIsDeleteModalOpen(false); setSelectedChurch(null) }
  })

  const churches = churchesQ.data ?? []

  const filteredChurches = useMemo(() => {
    const q = searchQuery.toLowerCase()
    if (!q) return churches
    return churches.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      (c.lead_pastor_name ?? '').toLowerCase().includes(q) ||
      (c.city ?? '').toLowerCase().includes(q)
    )
  }, [churches, searchQuery])

  const ministryOptions = (ministriesQ.data ?? []).map((m) => ({ value: String(m.id), label: m.name }))

  const openCreate = () => { setFormData(emptyForm); setIsCreateModalOpen(true) }
  const openEdit = (c: ChurchRow) => {
    setSelectedChurch(c)
    setFormData({
      name:        c.name,
      ministry_id: c.ministry_id,
      city:        c.city ?? '',
      address:     c.address ?? '',
      email:       c.email ?? '',
      phone:       c.phone ?? '',
      status:      c.status
    })
    setIsEditModalOpen(true)
  }
  const openDelete = (c: ChurchRow) => { setSelectedChurch(c); setIsDeleteModalOpen(true) }

  const submitCreate = () => {
    if (!formData.name || formData.ministry_id === '') return
    createM.mutate({
      name:        formData.name,
      ministry_id: Number(formData.ministry_id),
      city:        formData.city || undefined,
      address:     formData.address || undefined,
      email:       formData.email || undefined,
      phone:       formData.phone || undefined,
      status:      formData.status
    })
  }

  const submitUpdate = () => {
    if (!selectedChurch) return
    updateM.mutate({
      id: selectedChurch.id,
      payload: {
        name:    formData.name,
        city:    formData.city || undefined,
        address: formData.address || undefined,
        email:   formData.email || undefined,
        phone:   formData.phone || undefined,
        status:  formData.status
      }
    })
  }

  const stats = [
    { label: 'Total Iglesias', value: churches.length },
    { label: 'Activas',        value: churches.filter((c) => c.status === 'active').length },
    { label: 'Pendientes',     value: churches.filter((c) => c.status === 'pending').length },
    { label: 'Inactivas',      value: churches.filter((c) => c.status === 'inactive').length }
  ]

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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
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

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-300">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <Button onClick={openCreate} variant="blue" className="gap-2">
                <Plus className="w-4 h-4" />
                Nueva Iglesia
              </Button>
            </div>
          </motion.div>

          {churchesQ.error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              No se pudo cargar la lista de iglesias.
            </div>
          )}
          {(createM.error || updateM.error || deleteM.error) && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              No se pudo guardar el cambio. Inténtalo de nuevo.
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {stats.map((stat, index) => (
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

          {churchesQ.isLoading ? (
            <div className="py-16 text-center text-slate-500">Cargando iglesias...</div>
          ) : (
            <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
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
                      subtitle={`Pastor: ${church.lead_pastor_name ?? 'Sin asignar'}`}
                      badges={[{
                        label: statusLabel(church.status),
                        color: church.status === 'active'
                          ? 'green'
                          : church.status === 'pending'
                            ? 'amber'
                            : 'red'
                      }]}
                      stats={[
                        { label: '',           value: church.city ?? '—',   icon: <MapPin className="w-3 h-3" /> },
                        { label: 'asignados',  value: church.users_count,   icon: <Users className="w-3 h-3" /> }
                      ]}
                      gradient={
                        index % 3 === 0
                          ? 'from-blue-600/40 to-blue-900/60'
                          : index % 3 === 1
                            ? 'from-indigo-600/40 to-indigo-900/60'
                            : 'from-cyan-600/40 to-cyan-900/60'
                      }
                      delay={index * 0.05}
                      onView={() => console.log('View', church)}
                      onEdit={() => openEdit(church)}
                      onDelete={() => openDelete(church)}
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
                            church.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : church.status === 'pending'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                          }`}>
                            {statusLabel(church.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {church.lead_pastor_name ?? 'Sin asignar'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {church.city ?? '—'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {church.users_count} asignados
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(church)}
                          className="text-blue-700 hover:text-blue-800 hover:bg-blue-50"
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDelete(church)}
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

          {!churchesQ.isLoading && filteredChurches.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                <Church className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {churches.length === 0 ? 'No hay iglesias registradas' : 'Sin resultados'}
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                {churches.length === 0
                  ? 'Crea la primera iglesia con el botón de arriba.'
                  : 'Prueba con otros términos de búsqueda.'}
              </p>
              {churches.length > 0 && (
                <Button onClick={() => setSearchQuery('')} variant="blueOutline">
                  Limpiar busqueda
                </Button>
              )}
            </motion.div>
          )}
        </main>
      </div>

      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={submitCreate}
        title="Nueva Iglesia"
        subtitle="Registra una nueva iglesia en el sistema"
        icon={<Church className="w-6 h-6" />}
        submitText={createM.isPending ? 'Creando...' : 'Crear Iglesia'}
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
              label="Ministerio"
              name="ministry_id"
              value={String(formData.ministry_id)}
              onChange={(value) => setFormData({ ...formData, ministry_id: value ? Number(value) : '' })}
              options={ministryOptions}
              icon={Building2}
              required
            />
          </FormFieldGroup>

          <FormFieldGroup>
            <FormInput
              label="Ciudad"
              name="city"
              placeholder="Ej: Ciudad de Mexico"
              value={formData.city}
              onChange={(value) => setFormData({ ...formData, city: value })}
              icon={MapPin}
            />
            <FormSelect
              label="Estado"
              name="status"
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value as ChurchStatus })}
              options={statusOptions}
              required
            />
          </FormFieldGroup>

          <FormFieldGroup>
            <FormInput
              label="Correo Electronico"
              name="email"
              type="email"
              placeholder="iglesia@ejemplo.com"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
              icon={Mail}
            />
            <FormInput
              label="Telefono"
              name="phone"
              type="tel"
              placeholder="+52 55 1234 5678"
              value={formData.phone}
              onChange={(value) => setFormData({ ...formData, phone: value })}
              icon={Phone}
            />
          </FormFieldGroup>

          <FormInput
            label="Direccion"
            name="address"
            placeholder="Calle, numero, colonia"
            value={formData.address}
            onChange={(value) => setFormData({ ...formData, address: value })}
            icon={Building2}
          />
        </div>
      </FormModal>

      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={submitUpdate}
        title="Editar Iglesia"
        subtitle={selectedChurch?.name}
        icon={<Church className="w-6 h-6" />}
        submitText={updateM.isPending ? 'Guardando...' : 'Guardar Cambios'}
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
              label="Estado"
              name="status"
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value as ChurchStatus })}
              options={statusOptions}
              required
            />
          </FormFieldGroup>

          <FormFieldGroup>
            <FormInput
              label="Ciudad"
              name="city"
              placeholder="Ej: Ciudad de Mexico"
              value={formData.city}
              onChange={(value) => setFormData({ ...formData, city: value })}
              icon={MapPin}
            />
            <FormInput
              label="Correo Electronico"
              name="email"
              type="email"
              placeholder="iglesia@ejemplo.com"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
              icon={Mail}
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

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => selectedChurch && deleteM.mutate(selectedChurch.id)}
        title="Eliminar Iglesia"
        message={`Esta seguro de que desea eliminar "${selectedChurch?.name}"? Esta accion no se puede deshacer y se perderan todos los datos asociados.`}
        confirmText={deleteM.isPending ? 'Eliminando...' : 'Si, Eliminar'}
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  )
}

export const Route = createFileRoute('/superadmin/churches')({
  component: SuperAdminIglesias
})
