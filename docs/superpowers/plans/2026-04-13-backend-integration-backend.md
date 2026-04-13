# Backend Integration — API Changes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add email/phone to Church model, expose `has_attendance_report`/`has_contributions` flags on services index, and create a `/api/v1/stats` endpoint that returns role-scoped KPIs.

**Architecture:** Three self-contained backend tasks. Migration first (other tasks depend on the schema change). Stats and services enhancement are independent of each other. All new code follows existing RSpec request spec patterns with `auth_headers_for(user)` helper and FactoryBot factories.

**Tech Stack:** Rails 7, RSpec, FactoryBot, Faker, Pundit, acts_as_tenant, JWT auth

---

### Task 1: Add email and phone to churches

**Files:**
- Create: `ekklesia-api/db/migrate/TIMESTAMP_add_email_phone_to_churches.rb`
- Modify: `ekklesia-api/app/controllers/api/v1/churches_controller.rb` (church_params)
- Modify: `ekklesia-api/spec/factories/church.rb`

- [ ] **Step 1: Generate migration**

```bash
cd ekklesia-api
rails generate migration AddEmailPhoneToChurches email:string phone:string
```

Open the generated file in `db/migrate/` and confirm it looks like:

```ruby
class AddEmailPhoneToChurches < ActiveRecord::Migration[7.2]
  def change
    add_column :churches, :email, :string
    add_column :churches, :phone, :string
  end
end
```

- [ ] **Step 2: Run migration**

```bash
cd ekklesia-api
rails db:migrate
```

Expected: `== AddEmailPhoneToChurches: migrating ====` followed by `== migrated`.

- [ ] **Step 3: Permit email and phone in church_params**

In `app/controllers/api/v1/churches_controller.rb`, find the `church_params` private method and update it:

```ruby
def church_params
  params.require(:church).permit(:name, :address, :city, :status, :ministry_id, :email, :phone)
end
```

- [ ] **Step 4: Update church factory**

In `spec/factories/church.rb`, add email and phone:

```ruby
FactoryBot.define do
  factory :church do
    ministry
    name    { Faker::Company.name + ' Church' }
    address { Faker::Address.street_address }
    city    { Faker::Address.city }
    email   { Faker::Internet.unique.email }
    phone   { Faker::PhoneNumber.cell_phone }
    status  { :active }
  end
end
```

- [ ] **Step 5: Run existing church specs to verify nothing broken**

```bash
cd ekklesia-api
bundle exec rspec spec/requests/api/v1/churches_spec.rb spec/policies/church_policy_spec.rb -f documentation
```

Expected: All examples pass.

- [ ] **Step 6: Commit**

```bash
cd ekklesia-api
git add db/migrate/ db/schema.rb app/controllers/api/v1/churches_controller.rb spec/factories/church.rb
git commit -m "feat: add email and phone columns to churches"
```

---

### Task 2: Services index — include attendance and contribution presence flags

The pastor's reports page needs to know, for each service in the list, whether an attendance report and contributions have been submitted. Rather than N+1 calls, the services index will eager-load and include boolean flags.

**Files:**
- Modify: `ekklesia-api/app/controllers/api/v1/services_controller.rb`
- Modify: `ekklesia-api/spec/requests/api/v1/services_spec.rb`

- [ ] **Step 1: Write the failing spec**

Open `spec/requests/api/v1/services_spec.rb` and add a new context after the existing ones:

```ruby
context 'response includes presence flags' do
  let(:ministry) { create(:ministry) }
  let(:church)   { create(:church, ministry: ministry) }
  let(:user)     { create(:user, :pastor, ministry: ministry, church: church) }
  let!(:service_with_report) do
    svc = create(:service, ministry: ministry, church: church)
    create(:attendance_report, service: svc, ministry: ministry, reported_by: user)
    svc
  end
  let!(:service_without_report) { create(:service, ministry: ministry, church: church) }

  it 'includes has_attendance_report flag' do
    get '/api/v1/services', headers: auth_headers_for(user)
    body = JSON.parse(response.body)
    ids_with_report = body['services'].select { |s| s['has_attendance_report'] }.map { |s| s['id'] }
    ids_without    = body['services'].reject { |s| s['has_attendance_report'] }.map { |s| s['id'] }
    expect(ids_with_report).to include(service_with_report.id)
    expect(ids_without).to include(service_without_report.id)
  end

  it 'includes has_contributions flag' do
    create(:tithe, service: service_with_report, ministry: ministry, reported_by: user)
    get '/api/v1/services', headers: auth_headers_for(user)
    body = JSON.parse(response.body)
    ids_with = body['services'].select { |s| s['has_contributions'] }.map { |s| s['id'] }
    expect(ids_with).to include(service_with_report.id)
  end
end
```

- [ ] **Step 2: Run specs to verify they fail**

```bash
cd ekklesia-api
bundle exec rspec spec/requests/api/v1/services_spec.rb -f documentation
```

Expected: The two new examples FAIL with `expected ... to include has_attendance_report`.

- [ ] **Step 3: Implement service_payload and update index**

In `app/controllers/api/v1/services_controller.rb`, update the `index` action and add a private `service_payload` helper:

```ruby
def index
  authorize Service
  @services = scoped_services
                .includes(:attendance_report, :contributions)
                .page(params[:page])
                .per(params[:per_page] || 20)
  render json: { services: @services.map { |s| service_payload(s) } }
end
```

Add this private method (below `scoped_services`):

```ruby
def service_payload(service)
  service.as_json.merge(
    'has_attendance_report' => service.attendance_report.present?,
    'has_contributions'     => service.contributions.any?
  )
end
```

- [ ] **Step 4: Run specs to verify they pass**

```bash
cd ekklesia-api
bundle exec rspec spec/requests/api/v1/services_spec.rb -f documentation
```

Expected: All examples pass, including the two new ones.

- [ ] **Step 5: Commit**

```bash
cd ekklesia-api
git add app/controllers/api/v1/services_controller.rb spec/requests/api/v1/services_spec.rb
git commit -m "feat: include attendance/contribution presence flags in services index"
```

---

### Task 3: Stats endpoint

A single `GET /api/v1/stats` endpoint returns role-scoped KPIs. The controller branches on `current_user.role`. A permissive Pundit policy allows any authenticated user to call it.

**Note on tenancy:** `acts_as_tenant` scopes models with `acts_as_tenant :ministry` (Church, Service, AttendanceReport, Contribution, ServiceRequest). `User` does NOT have `acts_as_tenant` — it must be scoped manually using `ministry_id` or `church_id`. For superadmin, `ActsAsTenant.current_tenant = nil` is already set by `ApplicationController#set_tenant`, so unscoped queries return all records.

**Files:**
- Create: `ekklesia-api/app/controllers/api/v1/stats_controller.rb`
- Create: `ekklesia-api/app/policies/stats_policy.rb`
- Create: `ekklesia-api/spec/requests/api/v1/stats_spec.rb`
- Modify: `ekklesia-api/config/routes.rb`

- [ ] **Step 1: Write the failing request specs**

Create `spec/requests/api/v1/stats_spec.rb`:

```ruby
require 'rails_helper'

RSpec.describe 'GET /api/v1/stats', type: :request do
  context 'without token' do
    it 'returns 401' do
      get '/api/v1/stats'
      expect(response).to have_http_status(:unauthorized)
    end
  end

  context 'as superadmin' do
    let(:user) { create(:user, :superadmin) }

    it 'returns superadmin KPIs' do
      ministry = create(:ministry)
      create_list(:church, 3, ministry: ministry)
      get '/api/v1/stats', headers: auth_headers_for(user)
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body).to include(
        'total_churches',
        'total_users',
        'services_this_month',
        'total_contributions_amount',
        'total_attendance'
      )
      expect(body['total_churches']).to eq(3)
    end
  end

  context 'as lead_pastor' do
    let(:ministry) { create(:ministry) }
    let(:user)     { create(:user, :lead_pastor, ministry: ministry) }

    it 'returns lead_pastor KPIs' do
      get '/api/v1/stats', headers: auth_headers_for(user)
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body).to include(
        'churches_count',
        'pastors_count',
        'services_this_month',
        'total_attendance',
        'total_contributions'
      )
    end
  end

  context 'as pastor' do
    let(:ministry) { create(:ministry) }
    let(:church)   { create(:church, ministry: ministry) }
    let(:user)     { create(:user, :pastor, ministry: ministry, church: church) }

    it 'returns pastor KPIs' do
      get '/api/v1/stats', headers: auth_headers_for(user)
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body).to include(
        'services_count',
        'pending_attendance_reports',
        'pending_contributions',
        'assistants_count'
      )
    end
  end

  context 'as assistant' do
    let(:ministry) { create(:ministry) }
    let(:church)   { create(:church, ministry: ministry) }
    let(:user)     { create(:user, :assistant, ministry: ministry, church: church) }

    it 'returns assistant KPIs' do
      get '/api/v1/stats', headers: auth_headers_for(user)
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body).to include(
        'pending_service_requests',
        'submitted_reports_count'
      )
    end
  end
end
```

- [ ] **Step 2: Run specs to verify they fail**

```bash
cd ekklesia-api
bundle exec rspec spec/requests/api/v1/stats_spec.rb -f documentation
```

Expected: All examples FAIL with routing error (route not defined yet).

- [ ] **Step 3: Add route**

In `config/routes.rb`, add inside the `namespace :v1` block:

```ruby
get 'stats', to: 'stats#show'
```

The final routes file should look like:

```ruby
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      get  'auth/me',      to: 'auth#me'
      post 'auth/refresh', to: 'refresh#create'

      get 'stats', to: 'stats#show'

      resources :ministries
      resources :churches
      resources :users
      resources :services

      resources :service_requests, only: [:index, :show, :create] do
        member do
          patch :approve
          patch :reject
        end
      end

      resources :attendance_reports, only: [:index, :show, :create, :update]
      resources :contributions,      only: [:index, :show, :create, :update]
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
```

- [ ] **Step 4: Create the Pundit policy**

Create `app/policies/stats_policy.rb`:

```ruby
class StatsPolicy < ApplicationPolicy
  # Any authenticated user can fetch their own stats.
  # The controller gates the payload by role.
  def show?
    true
  end
end
```

- [ ] **Step 5: Create the stats controller**

Create `app/controllers/api/v1/stats_controller.rb`:

```ruby
module Api
  module V1
    class StatsController < ApplicationController
      def show
        authorize :stats, :show?
        render json: stats_for_current_user
      end

      private

      def stats_for_current_user
        case current_user.role.to_sym
        when :superadmin  then superadmin_stats
        when :lead_pastor then lead_pastor_stats
        when :pastor      then pastor_stats
        when :assistant   then assistant_stats
        end
      end

      # ── Superadmin: tenant is nil → sees everything ──────────────────
      def superadmin_stats
        {
          total_churches:            Church.count,
          total_users:               User.where.not(role: :superadmin).count,
          services_this_month:       Service.where(scheduled_at: Time.current.all_month).count,
          total_contributions_amount: Contribution.sum(:amount).to_f,
          total_attendance:          AttendanceReport.sum(:total)
        }
      end

      # ── Lead pastor: tenant = ministry → auto-scoped ─────────────────
      def lead_pastor_stats
        {
          churches_count:     Church.count,
          pastors_count:      User.where(role: :pastor, ministry_id: current_user.ministry_id).count,
          services_this_month: Service.where(scheduled_at: Time.current.all_month).count,
          total_attendance:   AttendanceReport.sum(:total),
          total_contributions: Contribution.sum(:amount).to_f
        }
      end

      # ── Pastor: scope manually to church ─────────────────────────────
      def pastor_stats
        church_id         = current_user.church_id
        church_services   = Service.where(church_id: church_id)
        service_ids       = church_services.ids
        services_with_contributions = Contribution.where(service_id: service_ids)
                                                   .distinct
                                                   .pluck(:service_id)
        {
          services_count:             church_services.count,
          pending_attendance_reports: church_services
                                        .left_joins(:attendance_report)
                                        .where(attendance_reports: { id: nil })
                                        .count,
          pending_contributions:      service_ids.size - services_with_contributions.size,
          assistants_count:           User.where(church_id: church_id, role: :assistant).count
        }
      end

      # ── Assistant: scope to church and current user ───────────────────
      def assistant_stats
        {
          pending_service_requests: ServiceRequest.where(
                                      church_id: current_user.church_id,
                                      status:    :pending
                                    ).count,
          submitted_reports_count:  AttendanceReport.where(reported_by_id: current_user.id).count
        }
      end
    end
  end
end
```

- [ ] **Step 6: Run specs to verify they pass**

```bash
cd ekklesia-api
bundle exec rspec spec/requests/api/v1/stats_spec.rb -f documentation
```

Expected: All 5 examples pass.

- [ ] **Step 7: Run full test suite to confirm no regressions**

```bash
cd ekklesia-api
bundle exec rspec -f progress
```

Expected: All green.

- [ ] **Step 8: Commit**

```bash
cd ekklesia-api
git add app/controllers/api/v1/stats_controller.rb \
        app/policies/stats_policy.rb \
        spec/requests/api/v1/stats_spec.rb \
        config/routes.rb
git commit -m "feat: add GET /api/v1/stats endpoint with role-scoped KPIs"
```
