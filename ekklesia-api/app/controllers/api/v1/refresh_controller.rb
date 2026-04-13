module Api
  module V1
    class RefreshController < ApplicationController
      skip_before_action :authenticate!
      skip_before_action :set_tenant

      def create
        refresh_token = params[:refresh_token]
        return render json: { error: 'Invalid or expired token' }, status: :unauthorized unless refresh_token

        begin
          unverified = JWT.decode(refresh_token, nil, false)[0]
          account_id = extract_account_id(unverified)
          raise JWT::DecodeError, 'Invalid token' unless account_id

          account = Account.find(account_id)
          secret  = "#{Rails.application.secret_key_base}-#{account.jwt_secret}"

          # Verify signature — get the verified payload
          verified, = JWT.decode(refresh_token, secret, true, algorithm: 'HS256')
          raise JWT::DecodeError, 'Invalid token type' unless verified['type'] == 'refresh'

          # Accounts are considered open for status 1 and 2 in this app.
          # Reject only explicitly closed accounts.
          raise JWT::DecodeError, 'Account not active' if account.closed?

          user = User.find_by!(account: account)

          access_payload = {
            'sub'         => account.id.to_s,
            'account_id'  => account.id,
            'iat'         => Time.current.to_i,
            'exp'         => 30.minutes.from_now.to_i,
            'role'        => user.role,
            'ministry_id' => user.ministry_id,
            'church_id'   => user.church_id
          }
          access_token = JWT.encode(access_payload, secret, 'HS256')

          render json: { access_token: access_token }
        rescue JWT::DecodeError, JWT::ExpiredSignature, ActiveRecord::RecordNotFound
          render json: { error: 'Invalid or expired token' }, status: :unauthorized
        end
      end

      private

      def extract_account_id(payload)
        %w[sub account_id id].each do |key|
          value = payload[key] || payload[key.to_sym]
          parsed = Integer(value, exception: false)
          return parsed if parsed&.positive?
        end

        nil
      end
    end
  end
end
