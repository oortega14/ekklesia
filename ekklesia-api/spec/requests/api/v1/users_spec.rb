require 'rails_helper'

RSpec.describe 'Users', type: :request do
  let(:ministry) { create(:ministry) }
  let(:lead)     { create(:user, :lead_pastor, ministry: ministry) }
  let(:church)   { create(:church, ministry: ministry) }

  describe 'POST /api/v1/users' do
    it 'lead_pastor creates a pastor' do
      post '/api/v1/users',
        headers: auth_headers_for(lead),
        params: {
          user: {
            email:      'pastor@test.com',
            password:   'secret123',
            first_name: 'Juan',
            last_name:  'Lopez',
            role:       'pastor',
            church_id:  church.id
          }
        }
      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)['user']['role']).to eq('pastor')
    end

    it 'assistant cannot create users' do
      assistant = create(:user, :assistant, ministry: ministry, church: church)
      post '/api/v1/users',
        headers: auth_headers_for(assistant),
        params: { user: { email: 'x@x.com', password: 'pass12345', first_name: 'X', last_name: 'Y', role: 'assistant' } }
      expect(response).to have_http_status(:forbidden)
    end
  end
end
