module Api
  module V1
    class AuthController < ApplicationController
      def me
        render json: {
          user: {
            id:          current_user.id,
            email:       current_user.email,
            first_name:  current_user.first_name,
            last_name:   current_user.last_name,
            full_name:   current_user.full_name,
            role:        current_user.role,
            ministry_id: current_user.ministry_id,
            church_id:   current_user.church_id,
            phone:       current_user.phone,
            locale:      current_user.locale
          }
        }
      end
    end
  end
end
