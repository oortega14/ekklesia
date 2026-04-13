class AttendanceReport < ApplicationRecord
  acts_as_tenant :ministry

  belongs_to :ministry
  belongs_to :service
  belongs_to :reported_by, class_name: 'User', foreign_key: :reported_by_id

  validates :adults, :youth, :children, presence: true,
                                         numericality: { greater_than_or_equal_to: 0 }

  before_save :compute_total
  before_save :set_submitted_at

  private

  def compute_total
    self.total = adults.to_i + youth.to_i + children.to_i
  end

  def set_submitted_at
    self.submitted_at ||= Time.current
  end
end
