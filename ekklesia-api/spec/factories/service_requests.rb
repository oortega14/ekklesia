FactoryBot.define do
  factory :service_request do
    ministry
    church
    association :requested_by, factory: [:user, :pastor]
    service_type  { 'Culto Especial' }
    requested_for { 2.weeks.from_now }
    status        { :pending }
  end
end
