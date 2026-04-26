require "sequel/core"

class RodauthMain < Rodauth::Rails::Auth
  configure do
    enable :login, :logout, :jwt

    # ── Routes (relative to /api/v1/auth) ────────────────────────────
    login_route  "login"
    logout_route "logout"

    # ── General ───────────────────────────────────────────────────────
    db Sequel.postgres(extensions: :activerecord_connection, keep_reference: false)
    convert_token_id_to_integer? { Account.columns_hash["id"].type == :integer }

    # ── API-only ──────────────────────────────────────────────────────
    only_json? true

    # ── Account setup ─────────────────────────────────────────────────
    account_status_column :status
    account_password_hash_column :password_hash
    account_open_status_value 1

    login_param "email"

    rails_controller { RodauthController }

    # ── Per-user HMAC JWT secret ──────────────────────────────────────
    jwt_secret do
      account = db[:accounts].where(id: account_id).first
      "#{Rails.application.secret_key_base}-#{account[:jwt_secret]}"
    end

    # ── After login: generate access + refresh tokens ────────────────
    # Note: json_response is the hash that becomes the response body.
    # We add both tokens here because Rodauth's JSON feature uses
    # _json_response_body (not the overridable json_response_body) to
    # build the response, so this is the right place to inject tokens.
    after_login do
      account_row = db[:accounts].where(id: account_id).first
      secret = "#{Rails.application.secret_key_base}-#{account_row[:jwt_secret]}"
      user = ::User.find_by(account_id: account_id)

      access_payload = {
        "sub"         => account_id.to_s,
        "account_id"  => account_id,
        "iat"         => Time.current.to_i,
        "exp"         => 30.minutes.from_now.to_i,
        "role"        => user&.role,
        "ministry_id" => user&.ministry_id,
        "church_id"   => user&.church_id
      }
      json_response["access_token"] = JWT.encode(access_payload, secret, "HS256")

      refresh_payload = {
        "sub"  => account_id.to_s,
        "iat"  => Time.current.to_i,
        "exp"  => 7.days.from_now.to_i,
        "type" => "refresh"
      }
      json_response["refresh_token"] = JWT.encode(refresh_payload, secret, "HS256")
    end

    # ── Logout: rotate jwt_secret → both tokens become invalid ────────
    after_logout do
      db[:accounts].where(id: account_id)
                   .update(jwt_secret: SecureRandom.hex(32))
    end

    login_redirect { "/" }
  end
end
