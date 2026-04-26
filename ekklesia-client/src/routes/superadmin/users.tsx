import { createFileRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { ConfirmModal } from '@/components/dashboard/confirm-modal'
import { FormModal } from '@/components/dashboard/form-modal'
import { FormInput, FormSelect, FormFieldGroup } from '@/components/dashboard/form-input'
import { Button } from '@/components/ui/button'
import { useAuthStore, ROLE_LABELS } from '@/lib/auth/store'
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Shield,
  User,
  Church,
  MoreHorizontal,
  Edit2,
  Trash2,
  Eye,
  Crown
} from 'lucide-react'
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  type UserRow,
  type UserRole
} from '@/lib/api/users'
import { listChurches } from '@/lib/api/churches'

const roleBadgeColors: Record<UserRole, string> = {
  lead_pastor: 'bg-purple-100 text-purple-700 border-purple-200',
  pastor:      'bg-blue-100 text-blue-700 border-blue-200',
  assistant:   'bg-cyan-100 text-cyan-700 border-cyan-200'
}

function getRoleIcon(role: UserRole) {
  switch (role) {
    case 'lead_pastor': return <Crown className="w-4 h-4" />
    case 'pastor':      return <Shield className="w-4 h-4" />
    default:            return <User className="w-4 h-4" />
  }
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase()
}

interface FormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  password: string
  role: UserRole | ''
  church_id: number | ''
}

const emptyForm: FormData = {
  first_name: '', last_name: '', email: '', phone: '', password: '', role: '', church_id: ''
}

function SuperAdminUsuarios() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)
  const [activeMenu, setActiveMenu] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormData>(emptyForm)

  const usersQ    = useQuery({ queryKey: ['users'],    queryFn: () => listUsers({ perPage: 100 }) })
  const churchesQ = useQuery({ queryKey: ['churches'], queryFn: () => listChurches({ perPage: 100 }) })

  const createM = useMutation({
    mutationFn: createUser,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setIsCreateModalOpen(false); setFormData(emptyForm) }
  })
  const updateM = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof updateUser>[1] }) => updateUser(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setIsEditModalOpen(false); setFormData(emptyForm); setSelectedUser(null) }
  })
  const deleteM = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setIsDeleteModalOpen(false); setSelectedUser(null) }
  })

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return (usersQ.data ?? []).filter((u) => {
      const matchesQ = !q ||
        u.full_name.toLowerCase().includes(q) ||
        (u.email ?? '').toLowerCase().includes(q) ||
        (u.church_name ?? '').toLowerCase().includes(q)
      const matchesRole = roleFilter === 'all' || u.role === roleFilter
      return matchesQ && matchesRole
    })
  }, [usersQ.data, searchQuery, roleFilter])

  const churchOptions = (churchesQ.data ?? []).map((c) => ({ value: String(c.id), label: c.name }))
  const roleOptions: Array<{ value: UserRole; label: string }> = [
    { value: 'lead_pastor', label: ROLE_LABELS.lead_pastor },
    { value: 'pastor',      label: ROLE_LABELS.pastor },
    { value: 'assistant',   label: ROLE_LABELS.assistant }
  ]

  const openCreate = () => { setFormData(emptyForm); setIsCreateModalOpen(true) }
  const openEdit = (u: UserRow) => {
    setSelectedUser(u)
    setFormData({
      first_name: u.first_name,
      last_name:  u.last_name,
      email:      u.email ?? '',
      phone:      '',
      password:   '',
      role:       u.role,
      church_id:  u.church_id ?? ''
    })
    setIsEditModalOpen(true)
    setActiveMenu(null)
  }
  const openDelete = (u: UserRow) => { setSelectedUser(u); setIsDeleteModalOpen(true); setActiveMenu(null) }

  const submitCreate = () => {
    if (!formData.role) return
    createM.mutate({
      email:      formData.email,
      password:   formData.password,
      first_name: formData.first_name,
      last_name:  formData.last_name,
      phone:      formData.phone || undefined,
      role:       formData.role,
      church_id:  formData.church_id === '' ? undefined : Number(formData.church_id)
    })
  }
  const submitUpdate = () => {
    if (!selectedUser) return
    updateM.mutate({
      id: selectedUser.id,
      payload: {
        first_name: formData.first_name,
        last_name:  formData.last_name,
        phone:      formData.phone || undefined,
        church_id:  formData.church_id === '' ? undefined : Number(formData.church_id)
      }
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="superadmin" />

      <div className="lg:ml-64 transition-all duration-300">
        <Header
          title="Gestion de Usuarios"
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
                <Users className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{usersQ.data?.length ?? 0}</p>
                <p className="text-sm text-slate-500">Total Usuarios</p>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-300">
                {(['all', 'lead_pastor', 'pastor', 'assistant'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      roleFilter === role ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {role === 'all' ? 'Todos' : ROLE_LABELS[role]}
                  </button>
                ))}
              </div>

              <Button onClick={openCreate} variant="blue" className="gap-2">
                <Plus className="w-4 h-4" />
                Nuevo Usuario
              </Button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            {usersQ.isLoading && <div className="p-6 text-slate-500">Cargando...</div>}
            {usersQ.error && <div className="p-6 text-red-700">Error al cargar usuarios.</div>}
            {!usersQ.isLoading && !usersQ.error && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuario</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rol</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Iglesia</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center text-sm font-medium text-blue-900">
                              {getInitials(u.full_name)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{u.full_name}</p>
                              <p className="text-xs text-slate-500">{u.email ?? '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${roleBadgeColors[u.role]}`}>
                            {getRoleIcon(u.role)}
                            {ROLE_LABELS[u.role]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Church className="w-4 h-4 text-slate-400" />
                            {u.church_name ?? '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative flex justify-end">
                            <button
                              onClick={() => setActiveMenu(activeMenu === u.id ? null : u.id)}
                              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            <AnimatePresence>
                              {activeMenu === u.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-20"
                                >
                                  <button
                                    onClick={() => { console.log('View', u); setActiveMenu(null) }}
                                    className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                  >
                                    <Eye className="w-4 h-4" />
                                    Ver perfil
                                  </button>
                                  <button
                                    onClick={() => openEdit(u)}
                                    className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => openDelete(u)}
                                    className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Eliminar
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Sin resultados.</td></tr>
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
        title="Nuevo Usuario"
        subtitle="Crea un nuevo usuario en el sistema"
        icon={<User className="w-6 h-6" />}
        submitText={createM.isPending ? 'Creando...' : 'Crear Usuario'}
        size="lg"
      >
        <div className="space-y-4">
          <FormFieldGroup>
            <FormInput label="Nombre" name="first_name" placeholder="Juan" value={formData.first_name} onChange={(v) => setFormData({ ...formData, first_name: v })} icon={User} required />
            <FormInput label="Apellido" name="last_name" placeholder="Perez" value={formData.last_name} onChange={(v) => setFormData({ ...formData, last_name: v })} icon={User} required />
          </FormFieldGroup>
          <FormFieldGroup>
            <FormInput label="Correo Electronico" name="email" type="email" placeholder="usuario@ejemplo.com" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} icon={Mail} required />
            <FormInput label="Telefono" name="phone" type="tel" placeholder="+52 55 1234 5678" value={formData.phone} onChange={(v) => setFormData({ ...formData, phone: v })} icon={Phone} />
          </FormFieldGroup>
          <FormFieldGroup>
            <FormInput label="Contrasena" name="password" type="password" placeholder="Minimo 8 caracteres" value={formData.password} onChange={(v) => setFormData({ ...formData, password: v })} required />
            <FormSelect label="Rol" name="role" value={formData.role} onChange={(v) => setFormData({ ...formData, role: v as UserRole })} options={roleOptions} icon={Shield} required />
          </FormFieldGroup>
          <FormFieldGroup>
            <FormSelect label="Iglesia" name="church_id" value={String(formData.church_id)} onChange={(v) => setFormData({ ...formData, church_id: v ? Number(v) : '' })} options={churchOptions} icon={Church} />
          </FormFieldGroup>
          {createM.error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">Error al crear usuario.</div>}
        </div>
      </FormModal>

      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={submitUpdate}
        title="Editar Usuario"
        subtitle={selectedUser?.full_name}
        icon={<User className="w-6 h-6" />}
        submitText={updateM.isPending ? 'Guardando...' : 'Guardar Cambios'}
        size="lg"
      >
        <div className="space-y-4">
          <FormFieldGroup>
            <FormInput label="Nombre" name="first_name" placeholder="Juan" value={formData.first_name} onChange={(v) => setFormData({ ...formData, first_name: v })} icon={User} required />
            <FormInput label="Apellido" name="last_name" placeholder="Perez" value={formData.last_name} onChange={(v) => setFormData({ ...formData, last_name: v })} icon={User} required />
          </FormFieldGroup>
          <FormFieldGroup>
            <FormInput label="Telefono" name="phone" type="tel" placeholder="+52 55 1234 5678" value={formData.phone} onChange={(v) => setFormData({ ...formData, phone: v })} icon={Phone} />
            <FormSelect label="Iglesia" name="church_id" value={String(formData.church_id)} onChange={(v) => setFormData({ ...formData, church_id: v ? Number(v) : '' })} options={churchOptions} icon={Church} />
          </FormFieldGroup>
          {updateM.error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">Error al guardar cambios.</div>}
        </div>
      </FormModal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => selectedUser && deleteM.mutate(selectedUser.id)}
        title="Eliminar Usuario"
        message={`Esta seguro de que desea eliminar al usuario "${selectedUser?.full_name}"? Esta accion no se puede deshacer.`}
        confirmText={deleteM.isPending ? 'Eliminando...' : 'Si, Eliminar'}
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  )
}

export const Route = createFileRoute('/superadmin/users')({
  component: SuperAdminUsuarios
})
