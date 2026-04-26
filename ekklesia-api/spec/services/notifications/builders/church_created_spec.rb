require "rails_helper"

RSpec.describe Notifications::Builders::ChurchCreated do
  let(:ministry_a) { create(:ministry) }
  let(:ministry_b) { create(:ministry) }
  let!(:lead_a)    { create(:user, :lead_pastor, ministry: ministry_a) }
  let!(:lead_b)    { create(:user, :lead_pastor, ministry: ministry_b) }
  let(:church)     { create(:church, ministry: ministry_a, name: "Iglesia Sur", city: "Tijuana") }
  let(:actor)      { create(:user, :superadmin) }

  it "recipients are lead pastors of the same ministry only" do
    builder = described_class.new(church, actor)
    expect(builder.recipients).to eq([ lead_a ])
  end

  it "payload includes church name, city, ministry_name, and target_url" do
    builder = described_class.new(church, actor)
    payload = builder.payload_for(lead_a)
    expect(payload["church_name"]).to eq("Iglesia Sur")
    expect(payload["city"]).to eq("Tijuana")
    expect(payload["ministry_name"]).to eq(ministry_a.name)
    expect(payload["target_url"]).to eq("/lead-pastor/churches")
  end
end
