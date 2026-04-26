import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { ConfirmModal } from '@/components/dashboard/confirm-modal'
import { FormModal } from '@/components/dashboard/form-modal'
import { FormInput, FormFieldGroup } from '@/components/dashboard/form-input'
import { Button } from '@/components/ui/button'
import { useAuthStore, ROLE_LABELS } from '@/lib/auth/store'
import {
  listMinistries,
  createMinistry,
  deleteMinistry,
  type MinistryRow
} from '@/lib/api/ministries'
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Globe,
  User,
  Mail,
  Phone,
  Lock,
  Trash2
} from 'lucide-react'

interface FormState {
  name: string
  country: string
  city: string
  pastor_first_name: string
  pastor_last_name: string
  pastor_email: string
  pastor_password: string
  pastor_phone: string
}

const emptyForm: FormState = {
  name: '',
  country: '',
  city: '',
  pastor_first_name: '',
  pastor_last_name: '',
  pastor_email: '',
  pastor_password: '',
  pastor_phone: ''
}

function SuperAdminMinisterios() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedMinistry, setSelectedMinistry] = useState<MinistryRow | null>(null)
  const [formData, setFormData] = useState<FormState>(emptyForm)

  const ministriesQ = useQuery({ queryKey: ['ministries'], queryFn: listMinistries })

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['ministries'] })
    qc.invalidateQueries({ queryKey: ['users'] })
    qc.invalidateQueries({ queryKey: ['stats'] })
  }

  const createM = useMutation({
    mutationFn: createMinistry,
    onSuccess: () => { invalidateAll(); setIsCreateModalOpen(false); setFormData(emptyForm) }
  })
  const deleteM = useMutation({
    mutationFn: deleteMinistry,
    onSuccess: () => { invalidateAll(); setIsDeleteModalOpen(false); setSelectedMinistry(null) }
  })

  const ministries = ministriesQ.data ?? []
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase()
    if (!q) return ministries
    return ministries.filter((m) =>
      m.name.toLowerCase().includes(q) ||
      (m.country ?? '').toLowerCase().includes(q) ||
      (m.city ?? '').toLowerCase().includes(q)
    )
  }, [ministries, searchQuery])

  const openCreate = () => { setFormData(emptyForm); setIsCreateModalOpen(true) }
  const openDelete = (m: MinistryRow) => { setSelectedMinistry(m); setIsDeleteModalOpen(true) }

  const submitCreate = () => {
    if (!formData.name || !formData.pastor_email || !formData.pastor_password) return
    createM.mutate({
      ministry: {
        name:    formData.name,
        country: formData.country || undefined,
        city:    formData.city || undefined
      },
      lead_pastor: {
        email:      formData.pastor_email,
        password:   formData.pastor_password,
        first_name: formData.pastor_first_name,
        last_name:  formData.pastor_last_name,
        phone:      formData.pastor_phone || undefined
      }
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="superadmin" />

      <div className="lg:ml-64 transition-all duration-300">
        <Header
          title="Gestion de Ministerios"
          userName={user?.full_name ?? ''}
          userRole={ROLE_LABELS[user?.role ?? ''] ?? ''}
        />

        <main className="p-6 bg-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
          >
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100">
                <Building2 className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{ministries.length}</p>
                <p className="text-sm text-slate-500">Total Ministerios</p>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar ministerios por nombre, pais o ciudad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
              />
            </div>

            <Button onClick={openCreate} variant="blue" className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Ministerio
            </Button>
          </div>

          {ministriesQ.error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              No se pudo cargar la lista de ministerios.
            </div>
          )}
          {(createM.error || deleteM.error) && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              No se pudo guardar el cambio. Verifica los datos e intenta de nuevo.
            </div>
          )}

          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            {ministriesQ.isLoading && <div className="p-6 text-slate-500">Cargando...</div>}
            {!ministriesQ.isLoading && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pais</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ciudad</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Slug</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-blue-700" />
                            </div>
                            <p className="text-sm font-medium text-slate-900">{m.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-slate-400" />
                            {m.country ?? '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {m.city ?? '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 font-mono">{m.slug}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openDelete(m)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                          {ministries.length === 0
                            ? 'Aun no hay ministerios. Crea el primero con el boton de arriba.'
                            : 'Sin resultados.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={submitCreate}
        title="Nuevo Ministerio"
        subtitle="Crea el ministerio y asigna su pastor principal en un solo paso."
        icon={<Building2 className="w-6 h-6" />}
        submitText={createM.isPending ? 'Creando...' : 'Crear Ministerio'}
        size="lg"
      >
        <div className="space-y-6">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-300/70">Ministerio</h3>
            <FormInput
              label="Nombre del Ministerio"
              name="name"
              placeholder="Ej: Ministerio Casa de Oracion"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              icon={Building2}
              required
            />
            <FormFieldGroup>
              <FormInput
                label="Pais"
                name="country"
                placeholder="Ej: Mexico"
                value={formData.country}
                onChange={(value) => setFormData({ ...formData, country: value })}
                icon={Globe}
              />
              <FormInput
                label="Ciudad"
                name="city"
                placeholder="Ej: Ciudad de Mexico"
                value={formData.city}
                onChange={(value) => setFormData({ ...formData, city: value })}
                icon={MapPin}
              />
            </FormFieldGroup>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-300/70">Pastor Principal</h3>
            <FormFieldGroup>
              <FormInput
                label="Nombre"
                name="pastor_first_name"
                placeholder="Pedro"
                value={formData.pastor_first_name}
                onChange={(value) => setFormData({ ...formData, pastor_first_name: value })}
                icon={User}
                required
              />
              <FormInput
                label="Apellido"
                name="pastor_last_name"
                placeholder="Lider"
                value={formData.pastor_last_name}
                onChange={(value) => setFormData({ ...formData, pastor_last_name: value })}
                icon={User}
                required
              />
            </FormFieldGroup>
            <FormFieldGroup>
              <FormInput
                label="Correo Electronico"
                name="pastor_email"
                type="email"
                placeholder="pastor@ejemplo.com"
                value={formData.pastor_email}
                onChange={(value) => setFormData({ ...formData, pastor_email: value })}
                icon={Mail}
                required
              />
              <FormInput
                label="Telefono"
                name="pastor_phone"
                type="tel"
                placeholder="+52 55 1234 5678"
                value={formData.pastor_phone}
                onChange={(value) => setFormData({ ...formData, pastor_phone: value })}
                icon={Phone}
              />
            </FormFieldGroup>
            <FormInput
              label="Contrasena"
              name="pastor_password"
              type="password"
              placeholder="Minimo 8 caracteres"
              value={formData.pastor_password}
              onChange={(value) => setFormData({ ...formData, pastor_password: value })}
              icon={Lock}
              required
            />
          </section>
        </div>
      </FormModal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => selectedMinistry && deleteM.mutate(selectedMinistry.id)}
        title="Eliminar Ministerio"
        message={`Esta seguro de que desea eliminar "${selectedMinistry?.name}"? Esta accion eliminara TAMBIEN sus iglesias, servicios, usuarios y reportes asociados. No se puede deshacer.`}
        confirmText={deleteM.isPending ? 'Eliminando...' : 'Si, Eliminar Todo'}
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  )
}

export const Route = createFileRoute('/superadmin/ministries')({
  component: SuperAdminMinisterios
})
