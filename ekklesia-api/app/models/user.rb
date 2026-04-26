class User < ApplicationRecord
  belongs_to :account
  belongs_to :ministry, optional: true
  belongs_to :church, optional: true

  has_many :notifications, foreign_key: :recipient_id, dependent: :destroy

  enum :role, {
    superadmin:  0,
    lead_pastor: 1,
    pastor:      2,
    assistant:   3
  }

  validates :first_name, :last_name, :role, presence: true
  validates :ministry_id, presence: true, unless: :superadmin?
  validates :church_id, presence: true, if: -> { pastor? || assistant? }

  delegate :email, to: :account

  def full_name
    "#{first_name} #{last_name}"
  end
end
