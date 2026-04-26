require "rails_helper"

RSpec.describe Notifications::Builders::ContributionRecorded do
  let(:ministry) { create(:ministry) }
  let(:church)   { create(:church, ministry: ministry) }
  let!(:lead)    { create(:user, :lead_pastor, ministry: ministry) }
  let!(:pastor)  { create(:user, :pastor, ministry: ministry, church: church) }
  let(:assistant) { create(:user, :assistant, ministry: ministry, church: church) }

  let(:contribution) do
    ActsAsTenant.with_tenant(ministry) do
      svc = create(:service, ministry: ministry, church: church)
      create(:tithe, service: svc, ministry: ministry, reported_by: assistant, amount: 1500)
    end
  end

  it "when actor is assistant, recipients include lead + church pastor" do
    builder = described_class.new(contribution, assistant)
    expect(builder.recipients).to match_array([ lead, pastor ])
  end

  it "payload includes type, type_label and amount as float" do
    builder = described_class.new(contribution, assistant)
    payload = builder.payload_for(lead)
    expect(payload["type"]).to eq("Tithe")
    expect(payload["type_label"]).to eq("Diezmos")
    expect(payload["amount"]).to eq(1500.0)
  end

  it "payload target_url depends on recipient role" do
    builder = described_class.new(contribution, assistant)
    expect(builder.payload_for(lead)["target_url"]).to eq("/lead-pastor/reports")
    expect(builder.payload_for(pastor)["target_url"]).to eq("/pastor/reports")
  end
end
