class ServiceRequest < ApplicationRecord
  acts_as_tenant :ministry

  belongs_to :ministry
  belongs_to :church
  belongs_to :requested_by, class_name: 'User', foreign_key: :requested_by_id
  belongs_to :reviewed_by,  class_name: 'User', foreign_key: :reviewed_by_id, optional: true

  enum :status, { pending: 0, approved: 1, rejected: 2 }

  validates :service_type, :requested_for, presence: true
end
