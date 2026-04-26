FactoryBot.define do
  factory :notification do
    recipient { association :user, :lead_pastor }
    kind      { "service_request_created" }
    payload   { { "message" => "test", "target_url" => "/" } }
    read_at   { nil }
  end
end
