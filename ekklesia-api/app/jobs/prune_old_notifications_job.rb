class PruneOldNotificationsJob < ApplicationJob
  queue_as :default

  RETENTION = 90.days

  def perform
    Notification.where("created_at < ?", RETENTION.ago).delete_all
  end
end
