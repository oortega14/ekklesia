# Ekklesia API — Design Spec
**Date:** 2026-04-11  
**Status:** Approved  
**Scope:** Rails API backend — auth, multi-tenancy, roles, core data model

---

## 1. Overview

Build a Ruby on Rails 7.x API-only backend (`ekklesia-api`) to replace the mocked data in the existing Next.js frontend (`ekklesia-client`). The API will serve as the single source of truth for the church management system, supporting authentication, multi-tenancy, role-based access control, and the core domain models.

**Project location:** `/Users/oscarortega/work/ekklesia/ekklesia-api`

---

## 2. Tech Stack

| Concern | Solution |
|---------|----------|
| Framework | Rails 7.x, API-only mode |
| Language | Ruby 3.3+ |
| Database | PostgreSQL |
| Authentication | `rodauth-rails` + `rodauth-model` |
| JWT | Built into Rodauth's `jwt` feature |
| JWT Revocation | Per-user HMAC rotation via `jwt_secret` column |
| Multi-tenancy | `acts_as_tenant` gem |
| Authorization | `pundit` gem (policy objects) |
| Testing | RSpec + FactoryBot |

---

## 3. Architecture

### Request Lifecycle
```
React → POST /api/v1/auth/login
      ← JWT { sub, role, ministry_id, church_id, iat, exp }

React → GET /api/v1/churches   [Authorization: Bearer <token>]
      → Rodauth verifies JWT signature using per-user HMAC secret
      → ApplicationController sets tenant via acts_as_tenant
      → Pundit policy checks role permissions
      ← JSON scoped to the user's ministry only
```

### Project Structure
```
ekklesia-api/
├── app/
│   ├── controllers/
│   │   ├── application_controller.rb       # JWT verify + tenant set + Pundit
│   │   └── api/v1/
│   │       ├── auth_controller.rb
│   │       ├── churches_controller.rb
│   │       ├── users_controller.rb
│   │       ├── services_controller.rb
│   │       ├── service_requests_controller.rb
│   │       ├── attendance_reports_controller.rb
│   │       └── contributions_controller.rb
│   ├── models/
│   │   ├── account.rb                      # Rodauth account (auth)
│   │   ├── user.rb                         # Domain model (business)
│   │   ├── ministry.rb                     # Tenant
│   │   ├── church.rb
│   │   ├── service.rb
│   │   ├── service_request.rb
│   │   ├── attendance_report.rb
│   │   ├── contribution.rb                 # STI base
│   │   ├── tithe.rb
│   │   ├── offering.rb
│   │   ├── donation.rb
│   │   ├── firstfruit.rb
│   │   └── covenant.rb
│   ├── policies/                           # Pundit
│   │   ├── application_policy.rb
│   │   ├── church_policy.rb
│   │   ├── user_policy.rb
│   │   ├── service_policy.rb
│   │   ├── service_request_policy.rb
│   │   ├── attendance_report_policy.rb
│   │   └── contribution_policy.rb
│   └── rodauth_app.rb                      # Rodauth configuration
├── config/routes.rb
└── db/seeds.rb                             # Superadmin seed
```

---

## 4. Data Model

### `ministries` (tenant)
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| name | string | |
| slug | string | unique |
| country | string | |
| city | string | |
| timestamps | | |

### `accounts` (Rodauth — authentication only)
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| email | citext | unique, case-insensitive |
| password_hash | string | bcrypt |
| jwt_secret | string | per-user HMAC rotation |
| status_id | integer | Rodauth account status |
| timestamps | | |

### `users` (domain — business logic)
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| account_id | bigint FK | → accounts |
| ministry_id | bigint FK | NULL for superadmin |
| church_id | bigint FK | NULL for superadmin/lead_pastor |
| first_name | string | |
| last_name | string | |
| phone | string | |
| role | integer enum | superadmin, lead_pastor, pastor, assistant |
| timestamps | | |

### `churches`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| ministry_id | bigint FK | tenant scope |
| name | string | |
| address | string | |
| city | string | |
| status | integer enum | active, pending, inactive |
| timestamps | | |

### `services`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| ministry_id | bigint FK | tenant scope |
| church_id | bigint FK | |
| service_type | string | e.g. "Culto Dominical", "Estudio Bíblico" |
| scheduled_at | datetime | |
| status | integer enum | scheduled, completed, cancelled |
| timestamps | | |

### `service_requests`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| ministry_id | bigint FK | tenant scope |
| church_id | bigint FK | |
| requested_by_id | bigint FK | → users (pastor) |
| reviewed_by_id | bigint FK | → users (lead_pastor), nullable |
| service_type | string | |
| requested_for | datetime | |
| notes | text | |
| status | integer enum | pending, approved, rejected |
| timestamps | | |

### `attendance_reports`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| ministry_id | bigint FK | tenant scope |
| service_id | bigint FK | |
| reported_by_id | bigint FK | → users |
| adults | integer | |
| youth | integer | |
| children | integer | |
| total | integer | computed: adults + youth + children |
| notes | text | |
| submitted_at | datetime | |
| timestamps | | |

### `contributions` (STI)
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| type | string | STI discriminator |
| ministry_id | bigint FK | tenant scope |
| service_id | bigint FK | |
| reported_by_id | bigint FK | → users |
| amount | decimal(12,2) | |
| currency | string | default "MXN" |
| notes | text | |
| submitted_at | datetime | |
| timestamps | | |

**STI subclasses:** `Tithe`, `Offering`, `Donation`, `Firstfruit`, `Covenant`

---

## 5. Authentication

### Endpoints
```
POST   /api/v1/auth/login       # email + password → JWT
POST   /api/v1/auth/signup      # creates Ministry + Account + User (lead_pastor) → JWT
DELETE /api/v1/auth/logout      # rotates jwt_secret → invalidates all prior tokens
GET    /api/v1/auth/me          # returns current user data
```

### JWT Payload
```json
{
  "sub": "<account_id>",
  "role": "lead_pastor",
  "ministry_id": 5,
  "church_id": null,
  "iat": 1712800000,
  "exp": 1712886400
}
```

Token expiry: **24 hours**. Future: refresh tokens + per-device invalidation.

### Per-User HMAC Rotation (Rodauth config)
```ruby
def jwt_secret
  "#{Rails.application.secret_key_base}-#{account[:jwt_secret]}"
end

def after_logout
  db[:accounts].where(id: account_id)
               .update(jwt_secret: SecureRandom.hex(32))
end
```

On signup, `jwt_secret` is initialized with `SecureRandom.hex(32)`.  
On logout (or password change), `jwt_secret` is regenerated — all prior tokens become invalid.

### Superadmin Creation
Superadmin is created exclusively via `db/seeds.rb` or Rails console. No public endpoint for superadmin signup.

---

## 6. Multi-Tenancy

- Tenant = `Ministry`
- All domain models include `ministry_id` and declare `acts_as_tenant(:ministry)`
- `acts_as_tenant` automatically appends `WHERE ministry_id = ?` to all ActiveRecord queries
- Records from other ministries simply return 404 (not found), not 403 (forbidden)

```ruby
# ApplicationController
before_action :set_tenant

def set_tenant
  if current_user.superadmin?
    ActsAsTenant.current_tenant = nil
  else
    ActsAsTenant.current_tenant = current_user.ministry
  end
end
```

---

## 7. Authorization (Pundit Policies)

### Role Permission Matrix
| Action | superadmin | lead_pastor | pastor | assistant |
|--------|-----------|-------------|--------|-----------|
| All ministries CRUD | ✅ | ❌ | ❌ | ❌ |
| Churches CRUD | ✅ | ✅ own ministry | ❌ | ❌ |
| Users CRUD (pastors) | ✅ | ✅ own ministry | ❌ | ❌ |
| Create assistants | ✅ | ✅ | ✅ own church | ❌ |
| Create services | ✅ | ✅ | ❌ | ❌ |
| Request service | ✅ | ✅ | ✅ | ❌ |
| Approve service_request | ✅ | ✅ | ❌ | ❌ |
| View statistics | ✅ | ✅ ministry-wide | ✅ own church | ❌ |
| Submit attendance report | ✅ | ✅ | ✅ | ✅ own church |
| Submit contributions | ✅ | ✅ | ✅ | ✅ own church |

### Policy Convention
Each controller uses `authorize record` before actions. Pundit raises `Pundit::NotAuthorizedError` → rescued as 403.

```ruby
class ChurchPolicy < ApplicationPolicy
  def create?
    user.superadmin? || user.lead_pastor?
  end

  def show?
    user.superadmin? ||
    user.lead_pastor? ||
    (user.pastor? && record.id == user.church_id)
  end
end
```

---

## 8. API Conventions

- All endpoints under `/api/v1/`
- JSON responses only (`Content-Type: application/json`)
- Auth via `Authorization: Bearer <token>` header
- Errors return `{ "error": "message" }` with appropriate HTTP status
- Pagination via `page` and `per_page` params (Kaminari gem)

### Standard Error Responses
| Scenario | HTTP Status |
|----------|-------------|
| Invalid/expired JWT | 401 |
| Valid JWT, insufficient role | 403 |
| Record not found (incl. wrong tenant) | 404 |
| Validation error | 422 |

---

## 9. Initial Scope (Phase 1)

This spec covers only Phase 1:
- Auth (login, signup, logout, me)
- Ministries (CRUD — superadmin only)
- Churches (CRUD — superadmin + lead_pastor)
- Users (CRUD — role-scoped)
- Services (CRUD — superadmin + lead_pastor; read for pastor/assistant)
- Service Requests (pastor → lead_pastor workflow)
- Attendance Reports (submit + read)
- Contributions / STI (submit + read, all 5 types)

Statistics endpoints (aggregations) are Phase 2.
