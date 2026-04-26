require "rails_helper"

RSpec.describe ApplicationCable::Connection, type: :channel do
  let(:account) { create(:account) }
  let!(:user)   { create(:user, :lead_pastor, account: account) }

  def encode(payload, secret = nil)
    secret ||= "#{Rails.application.secret_key_base}-#{account.jwt_secret}"
    JWT.encode(payload, secret, "HS256")
  end

  it "accepts a connection with a valid access token" do
    token = encode("account_id" => account.id, "exp" => 1.hour.from_now.to_i, "type" => "access")
    connect "/cable?token=#{token}"
    expect(connection.current_user).to eq(user)
  end

  it "rejects when the token is missing" do
    expect { connect "/cable" }.to have_rejected_connection
  end

  it "rejects when the token is malformed" do
    expect { connect "/cable?token=garbage" }.to have_rejected_connection
  end

  it "rejects when the token is expired" do
    token = encode("account_id" => account.id, "exp" => 1.hour.ago.to_i)
    expect { connect "/cable?token=#{token}" }.to have_rejected_connection
  end

  it "rejects refresh tokens" do
    token = encode("account_id" => account.id, "exp" => 1.hour.from_now.to_i, "type" => "refresh")
    expect { connect "/cable?token=#{token}" }.to have_rejected_connection
  end

  it "rejects when account does not exist" do
    other_secret = "#{Rails.application.secret_key_base}-something"
    token = encode({ "account_id" => 999_999, "exp" => 1.hour.from_now.to_i }, other_secret)
    expect { connect "/cable?token=#{token}" }.to have_rejected_connection
  end
end
