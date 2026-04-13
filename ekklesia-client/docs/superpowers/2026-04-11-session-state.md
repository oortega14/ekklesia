# Ekklesia API — Estado de Sesión
**Fecha:** 2026-04-11  
**Proyecto API:** `/Users/oscarortega/work/ekklesia/ekklesia-api`  
**Proyecto Client:** `/Users/oscarortega/work/ekklesia/ekklesia-client`

---

## Donde estamos ahora

### Tareas completadas

| Tarea | Descripcion | Estado |
|-------|-------------|--------|
| Task 1 | Project Bootstrap (Rails API, gems, CORS, RSpec) | Completado |
| Task 2 | Rodauth Install + Migrations (todas las tablas) | Completado |
| Task 3 | Core Models: Ministry, Account, User | Completado, specs pasan |
| Task 4 | Domain Models: Church, Service, ServiceRequest | Completado, specs pasan |
| Task 5 | Domain Models STI: Contribution + 5 subclases, AttendanceReport | Completado, specs pasan |

**Resultado de tests al cierre de sesion:**
```
17 examples, 0 failures
bundle exec rspec spec/models/ --format documentation
```

---

## Lo que existe en el proyecto

### Modelos (`app/models/`)
- `ministry.rb` — tenant, has_many todos los modelos, slug auto-generado
- `account.rb` — Rodauth::Rails.model, has_one user, jwt_secret en before_create
- `user.rb` — roles enum, validaciones condicionales, delegate email, full_name
- `church.rb` — acts_as_tenant, enum status {active/pending/inactive}
- `service.rb` — acts_as_tenant, has_one attendance_report, has_many contributions
- `service_request.rb` — acts_as_tenant, requested_by/reviewed_by (User)
- `contribution.rb` — acts_as_tenant, STI base, before_save submitted_at
- `tithe.rb`, `offering.rb`, `donation.rb`, `firstfruit.rb`, `covenant.rb` — STI subclases
- `attendance_report.rb` — acts_as_tenant, compute_total + submitted_at en before_save

### Factories (`spec/factories/`)
- `ministries.rb`, `accounts.rb`, `users.rb` (traits: superadmin, lead_pastor, pastor, assistant)
- `churches.rb`, `services.rb`, `service_requests.rb`
- `attendance_reports.rb`
- `contributions.rb` (nested factories: tithe, offering, donation, firstfruit, covenant)

### Migraciones (`db/migrate/`)
- `create_rodauth.rb` — tabla accounts con jwt_secret
- `create_ministries.rb`
- `create_users.rb`
- `create_churches.rb`
- `create_services.rb`
- `create_service_requests.rb`
- `create_attendance_reports.rb`
- `create_contributions.rb`
- `add_missing_foreign_key_indexes.rb`

### Rodauth configurado
- `app/misc/rodauth_main.rb` — login, logout, create_account, jwt features
- `app/misc/rodauth_app.rb` — route block
- `config/initializers/rodauth.rb`
- `app/controllers/rodauth_controller.rb`

---

## Lo que FALTA (proximas tareas)

### Task 6 — Rodauth Configuration (aplicacion del spec)
El `rodauth_main.rb` existe (generado) pero **NO tiene la configuracion custom del spec**. Falta implementar:

```ruby
# En rodauth_main.rb dentro del bloque configure:

# JWT secret por usuario (HMAC rotation)
jwt_secret { "#{Rails.application.secret_key_base}-#{account[:jwt_secret]}" }

# JWT payload custom con role, ministry_id, church_id
jwt_payload { ... }

# Rotacion de jwt_secret en logout
after_logout { db[:accounts].where(id: account_id).update(jwt_secret: SecureRandom.hex(32)) }

# Expiry 24 horas
jwt_access_token_period 86400
```

### Task 7 — ApplicationController
`app/controllers/application_controller.rb` actualmente solo hereda de `ActionController::API`. Falta:
- `before_action :authenticate!` — verifica JWT via Rodauth
- `before_action :set_tenant` — configura ActsAsTenant.current_tenant
- `include Pundit::Authorization`
- Rescue handlers: 401, 403, 404, 422
- Helper `current_user` que resuelve Account -> User

### Task 8 — Pundit Policies
El directorio `app/policies/` no existe. Falta crear:
- `application_policy.rb`
- `ministry_policy.rb`
- `church_policy.rb`
- `user_policy.rb`
- `service_policy.rb`
- `service_request_policy.rb`
- `attendance_report_policy.rb`
- `contribution_policy.rb`

Matriz de permisos en spec: `docs/superpowers/specs/2026-04-11-ekklesia-api-design.md` seccion 7.

### Task 9 — Routes
`config/routes.rb` solo tiene el health check. Falta definir:
```ruby
namespace :api do
  namespace :v1 do
    # auth (login, signup, logout, me)
    # resources: ministries, churches, users, services,
    #            service_requests, attendance_reports, contributions
  end
end
```

### Tasks 10-18 — Controllers
No existe `app/controllers/api/` ni ninguno de los 8 controladores del spec:
- `auth_controller.rb` — login, signup, logout, me
- `ministries_controller.rb`
- `churches_controller.rb`
- `users_controller.rb`
- `services_controller.rb`
- `service_requests_controller.rb`
- `attendance_reports_controller.rb`
- `contributions_controller.rb`

### Task 19 — Seeds
`db/seeds.rb` esta vacio (o con placeholder). Falta el seed de superadmin.

### Request Specs
No existe `spec/requests/` ni ninguno de los 8 spec files de integracion.

---

## Plan de referencia completo
- Plan detallado (tasks 1-19): `docs/superpowers/plans/2026-04-11-ekklesia-api.md`
- Spec de diseno y arquitectura: `docs/superpowers/specs/2026-04-11-ekklesia-api-design.md`

---

## Proximos pasos recomendados

1. **Task 6** — Completar `rodauth_main.rb` con JWT custom payload, HMAC rotation y expiry
2. **Task 7** — Implementar `ApplicationController` con auth + tenant + Pundit
3. **Task 8** — Crear todas las Pundit policies segun la matriz de permisos
4. **Task 9** — Definir todas las rutas bajo `/api/v1/`
5. **Tasks 10-18** — Implementar los 8 controladores con sus acciones CRUD y autorizacion
6. **Task 19** — Seeds de superadmin + correr suite de request specs

## Comando para verificar estado del proyecto
```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-api
bundle exec rspec spec/models/ --format documentation
```
