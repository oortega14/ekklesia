FactoryBot.define do
  factory :ministry do
    name    { Faker::Company.name }
    slug    { name.parameterize }
    country { 'Mexico' }
    city    { Faker::Address.city }
  end
end
