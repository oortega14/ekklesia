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

    it 'superadmin creates a ministry without a lead pastor' do
      post '/api/v1/ministries',
        headers: auth_headers_for(superadmin),
        params: { ministry: { name: 'Nueva Iglesia', country: 'Mexico', city: 'Monterrey' } }
      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)['ministry']['name']).to eq('Nueva Iglesia')
    end

    context 'with lead_pastor in payload' do
      let(:valid_payload) do
        {
          ministry: { name: 'Ministerio Atomico', country: 'Mexico', city: 'CDMX' },
          lead_pastor: {
            email:      'pastor@example.com',
            password:   'Pastor123!',
            first_name: 'Pedro',
            last_name:  'Lider',
            phone:      '+52 55 0000 0000'
          }
        }
      end

      it 'creates ministry, account and lead_pastor user atomically' do
        superadmin # materialize the requesting user before measuring deltas

        expect {
          post '/api/v1/ministries', headers: auth_headers_for(superadmin), params: valid_payload
        }.to change(Ministry, :count).by(1)
         .and change(Account, :count).by(1)
         .and change(User, :count).by(1)

        expect(response).to have_http_status(:created)
        body = JSON.parse(response.body)
        expect(body['ministry']['name']).to eq('Ministerio Atomico')
        expect(body['lead_pastor']['email']).to eq('pastor@example.com')
        expect(body['lead_pastor']['role']).to eq('lead_pastor')

        created_user = User.find(body['lead_pastor']['id'])
        expect(created_user.ministry.name).to eq('Ministerio Atomico')
        expect(created_user.account.email).to eq('pastor@example.com')
      end

      it 'sets jwt_secret on the new account' do
        post '/api/v1/ministries', headers: auth_headers_for(superadmin), params: valid_payload
        new_user = User.find(JSON.parse(response.body)['lead_pastor']['id'])
        expect(new_user.account.jwt_secret).to be_present
      end

      it 'rolls back the entire transaction when the email is taken' do
        existing = create(:account, email: 'pastor@example.com')
        existing # touch

        expect {
          post '/api/v1/ministries', headers: auth_headers_for(superadmin), params: valid_payload
        }.not_to change(Ministry, :count)
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'returns errors when lead_pastor fields are missing' do
        post '/api/v1/ministries',
          headers: auth_headers_for(superadmin),
          params: valid_payload.deep_merge(lead_pastor: { first_name: '' })
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['errors']).to be_an(Array)
        expect(Ministry.where(name: 'Ministerio Atomico')).to be_empty
      end
    end

    it 'lead_pastor cannot create a ministry' do
      ministry = create(:ministry)
      user     = create(:user, :lead_pastor, ministry: ministry)
      post '/api/v1/ministries',
        headers: auth_headers_for(user),
        params: { ministry: { name: 'Otro' } }
      expect(response).to have_http_status(:forbidden)
    end
  end
end
