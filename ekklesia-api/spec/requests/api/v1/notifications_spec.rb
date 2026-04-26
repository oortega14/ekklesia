require "rails_helper"

RSpec.describe "Api::V1::Notifications", type: :request do
  let(:user)  { create(:user, :lead_pastor) }
  let(:other) { create(:user, :pastor) }

  describe "GET /api/v1/notifications" do
    let!(:mine_unread) { create(:notification, recipient: user, kind: "service_request_created") }
    let!(:mine_read)   { create(:notification, recipient: user, kind: "church_created", read_at: 1.hour.ago) }
    let!(:not_mine)    { create(:notification, recipient: other) }

    it "returns only the current user's notifications" do
      get "/api/v1/notifications", headers: auth_headers_for(user)
      expect(response).to have_http_status(:ok)
      ids = JSON.parse(response.body)["notifications"].map { |n| n["id"] }
      expect(ids).to match_array([ mine_unread.id, mine_read.id ])
    end

    it "returns unread_count of unread notifications for the user" do
      get "/api/v1/notifications", headers: auth_headers_for(user)
      expect(JSON.parse(response.body)["unread_count"]).to eq(1)
    end

    it "filters by unread when ?unread=true" do
      get "/api/v1/notifications", headers: auth_headers_for(user), params: { unread: "true" }
      ids = JSON.parse(response.body)["notifications"].map { |n| n["id"] }
      expect(ids).to eq([ mine_unread.id ])
    end

    it "filters by kind" do
      get "/api/v1/notifications", headers: auth_headers_for(user), params: { kind: "church_created" }
      ids = JSON.parse(response.body)["notifications"].map { |n| n["id"] }
      expect(ids).to eq([ mine_read.id ])
    end

    it "401 without token" do
      get "/api/v1/notifications"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "PATCH /api/v1/notifications/:id/read" do
    let!(:noti) { create(:notification, recipient: user, read_at: nil) }

    it "marks the notification read" do
      patch "/api/v1/notifications/#{noti.id}/read", headers: auth_headers_for(user)
      expect(response).to have_http_status(:ok)
      expect(noti.reload.read_at).to be_present
    end

    it "returns 404 for another user's notification" do
      foreign = create(:notification, recipient: other)
      patch "/api/v1/notifications/#{foreign.id}/read", headers: auth_headers_for(user)
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/notifications/read_all" do
    before do
      create_list(:notification, 3, recipient: user, read_at: nil)
      create(:notification, recipient: other, read_at: nil)
    end

    it "marks all of the current user's notifications as read" do
      post "/api/v1/notifications/read_all", headers: auth_headers_for(user)
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["unread_count"]).to eq(0)
      expect(user.notifications.unread.count).to eq(0)
      expect(other.notifications.unread.count).to eq(1)
    end
  end

  describe "DELETE /api/v1/notifications/:id" do
    let!(:noti) { create(:notification, recipient: user) }

    it "deletes the user's own notification" do
      expect {
        delete "/api/v1/notifications/#{noti.id}", headers: auth_headers_for(user)
      }.to change(Notification, :count).by(-1)
      expect(response).to have_http_status(:ok)
    end

    it "returns 404 for another user's notification" do
      foreign = create(:notification, recipient: other)
      delete "/api/v1/notifications/#{foreign.id}", headers: auth_headers_for(user)
      expect(response).to have_http_status(:not_found)
      expect(Notification.exists?(foreign.id)).to be true
    end
  end
end
