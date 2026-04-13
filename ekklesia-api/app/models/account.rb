class Account < ApplicationRecord
  include Rodauth::Rails.model

  enum :status, { unverified: 1, verified: 2, closed: 3 }

  has_one :user, dependent: :destroy

  before_create do
    self.jwt_secret = SecureRandom.hex(32) if jwt_secret.blank?
  end
end
