class Contribution < ApplicationRecord
  acts_as_tenant :ministry

  belongs_to :ministry
  belongs_to :service
  belongs_to :reported_by, class_name: 'User', foreign_key: :reported_by_id

  validates :amount, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :type, presence: true

  before_save do
    self.submitted_at ||= Time.current
  end
end
