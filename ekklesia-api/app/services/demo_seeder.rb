# Populates the database with demo data for manual testing of every role's
# flows. Destructive: each run wipes prior demo data and reseeds. Preserves
# the seeded superadmin from db/seeds.rb.
#
# Design doc: docs/superpowers/specs/2026-04-26-demo-seed-design.md
class DemoSeeder
  DEMO_PASSWORD = "Demo2026!"
  DEMO_EMAIL_DOMAIN = "demo.dev"

  SERVICE_TYPES = [ "Culto Dominical", "Estudio Bíblico", "Reunión Especial" ].freeze

  CONTRIBUTION_TYPE_WEIGHTS = {
    "Tithe" => 60, "Offering" => 25, "Donation" => 10, "Firstfruit" => 3, "Covenant" => 2
  }.freeze

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
    puts "Creating services for each church..."
    @services_by_church_id = Hash.new { |h, k| h[k] = [] }

    @churches_by_id.each_value do |church|
      ActsAsTenant.with_tenant(church.ministry) do
        # 6 past services, one per week
        6.downto(1) do |weeks_ago|
          svc = Service.create!(
            ministry: church.ministry,
            church: church,
            service_type: rotating_service_type(weeks_ago),
            scheduled_at: weeks_ago.weeks.ago.beginning_of_day + 10.hours,
            status: :completed
          )
          @services_by_church_id[church.id] << svc
        end

        # 2 upcoming services
        [ 1, 2 ].each do |weeks_ahead|
          svc = Service.create!(
            ministry: church.ministry,
            church: church,
            service_type: "Culto Dominical",
            scheduled_at: weeks_ahead.weeks.from_now.beginning_of_day + 10.hours,
            status: :scheduled
          )
          @services_by_church_id[church.id] << svc
        end
      end
    end
    total = @services_by_church_id.values.sum(&:length)
    puts "  ✓ #{total} services across #{@churches_by_id.size} churches"
  end

  def rotating_service_type(week)
    SERVICE_TYPES[week % SERVICE_TYPES.length]
  end

  def create_reports_and_contributions
    puts "Creating attendance reports and contributions..."
    reports_count = 0
    contributions_count = 0

    @services_by_church_id.each do |church_id, services|
      church = @churches_by_id[church_id]
      pastor = User.find_by(role: :pastor, church_id: church_id)

      ActsAsTenant.with_tenant(church.ministry) do
        services.each do |svc|
          next unless svc.status == "completed"

          AttendanceReport.create!(
            service: svc,
            ministry: church.ministry,
            reported_by: pastor,
            adults: rand(80..150),
            youth: rand(20..50),
            children: rand(15..40),
            submitted_at: svc.scheduled_at + 4.hours
          )
          reports_count += 1

          # 2-4 contributions per past service.
          rand(2..4).times do
            type_class = pick_contribution_type
            type_class.create!(
              service: svc,
              ministry: church.ministry,
              reported_by: pastor,
              amount: contribution_amount_for(church.ministry.country),
              submitted_at: svc.scheduled_at + 4.hours
            )
            contributions_count += 1
          end
        end
      end
    end

    puts "  ✓ #{reports_count} attendance reports, #{contributions_count} contributions"
  end

  def pick_contribution_type
    roll = rand(100)
    cumulative = 0
    CONTRIBUTION_TYPE_WEIGHTS.each do |type, weight|
      cumulative += weight
      return type.constantize if roll < cumulative
    end
    Tithe # fallback (unreachable)
  end

  def contribution_amount_for(country)
    case country
    when "Mexico"    then rand(500..5000)
    when "Argentina" then rand(5_000..50_000)
    else                  rand(100..1000)
    end
  end

  def create_service_requests
    puts "Creating service requests..."
    central     = Church.find_by(name: "Iglesia Central")
    norte       = Church.find_by(name: "Iglesia del Norte")
    esperanza   = Church.find_by(name: "Iglesia Esperanza")
    nueva_vida  = Church.find_by(name: "Iglesia Nueva Vida")

    pedro_lead  = User.find_by(account: Account.find_by(email: "pedro.lider@demo.dev"))
    roberto_lead = User.find_by(account: Account.find_by(email: "roberto.lider@demo.dev"))

    carlos = User.find_by(account: Account.find_by(email: "carlos.mendoza@demo.dev"))
    ana    = User.find_by(account: Account.find_by(email: "ana.rodriguez@demo.dev"))
    laura  = User.find_by(account: Account.find_by(email: "laura.martinez@demo.dev"))
    miguel = User.find_by(account: Account.find_by(email: "miguel.torres@demo.dev"))

    requests = [
      { church: central,    requested_by: carlos, status: :pending,
        service_type: "Reunión de Jóvenes",  requested_for: 1.week.from_now },
      { church: central,    requested_by: carlos, reviewed_by: pedro_lead, status: :approved,
        service_type: "Conferencia Familiar", requested_for: 3.weeks.from_now,
        reviewed_at_offset: 1.week.ago },
      { church: norte,      requested_by: ana,    reviewed_by: pedro_lead, status: :rejected,
        service_type: "Servicio Especial",   requested_for: 2.weeks.from_now,
        reviewed_at_offset: 3.days.ago },
      { church: esperanza,  requested_by: laura,  status: :pending,
        service_type: "Vigilia",              requested_for: 10.days.from_now },
      { church: nueva_vida, requested_by: miguel, reviewed_by: roberto_lead, status: :approved,
        service_type: "Bautismos",            requested_for: 4.weeks.from_now,
        reviewed_at_offset: 2.weeks.ago }
    ]

    @service_requests = requests.map do |spec|
      ActsAsTenant.with_tenant(spec[:church].ministry) do
        ServiceRequest.create!(
          ministry:     spec[:church].ministry,
          church:       spec[:church],
          requested_by: spec[:requested_by],
          reviewed_by:  spec[:reviewed_by],
          service_type: spec[:service_type],
          requested_for: spec[:requested_for],
          status:       spec[:status]
        )
      end
    end

    by_status = @service_requests.group_by(&:status).transform_values(&:length)
    puts "  ✓ #{@service_requests.size} service requests (#{by_status})"
  end

  def create_demo_notifications
    puts "Creating demo notifications..."
    count = 0

    User.where(role: :lead_pastor).find_each do |lead|
      # 3 unread + 2 read = 5 total per lead pastor
      count += seed_notifications_for(lead, [
        { kind: "service_request_created",     read: false, days_ago: 1 },
        { kind: "attendance_report_submitted", read: false, days_ago: 2 },
        { kind: "contribution_recorded",       read: false, days_ago: 3 },
        { kind: "attendance_report_submitted", read: true,  days_ago: 7 },
        { kind: "contribution_recorded",       read: true,  days_ago: 10 }
      ])
    end

    User.where(role: :pastor).find_each do |pastor|
      # 2 unread per pastor (their service request feedback)
      count += seed_notifications_for(pastor, [
        { kind: "service_request_approved", read: false, days_ago: 1 },
        { kind: "service_request_rejected", read: false, days_ago: 2 }
      ])
    end

    puts "  ✓ #{count} demo notifications"
  end

  def seed_notifications_for(user, items)
    items.each do |item|
      Notification.create!(
        recipient:  user,
        kind:       item[:kind],
        payload:    payload_for_demo(item[:kind], user),
        read_at:    item[:read] ? item[:days_ago].days.ago + 1.hour : nil,
        created_at: item[:days_ago].days.ago,
        updated_at: item[:days_ago].days.ago
      )
    end
    items.length
  end

  def payload_for_demo(kind, user)
    case kind
    when "service_request_created"
      { "service_request_id" => 1, "service_type" => "Reunión Especial",
        "requested_by_name"  => "Carlos Mendoza", "church_name" => "Iglesia Central",
        "requested_for"      => 1.week.from_now.iso8601,
        "target_url"         => "/lead-pastor/services?request=1" }
    when "service_request_approved"
      { "service_request_id" => 2, "service_type" => "Conferencia Familiar",
        "reviewed_by_name"   => user.ministry&.users&.find_by(role: :lead_pastor)&.full_name,
        "church_name"        => "Iglesia Central",
        "requested_for"      => 3.weeks.from_now.iso8601,
        "target_url"         => "/pastor/services" }
    when "service_request_rejected"
      { "service_request_id" => 3, "service_type" => "Servicio Especial",
        "reviewed_by_name"   => user.ministry&.users&.find_by(role: :lead_pastor)&.full_name,
        "church_name"        => "Iglesia del Norte",
        "requested_for"      => 2.weeks.from_now.iso8601,
        "target_url"         => "/pastor/services" }
    when "attendance_report_submitted"
      { "attendance_report_id" => 1, "service_id" => 1,
        "reported_by_name" => "Carlos Mendoza", "church_name" => "Iglesia Central",
        "service_type" => "Culto Dominical",
        "service_date" => 1.week.ago.iso8601, "total" => 187,
        "target_url"   => "/lead-pastor/reports" }
    when "contribution_recorded"
      { "contribution_id" => 1, "service_id" => 1, "type" => "Tithe", "type_label" => "Diezmos",
        "amount" => 1500.0, "reported_by_name" => "Carlos Mendoza",
        "church_name" => "Iglesia Central",
        "target_url"  => "/lead-pastor/reports" }
    else
      { "target_url" => "/" }
    end
  end

  def print_summary
    puts ""
    puts "=== Demo accounts (password: #{DEMO_PASSWORD}) ==="
    puts ""
    puts "SUPERADMIN"
    superadmin = User.find_by(role: :superadmin)
    puts "  #{superadmin&.account&.email || '(missing!)'}"
    puts ""

    @ministries.each do |ministry|
      puts "#{ministry.name.upcase} (#{ministry.country})"

      lead = User.find_by(role: :lead_pastor, ministry_id: ministry.id)
      puts "  #{lead.account.email.ljust(34)} lead_pastor   [locale: #{lead.locale}]"

      ministry.churches.includes(:users).order(:name).each do |church|
        church.users.includes(:account).order(:role, :first_name).each do |u|
          label = u.role == "pastor" ? "pastor       " : "assistant    "
          puts "  #{u.account.email.ljust(34)} #{label} #{church.name} (#{church.city})"
        end
      end
      puts ""
    end

    puts "=== Stats ==="
    puts "  #{Church.count} churches, #{Service.count} services " \
         "(#{Service.where(status: :completed).count} past + " \
         "#{Service.where(status: :scheduled).count} upcoming), " \
         "#{AttendanceReport.count} attendance reports, " \
         "#{Contribution.count} contributions"
    puts "  #{ServiceRequest.count} service requests " \
         "(#{ServiceRequest.pending.count} pending, " \
         "#{ServiceRequest.approved.count} approved, " \
         "#{ServiceRequest.rejected.count} rejected)"
    puts "  #{Notification.count} demo notifications"
    puts ""
    puts "✓ Demo data seeded successfully"
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
