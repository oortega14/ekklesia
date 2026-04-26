require "rails_helper"

RSpec.describe Notifications::Dispatcher do
  before do
    stub_const("Notifications::Builders::FakeKind", Class.new(Notifications::Builders::Base) do
      def recipients
        # Return whatever the test sets up. Default: empty.
        @record[:recipients] || []
      end

      def payload_for(_recipient)
        { "target_url" => "/", "actor_name" => @actor.full_name }
      end
    end)

    stub_const("Notifications::Dispatcher::BUILDERS",
               Notifications::Dispatcher::BUILDERS.merge(fake_kind: "Notifications::Builders::FakeKind"))
  end

  let(:actor) { create(:user, :lead_pastor) }

  it "raises when actor is nil" do
    expect {
      described_class.call(:fake_kind, { recipients: [] }, actor: nil)
    }.to raise_error(ArgumentError, /actor is required/)
  end

  it "raises on unknown kind" do
    expect {
      described_class.call(:does_not_exist, {}, actor: actor)
    }.to raise_error(ArgumentError, /Unknown notification kind/)
  end

  it "filters self-notifications" do
    other = create(:user, :pastor)
    record = { recipients: [ actor, other ] }

    expect {
      described_class.call(:fake_kind, record, actor: actor)
    }.to have_enqueued_job(NotifyJob).with(
      kind: "fake_kind",
      dispatches: [ { recipient_id: other.id, payload: hash_including("target_url" => "/") } ]
    )
  end

  it "is a no-op when no recipients remain after filtering" do
    record = { recipients: [ actor ] } # only actor → filtered out

    expect {
      described_class.call(:fake_kind, record, actor: actor)
    }.not_to have_enqueued_job(NotifyJob)
  end
end
