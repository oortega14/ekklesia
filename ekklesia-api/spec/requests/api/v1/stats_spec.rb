require 'rails_helper'

RSpec.describe 'GET /api/v1/stats', type: :request do
  context 'without token' do
    it 'returns 401' do
      get '/api/v1/stats'
      expect(response).to have_http_status(:unauthorized)
    end
  end

  context 'as superadmin' do
    let(:user) { create(:user, :superadmin) }

    it 'returns superadmin KPIs' do
      ministry = create(:ministry)
      create_list(:church, 3, ministry: ministry)
      get '/api/v1/stats', headers: auth_headers_for(user)
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body).to include(
        'total_churches',
        'total_users',
        'services_this_month',
        'total_contributions_amount',
        'total_attendance'
      )
      expect(body['total_churches']).to eq(3)
    end
  end

  context 'as lead_pastor' do
    let(:ministry) { create(:ministry) }
    let(:user)     { create(:user, :lead_pastor, ministry: ministry) }

    it 'returns lead_pastor KPIs' do
      get '/api/v1/stats', headers: auth_headers_for(user)
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body).to include(
        'churches_count',
        'pastors_count',
        'services_this_month',
        'total_attendance',
        'total_contributions'
      )
    end

    it 'counts only churches within own ministry' do
      other_ministry = create(:ministry)
      create_list(:church, 2, ministry: other_ministry)  # should NOT be counted
      create_list(:church, 3, ministry: ministry)          # should be counted
      get '/api/v1/stats', headers: auth_headers_for(user)
      body = JSON.parse(response.body)
      expect(body['churches_count']).to eq(3)
    end
  end

  context 'as pastor' do
    let(:ministry) { create(:ministry) }
    let(:church)   { create(:church, ministry: ministry) }
    let(:user)     { create(:user, :pastor, ministry: ministry, church: church) }

    it 'returns pastor KPIs' do
      get '/api/v1/stats', headers: auth_headers_for(user)
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body).to include(
        'services_count',
        'pending_attendance_reports',
        'pending_contributions',
        'assistants_count'
      )
    end

    it 'counts only services within own church' do
      other_church = create(:church, ministry: ministry)
      create_list(:service, 4, ministry: ministry, church: church)       # should be counted
      create_list(:service, 2, ministry: ministry, church: other_church) # should NOT be counted
      get '/api/v1/stats', headers: auth_headers_for(user)
      body = JSON.parse(response.body)
      expect(body['services_count']).to eq(4)
    end
  end

  context 'as assistant' do
    let(:ministry) { create(:ministry) }
    let(:church)   { create(:church, ministry: ministry) }
    let(:user)     { create(:user, :assistant, ministry: ministry, church: church) }

    it 'returns assistant KPIs' do
      get '/api/v1/stats', headers: auth_headers_for(user)
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body).to include(
        'pending_service_requests',
        'submitted_reports_count'
      )
    end
  end
end
