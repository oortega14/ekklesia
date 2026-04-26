require "rails_helper"

RSpec.describe Notifications::Builders::ServiceRequestCreated do
  let(:ministry_a) { create(:ministry) }
  let(:ministry_b) { create(:ministry) }
  let(:church_a)   { create(:church, ministry: ministry_a) }
  let!(:lead_a)    { create(:user, :lead_pastor, ministry: ministry_a) }
  let!(:lead_b)    { create(:user, :lead_pastor, ministry: ministry_b) }
  let(:pastor_a)   { create(:user, :pastor, ministry: ministry_a, church: church_a) }

  let(:request) do
    ActsAsTenant.with_tenant(ministry_a) do
      create(:service_request, ministry: ministry_a, church: church_a,
                               requested_by: pastor_a, service_type: "Culto Especial",
                               requested_for: 2.days.from_now)
    end
  end

  it "recipients are lead pastors of the same ministry only" do
    builder = described_class.new(request, pastor_a)
    expect(builder.recipients).to eq([ lead_a ])
  end

  it "payload includes service info and target_url" do
    builder = described_class.new(request, pastor_a)
    payload = builder.payload_for(lead_a)
    expect(payload["service_type"]).to eq("Culto Especial")
    expect(payload["requested_by_name"]).to eq(pastor_a.full_name)
    expect(payload["church_name"]).to eq(church_a.name)
    expect(payload["target_url"]).to eq("/lead-pastor/services?request=#{request.id}")
  end
end
