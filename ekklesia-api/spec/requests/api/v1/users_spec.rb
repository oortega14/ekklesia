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

    it "enqueues a NotifyJob with kind user_created" do
      superadmin = create(:user, :superadmin)
      lead # ensure a recipient lead_pastor exists for this ministry
      expect {
        post "/api/v1/users",
          headers: auth_headers_for(superadmin),
          params: { user: {
            email: "newpastor#{rand(10000)}@example.com",
            password: "Pastor123!",
            first_name: "Nuevo",
            last_name: "Pastor",
            role: "pastor",
            ministry_id: ministry.id,
            church_id: church.id
          } }
      }.to have_enqueued_job(NotifyJob).with(hash_including(kind: "user_created"))
    end
  end
end

RSpec.describe 'Api::V1::Users', type: :request do
  describe 'GET /api/v1/users' do
    let(:ministry_a) { create(:ministry) }
    let(:ministry_b) { create(:ministry) }
    let(:church_a)   { create(:church, ministry: ministry_a) }

    let(:superadmin) { create(:user, :superadmin) }
    let(:lead_a)     { create(:user, :lead_pastor, ministry: ministry_a) }
    let(:pastor_a)   { create(:user, :pastor, ministry: ministry_a, church: church_a) }
    let!(:lead_b)    { create(:user, :lead_pastor, ministry: ministry_b) }

    it 'superadmin sees all non-superadmin users from every ministry' do
      lead_a; pastor_a; lead_b
      get '/api/v1/users', headers: auth_headers_for(superadmin)
      expect(response).to have_http_status(:ok)
      ids = JSON.parse(response.body)['users'].map { |u| u['id'] }
      expect(ids).to include(lead_a.id, pastor_a.id, lead_b.id)
      expect(ids).not_to include(superadmin.id)
    end

    it 'lead_pastor only sees users in their own ministry' do
      lead_a; pastor_a; lead_b
      get '/api/v1/users', headers: auth_headers_for(lead_a)
      expect(response).to have_http_status(:ok)
      ministry_ids = JSON.parse(response.body)['users'].map { |u| u['ministry_id'] }.uniq
      expect(ministry_ids).to eq([ ministry_a.id ])
    end

    it 'payload includes church_name and ministry_name' do
      pastor_a
      get '/api/v1/users', headers: auth_headers_for(superadmin)
      payload = JSON.parse(response.body)['users'].find { |u| u['id'] == pastor_a.id }
      expect(payload['church_name']).to eq(church_a.name)
      expect(payload['ministry_name']).to eq(ministry_a.name)
    end
  end

  describe "PATCH /api/v1/users/:id (locale self-update)" do
    let(:ministry) { create(:ministry) }
    let(:user)     { create(:user, :lead_pastor, ministry: ministry) }

    it "user updates their own locale to en" do
      patch "/api/v1/users/#{user.id}",
            headers: auth_headers_for(user),
            params:  { user: { locale: "en" } }
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["user"]["locale"]).to eq("en")
      expect(user.reload.locale).to eq("en")
    end

    it "rejects unsupported locale" do
      patch "/api/v1/users/#{user.id}",
            headers: auth_headers_for(user),
            params:  { user: { locale: "fr" } }
      expect(response).to have_http_status(:unprocessable_entity)
      expect(user.reload.locale).to eq("es")
    end

    it "rejects empty locale" do
      patch "/api/v1/users/#{user.id}",
            headers: auth_headers_for(user),
            params:  { user: { locale: "" } }
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "user cannot update another user's locale unless superadmin" do
      ministry_b = create(:ministry)
      other      = create(:user, :lead_pastor, ministry: ministry_b)
      patch "/api/v1/users/#{other.id}",
            headers: auth_headers_for(user),
            params:  { user: { locale: "en" } }
      expect(response).to have_http_status(:forbidden)
    end

    it "GET /api/v1/users index payload includes locale" do
      user # materialize
      get "/api/v1/users", headers: auth_headers_for(create(:user, :superadmin))
      first = JSON.parse(response.body)["users"].first
      expect(first.keys).to include("locale")
    end
  end
end
