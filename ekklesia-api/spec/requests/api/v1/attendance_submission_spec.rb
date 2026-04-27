require "rails_helper"

RSpec.describe "Api::V1::AttendanceSubmission", type: :request do
  describe "GET /api/v1/attendance_submission" do
    let(:ministry_a) { create(:ministry) }
    let(:ministry_b) { create(:ministry) }
    let(:church_a1)  { create(:church, ministry: ministry_a) }
    let(:church_a2)  { create(:church, ministry: ministry_a) }
    let(:church_b)   { create(:church, ministry: ministry_b) }

    let(:lead_a)    { create(:user, :lead_pastor, ministry: ministry_a) }
    let(:pastor_a1) { create(:user, :pastor, ministry: ministry_a, church: church_a1) }
    let(:asst_a1)   { create(:user, :assistant, ministry: ministry_a, church: church_a1) }
    let(:superadmin) { create(:user, :superadmin) }

    # Past service in church_a1 WITHOUT a report → pending for pastor_a1, asst_a1, lead_a.
    let!(:pending_a1) do
      ActsAsTenant.with_tenant(ministry_a) do
        create(:service, ministry: ministry_a, church: church_a1, scheduled_at: 2.days.ago)
      end
    end

    # Past service in church_a2 WITHOUT a report → pending for lead_a only (NOT pastor_a1/asst_a1).
    let!(:pending_a2) do
      ActsAsTenant.with_tenant(ministry_a) do
        create(:service, ministry: ministry_a, church: church_a2, scheduled_at: 3.days.ago)
      end
    end

    # Past service in church_a1 WITH a report → NOT pending for anyone.
    let!(:reported_svc) do
      ActsAsTenant.with_tenant(ministry_a) do
        svc = create(:service, ministry: ministry_a, church: church_a1, scheduled_at: 5.days.ago)
        create(:attendance_report, service: svc, ministry: ministry_a, reported_by: pastor_a1,
                                   adults: 100, youth: 0, children: 0, submitted_at: 5.days.ago)
        svc
      end
    end

    # Future service in church_a1 WITHOUT a report → NEVER pending.
    let!(:future_svc) do
      ActsAsTenant.with_tenant(ministry_a) do
        create(:service, ministry: ministry_a, church: church_a1, scheduled_at: 3.days.from_now)
      end
    end

    # Past service in another ministry → never visible cross-ministry.
    let!(:pending_b) do
      ActsAsTenant.with_tenant(ministry_b) do
        create(:service, ministry: ministry_b, church: church_b, scheduled_at: 1.day.ago)
      end
    end

    it "pastor sees only pending services in their own church" do
      get "/api/v1/attendance_submission", headers: auth_headers_for(pastor_a1)
      expect(response).to have_http_status(:ok)
      ids = JSON.parse(response.body)["pending_services"].map { |s| s["id"] }
      expect(ids).to eq([ pending_a1.id ])
    end

    it "assistant sees only pending services in their own church" do
      get "/api/v1/attendance_submission", headers: auth_headers_for(asst_a1)
      ids = JSON.parse(response.body)["pending_services"].map { |s| s["id"] }
      expect(ids).to eq([ pending_a1.id ])
    end

    it "lead_pastor sees pending services from all churches in their ministry" do
      get "/api/v1/attendance_submission", headers: auth_headers_for(lead_a)
      ids = JSON.parse(response.body)["pending_services"].map { |s| s["id"] }
      expect(ids).to match_array([ pending_a1.id, pending_a2.id ])
    end

    it "superadmin sees pending services across all ministries" do
      get "/api/v1/attendance_submission", headers: auth_headers_for(superadmin)
      ids = JSON.parse(response.body)["pending_services"].map { |s| s["id"] }
      expect(ids).to match_array([ pending_a1.id, pending_a2.id, pending_b.id ])
    end

    it "future services never appear as pending" do
      get "/api/v1/attendance_submission", headers: auth_headers_for(pastor_a1)
      ids = JSON.parse(response.body)["pending_services"].map { |s| s["id"] }
      expect(ids).not_to include(future_svc.id)
    end

    it "services with an existing report never appear as pending" do
      get "/api/v1/attendance_submission", headers: auth_headers_for(pastor_a1)
      ids = JSON.parse(response.body)["pending_services"].map { |s| s["id"] }
      expect(ids).not_to include(reported_svc.id)
    end

    it "pending payload includes the documented keys" do
      get "/api/v1/attendance_submission", headers: auth_headers_for(pastor_a1)
      payload = JSON.parse(response.body)["pending_services"].first
      expect(payload.keys).to match_array(%w[id service_type scheduled_at church_id church_name])
    end

    it "recent_reports filters out reports submitted by other users in the same church" do
      mine = ActsAsTenant.with_tenant(ministry_a) do
        svc = create(:service, ministry: ministry_a, church: church_a1, scheduled_at: 6.days.ago)
        create(:attendance_report, service: svc, ministry: ministry_a, reported_by: pastor_a1,
                                   adults: 50, youth: 10, children: 5, submitted_at: 6.days.ago)
      end

      # A report by asst_a1 in the same church → must NOT appear in pastor_a1's recents.
      not_mine = ActsAsTenant.with_tenant(ministry_a) do
        svc = create(:service, ministry: ministry_a, church: church_a1, scheduled_at: 4.days.ago)
        create(:attendance_report, service: svc, ministry: ministry_a, reported_by: asst_a1,
                                   adults: 30, youth: 5, children: 2, submitted_at: 4.days.ago)
      end

      get "/api/v1/attendance_submission", headers: auth_headers_for(pastor_a1)
      ids = JSON.parse(response.body)["recent_reports"].map { |r| r["id"] }
      # pastor_a1's own reports include `mine` and the `reported_svc`'s report (set up at the top).
      expect(ids).to include(mine.id, reported_svc.attendance_report.id)
      expect(ids).not_to include(not_mine.id)
    end

    it "asst_a1 does not see pastor_a1's recent reports" do
      get "/api/v1/attendance_submission", headers: auth_headers_for(asst_a1)
      ids = JSON.parse(response.body)["recent_reports"].map { |r| r["id"] }
      expect(ids).to be_empty
    end

    it "recent payload includes the documented keys" do
      ActsAsTenant.with_tenant(ministry_a) do
        svc = create(:service, ministry: ministry_a, church: church_a1, scheduled_at: 7.days.ago,
                               service_type: "Culto Dominical")
        create(:attendance_report, service: svc, ministry: ministry_a, reported_by: pastor_a1,
                                   adults: 80, youth: 20, children: 15, notes: "Servicio especial",
                                   submitted_at: 7.days.ago)
      end

      get "/api/v1/attendance_submission", headers: auth_headers_for(pastor_a1)
      payload = JSON.parse(response.body)["recent_reports"].first
      expect(payload.keys).to match_array(
        %w[id service_id service_type service_date church_name adults youth children total notes submitted_at]
      )
    end

    it "401 without token" do
      get "/api/v1/attendance_submission"
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
