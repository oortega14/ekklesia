require 'rails_helper'

RSpec.describe 'Services', type: :request do
  let(:ministry) { create(:ministry) }
  let(:church)   { create(:church, ministry: ministry) }
  let(:lead)     { create(:user, :lead_pastor, ministry: ministry) }
  let(:pastor)   { create(:user, :pastor, ministry: ministry, church: church) }

  describe 'GET /api/v1/services' do
    it 'pastor sees services for their church only' do
      create(:service, ministry: ministry, church: church)
      other_church = create(:church, ministry: ministry)
      create(:service, ministry: ministry, church: other_church)

      get '/api/v1/services', headers: auth_headers_for(pastor)
      expect(response).to have_http_status(:ok)
      services = JSON.parse(response.body)['services']
      expect(services.all? { |s| s['church_id'] == church.id }).to be true
    end
  end

  describe 'POST /api/v1/services' do
    it 'lead_pastor creates a service' do
      post '/api/v1/services',
        headers: auth_headers_for(lead),
        params: { service: { church_id: church.id, service_type: 'Culto Dominical', scheduled_at: 1.week.from_now } }
      expect(response).to have_http_status(:created)
    end

    it 'pastor cannot create a service' do
      post '/api/v1/services',
        headers: auth_headers_for(pastor),
        params: { service: { church_id: church.id, service_type: 'Culto', scheduled_at: 1.week.from_now } }
      expect(response).to have_http_status(:forbidden)
    end
  end
end

RSpec.describe 'GET /api/v1/services presence flags', type: :request do
  let(:ministry) { create(:ministry) }
  let(:church)   { create(:church, ministry: ministry) }
  let(:user)     { create(:user, :pastor, ministry: ministry, church: church) }
  let!(:service_with_report) do
    svc = create(:service, ministry: ministry, church: church)
    create(:attendance_report, service: svc, ministry: ministry, reported_by: user)
    svc
  end
  let!(:service_without_report) { create(:service, ministry: ministry, church: church) }

  it 'includes has_attendance_report flag' do
    get '/api/v1/services', headers: auth_headers_for(user)
    body = JSON.parse(response.body)
    ids_with    = body['services'].select { |s| s['has_attendance_report'] }.map { |s| s['id'] }
    ids_without = body['services'].reject { |s| s['has_attendance_report'] }.map { |s| s['id'] }
    expect(ids_with).to include(service_with_report.id)
    expect(ids_without).to include(service_without_report.id)
  end

  it 'includes has_contributions flag' do
    create(:tithe, service: service_with_report, ministry: ministry, reported_by: user)
    get '/api/v1/services', headers: auth_headers_for(user)
    body = JSON.parse(response.body)
    ids_with = body['services'].select { |s| s['has_contributions'] }.map { |s| s['id'] }
    expect(ids_with).to include(service_with_report.id)
  end
end
