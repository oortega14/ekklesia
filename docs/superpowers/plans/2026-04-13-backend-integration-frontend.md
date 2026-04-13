# Backend Integration — Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all mocked data in the Vite/React client with real API calls, role by role: superadmin → lead_pastor → pastor → assistant. Also connect the Header component to the Zustand auth store.

**Architecture:** No new abstraction layers — each route file calls `apiClient` directly, following the pattern already established in `superadmin/churches.tsx`. The auth store (`useAuthStore`) already exposes `user.full_name`, `user.role`, and `user.church_id`. A shared `ROLE_LABELS` constant is added to `src/lib/auth/store.ts`.

**Prerequisites:** The backend plan (`2026-04-13-backend-integration-backend.md`) must be fully executed before starting this plan. The API must have email/phone on churches, the stats endpoint, and the service presence flags.

**Tech Stack:** React, TypeScript, Zustand, Axios (via apiClient), TanStack Router, Tailwind CSS

**Compile check command** (no test runner configured — use TypeScript as the correctness gate):
```bash
cd ekklesia-client && npx tsc --noEmit
```

---

### Task 1: Export ROLE_LABELS from auth store

**Files:**
- Modify: `ekklesia-client/src/lib/auth/store.ts`

- [ ] **Step 1: Add ROLE_LABELS export**

In `src/lib/auth/store.ts`, add this constant after the `rolePath` function (around line 82):

```ts
export const ROLE_LABELS: Record<string, string> = {
  superadmin:  'Super Administrador',
  lead_pastor: 'Pastor Principal',
  pastor:      'Pastor',
  assistant:   'Ayudante',
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd ekklesia-client && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd ekklesia-client
git add src/lib/auth/store.ts
git commit -m "feat: export ROLE_LABELS from auth store"
```

---

### Task 2: Connect Header to auth store — superadmin pages

The Header component already accepts `userName` and `userRole` as string props. All superadmin pages hardcode these. We replace them with real values from the store.

**Files:**
- Modify: `ekklesia-client/src/routes/superadmin/index.tsx`
- Modify: `ekklesia-client/src/routes/superadmin/churches.tsx`
- Modify: `ekklesia-client/src/routes/superadmin/users.tsx`
- Modify: `ekklesia-client/src/routes/superadmin/reports.tsx`
- Modify: `ekklesia-client/src/routes/superadmin/statistics.tsx`

- [ ] **Step 1: Update superadmin/index.tsx Header**

At the top of the file, add to imports:
```tsx
import { useAuthStore, ROLE_LABELS } from "@/lib/auth/store"
```

Inside the `SuperAdminDashboard` component, add before the return:
```tsx
const { user } = useAuthStore()
```

Find every `<Header` in the file and replace the `userName` and `userRole` props:
```tsx
<Header
  title={t('superadminDashboard.title')}
  userName={user?.full_name ?? ''}
  userRole={ROLE_LABELS[user?.role ?? ''] ?? ''}
/>
```

- [ ] **Step 2: Update superadmin/churches.tsx Header**

Add to imports:
```tsx
import { useAuthStore, ROLE_LABELS } from "@/lib/auth/store"
```

Inside `SuperAdminIglesias`, add:
```tsx
const { user } = useAuthStore()
```

Replace the `<Header` props:
```tsx
<Header
  title="Gestion de Iglesias"
  userName={user?.full_name ?? ''}
  userRole={ROLE_LABELS[user?.role ?? ''] ?? ''}
/>
```

- [ ] **Step 3: Update superadmin/users.tsx Header**

Add to imports:
```tsx
import { useAuthStore, ROLE_LABELS } from "@/lib/auth/store"
```

Inside `SuperAdminUsuarios`, add:
```tsx
const { user } = useAuthStore()
```

Replace the `<Header` props:
```tsx
<Header
  title="Gestion de Usuarios"
  userName={user?.full_name ?? ''}
  userRole={ROLE_LABELS[user?.role ?? ''] ?? ''}
/>
```

- [ ] **Step 4: Update superadmin/reports.tsx and statistics.tsx Header (same pattern)**

For `reports.tsx`, add import + `const { user } = useAuthStore()` and replace:
```tsx
<Header
  title="Reportes y Estadisticas"
  userName={user?.full_name ?? ''}
  userRole={ROLE_LABELS[user?.role ?? ''] ?? ''}
/>
```

For `statistics.tsx`, same pattern — find the `<Header` and update it.

- [ ] **Step 5: TypeScript check**

```bash
cd ekklesia-client && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
cd ekklesia-client
git add src/routes/superadmin/
git commit -m "feat: connect superadmin Header to auth store"
```

---

### Task 3: Superadmin — update churches.tsx form (add email/phone, remove pastor select)

`superadmin/churches.tsx` is already connected to the API for list/create/edit/delete. However, the forms still have a hardcoded `pastorOptions` select (there is no pastor-church foreign key in the API) and are missing the new `email` and `phone` fields (added by the backend migration).

**Files:**
- Modify: `ekklesia-client/src/routes/superadmin/churches.tsx`

- [ ] **Step 1: Remove pastorOptions and the pastor FormSelect from both modals**

Delete the `pastorOptions` array (lines 66–72):
```tsx
// DELETE THIS ENTIRE BLOCK:
const pastorOptions = [
  { value: "carlos", label: "Carlos Mendez" },
  ...
]
```

In the Create modal form, delete the `FormSelect` for "Pastor Principal":
```tsx
// DELETE THIS:
<FormSelect
  label="Pastor Principal"
  name="pastor"
  value={formData.pastor}
  onChange={(value) => setFormData({ ...formData, pastor: value })}
  options={pastorOptions}
  icon={User}
  required
/>
```

Do the same in the Edit modal form.

Remove `pastor` from the `formData` state object and from `resetForm`:
```tsx
const [formData, setFormData] = useState({
  name: "",
  city: "",
  email: "",
  phone: "",
  address: "",
  notes: ""
})
```

- [ ] **Step 2: Add email and phone fields to the Create modal form**

In the Create modal, after the city/address `FormFieldGroup`, add:
```tsx
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
```

Include `email` and `phone` in the API payload inside the create `onSubmit`:
```tsx
await apiClient.post('/api/v1/churches', {
  church: {
    name:    formData.name,
    city:    formData.city || null,
    address: formData.address || null,
    email:   formData.email || null,
    phone:   formData.phone || null,
    status:  'pending',
  },
})
```

- [ ] **Step 3: Add email and phone fields to the Edit modal form**

Same fields added to the Edit modal. Pre-populate in `handleEdit`:
```tsx
const handleEdit = (church: ChurchRow) => {
  setSelectedChurch(church)
  setFormData({
    name:    church.name,
    city:    church.city,
    email:   church.email,
    phone:   church.phone,
    address: church.address,
    notes:   ""
  })
  setIsEditModalOpen(true)
}
```

Include `email` and `phone` in the edit `onSubmit` payload:
```tsx
await apiClient.put(`/api/v1/churches/${selectedChurch.id}`, {
  church: {
    name:    formData.name,
    city:    formData.city || null,
    address: formData.address || null,
    email:   formData.email || null,
    phone:   formData.phone || null,
    status:  selectedChurch.status,
  },
})
```

Also update `ChurchRow` and `mapChurch` to include `email` and `phone` from the API response:
```tsx
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
    id:      apiChurch.id,
    name:    apiChurch.name,
    city:    apiChurch.city || "Sin ciudad",
    address: apiChurch.address || "",
    email:   apiChurch.email || "",
    phone:   apiChurch.phone || "",
    status:  apiChurch.status,
    pastor:  "Sin asignar",
    members: 0,
    services: 0,
  }
}
```

Update `ChurchApi` to include the new fields:
```tsx
interface ChurchApi {
  id: number
  name: string
  city: string | null
  address: string | null
  email: string | null
  phone: string | null
  status: ChurchStatus
}
```

- [ ] **Step 4: TypeScript check + commit**

```bash
cd ekklesia-client && npx tsc --noEmit
```

Expected: No errors.

```bash
cd ekklesia-client
git add src/routes/superadmin/churches.tsx
git commit -m "feat: add email/phone to church forms, remove hardcoded pastor select"
```

---

### Task 4: Superadmin — connect users.tsx to API

Replaces the `mockUsers` array with real API calls. Splits the single `name` field into `first_name` + `last_name`. Loads church options dynamically from the API.

**Files:**
- Modify: `ekklesia-client/src/routes/superadmin/users.tsx`

- [ ] **Step 1: Replace mock data and add API types**

Remove the entire `mockUsers` array (lines 30–39) and `churchOptions` hardcoded array. Replace the top of the file types section (after imports) with:

```tsx
interface UserApi {
  id: number
  email: string
  first_name: string
  last_name: string
  full_name: string
  role: 'superadmin' | 'lead_pastor' | 'pastor' | 'assistant'
  church_id: number | null
  ministry_id: number | null
}

interface ChurchOption {
  id: number
  name: string
}
```

- [ ] **Step 2: Replace component state and fetch logic**

Inside `SuperAdminUsuarios`, replace the `useState` section with:

```tsx
const [users, setUsers] = useState<UserApi[]>([])
const [churches, setChurches] = useState<ChurchOption[]>([])
const [isLoading, setIsLoading] = useState(true)
const [isSaving, setIsSaving] = useState(false)
const [error, setError] = useState<string | null>(null)
const [searchQuery, setSearchQuery] = useState("")
const [roleFilter, setRoleFilter] = useState<string>("all")
const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
const [isEditModalOpen, setIsEditModalOpen] = useState(false)
const [selectedUser, setSelectedUser] = useState<UserApi | null>(null)
const [activeMenu, setActiveMenu] = useState<number | null>(null)

const [formData, setFormData] = useState({
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  role: "",
  church_id: "",
  password: ""
})
```

Add fetch functions after the state declarations:

```tsx
const fetchUsers = async () => {
  try {
    setError(null)
    setIsLoading(true)
    const [usersRes, churchesRes] = await Promise.all([
      apiClient.get('/api/v1/users'),
      apiClient.get('/api/v1/churches'),
    ])
    setUsers((usersRes.data?.users ?? []) as UserApi[])
    setChurches((churchesRes.data?.churches ?? []) as ChurchOption[])
  } catch {
    setError('No se pudo cargar la lista de usuarios.')
  } finally {
    setIsLoading(false)
  }
}

useEffect(() => { void fetchUsers() }, [])
```

- [ ] **Step 3: Update filteredUsers to use real data**

Replace the `filteredUsers` computation:

```tsx
const filteredUsers = users.filter(user => {
  const church = churches.find(c => c.id === user.church_id)
  const matchesSearch =
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (church?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  const matchesRole = roleFilter === "all" || user.role === roleFilter
  return matchesSearch && matchesRole
})
```

- [ ] **Step 4: Update role filter tabs to use API role names**

Find the filter tabs block and update to match API role values:

```tsx
{["all", "lead_pastor", "pastor", "assistant"].map((role) => (
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
```

Update `roleLabels` to use API role names:
```tsx
const roleLabels: Record<string, string> = {
  lead_pastor: "Pastor Principal",
  pastor:      "Pastor",
  assistant:   "Ayudante"
}
```

Update `roleBadgeColors`:
```tsx
const roleBadgeColors: Record<string, string> = {
  lead_pastor: "bg-purple-100 text-purple-700 border-purple-200",
  pastor:      "bg-blue-100 text-blue-700 border-blue-200",
  assistant:   "bg-cyan-100 text-cyan-700 border-cyan-200"
}
```

- [ ] **Step 5: Update the table rows**

In the table body, the mapped variable is now `filteredUsers` with `UserApi` items. Update the row rendering:

```tsx
{filteredUsers.map((u, index) => (
  <motion.tr key={u.id} ...>
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center text-sm font-medium text-blue-900">
          {getInitials(u.full_name)}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900">{u.full_name}</p>
          <p className="text-xs text-slate-500">{u.email}</p>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${roleBadgeColors[u.role] ?? ''}`}>
        {getRoleIcon(u.role)}
        {roleLabels[u.role] ?? u.role}
      </span>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-2 text-sm text-slate-700">
        <Church className="w-4 h-4 text-slate-400" />
        {churches.find(c => c.id === u.church_id)?.name ?? 'Sin iglesia'}
      </div>
    </td>
    {/* Remove status and lastLogin columns — not in API */}
    <td className="px-6 py-4">
      <div className="relative flex justify-end">
        ...actions menu with handleEdit(u) and handleDelete(u)...
      </div>
    </td>
  </motion.tr>
))}
```

Also remove the "Estado" and "Ultimo Acceso" `<th>` columns from the table header since those fields don't exist in the API.

- [ ] **Step 6: Update handleEdit and handleDelete**

```tsx
const handleEdit = (u: UserApi) => {
  setSelectedUser(u)
  setFormData({
    first_name: u.first_name,
    last_name:  u.last_name,
    email:      u.email,
    phone:      "",
    role:       u.role,
    church_id:  u.church_id?.toString() ?? "",
    password:   ""
  })
  setIsEditModalOpen(true)
  setActiveMenu(null)
}

const handleDelete = (u: UserApi) => {
  setSelectedUser(u)
  setIsDeleteModalOpen(true)
  setActiveMenu(null)
}
```

- [ ] **Step 7: Wire Create modal to API**

Replace `onSubmit={() => console.log("Create user:", formData)}` with:

```tsx
onSubmit={async () => {
  try {
    setIsSaving(true)
    setError(null)
    await apiClient.post('/api/v1/users', {
      user: {
        first_name: formData.first_name,
        last_name:  formData.last_name,
        email:      formData.email,
        password:   formData.password,
        phone:      formData.phone || null,
        role:       formData.role,
        church_id:  formData.church_id ? Number(formData.church_id) : null,
      },
    })
    setIsCreateModalOpen(false)
    resetForm()
    await fetchUsers()
  } catch {
    setError('No se pudo crear el usuario.')
  } finally {
    setIsSaving(false)
  }
}}
```

- [ ] **Step 8: Update Create modal form fields**

In the Create modal, replace the single `name` FormInput with two fields, and replace hardcoded `churchOptions` with dynamic ones:

```tsx
<FormFieldGroup>
  <FormInput
    label="Nombre"
    name="first_name"
    placeholder="Ej: Juan"
    value={formData.first_name}
    onChange={(value) => setFormData({ ...formData, first_name: value })}
    icon={User}
    required
  />
  <FormInput
    label="Apellido"
    name="last_name"
    placeholder="Ej: Perez"
    value={formData.last_name}
    onChange={(value) => setFormData({ ...formData, last_name: value })}
    icon={User}
    required
  />
</FormFieldGroup>

<FormFieldGroup>
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
    options={[
      { value: "lead_pastor", label: "Pastor Principal" },
      { value: "pastor",      label: "Pastor" },
      { value: "assistant",   label: "Ayudante" },
    ]}
    icon={Shield}
    required
  />
  <FormSelect
    label="Iglesia Asignada"
    name="church_id"
    value={formData.church_id}
    onChange={(value) => setFormData({ ...formData, church_id: value })}
    options={churches.map(c => ({ value: String(c.id), label: c.name }))}
    icon={Church}
    required
  />
</FormFieldGroup>
```

Also add a phone field:
```tsx
<FormInput
  label="Telefono"
  name="phone"
  type="tel"
  placeholder="+52 55 1234 5678"
  value={formData.phone}
  onChange={(value) => setFormData({ ...formData, phone: value })}
  icon={Phone}
/>
```

- [ ] **Step 9: Wire Edit modal to API**

Replace `onSubmit={() => console.log("Update user:", formData)}` with:

```tsx
onSubmit={async () => {
  if (!selectedUser) return
  try {
    setIsSaving(true)
    setError(null)
    await apiClient.put(`/api/v1/users/${selectedUser.id}`, {
      user: {
        first_name: formData.first_name,
        last_name:  formData.last_name,
        phone:      formData.phone || null,
        church_id:  formData.church_id ? Number(formData.church_id) : null,
      },
    })
    setIsEditModalOpen(false)
    setSelectedUser(null)
    await fetchUsers()
  } catch {
    setError('No se pudo actualizar el usuario.')
  } finally {
    setIsSaving(false)
  }
}}
```

Update Edit modal form to use `first_name`/`last_name` fields and dynamic church options (same structure as create, but no password field and email is read-only or omitted since the API's `user_update_params` doesn't include email).

- [ ] **Step 10: Wire Delete modal to API**

Replace `onConfirm={() => console.log("Delete user:", selectedUser)}` with:

```tsx
onConfirm={async () => {
  if (!selectedUser) return
  try {
    setIsSaving(true)
    setError(null)
    await apiClient.delete(`/api/v1/users/${selectedUser.id}`)
    setIsDeleteModalOpen(false)
    setSelectedUser(null)
    await fetchUsers()
  } catch {
    setError('No se pudo eliminar el usuario.')
  } finally {
    setIsSaving(false)
  }
}}
```

- [ ] **Step 11: Update stats strip**

The stats strip at the top currently references `mockUsers`. Update to use `users`:

```tsx
{ label: "Total Usuarios", value: users.length, icon: Users, color: "blue" },
{ label: "Lead Pastores", value: users.filter(u => u.role === "lead_pastor").length, icon: UserCheck, color: "green" },
{ label: "Pastores", value: users.filter(u => u.role === "pastor").length, icon: UserX, color: "red" },
{ label: "Ayudantes", value: users.filter(u => u.role === "assistant").length, icon: User, color: "amber" },
```

- [ ] **Step 12: Add loading and error states**

After the toolbar in the JSX, add:

```tsx
{isLoading && (
  <div className="py-16 text-center text-slate-500">Cargando usuarios...</div>
)}
{error && (
  <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
    {error}
  </div>
)}
```

Wrap the table in `{!isLoading && (...)}`

- [ ] **Step 13: TypeScript check**

```bash
cd ekklesia-client && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 14: Commit**

```bash
cd ekklesia-client
git add src/routes/superadmin/users.tsx
git commit -m "feat: connect superadmin users page to API"
```

---

### Task 5: Superadmin — connect dashboard (index.tsx) to stats

**Files:**
- Modify: `ekklesia-client/src/routes/superadmin/index.tsx`

- [ ] **Step 1: Add API import and stats state**

Add to imports:
```tsx
import { useEffect, useState } from "react"
import apiClient from "@/lib/api/client"
import { useAuthStore, ROLE_LABELS } from "@/lib/auth/store"
```

Inside `SuperAdminDashboard`, add after the `const { t }` line:

```tsx
const { user } = useAuthStore()

interface SuperadminStats {
  total_churches: number
  total_users: number
  services_this_month: number
  total_contributions_amount: number
  total_attendance: number
}

interface ChurchRow {
  id: number
  name: string
  city: string | null
  status: string
}

const [stats, setStats] = useState<SuperadminStats | null>(null)
const [churches, setChurches] = useState<ChurchRow[]>([])

useEffect(() => {
  void Promise.all([
    apiClient.get('/api/v1/stats').then(r => setStats(r.data as SuperadminStats)),
    apiClient.get('/api/v1/churches').then(r => setChurches((r.data?.churches ?? []) as ChurchRow[])),
  ])
}, [])
```

- [ ] **Step 2: Update statsData to use real values**

Replace the `statsData` array:

```tsx
const statsData = [
  {
    title: t('superadminDashboard.totalChurches'),
    value: stats?.total_churches ?? '—',
    icon: Church,
    trend: { value: 0, isPositive: true }
  },
  {
    title: t('superadminDashboard.activePastors'),
    value: stats?.total_users ?? '—',
    icon: Users,
    trend: { value: 0, isPositive: true }
  },
  {
    title: t('superadminDashboard.servicesThisMonth'),
    value: stats?.services_this_month ?? '—',
    icon: Calendar,
    trend: { value: 0, isPositive: true }
  },
  {
    title: t('superadminDashboard.totalIncome'),
    value: stats ? `$${stats.total_contributions_amount.toLocaleString()}` : '—',
    icon: Wallet,
    trend: { value: 0, isPositive: true }
  },
]
```

- [ ] **Step 3: Replace hardcoded churchesData table with real churches**

Find `const churchesData = [...]` and delete it.

Update the `<DataTable` call to use the `churches` state:

```tsx
<DataTable
  title={t('superadminDashboard.registeredChurches')}
  columns={columns}
  data={churches.map(c => ({
    nombre: c.name,
    pastor: 'Sin asignar',
    miembros: '—',
    ciudad: c.city ?? '—',
    estado: c.status,
  }))}
  onView={(row) => console.log("View", row)}
  onEdit={(row) => console.log("Edit", row)}
  onDelete={(row) => console.log("Delete", row)}
/>
```

- [ ] **Step 4: TypeScript check**

```bash
cd ekklesia-client && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
cd ekklesia-client
git add src/routes/superadmin/index.tsx
git commit -m "feat: connect superadmin dashboard to stats and churches API"
```

---

### Task 6: Superadmin — connect reports.tsx and statistics.tsx to stats

**Files:**
- Modify: `ekklesia-client/src/routes/superadmin/reports.tsx`
- Modify: `ekklesia-client/src/routes/superadmin/statistics.tsx`

- [ ] **Step 1: Update reports.tsx — replace KPI values with stats**

Add imports:
```tsx
import { useEffect, useState } from "react"
import apiClient from "@/lib/api/client"
import { useAuthStore, ROLE_LABELS } from "@/lib/auth/store"
```

Inside `SuperAdminReportes`, add:
```tsx
const { user } = useAuthStore()

interface SuperadminStats {
  total_churches: number
  total_users: number
  services_this_month: number
  total_contributions_amount: number
  total_attendance: number
}

const [stats, setStats] = useState<SuperadminStats | null>(null)

useEffect(() => {
  void apiClient.get('/api/v1/stats').then(r => setStats(r.data as SuperadminStats))
}, [])
```

Replace the `kpis` array:
```tsx
const kpis = [
  {
    label: "Asistencia Total",
    value: stats ? stats.total_attendance.toLocaleString() : '—',
    trend: "up", icon: Users, description: "Acumulado"
  },
  {
    label: "Ingresos Totales",
    value: stats ? `$${stats.total_contributions_amount.toLocaleString()}` : '—',
    trend: "up", icon: Wallet, description: "Acumulado"
  },
  {
    label: "Servicios este Mes",
    value: stats ? String(stats.services_this_month) : '—',
    trend: "up", icon: TrendingUp, description: "Este mes"
  },
  {
    label: "Iglesias Activas",
    value: stats ? String(stats.total_churches) : '—',
    trend: "neutral", icon: Church, description: "Registradas"
  },
]
```

Update `<Header` to use auth store (same pattern as Task 2).

- [ ] **Step 2: Update statistics.tsx — replace KPI values**

Add same imports and stats fetch. Replace the `kpis` array values with stats fields using the same mapping as reports.tsx. The chart data arrays remain static (no time-series API available). Update `<Header` to use auth store.

- [ ] **Step 3: TypeScript check**

```bash
cd ekklesia-client && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
cd ekklesia-client
git add src/routes/superadmin/reports.tsx src/routes/superadmin/statistics.tsx
git commit -m "feat: connect superadmin reports/statistics KPIs to stats API"
```

---

### Task 7: Lead Pastor — connect Header and churches.tsx

**Files:**
- Modify: `ekklesia-client/src/routes/lead-pastor/churches.tsx`

- [ ] **Step 1: Replace mockChurches with API call**

Remove the `mockChurches` array. Add imports:
```tsx
import { useEffect, useState } from "react"
import apiClient from "@/lib/api/client"
import { useAuthStore, ROLE_LABELS } from "@/lib/auth/store"
```

Add the same types as superadmin/churches uses (`ChurchApi`, `ChurchRow`, `mapChurch`). The API scopes churches to the lead pastor's ministry automatically via acts_as_tenant.

Add state and fetch:
```tsx
const { user } = useAuthStore()
const [churches, setChurches] = useState<ChurchRow[]>([])
const [isLoading, setIsLoading] = useState(true)
const [isSaving, setIsSaving] = useState(false)
const [error, setError] = useState<string | null>(null)

const fetchChurches = async () => {
  try {
    setError(null)
    setIsLoading(true)
    const response = await apiClient.get('/api/v1/churches')
    const apiChurches = (response.data?.churches ?? []) as ChurchApi[]
    setChurches(apiChurches.map(mapChurch))
  } catch {
    setError('No se pudo cargar las iglesias.')
  } finally {
    setIsLoading(false)
  }
}

useEffect(() => { void fetchChurches() }, [])
```

- [ ] **Step 2: Wire create/edit/delete modals to API**

Wire create modal `onSubmit`:
```tsx
onSubmit={async () => {
  try {
    setIsSaving(true)
    setError(null)
    await apiClient.post('/api/v1/churches', {
      church: { name: formData.name, city: formData.city || null, address: formData.address || null, status: 'pending' },
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
```

Wire edit modal `onSubmit`:
```tsx
onSubmit={async () => {
  if (!selectedChurch) return
  try {
    setIsSaving(true)
    setError(null)
    await apiClient.put(`/api/v1/churches/${selectedChurch.id}`, {
      church: { name: formData.name, city: formData.city || null, address: formData.address || null },
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
```

Wire delete modal `onConfirm`:
```tsx
onConfirm={async () => {
  if (!selectedChurch) return
  try {
    setIsSaving(true)
    setError(null)
    await apiClient.delete(`/api/v1/churches/${selectedChurch.id}`)
    setIsDeleteModalOpen(false)
    setSelectedChurch(null)
    await fetchChurches()
  } catch {
    setError('No se pudo eliminar la iglesia.')
  } finally {
    setIsSaving(false)
  }
}}
```

- [ ] **Step 3: Update Header, fix filteredChurches, add loading/error states**

Update `<Header` to use auth store (same pattern as superadmin tasks).

Update `filteredChurches` to reference the `churches` state instead of `mockChurches`.

Add loading and error display in JSX (same pattern as superadmin/churches.tsx).

Update stats strip counters to reference `churches` state.

- [ ] **Step 4: TypeScript check**

```bash
cd ekklesia-client && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
cd ekklesia-client
git add src/routes/lead-pastor/churches.tsx
git commit -m "feat: connect lead-pastor churches page to API"
```

---

### Task 8: Lead Pastor — connect pastors.tsx to API

**Files:**
- Modify: `ekklesia-client/src/routes/lead-pastor/pastors.tsx`

- [ ] **Step 1: Remove mockPastors, add API types and state**

Remove `mockPastors` array. Add imports (same as previous tasks: `useEffect`, `useState`, `apiClient`, `useAuthStore`, `ROLE_LABELS`).

Add types:
```tsx
interface PastorApi {
  id: number
  email: string
  first_name: string
  last_name: string
  full_name: string
  role: string
  church_id: number | null
  ministry_id: number | null
}

interface ChurchOption {
  id: number
  name: string
}
```

Add state and fetch:
```tsx
const { user } = useAuthStore()
const [allUsers, setAllUsers] = useState<PastorApi[]>([])
const [churches, setChurches] = useState<ChurchOption[]>([])
const [isLoading, setIsLoading] = useState(true)
const [isSaving, setIsSaving] = useState(false)
const [error, setError] = useState<string | null>(null)

const fetchData = async () => {
  try {
    setError(null)
    setIsLoading(true)
    const [usersRes, churchesRes] = await Promise.all([
      apiClient.get('/api/v1/users'),
      apiClient.get('/api/v1/churches'),
    ])
    setAllUsers((usersRes.data?.users ?? []) as PastorApi[])
    setChurches((churchesRes.data?.churches ?? []) as ChurchOption[])
  } catch {
    setError('No se pudo cargar la lista de pastores.')
  } finally {
    setIsLoading(false)
  }
}

useEffect(() => { void fetchData() }, [])

// Filter to pastors only (client-side)
const pastors = allUsers.filter(u => u.role === 'pastor')
```

- [ ] **Step 2: Update filteredPastors to use real data**

Replace `mockPastors.filter(...)` with:
```tsx
const filteredPastors = pastors.filter(pastor =>
  pastor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  pastor.email.toLowerCase().includes(searchQuery.toLowerCase())
)
```

- [ ] **Step 3: Update handleDelete and handleEdit**

```tsx
const handleDelete = (pastor: PastorApi) => {
  setSelectedPastor(pastor)
  setIsDeleteModalOpen(true)
  setActiveMenu(null)
}

const handleEdit = (pastor: PastorApi) => {
  setSelectedPastor(pastor)
  setFormData({
    first_name: pastor.first_name,
    last_name:  pastor.last_name,
    email:      pastor.email,
    phone:      "",
    church_id:  pastor.church_id?.toString() ?? "",
    password:   ""
  })
  setIsEditModalOpen(true)
  setActiveMenu(null)
}
```

Update `formData` state shape:
```tsx
const [formData, setFormData] = useState({
  first_name: "", last_name: "", email: "", phone: "", church_id: "", password: ""
})
```

- [ ] **Step 4: Wire create modal to API**

Replace `onSubmit={() => console.log("Create:", formData)}` with:
```tsx
onSubmit={async () => {
  try {
    setIsSaving(true)
    setError(null)
    await apiClient.post('/api/v1/users', {
      user: {
        first_name: formData.first_name,
        last_name:  formData.last_name,
        email:      formData.email,
        password:   formData.password,
        phone:      formData.phone || null,
        role:       'pastor',
        church_id:  formData.church_id ? Number(formData.church_id) : null,
      },
    })
    setIsCreateModalOpen(false)
    resetForm()
    await fetchData()
  } catch {
    setError('No se pudo crear el pastor.')
  } finally {
    setIsSaving(false)
  }
}}
```

Update the create form fields:
- Replace single `name` field with `first_name` + `last_name` fields
- Replace hardcoded church select options with `churches.map(c => ({ value: String(c.id), label: c.name }))`

- [ ] **Step 5: Wire edit and delete modals to API**

Edit `onSubmit`:
```tsx
onSubmit={async () => {
  if (!selectedPastor) return
  try {
    setIsSaving(true)
    setError(null)
    await apiClient.put(`/api/v1/users/${selectedPastor.id}`, {
      user: {
        first_name: formData.first_name,
        last_name:  formData.last_name,
        phone:      formData.phone || null,
        church_id:  formData.church_id ? Number(formData.church_id) : null,
      },
    })
    setIsEditModalOpen(false)
    setSelectedPastor(null)
    await fetchData()
  } catch {
    setError('No se pudo actualizar el pastor.')
  } finally {
    setIsSaving(false)
  }
}}
```

Delete `onConfirm`:
```tsx
onConfirm={async () => {
  if (!selectedPastor) return
  try {
    setIsSaving(true)
    setError(null)
    await apiClient.delete(`/api/v1/users/${selectedPastor.id}`)
    setIsDeleteModalOpen(false)
    setSelectedPastor(null)
    await fetchData()
  } catch {
    setError('No se pudo eliminar el pastor.')
  } finally {
    setIsSaving(false)
  }
}}
```

- [ ] **Step 6: Update stats strip, Header, and table rows**

Stats strip uses `pastors` (filtered list):
```tsx
{ label: "Total Pastores", value: pastors.length, ... },
{ label: "Activos", value: pastors.length, ... },
```

Update table rows to use `PastorApi` fields (`u.full_name`, `u.email`, church name looked up via `churches.find(c => c.id === u.church_id)?.name`).

Update `<Header` to use auth store.

Add loading and error states in JSX.

- [ ] **Step 7: TypeScript check**

```bash
cd ekklesia-client && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 8: Commit**

```bash
cd ekklesia-client
git add src/routes/lead-pastor/pastors.tsx
git commit -m "feat: connect lead-pastor pastors page to API"
```

---

### Task 9: Lead Pastor — connect services.tsx to API

**Files:**
- Modify: `ekklesia-client/src/routes/lead-pastor/services.tsx`

- [ ] **Step 1: Remove mockServices, add API types and state**

Remove `mockServices`. Add imports. Add types:
```tsx
interface ServiceApi {
  id: number
  church_id: number
  service_type: string
  scheduled_at: string
  status: 'scheduled' | 'completed' | 'cancelled'
  has_attendance_report: boolean
  has_contributions: boolean
}

interface ChurchOption {
  id: number
  name: string
}
```

Add state and fetch:
```tsx
const { user } = useAuthStore()
const [services, setServices] = useState<ServiceApi[]>([])
const [churches, setChurches] = useState<ChurchOption[]>([])
const [isLoading, setIsLoading] = useState(true)
const [isSaving, setIsSaving] = useState(false)
const [error, setError] = useState<string | null>(null)

const fetchData = async () => {
  try {
    setError(null)
    setIsLoading(true)
    const [servicesRes, churchesRes] = await Promise.all([
      apiClient.get('/api/v1/services'),
      apiClient.get('/api/v1/churches'),
    ])
    setServices((servicesRes.data?.services ?? []) as ServiceApi[])
    setChurches((churchesRes.data?.churches ?? []) as ChurchOption[])
  } catch {
    setError('No se pudo cargar los servicios.')
  } finally {
    setIsLoading(false)
  }
}

useEffect(() => { void fetchData() }, [])
```

- [ ] **Step 2: Update filteredServices and UI data**

```tsx
const filteredServices = services.filter(s => {
  const church = churches.find(c => c.id === s.church_id)
  return (
    s.service_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (church?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )
})
```

Update the stats strip:
```tsx
{ label: "Total Servicios", value: services.length },
{ label: "Esta Semana", value: services.length },
{ label: "Iglesias", value: new Set(services.map(s => s.church_id)).size },
```

- [ ] **Step 3: Wire create modal to API**

Replace `onSubmit={() => console.log("Create:", formData)}`:
```tsx
onSubmit={async () => {
  try {
    setIsSaving(true)
    setError(null)
    await apiClient.post('/api/v1/services', {
      service: {
        church_id:    Number(formData.church_id),
        service_type: formData.service_type,
        scheduled_at: formData.scheduled_at,
        status:       'scheduled',
      },
    })
    setIsCreateModalOpen(false)
    resetForm()
    await fetchData()
  } catch {
    setError('No se pudo crear el servicio.')
  } finally {
    setIsSaving(false)
  }
}}
```

Update `formData` to:
```tsx
const [formData, setFormData] = useState({
  church_id: "", service_type: "", scheduled_at: ""
})
```

Update the create form to use `churches.map(c => ({ value: String(c.id), label: c.name }))` for the church select.

- [ ] **Step 4: Wire edit modal to API**

```tsx
onSubmit={async () => {
  if (!selectedService) return
  try {
    setIsSaving(true)
    setError(null)
    await apiClient.put(`/api/v1/services/${selectedService.id}`, {
      service: {
        church_id:    Number(formData.church_id),
        service_type: formData.service_type,
        scheduled_at: formData.scheduled_at,
        status:       selectedService.status,
      },
    })
    setIsEditModalOpen(false)
    setSelectedService(null)
    await fetchData()
  } catch {
    setError('No se pudo actualizar el servicio.')
  } finally {
    setIsSaving(false)
  }
}}
```

- [ ] **Step 5: Wire delete modal, update Header and service rows**

Delete `onConfirm`:
```tsx
onConfirm={async () => {
  if (!selectedService) return
  try {
    setIsSaving(true)
    setError(null)
    await apiClient.delete(`/api/v1/services/${selectedService.id}`)
    setIsDeleteModalOpen(false)
    setSelectedService(null)
    await fetchData()
  } catch {
    setError('No se pudo eliminar el servicio.')
  } finally {
    setIsSaving(false)
  }
}}
```

Update service rows to show:
- `s.service_type` instead of `service.type`
- `new Date(s.scheduled_at).toLocaleDateString('es-MX')` for date display
- `churches.find(c => c.id === s.church_id)?.name` for church name

Update `<Header` to use auth store. Add loading/error states.

- [ ] **Step 6: TypeScript check + commit**

```bash
cd ekklesia-client && npx tsc --noEmit
```

```bash
cd ekklesia-client
git add src/routes/lead-pastor/services.tsx
git commit -m "feat: connect lead-pastor services page to API"
```

---

### Task 10: Lead Pastor — connect index.tsx and statistics.tsx to stats

**Files:**
- Modify: `ekklesia-client/src/routes/lead-pastor/index.tsx`
- Modify: `ekklesia-client/src/routes/lead-pastor/statistics.tsx`

- [ ] **Step 1: Connect lead-pastor/index.tsx**

Add imports (`useEffect`, `useState`, `apiClient`, `useAuthStore`, `ROLE_LABELS`).

Inside the component:
```tsx
const { user } = useAuthStore()

interface LeadPastorStats {
  churches_count: number
  pastors_count: number
  services_this_month: number
  total_attendance: number
  total_contributions: number
}

interface ChurchItem {
  id: number
  name: string
  city: string | null
  status: string
}

const [stats, setStats] = useState<LeadPastorStats | null>(null)
const [churches, setChurches] = useState<ChurchItem[]>([])

useEffect(() => {
  void Promise.all([
    apiClient.get('/api/v1/stats').then(r => setStats(r.data as LeadPastorStats)),
    apiClient.get('/api/v1/churches').then(r => setChurches((r.data?.churches ?? []) as ChurchItem[])),
  ])
}, [])
```

Replace the hardcoded `statsData` array:
```tsx
const statsData = [
  { title: "Mis Iglesias", value: stats?.churches_count ?? '—', icon: Church, trend: { value: 0, isPositive: true } },
  { title: "Pastores a Cargo", value: stats?.pastors_count ?? '—', icon: Users, trend: { value: 0, isPositive: true } },
  { title: "Servicios este Mes", value: stats?.services_this_month ?? '—', icon: Calendar, trend: { value: 0, isPositive: true } },
  { title: "Recaudacion Mensual", value: stats ? `$${stats.total_contributions.toLocaleString()}` : '—', icon: Wallet, trend: { value: 0, isPositive: true } },
]
```

Replace hardcoded churches list with `churches` state data.

Update `<Header` to use auth store.

- [ ] **Step 2: Connect lead-pastor/statistics.tsx**

Add same imports and stats fetch. Replace the hardcoded KPI card values:
```tsx
{ title: "Total Members", value: stats ? String(stats.total_attendance) : '—', ... },
{ title: "My Churches", value: stats ? String(stats.churches_count) : '—', ... },
{ title: "Monthly Revenue", value: stats ? `$${stats.total_contributions.toLocaleString()}` : '—', ... },
{ title: "Weekly Services", value: stats ? String(stats.services_this_month) : '—', ... },
```

Update `<Header` to use auth store. Leave chart data arrays static.

- [ ] **Step 3: TypeScript check + commit**

```bash
cd ekklesia-client && npx tsc --noEmit
```

```bash
cd ekklesia-client
git add src/routes/lead-pastor/index.tsx src/routes/lead-pastor/statistics.tsx
git commit -m "feat: connect lead-pastor dashboard and statistics to stats API"
```

---

### Task 11: Pastor — connect assistants.tsx to API

**Files:**
- Modify: `ekklesia-client/src/routes/pastor/assistants.tsx`

- [ ] **Step 1: Remove mockHelpers, add state and fetch**

Remove `mockHelpers`. Add imports. Add type:
```tsx
interface AssistantApi {
  id: number
  email: string
  first_name: string
  last_name: string
  full_name: string
  role: string
  church_id: number | null
}
```

Add state and fetch:
```tsx
const { user } = useAuthStore()
const [allUsers, setAllUsers] = useState<AssistantApi[]>([])
const [isLoading, setIsLoading] = useState(true)
const [isSaving, setIsSaving] = useState(false)
const [error, setError] = useState<string | null>(null)

const fetchData = async () => {
  try {
    setError(null)
    setIsLoading(true)
    const res = await apiClient.get('/api/v1/users')
    setAllUsers((res.data?.users ?? []) as AssistantApi[])
  } catch {
    setError('No se pudo cargar los ayudantes.')
  } finally {
    setIsLoading(false)
  }
}

useEffect(() => { void fetchData() }, [])

const helpers = allUsers.filter(u => u.role === 'assistant')
```

- [ ] **Step 2: Update filteredHelpers, stats strip, and table rows**

```tsx
const filteredHelpers = helpers.filter(h =>
  h.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  h.email.toLowerCase().includes(searchQuery.toLowerCase())
)
```

Stats strip:
```tsx
{ label: "Total Ayudantes", value: helpers.length, icon: Users },
{ label: "Activos", value: helpers.length, icon: CheckCircle2 },
{ label: "Pendientes", value: 0, icon: Clock },
```

- [ ] **Step 3: Wire create modal to API**

```tsx
onSubmit={async () => {
  try {
    setIsSaving(true)
    setError(null)
    await apiClient.post('/api/v1/users', {
      user: {
        first_name: formData.first_name,
        last_name:  formData.last_name,
        email:      formData.email,
        password:   formData.password,
        phone:      formData.phone || null,
        role:       'assistant',
        church_id:  user?.church_id,  // pastor's own church
      },
    })
    setIsCreateModalOpen(false)
    resetForm()
    await fetchData()
  } catch {
    setError('No se pudo crear el ayudante.')
  } finally {
    setIsSaving(false)
  }
}}
```

Update `formData`:
```tsx
const [formData, setFormData] = useState({
  first_name: "", last_name: "", email: "", phone: "", password: ""
})
```

Update create modal form to use `first_name` + `last_name` fields instead of single `name`.

- [ ] **Step 4: Wire edit and delete modals to API**

Edit `onSubmit`:
```tsx
onSubmit={async () => {
  if (!selectedHelper) return
  try {
    setIsSaving(true)
    setError(null)
    await apiClient.put(`/api/v1/users/${selectedHelper.id}`, {
      user: {
        first_name: formData.first_name,
        last_name:  formData.last_name,
        phone:      formData.phone || null,
      },
    })
    setIsEditModalOpen(false)
    setSelectedHelper(null)
    await fetchData()
  } catch {
    setError('No se pudo actualizar el ayudante.')
  } finally {
    setIsSaving(false)
  }
}}
```

Delete `onConfirm`:
```tsx
onConfirm={async () => {
  if (!selectedHelper) return
  try {
    setIsSaving(true)
    setError(null)
    await apiClient.delete(`/api/v1/users/${selectedHelper.id}`)
    setIsDeleteModalOpen(false)
    setSelectedHelper(null)
    await fetchData()
  } catch {
    setError('No se pudo eliminar el ayudante.')
  } finally {
    setIsSaving(false)
  }
}}
```

- [ ] **Step 5: Update Header, add loading/error, TypeScript check, commit**

Update `<Header` to use auth store. Add loading/error states in JSX.

```bash
cd ekklesia-client && npx tsc --noEmit
```

```bash
cd ekklesia-client
git add src/routes/pastor/assistants.tsx
git commit -m "feat: connect pastor assistants page to API"
```

---

### Task 12: Pastor — connect reports.tsx to API (services + attendance + contributions)

This is the most complex page. It replaces `generateMockServices()` with real services, and wires the attendance and contribution submission forms to the API.

**Files:**
- Modify: `ekklesia-client/src/routes/pastor/reports.tsx`

- [ ] **Step 1: Remove mock data, add API types**

Remove `generateMockServices()`, `mockServices`, and all mock-derived computations. Add imports.

Add types:
```tsx
interface ServiceWithFlags {
  id: number
  church_id: number
  service_type: string
  scheduled_at: string
  status: 'scheduled' | 'completed' | 'cancelled'
  has_attendance_report: boolean
  has_contributions: boolean
}

interface AttendanceFormData {
  adults: string
  youth: string
  children: string
  notes: string
}

interface ContributionFormData {
  type: 'Tithe' | 'Offering' | 'Donation' | 'Firstfruit' | 'Covenant'
  amount: string
  currency: string
  notes: string
}
```

- [ ] **Step 2: Add state and fetch**

```tsx
const { user } = useAuthStore()
const [services, setServices] = useState<ServiceWithFlags[]>([])
const [isLoading, setIsLoading] = useState(true)
const [isSaving, setIsSaving] = useState(false)
const [error, setError] = useState<string | null>(null)

// Which service the modals are opened for
const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null)

const [attendanceForm, setAttendanceForm] = useState<AttendanceFormData>({
  adults: "", youth: "", children: "", notes: ""
})

const [contributionForm, setContributionForm] = useState<ContributionFormData>({
  type: 'Offering', amount: "", currency: "MXN", notes: ""
})

const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)
const [isContributionModalOpen, setIsContributionModalOpen] = useState(false)

const fetchServices = async () => {
  try {
    setError(null)
    setIsLoading(true)
    const res = await apiClient.get('/api/v1/services')
    setServices((res.data?.services ?? []) as ServiceWithFlags[])
  } catch {
    setError('No se pudo cargar los servicios.')
  } finally {
    setIsLoading(false)
  }
}

useEffect(() => { void fetchServices() }, [])
```

- [ ] **Step 3: Replace filter logic**

The mock had a `dateFilter` state. Keep the UI tab ("Esta Semana", "Este Mes", etc.) but filter the real services:

```tsx
const filteredServices = services.filter(service => {
  const date = new Date(service.scheduled_at)
  const now = new Date()
  if (dateFilter === 'week') {
    const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7)
    return date >= weekAgo
  }
  if (dateFilter === 'month') {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }
  return true // 'all'
})
```

- [ ] **Step 4: Replace computed stats with real data**

```tsx
const pendingAttendance = services.filter(s => !s.has_attendance_report).length
const pendingContributions = services.filter(s => !s.has_contributions).length
const completedAttendance = services.filter(s => s.has_attendance_report).length
const completedContributions = services.filter(s => s.has_contributions).length
```

(Remove `totalAttendance`, `totalTithes`, `totalOfferings` — those require fetching report details, which is out of scope for this task.)

- [ ] **Step 5: Wire attendance modal to API**

Find the "submit attendance" button/modal `onSubmit` and replace with:

```tsx
const handleSubmitAttendance = async () => {
  if (!selectedServiceId) return
  try {
    setIsSaving(true)
    setError(null)
    await apiClient.post('/api/v1/attendance_reports', {
      attendance_report: {
        service_id: selectedServiceId,
        adults:     Number(attendanceForm.adults),
        youth:      Number(attendanceForm.youth),
        children:   Number(attendanceForm.children),
        notes:      attendanceForm.notes || null,
      },
    })
    setIsAttendanceModalOpen(false)
    setAttendanceForm({ adults: "", youth: "", children: "", notes: "" })
    await fetchServices()
  } catch {
    setError('No se pudo guardar el reporte de asistencia.')
  } finally {
    setIsSaving(false)
  }
}
```

Wire the attendance modal open button to set `selectedServiceId` and open the modal:
```tsx
onClick={() => {
  setSelectedServiceId(service.id)
  setIsAttendanceModalOpen(true)
}}
```

- [ ] **Step 6: Wire contribution modal to API**

```tsx
const handleSubmitContribution = async () => {
  if (!selectedServiceId) return
  try {
    setIsSaving(true)
    setError(null)
    await apiClient.post('/api/v1/contributions', {
      contribution: {
        type:       contributionForm.type,
        service_id: selectedServiceId,
        amount:     Number(contributionForm.amount),
        currency:   contributionForm.currency,
        notes:      contributionForm.notes || null,
      },
    })
    setIsContributionModalOpen(false)
    setContributionForm({ type: 'Offering', amount: "", currency: "MXN", notes: "" })
    await fetchServices()
  } catch {
    setError('No se pudo guardar el reporte de contribucion.')
  } finally {
    setIsSaving(false)
  }
}
```

- [ ] **Step 7: Update service card rendering**

Each service card should use `ServiceWithFlags` fields:
- Date: `new Date(service.scheduled_at).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })`
- Time: `new Date(service.scheduled_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })`
- Status badge for `service.has_attendance_report` and `service.has_contributions`
- Disable "submit attendance" button when `service.has_attendance_report === true`
- Disable "submit contribution" button when `service.has_contributions === true`

- [ ] **Step 8: Update Header, add loading/error, TypeScript check, commit**

Update `<Header` to use auth store. Add loading/error states.

```bash
cd ekklesia-client && npx tsc --noEmit
```

```bash
cd ekklesia-client
git add src/routes/pastor/reports.tsx
git commit -m "feat: connect pastor reports page to services, attendance, and contributions API"
```

---

### Task 13: Pastor — connect attendance.tsx and index.tsx + statistics.tsx

**Files:**
- Modify: `ekklesia-client/src/routes/pastor/attendance.tsx`
- Modify: `ekklesia-client/src/routes/pastor/index.tsx`
- Modify: `ekklesia-client/src/routes/pastor/statistics.tsx`

- [ ] **Step 1: Connect pastor/attendance.tsx**

Add imports. Add type:
```tsx
interface AttendanceReport {
  id: number
  service_id: number
  adults: number
  youth: number
  children: number
  total: number
  notes: string | null
  submitted_at: string
}
```

Add state and fetch:
```tsx
const { user } = useAuthStore()
const [reports, setReports] = useState<AttendanceReport[]>([])
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  void apiClient.get('/api/v1/attendance_reports')
    .then(r => setReports((r.data?.attendance_reports ?? []) as AttendanceReport[]))
    .catch(() => setError('No se pudo cargar los reportes.'))
    .finally(() => setIsLoading(false))
}, [])
```

Replace any hardcoded report data with `reports` state. Update `<Header` to use auth store.

- [ ] **Step 2: Connect pastor/index.tsx**

Add imports. Add types and fetch:
```tsx
interface PastorStats {
  services_count: number
  pending_attendance_reports: number
  pending_contributions: number
  assistants_count: number
}

interface ServiceItem {
  id: number
  service_type: string
  scheduled_at: string
  status: string
  has_attendance_report: boolean
  has_contributions: boolean
}

const { user } = useAuthStore()
const [stats, setStats] = useState<PastorStats | null>(null)
const [services, setServices] = useState<ServiceItem[]>([])

useEffect(() => {
  void Promise.all([
    apiClient.get('/api/v1/stats').then(r => setStats(r.data as PastorStats)),
    apiClient.get('/api/v1/services').then(r => setServices(r.data?.services ?? [])),
  ])
}, [])
```

Replace hardcoded statsData:
```tsx
const statsData = [
  { title: "Miembros Activos", value: '—', icon: Users, trend: { value: 0, isPositive: true } },
  { title: "Asistencia Promedio", value: '—', icon: ClipboardCheck, trend: { value: 0, isPositive: true } },
  { title: "Ayudantes", value: stats?.assistants_count ?? '—', icon: UserPlus, trend: { value: 0, isPositive: true } },
  { title: "Servicios del Mes", value: stats?.services_count ?? '—', icon: Wallet, trend: { value: 0, isPositive: true } },
]
```

Replace hardcoded `proximosServicios` with real services (upcoming = `service.scheduled_at > now`):
```tsx
const proximosServicios = services
  .filter((s: ServiceItem) => new Date(s.scheduled_at) > new Date() && s.status === 'scheduled')
  .slice(0, 3)
  .map((s: ServiceItem) => ({
    id: s.id,
    tipo: s.service_type,
    fecha: new Date(s.scheduled_at).toLocaleDateString('es-MX', { weekday: 'long' }),
    hora: new Date(s.scheduled_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
  }))
```

Replace hardcoded `ayudantes` list (this comes from `GET /api/v1/users` filtered by assistant). Add:
```tsx
const [assistants, setAssistants] = useState<{ id: number; full_name: string }[]>([])
// Add to the useEffect:
apiClient.get('/api/v1/users').then(r =>
  setAssistants(((r.data?.users ?? []) as { id: number; full_name: string; role: string }[]).filter(u => u.role === 'assistant'))
)
```

Update `<Header` to use auth store.

- [ ] **Step 3: Connect pastor/statistics.tsx**

Add imports and stats fetch. Replace hardcoded KPI values:
```tsx
{ title: "Avg. Attendance", value: '—', ... },
{ title: "Monthly Revenue", value: stats ? `$${stats.pending_contributions}` : '—', ... },
{ title: "Services/Week", value: stats?.services_count ?? '—', ... },
```

Update `<Header` to use auth store. Leave chart data static.

- [ ] **Step 4: TypeScript check + commit**

```bash
cd ekklesia-client && npx tsc --noEmit
```

```bash
cd ekklesia-client
git add src/routes/pastor/attendance.tsx src/routes/pastor/index.tsx src/routes/pastor/statistics.tsx
git commit -m "feat: connect pastor attendance, dashboard, and statistics to API"
```

---

### Task 14: Assistant — connect reports.tsx to API

**Files:**
- Modify: `ekklesia-client/src/routes/assistant/reports.tsx`

- [ ] **Step 1: Add imports and state**

Add imports. Add types:
```tsx
interface ServiceApi {
  id: number
  service_type: string
  scheduled_at: string
  status: string
  has_attendance_report: boolean
  has_contributions: boolean
}
```

Add state and fetch:
```tsx
const { user } = useAuthStore()
const [services, setServices] = useState<ServiceApi[]>([])
const [isLoading, setIsLoading] = useState(true)
const [isSaving, setIsSaving] = useState(false)
const [error, setError] = useState<string | null>(null)
const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null)
const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)
const [isContributionModalOpen, setIsContributionModalOpen] = useState(false)

const [attendanceForm, setAttendanceForm] = useState({
  adults: "", youth: "", children: "", notes: ""
})

const [contributionForm, setContributionForm] = useState({
  type: 'Offering' as const, amount: "", currency: "MXN", notes: ""
})

useEffect(() => {
  void apiClient.get('/api/v1/services')
    .then(r => setServices((r.data?.services ?? []) as ServiceApi[]))
    .catch(() => setError('No se pudo cargar los servicios.'))
    .finally(() => setIsLoading(false))
}, [])
```

- [ ] **Step 2: Wire attendance submission**

```tsx
const handleSubmitAttendance = async () => {
  if (!selectedServiceId) return
  try {
    setIsSaving(true)
    setError(null)
    await apiClient.post('/api/v1/attendance_reports', {
      attendance_report: {
        service_id: selectedServiceId,
        adults:     Number(attendanceForm.adults),
        youth:      Number(attendanceForm.youth),
        children:   Number(attendanceForm.children),
        notes:      attendanceForm.notes || null,
      },
    })
    setIsAttendanceModalOpen(false)
    setAttendanceForm({ adults: "", youth: "", children: "", notes: "" })
    const res = await apiClient.get('/api/v1/services')
    setServices((res.data?.services ?? []) as ServiceApi[])
  } catch {
    setError('No se pudo guardar el reporte de asistencia.')
  } finally {
    setIsSaving(false)
  }
}
```

- [ ] **Step 3: Wire contribution submission**

```tsx
const handleSubmitContribution = async () => {
  if (!selectedServiceId) return
  try {
    setIsSaving(true)
    setError(null)
    await apiClient.post('/api/v1/contributions', {
      contribution: {
        type:       contributionForm.type,
        service_id: selectedServiceId,
        amount:     Number(contributionForm.amount),
        currency:   contributionForm.currency,
        notes:      contributionForm.notes || null,
      },
    })
    setIsContributionModalOpen(false)
    setContributionForm({ type: 'Offering', amount: "", currency: "MXN", notes: "" })
    const res = await apiClient.get('/api/v1/services')
    setServices((res.data?.services ?? []) as ServiceApi[])
  } catch {
    setError('No se pudo guardar la contribucion.')
  } finally {
    setIsSaving(false)
  }
}
```

- [ ] **Step 4: Replace hardcoded service lists with real data**

Replace `serviciosPendientes` and `serviciosCompletados` with computed values:
```tsx
const serviciosPendientes = services.filter(
  s => !s.has_attendance_report || !s.has_contributions
)
const serviciosCompletados = services.filter(
  s => s.has_attendance_report && s.has_contributions
)
```

Update service card rendering to use `ServiceApi` fields (`s.service_type`, date from `s.scheduled_at`, `s.has_attendance_report`, `s.has_contributions`).

Replace hardcoded `quickStats`:
```tsx
const quickStats = [
  { label: "Reportes esta semana", value: serviciosCompletados.length, icon: FileText, color: "blue" },
  { label: "Servicios pendientes", value: serviciosPendientes.length, icon: Clock, color: "amber" },
  { label: "Total asistencia reportada", value: '—', icon: Users, color: "emerald" },
  { label: "Total ofrendas reportadas", value: '—', icon: Wallet, color: "pink" },
]
```

Update `<Header` to use auth store.

- [ ] **Step 5: TypeScript check + commit**

```bash
cd ekklesia-client && npx tsc --noEmit
```

```bash
cd ekklesia-client
git add src/routes/assistant/reports.tsx
git commit -m "feat: connect assistant reports page to API"
```

---

### Task 15: Assistant — connect index.tsx to API

**Files:**
- Modify: `ekklesia-client/src/routes/assistant/index.tsx`

- [ ] **Step 1: Add imports and state**

Add imports. Add types:
```tsx
interface AssistantStats {
  pending_service_requests: number
  submitted_reports_count: number
}

interface ServiceRequest {
  id: number
  service_type: string
  requested_for: string
  status: 'pending' | 'approved' | 'rejected'
  notes: string | null
}
```

Add state and fetch:
```tsx
const { user } = useAuthStore()
const [stats, setStats] = useState<AssistantStats | null>(null)
const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])
const [pendingServices, setPendingServices] = useState<{ id: number; service_type: string; scheduled_at: string }[]>([])
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  void Promise.all([
    apiClient.get('/api/v1/stats').then(r => setStats(r.data as AssistantStats)),
    apiClient.get('/api/v1/service_requests').then(r =>
      setServiceRequests((r.data?.service_requests ?? []) as ServiceRequest[])
    ),
    apiClient.get('/api/v1/services').then(r =>
      setPendingServices(
        (r.data?.services ?? [])
          .filter((s: { has_attendance_report: boolean; has_contributions: boolean; status: string }) =>
            !s.has_attendance_report || !s.has_contributions
          )
          .slice(0, 5)
      )
    ),
  ]).catch(() => setError('No se pudo cargar el panel.'))
    .finally(() => setIsLoading(false))
}, [])
```

- [ ] **Step 2: Replace hardcoded mock data**

Replace `serviciosPendientes` with `pendingServices` state.
Replace `serviciosCompletados` with service requests that are approved.
Replace `quickStats`:
```tsx
const quickStats = [
  {
    label: "Reportes esta semana",
    value: stats?.submitted_reports_count ?? '—',
    icon: FileText,
    color: "blue"
  },
  {
    label: "Servicios pendientes",
    value: stats?.pending_service_requests ?? '—',
    icon: Clock,
    color: "amber"
  },
  { label: "Total asistencia reportada", value: '—', icon: Users, color: "emerald" },
  { label: "Total ofrendas reportadas", value: '—', icon: Wallet, color: "pink" },
]
```

Update `<Header` to use auth store. Add loading/error states.

- [ ] **Step 3: TypeScript check + commit**

```bash
cd ekklesia-client && npx tsc --noEmit
```

```bash
cd ekklesia-client
git add src/routes/assistant/index.tsx
git commit -m "feat: connect assistant dashboard to stats and services API"
```

---

### Task 16: Update Header for all remaining roles

This task updates the Header in lead-pastor, pastor, and assistant layout wrapper files (`.tsx` files in `src/routes/` root level for each role).

**Files:**
- Modify: `ekklesia-client/src/routes/lead-pastor.tsx` (if it wraps pages)
- Modify: `ekklesia-client/src/routes/pastor.tsx`
- Modify: `ekklesia-client/src/routes/assistant.tsx`

- [ ] **Step 1: Check layout wrapper files**

Read each file to see if they contain a `<Header` component:
```bash
grep -n "Header\|userName\|userRole" \
  ekklesia-client/src/routes/lead-pastor.tsx \
  ekklesia-client/src/routes/pastor.tsx \
  ekklesia-client/src/routes/assistant.tsx
```

If any contains `<Header`, update it to use auth store (same pattern: import `useAuthStore` and `ROLE_LABELS`, add `const { user } = useAuthStore()`, replace props).

- [ ] **Step 2: TypeScript check + final commit**

```bash
cd ekklesia-client && npx tsc --noEmit
```

```bash
cd ekklesia-client
git add src/routes/lead-pastor.tsx src/routes/pastor.tsx src/routes/assistant.tsx
git commit -m "feat: connect layout wrapper Headers to auth store"
```

---

## Final verification

After all tasks are complete:

- [ ] Start both servers and do a full smoke test:

```bash
# Terminal 1
cd ekklesia-api && rails s

# Terminal 2
cd ekklesia-client && npm run dev
```

- [ ] Log in as each role and verify:
  - Superadmin: stats cards show real numbers, users CRUD works, churches CRUD works
  - Lead Pastor: churches/pastors/services CRUD works, dashboard shows real counts
  - Pastor: assistants CRUD works, reports page loads services, attendance/contribution submit works
  - Assistant: dashboard shows pending counts, reports page submits attendance and contributions

- [ ] TypeScript build passes:

```bash
cd ekklesia-client && npm run build
```

Expected: Exits 0.
