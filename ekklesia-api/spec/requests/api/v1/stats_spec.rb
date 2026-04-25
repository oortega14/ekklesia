require 'rails_helper'

RSpec.describe 'Api::V1::Stats', type: :request do
  describe 'GET /api/v1/stats/attendance_timeline' do
    let(:ministry_a) { create(:ministry) }
    let(:ministry_b) { create(:ministry) }
    let(:church_a1)  { create(:church, ministry: ministry_a) }
    let(:church_a2)  { create(:church, ministry: ministry_a) }
    let(:church_b)   { create(:church, ministry: ministry_b) }

    let(:superadmin) { create(:user, :superadmin) }
    let(:lead_a)     { create(:user, :lead_pastor, ministry: ministry_a) }
    let(:pastor_a1)  { create(:user, :pastor, ministry: ministry_a, church: church_a1) }

    before do
      ActsAsTenant.with_tenant(ministry_a) do
        svc1 = create(:service, ministry: ministry_a, church: church_a1, scheduled_at: 1.month.ago)
        svc2 = create(:service, ministry: ministry_a, church: church_a2, scheduled_at: 1.month.ago)
        create(:attendance_report, service: svc1, ministry: ministry_a, reported_by: lead_a,
                                   adults: 100, youth: 0, children: 0, submitted_at: 1.month.ago)
        create(:attendance_report, service: svc2, ministry: ministry_a, reported_by: lead_a,
                                   adults: 50,  youth: 0, children: 0, submitted_at: 1.month.ago)
      end
      ActsAsTenant.with_tenant(ministry_b) do
        svc3 = create(:service, ministry: ministry_b, church: church_b, scheduled_at: 1.month.ago)
        create(:attendance_report, service: svc3, ministry: ministry_b,
                                   reported_by: create(:user, :lead_pastor, ministry: ministry_b),
                                   adults: 999, youth: 0, children: 0, submitted_at: 1.month.ago)
      end
    end

    it 'superadmin sees totals across all ministries' do
      get '/api/v1/stats/attendance_timeline', headers: auth_headers_for(superadmin)
      expect(response).to have_http_status(:ok)
      timeline = JSON.parse(response.body)['timeline']
      total = timeline.sum { |p| p['total'] }
      expect(total).to eq(100 + 50 + 999)
    end

    it 'lead_pastor sees only their ministry' do
      get '/api/v1/stats/attendance_timeline', headers: auth_headers_for(lead_a)
      timeline = JSON.parse(response.body)['timeline']
      total = timeline.sum { |p| p['total'] }
      expect(total).to eq(100 + 50)
    end

    it 'pastor sees only their church' do
      get '/api/v1/stats/attendance_timeline', headers: auth_headers_for(pastor_a1)
      timeline = JSON.parse(response.body)['timeline']
      total = timeline.sum { |p| p['total'] }
      expect(total).to eq(100)
    end

    it 'each timeline point has month, label and total' do
      get '/api/v1/stats/attendance_timeline', headers: auth_headers_for(superadmin)
      point = JSON.parse(response.body)['timeline'].first
      expect(point.keys).to match_array(%w[month label total])
    end

    it 'returns 401 without token' do
      get '/api/v1/stats/attendance_timeline'
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'GET /api/v1/stats/contributions_breakdown' do
    let(:ministry_a) { create(:ministry) }
    let(:ministry_b) { create(:ministry) }
    let(:church_a)   { create(:church, ministry: ministry_a) }
    let(:church_b)   { create(:church, ministry: ministry_b) }
    let(:superadmin) { create(:user, :superadmin) }
    let(:lead_a)     { create(:user, :lead_pastor, ministry: ministry_a) }
    let(:pastor_a)   { create(:user, :pastor, ministry: ministry_a, church: church_a) }

    before do
      ActsAsTenant.with_tenant(ministry_a) do
        svc = create(:service, ministry: ministry_a, church: church_a)
        create(:tithe,    service: svc, ministry: ministry_a, reported_by: lead_a, amount: 100, submitted_at: Time.current)
        create(:offering, service: svc, ministry: ministry_a, reported_by: lead_a, amount: 50,  submitted_at: Time.current)
      end
      ActsAsTenant.with_tenant(ministry_b) do
        svc_b = create(:service, ministry: ministry_b, church: church_b)
        create(:tithe, service: svc_b, ministry: ministry_b,
                       reported_by: create(:user, :lead_pastor, ministry: ministry_b),
                       amount: 999, submitted_at: Time.current)
      end
    end

    it 'superadmin sees breakdown across all ministries' do
      get '/api/v1/stats/contributions_breakdown', headers: auth_headers_for(superadmin)
      expect(response).to have_http_status(:ok)
      breakdown = JSON.parse(response.body)['breakdown']
      tithe_total = breakdown.find { |b| b['type'] == 'Tithe' }['amount']
      expect(tithe_total).to eq(100 + 999)
    end

    it 'lead_pastor sees only their ministry breakdown' do
      get '/api/v1/stats/contributions_breakdown', headers: auth_headers_for(lead_a)
      breakdown = JSON.parse(response.body)['breakdown']
      tithe = breakdown.find { |b| b['type'] == 'Tithe' }
      offering = breakdown.find { |b| b['type'] == 'Offering' }
      expect(tithe['amount']).to eq(100)
      expect(offering['amount']).to eq(50)
    end

    it 'pastor sees only their church breakdown' do
      get '/api/v1/stats/contributions_breakdown', headers: auth_headers_for(pastor_a)
      breakdown = JSON.parse(response.body)['breakdown']
      expect(breakdown.sum { |b| b['amount'] }).to eq(100 + 50)
    end

    it 'returns 401 without token' do
      get '/api/v1/stats/contributions_breakdown'
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

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
