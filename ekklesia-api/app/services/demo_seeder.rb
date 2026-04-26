# Populates the database with demo data for manual testing of every role's
# flows. Destructive: each run wipes prior demo data and reseeds. Preserves
# the seeded superadmin from db/seeds.rb.
#
# Design doc: docs/superpowers/specs/2026-04-26-demo-seed-design.md
class DemoSeeder
  DEMO_PASSWORD = "Demo2026!"
  DEMO_EMAIL_DOMAIN = "demo.dev"

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
    puts "  [stub] wipe_existing_demo_data!"
  end

  def create_ministries_and_users
    puts "  [stub] create_ministries_and_users"
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
