FactoryBot.define do
  factory :service do
    ministry
    church
    service_type  { 'Culto Dominical' }
    scheduled_at  { 1.week.from_now }
    status        { :scheduled }
  end
end
