require "rails_helper"

RSpec.describe NotifyJob, type: :job do
  let(:user1) { create(:user, :lead_pastor) }
  let(:user2) { create(:user, :pastor) }

  let(:dispatches) do
    [
      { recipient_id: user1.id, payload: { "target_url" => "/a", "info" => 1 } },
      { recipient_id: user2.id, payload: { "target_url" => "/b", "info" => 2 } }
    ]
  end

  it "creates one notification per dispatch" do
    expect {
      described_class.perform_now(kind: "fake_kind", dispatches: dispatches)
    }.to change(Notification, :count).by(2)
  end

  it "sets the right kind, payload, and recipient" do
    described_class.perform_now(kind: "fake_kind", dispatches: dispatches)
    n = Notification.find_by(recipient_id: user1.id)
    expect(n.kind).to eq("fake_kind")
    expect(n.payload).to eq("target_url" => "/a", "info" => 1)
    expect(n.read_at).to be_nil
  end

  it "broadcasts to each recipient's channel" do
    expect {
      described_class.perform_now(kind: "fake_kind", dispatches: dispatches)
    }.to have_broadcasted_to(user1).from_channel(NotificationsChannel)
     .and have_broadcasted_to(user2).from_channel(NotificationsChannel)
  end

  it "skips dispatches whose recipient was deleted between enqueue and run" do
    user2.destroy
    expect {
      described_class.perform_now(kind: "fake_kind", dispatches: dispatches)
    }.to change(Notification, :count).by(1)
    expect(Notification.find_by(recipient_id: user1.id)).to be_present
  end
end
