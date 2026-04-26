class NotifyJob < ApplicationJob
  queue_as :default

  def perform(kind:, dispatches:)
    user_ids = dispatches.map { |d| d["recipient_id"] || d[:recipient_id] }.uniq
    users    = User.where(id: user_ids).index_by(&:id)

    dispatches.each do |raw|
      d = raw.with_indifferent_access
      user = users[d["recipient_id"]]
      next unless user

      notification = Notification.create!(
        recipient_id: user.id,
        kind:         kind,
        payload:      d["payload"]
      )
      NotificationsChannel.broadcast_to(user, serialize_notification(notification))
    end
  end

  private

  def serialize_notification(n)
    {
      id:         n.id,
      kind:       n.kind,
      payload:    n.payload,
      read_at:    nil,
      created_at: n.created_at.iso8601
    }
  end
end
