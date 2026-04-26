require "rails_helper"

RSpec.describe Notifications::Builders::ServiceRequestRejected do
  let(:ministry) { create(:ministry) }
  let(:church)   { create(:church, ministry: ministry) }
  let(:lead)     { create(:user, :lead_pastor, ministry: ministry) }
  let(:pastor)   { create(:user, :pastor, ministry: ministry, church: church) }

  let(:request) do
    ActsAsTenant.with_tenant(ministry) do
      create(:service_request, ministry: ministry, church: church,
                               requested_by: pastor, reviewed_by: lead, status: :rejected,
                               service_type: "Culto Especial")
    end
  end

  it "recipients is the requesting user" do
    builder = described_class.new(request, lead)
    expect(builder.recipients).to eq([ pastor ])
  end

  it "payload includes reviewer name and target_url" do
    builder = described_class.new(request, lead)
    payload = builder.payload_for(pastor)
    expect(payload["reviewed_by_name"]).to eq(lead.full_name)
    expect(payload["target_url"]).to eq("/pastor/services")
  end
end
