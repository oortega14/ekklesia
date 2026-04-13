require 'rails_helper'

RSpec.describe 'Auth', type: :request do
  describe 'GET /api/v1/auth/me' do
    let(:ministry) { create(:ministry) }
    let(:user)     { create(:user, :lead_pastor, ministry: ministry) }

    context 'with valid token' do
      it 'returns current user data' do
        get '/api/v1/auth/me', headers: auth_headers_for(user)
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['user']['email']).to eq(user.email)
        expect(json['user']['role']).to  eq('lead_pastor')
      end
    end

    context 'without token' do
      it 'returns 401' do
        get '/api/v1/auth/me'
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
