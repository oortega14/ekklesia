Rails.application.routes.draw do
  mount ActionCable.server => "/cable"

  namespace :api do
    namespace :v1 do
      # Auth
      get  'auth/me',      to: 'auth#me'
      post 'auth/refresh', to: 'refresh#create'

      # Resources
      resources :ministries
      resources :churches
      resources :users
      resources :services

      resources :service_requests, only: [:index, :show, :create] do
        member do
          patch :approve
          patch :reject
        end
      end

      resources :attendance_reports, only: [:index, :show, :create, :update]
      resources :contributions,      only: [:index, :show, :create, :update]

      get "attendance_submission", to: "attendance_submission#show"

      get "services_overview", to: "services_overview#show"

      get "stats",                         to: "stats#show"
      get "stats/attendance_timeline",     to: "stats#attendance_timeline"
      get "stats/contributions_breakdown", to: "stats#contributions_breakdown"

      get "reports/attendance",    to: "reports#attendance"
      get "reports/contributions", to: "reports#contributions"

      resources :notifications, only: [ :index, :destroy ] do
        member do
          patch :read
        end
        collection do
          post :read_all
        end
      end
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
