FactoryBot.define do
  factory :contribution do
    ministry
    service
    association :reported_by, factory: :user
    amount       { Faker::Commerce.price(range: 100..5000) }
    currency     { 'MXN' }
    submitted_at { Time.current }

    factory :tithe,      class: 'Tithe'
    factory :offering,   class: 'Offering'
    factory :donation,   class: 'Donation'
    factory :firstfruit, class: 'Firstfruit'
    factory :covenant,   class: 'Covenant'
  end
end
