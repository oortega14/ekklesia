require 'rails_helper'

RSpec.describe 'Ministries', type: :request do
  describe 'GET /api/v1/ministries' do
    let!(:superadmin) { create(:user, :superadmin) }

    it 'superadmin can list all ministries' do
      create_list(:ministry, 3)
      get '/api/v1/ministries', headers: auth_headers_for(superadmin)
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['ministries'].size).to eq(3)
    end

    it 'lead_pastor gets 403' do
      ministry = create(:ministry)
      user     = create(:user, :lead_pastor, ministry: ministry)
      get '/api/v1/ministries', headers: auth_headers_for(user)
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'POST /api/v1/ministries' do
    let(:superadmin) { create(:user, :superadmin) }

    it 'superadmin creates a ministry' do
      post '/api/v1/ministries',
        headers: auth_headers_for(superadmin),
        params: { ministry: { name: 'Nueva Iglesia', country: 'Mexico', city: 'Monterrey' } }
      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)['ministry']['name']).to eq('Nueva Iglesia')
    end
  end
end
