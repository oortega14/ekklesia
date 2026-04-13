require 'rails_helper'

RSpec.describe 'Auth Refresh', type: :request do
  let(:ministry) { create(:ministry) }
  let(:user)     { create(:user, :lead_pastor, ministry: ministry) }

  def refresh_token_for(user)
    account = user.account
    secret  = "#{Rails.application.secret_key_base}-#{account.jwt_secret}"
    payload = {
      'sub'  => account.id.to_s,
      'iat'  => Time.current.to_i,
      'exp'  => 7.days.from_now.to_i,
      'type' => 'refresh'
    }
    JWT.encode(payload, secret, 'HS256')
  end

  describe 'POST /api/v1/auth/refresh' do
    context 'with valid refresh token' do
      it 'returns a new access token' do
        post '/api/v1/auth/refresh',
          params: { refresh_token: refresh_token_for(user) }
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['access_token']).to be_present

        # Decoded access token should have correct claims
        decoded = JWT.decode(json['access_token'], nil, false)[0]
        expect(decoded['sub']).to eq(user.account.id.to_s)
        expect(decoded['role']).to eq('lead_pastor')
        expect(decoded['type']).not_to eq('refresh')
      end
    end

    context 'with an access token (wrong type)' do
      it 'returns 401' do
        post '/api/v1/auth/refresh',
          params: { refresh_token: auth_headers_for(user)['Authorization'].split(' ').last }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with missing token' do
      it 'returns 401' do
        post '/api/v1/auth/refresh'
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with expired refresh token' do
      it 'returns 401' do
        account = user.account
        secret  = "#{Rails.application.secret_key_base}-#{account.jwt_secret}"
        expired = JWT.encode(
          { 'sub' => account.id.to_s, 'exp' => 1.day.ago.to_i, 'type' => 'refresh' },
          secret, 'HS256'
        )
        post '/api/v1/auth/refresh', params: { refresh_token: expired }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
