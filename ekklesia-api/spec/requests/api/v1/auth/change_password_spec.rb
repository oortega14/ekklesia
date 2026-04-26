require "rails_helper"

RSpec.describe "Api::V1::Auth::ChangePassword", type: :request do
  let(:account) { create(:account, password_hash: BCrypt::Password.create("OldPass123!")) }
  let!(:user)   { create(:user, :lead_pastor, account: account) }

  def login_and_get_token
    post "/api/v1/auth/login",
         params: { email: account.email, password: "OldPass123!" },
         as: :json
    JSON.parse(response.body)["access_token"]
  end

  describe "POST /api/v1/auth/change-password" do
    it "returns 200 with new tokens when current password is correct" do
      token = login_and_get_token

      post "/api/v1/auth/change-password",
           headers: { "Authorization" => "Bearer #{token}" },
           params:  {
             "password"         => "OldPass123!",
             "new-password"     => "NewPass456!",
             "password-confirm" => "NewPass456!"
           },
           as: :json

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["access_token"]).to be_a(String).and(be_present)
      expect(body["refresh_token"]).to be_a(String).and(be_present)

      account.reload
      expect(BCrypt::Password.new(account.password_hash).is_password?("NewPass456!")).to be true
    end

    it "rejects when the current password is wrong" do
      token = login_and_get_token

      post "/api/v1/auth/change-password",
           headers: { "Authorization" => "Bearer #{token}" },
           params:  {
             "password"         => "WrongCurrent!",
             "new-password"     => "NewPass456!",
             "password-confirm" => "NewPass456!"
           },
           as: :json

      expect(response.status).to be_between(400, 422)
      expect(response).not_to have_http_status(:ok)
      account.reload
      expect(BCrypt::Password.new(account.password_hash).is_password?("OldPass123!")).to be true
    end

    it "rejects when the new password is too short (4xx, password unchanged)" do
      token = login_and_get_token

      post "/api/v1/auth/change-password",
           headers: { "Authorization" => "Bearer #{token}" },
           params:  {
             "password"         => "OldPass123!",
             "new-password"     => "abc",
             "password-confirm" => "abc"
           },
           as: :json

      expect(response.status).to be_between(400, 422)
      expect(response).not_to have_http_status(:ok)
      account.reload
      expect(BCrypt::Password.new(account.password_hash).is_password?("OldPass123!")).to be true
    end

    it "rejects without an auth header" do
      post "/api/v1/auth/change-password",
           params: {
             "password"         => "OldPass123!",
             "new-password"     => "NewPass456!",
             "password-confirm" => "NewPass456!"
           },
           as: :json
      expect(response).to have_http_status(:unauthorized)
    end

    it "the OLD access token is rejected after a successful change (jwt_secret rotated)" do
      old_token = login_and_get_token

      post "/api/v1/auth/change-password",
           headers: { "Authorization" => "Bearer #{old_token}" },
           params:  {
             "password"         => "OldPass123!",
             "new-password"     => "NewPass456!",
             "password-confirm" => "NewPass456!"
           },
           as: :json
      expect(response).to have_http_status(:ok)
      new_token = JSON.parse(response.body)["access_token"]

      # The OLD token was signed with the OLD jwt_secret. After rotation,
      # any subsequent request using it must be rejected by authenticate!.
      get "/api/v1/auth/me", headers: { "Authorization" => "Bearer #{old_token}" }
      expect(response).to have_http_status(:unauthorized)

      # The NEW token issued in the response must work.
      get "/api/v1/auth/me", headers: { "Authorization" => "Bearer #{new_token}" }
      expect(response).to have_http_status(:ok)
    end
  end
end
