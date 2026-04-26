module Api
  module V1
    class ChurchesController < ApplicationController
      def index
        authorize Church
        @churches = Church
                    .left_joins(:users)
                    .group("churches.id")
                    .select("churches.*, COUNT(users.id) AS users_count")
                    .page(params[:page]).per(params[:per_page] || 20)

        lead_pastors_by_ministry = User
                                   .where(role: :lead_pastor, ministry_id: @churches.map(&:ministry_id).uniq)
                                   .index_by(&:ministry_id)

        render json: {
          churches: @churches.map { |c| church_payload(c, lead_pastors_by_ministry[c.ministry_id]) }
        }
      end

      def show
        @church = Church.find(params[:id])
        authorize @church
        render json: { church: @church }
      end

      def create
        @church = Church.new(church_params)
        @church.ministry = current_user.ministry unless current_user.superadmin?
        authorize @church
        if @church.save
          Notifications::Dispatcher.call(:church_created, @church, actor: current_user)
          render json: { church: @church }, status: :created
        else
          render json: { errors: @church.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        @church = Church.find(params[:id])
        authorize @church
        if @church.update(church_params)
          render json: { church: @church }
        else
          render json: { errors: @church.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @church = Church.find(params[:id])
        authorize @church
        @church.destroy
        render json: { message: "Church deleted" }
      end

      private

      def church_params
        params.require(:church).permit(:name, :address, :city, :status, :ministry_id, :email, :phone)
      end

      def church_payload(church, lead_pastor)
        {
          id:               church.id,
          name:             church.name,
          address:          church.address,
          city:             church.city,
          email:            church.email,
          phone:            church.phone,
          status:           church.status,
          ministry_id:      church.ministry_id,
          lead_pastor_name: lead_pastor&.full_name,
          users_count:      church.users_count.to_i
        }
      end
    end
  end
end
