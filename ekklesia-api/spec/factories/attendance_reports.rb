FactoryBot.define do
  factory :attendance_report do
    ministry
    service
    association :reported_by, factory: :user
    adults   { Faker::Number.between(from: 50, to: 200) }
    youth    { Faker::Number.between(from: 10, to: 80) }
    children { Faker::Number.between(from: 5, to: 40) }
    submitted_at { Time.current }
  end
end
