class RodauthApp < Rodauth::Rails::App
  configure RodauthMain

  route do |r|
    r.on('api') do
      r.on('v1') do
        r.on('auth') do
          r.rodauth
        end
      end
    end
  end
end
