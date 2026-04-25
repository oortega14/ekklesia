module Api
  module V1
    class UsersController < ApplicationController
      def index
        authorize User
        scope = User.includes(:church, :ministry).where.not(role: :superadmin)
        scope = scope.where(ministry_id: current_user.ministry_id) unless current_user.superadmin?
        @users = scope.page(params[:page]).per(params[:per_page] || 20)
        render json: { users: @users.map { |u| user_payload(u) } }
      end

      def show
        @user = User.find(params[:id])
        authorize @user
        render json: { user: user_payload(@user) }
      end

      def create
        authorize User.new(role: params.dig(:user, :role))

        result = ActiveRecord::Base.transaction do
          account = Account.create!(
            email:         params[:user][:email],
            password_hash: BCrypt::Password.create(params[:user][:password]),
            jwt_secret:    SecureRandom.hex(32)
          )
          User.create!(
            account:    account,
            ministry:   current_user.superadmin? ? Ministry.find(params[:user][:ministry_id]) : current_user.ministry,
            church_id:  params[:user][:church_id],
            first_name: params[:user][:first_name],
            last_name:  params[:user][:last_name],
            phone:      params[:user][:phone],
            role:       params[:user][:role]
          )
        end

        render json: { user: user_payload(result) }, status: :created
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
      end

      def update
        @user = User.find(params[:id])
        authorize @user
        if @user.update(user_update_params)
          render json: { user: user_payload(@user) }
        else
          render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @user = User.find(params[:id])
        authorize @user
        @user.account.destroy
        render json: { message: 'User deleted' }
      end

      private

      def user_update_params
        params.require(:user).permit(:first_name, :last_name, :phone, :church_id)
      end

      def user_payload(user)
        {
          id:            user.id,
          email:         user.account&.email,
          first_name:    user.first_name,
          last_name:     user.last_name,
          full_name:     user.full_name,
          role:          user.role,
          ministry_id:   user.ministry_id,
          ministry_name: user.ministry&.name,
          church_id:     user.church_id,
          church_name:   user.church&.name
        }
      end
    end
  end
end
