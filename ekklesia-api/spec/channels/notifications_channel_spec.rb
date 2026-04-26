require "rails_helper"

RSpec.describe NotificationsChannel, type: :channel do
  let(:user) { create(:user, :lead_pastor) }

  it "subscribes when current_user is identified and streams for that user" do
    stub_connection current_user: user
    subscribe
    expect(subscription).to be_confirmed
    expect(subscription).to have_stream_for(user)
  end

  it "rejects subscription when current_user is nil" do
    stub_connection current_user: nil
    subscribe
    expect(subscription).to be_rejected
  end
end
