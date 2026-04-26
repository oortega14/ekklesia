require "rails_helper"

RSpec.describe Notifications::Builders::MinistryCreated do
  let(:actor)      { create(:user, :superadmin) }
  let(:ministry)   { create(:ministry, name: "Casa de Oración") }
  let!(:lead)      { create(:user, :lead_pastor, ministry: ministry, first_name: "Pedro", last_name: "Pan") }
  let!(:other_sa)  { create(:user, :superadmin) }

  it "recipients are all superadmins" do
    builder = described_class.new(ministry, actor)
    expect(builder.recipients).to match_array([ actor, other_sa ])
  end

  it "payload includes ministry_name, lead_pastor_name and target_url" do
    builder = described_class.new(ministry, actor)
    payload = builder.payload_for(other_sa)
    expect(payload["ministry_name"]).to eq("Casa de Oración")
    expect(payload["lead_pastor_name"]).to eq("Pedro Pan")
    expect(payload["target_url"]).to eq("/superadmin/ministries")
  end
end
