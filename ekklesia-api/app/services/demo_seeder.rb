# Populates the database with demo data for manual testing of every role's
# flows. Destructive: each run wipes prior demo data and reseeds. Preserves
# the seeded superadmin from db/seeds.rb.
#
# Design doc: docs/superpowers/specs/2026-04-26-demo-seed-design.md
class DemoSeeder
  DEMO_PASSWORD = "Demo2026!"
  DEMO_EMAIL_DOMAIN = "demo.dev"

  # Catalog of ministries and their churches/users. Order matters: the
  # first user in :pastors is the church's pastor; the rest are assistants.
  # The lead_pastor sits at the ministry level, not at any church.
  CATALOG = [
    {
      ministry: { name: "Casa de Oración", country: "Mexico", city: "Ciudad de México" },
      lead_pastor: { email: "pedro.lider@demo.dev",  first_name: "Pedro",   last_name: "Lider",     locale: "en" },
      churches: [
        {
          church: { name: "Iglesia Central", city: "Ciudad de México", address: "Av. Reforma 100" },
          pastor: { email: "carlos.mendoza@demo.dev",  first_name: "Carlos",  last_name: "Mendoza" },
          assistants: [
            { email: "maria.garcia@demo.dev", first_name: "María", last_name: "García" },
            { email: "juan.lopez@demo.dev",   first_name: "Juan",  last_name: "López" }
          ]
        },
        {
          church: { name: "Iglesia del Norte", city: "Monterrey", address: "Av. Constitución 200" },
          pastor: { email: "ana.rodriguez@demo.dev", first_name: "Ana",   last_name: "Rodríguez" },
          assistants: [
            { email: "sofia.hernandez@demo.dev", first_name: "Sofía", last_name: "Hernández" }
          ]
        }
      ]
    },
    {
      ministry: { name: "Cristo Vive", country: "Argentina", city: "Buenos Aires" },
      lead_pastor: { email: "roberto.lider@demo.dev", first_name: "Roberto", last_name: "Líder",    locale: "es" },
      churches: [
        {
          church: { name: "Iglesia Esperanza", city: "Buenos Aires", address: "Av. Corrientes 500" },
          pastor: { email: "laura.martinez@demo.dev", first_name: "Laura", last_name: "Martínez" },
          assistants: [
            { email: "pedro.sanchez@demo.dev", first_name: "Pedro", last_name: "Sánchez" }
          ]
        },
        {
          church: { name: "Iglesia Nueva Vida", city: "Córdoba", address: "Av. Colón 300" },
          pastor: { email: "miguel.torres@demo.dev", first_name: "Miguel", last_name: "Torres" },
          assistants: [
            { email: "carmen.diaz@demo.dev", first_name: "Carmen", last_name: "Díaz" }
          ]
        }
      ]
    }
  ].freeze

  def call
    srand(42) # determinism across runs
    with_dispatcher_disabled do
      wipe_existing_demo_data!
      create_ministries_and_users
      create_services_for_each_church
      create_reports_and_contributions
      create_service_requests
    end
    create_demo_notifications
    print_summary
  end

  private

  # Stubs: each task below replaces the body.

  def wipe_existing_demo_data!
    puts "Wiping existing demo data..."
    # Order matters: hojas → raíces para evitar errores de FK.
    Notification.delete_all
    Contribution.delete_all
    AttendanceReport.delete_all
    ServiceRequest.delete_all
    Service.delete_all

    # Delete only NON-superadmin users (and their accounts) BEFORE churches
    # because users have FKs to church_id and ministry_id.
    demo_user_ids = User.where.not(role: :superadmin).pluck(:id)
    demo_account_ids = User.where(id: demo_user_ids).pluck(:account_id)
    User.where(id: demo_user_ids).delete_all
    Account.where(id: demo_account_ids).delete_all

    Church.delete_all
    Ministry.delete_all
    puts "  ✓ Wiped"
  end

  def create_ministries_and_users
    puts "Creating ministries, churches, and users..."
    @ministries = []
    @churches_by_id = {}
    @users_by_email = {}

    CATALOG.each do |spec|
      ministry = Ministry.create!(spec[:ministry].merge(slug: spec[:ministry][:name].parameterize))
      @ministries << ministry

      lead = build_user(spec[:lead_pastor], role: :lead_pastor, ministry: ministry, church: nil)
      @users_by_email[lead.account.email] = lead

      ActsAsTenant.with_tenant(ministry) do
        spec[:churches].each do |church_spec|
          church = Church.create!(
            church_spec[:church].merge(
              ministry: ministry,
              status: :active,
              email: "#{church_spec[:church][:name].parameterize}@demo.dev",
              phone: "+#{rand(10..99)} 55 #{rand(1000..9999)} #{rand(1000..9999)}"
            )
          )
          @churches_by_id[church.id] = church

          pastor = build_user(church_spec[:pastor], role: :pastor, ministry: ministry, church: church)
          @users_by_email[pastor.account.email] = pastor

          church_spec[:assistants].each do |asst_spec|
            asst = build_user(asst_spec, role: :assistant, ministry: ministry, church: church)
            @users_by_email[asst.account.email] = asst
          end
        end
      end
    end
    puts "  ✓ #{@ministries.size} ministries, #{@churches_by_id.size} churches, #{@users_by_email.size} demo users"
  end

  def build_user(spec, role:, ministry:, church:)
    account = Account.create!(
      email: spec[:email],
      password_hash: BCrypt::Password.create(DEMO_PASSWORD),
      jwt_secret: SecureRandom.hex(32),
      status: :verified
    )
    User.create!(
      account: account,
      ministry: ministry,
      church: church,
      first_name: spec[:first_name],
      last_name: spec[:last_name],
      phone: "+1 555 #{rand(1000..9999)}",
      role: role,
      locale: spec[:locale] || "es"
    )
  end

  def create_services_for_each_church
    puts "  [stub] create_services_for_each_church"
  end

  def create_reports_and_contributions
    puts "  [stub] create_reports_and_contributions"
  end

  def create_service_requests
    puts "  [stub] create_service_requests"
  end

  def create_demo_notifications
    puts "  [stub] create_demo_notifications"
  end

  def print_summary
    puts "✓ Demo data seeded successfully (stub)."
  end

  # Wraps the block with a no-op stub of Notifications::Dispatcher.call so
  # bulk creations during seeding don't flood notification queues. Restores
  # the original method via ensure.
  def with_dispatcher_disabled
    original = Notifications::Dispatcher.method(:call)
    Notifications::Dispatcher.define_singleton_method(:call) { |*_args, **_kwargs| nil }
    yield
  ensure
    Notifications::Dispatcher.define_singleton_method(:call, &original) if original
  end
end
