require "rails_helper"

RSpec.describe "Api::V1::Reports", type: :request do
  describe "GET /api/v1/reports/attendance" do
    let(:ministry_a) { create(:ministry) }
    let(:ministry_b) { create(:ministry) }
    let(:church_a1)  { create(:church, ministry: ministry_a) }
    let(:church_a2)  { create(:church, ministry: ministry_a) }
    let(:church_b)   { create(:church, ministry: ministry_b) }

    let(:superadmin) { create(:user, :superadmin) }
    let(:lead_a)     { create(:user, :lead_pastor, ministry: ministry_a) }
    let(:pastor_a1)  { create(:user, :pastor, ministry: ministry_a, church: church_a1) }
    let(:asst_a1)    { create(:user, :assistant, ministry: ministry_a, church: church_a1) }

    before do
      ActsAsTenant.with_tenant(ministry_a) do
        svc1 = create(:service, ministry: ministry_a, church: church_a1, scheduled_at: 1.week.ago, service_type: "Culto Dominical")
        svc2 = create(:service, ministry: ministry_a, church: church_a2, scheduled_at: 1.week.ago, service_type: "Culto Dominical")
        create(:attendance_report, service: svc1, ministry: ministry_a, reported_by: lead_a,
                                   adults: 100, youth: 0, children: 0, submitted_at: 1.week.ago)
        create(:attendance_report, service: svc2, ministry: ministry_a, reported_by: lead_a,
                                   adults: 50,  youth: 0, children: 0, submitted_at: 1.week.ago)
      end
      ActsAsTenant.with_tenant(ministry_b) do
        svc3 = create(:service, ministry: ministry_b, church: church_b, scheduled_at: 1.week.ago)
        create(:attendance_report, service: svc3, ministry: ministry_b,
                                   reported_by: create(:user, :lead_pastor, ministry: ministry_b),
                                   adults: 999, youth: 0, children: 0, submitted_at: 1.week.ago)
      end
    end

    it "superadmin sees rows from every ministry" do
      get "/api/v1/reports/attendance", headers: auth_headers_for(superadmin), params: { period: "this_month" }
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      totals = body["rows"].map { |r| r["total"] }
      expect(totals).to match_array([ 100, 50, 999 ])
    end

    it "lead_pastor sees only their ministry rows" do
      get "/api/v1/reports/attendance", headers: auth_headers_for(lead_a), params: { period: "this_month" }
      body = JSON.parse(response.body)
      totals = body["rows"].map { |r| r["total"] }
      expect(totals).to match_array([ 100, 50 ])
    end

    it "pastor sees only their church rows" do
      get "/api/v1/reports/attendance", headers: auth_headers_for(pastor_a1), params: { period: "this_month" }
      body = JSON.parse(response.body)
      totals = body["rows"].map { |r| r["total"] }
      expect(totals).to eq([ 100 ])
    end

    it "assistant sees only their church rows" do
      get "/api/v1/reports/attendance", headers: auth_headers_for(asst_a1), params: { period: "this_month" }
      body = JSON.parse(response.body)
      expect(body["rows"].map { |r| r["total"] }).to eq([ 100 ])
    end

    it "row payload includes the documented keys" do
      get "/api/v1/reports/attendance", headers: auth_headers_for(superadmin), params: { period: "this_month" }
      row = JSON.parse(response.body)["rows"].first
      expect(row.keys).to match_array(%w[
        id service_id service_type scheduled_at church_id church_name
        adults youth children total reported_by_name submitted_at
      ])
    end

    it "summary computes totals across the full scope" do
      get "/api/v1/reports/attendance", headers: auth_headers_for(lead_a), params: { period: "this_month" }
      summary = JSON.parse(response.body)["summary"]
      expect(summary["total_count"]).to eq(2)
      expect(summary["total_attendance"]).to eq(150)
      expect(summary["average_per_service"]).to eq(75)
      expect(summary["period_label"]).to be_a(String).and(be_present)
    end

    it "summary handles zero results without dividing by zero" do
      AttendanceReport.delete_all
      get "/api/v1/reports/attendance", headers: auth_headers_for(superadmin), params: { period: "this_month" }
      summary = JSON.parse(response.body)["summary"]
      expect(summary).to include(
        "total_count"        => 0,
        "total_attendance"   => 0,
        "average_per_service" => 0
      )
    end

    it "superadmin can narrow by church_id" do
      get "/api/v1/reports/attendance",
          headers: auth_headers_for(superadmin),
          params:  { period: "this_month", church_id: church_a1.id }
      rows = JSON.parse(response.body)["rows"]
      expect(rows.map { |r| r["church_id"] }.uniq).to eq([ church_a1.id ])
    end

    it "pastor's church_id query param is ignored when it points to another church" do
      get "/api/v1/reports/attendance",
          headers: auth_headers_for(pastor_a1),
          params:  { period: "this_month", church_id: church_a2.id }
      rows = JSON.parse(response.body)["rows"]
      expect(rows.map { |r| r["church_id"] }.uniq).to eq([ church_a1.id ])
    end

    it "lead_pastor's church_id pointing to another ministry is ignored" do
      get "/api/v1/reports/attendance",
          headers: auth_headers_for(lead_a),
          params:  { period: "this_month", church_id: church_b.id }
      rows = JSON.parse(response.body)["rows"]
      church_ids = rows.map { |r| r["church_id"] }.uniq
      expect(church_ids).to all(satisfy { |id| [ church_a1.id, church_a2.id ].include?(id) })
    end

    it "service_type narrows the rows" do
      ActsAsTenant.with_tenant(ministry_a) do
        other_svc = create(:service, ministry: ministry_a, church: church_a1,
                                     scheduled_at: 1.week.ago, service_type: "Reunión Especial")
        create(:attendance_report, service: other_svc, ministry: ministry_a, reported_by: lead_a,
                                   adults: 7, youth: 0, children: 0, submitted_at: 1.week.ago)
      end
      get "/api/v1/reports/attendance",
          headers: auth_headers_for(superadmin),
          params:  { period: "this_month", service_type: "Reunión Especial" }
      rows = JSON.parse(response.body)["rows"]
      expect(rows.length).to eq(1)
      expect(rows.first["service_type"]).to eq("Reunión Especial")
    end

    it "marks results as truncated when above 1000 rows" do
      ActsAsTenant.with_tenant(ministry_a) do
        svc = create(:service, ministry: ministry_a, church: church_a1, scheduled_at: 1.week.ago)
        rows = Array.new(1001) do
          { service_id: svc.id, ministry_id: ministry_a.id, reported_by_id: lead_a.id,
            adults: 1, youth: 0, children: 0, total: 1,
            submitted_at: 1.week.ago, created_at: Time.current, updated_at: Time.current }
        end
        AttendanceReport.insert_all(rows)
      end

      get "/api/v1/reports/attendance", headers: auth_headers_for(superadmin), params: { period: "this_month" }
      body = JSON.parse(response.body)
      expect(body["truncated"]).to be true
      expect(body["rows"].length).to eq(1000)
    end

    it "format=csv returns text/csv with attachment header and all rows" do
      get "/api/v1/reports/attendance",
          headers: auth_headers_for(superadmin),
          params:  { period: "this_month", format: "csv" }
      expect(response.content_type).to start_with("text/csv")
      expect(response.headers["Content-Disposition"]).to include("attachment")
      expect(response.headers["Content-Disposition"]).to match(/asistencia-\d{4}-\d{2}\.csv/)
      header_line = response.body.lines.first
      expect(header_line).to include("Servicio", "Iglesia", "Total", "Reportado por")
      data_lines = response.body.lines.drop(1)
      expect(data_lines.length).to eq(3)
    end

    it "401 without token" do
      get "/api/v1/reports/attendance"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /api/v1/reports/contributions" do
    let(:ministry_a) { create(:ministry) }
    let(:ministry_b) { create(:ministry) }
    let(:church_a1)  { create(:church, ministry: ministry_a) }
    let(:church_a2)  { create(:church, ministry: ministry_a) }
    let(:church_b)   { create(:church, ministry: ministry_b) }

    let(:superadmin) { create(:user, :superadmin) }
    let(:lead_a)     { create(:user, :lead_pastor, ministry: ministry_a) }
    let(:pastor_a1)  { create(:user, :pastor, ministry: ministry_a, church: church_a1) }
    let(:asst_a1)    { create(:user, :assistant, ministry: ministry_a, church: church_a1) }

    before do
      ActsAsTenant.with_tenant(ministry_a) do
        svc1 = create(:service, ministry: ministry_a, church: church_a1, scheduled_at: 1.week.ago)
        svc2 = create(:service, ministry: ministry_a, church: church_a2, scheduled_at: 1.week.ago)
        create(:tithe,    service: svc1, ministry: ministry_a, reported_by: lead_a, amount: 100, submitted_at: 1.week.ago)
        create(:offering, service: svc1, ministry: ministry_a, reported_by: lead_a, amount: 50,  submitted_at: 1.week.ago)
        create(:tithe,    service: svc2, ministry: ministry_a, reported_by: lead_a, amount: 30,  submitted_at: 1.week.ago)
      end
      ActsAsTenant.with_tenant(ministry_b) do
        svc_b = create(:service, ministry: ministry_b, church: church_b, scheduled_at: 1.week.ago)
        create(:tithe, service: svc_b, ministry: ministry_b,
                       reported_by: create(:user, :lead_pastor, ministry: ministry_b),
                       amount: 999, submitted_at: 1.week.ago)
      end
    end

    it "superadmin sees all contributions" do
      get "/api/v1/reports/contributions", headers: auth_headers_for(superadmin), params: { period: "this_month" }
      expect(response).to have_http_status(:ok)
      amounts = JSON.parse(response.body)["rows"].map { |r| r["amount"] }
      expect(amounts).to match_array([ 100.0, 50.0, 30.0, 999.0 ])
    end

    it "lead_pastor sees only their ministry rows" do
      get "/api/v1/reports/contributions", headers: auth_headers_for(lead_a), params: { period: "this_month" }
      amounts = JSON.parse(response.body)["rows"].map { |r| r["amount"] }
      expect(amounts).to match_array([ 100.0, 50.0, 30.0 ])
    end

    it "pastor sees only their church rows" do
      get "/api/v1/reports/contributions", headers: auth_headers_for(pastor_a1), params: { period: "this_month" }
      amounts = JSON.parse(response.body)["rows"].map { |r| r["amount"] }
      expect(amounts).to match_array([ 100.0, 50.0 ])
    end

    it "assistant sees only their church rows" do
      get "/api/v1/reports/contributions", headers: auth_headers_for(asst_a1), params: { period: "this_month" }
      amounts = JSON.parse(response.body)["rows"].map { |r| r["amount"] }
      expect(amounts).to match_array([ 100.0, 50.0 ])
    end

    it "row payload includes the documented keys" do
      get "/api/v1/reports/contributions", headers: auth_headers_for(superadmin), params: { period: "this_month" }
      row = JSON.parse(response.body)["rows"].first
      expect(row.keys).to match_array(%w[
        id service_id service_type scheduled_at church_id church_name
        type amount reported_by_name submitted_at
      ])
    end

    it "summary returns total amount and breakdown by type" do
      get "/api/v1/reports/contributions", headers: auth_headers_for(lead_a), params: { period: "this_month" }
      summary = JSON.parse(response.body)["summary"]
      expect(summary["total_count"]).to eq(3)
      expect(summary["total_amount"]).to eq(180.0)
      breakdown = summary["breakdown_by_type"]
      tithe = breakdown.find { |b| b["type"] == "Tithe" }
      offering = breakdown.find { |b| b["type"] == "Offering" }
      expect(tithe["amount"]).to eq(130.0)     # 100 + 30
      expect(offering["amount"]).to eq(50.0)
    end

    it "summary handles zero results" do
      Contribution.delete_all
      get "/api/v1/reports/contributions", headers: auth_headers_for(superadmin), params: { period: "this_month" }
      summary = JSON.parse(response.body)["summary"]
      expect(summary["total_count"]).to eq(0)
      expect(summary["total_amount"]).to eq(0.0)
      expect(summary["breakdown_by_type"]).to eq([])
    end

    it "contribution_type narrows the rows" do
      get "/api/v1/reports/contributions",
          headers: auth_headers_for(superadmin),
          params:  { period: "this_month", contribution_type: "Offering" }
      rows = JSON.parse(response.body)["rows"]
      expect(rows.map { |r| r["type"] }.uniq).to eq([ "Offering" ])
    end

    it "format=csv returns text/csv with attachment header" do
      get "/api/v1/reports/contributions",
          headers: auth_headers_for(superadmin),
          params:  { period: "this_month", format: "csv" }
      expect(response.content_type).to start_with("text/csv")
      expect(response.headers["Content-Disposition"]).to include("attachment")
      expect(response.headers["Content-Disposition"]).to match(/finanzas-\d{4}-\d{2}\.csv/)
      header_line = response.body.lines.first
      expect(header_line).to include("Servicio", "Iglesia", "Tipo", "Monto", "Reportado por")
    end

    it "401 without token" do
      get "/api/v1/reports/contributions"
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
