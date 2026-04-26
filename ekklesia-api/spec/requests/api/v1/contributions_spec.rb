require 'rails_helper'

RSpec.describe 'Contributions', type: :request do
  let(:ministry)  { create(:ministry) }
  let(:church)    { create(:church, ministry: ministry) }
  let(:service)   { create(:service, ministry: ministry, church: church) }
  let(:assistant) { create(:user, :assistant, ministry: ministry, church: church) }

  describe 'POST /api/v1/contributions' do
    it 'assistant submits a tithe' do
      post '/api/v1/contributions',
        headers: auth_headers_for(assistant),
        params: { contribution: { type: 'Tithe', service_id: service.id, amount: 1500.00 } }
      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)['contribution']['type']).to eq('Tithe')
    end

    it 'rejects unknown contribution type' do
      post '/api/v1/contributions',
        headers: auth_headers_for(assistant),
        params: { contribution: { type: 'FakeType', service_id: service.id, amount: 100 } }
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "enqueues a NotifyJob with kind contribution_recorded" do
      create(:user, :lead_pastor, ministry: ministry) # recipient lead pastor
      expect {
        post "/api/v1/contributions",
          headers: auth_headers_for(assistant),
          params: { contribution: { type: "Tithe", service_id: service.id, amount: 100 } }
      }.to have_enqueued_job(NotifyJob).with(hash_including(kind: "contribution_recorded"))
    end
  end

  describe 'GET /api/v1/contributions' do
    it 'returns contributions in tenant scope' do
      create(:tithe, ministry: ministry, service: service, reported_by: assistant)
      get '/api/v1/contributions', headers: auth_headers_for(assistant)
      expect(response).to have_http_status(:ok)
    end
  end
end
