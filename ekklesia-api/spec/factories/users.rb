FactoryBot.define do
  factory :user do
    account
    ministry
    first_name { Faker::Name.first_name }
    last_name  { Faker::Name.last_name }
    phone      { Faker::PhoneNumber.cell_phone }
    role       { :lead_pastor }

    trait :superadmin do
      role       { :superadmin }
      ministry   { nil }
      church     { nil }
    end

    trait :lead_pastor do
      role { :lead_pastor }
    end

    trait :pastor do
      role   { :pastor }
      church { association :church }
    end

    trait :assistant do
      role   { :assistant }
      church { association :church }
    end
  end
end
