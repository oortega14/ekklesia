require "rails_helper"

RSpec.describe Notifications::Builders::AttendanceReportSubmitted do
  let(:ministry) { create(:ministry) }
  let(:church)   { create(:church, ministry: ministry) }
  let!(:lead)    { create(:user, :lead_pastor, ministry: ministry) }
  let!(:pastor)  { create(:user, :pastor, ministry: ministry, church: church) }
  let(:assistant) { create(:user, :assistant, ministry: ministry, church: church) }

  let(:report) do
    ActsAsTenant.with_tenant(ministry) do
      svc = create(:service, ministry: ministry, church: church, service_type: "Culto Dominical")
      create(:attendance_report, service: svc, ministry: ministry, reported_by: assistant,
                                 adults: 100, youth: 0, children: 0)
    end
  end

  it "when actor is assistant, recipients include lead pastor + church pastor" do
    builder = described_class.new(report, assistant)
    expect(builder.recipients).to match_array([ lead, pastor ])
  end

  it "when actor is lead_pastor, recipients are only lead pastors of the ministry" do
    builder = described_class.new(report, lead)
    expect(builder.recipients).to eq([ lead ])
  end

  it "payload target_url depends on the recipient role" do
    builder = described_class.new(report, assistant)
    expect(builder.payload_for(lead)["target_url"]).to eq("/lead-pastor/reports")
    expect(builder.payload_for(pastor)["target_url"]).to eq("/pastor/reports")
  end

  it "payload includes report details" do
    builder = described_class.new(report, assistant)
    payload = builder.payload_for(lead)
    expect(payload["total"]).to eq(100)
    expect(payload["reported_by_name"]).to eq(assistant.full_name)
    expect(payload["service_type"]).to eq("Culto Dominical")
  end
end
