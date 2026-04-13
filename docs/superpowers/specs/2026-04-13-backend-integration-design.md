# Backend Integration Design

**Date:** 2026-04-13  
**Scope:** Connect all mocked frontend pages to the real Rails API, role by role: superadmin → lead_pastor → pastor → assistant.

---

## Context

The Ekklesia app has a Rails API (Rodauth + JWT, Pundit authorization, acts_as_tenant multi-tenancy) and a Vite/React client. Login is the only feature currently connected end-to-end. All dashboard, CRUD, and reporting pages use hardcoded mock data. The goal is to replace all mocks with real API calls, role by role.

---

## Architecture

### Approach
**API first, then frontend per role.** All backend changes (migration + stats endpoint) land before frontend work begins. This stabilizes the API contract so frontend connections require no rework.

---

## API Changes

### 1. Migration: Church email + phone

Add two nullable string columns to `churches`:

```
add_column :churches, :email, :string
add_column :churches, :phone, :string
```

Update `church_params` in `ChurchesController` to permit `:email` and `:phone`.

### 2. Stats endpoint

**Route:** `GET /api/v1/stats`  
**Controller:** `Api::V1::StatsController#show`  
**Authorization:** Pundit — each role can only access its own stats.

Returns a different payload depending on `current_user.role`:

**superadmin:**
```json
{
  "total_churches": 24,
  "total_users": 48,
  "services_this_month": 156,
  "total_contributions_amount": 125420.0,
  "total_attendance": 3200
}
```

**lead_pastor:**
```json
{
  "churches_count": 6,
  "pastors_count": 8,
  "services_this_month": 24,
  "total_attendance": 980,
  "total_contributions": 42000.0
}
```

**pastor:**
```json
{
  "services_count": 12,
  "pending_attendance_reports": 3,
  "pending_contributions": 2,
  "assistants_count": 4
}
```

**assistant:**
```json
{
  "pending_service_requests": 2,
  "submitted_reports_count": 8
}
```

Stats are scoped by the same tenant rules already in place (superadmin sees all, lead_pastor sees ministry, pastor/assistant see their church).

---

## Client Changes

### Shared: Header component

All pages currently pass hardcoded `userName` and `userRole` props to `<Header>`. Each page will instead read from the Zustand auth store:

```tsx
const { user } = useAuthStore()
<Header
  title="..."
  userName={user?.full_name ?? ""}
  userRole={ROLE_LABELS[user?.role ?? ""] ?? ""}
/>
```

A shared constant handles role label translation:
```ts
const ROLE_LABELS = {
  superadmin: "Super Administrador",
  lead_pastor: "Pastor Principal",
  pastor: "Pastor",
  assistant: "Ayudante"
}
```

### Fetch pattern

All pages follow the same pattern already established in `superadmin/churches.tsx`:
```tsx
const [data, setData] = useState([])
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => { void fetchData() }, [])
```

No new abstraction layers. Direct `apiClient` calls inside each route file.

---

## Per-Role Frontend

### Superadmin

#### `users.tsx`
- Replace `mockUsers` array with `GET /api/v1/users`
- API fields: `id`, `email`, `first_name`, `last_name`, `full_name`, `role`, `church_id`, `ministry_id`
- Create form: split single `name` field into `first_name` + `last_name`; add `password` field
- Church select options loaded from `GET /api/v1/churches`
- Wire: `POST /api/v1/users` (create), `PUT /api/v1/users/:id` (edit), `DELETE /api/v1/users/:id` (delete — calls `account.destroy` via API)
- Stats strip (total, active, inactive, pending) computed from fetched list

#### `index.tsx`
- Stats cards: `GET /api/v1/stats`
- Churches table: `GET /api/v1/churches` (first page)
- Activity feed: remains static (no activity log in current API)

#### `reports.tsx` + `statistics.tsx`
- KPI cards from `GET /api/v1/stats`
- Charts use aggregated values from stats payload (attendance total, contributions total)
- Church performance list from `GET /api/v1/churches` with attendance/contribution sums in stats

---

### Lead Pastor

#### `churches.tsx`
- Replace `mockChurches` with `GET /api/v1/churches` (auto-scoped to ministry by acts_as_tenant)
- `POST /api/v1/churches` (create), `PUT /api/v1/churches/:id` (edit), `DELETE /api/v1/churches/:id` (delete)

#### `pastors.tsx`
- Replace `mockPastors` with `GET /api/v1/users` filtered client-side by `role === "pastor"` (no backend changes needed)
- Form: `first_name`, `last_name`, `email`, `password`, `church_id` (select from ministry churches)
- `POST/PUT/DELETE /api/v1/users`

#### `services.tsx`
- Replace `mockServices` with `GET /api/v1/services` (scoped to ministry)
- Form: `church_id`, `service_type`, `scheduled_at`, `status`
- `POST/PUT/DELETE /api/v1/services`

#### `index.tsx` + `statistics.tsx`
- `GET /api/v1/stats`

---

### Pastor

#### `assistants.tsx`
- Replace `mockHelpers` with `GET /api/v1/users` filtered client-side by `role === "assistant"`
- Form: `first_name`, `last_name`, `email`, `password`; `church_id` sent explicitly in payload using the pastor's `church_id` from the auth store (the UsersController requires it for assistant/pastor roles)
- `POST/PUT/DELETE /api/v1/users`

#### `reports.tsx`
- Replace `generateMockServices()` with `GET /api/v1/services` (scoped to pastor's church)
- Each service card shows whether attendance report and contributions exist (API includes them in service response, or check via `has_one :attendance_report`)
- Submit attendance: `POST /api/v1/attendance_reports` with `{ service_id, adults, youth, children, notes }`
- Submit contributions: `POST /api/v1/contributions` with `{ type, service_id, amount, currency, notes }` — type is one of: Tithe, Offering, Donation, Firstfruit, Covenant
- Edit existing: `PUT /api/v1/attendance_reports/:id`, `PUT /api/v1/contributions/:id`

#### `attendance.tsx`
- `GET /api/v1/attendance_reports` + `POST /api/v1/attendance_reports` + `PUT /api/v1/attendance_reports/:id`

#### `index.tsx` + `statistics.tsx`
- `GET /api/v1/stats`

---

### Assistant

#### `index.tsx`
- `GET /api/v1/service_requests` (pending ones)
- `GET /api/v1/stats`

#### `reports.tsx`
- Services list: `GET /api/v1/services` (pastor's church, scoped automatically)
- Submit attendance report: `POST /api/v1/attendance_reports`
- Submit contributions: `POST /api/v1/contributions`

---

## Field Mapping Reference

| Frontend field | API field | Notes |
|---|---|---|
| `name` (users form) | `first_name` + `last_name` | Split into two inputs |
| `church` (select) | `church_id` | Load options from `/churches` |
| `email` (churches) | `email` | New column via migration |
| `phone` (churches) | `phone` | New column via migration |
| `pastor` (church row) | — | Not in API; show "Sin asignar" until user-church relation is added |
| `members` (church row) | — | Not in API; show 0 for now |
| `services` (church row) | — | Not in API; show 0 for now |
| `lastLogin` (user row) | — | Not in API; omit column |
| `status` (users) | — | Not in API; omit from user table |
| `hasAttendanceReport` | attendance_report present | Check via service show endpoint |
| `hasTreasuryReport` | contributions.length > 0 | Check via service show endpoint |

---

## Out of Scope

- Activity feed on superadmin dashboard (no audit log in API)
- Member count per church (no members model)
- User last login timestamp (not tracked)
- Export to PDF (UI button exists but remains non-functional)
- Filter/search on backend (all filtering done client-side on fetched list)
