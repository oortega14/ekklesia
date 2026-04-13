FactoryBot.define do
  factory :account do
    email      { Faker::Internet.unique.email }
    jwt_secret { SecureRandom.hex(32) }
    status     { :verified }
  end
end
