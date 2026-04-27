require "rails_helper"

RSpec.describe "Api::V1::ServicesOverview", type: :request do
  describe "GET /api/v1/services_overview" do
    let(:ministry_a) { create(:ministry) }
    let(:ministry_b) { create(:ministry) }
    let(:church_a1)  { create(:church, ministry: ministry_a) }
    let(:church_a2)  { create(:church, ministry: ministry_a) }
    let(:church_b)   { create(:church, ministry: ministry_b) }

    let(:lead_a)    { create(:user, :lead_pastor, ministry: ministry_a) }
    let(:pastor_a1) { create(:user, :pastor, ministry: ministry_a, church: church_a1) }

    # pending_requests setup:
    let!(:pending_a1) do
      ActsAsTenant.with_tenant(ministry_a) do
        create(:service_request, ministry: ministry_a, church: church_a1, requested_by: pastor_a1, status: :pending)
      end
    end
    let!(:pending_a2) do
      ActsAsTenant.with_tenant(ministry_a) do
        create(:service_request, ministry: ministry_a, church: church_a2,
               requested_by: create(:user, :pastor, ministry: ministry_a, church: church_a2),
               status: :pending)
      end
    end
    let!(:pending_b) do
      ActsAsTenant.with_tenant(ministry_b) do
        create(:service_request, ministry: ministry_b, church: church_b,
               requested_by: create(:user, :pastor, ministry: ministry_b, church: church_b),
               status: :pending)
      end
    end

    # my_requests setup:
    let!(:my_approved) do
      ActsAsTenant.with_tenant(ministry_a) do
        create(:service_request, ministry: ministry_a, church: church_a1,
               requested_by: pastor_a1, reviewed_by: lead_a, status: :approved)
      end
    end

    # recent_resolved setup:
    let!(:rejected_a1) do
      ActsAsTenant.with_tenant(ministry_a) do
        create(:service_request, ministry: ministry_a, church: church_a1,
               requested_by: pastor_a1, reviewed_by: lead_a, status: :rejected)
      end
    end

    # upcoming_services setup:
    let!(:upcoming_a1) do
      ActsAsTenant.with_tenant(ministry_a) do
        create(:service, ministry: ministry_a, church: church_a1, scheduled_at: 1.week.from_now)
      end
    end
    let!(:upcoming_a2) do
      ActsAsTenant.with_tenant(ministry_a) do
        create(:service, ministry: ministry_a, church: church_a2, scheduled_at: 2.weeks.from_now)
      end
    end
    let!(:past_svc_a1) do
      ActsAsTenant.with_tenant(ministry_a) do
        create(:service, ministry: ministry_a, church: church_a1, scheduled_at: 2.days.ago)
      end
    end

    it "pastor sees only pending_requests of their own church" do
      get "/api/v1/services_overview", headers: auth_headers_for(pastor_a1)
      expect(response).to have_http_status(:ok)
      ids = JSON.parse(response.body)["pending_requests"].map { |r| r["id"] }
      expect(ids).to include(pending_a1.id)
      expect(ids).not_to include(pending_a2.id, pending_b.id)
    end

    it "lead_pastor sees pending_requests of all their ministry's churches" do
      get "/api/v1/services_overview", headers: auth_headers_for(lead_a)
      ids = JSON.parse(response.body)["pending_requests"].map { |r| r["id"] }
      expect(ids).to match_array([ pending_a1.id, pending_a2.id ])
      expect(ids).not_to include(pending_b.id)
    end

    it "my_requests filters by current_user as requested_by" do
      get "/api/v1/services_overview", headers: auth_headers_for(pastor_a1)
      ids = JSON.parse(response.body)["my_requests"].map { |r| r["id"] }
      expect(ids).to include(pending_a1.id, my_approved.id, rejected_a1.id)
      expect(ids).not_to include(pending_a2.id)
    end

    it "recent_resolved excludes pending and respects scope" do
      get "/api/v1/services_overview", headers: auth_headers_for(lead_a)
      payload = JSON.parse(response.body)["recent_resolved"]
      ids = payload.map { |r| r["id"] }
      statuses = payload.map { |r| r["status"] }.uniq
      expect(ids).to include(my_approved.id, rejected_a1.id)
      expect(ids).not_to include(pending_a1.id, pending_a2.id)
      expect(statuses - %w[approved rejected]).to eq([])
    end

    it "upcoming_services excludes past and respects scope" do
      get "/api/v1/services_overview", headers: auth_headers_for(pastor_a1)
      ids = JSON.parse(response.body)["upcoming_services"].map { |s| s["id"] }
      expect(ids).to include(upcoming_a1.id)
      expect(ids).not_to include(upcoming_a2.id, past_svc_a1.id)
    end

    it "lead_pastor sees upcoming_services from all their ministry's churches" do
      get "/api/v1/services_overview", headers: auth_headers_for(lead_a)
      ids = JSON.parse(response.body)["upcoming_services"].map { |s| s["id"] }
      expect(ids).to include(upcoming_a1.id, upcoming_a2.id)
      expect(ids).not_to include(past_svc_a1.id)
    end

    it "upcoming_services include has_attendance_report flag" do
      ActsAsTenant.with_tenant(ministry_a) do
        create(:attendance_report, service: upcoming_a1, ministry: ministry_a,
               reported_by: pastor_a1, adults: 50, youth: 0, children: 0)
      end
      get "/api/v1/services_overview", headers: auth_headers_for(pastor_a1)
      svc = JSON.parse(response.body)["upcoming_services"].find { |s| s["id"] == upcoming_a1.id }
      expect(svc["has_attendance_report"]).to be true
    end

    it "401 without token" do
      get "/api/v1/services_overview"
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
