class Church < ApplicationRecord
  acts_as_tenant :ministry

  belongs_to :ministry
  has_many :users, dependent: :nullify
  has_many :services, dependent: :destroy
  has_many :service_requests, dependent: :destroy

  enum :status, { active: 0, pending: 1, inactive: 2 }

  validates :name, presence: true
end
