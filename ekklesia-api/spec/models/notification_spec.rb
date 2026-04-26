require "rails_helper"

RSpec.describe Notification, type: :model do
  describe "scopes" do
    it ".unread returns only those with read_at nil" do
      unread = create(:notification, read_at: nil)
      _read  = create(:notification, read_at: 1.hour.ago)
      expect(Notification.unread).to eq([ unread ])
    end
  end

  describe "#read!" do
    it "sets read_at to current time when previously nil" do
      n = create(:notification, read_at: nil)
      freeze_time do
        n.read!
        expect(n.reload.read_at).to be_within(1.second).of(Time.current)
      end
    end

    it "is a no-op when already read" do
      original = 2.hours.ago
      n = create(:notification, read_at: original)
      n.read!
      expect(n.reload.read_at).to be_within(1.second).of(original)
    end
  end

  describe "destroy with recipient" do
    it "is destroyed when recipient is destroyed" do
      user = create(:user, :lead_pastor)
      n = create(:notification, recipient: user)
      expect { user.destroy }.to change(Notification, :count).by(-1)
      expect(Notification.exists?(n.id)).to be false
    end
  end
end
