require 'rails_helper'

RSpec.describe 'GET /api/v1/churches', type: :request do
  context 'without token' do
    it 'returns 401' do
      get '/api/v1/churches'
      expect(response).to have_http_status(:unauthorized)
    end
  end

  context 'with valid token' do
    let(:ministry) { create(:ministry) }
    let(:user)     { create(:user, :lead_pastor, ministry: ministry) }

    it 'returns 200' do
      get '/api/v1/churches', headers: auth_headers_for(user)
      expect(response).to have_http_status(:ok)
    end
  end
end
