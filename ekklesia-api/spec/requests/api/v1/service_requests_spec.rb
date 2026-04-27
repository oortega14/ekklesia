require 'rails_helper'

RSpec.describe 'ServiceRequests', type: :request do
  let(:ministry) { create(:ministry) }
  let(:church)   { create(:church, ministry: ministry) }
  let(:lead)     { create(:user, :lead_pastor, ministry: ministry) }
  let(:pastor)   { create(:user, :pastor, ministry: ministry, church: church) }

  describe 'POST /api/v1/service_requests' do
    it 'pastor creates a service request' do
      post '/api/v1/service_requests',
        headers: auth_headers_for(pastor),
        params: { service_request: { service_type: 'Culto Especial', requested_for: 2.weeks.from_now, notes: 'Necesitamos un culto especial' } }
      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)['service_request']['status']).to eq('pending')
    end

    it "enqueues a NotifyJob with kind service_request_created" do
      lead # ensure a recipient lead pastor exists
      expect {
        post "/api/v1/service_requests",
          headers: auth_headers_for(pastor),
          params: { service_request: { service_type: "Culto Especial", requested_for: 2.days.from_now } }
      }.to have_enqueued_job(NotifyJob).with(hash_including(kind: "service_request_created"))
    end
  end

  describe 'PATCH /api/v1/service_requests/:id/approve' do
    it 'lead_pastor approves a request' do
      sr = create(:service_request, ministry: ministry, church: church, requested_by: pastor)
      patch "/api/v1/service_requests/#{sr.id}/approve", headers: auth_headers_for(lead)
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['service_request']['status']).to eq('approved')
    end

    it 'pastor cannot approve' do
      sr = create(:service_request, ministry: ministry, church: church, requested_by: pastor)
      patch "/api/v1/service_requests/#{sr.id}/approve", headers: auth_headers_for(pastor)
      expect(response).to have_http_status(:forbidden)
    end

    it "enqueues a NotifyJob with kind service_request_approved" do
      sr = ActsAsTenant.with_tenant(ministry) do
        create(:service_request, ministry: ministry, church: church, requested_by: pastor)
      end
      expect {
        patch "/api/v1/service_requests/#{sr.id}/approve", headers: auth_headers_for(lead)
      }.to have_enqueued_job(NotifyJob).with(hash_including(kind: "service_request_approved"))
    end
  end

  describe "PATCH /api/v1/service_requests/:id/reject" do
    it "enqueues a NotifyJob with kind service_request_rejected" do
      sr = ActsAsTenant.with_tenant(ministry) do
        create(:service_request, ministry: ministry, church: church, requested_by: pastor)
      end
      expect {
        patch "/api/v1/service_requests/#{sr.id}/reject", headers: auth_headers_for(lead)
      }.to have_enqueued_job(NotifyJob).with(hash_including(kind: "service_request_rejected"))
    end
  end

  describe "PATCH /api/v1/service_requests/:id/approve (auto-creates Service)" do
    let(:ministry) { create(:ministry) }
    let(:church)   { create(:church, ministry: ministry) }
    let(:lead)     { create(:user, :lead_pastor, ministry: ministry) }
    let(:pastor)   { create(:user, :pastor, ministry: ministry, church: church) }

    let!(:request_record) do
      ActsAsTenant.with_tenant(ministry) do
        create(:service_request,
               ministry: ministry, church: church, requested_by: pastor,
               service_type: "Reunión Especial", requested_for: 2.weeks.from_now)
      end
    end

    it "creates a Service in the same transaction with copied fields" do
      expect {
        patch "/api/v1/service_requests/#{request_record.id}/approve",
              headers: auth_headers_for(lead)
      }.to change(Service, :count).by(1)

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body).to have_key("service_request")
      expect(body).to have_key("service")
      expect(body["service"]["service_type"]).to eq("Reunión Especial")
      expect(body["service"]["church_id"]).to eq(church.id)

      created_service = Service.find(body["service"]["id"])
      expect(created_service.scheduled_at).to be_within(1.second).of(request_record.requested_for)
      expect(created_service.status).to eq("scheduled")

      expect(request_record.reload.status).to eq("approved")
      expect(request_record.reviewed_by_id).to eq(lead.id)
    end

    it "rolls back the approve when Service.create! fails" do
      original = Service.method(:create!)
      allow(Service).to receive(:create!) { raise ActiveRecord::RecordInvalid.new(Service.new) }

      expect {
        patch "/api/v1/service_requests/#{request_record.id}/approve",
              headers: auth_headers_for(lead)
      }.not_to change(Service, :count)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(request_record.reload.status).to eq("pending")
      expect(request_record.reviewed_by_id).to be_nil
    end

    it "lead_pastor of another ministry cannot approve (cross-ministry)" do
      other_ministry = create(:ministry)
      other_lead     = create(:user, :lead_pastor, ministry: other_ministry)

      patch "/api/v1/service_requests/#{request_record.id}/approve",
            headers: auth_headers_for(other_lead)

      expect(response.status).to be_in([ 403, 404 ]) # Pundit denies OR tenant scoping hides it
      expect(request_record.reload.status).to eq("pending")
    end
  end
end
