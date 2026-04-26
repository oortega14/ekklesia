require "sequel/core"

class RodauthMain < Rodauth::Rails::Auth
  configure do
    enable :login, :logout, :change_password, :jwt

    # ── Routes (relative to /api/v1/auth) ────────────────────────────
    login_route  "login"
    logout_route "logout"
    change_password_route "change-password"
    change_password_requires_password? true

    password_minimum_length 8
    password_maximum_bytes 72

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
    # Rodauth calls this both when decoding the inbound JWT (to verify the
    # signature, BEFORE the account is loaded) AND when encoding outbound
    # JWTs (after_login, when @account is set). For decode, we extract
    # account_id from the unverified payload to look up the per-account
    # secret; for encode, we use the loaded account.
    jwt_secret do
      acct_id =
        if instance_variable_defined?(:@account) && @account
          @account[:id]
        elsif jwt_token
          begin
            unverified = JWT.decode(jwt_token, nil, false).first
            unverified["account_id"] || unverified["sub"]
          rescue JWT::DecodeError
            nil
          end
        end
      account = acct_id && db[:accounts].where(id: acct_id).first
      # Fallback: no real token is signed with bare secret_key_base alone,
      # so verification always fails closed when the account can't be
      # resolved. Returning nil from this block makes Rodauth crash, so
      # we return a deterministic non-matching value.
      account ? "#{Rails.application.secret_key_base}-#{account[:jwt_secret]}" : Rails.application.secret_key_base
    end

    # ── After login: generate access + refresh tokens ────────────────
    # Note: json_response is the hash that becomes the response body.
    # We add both tokens here because Rodauth's JSON feature uses
    # _json_response_body (not the overridable json_response_body) to
    # build the response, so this is the right place to inject tokens.
    #
    # The encode block below is duplicated in after_change_password —
    # any change to payload shape, TTL, or algorithm must be made in
    # both places. Defining a shared helper inside Rodauth's configure
    # block isn't straightforward (auth-instance method dispatch).
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

    # ── After change_password: rotate jwt_secret + re-issue tokens ───
    # Rotating the secret invalidates every existing token (other tabs
    # and devices) — that's intentional. We then re-issue access+refresh
    # so this request keeps the user logged in on the current tab.
    after_change_password do
      new_secret = SecureRandom.hex(32)
      db[:accounts].where(id: account_id).update(jwt_secret: new_secret)

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

    login_redirect { "/" }
  end
end
