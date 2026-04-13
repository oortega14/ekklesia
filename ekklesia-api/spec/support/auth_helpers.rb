module AuthHelpers
  def auth_headers_for(user)
    account = user.account
    secret  = "#{Rails.application.secret_key_base}-#{account.jwt_secret}"
    payload = {
      'sub'         => account.id.to_s,
      'iat'         => Time.current.to_i,
      'exp'         => 24.hours.from_now.to_i,
      'role'        => user.role,
      'ministry_id' => user.ministry_id,
      'church_id'   => user.church_id
    }
    token = JWT.encode(payload, secret, 'HS256')
    { 'Authorization' => "Bearer #{token}" }
  end
end

RSpec.configure do |config|
  config.include AuthHelpers, type: :request
end
