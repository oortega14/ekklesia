namespace :dev do
  desc "Wipe transactional data and reseed with demo accounts " \
       "(destructive: rerunning replaces all demo data; preserves superadmin)"
  task seed_demo: :environment do
    abort "Refusing to run dev:seed_demo in production" if Rails.env.production?

    DemoSeeder.new.call
  end
end
