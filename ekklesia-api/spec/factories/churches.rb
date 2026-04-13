FactoryBot.define do
  factory :church do
    ministry
    name    { Faker::Company.name + ' Church' }
    address { Faker::Address.street_address }
    city    { Faker::Address.city }
    status  { :active }
    email   { Faker::Internet.unique.email }
    phone   { Faker::PhoneNumber.cell_phone }
  end
end
