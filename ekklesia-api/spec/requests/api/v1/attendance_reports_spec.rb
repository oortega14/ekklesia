require 'rails_helper'

RSpec.describe 'AttendanceReports', type: :request do
  let(:ministry)  { create(:ministry) }
  let(:church)    { create(:church, ministry: ministry) }
  let(:service)   { create(:service, ministry: ministry, church: church) }
  let(:assistant) { create(:user, :assistant, ministry: ministry, church: church) }

  describe 'POST /api/v1/attendance_reports' do
    it 'assistant submits an attendance report' do
      post '/api/v1/attendance_reports',
        headers: auth_headers_for(assistant),
        params: { attendance_report: { service_id: service.id, adults: 100, youth: 40, children: 20 } }
      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)['attendance_report']
      expect(json['total']).to eq(160)
    end
  end

  describe 'GET /api/v1/attendance_reports' do
    it 'returns reports for the current user scope' do
      create(:attendance_report, ministry: ministry, service: service, reported_by: assistant)
      get '/api/v1/attendance_reports', headers: auth_headers_for(assistant)
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['attendance_reports'].size).to eq(1)
    end
  end
end
