class ApplicationController < ActionController::API
  include Pundit::Authorization

  before_action :authenticate!
  before_action :set_tenant

  rescue_from Pundit::NotAuthorizedError,    with: :render_forbidden
  rescue_from ActiveRecord::RecordNotFound,  with: :render_not_found

  private

  def authenticate!
    token = request.headers['Authorization']&.split(' ')&.last
    return render_unauthorized('Token missing') unless token

    begin
      unverified_payload = JWT.decode(token, nil, false)[0]
      account_id = extract_account_id(unverified_payload)
      raise JWT::DecodeError, 'Invalid token subject' unless account_id

      account = Account.find(account_id)

      secret = "#{Rails.application.secret_key_base}-#{account.jwt_secret}"
      verified, = JWT.decode(token, secret, true, algorithm: 'HS256')

      raise JWT::DecodeError, 'Invalid token type' if verified['type'] == 'refresh'

      @current_account = account
      @current_user    = User.find_by!(account: account)
    rescue JWT::DecodeError, JWT::ExpiredSignature, ActiveRecord::RecordNotFound => e
      render_unauthorized(e.message)
    end
  end

  def extract_account_id(payload)
    %w[sub account_id id].each do |key|
      value = payload[key] || payload[key.to_sym]
      parsed = Integer(value, exception: false)
      return parsed if parsed&.positive?
    end

    nil
  end

  def set_tenant
    if @current_user&.superadmin?
      ActsAsTenant.current_tenant = nil
    else
      ActsAsTenant.current_tenant = @current_user&.ministry
    end
  end

  def current_user
    @current_user
  end

  def render_unauthorized(message = 'Unauthorized')
    render json: { error: message }, status: :unauthorized
  end

  def render_forbidden
    render json: { error: 'Forbidden' }, status: :forbidden
  end

  def render_not_found
    render json: { error: 'Not found' }, status: :not_found
  end
end
