module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      token = request.params[:token].to_s
      reject_unauthorized_connection if token.blank?

      payload, _ = JWT.decode(token, nil, false) # decode without verification first
      account = Account.find_by(id: payload["account_id"])
      reject_unauthorized_connection unless account

      secret = "#{Rails.application.secret_key_base}-#{account.jwt_secret}"
      verified, _ = JWT.decode(token, secret, true, algorithm: "HS256")
      reject_unauthorized_connection if verified["type"] == "refresh"

      User.find_by(account_id: account.id) || reject_unauthorized_connection
    rescue JWT::DecodeError, JWT::ExpiredSignature
      reject_unauthorized_connection
    end
  end
end
