# Create the superadmin account
# Run with: rails db:seed
# Or reset and seed: rails db:seed:replant

puts 'Creating superadmin...'

email    = ENV.fetch('SUPERADMIN_EMAIL',    'admin@ekklesia.dev')
password = ENV.fetch('SUPERADMIN_PASSWORD', 'Ekklesia2026!')

account = Account.find_or_initialize_by(email: email)

account.status = :verified
account.jwt_secret = SecureRandom.hex(32) if account.jwt_secret.blank?

if account.new_record?
  account.password_hash = BCrypt::Password.create(password)
  account.save!

  User.create!(
    account:    account,
    ministry:   nil,
    church:     nil,
    first_name: 'Super',
    last_name:  'Admin',
    role:       :superadmin
  )
  puts "Superadmin created: #{email}"
else
  account.save! if account.changed?
  puts "Superadmin already exists: #{email}"
end
