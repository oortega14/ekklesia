import { createFileRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { ConfirmModal } from "@/components/dashboard/confirm-modal"
import { FormModal } from "@/components/dashboard/form-modal"
import { FormInput, FormSelect, FormFieldGroup } from "@/components/dashboard/form-input"
import { Button } from "@/components/ui/button"
import { useAuthStore, ROLE_LABELS } from "@/lib/auth/store"
import {
  Users,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  Shield,
  User,
  Church,
  MoreHorizontal,
  Edit2,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Crown
} from "lucide-react"

// Mock data
const mockUsers = [
  { id: 1, name: "Carlos Mendez", email: "carlos@iglesia.com", role: "pastor_principal", church: "Iglesia Central", status: "active", lastLogin: "Hace 2 horas", avatar: null },
  { id: 2, name: "Maria Garcia", email: "maria@iglesia.com", role: "pastor_principal", church: "Iglesia del Norte", status: "active", lastLogin: "Hace 1 dia", avatar: null },
  { id: 3, name: "Juan Lopez", email: "juan@iglesia.com", role: "pastor", church: "Iglesia del Sur", status: "active", lastLogin: "Hace 3 horas", avatar: null },
  { id: 4, name: "Ana Rodriguez", email: "ana@iglesia.com", role: "pastor", church: "Iglesia Esperanza", status: "inactive", lastLogin: "Hace 5 dias", avatar: null },
  { id: 5, name: "Pedro Sanchez", email: "pedro@iglesia.com", role: "ayudante", church: "Iglesia Central", status: "active", lastLogin: "Hace 6 horas", avatar: null },
  { id: 6, name: "Laura Martinez", email: "laura@iglesia.com", role: "ayudante", church: "Iglesia del Norte", status: "active", lastLogin: "Hace 12 horas", avatar: null },
  { id: 7, name: "Roberto Torres", email: "roberto@iglesia.com", role: "pastor_principal", church: "Iglesia Gracia", status: "active", lastLogin: "Hace 1 hora", avatar: null },
  { id: 8, name: "Sofia Hernandez", email: "sofia@iglesia.com", role: "ayudante", church: "Iglesia del Sur", status: "pending", lastLogin: "Nunca", avatar: null },
]

const roleOptions = [
  { value: "pastor_principal", label: "Pastor Principal" },
  { value: "pastor", label: "Pastor" },
  { value: "ayudante", label: "Ayudante" },
]

const churchOptions = [
  { value: "central", label: "Iglesia Central" },
  { value: "norte", label: "Iglesia del Norte" },
  { value: "sur", label: "Iglesia del Sur" },
  { value: "esperanza", label: "Iglesia Esperanza" },
]

const roleLabels: Record<string, string> = {
  pastor_principal: "Pastor Principal",
  pastor: "Pastor",
  ayudante: "Ayudante"
}

const roleBadgeColors: Record<string, string> = {
  pastor_principal: "bg-purple-100 text-purple-700 border-purple-200",
  pastor: "bg-blue-100 text-blue-700 border-blue-200",
  ayudante: "bg-cyan-100 text-cyan-700 border-cyan-200"
}

function SuperAdminUsuarios() {
  const { user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null)
  const [activeMenu, setActiveMenu] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    church: "",
    password: ""
  })

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.church.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleDelete = (user: typeof mockUsers[0]) => {
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
    setActiveMenu(null)
  }

  const handleEdit = (user: typeof mockUsers[0]) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      phone: "",
      role: user.role,
      church: user.church.toLowerCase().replace(" ", ""),
      password: ""
    })
    setIsEditModalOpen(true)
    setActiveMenu(null)
  }

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", role: "", church: "", password: "" })
  }

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase()
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "pastor_principal": return <Crown className="w-4 h-4" />
      case "pastor": return <Shield className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
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
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: "Total Usuarios", value: mockUsers.length, icon: Users, color: "blue" },
              { label: "Activos", value: mockUsers.filter(u => u.status === "active").length, icon: UserCheck, color: "green" },
              { label: "Inactivos", value: mockUsers.filter(u => u.status === "inactive").length, icon: UserX, color: "red" },
              { label: "Pendientes", value: mockUsers.filter(u => u.status === "pending").length, icon: User, color: "amber" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex items-center gap-4"
              >
                <div className={`p-3 rounded-xl ${
                  stat.color === 'blue'
                    ? 'bg-blue-100'
                    : stat.color === 'green'
                      ? 'bg-emerald-100'
                      : stat.color === 'red'
                        ? 'bg-red-100'
                        : 'bg-amber-100'
                }`}>
                  <stat.icon className={`w-5 h-5 ${
                    stat.color === 'blue'
                      ? 'text-blue-700'
                      : stat.color === 'green'
                        ? 'text-emerald-700'
                        : stat.color === 'red'
                          ? 'text-red-700'
                          : 'text-amber-700'
                  }`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
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
              {/* Role Filter */}
              <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-300">
                {["all", "pastor_principal", "pastor", "ayudante"].map((role) => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      roleFilter === role
                        ? "bg-blue-100 text-blue-700"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {role === "all" ? "Todos" : roleLabels[role]}
                  </button>
                ))}
              </div>

              <Button
                onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
                variant="blue" className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Nuevo Usuario
              </Button>
            </div>
          </motion.div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Iglesia</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ultimo Acceso</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.03 }}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center text-sm font-medium text-blue-900">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${roleBadgeColors[user.role]}`}>
                          {getRoleIcon(user.role)}
                          {roleLabels[user.role]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Church className="w-4 h-4 text-slate-400" />
                          {user.church}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : user.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                        }`}>
                          {user.status === "active" ? "Activo" : user.status === "pending" ? "Pendiente" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {user.lastLogin}
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative flex justify-end">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </motion.button>

                          <AnimatePresence>
                            {activeMenu === user.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-20"
                              >
                                <button
                                  onClick={() => { console.log("View", user); setActiveMenu(null); }}
                                  className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  Ver perfil
                                </button>
                                <button
                                  onClick={() => handleEdit(user)}
                                  className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDelete(user)}
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
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </main>
      </div>

      {/* Create Modal */}
      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={() => console.log("Create user:", formData)}
        title="Nuevo Usuario"
        subtitle="Crea un nuevo usuario en el sistema"
        icon={<User className="w-6 h-6" />}
        submitText="Crear Usuario"
        size="lg"
      >
        <div className="space-y-4">
          <FormFieldGroup>
            <FormInput
              label="Nombre Completo"
              name="name"
              placeholder="Ej: Juan Perez"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              icon={User}
              required
            />
            <FormInput
              label="Correo Electronico"
              name="email"
              type="email"
              placeholder="usuario@ejemplo.com"
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
              label="Contrasena"
              name="password"
              type="password"
              placeholder="Minimo 8 caracteres"
              value={formData.password}
              onChange={(value) => setFormData({ ...formData, password: value })}
              required
            />
          </FormFieldGroup>

          <FormFieldGroup>
            <FormSelect
              label="Rol"
              name="role"
              value={formData.role}
              onChange={(value) => setFormData({ ...formData, role: value })}
              options={roleOptions}
              icon={Shield}
              required
            />
            <FormSelect
              label="Iglesia Asignada"
              name="church"
              value={formData.church}
              onChange={(value) => setFormData({ ...formData, church: value })}
              options={churchOptions}
              icon={Church}
              required
            />
          </FormFieldGroup>
        </div>
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={() => console.log("Update user:", formData)}
        title="Editar Usuario"
        subtitle={selectedUser?.name}
        icon={<User className="w-6 h-6" />}
        submitText="Guardar Cambios"
        size="lg"
      >
        <div className="space-y-4">
          <FormFieldGroup>
            <FormInput
              label="Nombre Completo"
              name="name"
              placeholder="Ej: Juan Perez"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              icon={User}
              required
            />
            <FormInput
              label="Correo Electronico"
              name="email"
              type="email"
              placeholder="usuario@ejemplo.com"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
              icon={Mail}
              required
            />
          </FormFieldGroup>

          <FormFieldGroup>
            <FormSelect
              label="Rol"
              name="role"
              value={formData.role}
              onChange={(value) => setFormData({ ...formData, role: value })}
              options={roleOptions}
              icon={Shield}
              required
            />
            <FormSelect
              label="Iglesia Asignada"
              name="church"
              value={formData.church}
              onChange={(value) => setFormData({ ...formData, church: value })}
              options={churchOptions}
              icon={Church}
              required
            />
          </FormFieldGroup>
        </div>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => console.log("Delete user:", selectedUser)}
        title="Eliminar Usuario"
        message={`Esta seguro de que desea eliminar al usuario "${selectedUser?.name}"? Esta accion no se puede deshacer.`}
        confirmText="Si, Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  )
}

export const Route = createFileRoute('/superadmin/users')({
  component: SuperAdminUsuarios
})
