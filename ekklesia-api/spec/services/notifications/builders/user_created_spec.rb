require "rails_helper"

RSpec.describe Notifications::Builders::UserCreated do
  let(:ministry) { create(:ministry) }
  let(:church)   { create(:church, ministry: ministry) }
  let!(:lead)    { create(:user, :lead_pastor, ministry: ministry) }
  let!(:pastor)  { create(:user, :pastor, ministry: ministry, church: church) }
  let(:actor)    { create(:user, :superadmin) }

  it "when new user is a pastor, recipients are lead pastors" do
    new_pastor = create(:user, :pastor, ministry: ministry, church: church)
    builder = described_class.new(new_pastor, actor)
    expect(builder.recipients).to eq([ lead ])
  end

  it "when new user is an assistant, recipients are church pastor + lead pastors" do
    new_asst = create(:user, :assistant, ministry: ministry, church: church)
    builder = described_class.new(new_asst, actor)
    expect(builder.recipients).to match_array([ lead, pastor ])
  end

  it "payload includes user_role_label translated" do
    new_asst = create(:user, :assistant, ministry: ministry, church: church)
    builder = described_class.new(new_asst, actor)
    payload = builder.payload_for(lead)
    expect(payload["user_role_label"]).to eq("Ayudante")
    expect(payload["church_name"]).to eq(church.name)
  end

  it "payload target_url depends on the recipient role" do
    new_asst = create(:user, :assistant, ministry: ministry, church: church)
    builder = described_class.new(new_asst, actor)
    expect(builder.payload_for(lead)["target_url"]).to eq("/lead-pastor/pastors")
    expect(builder.payload_for(pastor)["target_url"]).to eq("/pastor/assistants")
  end
end
