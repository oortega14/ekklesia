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

RSpec.describe 'Api::V1::Churches', type: :request do
  describe 'GET /api/v1/churches' do
    let(:ministry)   { create(:ministry) }
    let(:church)     { create(:church, ministry: ministry) }
    let(:superadmin) { create(:user, :superadmin) }
    let!(:lead)      { create(:user, :lead_pastor, ministry: ministry, first_name: 'Pedro', last_name: 'Pan') }
    let!(:pastor1)   { create(:user, :pastor, ministry: ministry, church: church) }
    let!(:pastor2)   { create(:user, :pastor, ministry: ministry, church: church) }

    it 'payload includes lead_pastor_name from the same ministry' do
      get '/api/v1/churches', headers: auth_headers_for(superadmin)
      payload = JSON.parse(response.body)['churches'].find { |c| c['id'] == church.id }
      expect(payload['lead_pastor_name']).to eq('Pedro Pan')
    end

    it 'payload includes users_count for pastors and assistants assigned to the church' do
      get '/api/v1/churches', headers: auth_headers_for(superadmin)
      payload = JSON.parse(response.body)['churches'].find { |c| c['id'] == church.id }
      expect(payload['users_count']).to eq(2)
    end

    it 'payload includes status' do
      get '/api/v1/churches', headers: auth_headers_for(superadmin)
      payload = JSON.parse(response.body)['churches'].find { |c| c['id'] == church.id }
      expect(payload['status']).to eq('active')
    end
  end
end
