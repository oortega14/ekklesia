require "rails_helper"

RSpec.describe PruneOldNotificationsJob, type: :job do
  let(:user) { create(:user, :lead_pastor) }

  it "deletes notifications older than 90 days" do
    old = create(:notification, recipient: user, created_at: 91.days.ago, updated_at: 91.days.ago)
    create(:notification, recipient: user, created_at: 89.days.ago, updated_at: 89.days.ago)

    expect {
      described_class.perform_now
    }.to change(Notification, :count).by(-1)

    expect(Notification.exists?(old.id)).to be false
  end

  it "is idempotent (running twice doesn't error)" do
    create(:notification, recipient: user, created_at: 91.days.ago, updated_at: 91.days.ago)
    described_class.perform_now
    expect { described_class.perform_now }.not_to raise_error
  end
end
