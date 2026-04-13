class Service < ApplicationRecord
  acts_as_tenant :ministry

  belongs_to :ministry
  belongs_to :church
  has_one    :attendance_report, dependent: :destroy
  has_many   :contributions, dependent: :destroy

  enum :status, { scheduled: 0, completed: 1, cancelled: 2 }

  validates :service_type, :scheduled_at, presence: true
end
