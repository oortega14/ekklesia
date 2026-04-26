class Notification < ApplicationRecord
  belongs_to :recipient, class_name: "User"

  scope :unread, -> { where(read_at: nil) }

  def read!
    update_column(:read_at, Time.current) unless read_at
  end
end
